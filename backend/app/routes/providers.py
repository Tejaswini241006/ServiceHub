from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import Provider, User
from app.models.service import Service
from app.models.booking import Booking
from app import db
from app.utils.response import success_response, error_response, paginated_response
from app.utils.pagination import get_pagination_params, paginate_query
from app.middleware.rbac import require_role
from app.utils.validators import validate_json, ProviderProfileSchema

providers_bp = Blueprint("providers", __name__)


@providers_bp.route("/dashboard", methods=["GET"])
@require_role("provider")
def dashboard():
    user_id = get_jwt_identity()
    provider = Provider.query.filter_by(user_id=user_id).first()
    if not provider:
        return error_response("Provider profile not found", 404)

    total_services = Service.query.filter_by(provider_id=provider.id, is_active=True).count()
    total_bookings = (
        Booking.query
        .join(Service)
        .filter(Service.provider_id == provider.id)
        .count()
    )
    pending_bookings = (
        Booking.query
        .join(Service)
        .filter(Service.provider_id == provider.id, Booking.status == "pending")
        .count()
    )
    completed_bookings = (
        Booking.query
        .join(Service)
        .filter(Service.provider_id == provider.id, Booking.status == "completed")
        .count()
    )

    recent_bookings = (
        Booking.query
        .join(Service)
        .filter(Service.provider_id == provider.id)
        .order_by(Booking.created_at.desc())
        .limit(5)
        .all()
    )

    return success_response(data={
        "provider": provider.to_dict(),
        "stats": {
            "total_services": total_services,
            "total_bookings": total_bookings,
            "pending_bookings": pending_bookings,
            "completed_bookings": completed_bookings,
            "avg_rating": round(provider.avg_rating, 1),
            "total_earnings": provider.total_earnings,
            "total_reviews": provider.total_reviews,
        },
        "recent_bookings": [b.to_dict() for b in recent_bookings],
    })


@providers_bp.route("/profile", methods=["PUT"])
@require_role("provider")
@validate_json(ProviderProfileSchema)
def update_profile():
    user_id = get_jwt_identity()
    provider = Provider.query.filter_by(user_id=user_id).first()
    if not provider:
        return error_response("Provider not found", 404)

    data = request.validated_data
    for field in ["experience", "description"]:
        if field in data:
            setattr(provider, field, data[field])

    # Update user name/phone too if provided
    body = request.get_json() or {}
    user = User.query.get(user_id)
    if "name" in body:
        user.name = body["name"]
    if "phone" in body:
        user.phone = body["phone"]

    db.session.commit()
    return success_response(data=provider.to_dict(), message="Profile updated")


@providers_bp.route("/availability", methods=["PATCH"])
@require_role("provider")
def update_availability():
    user_id = get_jwt_identity()
    provider = Provider.query.filter_by(user_id=user_id).first()
    if not provider:
        return error_response("Provider not found", 404)

    data = request.get_json() or {}
    if "availability" in data:
        provider.availability = data["availability"]
        db.session.commit()
    return success_response(data={"availability": provider.availability}, message="Availability updated")


@providers_bp.route("/<provider_id>", methods=["GET"])
def get_provider(provider_id):
    provider = Provider.query.get(provider_id)
    if not provider:
        return error_response("Provider not found", 404)
    return success_response(data=provider.to_dict())


@providers_bp.route("/<provider_id>/services", methods=["GET"])
def get_provider_services(provider_id):
    page, per_page = get_pagination_params()
    provider = Provider.query.get(provider_id)
    if not provider:
        return error_response("Provider not found", 404)

    query = Service.query.filter_by(provider_id=provider_id, is_active=True)
    items, total = paginate_query(query, page, per_page)
    return paginated_response([s.to_dict() for s in items], total, page, per_page)
