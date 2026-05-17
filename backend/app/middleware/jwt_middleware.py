from datetime import datetime, timezone
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt
from app import redis_client


def create_tokens(user):
    additional_claims = {
        "email": user.email,
        "role": user.role,
        "name": user.name,
    }
    access_token = create_access_token(identity=user.id, additional_claims=additional_claims)
    refresh_token = create_refresh_token(identity=user.id, additional_claims=additional_claims)
    return access_token, refresh_token


def revoke_token(jti: str, exp: int):
    if redis_client is None:
        return
    now = int(datetime.now(timezone.utc).timestamp())
    ttl = max(exp - now, 0)
    if ttl > 0:
        redis_client.setex(f"blacklist:{jti}", ttl, "1")
