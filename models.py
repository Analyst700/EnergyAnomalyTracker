from app import db, login_manager
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    datasets = db.relationship('Dataset', backref='owner', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Dataset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    file_path = db.Column(db.String(256), nullable=False)
    time_column = db.Column(db.String(64))
    value_column = db.Column(db.String(64))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    detections = db.relationship('AnomalyDetection', backref='dataset', lazy='dynamic')
    
class AnomalyDetection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'))
    model_name = db.Column(db.String(64), nullable=False)
    detection_date = db.Column(db.DateTime, default=datetime.utcnow)
    anomaly_count = db.Column(db.Integer)
    results_path = db.Column(db.String(256))
    accuracy = db.Column(db.Float)
    precision = db.Column(db.Float)
    recall = db.Column(db.Float)
    f1_score = db.Column(db.Float)
    
class Recommendation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    detection_id = db.Column(db.Integer, db.ForeignKey('anomaly_detection.id'))
    text = db.Column(db.Text, nullable=False)
    priority = db.Column(db.Integer)  # 1-5 scale for importance
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    detection = db.relationship('AnomalyDetection', backref='recommendations')
    
class UserSetting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    dark_mode = db.Column(db.Boolean, default=False)
    anomaly_threshold = db.Column(db.Float, default=0.95)
    notification_enabled = db.Column(db.Boolean, default=True)
    user = db.relationship('User', backref='settings')
