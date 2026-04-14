# vlow.ai — Full-Stack AI Agent Platform (WhatsApp + n8n + WAHA)

**vlow.ai** is a startup product owned by the Client (from freelance job). The platform enables teams to provision **WhatsApp-connected AI Agents**, route events into **n8n workflows**, and manage users/subscriptions through an admin dashboard.

---

## Product overview

**vlow.ai** is a full-stack, multi-tenant platform built for customers/teams who want to run WhatsApp-based automation with:

- **AI Agents** (instructions, welcome flows, knowledge assets)
- **WAHA** (WhatsApp session management + message event delivery)
- **n8n** (workflow engine triggered by WhatsApp events)

It ships with separate **Admin** and **Customer** workspaces to manage access, limits, and runtime configuration.

---

## Key capabilities

- **Admin workspace/dashboard**
  - User lifecycle management (create/update/deactivate)
  - Subscription controls (expiry date + trial support)
  - Per-customer limits:
    - AI Agent limit (including an “Unlimited” option)
    - WhatsApp connection limit
  - Per-customer **n8n webhook URL** configuration
  - Administrative dashboards (high-level view of users/agents/platforms)
- **Customer workspace/dashboard**
  - Create and manage **AI Agents**
    - System instructions (agent behavior)
    - Welcome message + optional welcome image
    - Transfer condition logic (handoff)
    - Knowledge assets (stored in MinIO)
  - Connect WhatsApp numbers via **Connected Platforms**
    - WAHA session create/start/stop/delete
    - QR scan connection flow
    - Session cleanup on deletion
  - Subscription and limit enforcement surfaced in UI/behavior
- **Integrations**
  - **WAHA (WhatsApp HTTP API)** to manage sessions and deliver incoming message events
  - **n8n** to process WhatsApp events via webhooks (test/simulator + production)
  - **MinIO** (S3-compatible) for file storage (agent images / knowledge uploads)
  - **PostgreSQL** as the main relational database (Sequelize ORM)
  - **SMTP email** (password resets / welcome emails) when configured

---

## Architecture (high level)

This repository is a monorepo with two main services:

- `**client/`**: React + Vite SPA (served via Nginx in production)
- `**server/`**: Node.js + Express API (runs with PM2 in production container)

Typical production flow:

1. Customer connects a WhatsApp number in **Connected Platforms**.
2. Backend creates/starts the corresponding WAHA session and registers webhooks.
3. WAHA sends message events to the configured **n8n webhook**.
4. n8n executes workflows and can call back your API/webhook endpoints as needed.

Authentication uses **JWT** (cookie-based in production; API supports token flows) and role-based access (`admin`, `customer`).

---

## Roles, access control, and subscription behavior

- **Roles**
  - `**admin`**: full access (user management, configuration, global views).
  - `**customer`**: access limited to their own agents, platforms, and configuration.
- **Subscriptions**
  - Customers have a `subscriptionExpiry` (and optional trial).
  - When a subscription expires, the app treats agents/platforms as inactive and WAHA sessions may be stopped as part of enforcement.

---

## Integration flows (WAHA + n8n)

### WAHA session lifecycle

- When a customer adds a new number in **Connected Platforms**, the backend:
  - creates a WAHA session
  - starts the session (delays/timeouts are configurable)
  - registers webhooks for message events
- When a platform is removed, the backend:
  - stops/deletes the WAHA session
  - removes the platform record

### n8n webhook routing

The backend supports registering:

- **Simulator/Test webhook** (for testing message flows)
- **Production webhook** (for real routing)

Each customer can have different webhook URLs (configured by Admin). WAHA sends `message` events to those webhook endpoints.

---

## Tech stack

### Frontend

- React 19, Vite 7
- Redux Toolkit, React Router
- Tailwind CSS 4 + DaisyUI

### Backend

- Node.js 20, Express 5
- Sequelize (PostgreSQL)
- JWT auth
- Nodemailer (SMTP)
- Security middleware (rate limiting, helmet, compression)

### Infrastructure

- Docker (backend + frontend images)
- Nginx (serving SPA + proxy `/api` and `/socket.io`)
- MinIO (object storage)
- WAHA (WhatsApp HTTP API: Core/Pro/Plus)
- n8n (workflow automation)
- CI/CD with GitHub Actions + **self-hosted runner on the VPS**

---

## Repository structure

```
vlow-ai/
├── client/                 # Frontend (React + Vite)
│   ├── Dockerfile
│   ├── vlow_nginx.conf      # Nginx: serves SPA + proxies /api to backend
│   └── src/
├── server/                  # Backend (Express)
│   ├── Dockerfile
│   ├── server.js
│   ├── seed.js              # Creates a default admin account
│   └── ...
├── doc/                     # Project documentation (detailed setup/deploy)
│   ├── SETUP.md
│   └── DEPLOYMENT.md
└── .github/workflows/
    └── cicd.yml             # CI/CD pipeline (build/push + deploy on VPS)
```

---

## Local development (quick start)

For a full guide, see:

- `doc/SETUP.md` — Development setup (PostgreSQL, MinIO, optional WAHA/n8n)
- `doc/DEPLOYMENT.md` — VPS production deployment (Docker, Nginx, SSL, operations)

### Prerequisites

- Node.js **20+**
- PostgreSQL **14+**
- MinIO (recommended via Docker)
- WAHA and n8n for full WhatsApp automation flows

### Install dependencies

```bash
cd server && npm install
cd client && npm install
```

### Configure environment

Create `server/.env` and set at least:

- `NODE_ENV`, `FRONTEND_URL`, `PORT`
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_DIALECT`
- `JWT_SECRET`, `JWT_EXPIRE`
- `MINIO_*` variables

For the complete list (including WAHA/n8n/SMTP/security tuning), see `doc/SETUP.md`.

### Run services

```bash
# backend
cd server
npm run dev

# seed initial admin (run once)
node seed.js

# frontend
cd ../client
npm run dev
```

Health check:

- `GET /health` on `http://localhost:5000/health`

---

## Production deployment overview

For a complete step-by-step guide, see `doc/DEPLOYMENT.md`.

### Docker images

- Backend image is built from `server/Dockerfile` and runs `server.js` via PM2.
- Frontend image is built from `client/Dockerfile` and serves `client/dist` via Nginx.

The frontend Nginx configuration (`client/vlow_nginx.conf`) proxies:

- `/api/` → backend service (`vlow-api:5000`)
- `/socket.io/` → backend service (WebSocket upgrade enabled)

### External dependencies

In production, you typically deploy:

- **PostgreSQL** (managed or self-hosted)
- **MinIO** (object storage)
- **WAHA** (WhatsApp API)
- **n8n** (workflows + webhooks)

Then configure the backend to point to these services via environment variables.

---

## CI/CD (GitHub Actions + self-hosted runner on VPS)

This repository includes a CI/CD pipeline in:

- `/.github/workflows/cicd.yml`

### How the pipeline works

On push/PR to `master` (excluding README-only changes), the workflow runs:

1. **Continuous Integration (GitHub-hosted runner)**
  - Builds Docker images:
    - `vlow-api:latest` from `./server`
    - `vlow-frontend:latest` from `./client`
  - Pushes both images to Docker Hub
2. **Continuous Deployment (self-hosted runner on the VPS)**
  - Pulls the latest images from Docker Hub
  - Runs `docker compose down` then `docker compose up -d --remove-orphans`
  - Executes database seeding inside the running backend container:
    - `docker exec vlow-api npm run seed`
  - Optionally connects containers to an existing Docker network (for Cloudflare Tunnel)

### Required GitHub Secrets

The workflow expects secrets such as:

- Docker Hub credentials (`DOCKER_USERNAME`, `DOCKER_PASSWORD`)
- Backend runtime configuration (DB, JWT, SMTP, MinIO, WAHA, n8n, rate limits, etc.)
- `TUNNEL_NAME` if you use Cloudflare Tunnel networking

Do **not** store plaintext secrets in the repository; use GitHub Actions Secrets.

### Self-hosted runner notes (VPS)

To enable deployment, the VPS must:

- Have Docker + Docker Compose installed
- Have the GitHub Actions **self-hosted runner** installed and registered
- Have permission to run Docker (runner user in `docker` group or equivalent)
- Have a `docker-compose.yml` available in the deployment directory used by the runner

Refer to `doc/DEPLOYMENT.md` for operational recommendations (logging, SSL, backups, and hardening).

---

## Security & operational notes

- **Never** commit `.env` files or secrets.
- Use a strong `JWT_SECRET` and production-grade DB credentials.
- Avoid `SYNC_ALTER=true` in production (schema changes should be controlled).
- Prefer HTTPS everywhere (frontend, API, WAHA, MinIO public URL, n8n webhooks).

---

## Documentation

- `doc/SETUP.md` — Development setup guide
- `doc/DEPLOYMENT.md` — VPS production deployment guide

