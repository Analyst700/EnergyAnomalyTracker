import os
import pandas as pd
import logging
from flask import render_template, url_for, flash, redirect, request, jsonify, session
from flask_login import login_user, current_user, logout_user, login_required
from werkzeug.utils import secure_filename
from datetime import datetime

from app import app, db
from forms import LoginForm, RegistrationForm, DatasetUploadForm, ModelSelectionForm, SettingsForm
from models import User, Dataset, AnomalyDetection, Recommendation, UserSetting
from data_processor import DataProcessor
from anomaly_detection import AnomalyDetectionService

# Initialize services
data_processor = DataProcessor()
anomaly_detection_service = AnomalyDetectionService()

# Routes for authentication
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('home'))
        else:
            flash('Login unsuccessful. Please check username and password.', 'danger')
    
    return render_template('login.html', title='Login', form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        
        # Create default settings for the user
        settings = UserSetting(user_id=user.id)
        db.session.add(settings)
        db.session.commit()
        
        flash('Your account has been created! You can now log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('login.html', title='Register', form=form, is_register=True)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

# Main application routes
@app.route('/')
@app.route('/home')
@login_required
def home():
    return render_template('home.html', title='Home')

@app.route('/dashboard')
@login_required
def dashboard():
    # Get recent datasets
    recent_datasets = Dataset.query.filter_by(user_id=current_user.id).order_by(Dataset.upload_date.desc()).limit(5).all()
    
    # Get recent detections
    recent_detections = AnomalyDetection.query.join(Dataset).filter(Dataset.user_id == current_user.id).order_by(AnomalyDetection.detection_date.desc()).limit(5).all()
    
    return render_template('dashboard.html', title='Dashboard', 
                          recent_datasets=recent_datasets,
                          recent_detections=recent_detections)

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    form = DatasetUploadForm()
    if form.validate_on_submit():
        try:
            # Secure the filename
            filename = secure_filename(form.file.data.filename)
            # Add timestamp to make it unique
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_filename = f"{timestamp}_{filename}"
            
            # Save the file
            file_path = data_processor.save_upload(form.file.data, unique_filename)
            
            # Create dataset record
            dataset = Dataset(
                name=form.name.data,
                description=form.description.data,
                file_path=file_path,
                time_column=form.time_column.data,
                value_column=form.value_column.data,
                user_id=current_user.id
            )
            db.session.add(dataset)
            db.session.commit()
            
            flash('Dataset uploaded successfully!', 'success')
            return redirect(url_for('detection'))
        except Exception as e:
            flash(f'Error uploading dataset: {str(e)}', 'danger')
    
    return render_template('upload.html', title='Upload Data', form=form)

@app.route('/detection', methods=['GET', 'POST'])
@login_required
def detection():
    form = ModelSelectionForm()
    
    # Get datasets for the current user
    datasets = Dataset.query.filter_by(user_id=current_user.id).all()
    form.dataset.choices = [(d.id, d.name) for d in datasets]
    
    if form.validate_on_submit():
        try:
            # Get selected dataset
            dataset_id = form.dataset.data
            dataset = Dataset.query.get_or_404(dataset_id)
            
            # Run anomaly detection
            results = anomaly_detection_service.run_detection(
                dataset, 
                form.model.data,
                contamination=form.contamination.data
            )
            
            # Create detection record
            detection = AnomalyDetection(
                dataset_id=dataset.id,
                model_name=form.model.data,
                anomaly_count=results['insights']['anomaly_count'],
                results_path=results['results_path'],
                accuracy=results['metrics']['accuracy'],
                precision=results['metrics']['precision'],
                recall=results['metrics']['recall'],
                f1_score=results['metrics']['f1_score']
            )
            db.session.add(detection)
            db.session.commit()
            
            # Save recommendations
            for rec in results['recommendations']:
                recommendation = Recommendation(
                    detection_id=detection.id,
                    text=rec['text'],
                    priority=rec['priority']
                )
                db.session.add(recommendation)
            db.session.commit()
            
            # Store results in session for display
            session['detection_id'] = detection.id
            
            flash('Anomaly detection completed successfully!', 'success')
            return redirect(url_for('results', detection_id=detection.id))
        except Exception as e:
            flash(f'Error in anomaly detection: {str(e)}', 'danger')
    
    return render_template('detection.html', title='Run Detection', form=form)

@app.route('/results/<int:detection_id>')
@login_required
def results(detection_id):
    # Get detection record
    detection = AnomalyDetection.query.get_or_404(detection_id)
    
    # Check if user has access to this detection
    dataset = Dataset.query.get_or_404(detection.dataset_id)
    if dataset.user_id != current_user.id:
        flash('You do not have permission to view this detection.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Load detection results for visualization
    try:
        results_df = pd.read_csv(detection.results_path)
        
        # Convert to JSON for frontend visualization
        time_data = results_df[dataset.time_column].tolist()
        value_data = results_df[dataset.value_column].tolist()
        anomaly_data = results_df['anomaly'].tolist()
        score_data = results_df['score'].tolist()
        
        # Get recommendations
        recommendations = Recommendation.query.filter_by(detection_id=detection_id).order_by(Recommendation.priority.desc()).all()
        
        return render_template('results.html', title='Detection Results',
                              detection=detection,
                              dataset=dataset,
                              time_data=time_data,
                              value_data=value_data,
                              anomaly_data=anomaly_data,
                              score_data=score_data,
                              recommendations=recommendations)
    except Exception as e:
        flash(f'Error loading results: {str(e)}', 'danger')
        return redirect(url_for('dashboard'))

@app.route('/insights')
@login_required
def insights():
    # Get all detections for the current user
    detections = AnomalyDetection.query.join(Dataset).filter(Dataset.user_id == current_user.id).order_by(AnomalyDetection.detection_date.desc()).all()
    
    # Convert detections to a serializable format for JSON
    detection_data = []
    for detection in detections:
        detection_data.append({
            'id': detection.id,
            'model_name': detection.model_name,
            'detection_date': detection.detection_date.strftime('%Y-%m-%d'),
            'anomaly_count': detection.anomaly_count,
            'accuracy': detection.accuracy,
            'precision': detection.precision,
            'recall': detection.recall,
            'f1_score': detection.f1_score,
            'dataset_name': detection.dataset.name
        })
    
    return render_template('insights.html', title='Model Insights', detections=detection_data)

@app.route('/recommendations')
@login_required
def recommendations():
    # Get all recommendations for the current user's detections
    recommendations = Recommendation.query.join(AnomalyDetection).join(Dataset).filter(Dataset.user_id == current_user.id).order_by(Recommendation.priority.desc(), Recommendation.created_at.desc()).all()
    
    return render_template('recommendations.html', title='Recommendations', recommendations=recommendations)

@app.route('/delete_history', methods=['POST'])
@login_required
def delete_history():
    try:
        # Get all datasets for the user
        datasets = Dataset.query.filter_by(user_id=current_user.id).all()
        
        for dataset in datasets:
            # Delete associated recommendations
            Recommendation.query.join(AnomalyDetection).filter(AnomalyDetection.dataset_id == dataset.id).delete(synchronize_session=False)
            
            # Delete anomaly detections
            AnomalyDetection.query.filter_by(dataset_id=dataset.id).delete()
            
            # Delete the dataset
            db.session.delete(dataset)
        
        db.session.commit()
        flash('History deleted successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting history: {str(e)}', 'danger')
    
    return redirect(url_for('dashboard'))

@app.route('/delete_dataset/<int:dataset_id>', methods=['POST'])
@login_required
def delete_dataset(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        if dataset.user_id != current_user.id:
            return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
            
        # Delete associated recommendations and detections
        for detection in dataset.detections:
            Recommendation.query.filter_by(detection_id=detection.id).delete()
            db.session.delete(detection)
            
        db.session.delete(dataset)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/delete_detection/<int:detection_id>', methods=['POST'])
@login_required
def delete_detection(detection_id):
    try:
        detection = AnomalyDetection.query.get_or_404(detection_id)
        if detection.dataset.user_id != current_user.id:
            return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
            
        # Delete associated recommendations
        Recommendation.query.filter_by(detection_id=detection.id).delete()
        db.session.delete(detection)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/delete_recommendation/<int:recommendation_id>', methods=['POST'])
@login_required
def delete_recommendation(recommendation_id):
    try:
        recommendation = Recommendation.query.get_or_404(recommendation_id)
        if recommendation.detection.dataset.user_id != current_user.id:
            return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
            
        db.session.delete(recommendation)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    # Get or create user settings
    user_settings = UserSetting.query.filter_by(user_id=current_user.id).first()
    if not user_settings:
        user_settings = UserSetting(user_id=current_user.id)
        db.session.add(user_settings)
        db.session.commit()
    
    form = SettingsForm(obj=user_settings)
    
    if form.validate_on_submit():
        # Update settings
        form.populate_obj(user_settings)
        db.session.commit()
        flash('Settings updated successfully!', 'success')
        return redirect(url_for('settings'))
    
    return render_template('settings.html', title='Settings', form=form)

@app.route('/api/dataset/<int:dataset_id>/preview')
@login_required
def api_dataset_preview(dataset_id):
    # Get dataset
    dataset = Dataset.query.get_or_404(dataset_id)
    
    # Check if user has access to this dataset
    if dataset.user_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    try:
        # Load dataset preview
        data = pd.read_csv(dataset.file_path, nrows=100)
        preview = data.to_dict(orient='records')
        columns = data.columns.tolist()
        
        return jsonify({
            'preview': preview[:10],  # First 10 rows only
            'columns': columns
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
