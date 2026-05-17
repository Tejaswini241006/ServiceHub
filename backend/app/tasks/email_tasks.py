from celery import Celery
import os

celery_app = Celery(
    "servicehub",
    broker=os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
)


@celery_app.task(bind=True, max_retries=3)
def send_booking_confirmation(self, booking_id: str):
    """Send booking confirmation email to customer."""
    try:
        from app import create_app
        from app.models.booking import Booking

        app = create_app()
        with app.app_context():
            booking = Booking.query.get(booking_id)
            if not booking:
                return

            # In production, integrate with Flask-Mail or SendGrid
            print(
                f"[EMAIL] Booking confirmation sent to {booking.customer.email} "
                f"for booking {booking_id}"
            )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(bind=True, max_retries=3)
def send_booking_status_update(self, booking_id: str, new_status: str):
    """Notify customer about booking status change."""
    try:
        from app import create_app
        from app.models.booking import Booking

        app = create_app()
        with app.app_context():
            booking = Booking.query.get(booking_id)
            if not booking:
                return

            print(
                f"[EMAIL] Status update '{new_status}' sent to {booking.customer.email} "
                f"for booking {booking_id}"
            )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@celery_app.task
def send_review_request(booking_id: str):
    """Ask customer to leave a review after completion."""
    try:
        from app import create_app
        from app.models.booking import Booking

        app = create_app()
        with app.app_context():
            booking = Booking.query.get(booking_id)
            if not booking:
                return
            print(
                f"[EMAIL] Review request sent to {booking.customer.email} "
                f"for booking {booking_id}"
            )
    except Exception:
        pass
