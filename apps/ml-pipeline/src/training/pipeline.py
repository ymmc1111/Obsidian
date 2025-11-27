import mlflow
import mlflow.sklearn
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score
import psycopg2
from datetime import datetime, timedelta
import optuna
from typing import Dict, Tuple
import joblib
import os

class MLPipeline:
    """
    Automated ML training pipeline with MLflow tracking.
    Supports hyperparameter tuning with Optuna.
    """
    
    def __init__(self, db_config: Dict[str, str], mlflow_uri: str = "http://localhost:5000"):
        self.db_config = db_config
        mlflow.set_tracking_uri(mlflow_uri)
        mlflow.set_experiment("predictive_maintenance")
        
    def get_connection(self):
        return psycopg2.connect(**self.db_config)
    
    def fetch_training_data(self, days: int = 30) -> pd.DataFrame:
        """Fetch historical telemetry data for training."""
        conn = self.get_connection()
        try:
            query = """
                SELECT 
                    time,
                    machine_id,
                    metric_name,
                    value
                FROM machine_telemetry
                WHERE time > NOW() - INTERVAL '%s days'
                ORDER BY time ASC
            """
            df = pd.read_sql_query(query, conn, params=(days,))
            
            if not df.empty:
                # Pivot to get metrics as columns
                df_pivot = df.pivot_table(
                    index=['time', 'machine_id'], 
                    columns='metric_name', 
                    values='value'
                ).reset_index()
                df_pivot = df_pivot.fillna(method='ffill').fillna(0)
                return df_pivot
            return pd.DataFrame()
        finally:
            conn.close()
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create advanced features from raw telemetry."""
        features = df.copy()
        
        # Group by machine
        for machine_id in df['machine_id'].unique():
            mask = df['machine_id'] == machine_id
            machine_df = df[mask].copy()
            
            # Rolling statistics
            for col in ['temperature', 'vibration', 'spindle_speed', 'power_consumption']:
                if col in machine_df.columns:
                    # 5-minute rolling
                    features.loc[mask, f'{col}_mean_5m'] = machine_df[col].rolling(window=5, min_periods=1).mean()
                    features.loc[mask, f'{col}_std_5m'] = machine_df[col].rolling(window=5, min_periods=1).std().fillna(0)
                    features.loc[mask, f'{col}_max_5m'] = machine_df[col].rolling(window=5, min_periods=1).max()
                    features.loc[mask, f'{col}_min_5m'] = machine_df[col].rolling(window=5, min_periods=1).min()
                    
                    # 30-minute rolling
                    features.loc[mask, f'{col}_mean_30m'] = machine_df[col].rolling(window=30, min_periods=1).mean()
                    features.loc[mask, f'{col}_std_30m'] = machine_df[col].rolling(window=30, min_periods=1).std().fillna(0)
                    
                    # Rate of change
                    features.loc[mask, f'{col}_diff'] = machine_df[col].diff().fillna(0)
                    features.loc[mask, f'{col}_pct_change'] = machine_df[col].pct_change().fillna(0)
        
        # Interaction features
        if 'temperature' in features.columns and 'vibration' in features.columns:
            features['temp_vibration_interaction'] = features['temperature'] * features['vibration']
        
        if 'spindle_speed' in features.columns and 'power_consumption' in features.columns:
            features['efficiency'] = features['power_consumption'] / (features['spindle_speed'] + 1)
        
        return features.fillna(0)
    
    def create_labels(self, df: pd.DataFrame) -> pd.Series:
        """Create failure labels based on thresholds."""
        # Define failure conditions
        failures = (
            (df.get('temperature', 0) > 210) |
            (df.get('vibration', 0) > 2.5) |
            (df.get('power_consumption', 0) > 25)
        )
        return failures.astype(int)
    
    def train_isolation_forest(self, X: pd.DataFrame, contamination: float = 0.1) -> Tuple[IsolationForest, StandardScaler]:
        """Train Isolation Forest model."""
        with mlflow.start_run(run_name="isolation_forest"):
            # Log parameters
            mlflow.log_param("algorithm", "IsolationForest")
            mlflow.log_param("contamination", contamination)
            mlflow.log_param("n_estimators", 100)
            mlflow.log_param("n_features", X.shape[1])
            
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Train model
            model = IsolationForest(
                contamination=contamination,
                random_state=42,
                n_estimators=100,
                max_samples='auto',
                n_jobs=-1
            )
            model.fit(X_scaled)
            
            # Evaluate
            predictions = model.predict(X_scaled)
            anomaly_scores = model.score_samples(X_scaled)
            
            # Log metrics
            n_anomalies = (predictions == -1).sum()
            mlflow.log_metric("n_anomalies", n_anomalies)
            mlflow.log_metric("anomaly_rate", n_anomalies / len(predictions))
            mlflow.log_metric("mean_anomaly_score", anomaly_scores.mean())
            
            # Log model
            mlflow.sklearn.log_model(model, "model")
            mlflow.sklearn.log_model(scaler, "scaler")
            
            print(f"✅ Isolation Forest trained: {n_anomalies} anomalies detected")
            
            return model, scaler
    
    def train_random_forest(self, X: pd.DataFrame, y: pd.Series) -> Tuple[RandomForestClassifier, StandardScaler]:
        """Train Random Forest classifier with Optuna hyperparameter tuning."""
        
        def objective(trial):
            params = {
                'n_estimators': trial.suggest_int('n_estimators', 50, 300),
                'max_depth': trial.suggest_int('max_depth', 3, 20),
                'min_samples_split': trial.suggest_int('min_samples_split', 2, 20),
                'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 10),
                'max_features': trial.suggest_categorical('max_features', ['sqrt', 'log2']),
            }
            
            # Split data
            X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Scale
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_val_scaled = scaler.transform(X_val)
            
            # Train
            model = RandomForestClassifier(**params, random_state=42, n_jobs=-1)
            model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = model.predict(X_val_scaled)
            f1 = f1_score(y_val, y_pred)
            
            return f1
        
        # Hyperparameter tuning
        study = optuna.create_study(direction='maximize')
        study.optimize(objective, n_trials=20, show_progress_bar=True)
        
        best_params = study.best_params
        
        with mlflow.start_run(run_name="random_forest"):
            # Log best parameters
            mlflow.log_params(best_params)
            mlflow.log_param("algorithm", "RandomForest")
            
            # Train final model with best params
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            model = RandomForestClassifier(**best_params, random_state=42, n_jobs=-1)
            model.fit(X_scaled, y)
            
            # Evaluate
            y_pred = model.predict(X_scaled)
            precision = precision_score(y, y_pred)
            recall = recall_score(y, y_pred)
            f1 = f1_score(y, y_pred)
            
            # Log metrics
            mlflow.log_metric("precision", precision)
            mlflow.log_metric("recall", recall)
            mlflow.log_metric("f1_score", f1)
            
            # Feature importance
            feature_importance = pd.DataFrame({
                'feature': X.columns,
                'importance': model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            mlflow.log_text(feature_importance.to_string(), "feature_importance.txt")
            
            # Log model
            mlflow.sklearn.log_model(model, "model")
            mlflow.sklearn.log_model(scaler, "scaler")
            
            print(f"✅ Random Forest trained: F1={f1:.3f}, Precision={precision:.3f}, Recall={recall:.3f}")
            
            return model, scaler
    
    def run_pipeline(self):
        """Execute full training pipeline."""
        print("🚀 Starting ML Pipeline...")
        
        # 1. Fetch data
        print("📊 Fetching training data...")
        df = self.fetch_training_data(days=30)
        
        if df.empty or len(df) < 1000:
            print("❌ Insufficient data for training (need at least 1000 samples)")
            return
        
        print(f"✅ Loaded {len(df)} samples")
        
        # 2. Engineer features
        print("🔧 Engineering features...")
        features_df = self.engineer_features(df)
        
        # Drop non-feature columns
        X = features_df.drop(['time', 'machine_id'], axis=1, errors='ignore')
        
        print(f"✅ Created {X.shape[1]} features")
        
        # 3. Create labels
        y = self.create_labels(features_df)
        print(f"✅ Created labels: {y.sum()} failures ({y.sum()/len(y)*100:.1f}%)")
        
        # 4. Train Isolation Forest (unsupervised)
        print("\n🤖 Training Isolation Forest...")
        iso_model, iso_scaler = self.train_isolation_forest(X)
        
        # 5. Train Random Forest (supervised)
        if y.sum() > 10:  # Need at least 10 failure samples
            print("\n🤖 Training Random Forest...")
            rf_model, rf_scaler = self.train_random_forest(X, y)
        else:
            print("⚠️  Insufficient failure samples for supervised learning")
        
        print("\n✅ Pipeline complete!")
        print(f"📊 View results: http://localhost:5000")

if __name__ == '__main__':
    db_config = {
        'host': os.getenv('POSTGRES_HOST', 'localhost'),
        'port': int(os.getenv('POSTGRES_PORT', '5433')),
        'user': os.getenv('POSTGRES_USER', 'admin'),
        'password': os.getenv('POSTGRES_PASSWORD', 'password'),
        'database': os.getenv('POSTGRES_DB', 'pocket_ops_telemetry')
    }
    
    pipeline = MLPipeline(db_config)
    pipeline.run_pipeline()
