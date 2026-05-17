import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-prod")

    # Default to SQLite — no PostgreSQL installation needed
    _default_db = f"sqlite:///{os.path.join(BASE_DIR, 'servicehub.db')}"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", _default_db)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # SQLite-safe engine options (no pooling config needed for SQLite)
    _is_sqlite = SQLALCHEMY_DATABASE_URI.startswith("sqlite")
    SQLALCHEMY_ENGINE_OPTIONS = {} if _is_sqlite else {"pool_pre_ping": True, "pool_recycle": 300}

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-change-in-prod")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)     # longer expiry for local dev
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]

    # Redis — fully optional; empty string disables it
    REDIS_URL = os.environ.get("REDIS_URL", "")
    # Rate limiter falls back to in-process memory when Redis is absent
    RATELIMIT_STORAGE_URI = os.environ.get("REDIS_URL") or "memory://"

    # Upload folder inside project directory
    UPLOAD_FOLDER = os.environ.get(
        "UPLOAD_FOLDER", os.path.join(BASE_DIR, "uploads")
    )
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

    # Mail (optional — tasks just log if not configured)
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")

    # CORS — allow Vite dev server on both common ports
    CORS_ORIGINS = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
    ).split(",")

    # Pagination
    DEFAULT_PAGE_SIZE = 10
    MAX_PAGE_SIZE = 100


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    RATELIMIT_ENABLED = False


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
