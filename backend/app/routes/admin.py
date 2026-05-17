from flask import Blueprint, request
from app.controllers.admin_ctrl import (
    get_all_users, delete_user, get_all_providers,
    approve_provider, suspend_provider, get_all_bookings,
    get_platform_stats, create_category, delete_category
)
from app.middleware.rbac import require_role

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/users", methods=["GET"])
@require_role("admin")
def users():
    return get_all_users()


@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@require_role("admin")
def remove_user(user_id):
    return delete_user(user_id)


@admin_bp.route("/providers", methods=["GET"])
@require_role("admin")
def providers():
    return get_all_providers()


@admin_bp.route("/providers/<provider_id>/approve", methods=["PATCH"])
@require_role("admin")
def approve(provider_id):
    return approve_provider(provider_id)


@admin_bp.route("/providers/<provider_id>/suspend", methods=["PATCH"])
@require_role("admin")
def suspend(provider_id):
    return suspend_provider(provider_id)


@admin_bp.route("/bookings", methods=["GET"])
@require_role("admin")
def bookings():
    return get_all_bookings()


@admin_bp.route("/stats", methods=["GET"])
@require_role("admin")
def stats():
    return get_platform_stats()


@admin_bp.route("/categories", methods=["POST"])
@require_role("admin")
def add_category():
    return create_category(request.get_json() or {})


@admin_bp.route("/categories/<category_id>", methods=["DELETE"])
@require_role("admin")
def remove_category(category_id):
    return delete_category(category_id)
