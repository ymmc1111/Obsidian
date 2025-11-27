import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json

class PredictiveMaintenanceEngine:
    """
    Anomaly detection and predictive maintenance using Isolation Forest.
    Detects unusual machine behavior that may indicate impending failure.
    """
    
    def __init__(self, db_config: Dict[str, str]):
        self.db_config = db_config
        self.models: Dict[str, IsolationForest] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        
    def get_connection(self):
        return psycopg2.connect(**self.db_config)
    
    def fetch_telemetry(self, machine_id: str, hours: int = 24) -> pd.DataFrame:
        """Fetch recent telemetry data for a machine."""
        conn = self.get_connection()
        try:
            query = """
                SELECT 
                    time,
                    metric_name,
                    value
                FROM machine_telemetry
                WHERE machine_id = %s
                  AND time > NOW() - INTERVAL '%s hours'
                ORDER BY time ASC
            """
            df = pd.read_sql_query(query, conn, params=(machine_id, hours))
            
            # Pivot to get metrics as columns
            if not df.empty:
                df_pivot = df.pivot(index='time', columns='metric_name', values='value')
                df_pivot = df_pivot.fillna(method='ffill').fillna(0)
                return df_pivot
            return pd.DataFrame()
        finally:
            conn.close()
    
    def train_model(self, machine_id: str, contamination: float = 0.1):
        """Train anomaly detection model for a specific machine."""
        df = self.fetch_telemetry(machine_id, hours=168)  # 1 week of data
        
        if df.empty or len(df) < 100:
            print(f"Insufficient data for {machine_id}")
            return False
        
        # Feature engineering
        features = self._engineer_features(df)
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(features)
        
        # Train Isolation Forest
        model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )
        model.fit(X_scaled)
        
        # Store model and scaler
        self.models[machine_id] = model
        self.scalers[machine_id] = scaler
        
        print(f"Model trained for {machine_id}")
        return True
    
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create features from raw telemetry."""
        features = df.copy()
        
        # Rolling statistics (5-minute window)
        for col in df.columns:
            features[f'{col}_mean_5m'] = df[col].rolling(window=5, min_periods=1).mean()
            features[f'{col}_std_5m'] = df[col].rolling(window=5, min_periods=1).std().fillna(0)
            features[f'{col}_max_5m'] = df[col].rolling(window=5, min_periods=1).max()
        
        # Rate of change
        for col in df.columns:
            features[f'{col}_diff'] = df[col].diff().fillna(0)
        
        return features.fillna(0)
    
    def predict_anomaly(self, machine_id: str) -> Optional[Dict]:
        """Detect if current machine state is anomalous."""
        if machine_id not in self.models:
            print(f"No model for {machine_id}, training...")
            if not self.train_model(machine_id):
                return None
        
        # Get recent data (last 30 minutes)
        df = self.fetch_telemetry(machine_id, hours=0.5)
        
        if df.empty:
            return None
        
        # Engineer features
        features = self._engineer_features(df)
        
        # Get latest reading
        latest = features.iloc[-1:].values
        
        # Scale
        latest_scaled = self.scalers[machine_id].transform(latest)
        
        # Predict
        prediction = self.models[machine_id].predict(latest_scaled)[0]
        anomaly_score = self.models[machine_id].score_samples(latest_scaled)[0]
        
        is_anomaly = prediction == -1
        
        # Calculate risk level
        risk_level = self._calculate_risk(df, is_anomaly, anomaly_score)
        
        return {
            'machine_id': machine_id,
            'timestamp': datetime.now().isoformat(),
            'is_anomaly': bool(is_anomaly),
            'anomaly_score': float(anomaly_score),
            'risk_level': risk_level,
            'current_metrics': df.iloc[-1].to_dict() if not df.empty else {},
            'recommendation': self._get_recommendation(risk_level)
        }
    
    def _calculate_risk(self, df: pd.DataFrame, is_anomaly: bool, score: float) -> str:
        """Calculate risk level based on anomaly detection and thresholds."""
        if df.empty:
            return 'UNKNOWN'
        
        latest = df.iloc[-1]
        
        # Check critical thresholds
        critical_temp = latest.get('temperature', 0) > 210
        critical_vibration = latest.get('vibration', 0) > 2.5
        
        if critical_temp or critical_vibration:
            return 'CRITICAL'
        
        if is_anomaly and score < -0.5:
            return 'HIGH'
        
        if is_anomaly:
            return 'MEDIUM'
        
        return 'LOW'
    
    def _get_recommendation(self, risk_level: str) -> str:
        """Get maintenance recommendation based on risk."""
        recommendations = {
            'CRITICAL': 'IMMEDIATE SHUTDOWN REQUIRED - Schedule emergency maintenance',
            'HIGH': 'URGENT - Schedule maintenance within 24 hours',
            'MEDIUM': 'CAUTION - Monitor closely, schedule inspection within 1 week',
            'LOW': 'NOMINAL - Continue normal operation',
            'UNKNOWN': 'Insufficient data for prediction'
        }
        return recommendations.get(risk_level, 'No recommendation')
    
    def analyze_all_machines(self) -> List[Dict]:
        """Analyze all machines in the system."""
        conn = self.get_connection()
        try:
            # Get unique machine IDs
            cursor = conn.cursor()
            cursor.execute("SELECT DISTINCT machine_id FROM machine_telemetry")
            machine_ids = [row[0] for row in cursor.fetchall()]
            
            results = []
            for machine_id in machine_ids:
                result = self.predict_anomaly(machine_id)
                if result:
                    results.append(result)
            
            return results
        finally:
            conn.close()


if __name__ == '__main__':
    # Example usage
    db_config = {
        'host': 'localhost',
        'port': 5433,
        'user': 'admin',
        'password': 'password',
        'database': 'pocket_ops_telemetry'
    }
    
    engine = PredictiveMaintenanceEngine(db_config)
    
    # Analyze all machines
    results = engine.analyze_all_machines()
    
    print("\n=== PREDICTIVE MAINTENANCE REPORT ===\n")
    for result in results:
        print(f"Machine: {result['machine_id']}")
        print(f"Risk Level: {result['risk_level']}")
        print(f"Anomaly Detected: {result['is_anomaly']}")
        print(f"Recommendation: {result['recommendation']}")
        print("-" * 50)
