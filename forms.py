from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, FileField, SelectField, FloatField, TextAreaField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
from models import User

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Username already taken. Please choose a different one.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email already registered. Please use a different one or log in.')

class DatasetUploadForm(FlaskForm):
    name = StringField('Dataset Name', validators=[DataRequired()])
    description = TextAreaField('Description')
    file = FileField('CSV File', validators=[DataRequired()])
    time_column = StringField('Time Column Name', validators=[DataRequired()])
    value_column = StringField('Value Column Name', validators=[DataRequired()])
    submit = SubmitField('Upload')

class ModelSelectionForm(FlaskForm):
    dataset = SelectField('Select Dataset', coerce=int, validators=[DataRequired()])
    model = SelectField('Select Model', choices=[
        ('isolation_forest', 'Isolation Forest'),
        ('autoencoder', 'Autoencoder'),
        ('kmeans', 'K-Means')
    ], validators=[DataRequired()])
    contamination = FloatField('Contamination Factor (0.01-0.5)', default=0.05)
    submit = SubmitField('Run Detection')

class SettingsForm(FlaskForm):
    dark_mode = BooleanField('Dark Mode')
    anomaly_threshold = FloatField('Anomaly Detection Threshold', default=0.95)
    notification_enabled = BooleanField('Enable Notifications')
    submit = SubmitField('Save Settings')
