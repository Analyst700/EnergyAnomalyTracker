import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, MinMaxScaler
# Temporarily commenting out TensorFlow imports until we can resolve compatibility issues
# from tensorflow.keras.models import Sequential, Model
# from tensorflow.keras.layers import Dense, Input
# from tensorflow.keras.optimizers import Adam
import logging

class AnomalyDetector:
    """Base class for anomaly detection models"""
    
    def __init__(self, contamination=0.05):
        self.contamination = contamination
        self.model = None
        self.scaler = StandardScaler()
        
    def preprocess(self, data):
        """Preprocess the data for model input"""
        if isinstance(data, pd.DataFrame):
            # Convert DataFrame to numpy array if needed
            data = data.values
        # Scale the data
        return self.scaler.fit_transform(data.reshape(-1, 1) if data.ndim == 1 else data)
    
    def detect(self, data):
        """Detect anomalies in the data"""
        raise NotImplementedError("Subclasses must implement this method")
    
    def get_metrics(self):
        """Return model performance metrics"""
        # This would typically require ground truth labels
        # For unsupervised models, we return placeholder values
        return {
            'accuracy': 0.0,
            'precision': 0.0,
            'recall': 0.0,
            'f1_score': 0.0
        }

class IsolationForestDetector(AnomalyDetector):
    """Anomaly detection using Isolation Forest algorithm"""
    
    def __init__(self, contamination=0.05, n_estimators=100, random_state=42):
        super().__init__(contamination)
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            random_state=random_state
        )
        
    def detect(self, data):
        """Detect anomalies using Isolation Forest"""
        try:
            processed_data = self.preprocess(data)
            # Fit the model and predict
            self.model.fit(processed_data)
            # -1 for anomalies and 1 for normal
            predictions = self.model.predict(processed_data)
            # Convert to boolean array where True is an anomaly
            anomalies = predictions == -1
            
            # Calculate anomaly scores (negative of decision function)
            scores = -self.model.decision_function(processed_data)
            
            return anomalies, scores
        except Exception as e:
            logging.error(f"Error in Isolation Forest detection: {e}")
            raise

class KMeansDetector(AnomalyDetector):
    """Anomaly detection using K-Means clustering"""
    
    def __init__(self, contamination=0.05, n_clusters=2, random_state=42):
        super().__init__(contamination)
        self.n_clusters = n_clusters
        self.model = KMeans(n_clusters=n_clusters, random_state=random_state)
        
    def detect(self, data):
        """Detect anomalies by finding points far from cluster centers"""
        try:
            processed_data = self.preprocess(data)
            
            # Fit the model
            self.model.fit(processed_data)
            
            # Get cluster centers and labels
            centers = self.model.cluster_centers_
            labels = self.model.labels_
            
            # Calculate distance of each point to its cluster center
            distances = np.zeros(processed_data.shape[0])
            for i in range(processed_data.shape[0]):
                cluster_idx = labels[i]
                distances[i] = np.linalg.norm(processed_data[i] - centers[cluster_idx])
            
            # Points with highest distances are anomalies
            threshold = np.percentile(distances, 100 * (1 - self.contamination))
            anomalies = distances > threshold
            
            return anomalies, distances
        except Exception as e:
            logging.error(f"Error in K-Means detection: {e}")
            raise

class SimpleAutoencoder(AnomalyDetector):
    """Simplified autoencoder using sklearn-based approach instead of TensorFlow"""
    
    def __init__(self, contamination=0.05):
        super().__init__(contamination)
        self.scaler = MinMaxScaler()
        
    def detect(self, data):
        """Detect anomalies using a simplified approach (distance-based)"""
        try:
            processed_data = self.preprocess(data)
            
            # In the absence of a true autoencoder, we'll use a simple
            # distance-based approach similar to KMeans
            # Calculate average/median point
            mean_point = np.mean(processed_data, axis=0)
            
            # Calculate distances from mean
            if processed_data.ndim == 1:
                processed_data = processed_data.reshape(-1, 1)
                
            distances = np.zeros(processed_data.shape[0])
            for i in range(processed_data.shape[0]):
                distances[i] = np.linalg.norm(processed_data[i] - mean_point)
            
            # Points with highest distances are anomalies
            threshold = np.percentile(distances, 100 * (1 - self.contamination))
            anomalies = distances > threshold
            
            return anomalies, distances
        except Exception as e:
            logging.error(f"Error in SimpleAutoencoder detection: {e}")
            raise

def get_model(model_name, contamination=0.05):
    """Factory method to get the appropriate model"""
    models = {
        'isolation_forest': IsolationForestDetector(contamination),
        'kmeans': KMeansDetector(contamination),
        'autoencoder': SimpleAutoencoder(contamination)  # Using simplified version
    }
    
    if model_name not in models:
        raise ValueError(f"Model {model_name} not found. Available models: {list(models.keys())}")
    
    return models[model_name]
