from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.controllers.service_ctrl import (
    get_services, get_service, create_service, update_service,
    delete_service, upload_service_image, get_categories
)
from app.middleware.rbac import require_role
from app.utils.validators import validate_json, ServiceSchema

services_bp = Blueprint("services", __name__)


@services_bp.route("/services", methods=["GET"])
def list_services():
    return get_services()


@services_bp.route("/services/search", methods=["GET"])
def search_services():
    return get_services()


@services_bp.route("/services/<service_id>", methods=["GET"])
def get_one_service(service_id):
    return get_service(service_id)


@services_bp.route("/services", methods=["POST"])
@require_role("provider")
@validate_json(ServiceSchema)
def create():
    return create_service(request.validated_data)


@services_bp.route("/services/<service_id>", methods=["PUT"])
@require_role("provider")
@validate_json(ServiceSchema)
def update(service_id):
    return update_service(service_id, request.validated_data)


@services_bp.route("/services/<service_id>", methods=["DELETE"])
@require_role("provider")
def delete(service_id):
    return delete_service(service_id)


@services_bp.route("/services/<service_id>/image", methods=["POST"])
@require_role("provider")
def upload_image(service_id):
    return upload_service_image(service_id)


@services_bp.route("/categories", methods=["GET"])
def categories():
    return get_categories()
