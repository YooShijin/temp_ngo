"""
Enhanced Database Initialization Script
Creates tables and seeds rich sample data
"""

from app import create_app
from models import db, Category, User, NGO, VolunteerPost, Event, Application
from config import Config
from datetime import datetime, timedelta
import random

def init_database():
    app = create_app()

    with app.app_context():
        print("Dropping existing tables...")
        db.drop_all()

        print("Creating tables...")
        db.create_all()

        # -----------------------------
        # 1. Seed Categories
        # -----------------------------
        print("Seeding categories...")
        categories_data = [
            {'name': 'Education', 'slug': 'education', 'icon': '📚', 'description': 'Educational initiatives and literacy programs'},
            {'name': 'Health', 'slug': 'health', 'icon': '🏥', 'description': 'Healthcare and medical assistance'},
            {'name': 'Environment', 'slug': 'environment', 'icon': '🌱', 'description': 'Environmental conservation and sustainability'},
            {'name': 'Child Welfare', 'slug': 'child-welfare', 'icon': '👶', 'description': 'Child rights and welfare programs'},
            {'name': 'Women Empowerment', 'slug': 'women-empowerment', 'icon': '👩', 'description': 'Women rights and empowerment initiatives'},
            {'name': 'Elderly Care', 'slug': 'elderly-care', 'icon': '👴', 'description': 'Support and care for elderly citizens'},
            {'name': 'Animal Welfare', 'slug': 'animal-welfare', 'icon': '🐾', 'description': 'Animal rights and welfare'},
            {'name': 'Disaster Relief', 'slug': 'disaster-relief', 'icon': '🆘', 'description': 'Emergency response and disaster management'},
            {'name': 'Social Welfare', 'slug': 'social-welfare', 'icon': '🤝', 'description': 'General social welfare programs'},
            {'name': 'Poverty Alleviation', 'slug': 'poverty-alleviation', 'icon': '💰', 'description': 'Programs to reduce poverty'}
        ]
        categories = []
        for cat_data in categories_data:
            cat = Category(**cat_data)
            db.session.add(cat)
            categories.append(cat)
        db.session.commit()

        # -----------------------------
        # 2. Seed Users
        # -----------------------------
        print("Creating users...")
        users = []
        for i in range(5):
            user = User(
                email=f"user{i+1}@example.com",
                name=f"User {i+1}",
                role='user'
            )
            user.set_password("password123")
            db.session.add(user)
            users.append(user)

        admin = User(
            email=Config.ADMIN_EMAIL,
            name='Admin',
            role='admin'
        )
        admin.set_password(Config.ADMIN_PASSWORD)
        db.session.add(admin)
        users.append(admin)
        db.session.commit()

        # -----------------------------
        # 3. Seed NGOs
        # -----------------------------
        print("Creating NGOs...")
        ngo_names = [
            "Akshaya Patra Foundation",
            "Smile Foundation",
            "HelpAge India",
            "Pratham Education Foundation",
            "Nanhi Kali",
            "CRY - Child Rights and You",
            "GiveIndia Foundation",
            "Goonj",
            "Teach for India",
            "Green Earth Trust"
        ]
        cities = ["Delhi", "Mumbai", "Bangalore", "Kolkata", "Pune", "Chennai", "Hyderabad", "Jaipur", "Lucknow", "Patna"]
        states = ["Delhi", "Maharashtra", "Karnataka", "West Bengal", "Maharashtra", "Tamil Nadu", "Telangana", "Rajasthan", "Uttar Pradesh", "Bihar"]

        ngos = []
        for i, name in enumerate(ngo_names):
            ngo = NGO(
                name=name,
                registration_no=f"REG-{1000+i}",
                mission=f"Empowering communities through {categories[i % len(categories)].name.lower()} programs.",
                description=f"{name} works on social impact and welfare in India focusing on {categories[i % len(categories)].name.lower()}.",
                website=f"https://www.{name.split()[0].lower()}.org",
                email=f"contact@{name.split()[0].lower()}.org",
                phone=f"+91-98{i}45678{i}",
                address=f"{i+10} Charity Street",
                city=cities[i],
                state=states[i],
                transparency_score=random.randint(60, 100),
                verified=random.choice([True, False]),
                scraped_at=datetime.utcnow(),
                source="Seed Script"
            )
            ngo.categories = random.sample(categories, k=random.randint(1, 3))
            db.session.add(ngo)
            ngos.append(ngo)
        db.session.commit()

        # -----------------------------
        # 4. Seed Volunteer Posts
        # -----------------------------
        print("Creating volunteer posts...")
        volunteer_posts = []
        for ngo in ngos:
            for j in range(random.randint(1, 3)):
                post = VolunteerPost(
                    ngo_id=ngo.id,
                    title=f"Volunteer for {ngo.name} - Position {j+1}",
                    description="Assist with ongoing NGO initiatives and outreach programs.",
                    requirements="Basic communication skills and enthusiasm to help.",
                    location=f"{ngo.city}, {ngo.state}",
                    deadline=datetime.utcnow() + timedelta(days=random.randint(10, 60)),
                    active=True
                )
                db.session.add(post)
                volunteer_posts.append(post)
        db.session.commit()

        # -----------------------------
        # 5. Seed Events
        # -----------------------------
        print("Creating events...")
        events = []
        for ngo in ngos:
            for j in range(random.randint(1, 2)):
                event = Event(
                    ngo_id=ngo.id,
                    title=f"{ngo.name} Charity Event {j+1}",
                    description=f"Join us for an impactful event organized by {ngo.name}.",
                    event_date=datetime.utcnow() + timedelta(days=random.randint(5, 45)),
                    location=f"{ngo.city}, {ngo.state}",
                    registration_link=f"https://{ngo.name.split()[0].lower()}.org/events"
                )
                db.session.add(event)
                events.append(event)
        db.session.commit()

        # -----------------------------
        # 6. Seed Applications
        # -----------------------------
        print("Creating volunteer applications...")
        for i in range(10):
            app = Application(
                user_id=random.choice(users).id,
                volunteer_post_id=random.choice(volunteer_posts).id,
                message="I am passionate about social work and would love to contribute.",
                status=random.choice(["pending", "accepted", "rejected"])
            )
            db.session.add(app)
        db.session.commit()

        # -----------------------------
        # Final summary
        # -----------------------------
        print("\n" + "=" * 60)
        print("🎉 Database seeded successfully with sample data!")
        print("=" * 60)
        print(f"Categories: {len(categories)}")
        print(f"NGOs: {len(ngos)}")
        print(f"Volunteer Posts: {len(volunteer_posts)}")
        print(f"Events: {len(events)}")
        print(f"Users: {len(users)}")
        print("Admin credentials:")
        print(f"   Email: {Config.ADMIN_EMAIL}")
        print(f"   Password: {Config.ADMIN_PASSWORD}")
        print("=" * 60)
        print("Next Steps:")
        print("1️⃣ Run the app: python app.py")
        print("2️⃣ Visit /api/ngos or /api/volunteer-posts to verify data.")
        print("=" * 60)

if __name__ == '__main__':
    init_database()
