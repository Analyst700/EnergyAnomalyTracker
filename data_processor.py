import pandas as pd
import numpy as np
import os
import logging
from datetime import datetime

class DataProcessor:
    """Class for processing and preparing energy consumption data"""
    
    def __init__(self, upload_folder='uploads'):
        """Initialize the data processor"""
        self.upload_folder = upload_folder
        self.results_folder = 'results'
        # Create directories if they don't exist
        os.makedirs(upload_folder, exist_ok=True)
        os.makedirs(self.results_folder, exist_ok=True)
        # Set up specific permissions for these directories
        try:
            os.chmod(upload_folder, 0o755)
            os.chmod(self.results_folder, 0o755)
        except Exception as e:
            logging.warning(f"Could not set directory permissions: {e}")
        
    def save_upload(self, file, filename):
        """Save uploaded file to disk"""
        try:
            file_path = os.path.join(self.upload_folder, filename)
            file.save(file_path)
            return file_path
        except Exception as e:
            logging.error(f"Error saving file: {e}")
            raise
    
    def load_data(self, file_path, time_column, value_column):
        """Load data from CSV file and extract relevant columns"""
        try:
            # Read the CSV file
            df = pd.read_csv(file_path)
            
            # Check if required columns exist
            if time_column not in df.columns:
                raise ValueError(f"Time column '{time_column}' not found in dataset")
            if value_column not in df.columns:
                raise ValueError(f"Value column '{value_column}' not found in dataset")
            
            # Extract relevant columns
            data = df[[time_column, value_column]].copy()
            
            # Convert time column to datetime if it's not already
            if not pd.api.types.is_datetime64_any_dtype(data[time_column]):
                data[time_column] = pd.to_datetime(data[time_column], errors='coerce')
            
            # Remove rows with NaN values
            data = data.dropna()
            
            # Sort by time
            data = data.sort_values(by=time_column)
            
            return data
        except Exception as e:
            logging.error(f"Error loading data: {e}")
            raise
    
    def preprocess_for_ml(self, data, value_column):
        """Preprocess data for machine learning"""
        try:
            # Extract the energy consumption values
            values = data[value_column].values
            
            # Check for missing or invalid values
            if np.isnan(values).any():
                raise ValueError("Dataset contains NaN values")
            
            return values
        except Exception as e:
            logging.error(f"Error preprocessing data: {e}")
            raise
    
    def save_results(self, dataset_id, model_name, data, anomalies, scores):
        """Save detection results to disk"""
        try:
            # Create results directory if it doesn't exist
            results_dir = os.path.join('results', str(dataset_id))
            os.makedirs(results_dir, exist_ok=True)
            
            # Create timestamp for filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            results_file = os.path.join(results_dir, f"{model_name}_{timestamp}.csv")
            
            # Create DataFrame with results
            results_df = data.copy()
            results_df['anomaly'] = anomalies
            results_df['score'] = scores
            
            # Save to CSV
            results_df.to_csv(results_file, index=False)
            
            return results_file
        except Exception as e:
            logging.error(f"Error saving results: {e}")
            raise
    
    def analyze_results(self, data, anomalies, time_column, value_column):
        """Analyze results to generate insights"""
        try:
            # Copy data to avoid modifying the original
            df = data.copy()
            df['anomaly'] = anomalies
            
            # Calculate basic statistics
            anomaly_count = np.sum(anomalies)
            anomaly_percentage = (anomaly_count / len(df)) * 100
            
            # Get anomaly timestamps and values
            anomaly_data = df[df['anomaly']]
            normal_data = df[~df['anomaly']]
            
            # Calculate statistics for normal vs anomalous data
            normal_mean = normal_data[value_column].mean()
            normal_std = normal_data[value_column].std()
            anomaly_mean = anomaly_data[value_column].mean() if not anomaly_data.empty else 0
            
            # Calculate deviation from normal
            deviation_percentage = ((anomaly_mean - normal_mean) / normal_mean * 100) if normal_mean != 0 else 0
            
            # Return insights
            insights = {
                'anomaly_count': int(anomaly_count),
                'anomaly_percentage': float(anomaly_percentage),
                'normal_mean': float(normal_mean),
                'anomaly_mean': float(anomaly_mean),
                'deviation_percentage': float(deviation_percentage),
                'normal_std': float(normal_std)
            }
            
            return insights
        except Exception as e:
            logging.error(f"Error analyzing results: {e}")
            raise
    
    def generate_recommendations(self, insights, anomalies, data, time_column, value_column):
        """Generate recommendations based on anomaly detection results"""
        try:
            recommendations = []
            
            # Basic recommendation based on anomaly count
            if insights['anomaly_count'] == 0:
                recommendations.append({
                    'text': "No anomalies detected. Your energy consumption patterns appear normal.",
                    'priority': 1
                })
            else:
                # Add recommendation based on deviation
                if insights['deviation_percentage'] > 20:
                    recommendations.append({
                        'text': f"Significant energy consumption anomalies detected. Consumption during anomalous periods is {abs(insights['deviation_percentage']):.1f}% {'higher' if insights['deviation_percentage'] > 0 else 'lower'} than normal.",
                        'priority': 5
                    })
                elif insights['deviation_percentage'] > 10:
                    recommendations.append({
                        'text': f"Moderate energy consumption anomalies detected. Consumption during anomalous periods is {abs(insights['deviation_percentage']):.1f}% {'higher' if insights['deviation_percentage'] > 0 else 'lower'} than normal.",
                        'priority': 4
                    })
                else:
                    recommendations.append({
                        'text': f"Minor energy consumption anomalies detected. Consumption during anomalous periods is {abs(insights['deviation_percentage']):.1f}% {'higher' if insights['deviation_percentage'] > 0 else 'lower'} than normal.",
                        'priority': 3
                    })
                
                # Check for patterns in anomalies
                df = data.copy()
                df['anomaly'] = anomalies
                anomaly_data = df[df['anomaly']]
                
                if not anomaly_data.empty:
                    # Check for time-based patterns (assuming time_column is datetime)
                    if pd.api.types.is_datetime64_any_dtype(anomaly_data[time_column]):
                        # Check for patterns by hour of day
                        hour_counts = anomaly_data[time_column].dt.hour.value_counts()
                        most_common_hour = hour_counts.idxmax() if not hour_counts.empty else None
                        hour_percentage = (hour_counts.max() / insights['anomaly_count'] * 100) if not hour_counts.empty and insights['anomaly_count'] > 0 else 0
                        
                        if hour_percentage > 30:
                            recommendations.append({
                                'text': f"Consider reviewing energy usage around {most_common_hour}:00, as {hour_percentage:.1f}% of anomalies occur during this hour.",
                                'priority': 4
                            })
                        
                        # Check for patterns by day of week
                        dow_counts = anomaly_data[time_column].dt.dayofweek.value_counts()
                        most_common_dow = dow_counts.idxmax() if not dow_counts.empty else None
                        dow_percentage = (dow_counts.max() / insights['anomaly_count'] * 100) if not dow_counts.empty and insights['anomaly_count'] > 0 else 0
                        
                        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                        if dow_percentage > 30:
                            recommendations.append({
                                'text': f"Consider reviewing energy usage on {days[most_common_dow]}s, as {dow_percentage:.1f}% of anomalies occur on this day.",
                                'priority': 3
                            })
            
            # General energy saving recommendation
            recommendations.append({
                'text': "Regular monitoring of energy consumption patterns can help identify potential issues early.",
                'priority': 2
            })
            
            return recommendations
        except Exception as e:
            logging.error(f"Error generating recommendations: {e}")
            return [{
                'text': "Could not generate detailed recommendations due to an error in analysis.",
                'priority': 2
            }]
