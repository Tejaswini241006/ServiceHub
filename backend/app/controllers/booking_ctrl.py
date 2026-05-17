from datetime import datetime, timezone
from flask_jwt_extended import get_jwt_identity, get_jwt
from app import db
from app.models.booking import Booking
from app.models.review import Review
from app.models.service import Service
from app.models.user import Provider, User
from app.utils.response import success_response, error_response, paginated_response
from app.utils.pagination import get_pagination_params, paginate_query


def create_booking(data: dict):
    user_id = get_jwt_identity()
    service = Service.query.get(data["service_id"])
    if not service or not service.is_active:
        return error_response("Service not found", 404)

    if not service.provider.is_approved or service.provider.is_suspended:
        return error_response("Provider is not available", 400)

    booking_date = data["booking_date"]
    # Ensure timezone-aware for comparison
    if booking_date.tzinfo is None:
        booking_date = booking_date.replace(tzinfo=timezone.utc)
    if booking_date < datetime.now(timezone.utc):
        return error_response("Booking date must be in the future", 400)

    booking = Booking(
        user_id=user_id,
        service_id=service.id,
        booking_date=booking_date,
        address=data["address"],
        notes=data.get("notes"),
        total_amount=service.price,
    )
    db.session.add(booking)
    db.session.commit()

    # Fire email task (non-blocking)
    try:
        from app.tasks.email_tasks import send_booking_confirmation
        send_booking_confirmation.delay(booking.id)
    except Exception:
        pass

    return success_response(data=booking.to_dict(), message="Booking created", status_code=201)


def get_my_bookings():
    user_id = get_jwt_identity()
    page, per_page = get_pagination_params()
    from flask import request
    status = request.args.get("status")

    query = Booking.query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=status)
    query = query.order_by(Booking.created_at.desc())

    items, total = paginate_query(query, page, per_page)
    return paginated_response([b.to_dict() for b in items], total, page, per_page)


def get_provider_bookings():
    user_id = get_jwt_identity()
    provider = Provider.query.filter_by(user_id=user_id).first()
    if not provider:
        return error_response("Provider not found", 404)

    page, per_page = get_pagination_params()
    from flask import request
    status = request.args.get("status")

    query = (
        Booking.query
        .join(Service)
        .filter(Service.provider_id == provider.id)
    )
    if status:
        query = query.filter(Booking.status == status)
    query = query.order_by(Booking.created_at.desc())

    items, total = paginate_query(query, page, per_page)
    return paginated_response([b.to_dict() for b in items], total, page, per_page)


def update_booking_status(booking_id: str, data: dict):
    claims = get_jwt()
    user_id = get_jwt_identity()
    role = claims.get("role")
    new_status = data.get("status")

    booking = Booking.query.get(booking_id)
    if not booking:
        return error_response("Booking not found", 404)

    # Authorization
    if role == "customer":
        if booking.user_id != user_id:
            return error_response("Unauthorized", 403)
        if new_status not in ["cancelled"]:
            return error_response("Customers can only cancel bookings", 403)
    elif role == "provider":
        provider = Provider.query.filter_by(user_id=user_id).first()
        if not provider or booking.service.provider_id != provider.id:
            return error_response("Unauthorized", 403)
    elif role == "admin":
        pass  # Admins can do anything
    else:
        return error_response("Unauthorized", 403)

    if not booking.can_transition_to(new_status):
        return error_response(
            f"Cannot transition from '{booking.status}' to '{new_status}'", 400
        )

    booking.status = new_status

    # Update provider earnings on completion
    if new_status == "completed":
        provider = booking.service.provider
        provider.total_earnings += booking.total_amount
        db.session.add(provider)

    db.session.commit()
    return success_response(data=booking.to_dict(), message="Booking status updated")


def cancel_booking(booking_id: str):
    user_id = get_jwt_identity()
    booking = Booking.query.get(booking_id)

    if not booking:
        return error_response("Booking not found", 404)
    if booking.user_id != user_id:
        return error_response("Unauthorized", 403)
    if not booking.can_transition_to("cancelled"):
        return error_response("Booking cannot be cancelled", 400)

    booking.status = "cancelled"
    db.session.commit()
    return success_response(message="Booking cancelled")


def submit_review(booking_id: str, data: dict):
    user_id = get_jwt_identity()
    booking = Booking.query.get(booking_id)

    if not booking:
        return error_response("Booking not found", 404)
    if booking.user_id != user_id:
        return error_response("Unauthorized", 403)
    if booking.status != "completed":
        return error_response("Can only review completed bookings", 400)
    if booking.review:
        return error_response("Review already submitted", 409)

    review = Review(
        booking_id=booking.id,
        user_id=user_id,
        provider_id=booking.service.provider_id,
        rating=data["rating"],
        comment=data.get("comment"),
    )
    db.session.add(review)

    # Update provider avg rating
    provider = booking.service.provider
    provider.total_reviews += 1
    all_ratings = [r.rating for r in provider.reviews_received] + [data["rating"]]
    provider.avg_rating = sum(all_ratings) / len(all_ratings)
    db.session.add(provider)

    db.session.commit()
    return success_response(data=review.to_dict(), message="Review submitted", status_code=201)
