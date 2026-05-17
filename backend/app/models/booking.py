import uuid
from datetime import datetime, timezone
from app import db


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    service_id = db.Column(db.String(36), db.ForeignKey("services.id"), nullable=False)
    booking_date = db.Column(db.DateTime, nullable=False)
    address = db.Column(db.Text, nullable=False)
    # String instead of Enum for SQLite compatibility
    status = db.Column(db.String(20), nullable=False, default="pending")
    total_amount = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    customer = db.relationship("User", back_populates="bookings", foreign_keys=[user_id])
    service = db.relationship("Service", back_populates="bookings")
    review = db.relationship(
        "Review", back_populates="booking", uselist=False, cascade="all, delete-orphan"
    )

    VALID_TRANSITIONS = {
        "pending": ["accepted", "cancelled"],
        "accepted": ["in_progress", "cancelled"],
        "in_progress": ["completed", "cancelled"],
        "completed": [],
        "cancelled": [],
    }

    def can_transition_to(self, new_status: str) -> bool:
        return new_status in self.VALID_TRANSITIONS.get(self.status, [])

    def to_dict(self, include_review=True):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "service_id": self.service_id,
            "booking_date": self.booking_date.isoformat() if self.booking_date else None,
            "address": self.address,
            "status": self.status,
            "total_amount": self.total_amount,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "service": self.service.to_dict() if self.service else None,
            "customer": self.customer.to_dict() if self.customer else None,
        }
        if include_review:
            data["review"] = self.review.to_dict() if self.review else None
        return data

    def __repr__(self):
        return f"<Booking {self.id} - {self.status}>"
