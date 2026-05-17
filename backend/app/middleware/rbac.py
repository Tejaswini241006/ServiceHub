from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.utils.response import error_response
from app.models.user import User


def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return f(*args, **kwargs)
    return wrapper


def require_role(*roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")
            if user_role not in roles:
                return error_response("Insufficient permissions", 403)
            return f(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)
