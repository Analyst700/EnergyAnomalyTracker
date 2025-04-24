import logging
import pandas as pd
import numpy as np
from ml_models import get_model
from data_processor import DataProcessor

class AnomalyDetectionService:
    """Service for running anomaly detection on energy consumption data"""
    
    def __init__(self):
        """Initialize the anomaly detection service"""
        self.data_processor = DataProcessor()
        
    def run_detection(self, dataset, model_name, contamination=0.05):
        """Run anomaly detection on the given dataset using the specified model"""
        try:
            # Load the dataset
            data = self.data_processor.load_data(
                dataset.file_path,
                dataset.time_column,
                dataset.value_column
            )
            
            # Preprocess data for ML
            values = self.data_processor.preprocess_for_ml(data, dataset.value_column)
            
            # Get the appropriate model
            model = get_model(model_name, contamination)
            
            # Run anomaly detection
            anomalies, scores = model.detect(values)
            
            # Save results
            results_path = self.data_processor.save_results(
                dataset.id,
                model_name,
                data,
                anomalies,
                scores
            )
            
            # Analyze results
            insights = self.data_processor.analyze_results(
                data,
                anomalies,
                dataset.time_column,
                dataset.value_column
            )
            
            # Generate recommendations
            recommendations = self.data_processor.generate_recommendations(
                insights,
                anomalies,
                data,
                dataset.time_column,
                dataset.value_column
            )
            
            # Get model metrics
            metrics = model.get_metrics()
            
            return {
                'anomalies': anomalies,
                'scores': scores,
                'data': data,
                'results_path': results_path,
                'insights': insights,
                'recommendations': recommendations,
                'metrics': metrics
            }
        except Exception as e:
            logging.error(f"Error in anomaly detection: {e}")
            raise
