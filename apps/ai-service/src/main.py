from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from engine import PredictiveMaintenanceEngine
import os

app = FastAPI(title="Operation Obsidian AI Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engine
db_config = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', '5433')),
    'user': os.getenv('POSTGRES_USER', 'admin'),
    'password': os.getenv('POSTGRES_PASSWORD', 'password'),
    'database': os.getenv('POSTGRES_DB', 'pocket_ops_telemetry')
}

engine = PredictiveMaintenanceEngine(db_config)

class PredictionResponse(BaseModel):
    machine_id: str
    timestamp: str
    is_anomaly: bool
    anomaly_score: float
    risk_level: str
    current_metrics: dict
    recommendation: str

@app.get("/")
def root():
    return {"service": "Operation Obsidian AI", "status": "operational"}

@app.post("/train/{machine_id}")
def train_model(machine_id: str, background_tasks: BackgroundTasks):
    """Train anomaly detection model for a specific machine."""
    background_tasks.add_task(engine.train_model, machine_id)
    return {"message": f"Training initiated for {machine_id}"}

@app.get("/predict/{machine_id}", response_model=Optional[PredictionResponse])
def predict(machine_id: str):
    """Get predictive maintenance analysis for a machine."""
    result = engine.predict_anomaly(machine_id)
    return result

@app.get("/analyze", response_model=List[PredictionResponse])
def analyze_all():
    """Analyze all machines in the system."""
    results = engine.analyze_all_machines()
    return results

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
