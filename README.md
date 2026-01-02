# ToolShare

ToolShare is a peer-to-peer equipment rental platform. It allows users to rent out their idle tools to neighbors or find professional-grade equipment for their projects at a fraction of the cost.

## 🚀 Features

-   **User Authentication**: Secure Login & Registration (JWT).
-   **Marketplace**: Browse, search, and filter tools.
-   **Dashboard**: Manage your tools, track rentals, and view earnings.
-   **Reservations**: Instant booking with automatic price calculation and availability checks.
-   **Admin Console**: Powerful administration tools for user management, tool moderation, and system monitoring.
-   **Reviews**: Rate and review tools after rental.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 14, TailwindCSS, Lucide Icons.
-   **Backend**: FastAPI, PostgreSQL, Pydantic, Psycopg 3.
-   **Database**: PostgreSQL (with Triggers, Functions, and Views).

## 📂 Project Structure

The project has been refactored for scalability:

```
toolshare/
├── backend/
│   ├── routers/        # API Endpoints (Auth, Tools, Users, Admin, etc.)
│   ├── models.py       # Pydantic Data Models
│   ├── database.py     # Database Connection
│   ├── dependencies.py # Shared Dependencies (Auth)
│   ├── main.py         # Application Entry Point
│   └── setup_db.py     # Database Initialization Script
├── frontend/
│   ├── app/            # Next.js Pages (Dashboard, Admin, Tools)
│   ├── components/     # Reusable Components (Navbar)
│   └── ...
```

## ⚡ Getting Started

### Prerequisites

-   Python 3.9+
-   Node.js 18+
-   PostgreSQL (or Docker)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup Database
python setup_db.py

# Run Server
uvicorn main:app --reload
```

The API will run at `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The App will run at `http://localhost:3000`.

## 🔐 Admin Access

A seeded admin account is available:

-   **Email**: `admin@toolshare.com`
-   **Password**: `admin123`

Access the Admin Console via the dashboard or by appending `/admin` to the URL.
