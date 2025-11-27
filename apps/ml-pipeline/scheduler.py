#!/usr/bin/env python3
"""
Automated training scheduler.
Runs ML pipeline on a schedule (e.g., daily, weekly).
"""

import schedule
import time
from training.pipeline import MLPipeline
from evaluation.evaluator import ModelEvaluator
import os
from datetime import datetime

def run_training_job():
    """Execute training pipeline."""
    print(f"\n{'='*80}")
    print(f"SCHEDULED TRAINING JOB - {datetime.now().isoformat()}")
    print(f"{'='*80}\n")
    
    db_config = {
        'host': os.getenv('POSTGRES_HOST', 'localhost'),
        'port': int(os.getenv('POSTGRES_PORT', '5433')),
        'user': os.getenv('POSTGRES_USER', 'admin'),
        'password': os.getenv('POSTGRES_PASSWORD', 'password'),
        'database': os.getenv('POSTGRES_DB', 'pocket_ops_telemetry')
    }
    
    try:
        # Run training pipeline
        pipeline = MLPipeline(db_config)
        pipeline.run_pipeline()
        
        # Evaluate and register best model
        evaluator = ModelEvaluator()
        evaluator.register_best_model()
        
        print(f"\n✅ Training job completed successfully")
        
    except Exception as e:
        print(f"\n❌ Training job failed: {e}")

def main():
    """Main scheduler loop."""
    print("🤖 ML Pipeline Scheduler Started")
    print("="*80)
    
    # Schedule daily training at 2 AM
    schedule.every().day.at("02:00").do(run_training_job)
    
    # For testing: run every 1 hour
    # schedule.every(1).hours.do(run_training_job)
    
    # Run immediately on start
    print("Running initial training...")
    run_training_job()
    
    print(f"\n📅 Next scheduled run: {schedule.next_run()}")
    print("Press Ctrl+C to stop\n")
    
    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Scheduler stopped")
