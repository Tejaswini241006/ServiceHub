import os
from flask import request, current_app
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models.service import Service, Category
from app.models.user import Provider
from app.utils.response import success_response, error_response, paginated_response
from app.utils.pagination import get_pagination_params, paginate_query
from PIL import Image
import uuid


def get_services():
    page, per_page = get_pagination_params()
    q = request.args.get("q", "").strip()
    category_id = request.args.get("category_id")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    sort = request.args.get("sort", "created_at")

    query = Service.query.filter_by(is_active=True)

    if q:
        query = query.filter(
            db.or_(
                Service.title.ilike(f"%{q}%"),
                Service.description.ilike(f"%{q}%"),
            )
        )
    if category_id:
        query = query.filter_by(category_id=category_id)
    if min_price is not None:
        query = query.filter(Service.price >= min_price)
    if max_price is not None:
        query = query.filter(Service.price <= max_price)

    # Sort
    sort_map = {
        "price_asc": Service.price.asc(),
        "price_desc": Service.price.desc(),
        "created_at": Service.created_at.desc(),
    }
    query = query.order_by(sort_map.get(sort, Service.created_at.desc()))

    items, total = paginate_query(query, page, per_page)
    return paginated_response([s.to_dict() for s in items], total, page, per_page)


def get_service(service_id: str):
    service = Service.query.get(service_id)
    if not service or not service.is_active:
        return error_response("Service not found", 404)
    return success_response(data=service.to_dict())


def create_service(data: dict):
    user_id = get_jwt_identity()
    provider = Provider.query.filter_by(user_id=user_id).first()

    if not provider:
        return error_response("Provider profile not found", 404)
    if not provider.is_approved:
        return error_response("Your account is pending approval", 403)
    if provider.is_suspended:
        return error_response("Your account is suspended", 403)

    category = Category.query.get(data["category_id"])
    if not category or not category.is_active:
        return error_response("Invalid category", 400)

    service = Service(
        provider_id=provider.id,
        category_id=data["category_id"],
        title=data["title"],
        description=data["description"],
        price=data["price"],
        duration_mins=data["duration_mins"],
    )
    db.session.add(service)
    db.session.commit()
    return success_response(data=service.to_dict(), message="Service created", status_code=201)


def update_service(service_id: str, data: dict):
    user_id = get_jwt_identity()
    provider = Provider.query.filter_by(user_id=user_id).first()

    service = Service.query.get(service_id)
    if not service:
        return error_response("Service not found", 404)
    if service.provider_id != provider.id:
        return error_response("Unauthorized", 403)

    for field in ["title", "description", "price", "duration_mins", "category_id"]:
        if field in data:
            setattr(service, field, data[field])

    db.session.commit()
    return success_response(data=service.to_dict(), message="Service updated")


def delete_service(service_id: str):
    user_id = get_jwt_identity()
    provider = Provider.query.filter_by(user_id=user_id).first()

    service = Service.query.get(service_id)
    if not service:
        return error_response("Service not found", 404)
    if service.provider_id != provider.id:
        return error_response("Unauthorized", 403)

    service.is_active = False
    db.session.commit()
    return success_response(message="Service deleted")


def upload_service_image(service_id: str):
    user_id = get_jwt_identity()
    provider = Provider.query.filter_by(user_id=user_id).first()
    service = Service.query.get(service_id)

    if not service or service.provider_id != provider.id:
        return error_response("Service not found or unauthorized", 404)

    if "image" not in request.files:
        return error_response("No image provided", 400)

    file = request.files["image"]
    if file.filename == "":
        return error_response("No file selected", 400)

    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in current_app.config["ALLOWED_EXTENSIONS"]:
        return error_response("Invalid file type", 400)

    filename = f"{uuid.uuid4()}.{ext}"
    upload_path = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_path, exist_ok=True)
    filepath = os.path.join(upload_path, filename)

    img = Image.open(file)
    img.thumbnail((800, 600))
    img.save(filepath)

    service.image_url = f"/uploads/{filename}"
    db.session.commit()
    return success_response(data={"image_url": service.image_url}, message="Image uploaded")


def get_categories():
    cats = Category.query.filter_by(is_active=True).all()
    return success_response(data=[c.to_dict() for c in cats])
