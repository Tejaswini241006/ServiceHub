import uuid
from datetime import datetime, timezone
from app import db
import bcrypt


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    # Use String instead of Enum for SQLite compatibility
    role = db.Column(db.String(20), nullable=False, default="customer")
    is_active = db.Column(db.Boolean, default=True)
    avatar_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    provider_profile = db.relationship(
        "Provider", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    bookings = db.relationship(
        "Booking", back_populates="customer", foreign_keys="Booking.user_id", cascade="all, delete-orphan"
    )
    reviews = db.relationship(
        "Review", back_populates="customer", foreign_keys="Review.user_id", cascade="all, delete-orphan"
    )

    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode("utf-8"), self.password_hash.encode("utf-8"))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "is_active": self.is_active,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<User {self.email}>"


class Provider(db.Model):
    __tablename__ = "providers"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), unique=True, nullable=False)
    experience = db.Column(db.Integer, default=0)
    description = db.Column(db.Text)
    availability = db.Column(
        db.JSON,
        default=lambda: {
            "monday": True, "tuesday": True, "wednesday": True,
            "thursday": True, "friday": True, "saturday": False, "sunday": False,
            "hours_start": "09:00", "hours_end": "18:00",
        },
    )
    is_approved = db.Column(db.Boolean, default=False)
    is_suspended = db.Column(db.Boolean, default=False)
    avg_rating = db.Column(db.Float, default=0.0)
    total_earnings = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User", back_populates="provider_profile")
    services = db.relationship("Service", back_populates="provider", cascade="all, delete-orphan")
    reviews_received = db.relationship(
        "Review", back_populates="provider", foreign_keys="Review.provider_id"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user": self.user.to_dict() if self.user else None,
            "experience": self.experience,
            "description": self.description,
            "availability": self.availability,
            "is_approved": self.is_approved,
            "is_suspended": self.is_suspended,
            "avg_rating": round(self.avg_rating, 1),
            "total_earnings": self.total_earnings,
            "total_reviews": self.total_reviews,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
