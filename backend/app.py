"""
Enhanced Flask Application with Blacklist Support
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, NGO, Category, User, VolunteerPost, Event, Application, BlacklistRecord
from config import Config
from ai_service import ai_service
import jwt
from functools import wraps
from datetime import datetime, timedelta

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    CORS(app)
    
    return app

app = create_app()

# Authentication decorators
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user or current_user.role != 'admin':
                return jsonify({'message': 'Admin access required'}), 403
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# ============= AUTH ROUTES =============

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    user = User(
        email=data['email'],
        name=data.get('name', '')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    })

# ============= NGO ROUTES =============

@app.route('/api/ngos', methods=['GET'])
def get_ngos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', Config.ITEMS_PER_PAGE, type=int)
    
    # Filters
    category = request.args.get('category')
    state = request.args.get('state')
    city = request.args.get('city')
    district = request.args.get('district')
    verified = request.args.get('verified')
    search = request.args.get('search')
    exclude_blacklisted = request.args.get('exclude_blacklisted', 'true') == 'true'
    
    query = NGO.query.filter_by(active=True)
    
    # Exclude blacklisted by default
    if exclude_blacklisted:
        query = query.filter_by(blacklisted=False)
    
    if category:
        query = query.join(NGO.categories).filter(Category.slug == category)
    
    if state:
        query = query.filter(NGO.state.ilike(f'%{state}%'))
    
    if city:
        query = query.filter(NGO.city.ilike(f'%{city}%'))
    
    if district:
        query = query.filter(NGO.district.ilike(f'%{district}%'))
    
    if verified == 'true':
        query = query.filter(NGO.verified == True)
    
    if search:
        query = query.filter(
            db.or_(
                NGO.name.ilike(f'%{search}%'),
                NGO.mission.ilike(f'%{search}%'),
                NGO.description.ilike(f'%{search}%'),
                NGO.darpan_id.ilike(f'%{search}%')
            )
        )
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'ngos': [ngo.to_dict() for ngo in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@app.route('/api/ngos/<int:id>', methods=['GET'])
def get_ngo(id):
    ngo = NGO.query.get_or_404(id)
    return jsonify(ngo.to_dict())

@app.route('/api/ngos', methods=['POST'])
@token_required
def create_ngo(current_user):
    data = request.get_json()
    
    ngo = NGO(
        name=data['name'],
        darpan_id=data.get('darpan_id'),
        mission=data.get('mission'),
        description=data.get('description'),
        email=data.get('email'),
        phone=data.get('phone'),
        website=data.get('website'),
        address=data.get('address'),
        city=data.get('city'),
        state=data.get('state'),
        district=data.get('district'),
        registration_no=data.get('registration_no'),
        verified=False
    )
    
    # AI-powered features
    if ngo.description and ai_service.client:
        ngo.description = ai_service.generate_summary(ngo.description)
    
    if ngo.mission and ai_service.client:
        suggested_cats = ai_service.suggest_categories(ngo.mission)
        for cat_name in suggested_cats:
            category = Category.query.filter_by(name=cat_name).first()
            if category:
                ngo.categories.append(category)
    
    ngo.transparency_score = ai_service.calculate_transparency_score(ngo)
    
    db.session.add(ngo)
    db.session.commit()
    
    return jsonify(ngo.to_dict()), 201

@app.route('/api/ngos/<int:id>', methods=['PUT'])
@admin_required
def update_ngo(current_user, id):
    ngo = NGO.query.get_or_404(id)
    data = request.get_json()
    
    for key, value in data.items():
        if hasattr(ngo, key):
            setattr(ngo, key, value)
    
    ngo.transparency_score = ai_service.calculate_transparency_score(ngo)
    
    db.session.commit()
    return jsonify(ngo.to_dict())

@app.route('/api/ngos/<int:id>/verify', methods=['POST'])
@admin_required
def verify_ngo(current_user, id):
    ngo = NGO.query.get_or_404(id)
    ngo.verified = True
    db.session.commit()
    return jsonify({'message': 'NGO verified successfully'})

# ============= BLACKLIST ROUTES =============

@app.route('/api/blacklisted', methods=['GET'])
def get_blacklisted_ngos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', Config.ITEMS_PER_PAGE, type=int)
    
    # Filters
    state = request.args.get('state')
    blacklisted_by = request.args.get('blacklisted_by')
    search = request.args.get('search')
    
    query = NGO.query.filter_by(blacklisted=True)
    
    if state:
        query = query.filter(NGO.state.ilike(f'%{state}%'))
    
    if blacklisted_by:
        query = query.join(NGO.blacklist_info).filter(
            BlacklistRecord.blacklisted_by.ilike(f'%{blacklisted_by}%')
        )
    
    if search:
        query = query.filter(
            db.or_(
                NGO.name.ilike(f'%{search}%'),
                NGO.darpan_id.ilike(f'%{search}%')
            )
        )
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'ngos': [ngo.to_dict() for ngo in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@app.route('/api/ngos/<int:id>/blacklist', methods=['POST'])
@admin_required
def blacklist_ngo(current_user, id):
    ngo = NGO.query.get_or_404(id)
    data = request.get_json()
    
    ngo.blacklisted = True
    
    # Create blacklist record
    blacklist_record = BlacklistRecord(
        ngo_id=ngo.id,
        blacklisted_by=data.get('blacklisted_by'),
        blacklist_date=datetime.now(),
        wef_date=datetime.now(),
        last_updated=datetime.now(),
        reason=data.get('reason')
    )
    
    db.session.add(blacklist_record)
    db.session.commit()
    
    return jsonify({'message': 'NGO blacklisted successfully'})

@app.route('/api/ngos/<int:id>/unblacklist', methods=['POST'])
@admin_required
def unblacklist_ngo(current_user, id):
    ngo = NGO.query.get_or_404(id)
    ngo.blacklisted = False
    
    # Remove blacklist record
    if ngo.blacklist_info:
        db.session.delete(ngo.blacklist_info)
    
    db.session.commit()
    return jsonify({'message': 'NGO removed from blacklist'})

# ============= CATEGORY ROUTES =============

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([cat.to_dict() for cat in categories])

# ============= VOLUNTEER ROUTES =============

@app.route('/api/volunteer-posts', methods=['GET'])
def get_volunteer_posts():
    active_only = request.args.get('active', 'true') == 'true'
    
    query = VolunteerPost.query.join(NGO).filter(NGO.blacklisted == False)
    if active_only:
        query = query.filter(VolunteerPost.active == True)
    
    posts = query.order_by(VolunteerPost.created_at.desc()).all()
    return jsonify([post.to_dict() for post in posts])

@app.route('/api/volunteer-posts', methods=['POST'])
@admin_required
def create_volunteer_post(current_user):
    data = request.get_json()
    
    post = VolunteerPost(
        ngo_id=data['ngo_id'],
        title=data['title'],
        description=data.get('description'),
        requirements=data.get('requirements'),
        location=data.get('location'),
        deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify(post.to_dict()), 201

# ============= EVENT ROUTES =============

@app.route('/api/events', methods=['GET'])
def get_events():
    upcoming = request.args.get('upcoming', 'true') == 'true'
    
    query = Event.query.join(NGO).filter(NGO.blacklisted == False)
    if upcoming:
        query = query.filter(Event.event_date >= datetime.utcnow())
    
    events = query.order_by(Event.event_date).all()
    return jsonify([event.to_dict() for event in events])

@app.route('/api/events', methods=['POST'])
@admin_required
def create_event(current_user):
    data = request.get_json()
    
    event = Event(
        ngo_id=data['ngo_id'],
        title=data['title'],
        description=data.get('description'),
        event_date=datetime.fromisoformat(data['event_date']),
        location=data.get('location'),
        registration_link=data.get('registration_link')
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify(event.to_dict()), 201

# ============= MAP DATA ROUTE =============

@app.route('/api/ngos/map', methods=['GET'])
def get_ngos_map_data():
    """Get NGOs with coordinates for map display"""
    exclude_blacklisted = request.args.get('exclude_blacklisted', 'true') == 'true'
    
    query = NGO.query.filter(
        NGO.active == True,
        NGO.latitude.isnot(None),
        NGO.longitude.isnot(None)
    )
    
    if exclude_blacklisted:
        query = query.filter(NGO.blacklisted == False)
    
    ngos = query.all()
    
    map_data = []
    for ngo in ngos:
        map_data.append({
            'id': ngo.id,
            'name': ngo.name,
            'lat': ngo.latitude,
            'lng': ngo.longitude,
            'city': ngo.city,
            'state': ngo.state,
            'verified': ngo.verified,
            'blacklisted': ngo.blacklisted,
            'categories': [cat.name for cat in ngo.categories]
        })
    
    return jsonify(map_data)

# ============= STATS ROUTES =============

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_ngos = NGO.query.filter_by(active=True, blacklisted=False).count()
    verified_ngos = NGO.query.filter_by(active=True, verified=True, blacklisted=False).count()
    blacklisted_ngos = NGO.query.filter_by(blacklisted=True).count()
    total_volunteers = VolunteerPost.query.join(NGO).filter(
        VolunteerPost.active == True,
        NGO.blacklisted == False
    ).count()
    upcoming_events = Event.query.join(NGO).filter(
        Event.event_date >= datetime.utcnow(),
        NGO.blacklisted == False
    ).count()
    
    # NGOs by category (excluding blacklisted)
    categories_data = []
    for category in Category.query.all():
        count = len([ngo for ngo in category.ngos if ngo.active and not ngo.blacklisted])
        if count > 0:
            categories_data.append({
                'name': category.name,
                'count': count
            })
    
    # NGOs by state (excluding blacklisted)
    states_data = db.session.query(
        NGO.state, db.func.count(NGO.id)
    ).filter(
        NGO.active == True,
        NGO.blacklisted == False,
        NGO.state.isnot(None)
    ).group_by(NGO.state).all()
    
    return jsonify({
        'total_ngos': total_ngos,
        'verified_ngos': verified_ngos,
        'blacklisted_ngos': blacklisted_ngos,
        'total_volunteers': total_volunteers,
        'upcoming_events': upcoming_events,
        'categories': categories_data,
        'states': [{'name': state, 'count': count} for state, count in states_data]
    })

# ============= SEARCH ROUTE =============

@app.route('/api/search', methods=['GET'])
def search():
    query_text = request.args.get('q', '')
    
    if not query_text:
        return jsonify({'results': []})
    
    ngos = NGO.query.filter(
        db.or_(
            NGO.name.ilike(f'%{query_text}%'),
            NGO.mission.ilike(f'%{query_text}%'),
            NGO.description.ilike(f'%{query_text}%'),
            NGO.darpan_id.ilike(f'%{query_text}%')
        ),
        NGO.active == True,
        NGO.blacklisted == False
    ).limit(10).all()
    
    return jsonify({
        'results': [ngo.to_dict() for ngo in ngos]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)