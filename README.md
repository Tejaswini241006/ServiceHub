# ServiceHub 🔧

> A full-stack home services marketplace — connect customers with trusted professionals for cleaning, plumbing, electrical work, and more.

---

## Screenshots

### 🏠 Home Page
![Home Page](screenshots/home.png)
*Hero section with search bar, category grid, and featured services*

### 📂 Browse Categories
![Categories](screenshots/categories.png)
*8 service categories — Cleaning, Plumbing, Electrician, Painting, Carpentry, AC & Appliances, Pest Control, Gardening*

### 🔐 Login
![Login](screenshots/login.png)
*JWT-based authentication with one-click demo account buttons*

### 📝 Register
![Register](screenshots/register.png)
*Role-based signup — choose between Customer or Provider*

### 👤 Customer Dashboard
![Customer Dashboard](screenshots/customer-dashboard.png)
*Booking stats (Total, Pending, Completed, Cancelled), quick actions, recent bookings*

### 📋 My Bookings
![My Bookings](screenshots/my-bookings.png)
*Full booking list with status filters, inline reviews, and cancellation*

### 🔧 Provider Dashboard
![Provider Dashboard](screenshots/provider-dashboard.png)
*Earnings, booking count, avg rating, and recent booking activity*

### 🛠️ Provider — My Services
![Provider Services](screenshots/provider-services.png)
*Create, edit, and delete service listings — full CRUD with modal forms*

### 📊 Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)
*Monthly revenue bar chart, bookings-by-status pie chart, live platform stats*

### 📁 Admin — All Bookings
![Admin Bookings](screenshots/admin-bookings.png)
*Platform-wide booking management with status filtering*

> **Note:** Place your actual screenshots in a `screenshots/` folder in the project root with the filenames above.

---

## Features

### Customer
- Register / login with JWT authentication
- Browse and search services by category, keyword, or price
- Book a service with date, time, and address
- Cancel bookings (while still pending or accepted)
- Leave star ratings and written reviews after completion
- View full booking history with status filters

### Provider
- Register and await admin approval before listing services
- Create, edit, and delete service listings with images
- Manage booking requests — Accept → Start Job → Complete
- Dashboard with total earnings, average rating, and booking stats
- View all incoming bookings with customer details

### Admin
- Platform-wide analytics with Recharts charts
  - Monthly revenue bar chart
  - Bookings-by-status donut chart
- Approve or suspend provider accounts
- View and deactivate users
- View all bookings across the platform
- Manage service categories

### Platform
- JWT access tokens (1 hr) + refresh tokens (7 days) with auto-rotation
- Role-based access control (Customer / Provider / Admin)
- Rate limiting on auth endpoints via Flask-Limiter
- Async email notifications via Celery tasks
- Pagination and filtering on all list endpoints
- SQLite by default — no database install required
- Optional Redis + PostgreSQL for production

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS v3 |
| **Routing** | React Router v6 |
| **Forms** | React Hook Form + Yup validation |
| **Charts** | Recharts |
| **HTTP Client** | Axios with JWT interceptors + auto-refresh |
| **Notifications** | React Hot Toast |
| **Backend** | Python 3.11, Flask 3 |
| **Database** | SQLite (default) / PostgreSQL 15 |
| **Auth** | Flask-JWT-Extended, bcrypt |
| **Cache / Queue** | Redis 7 + Celery (optional) |
| **Validation** | Marshmallow (backend), Yup (frontend) |
| **Image Processing** | Pillow |
| **Testing** | pytest + pytest-flask (backend), Vitest (frontend) |

---

## Quick Start

### Requirements

| Tool | Min Version | Download |
|------|-------------|----------|
| Python | 3.10+ | https://python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |

> **Windows tip:** During Python installation, tick ✅ **"Add Python to PATH"**

No Docker, no PostgreSQL, no Redis needed.

---

### Windows

**Option A — Double click (easiest)**
1. Extract the zip to any folder
2. Open the `servicehub` folder
3. Double-click **`START_HERE.bat`**
4. Two terminal windows open (backend + frontend)
5. Browser opens automatically at **http://localhost:5173**

**Option B — PowerShell**
```powershell
cd C:\path\to\servicehub
.\start.ps1
```
If blocked by execution policy, run once:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Option C — Manual (two terminals)**

Terminal 1 — Backend:
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python seed.py        # first time only
python run.py
```

Terminal 2 — Frontend:
```powershell
cd frontend
npm install           # first time only
npm run dev
```

### Mac / Linux
```bash
cd /path/to/servicehub
bash start.sh
```

---

### What happens on first run

1. Python virtual environment created (`.venv/`)
2. All Python packages installed from `requirements.txt`
3. `servicehub.db` (SQLite) created with all tables
4. Demo data seeded — users, services, bookings, reviews
5. npm packages installed
6. Flask starts on **http://localhost:5000**
7. Vite starts on **http://localhost:5173** ← open this

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🔑 Admin | admin@servicehub.com | Admin@123 |
| 🏠 Customer | customer1@example.com | Customer@123 |
| 🔧 Provider | rajesh@provider.com | Provider@123 |

These accounts also appear as one-click buttons on the Login page.

---

## Project Structure

```
servicehub/
│
├── START_HERE.bat          ← Windows: double-click to run
├── start.ps1               ← Windows PowerShell launcher
├── start.sh                ← Mac / Linux launcher
├── SETUP.md                ← Detailed troubleshooting guide
├── README.md               ← This file
│
├── backend/
│   ├── app/
│   │   ├── __init__.py         App factory, extensions wired up
│   │   ├── config/config.py    Dev / Prod / Test configs
│   │   ├── models/
│   │   │   ├── user.py         User + Provider models
│   │   │   ├── service.py      Service + Category models
│   │   │   ├── booking.py      Booking + status state machine
│   │   │   └── review.py       Review model
│   │   ├── routes/             Flask Blueprints
│   │   │   ├── auth.py
│   │   │   ├── services.py
│   │   │   ├── bookings.py
│   │   │   ├── providers.py
│   │   │   └── admin.py
│   │   ├── controllers/        Business logic (separated from routes)
│   │   ├── middleware/         JWT helpers + RBAC decorators
│   │   ├── utils/              Response builder, paginator, validators
│   │   └── tasks/              Celery async email tasks
│   ├── tests/
│   │   └── test_api.py         22 pytest tests
│   ├── seed.py                 Demo data seeder
│   ├── run.py                  Entry point
│   ├── requirements.txt
│   └── .env                    Local environment variables
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── public/         Home, Services, ServiceDetail, Login, Register
        │   ├── customer/       Dashboard, Bookings, Profile
        │   ├── provider/       Dashboard, Services, Requests
        │   └── admin/          Dashboard, Users, Providers, Bookings
        ├── components/
        │   └── common/         Navbar, UI kit (Card, Badge, Modal…), ServiceCard
        ├── context/
        │   └── AuthContext.jsx JWT state, login/logout, role helpers
        ├── routes/
        │   └── ProtectedRoute.jsx  Role-based route guard
        └── services/
            └── api.js          Axios client with auto-refresh interceptor
```

---

## API Reference

All endpoints return:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": { "total": 50, "page": 1, "pages": 5, "has_next": true }
}
```

### Auth Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register (customer or provider) |
| POST | `/api/auth/login` | — | Login → access + refresh tokens |
| POST | `/api/auth/logout` | Bearer | Revoke current token |
| POST | `/api/auth/refresh` | Refresh | Get new access token |
| GET | `/api/auth/me` | Bearer | Get logged-in user info |

### Service Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/services` | — | List services (search, filter, paginate) |
| GET | `/api/services/:id` | — | Service detail |
| POST | `/api/services` | Provider | Create service listing |
| PUT | `/api/services/:id` | Provider | Update listing |
| DELETE | `/api/services/:id` | Provider | Soft delete listing |
| GET | `/api/categories` | — | All active categories |

### Booking Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | Customer | Create booking |
| GET | `/api/bookings/my` | Customer | My bookings (filterable) |
| GET | `/api/bookings/provider` | Provider | Incoming bookings |
| PATCH | `/api/bookings/:id/status` | Any | Update booking status |
| DELETE | `/api/bookings/:id` | Customer | Cancel booking |
| POST | `/api/bookings/:id/review` | Customer | Submit review |

### Provider Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/providers/dashboard` | Provider | Stats + recent bookings |
| PUT | `/api/providers/profile` | Provider | Update profile |
| GET | `/api/providers/:id` | — | Public provider profile |

### Admin Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Platform analytics |
| GET | `/api/admin/users` | Admin | All users (searchable) |
| DELETE | `/api/admin/users/:id` | Admin | Deactivate user |
| GET | `/api/admin/providers` | Admin | All providers (filterable) |
| PATCH | `/api/admin/providers/:id/approve` | Admin | Approve provider |
| PATCH | `/api/admin/providers/:id/suspend` | Admin | Suspend provider |
| GET | `/api/admin/bookings` | Admin | All bookings |

### Booking Status Flow
```
pending ──► accepted ──► in_progress ──► completed
   │            │              │
   └────────────┴──────────────┴──────► cancelled
```

### Query Parameters (list endpoints)
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default: 1) |
| `per_page` | int | Items per page (max: 100) |
| `q` | string | Search query (title, description) |
| `category_id` | string | Filter by category |
| `status` | string | Filter by booking status |
| `sort` | string | `price_asc`, `price_desc`, `created_at` |

---

## Environment Variables

`backend/.env`:
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# Database — SQLite is used by default (no install needed)
# To use PostgreSQL instead, uncomment:
# DATABASE_URL=postgresql://user:password@localhost:5432/servicehub

# Redis — optional, leave blank to run without it
REDIS_URL=

# CORS — allow Vite dev server
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Running Tests

### Backend — pytest (22 tests)
```bash
cd backend

# Activate virtual environment
.venv\Scripts\activate     # Windows
source .venv/bin/activate  # Mac/Linux

pytest tests/ -v
```

Tests cover:
- **Auth:** register, login, duplicate email, wrong password, JWT protection
- **Services:** list, get, create as provider, RBAC (customer blocked)
- **Bookings:** create, list, provider bookings, status filter
- **Admin:** stats, users, providers, approve, RBAC (customer blocked)

### Frontend — Vitest
```bash
cd frontend
npm test
```

Tests cover: status badge mapping, booking state machine, pagination math, auth role helpers, API response shapes, price formatting.

---

## Troubleshooting

**"python is not recognized"**
Reinstall Python from https://python.org — tick "Add Python to PATH". Restart terminal.

**"npm is not recognized"**
Install Node.js LTS from https://nodejs.org. Restart terminal.

**Port 5000 or 5173 already in use**
```powershell
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**PowerShell script blocked**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Frontend can't reach the API (blank page / network error)**
Check that the backend terminal shows `Running on http://0.0.0.0:5000`.
Visit http://localhost:5000/api/health — should return `{"status":"ok"}`.

**Reset / wipe the database**
```bash
cd backend
del servicehub.db   # Windows
rm servicehub.db    # Mac/Linux
python seed.py      # re-seed fresh demo data
```

---

## License

MIT © 2026 ServiceHub
