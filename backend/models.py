from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Association table for many-to-many relationship
ngo_categories = db.Table('ngo_categories',
    db.Column('ngo_id', db.Integer, db.ForeignKey('ngos.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('categories.id'), primary_key=True)
)

class NGO(db.Model):
    __tablename__ = 'ngos'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    registration_no = db.Column(db.String(100), unique=True)
    mission = db.Column(db.Text)
    description = db.Column(db.Text)
    founded_year = db.Column(db.Integer)
    email = db.Column(db.String(255))
    phone = db.Column(db.String(50))
    website = db.Column(db.String(255))
    
    # Location
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    country = db.Column(db.String(100), default='India')
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Verification & Status
    verified = db.Column(db.Boolean, default=False)
    active = db.Column(db.Boolean, default=True)
    transparency_score = db.Column(db.Integer, default=0)
    
    # Metadata
    source = db.Column(db.String(100))  # scraped from which site
    scraped_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    categories = db.relationship('Category', secondary=ngo_categories, backref='ngos')
    volunteer_posts = db.relationship('VolunteerPost', backref='ngo', lazy=True)
    events = db.relationship('Event', backref='ngo', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'registration_no': self.registration_no,
            'mission': self.mission,
            'description': self.description,
            'founded_year': self.founded_year,
            'email': self.email,
            'phone': self.phone,
            'website': self.website,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'verified': self.verified,
            'active': self.active,
            'transparency_score': self.transparency_score,
            'categories': [cat.to_dict() for cat in self.categories],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    icon = db.Column(db.String(50))
    description = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'icon': self.icon,
            'description': self.description
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255))
    role = db.Column(db.String(50), default='user')  # user, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class VolunteerPost(db.Model):
    __tablename__ = 'volunteer_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    ngo_id = db.Column(db.Integer, db.ForeignKey('ngos.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    location = db.Column(db.String(255))
    deadline = db.Column(db.Date)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'ngo_id': self.ngo_id,
            'ngo_name': self.ngo.name if self.ngo else None,
            'title': self.title,
            'description': self.description,
            'requirements': self.requirements,
            'location': self.location,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'active': self.active,
            'created_at': self.created_at.isoformat()
        }

class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    ngo_id = db.Column(db.Integer, db.ForeignKey('ngos.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255))
    registration_link = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'ngo_id': self.ngo_id,
            'ngo_name': self.ngo.name if self.ngo else None,
            'title': self.title,
            'description': self.description,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'location': self.location,
            'registration_link': self.registration_link,
            'created_at': self.created_at.isoformat()
        }

class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    volunteer_post_id = db.Column(db.Integer, db.ForeignKey('volunteer_posts.id'), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(50), default='pending')  # pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='applications')
    volunteer_post = db.relationship('VolunteerPost', backref='applications')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'volunteer_post_id': self.volunteer_post_id,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }