import mlflow
import mlflow.sklearn
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List
import os

class ModelEvaluator:
    """
    Evaluate and compare ML models from MLflow registry.
    """
    
    def __init__(self, mlflow_uri: str = "http://localhost:5000"):
        mlflow.set_tracking_uri(mlflow_uri)
        
    def get_latest_models(self, experiment_name: str = "predictive_maintenance") -> List[Dict]:
        """Get latest models from experiment."""
        experiment = mlflow.get_experiment_by_name(experiment_name)
        if not experiment:
            print(f"Experiment '{experiment_name}' not found")
            return []
        
        runs = mlflow.search_runs(experiment_ids=[experiment.experiment_id])
        
        models = []
        for _, run in runs.iterrows():
            models.append({
                'run_id': run['run_id'],
                'algorithm': run.get('params.algorithm', 'Unknown'),
                'f1_score': run.get('metrics.f1_score', 0),
                'precision': run.get('metrics.precision', 0),
                'recall': run.get('metrics.recall', 0),
                'start_time': run['start_time'],
            })
        
        return sorted(models, key=lambda x: x['start_time'], reverse=True)
    
    def compare_models(self):
        """Compare all models in the experiment."""
        models = self.get_latest_models()
        
        if not models:
            print("No models found")
            return
        
        print("\n" + "="*80)
        print("MODEL COMPARISON")
        print("="*80)
        
        df = pd.DataFrame(models)
        print(df[['algorithm', 'f1_score', 'precision', 'recall']].to_string(index=False))
        
        # Find best model
        best_model = max(models, key=lambda x: x.get('f1_score', 0))
        print(f"\n🏆 Best Model: {best_model['algorithm']} (F1={best_model['f1_score']:.3f})")
        
        return best_model
    
    def load_model(self, run_id: str):
        """Load model from MLflow."""
        model_uri = f"runs:/{run_id}/model"
        model = mlflow.sklearn.load_model(model_uri)
        
        scaler_uri = f"runs:/{run_id}/scaler"
        scaler = mlflow.sklearn.load_model(scaler_uri)
        
        return model, scaler
    
    def evaluate_model(self, run_id: str, X_test: pd.DataFrame, y_test: pd.Series):
        """Detailed evaluation of a specific model."""
        model, scaler = self.load_model(run_id)
        
        # Scale features
        X_test_scaled = scaler.transform(X_test)
        
        # Predict
        y_pred = model.predict(X_test_scaled)
        
        # Classification report
        print("\n" + "="*80)
        print("CLASSIFICATION REPORT")
        print("="*80)
        print(classification_report(y_test, y_pred))
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.savefig('confusion_matrix.png')
        print("📊 Confusion matrix saved to confusion_matrix.png")
        
        # ROC curve (if binary classification)
        if hasattr(model, 'predict_proba'):
            y_proba = model.predict_proba(X_test_scaled)[:, 1]
            auc = roc_auc_score(y_test, y_proba)
            
            fpr, tpr, _ = roc_curve(y_test, y_proba)
            
            plt.figure(figsize=(8, 6))
            plt.plot(fpr, tpr, label=f'AUC = {auc:.3f}')
            plt.plot([0, 1], [0, 1], 'k--')
            plt.xlabel('False Positive Rate')
            plt.ylabel('True Positive Rate')
            plt.title('ROC Curve')
            plt.legend()
            plt.savefig('roc_curve.png')
            print(f"📊 ROC curve saved to roc_curve.png (AUC={auc:.3f})")
    
    def register_best_model(self, model_name: str = "predictive_maintenance_model"):
        """Register best model to MLflow Model Registry."""
        best_model = self.compare_models()
        
        if not best_model:
            print("No models to register")
            return
        
        run_id = best_model['run_id']
        model_uri = f"runs:/{run_id}/model"
        
        # Register model
        result = mlflow.register_model(model_uri, model_name)
        
        print(f"\n✅ Model registered: {model_name} (version {result.version})")
        print(f"   Run ID: {run_id}")
        print(f"   Algorithm: {best_model['algorithm']}")
        print(f"   F1 Score: {best_model['f1_score']:.3f}")
        
        return result

if __name__ == '__main__':
    evaluator = ModelEvaluator()
    
    # Compare all models
    best_model = evaluator.compare_models()
    
    # Register best model
    if best_model:
        evaluator.register_best_model()
