from datetime import datetime, timezone, timedelta
from flask import request
from app import db
from app.models.user import User, Provider
from app.models.booking import Booking
from app.models.service import Category, Service
from app.models.review import Review
from app.utils.response import success_response, error_response, paginated_response
from app.utils.pagination import get_pagination_params, paginate_query


def get_all_users():
    page, per_page = get_pagination_params()
    role = request.args.get("role")
    q = request.args.get("q", "")

    query = User.query
    if role:
        query = query.filter_by(role=role)
    if q:
        query = query.filter(
            db.or_(User.name.ilike(f"%{q}%"), User.email.ilike(f"%{q}%"))
        )
    query = query.order_by(User.created_at.desc())
    items, total = paginate_query(query, page, per_page)
    return paginated_response([u.to_dict() for u in items], total, page, per_page)


def delete_user(user_id: str):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)
    user.is_active = False
    db.session.commit()
    return success_response(message="User deactivated")


def get_all_providers():
    page, per_page = get_pagination_params()
    approved = request.args.get("approved")

    query = Provider.query
    if approved is not None:
        query = query.filter_by(is_approved=approved.lower() == "true")
    query = query.order_by(Provider.created_at.desc())
    items, total = paginate_query(query, page, per_page)
    return paginated_response([p.to_dict() for p in items], total, page, per_page)


def approve_provider(provider_id: str):
    provider = Provider.query.get(provider_id)
    if not provider:
        return error_response("Provider not found", 404)
    provider.is_approved = True
    provider.is_suspended = False
    db.session.commit()
    return success_response(data=provider.to_dict(), message="Provider approved")


def suspend_provider(provider_id: str):
    provider = Provider.query.get(provider_id)
    if not provider:
        return error_response("Provider not found", 404)
    provider.is_approved = False
    provider.is_suspended = True
    db.session.commit()
    return success_response(data=provider.to_dict(), message="Provider suspended")


def get_all_bookings():
    page, per_page = get_pagination_params()
    status = request.args.get("status")

    query = Booking.query
    if status:
        query = query.filter_by(status=status)
    query = query.order_by(Booking.created_at.desc())
    items, total = paginate_query(query, page, per_page)
    return paginated_response([b.to_dict() for b in items], total, page, per_page)


def get_platform_stats():
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)

    total_users = User.query.count()
    total_providers = Provider.query.count()
    approved_providers = Provider.query.filter_by(is_approved=True).count()
    total_bookings = Booking.query.count()
    completed_bookings = Booking.query.filter_by(status="completed").count()
    total_revenue = db.session.query(db.func.sum(Booking.total_amount)).filter_by(status="completed").scalar() or 0
    total_services = Service.query.filter_by(is_active=True).count()

    # Monthly revenue (last 6 months)
    monthly_revenue = []
    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        revenue = (
            db.session.query(db.func.sum(Booking.total_amount))
            .filter(
                Booking.status == "completed",
                Booking.created_at >= month_start,
                Booking.created_at < month_end,
            )
            .scalar() or 0
        )
        monthly_revenue.append({
            "month": month_start.strftime("%b %Y"),
            "revenue": round(revenue, 2),
        })

    # Bookings by status
    statuses = ["pending", "accepted", "in_progress", "completed", "cancelled"]
    bookings_by_status = []
    for s in statuses:
        count = Booking.query.filter_by(status=s).count()
        bookings_by_status.append({"status": s, "count": count})

    return success_response(data={
        "users": {
            "total": total_users,
            "customers": User.query.filter_by(role="customer").count(),
            "providers": total_providers,
            "approved_providers": approved_providers,
        },
        "bookings": {
            "total": total_bookings,
            "completed": completed_bookings,
            "by_status": bookings_by_status,
        },
        "revenue": {
            "total": round(total_revenue, 2),
            "monthly": monthly_revenue,
        },
        "services": {
            "total": total_services,
        },
    })


def create_category(data: dict):
    if Category.query.filter_by(name=data["name"]).first():
        return error_response("Category already exists", 409)

    category = Category(
        name=data["name"],
        icon=data.get("icon", "tool"),
        description=data.get("description"),
    )
    db.session.add(category)
    db.session.commit()
    return success_response(data=category.to_dict(), message="Category created", status_code=201)


def delete_category(category_id: str):
    category = Category.query.get(category_id)
    if not category:
        return error_response("Category not found", 404)
    category.is_active = False
    db.session.commit()
    return success_response(message="Category deactivated")
