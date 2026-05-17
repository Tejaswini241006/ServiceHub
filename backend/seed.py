"""
Seed script — creates all tables and inserts demo data.
Run with:  python seed.py
Or via start.sh (runs automatically on first launch)
"""
import os, sys, random
from datetime import datetime, timezone, timedelta

os.environ.setdefault("FLASK_ENV", "development")

from app import create_app, db
from app.models.user import User, Provider
from app.models.service import Service, Category
from app.models.booking import Booking
from app.models.review import Review

app = create_app()

CATEGORIES = [
    {"name": "Cleaning",       "icon": "sparkles",    "description": "Home & office cleaning"},
    {"name": "Plumbing",       "icon": "wrench",       "description": "Plumbing repairs & installation"},
    {"name": "Electrician",    "icon": "zap",          "description": "Electrical work & repairs"},
    {"name": "Painting",       "icon": "paintbrush",   "description": "Interior & exterior painting"},
    {"name": "Carpentry",      "icon": "hammer",       "description": "Wood work & furniture"},
    {"name": "AC & Appliances","icon": "wind",         "description": "AC servicing & repairs"},
    {"name": "Pest Control",   "icon": "bug",          "description": "Pest elimination services"},
    {"name": "Gardening",      "icon": "leaf",         "description": "Garden care & landscaping"},
]

with app.app_context():
    db.create_all()

    # Skip if already seeded
    if User.query.filter_by(email="admin@servicehub.com").first():
        print("Database already seeded — skipping.")
        sys.exit(0)

    print("Seeding database...")

    # Categories
    categories = []
    for cat_data in CATEGORIES:
        cat = Category(**cat_data)
        db.session.add(cat)
        categories.append(cat)
    db.session.flush()

    # Admin
    admin = User(name="Admin User", email="admin@servicehub.com", role="admin")
    admin.set_password("Admin@123")
    db.session.add(admin)

    # Customers
    customers = []
    for i in range(1, 6):
        c = User(
            name=f"Customer {i}",
            email=f"customer{i}@example.com",
            role="customer",
            phone=f"9{i}00000000",
        )
        c.set_password("Customer@123")
        db.session.add(c)
        customers.append(c)

    # Providers
    providers = []
    provider_data = [
        {"name": "Rajesh Kumar", "email": "rajesh@provider.com",  "exp": 5,  "desc": "Expert cleaner with 5+ years experience"},
        {"name": "Suresh Patel", "email": "suresh@provider.com",  "exp": 8,  "desc": "Licensed plumber & pipe specialist"},
        {"name": "Amit Sharma",  "email": "amit@provider.com",    "exp": 10, "desc": "Senior electrician, certified & insured"},
        {"name": "Priya Singh",  "email": "priya@provider.com",   "exp": 3,  "desc": "Professional painter & interior designer"},
    ]
    for pd in provider_data:
        u = User(name=pd["name"], email=pd["email"], role="provider", phone="9999999999")
        u.set_password("Provider@123")
        db.session.add(u)
        db.session.flush()
        p = Provider(
            user_id=u.id,
            experience=pd["exp"],
            description=pd["desc"],
            is_approved=True,
            avg_rating=round(random.uniform(3.5, 5.0), 1),
            total_reviews=random.randint(5, 50),
        )
        db.session.add(p)
        providers.append(p)
    db.session.flush()

    # Services
    service_templates = [
        ("Deep Home Cleaning",   "Thorough cleaning of your entire home",          1499, 180, 0, 0),
        ("Bathroom Cleaning",    "Deep bathroom sanitization",                       599,  60, 0, 0),
        ("Kitchen Cleaning",     "Degreasing and deep kitchen clean",                799,  90, 0, 0),
        ("Pipe Repair",          "Fix leaking or broken pipes",                      399,  60, 1, 1),
        ("Bathroom Fitting",     "Full bathroom fixture installation",               1999, 240, 1, 1),
        ("Electrical Wiring",    "Safe wiring and rewiring",                         699, 120, 2, 2),
        ("Fan Installation",     "Ceiling and wall fan fitting",                     299,  60, 2, 2),
        ("Interior Painting",    "Professional interior wall painting",             3999, 480, 3, 3),
        ("Touch-up Painting",    "Small area painting and touch-up",                 999, 120, 3, 3),
        ("AC Servicing",         "Full AC gas refill and cleaning",                  799,  90, 2, 5),
        ("Pest Treatment",       "Full home pest control treatment",                1299, 120, 1, 6),
        ("Garden Maintenance",   "Lawn mowing, trimming and care",                   599, 120, 0, 7),
    ]

    services = []
    for title, desc, price, duration, prov_idx, cat_idx in service_templates:
        s = Service(
            provider_id=providers[prov_idx % len(providers)].id,
            category_id=categories[cat_idx % len(categories)].id,
            title=title,
            description=desc,
            price=float(price),
            duration_mins=duration,
        )
        db.session.add(s)
        services.append(s)
    db.session.flush()

    # Bookings
    statuses = ["pending", "accepted", "completed", "cancelled", "in_progress"]
    for i, customer in enumerate(customers):
        for j in range(3):
            service = services[(i * 3 + j) % len(services)]
            days_offset = random.randint(-20, 15)
            booking = Booking(
                user_id=customer.id,
                service_id=service.id,
                booking_date=datetime.now(timezone.utc) + timedelta(days=days_offset),
                address=f"{random.randint(10, 999)} Main Street, Sector {random.randint(1,50)}, City 110001",
                status=statuses[(i + j) % len(statuses)],
                total_amount=service.price,
                notes="Please call 30 minutes before arriving." if j == 0 else None,
            )
            db.session.add(booking)
            db.session.flush()

            # Add review for completed bookings
            if booking.status == "completed":
                review = Review(
                    booking_id=booking.id,
                    user_id=customer.id,
                    provider_id=service.provider_id,
                    rating=random.randint(3, 5),
                    comment=random.choice([
                        "Great service! Very professional.",
                        "On time and thorough. Will book again.",
                        "Good work, would recommend.",
                        "Excellent experience overall!",
                    ]),
                )
                db.session.add(review)

    db.session.commit()
    print("✅  Database seeded successfully!\n")
    print("Demo accounts:")
    print("  Admin:    admin@servicehub.com   / Admin@123")
    print("  Customer: customer1@example.com  / Customer@123")
    print("  Provider: rajesh@provider.com    / Provider@123")
