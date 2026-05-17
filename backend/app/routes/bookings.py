from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.controllers.booking_ctrl import (
    create_booking, get_my_bookings, get_provider_bookings,
    update_booking_status, cancel_booking, submit_review
)
from app.middleware.rbac import require_role
from app.utils.validators import validate_json, BookingSchema, ReviewSchema

bookings_bp = Blueprint("bookings", __name__)


@bookings_bp.route("", methods=["POST"])
@require_role("customer")
@validate_json(BookingSchema)
def create():
    return create_booking(request.validated_data)


@bookings_bp.route("/my", methods=["GET"])
@require_role("customer")
def my_bookings():
    return get_my_bookings()


@bookings_bp.route("/provider", methods=["GET"])
@require_role("provider")
def provider_bookings():
    return get_provider_bookings()


@bookings_bp.route("/<booking_id>/status", methods=["PATCH"])
@jwt_required()
def update_status(booking_id):
    return update_booking_status(booking_id, request.get_json() or {})


@bookings_bp.route("/<booking_id>", methods=["DELETE"])
@require_role("customer")
def cancel(booking_id):
    return cancel_booking(booking_id)


@bookings_bp.route("/<booking_id>/review", methods=["POST"])
@require_role("customer")
@validate_json(ReviewSchema)
def review(booking_id):
    return submit_review(booking_id, request.validated_data)
