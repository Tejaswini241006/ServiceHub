import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address, default_limits=[])

redis_client = None


def create_app(config_name=None):
    global redis_client

    app = Flask(__name__)

    from app.config.config import config
    config_name = config_name or os.environ.get("FLASK_ENV", "development")
    app.config.from_object(config.get(config_name, config["default"]))

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )
    limiter.init_app(app)

    # Optional Redis for JWT blacklist
    redis_url = app.config.get("REDIS_URL", "")
    if redis_url:
        try:
            import redis as redis_lib
            redis_client = redis_lib.from_url(redis_url, decode_responses=True)
            redis_client.ping()
            app.logger.info("Redis connected.")
        except Exception as e:
            app.logger.warning(f"Redis unavailable: {e}. JWT blacklist disabled.")
            redis_client = None
    else:
        redis_client = None

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        if redis_client is None:
            return False
        jti = jwt_payload.get("jti")
        return redis_client.get(f"blacklist:{jti}") is not None

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        from app.utils.response import error_response
        return error_response("Token has been revoked", 401)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        from app.utils.response import error_response
        return error_response("Token has expired", 401)

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        from app.utils.response import error_response
        return error_response("Invalid token", 401)

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        from app.utils.response import error_response
        return error_response("Authentication required", 401)

    from app.routes.auth import auth_bp
    from app.routes.services import services_bp
    from app.routes.bookings import bookings_bp
    from app.routes.providers import providers_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(services_bp, url_prefix="/api")
    app.register_blueprint(bookings_bp, url_prefix="/api/bookings")
    app.register_blueprint(providers_bp, url_prefix="/api/providers")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    with app.app_context():
        from app.models import user, service, booking, review  # noqa: F401

    from flask import send_from_directory

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.route("/api/health")
    def health():
        db_type = "sqlite" if "sqlite" in app.config["SQLALCHEMY_DATABASE_URI"] else "postgres"
        return {"status": "ok", "service": "ServiceHub API", "db": db_type}

    return app
