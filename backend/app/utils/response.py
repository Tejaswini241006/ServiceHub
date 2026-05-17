from flask import jsonify
from typing import Any, Optional


def success_response(data: Any = None, message: str = "Success", status_code: int = 200, meta: dict = None):
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    if meta:
        response["meta"] = meta
    return jsonify(response), status_code


def error_response(message: str = "An error occurred", status_code: int = 400, errors: Any = None):
    response = {"success": False, "message": message}
    if errors:
        response["errors"] = errors
    return jsonify(response), status_code


def paginated_response(data: list, total: int, page: int, per_page: int, message: str = "Success"):
    return success_response(
        data=data,
        message=message,
        meta={
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
            "has_next": page * per_page < total,
            "has_prev": page > 1,
        },
    )
