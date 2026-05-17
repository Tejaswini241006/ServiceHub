import uuid
from datetime import datetime, timezone
from app import db


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = db.Column(db.String(36), db.ForeignKey("bookings.id"), unique=True, nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    provider_id = db.Column(db.String(36), db.ForeignKey("providers.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    booking = db.relationship("Booking", back_populates="review")
    customer = db.relationship("User", back_populates="reviews", foreign_keys=[user_id])
    provider = db.relationship("Provider", back_populates="reviews_received", foreign_keys=[provider_id])

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "user_id": self.user_id,
            "provider_id": self.provider_id,
            "rating": self.rating,
            "comment": self.comment,
            "customer_name": self.customer.name if self.customer else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Review {self.id} - {self.rating}★>"
