import uuid
from datetime import datetime, timezone
from app import db


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    icon = db.Column(db.String(100), default="tool")
    description = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    services = db.relationship("Service", back_populates="category")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "icon": self.icon,
            "description": self.description,
            "is_active": self.is_active,
            "service_count": len([s for s in self.services if s.is_active]),
        }


class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_id = db.Column(db.String(36), db.ForeignKey("providers.id"), nullable=False)
    category_id = db.Column(db.String(36), db.ForeignKey("categories.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    duration_mins = db.Column(db.Integer, nullable=False, default=60)
    image_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    provider = db.relationship("Provider", back_populates="services")
    category = db.relationship("Category", back_populates="services")
    bookings = db.relationship("Booking", back_populates="service")

    def to_dict(self, include_provider=True):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "duration_mins": self.duration_mins,
            "image_url": self.image_url,
            "is_active": self.is_active,
            "category_id": self.category_id,
            "provider_id": self.provider_id,
            "category": self.category.to_dict() if self.category else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_provider and self.provider:
            data["provider"] = {
                "id": self.provider.id,
                "name": self.provider.user.name if self.provider.user else None,
                "avg_rating": round(self.provider.avg_rating, 1),
                "total_reviews": self.provider.total_reviews,
            }
        return data

    def __repr__(self):
        return f"<Service {self.title}>"
