import pytest
import json
from app import create_app, db as _db
from app.models.user import User, Provider
from app.models.service import Category, Service
from app.models.booking import Booking


@pytest.fixture(scope="session")
def app():
    app = create_app("testing")
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture(scope="session")
def client(app):
    return app.test_client()


@pytest.fixture(scope="session")
def db(app):
    return _db


# Store only primitive IDs — avoids DetachedInstanceError across sessions
@pytest.fixture(scope="session")
def seed_data(app, db):
    with app.app_context():
        cat = Category(name="Test Cleaning", icon="sparkles")
        db.session.add(cat)

        admin = User(name="Admin", email="admin@test.com", role="admin")
        admin.set_password("Admin@123")
        db.session.add(admin)

        customer = User(name="Customer", email="customer@test.com", role="customer")
        customer.set_password("Customer@123")
        db.session.add(customer)

        prov_user = User(name="Provider", email="provider@test.com", role="provider")
        prov_user.set_password("Provider@123")
        db.session.add(prov_user)
        db.session.flush()

        provider = Provider(
            user_id=prov_user.id,
            is_approved=True,
            experience=3,
            description="Test provider",
        )
        db.session.add(provider)
        db.session.flush()

        service = Service(
            provider_id=provider.id,
            category_id=cat.id,
            title="Test Cleaning",
            description="A thorough test cleaning service",
            price=999.0,
            duration_mins=90,
        )
        db.session.add(service)
        db.session.commit()

        # Return plain IDs — never ORM objects
        return {
            "category_id": cat.id,
            "provider_id": provider.id,
            "service_id": service.id,
        }


def get_token(client, email, password):
    resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
        content_type="application/json",
    )
    return resp.get_json()["data"]["access_token"]


# ── Auth ──────────────────────────────────────────────────────────────────────

class TestAuth:
    def test_register_customer(self, client):
        resp = client.post("/api/auth/register", json={
            "name": "New User", "email": "newuser@test.com", "password": "NewUser@123",
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["success"] is True
        assert "access_token" in data["data"]

    def test_register_duplicate_email(self, client):
        client.post("/api/auth/register", json={
            "name": "Dup", "email": "dup@test.com", "password": "Dup@1234567",
        })
        resp = client.post("/api/auth/register", json={
            "name": "Dup2", "email": "dup@test.com", "password": "Dup@1234567",
        })
        assert resp.status_code == 409

    def test_login_success(self, client, seed_data):
        resp = client.post("/api/auth/login", json={
            "email": "customer@test.com", "password": "Customer@123",
        })
        assert resp.status_code == 200
        assert resp.get_json()["data"]["user"]["role"] == "customer"

    def test_login_wrong_password(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "customer@test.com", "password": "WrongPassword",
        })
        assert resp.status_code == 401

    def test_get_me(self, client, seed_data):
        token = get_token(client, "customer@test.com", "Customer@123")
        resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

    def test_unauthenticated_me(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401


# ── Services ──────────────────────────────────────────────────────────────────

class TestServices:
    def test_list_services_public(self, client):
        resp = client.get("/api/services")
        assert resp.status_code == 200
        assert "data" in resp.get_json()

    def test_get_categories_public(self, client):
        resp = client.get("/api/categories")
        assert resp.status_code == 200
        assert resp.get_json()["success"] is True

    def test_create_service_provider(self, client, seed_data):
        token = get_token(client, "provider@test.com", "Provider@123")
        resp = client.post(
            "/api/services",
            json={
                "title": "New Service",
                "description": "This is a detailed service description",
                "price": 599.0,
                "duration_mins": 60,
                "category_id": seed_data["category_id"],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 201

    def test_create_service_customer_forbidden(self, client):
        token = get_token(client, "customer@test.com", "Customer@123")
        resp = client.post(
            "/api/services",
            json={"title": "Hack", "description": "desc", "price": 100, "duration_mins": 60, "category_id": "x"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    def test_search_services(self, client):
        resp = client.get("/api/services/search?q=Test")
        assert resp.status_code == 200


# ── Bookings ──────────────────────────────────────────────────────────────────

class TestBookings:
    def test_create_booking(self, client, seed_data):
        token = get_token(client, "customer@test.com", "Customer@123")
        resp = client.post(
            "/api/bookings",
            json={
                "service_id": seed_data["service_id"],
                "booking_date": "2030-01-15T10:00:00",
                "address": "123 Main Street, Test City, State 110001",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 201
        assert resp.get_json()["data"]["status"] == "pending"

    def test_provider_cannot_book(self, client, seed_data):
        token = get_token(client, "provider@test.com", "Provider@123")
        resp = client.post(
            "/api/bookings",
            json={
                "service_id": seed_data["service_id"],
                "booking_date": "2030-01-15T10:00:00",
                "address": "Some address here in the city area",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    def test_get_my_bookings(self, client):
        token = get_token(client, "customer@test.com", "Customer@123")
        resp = client.get("/api/bookings/my", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

    def test_get_provider_bookings(self, client):
        token = get_token(client, "provider@test.com", "Provider@123")
        resp = client.get("/api/bookings/provider", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

    def test_booking_status_filter(self, client):
        token = get_token(client, "customer@test.com", "Customer@123")
        resp = client.get("/api/bookings/my?status=pending", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200


# ── Admin ─────────────────────────────────────────────────────────────────────

class TestAdmin:
    def test_admin_get_stats(self, client, seed_data):
        token = get_token(client, "admin@test.com", "Admin@123")
        resp = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "users" in data
        assert "bookings" in data
        assert "revenue" in data

    def test_admin_get_users(self, client):
        token = get_token(client, "admin@test.com", "Admin@123")
        resp = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

    def test_customer_cannot_access_admin(self, client):
        token = get_token(client, "customer@test.com", "Customer@123")
        resp = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 403

    def test_admin_approve_provider(self, client, seed_data):
        token = get_token(client, "admin@test.com", "Admin@123")
        resp = client.patch(
            f"/api/admin/providers/{seed_data['provider_id']}/approve",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200

    def test_admin_get_providers(self, client):
        token = get_token(client, "admin@test.com", "Admin@123")
        resp = client.get("/api/admin/providers", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

    def test_admin_get_bookings(self, client):
        token = get_token(client, "admin@test.com", "Admin@123")
        resp = client.get("/api/admin/bookings", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
