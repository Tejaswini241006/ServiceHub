from flask import current_app
from flask_jwt_extended import get_jwt_identity, get_jwt, create_access_token
from app import db
from app.models.user import User, Provider
from app.middleware.jwt_middleware import create_tokens, revoke_token
from app.utils.response import success_response, error_response


def register_user(data: dict):
    if User.query.filter_by(email=data["email"].lower()).first():
        return error_response("Email already registered", 409)

    user = User(
        name=data["name"],
        email=data["email"].lower(),
        phone=data.get("phone"),
        role=data.get("role", "customer"),
    )
    user.set_password(data["password"])
    db.session.add(user)

    if user.role == "provider":
        provider = Provider(user=user)
        db.session.add(provider)

    db.session.commit()

    access_token, refresh_token = create_tokens(user)
    return success_response(
        data={
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token,
        },
        message="Registration successful",
        status_code=201,
    )


def login_user(data: dict):
    user = User.query.filter_by(email=data["email"].lower()).first()

    if not user or not user.check_password(data["password"]):
        return error_response("Invalid email or password", 401)

    if not user.is_active:
        return error_response("Account is deactivated", 403)

    access_token, refresh_token = create_tokens(user)
    return success_response(
        data={
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token,
        },
        message="Login successful",
    )


def logout_user():
    claims = get_jwt()
    jti = claims.get("jti")
    exp = claims.get("exp", 0)
    revoke_token(jti, exp)
    return success_response(message="Logged out successfully")


def refresh_access_token():
    user_id = get_jwt_identity()
    claims = get_jwt()

    # Revoke old refresh token
    jti = claims.get("jti")
    exp = claims.get("exp", 0)
    revoke_token(jti, exp)

    user = User.query.get(user_id)
    if not user or not user.is_active:
        return error_response("User not found or inactive", 404)

    access_token, refresh_token = create_tokens(user)
    return success_response(
        data={"access_token": access_token, "refresh_token": refresh_token},
        message="Token refreshed",
    )


def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)

    data = user.to_dict()
    if user.role == "provider" and user.provider_profile:
        data["provider_profile"] = user.provider_profile.to_dict()
    return success_response(data=data)
