# ML Pipeline - Advanced Analytics

Automated machine learning pipeline for continuous model training, evaluation, and deployment.

## Features

### 🤖 Automated Training
- **Scheduled Retraining**: Daily automated model updates
- **Hyperparameter Tuning**: Optuna-based optimization
- **Multiple Algorithms**: Isolation Forest + Random Forest
- **Feature Engineering**: 40+ engineered features

### 📊 Experiment Tracking
- **MLflow Integration**: Track all experiments
- **Model Registry**: Version control for models
- **Metrics Logging**: F1, Precision, Recall, AUC
- **Artifact Storage**: Models, scalers, plots

### 🔬 Model Evaluation
- **Performance Comparison**: Compare all models
- **Confusion Matrix**: Visual performance analysis
- **ROC Curves**: Binary classification metrics
- **Feature Importance**: Understand model decisions

## Quick Start

### 1. Install Dependencies
```bash
cd apps/ml-pipeline
poetry install
```

### 2. Start MLflow Server
```bash
docker compose -f docker-compose.dev.yml up -d mlflow
```

MLflow UI: http://localhost:5000

### 3. Run Training Pipeline
```bash
poetry run python src/training/pipeline.py
```

### 4. Evaluate Models
```bash
poetry run python src/evaluation/evaluator.py
```

### 5. Start Scheduler (Optional)
```bash
poetry run python scheduler.py
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA INGESTION                            │
│  TimescaleDB → Feature Engineering → Training Dataset       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                  TRAINING PIPELINE                           │
│  Optuna Hyperparameter Tuning → Model Training → Evaluation │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   MLFLOW TRACKING                            │
│  Experiment Logging → Model Registry → Artifact Storage     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                  MODEL DEPLOYMENT                            │
│  Best Model Selection → API Integration → Production Serving│
└─────────────────────────────────────────────────────────────┘
```

## Features Engineered

### Raw Metrics
- Temperature
- Vibration
- Spindle Speed
- Power Consumption

### Rolling Statistics (5-minute window)
- Mean, Std, Max, Min for each metric

### Rolling Statistics (30-minute window)
- Mean, Std for each metric

### Derivatives
- Rate of change (diff)
- Percentage change

### Interaction Features
- Temperature × Vibration
- Power / Spindle Speed (efficiency)

**Total: 40+ features**

## Models

### 1. Isolation Forest (Unsupervised)
- **Purpose**: Anomaly detection
- **Algorithm**: Isolation Forest
- **Contamination**: 10% (configurable)
- **Use Case**: Detect unusual patterns without labels

### 2. Random Forest (Supervised)
- **Purpose**: Failure prediction
- **Algorithm**: Random Forest Classifier
- **Hyperparameters**: Tuned with Optuna (20 trials)
- **Use Case**: Predict specific failure modes

## Hyperparameter Tuning

Using **Optuna** for automated hyperparameter optimization:

```python
{
    'n_estimators': [50, 300],
    'max_depth': [3, 20],
    'min_samples_split': [2, 20],
    'min_samples_leaf': [1, 10],
    'max_features': ['sqrt', 'log2']
}
```

**Objective**: Maximize F1 Score

## Evaluation Metrics

### Classification Metrics
- **Precision**: % of predicted failures that are actual failures
- **Recall**: % of actual failures that are detected
- **F1 Score**: Harmonic mean of precision and recall
- **AUC-ROC**: Area under ROC curve

### Visualizations
- Confusion Matrix
- ROC Curve
- Feature Importance

## Scheduler

Automated retraining schedule:

```python
# Daily at 2 AM
schedule.every().day.at("02:00").do(run_training_job)

# Or hourly (for testing)
schedule.every(1).hours.do(run_training_job)
```

## MLflow UI

Access the MLflow dashboard at **http://localhost:5000**

### Features
- **Experiments**: View all training runs
- **Metrics**: Compare F1, Precision, Recall
- **Parameters**: See hyperparameters used
- **Artifacts**: Download models and plots
- **Model Registry**: Manage model versions

## Integration with AI Service

The trained models are automatically registered in MLflow and can be loaded by the AI service:

```python
import mlflow

# Load latest production model
model_uri = "models:/predictive_maintenance_model/Production"
model = mlflow.sklearn.load_model(model_uri)
```

## Production Deployment

### 1. Train Model
```bash
poetry run python src/training/pipeline.py
```

### 2. Evaluate & Register
```bash
poetry run python src/evaluation/evaluator.py
```

### 3. Promote to Production
```python
from mlflow.tracking import MlflowClient

client = MlflowClient()
client.transition_model_version_stage(
    name="predictive_maintenance_model",
    version=1,
    stage="Production"
)
```

### 4. Update AI Service
The AI service automatically uses the latest production model.

## Environment Variables

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=pocket_ops_telemetry
MLFLOW_TRACKING_URI=http://localhost:5000
```

## Monitoring

### Training Metrics
- Number of samples
- Number of features
- Training time
- Model performance

### Model Performance
- F1 Score trend over time
- Precision/Recall trade-off
- Feature importance changes

## Best Practices

1. **Data Quality**: Ensure sufficient training data (1000+ samples)
2. **Feature Engineering**: Add domain-specific features
3. **Hyperparameter Tuning**: Run more Optuna trials for better results
4. **Model Validation**: Always evaluate on held-out test set
5. **Version Control**: Track all experiments in MLflow
6. **Production Monitoring**: Monitor model performance in production

## Troubleshooting

### Insufficient Data
```
❌ Insufficient data for training (need at least 1000 samples)
```
**Solution**: Run the simulator longer to collect more data.

### MLflow Connection Error
```
❌ Cannot connect to MLflow server
```
**Solution**: Ensure MLflow is running: `docker compose -f docker-compose.dev.yml up -d mlflow`

### Training Fails
```
❌ Training job failed
```
**Solution**: Check logs for specific error. Common issues:
- Database connection
- Insufficient memory
- Missing dependencies

## Future Enhancements

- [ ] Deep Learning models (LSTM for time-series)
- [ ] AutoML integration
- [ ] A/B testing framework
- [ ] Model drift detection
- [ ] Explainable AI (SHAP values)
- [ ] Real-time feature store

---

**Built with**: MLflow, Optuna, scikit-learn, pandas, numpy
