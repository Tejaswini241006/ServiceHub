from flask import request
from app.config.config import Config


def get_pagination_params():
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(
            int(request.args.get("per_page", Config.DEFAULT_PAGE_SIZE)),
            Config.MAX_PAGE_SIZE,
        )
    except (ValueError, TypeError):
        page, per_page = 1, Config.DEFAULT_PAGE_SIZE
    return page, per_page


def paginate_query(query, page: int, per_page: int):
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total
