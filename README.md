<div align="center">

<img src="leadsense-frontend/public/favicon.svg" alt="LeadSense Logo" width="72" height="72" />

# LeadSense

**A modern, multi-tenant CRM and sales pipeline platform**

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Configuration](#-configuration) · [API](#-api-reference) · [Deployment](#-deployment)

</div>

---

## Overview

LeadSense is a production-ready, multi-tenant CRM platform built for sales teams. It provides full lead lifecycle management — from capture to close — with role-based access control, activity tracking, email invitations, audit logging, and a real-time dashboard.

Built on **Clean Architecture** with a .NET 10 Minimal API backend and a React 19 + TypeScript frontend, LeadSense is designed to be self-hosted via Docker or deployed to any cloud provider.

---

## ✨ Features

### 🏢 Multi-Tenancy
- Complete tenant isolation — every lead, activity, and user is scoped to their tenant
- SuperAdmin platform management across all tenants
- Per-tenant subscription plans with lead limits

### 👥 Role-Based Access Control
| Role | Capabilities |
|---|---|
| **SuperAdmin** | Manage tenants, plans, subscriptions, platform analytics |
| **TenantAdmin** | Manage users, view audit logs, access all leads and reports |
| **User** | Manage assigned leads, log activities, view calendar |

### 📋 Lead Management
- Create, update, assign, and delete leads
- Track lead status through the full pipeline: `New → Contacted → Qualified → Proposal Sent → Won / Lost`
- Lead source tracking (Website, Referral, Social Media, Cold Call, etc.)
- Company name and initial notes on creation

### 📅 Activity Tracking
- Log calls, emails, meetings, demos, WhatsApp messages, notes, and follow-ups
- Schedule activities with due dates
- Complete, cancel, or reschedule activities
- Overdue activity alerts
- Activity statistics dashboard

### 📊 Dashboard & Analytics
- Live pipeline statistics per tenant
- Activity completion rates
- Overdue activity tracking
- Platform-wide analytics for SuperAdmin

### 🔒 Security
- JWT Bearer authentication with configurable expiry
- BCrypt password hashing
- Sliding-window rate limiting on login (10 req/min per IP)
- Tenant isolation enforced at every endpoint via JWT claims
- Secure SuperAdmin seeder — one-time random credential generation

### 📧 Email
- Invitation emails via [Resend](https://resend.com)
- Password reset flow
- Graceful degradation — app continues working if email is unconfigured

### 🔍 Audit Logging
- Every significant action is recorded with user, tenant, entity, and timestamp
- TenantAdmin can view full audit history
- Per-entity audit trail (e.g., all changes to a specific lead)

---

## 🏗 Architecture

```
LeadSense/
├── src/
│   ├── Domain/                          # Entities, enums, Result/Error pattern
│   ├── Application/                     # Use cases, interfaces, services
│   ├── Infrastructure/                  # EF Core, JWT, Resend email, repositories
│   └── Web/LeadSense.Api/               # Minimal API endpoints, middleware
├── leadsense-frontend/                  # React 19 + Vite + TanStack Query + Tailwind
│   └── src/
│       ├── api/         # Axios modules per domain
│       ├── context/     # Auth context (JWT decode + roles)
│       ├── hooks/       # TanStack Query wrappers
│       ├── pages/       # ~20 pages
│       ├── components/  # UI primitives + domain components
│       └── types/       # Shared enums and API types
├── tests/LeadSense.Tests/               # xUnit unit tests
├── tools/ResetPassword/                 # CLI utility for password resets
├── docker-compose.yml
└── .env.example
```

### Backend Stack

| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 10 Minimal API |
| ORM | Entity Framework Core 10 + Npgsql |
| Database | PostgreSQL 16 |
| Auth | JWT Bearer + BCrypt.Net |
| Email | Resend REST API |
| Docs | Swagger / OpenAPI (dev only) |
| Pattern | Clean Architecture, Result/Error, CQRS-lite |

### Frontend Stack

| Concern | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Data fetching | TanStack Query v5 |
| HTTP client | Axios |
| Routing | React Router v7 |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (recommended)
- or: [.NET 10 SDK](https://dotnet.microsoft.com/download) + [Node.js 20+](https://nodejs.org) + PostgreSQL 16

### Docker (recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Sanket2329/LeadSense.git
cd LeadSense

# 2. Create your environment file
cp .env.example .env
# Edit .env with your values (see Configuration section)

# 3. Start everything
docker-compose up --build

# App is now running at:
#   Frontend  →  http://localhost
#   API       →  http://localhost:8080
```

On first startup, the API will:
- Run all database migrations automatically
- Seed default roles and plans
- Create a **SuperAdmin** account and print the credentials **once** in the API logs

```
╔══════════════════════════════════════════╗
║       SUPER ADMIN CREDENTIALS            ║
║  Email   : admin@leadsense.com           ║
║  Password: <randomly generated>          ║
║  Save this password — it will not be     ║
║  shown again.                            ║
╚══════════════════════════════════════════╝
```

> **Save the generated password immediately** — it is hashed and never stored in plain text.

---

### Local Development (without Docker)

**Backend**

```bash
cd src/Web/LeadSense.Api

# Set secrets via dotnet user-secrets (never commit real values)
dotnet user-secrets set "Jwt:Key" "your-32-char-secret-key"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=localhost;Port=5432;Database=LeadSenseDb;Username=postgres;Password=yourpassword"
dotnet user-secrets set "Resend:ApiKey" "re_your_api_key"

# Run
dotnet run
# API available at http://localhost:5017
# Swagger UI at http://localhost:5017/swagger
```

**Frontend**

```bash
cd leadsense-frontend

npm install
npm run dev
# Frontend available at http://localhost:3000
# Proxies /api → http://localhost:5017 automatically
```

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and fill in all values before running Docker.

```env
# PostgreSQL — use a strong, unique password
POSTGRES_PASSWORD=your_strong_password

# JWT signing key — MUST be at least 32 random characters
# Generate: openssl rand -base64 32
JWT_KEY=your_32_char_secret_key

# Resend transactional email
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=LeadSense <noreply@yourdomain.com>

# Public URL of your frontend (used in invitation email links)
FRONTEND_URL=https://yourdomain.com
```

> **Note:** If `RESEND_API_KEY` is not set, the app will log a warning and skip email sending — it will not crash. You can use `onboarding@resend.dev` as `RESEND_FROM_EMAIL` for testing without domain verification.

### Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_PASSWORD` | ✅ | PostgreSQL password |
| `JWT_KEY` | ✅ | JWT signing key, minimum 32 characters |
| `RESEND_API_KEY` | ⚠️ Optional | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | ⚠️ Optional | Sender address (must be from a verified domain) |
| `FRONTEND_URL` | ✅ | Public frontend URL used in email links |

---

## 🔑 User Roles & Permissions

```
SuperAdmin
  ├── Create / manage tenants
  ├── Assign subscription plans
  ├── View platform-wide analytics
  └── Create TenantAdmin users

TenantAdmin
  ├── Invite / manage users within tenant
  ├── View all leads and activities
  ├── Access audit logs and reports
  └── All User permissions

User
  ├── Create and manage leads
  ├── Log and track activities
  ├── View assigned leads (My Leads)
  └── View calendar of scheduled activities
```

---

## 📡 API Reference

The API follows REST conventions. All endpoints (except `/api/auth/login` and invitation acceptance) require a Bearer token.

### Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@leadsense.com",
  "password": "your_password"
}
```

**Rate limited:** 10 requests per minute per IP on the login endpoint.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Login, returns JWT |
| `GET` | `/api/leads` | User+ | Get all tenant leads |
| `POST` | `/api/leads` | User+ | Create a lead |
| `PUT` | `/api/leads/{id}` | User+ | Update a lead |
| `PUT` | `/api/leads/{id}/status` | User+ | Update lead status |
| `PUT` | `/api/leads/{id}/assign` | TenantAdmin | Assign lead to user |
| `DELETE` | `/api/leads/{id}` | TenantAdmin | Delete a lead |
| `GET` | `/api/leads/mine` | User | Get my assigned leads |
| `GET` | `/api/leads/activities/overdue` | User+ | Get overdue activities |
| `GET` | `/api/leads/activities/stats` | User+ | Activity statistics |
| `POST` | `/api/leads/{id}/activities` | User+ | Log an activity |
| `PUT` | `/api/leads/{id}/activities/{aid}/complete` | User+ | Complete activity |
| `GET` | `/api/users` | TenantAdmin | List tenant users |
| `POST` | `/api/users` | TenantAdmin | Create a user |
| `POST` | `/api/invitations` | TenantAdmin | Send invitation email |
| `GET` | `/api/auditlogs` | TenantAdmin | Get audit log |
| `GET` | `/api/dashboard` | User+ | Dashboard statistics |
| `GET` | `/api/tenants` | SuperAdmin | List all tenants |
| `POST` | `/api/tenants` | SuperAdmin | Create a tenant |
| `GET` | `/health` | Public | Health check |

> Full interactive documentation available at `/swagger` in development mode.

---

## 🧪 Tests

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

Test coverage includes:
- Domain entity logic (Lead, Invitation, LeadActivity)
- Tenant isolation invariants
- Use case handlers (CreateLead, Login, InviteUser, Dashboard)

---

## 🐳 Deployment

### Docker Compose (self-hosted)

```bash
# Production deployment
cp .env.example .env
# Fill in .env with production values

docker-compose up -d --build

# View logs
docker-compose logs -f api
```

### Health Checks

| Service | Endpoint |
|---|---|
| API | `GET /health` |
| Database | `pg_isready` (checked by Docker) |

### Releasing a versioned image

Tag a commit with a version to trigger the publish workflow:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This builds and pushes Docker images to GitHub Container Registry (`ghcr.io`) tagged as both `v1.0.0` and `latest`.

---

## 📁 Project Structure

```
src/
├── Domain/LeadSense.Domain/
│   ├── Entities/          # Lead, User, Tenant, Invitation, Plan, Subscription, AuditLog…
│   ├── Enums/             # LeadStatus, ActivityType, AuditAction…
│   ├── Common/            # Entity base, Result<T>, Error
│   └── Constants/         # RoleIds
│
├── Application/LeadSense.Application/
│   ├── UseCases/          # One folder per feature (CQRS-lite handlers)
│   ├── Interfaces/        # Repository and service abstractions
│   └── Services/          # AuditService
│
├── Infrastructure/LeadSense.Infrastructure.Repository/
│   ├── Persistence/       # EF Core DbContext, migrations
│   ├── Repositories/      # Concrete repository implementations
│   ├── Authentication/    # JwtService
│   ├── Email/             # ResendEmailService
│   └── Common/            # Seeders (roles, plans, SuperAdmin)
│
└── Web/LeadSense.Api/
    ├── Endpoints/         # Minimal API endpoint registration
    ├── Requests/          # Request DTOs
    └── Program.cs         # App configuration and startup
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure all tests pass (`dotnet test`) and the frontend builds cleanly (`npm run build`) before submitting.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ by **Amantya Technologies**

</div>
