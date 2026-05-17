# ServiceHub 🔧

> **A production-grade home services marketplace** — connect customers with trusted service providers for cleaning, plumbing, electrical work, and more.

![ServiceHub](https://img.shields.io/badge/ServiceHub-v1.0-orange?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square)
![Flask](https://img.shields.io/badge/Flask-3.0-green?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Quick Start (Docker)](#quick-start-docker)
6. [Local Development Setup](#local-development-setup)
7. [Environment Variables](#environment-variables)
8. [API Documentation](#api-documentation)
9. [Database Schema](#database-schema)
10. [Authentication Flow](#authentication-flow)
11. [Testing](#testing)
12. [Folder Structure](#folder-structure)

---

## Project Overview

ServiceHub is an Urban Company-inspired marketplace where:

- **Customers** browse, search, and book home services (cleaning, plumbing, painting, etc.)
- **Providers** list their services, manage bookings, track earnings, and build their reputation
- **Admins** oversee the platform, approve providers, manage categories, and view analytics

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   Browser (React)                │
│   Vite · React Router · Tailwind · Recharts     │
└───────────────────┬──────────────────────────────┘
                    │  HTTP/JSON (Axios)
┌───────────────────▼──────────────────────────────┐
│               Nginx (reverse proxy)              │
│          /api/* → Flask  |  /* → SPA             │
└────────┬──────────────────────────────┬──────────┘
         │                              │
┌────────▼─────────┐       ┌────────────▼──────────┐
│   Flask 3 API    │       │   Celery Worker        │
│  JWT · Limiter   │       │   (email tasks)        │
│  Marshmallow     │       └────────────┬──────────┘
└────────┬─────────┘                    │
         │                              │
┌────────▼──────────────────────────────▼──────────┐
│                Redis 7 (broker + cache + JWT BL) │
└──────────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────┐
│             PostgreSQL 15 (primary store)         │
│   users · providers · services · bookings ·      │
│   categories · reviews                           │
└──────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer       | Technology                                         |
|-------------|--------------------------------------------------|
| Backend     | Python 3.11, Flask 3, SQLAlchemy, Flask-Migrate  |
| Auth        | Flask-JWT-Extended, bcrypt, Redis blacklist      |
| Database    | PostgreSQL 15                                    |
| Cache/Queue | Redis 7, Celery                                  |
| Validation  | Marshmallow, Yup                                 |
| Frontend    | React 18, Vite, Tailwind CSS v3                  |
| Charts      | Recharts                                         |
| Forms       | React Hook Form + Yup                            |
| DevOps      | Docker, Docker Compose, Nginx                    |

---

## Features

### Customer
- Register / login with JWT
- Browse and search services by category, price, keyword
- Book a service with date/time and address
- View and manage bookings (cancel, review)
- Leave star ratings and comments
- View booking history

### Provider
- Register and await admin approval
- Create, edit, delete service listings
- Upload service images (Pillow resize)
- View and act on booking requests (accept → start → complete)
- Dashboard with earnings, rating, stats

### Admin
- Platform analytics with revenue charts (Recharts)
- Approve / suspend providers
- Manage users and categories
- View all bookings with filters

### Platform
- JWT access (15 min) + refresh (7 days) tokens
- Redis-backed token blacklist on logout
- Role-based access control (RBAC decorators)
- Rate limiting via Flask-Limiter
- Celery async email tasks
- Pagination & filtering on all list endpoints
- Mobile-responsive UI

---

## Quick Start (Docker)

```bash
git clone <repo-url>
cd servicehub

# Start everything
docker compose up --build

# App is live at:
#   Frontend → http://localhost
#   Backend API → http://localhost:5000/api
```

Docker will automatically:
1. Start PostgreSQL and Redis
2. Run Flask migrations (`flask db upgrade`)
3. Seed the database with demo data
4. Start the Flask API server (gunicorn)
5. Start the Celery worker
6. Build and serve the React frontend via Nginx

### Demo Accounts

| Role     | Email                       | Password       |
|----------|-----------------------------|----------------|
| Admin    | admin@servicehub.com        | Admin@123      |
| Customer | customer1@example.com       | Customer@123   |
| Provider | rajesh@provider.com         | Provider@123   |

---

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node 20+
- PostgreSQL 15
- Redis 7

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure env
cp .env.example .env
# Edit .env with your DB/Redis credentials

# Run migrations
flask db init
flask db migrate -m "initial"
flask db upgrade

# Seed database
python seed.py

# Run dev server
python run.py
# API available at http://localhost:5000
```

### Frontend

```bash
cd frontend

npm install

# Dev server with HMR + API proxy
npm run dev
# Frontend at http://localhost:5173
```

### Celery worker (optional for local)

```bash
cd backend
celery -A app.tasks.email_tasks.celery_app worker --loglevel=info
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Description                         | Default                     |
|-----------------|-------------------------------------|-----------------------------|
| `FLASK_ENV`     | `development` / `production`        | `development`               |
| `SECRET_KEY`    | Flask secret key                    | *(required)*                |
| `JWT_SECRET_KEY`| JWT signing key                     | *(required)*                |
| `DATABASE_URL`  | PostgreSQL connection string        | `postgresql://...`          |
| `REDIS_URL`     | Redis connection string             | `redis://localhost:6379/0`  |
| `CORS_ORIGINS`  | Comma-separated allowed origins     | `http://localhost:5173`     |
| `UPLOAD_FOLDER` | Path for uploaded images            | `/tmp/uploads`              |
| `MAIL_SERVER`   | SMTP server                         | `smtp.gmail.com`            |
| `MAIL_USERNAME` | SMTP username                       | —                           |
| `MAIL_PASSWORD` | SMTP password                       | —                           |

---

## API Documentation

All endpoints return JSON:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": { "total": 100, "page": 1, "pages": 10 }
}
```

### Authentication

| Method | Endpoint             | Auth    | Description         |
|--------|----------------------|---------|---------------------|
| POST   | `/api/auth/register` | —       | Register user       |
| POST   | `/api/auth/login`    | —       | Login               |
| POST   | `/api/auth/logout`   | Bearer  | Logout (blacklist)  |
| POST   | `/api/auth/refresh`  | Refresh | Rotate tokens       |
| GET    | `/api/auth/me`       | Bearer  | Get current user    |

### Services

| Method | Endpoint                   | Auth     | Description              |
|--------|----------------------------|----------|--------------------------|
| GET    | `/api/services`            | —        | List services (paginated)|
| GET    | `/api/services/search`     | —        | Search services          |
| GET    | `/api/services/:id`        | —        | Get service detail       |
| POST   | `/api/services`            | Provider | Create service           |
| PUT    | `/api/services/:id`        | Provider | Update service           |
| DELETE | `/api/services/:id`        | Provider | Soft-delete service      |
| POST   | `/api/services/:id/image`  | Provider | Upload service image     |
| GET    | `/api/categories`          | —        | List categories          |

### Bookings

| Method | Endpoint                        | Auth     | Description           |
|--------|---------------------------------|----------|-----------------------|
| POST   | `/api/bookings`                 | Customer | Create booking        |
| GET    | `/api/bookings/my`              | Customer | My bookings           |
| GET    | `/api/bookings/provider`        | Provider | Provider bookings     |
| PATCH  | `/api/bookings/:id/status`      | Any      | Update status         |
| DELETE | `/api/bookings/:id`             | Customer | Cancel booking        |
| POST   | `/api/bookings/:id/review`      | Customer | Submit review         |

### Providers

| Method | Endpoint                        | Auth     | Description           |
|--------|---------------------------------|----------|-----------------------|
| GET    | `/api/providers/dashboard`      | Provider | Dashboard stats       |
| PUT    | `/api/providers/profile`        | Provider | Update profile        |
| PATCH  | `/api/providers/availability`   | Provider | Set availability      |
| GET    | `/api/providers/:id`            | —        | Public profile        |
| GET    | `/api/providers/:id/services`   | —        | Provider's services   |

### Admin

| Method | Endpoint                              | Auth  | Description         |
|--------|---------------------------------------|-------|---------------------|
| GET    | `/api/admin/users`                    | Admin | All users           |
| DELETE | `/api/admin/users/:id`                | Admin | Deactivate user     |
| GET    | `/api/admin/providers`                | Admin | All providers       |
| PATCH  | `/api/admin/providers/:id/approve`    | Admin | Approve provider    |
| PATCH  | `/api/admin/providers/:id/suspend`    | Admin | Suspend provider    |
| GET    | `/api/admin/bookings`                 | Admin | All bookings        |
| GET    | `/api/admin/stats`                    | Admin | Platform analytics  |
| POST   | `/api/admin/categories`               | Admin | Create category     |
| DELETE | `/api/admin/categories/:id`           | Admin | Delete category     |

### Query Parameters (list endpoints)

| Param        | Type    | Description                  |
|--------------|---------|------------------------------|
| `page`       | integer | Page number (default: 1)     |
| `per_page`   | integer | Items per page (max: 100)    |
| `q`          | string  | Full-text search query       |
| `category_id`| uuid    | Filter by category           |
| `status`     | string  | Filter by booking status     |
| `sort`       | string  | `price_asc`, `price_desc`, `created_at` |

---

## Database Schema

```
users ──────< bookings >────── services ──────< categories
  │                │                 │
  └──── provider ──┘                 │
           │                         │
           └──────< reviews >────────┘
```

### Booking Status Flow

```
pending ──► accepted ──► in_progress ──► completed
    │           │               │
    └───────────┴───────────────┴────► cancelled
```

---

## Authentication Flow

```
1. POST /api/auth/login → { access_token (15min), refresh_token (7d) }
2. Attach: Authorization: Bearer <access_token>
3. On 401 → POST /api/auth/refresh with refresh_token → new tokens
4. POST /api/auth/logout → JTI added to Redis blacklist
```

JWT Payload:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "customer",
  "name": "John Doe",
  "iat": 1700000000,
  "exp": 1700000900,
  "jti": "unique-token-id"
}
```

---

## Testing

### Backend (pytest)

```bash
cd backend
pip install pytest pytest-flask
pytest tests/ -v
```

Tests cover:
- Auth: register, login, duplicate email, wrong password, JWT protection
- Services: list, create, CRUD, RBAC
- Bookings: create, list, status transitions, review
- Admin: stats, user/provider management, RBAC

### Frontend (Vitest)

```bash
cd frontend
npm test
```

Tests cover:
- Status badge variant mapping
- Booking state machine transitions
- Pagination math
- Auth role helpers
- API response structure
- Price formatting

---

## Folder Structure

```
servicehub/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory, extensions
│   │   ├── config/config.py     # Dev/Prod/Test configs
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py          # User, Provider
│   │   │   ├── service.py       # Service, Category
│   │   │   ├── booking.py       # Booking + state machine
│   │   │   └── review.py        # Review
│   │   ├── routes/              # Flask Blueprints
│   │   ├── controllers/         # Business logic
│   │   ├── middleware/          # JWT + RBAC decorators
│   │   ├── utils/               # Response, pagination, validators
│   │   └── tasks/               # Celery email tasks
│   ├── tests/test_api.py        # pytest test suite
│   ├── seed.py                  # Database seeder
│   ├── run.py                   # Entry point
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/          # Home, Services, Login, Register
│   │   │   ├── customer/        # Dashboard, Bookings, Profile
│   │   │   ├── provider/        # Dashboard, Services, Requests
│   │   │   └── admin/           # Dashboard, Users, Providers, Bookings
│   │   ├── components/common/   # Navbar, UI components, ServiceCard
│   │   ├── context/             # AuthContext (JWT state)
│   │   ├── routes/              # ProtectedRoute (RBAC)
│   │   ├── services/api.js      # Axios client + interceptors
│   │   └── tests/app.test.js    # Vitest test suite
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Screenshots

> *Add screenshots after running the app*

| Page | Description |
|------|-------------|
| Home | Hero, categories grid, featured services |
| Services | Searchable/filterable service listings |
| Service Detail | Full info + booking form |
| Customer Dashboard | Stats + recent bookings |
| Provider Dashboard | Earnings + booking requests |
| Admin Dashboard | Revenue charts + platform stats |

---

## License

MIT © ServiceHub
