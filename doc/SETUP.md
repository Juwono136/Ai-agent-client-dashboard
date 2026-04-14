# Development Setup Guide — vlow.ai

This document explains how to set up a development environment to run **vlow.ai** on your local machine.

---

## 1. Prerequisites

Make sure the following are installed:

| Requirement | Recommended version | Notes |
|-----------|------------------------|------------|
| **Node.js** | 20 LTS or newer | Required for both client (Vite) and server (Express) |
| **npm** | 10+ | Typically installed with Node.js |
| **PostgreSQL** | 14+ | Primary database |
| **MinIO** | Latest | S3-compatible object storage for file uploads |

**Optional (for full functionality):**

- **WAHA** (WhatsApp HTTP API) — required for Connected Platforms and WhatsApp event delivery.
- **n8n** — for workflow automation and (production/test) webhooks.

---

## 2. Clone the repository

```bash
git clone <URL_REPO_VLOW_AI>
cd vlow-ai
```

---

## 3. PostgreSQL database

### 3.1 Create a database and user (optional)

```sql
CREATE USER vlowapp_user WITH PASSWORD 'replace_with_a_secure_password';
CREATE DATABASE vlow_db OWNER vlowapp_user;
GRANT ALL PRIVILEGES ON DATABASE vlow_db TO vlowapp_user;
```

Alternatively, you can use the `postgres` user and an existing database; just align your settings with the environment variables below.

### 3.2 Ensure PostgreSQL is running

- **Windows:** The PostgreSQL service must be running.
- **Linux/macOS:** Use `sudo systemctl start postgresql` or `brew services start postgresql`.

---

## 4. MinIO

### 4.1 Run MinIO (Docker example)

```bash
docker run -d --name minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=replace_with_a_secure_password \
  minio/minio server /data --console-address ":9001"
```

### 4.2 Create a bucket

- Open MinIO Console: `http://localhost:9001`
- Log in using `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`
- Create a bucket (e.g. `vlow-agents`) — the name must match `MINIO_BUCKET` in your environment config.

---

## 5. Server environment configuration

In **`server/`**, create a **`.env`** file (do not commit this file; use `.env.example` as a template if available).

### 5.1 Required variables

| Variable | Description | Example (development) |
|----------|-----------|------------------------|
| `NODE_ENV` | Environment: `development` / `production` | `development` |
| `FRONTEND_URL` | Frontend URL (CORS + email links) | `http://localhost:5173` |
| `PORT` | Backend server port | `5000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_USER` | PostgreSQL user | `postgres` or `vlowapp_user` |
| `DB_PASS` | PostgreSQL password | *(your password)* |
| `DB_NAME` | Database name | `vlow_db` |
| `DB_DIALECT` | Sequelize dialect | `postgres` |
| `JWT_SECRET` | Secret used to sign JWTs (use a long random string) | *(min. 32 chars)* |
| `JWT_EXPIRE` | Token expiry | `1d` |
| `ADMIN_EMAIL` | Admin email (for seeding) | `admin@yourdomain.local` |
| `ADMIN_PASSWORD` | Admin password (for seeding) | *(strong password)* |
| `MINIO_ENDPOINT` | MinIO host | `localhost` |
| `MINIO_PORT` | MinIO port | `9000` |
| `MINIO_USE_SSL` | Use HTTPS to MinIO | `false` |
| `MINIO_ACCESS_KEY` | MinIO access key | `admin` |
| `MINIO_SECRET_KEY` | MinIO secret key | *(from MinIO)* |
| `MINIO_BUCKET` | Bucket name for uploads | `vlow-agents` |
| `MINIO_PUBLIC_URL` | Public URL used to generate asset URLs | `http://localhost:9000` |

### 5.2 Optional variables (email, WAHA, n8n, security)

| Variable | Description | Example |
|----------|-----------|--------|
| `SMTP_HOST` | SMTP host (forgot password, welcome email) | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_EMAIL` | Sender email | `your@gmail.com` |
| `SMTP_PASSWORD` | SMTP password / App Password | *(app password)* |
| `FROM_EMAIL` | From address | same as `SMTP_EMAIL` |
| `FROM_NAME` | From name | `Vlow Support Team` |
| `N8N_SIMULATOR_URL` | n8n webhook URL used for simulator/testing | `https://n8n.example.com/webhook/...` |
| `WAHA_BASE_URL` | WAHA API base URL | `http://localhost:7575` |
| `WAHA_WORKER_URL` | WAHA worker URL (Plus edition; leave empty if single server) | *(empty or worker URL)* |
| `WAHA_API_KEY` | WAHA API key (if enabled) | *(secret string)* |
| `WAHA_EDITION` | WAHA edition: `CORE`, `PRO`, `PLUS` | `CORE` or `PLUS` |
| `WAHA_POST_CREATE_DELAY_MS` | Delay (ms) after creating a session | `1200` |
| `WAHA_POST_START_DELAY_MS` | Delay (ms) after starting a session | `3500` |
| `WAHA_REQUEST_TIMEOUT_MS` | Timeout for WAHA requests (ms) | `15000` |
| `RATE_LIMIT_MAX` | Global rate limit max requests per window | `600` |
| `RATE_LIMIT_AUTH_MAX` | Rate limit max requests for auth routes | `20` |
| `DB_POOL_MAX` | DB pool max connections | `10` |
| `DB_POOL_MIN` | DB pool min connections | `0` |
| `DB_POOL_ACQUIRE_MS` | DB pool acquire timeout (ms) | `30000` |
| `DB_POOL_IDLE_MS` | DB pool idle timeout (ms) | `10000` |
| `JWT_COOKIE_EXPIRE` | Cookie expiry (days) | `30` |
| `SYNC_ALTER` | If `true`, Sequelize sync uses `alter` (unsafe in production) | `true` (dev only) |

**Minimal development `.env` example (without WAHA/n8n):**

```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PORT=5000

DB_HOST=localhost
DB_USER=postgres
DB_PASS=your_db_password
DB_NAME=vlow_db
DB_DIALECT=postgres

JWT_SECRET=your-super-long-random-secret-at-least-32-chars
JWT_EXPIRE=1d

ADMIN_EMAIL=admin@yourdomain.local
ADMIN_PASSWORD=YourSecureAdminPass123!

MINIO_PUBLIC_URL=http://localhost:9000
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=your_minio_secret
MINIO_BUCKET=vlow-agents

RATE_LIMIT_MAX=600
RATE_LIMIT_AUTH_MAX=20
DB_POOL_MAX=10
SYNC_ALTER=true
```

---

## 6. Install dependencies

### 6.1 Backend

```bash
cd server
npm install
```

### 6.2 Frontend

```bash
cd client
npm install
```

---

## 7. Run the application

### 7.1 Start the server (backend)

From **`server/`**:

```bash
npm run dev
```

The server runs on **http://localhost:5000**. Health endpoint: **http://localhost:5000/health**.

On startup, Sequelize will sync models (and alter tables if `SYNC_ALTER=true`). The MinIO bucket will be created automatically if it does not exist (based on your server configuration).

### 7.2 Seed the admin account (run once)

In **`server/`**, ensure your `.env` contains `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run:

```bash
node seed.js
```

This creates one admin user. If the email already exists, seeding will be skipped.

### 7.3 Start the client (frontend)

From **`client/`**:

```bash
npm run dev
```

The frontend dev server runs on **http://localhost:5173**. Vite proxies `/api` requests to `http://localhost:5000`, so you typically do not need extra CORS configuration for development.

### 7.4 Access the application

- Open: **http://localhost:5173**
- Log in with the **ADMIN_EMAIL** and **ADMIN_PASSWORD** used during seeding.

---

## 8. Verify connectivity

- **Backend:** `curl http://localhost:5000/health` → should return a healthy JSON response.
- **Frontend:** The login page loads; after login, the dashboard (or User Management for admins) is accessible.
- **MinIO:** Upload a welcome image or knowledge asset in the app; files should appear in the configured MinIO bucket.
- **WAHA (optional):** Add a number in Connected Platforms; ensure `WAHA_BASE_URL` and (if required) `WAHA_WORKER_URL` + `WAHA_API_KEY` are correct.

---

## 9. Quick troubleshooting

| Issue | Likely cause | Fix |
|--------|----------------------|--------|
| `ECONNREFUSED` to database | PostgreSQL is not running / wrong host/port | Check DB service and `DB_HOST` (and `DB_PORT` if non-default) |
| `relation \"Users\" does not exist` | Tables not created yet | Start the server once (sync) or set `SYNC_ALTER=true` then restart |
| Upload fails / 500 | MinIO not running or bucket mismatch | Verify MinIO is running, check `MINIO_*`, create bucket matching `MINIO_BUCKET` |
| CORS error from frontend | `FRONTEND_URL` does not match request origin | Set `FRONTEND_URL=http://localhost:5173` for development |
| Login redirects to wrong URL | Email/reset links use `FRONTEND_URL` | Ensure `FRONTEND_URL` matches your environment |

For VPS production deployment (Docker, Nginx, production env), see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.
