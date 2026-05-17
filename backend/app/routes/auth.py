from flask import Blueprint
from flask_jwt_extended import jwt_required
from app import limiter
from app.controllers.auth_ctrl import register_user, login_user, logout_user, refresh_access_token, get_me
from app.utils.validators import validate_json, RegisterSchema, LoginSchema

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("5 per minute")
@validate_json(RegisterSchema)
def register():
    from flask import request
    return register_user(request.validated_data)


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
@validate_json(LoginSchema)
def login():
    from flask import request
    return login_user(request.validated_data)


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return logout_user()


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    return refresh_access_token()


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    return get_me()
