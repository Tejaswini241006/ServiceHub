import re
from marshmallow import Schema, fields, validate, ValidationError, validates
from functools import wraps
from flask import request
from app.utils.response import error_response


class RegisterSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    phone = fields.Str(validate=validate.Length(max=20))
    role = fields.Str(validate=validate.OneOf(["customer", "provider"]), load_default="customer")

    @validates("password")
    def validate_password(self, value):
        if not re.search(r"[A-Z]", value):
            raise ValidationError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", value):
            raise ValidationError("Password must contain at least one digit")


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class ServiceSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=3, max=200))
    description = fields.Str(required=True, validate=validate.Length(min=10))
    price = fields.Float(required=True, validate=validate.Range(min=0.01))
    duration_mins = fields.Int(required=True, validate=validate.Range(min=15, max=480))
    category_id = fields.Str(required=True)


class BookingSchema(Schema):
    service_id = fields.Str(required=True)
    booking_date = fields.DateTime(required=True, format="iso")
    address = fields.Str(required=True, validate=validate.Length(min=10))
    notes = fields.Str(validate=validate.Length(max=500))


class ReviewSchema(Schema):
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    comment = fields.Str(validate=validate.Length(max=1000))


class ProviderProfileSchema(Schema):
    experience = fields.Int(validate=validate.Range(min=0, max=50))
    description = fields.Str(validate=validate.Length(max=1000))
    availability = fields.Dict()


def validate_json(schema_class):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            schema = schema_class()
            try:
                data = schema.load(request.get_json() or {})
                request.validated_data = data
            except ValidationError as e:
                return error_response("Validation failed", 422, e.messages)
            return f(*args, **kwargs)
        return wrapper
    return decorator
