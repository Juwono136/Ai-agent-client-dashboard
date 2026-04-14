# VPS Production Deployment Guide — vlow.ai

This document explains how to deploy **vlow.ai** to a production VPS: server requirements, environment configuration, build & run with **Docker**, and **Nginx**/**SSL** options (including Cloudflare Tunnel).

---

## 1. Server requirements (VPS)


| Item        | Minimum                               | Rekomendasi  |
| ----------- | ------------------------------------- | ------------ |
| **OS**      | Ubuntu 22.04 LTS (or Debian 12)       | Same         |
| **RAM**     | 2 GB                                  | 4 GB or more |
| **CPU**     | 2 vCPU                                | 2–4 vCPU     |
| **Storage** | 20 GB SSD                             | 40 GB+ SSD   |
| **Network** | Public IP, ports 80/443 (or a tunnel) | Same         |


**Required software:**

- **Docker** & **Docker Compose** (container-based deployment), or
- **Node.js 20 LTS**, **nginx**, **PM2** (non-Docker deployment).

Ensure the firewall allows:

- Port **80** (HTTP) and **443** (HTTPS) — if using Nginx/Certbot.
- Or you may not need to open these ports if using **Cloudflare Tunnel** (traffic flows through the tunnel).

---

## 2. Production environment (backend)

Create a `**.env`** file in `**server/**` (or inject via Docker/CI). **Do not** commit secret files.

### 2.1 Differences vs development

- `NODE_ENV=production`
- `FRONTEND_URL` = your production frontend URL (e.g. `https://vlow.portproject.my.id`)
- Do **not** set `SYNC_ALTER=true` in production (risk of uncontrolled schema changes). Use migrations if available.
- Use a strong **JWT_SECRET** (at least 32 random characters).
- Database: use least-privilege users and strong passwords.
- MinIO: use HTTPS and production credentials.

### 2.2 Key production variables


| Variable                          | Production value (example)                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `NODE_ENV`                        | `production`                                                                           |
| `FRONTEND_URL`                    | `https://vlow.portproject.my.id`                                                       |
| `PORT`                            | `5000`                                                                                 |
| `DB_HOST`                         | PostgreSQL host (IP/hostname; in Docker can be a service name)                         |
| `DB_USER` / `DB_PASS` / `DB_NAME` | Production credentials                                                                 |
| `JWT_SECRET`                      | Long random secret (generate: `openssl rand -base64 32`)                               |
| `MINIO_PUBLIC_URL`                | Public MinIO URL (HTTPS)                                                               |
| `MINIO_ENDPOINT`                  | MinIO host (in Docker: service name or `host.docker.internal` if MinIO is on the host) |
| `WAHA_BASE_URL`                   | WAHA production URL (HTTPS)                                                            |
| `WAHA_WORKER_URL`                 | WAHA Plus worker URL (if separated); leave empty if single server                      |
| `WAHA_EDITION`                    | `CORE` / `PRO` / `PLUS`                                                                |
| `SYNC_ALTER`                      | **false** or unset                                                                     |


For the complete variable list, see **[SETUP.md](./SETUP.md)**.

---

## 3. Docker-based deployment

This app ships with **Dockerfiles** for both backend and frontend. The backend runs via **PM2** inside the container; the frontend is built and served by **Nginx**.

### 3.1 Build images

From the **project root** (`vlow-ai/`):

```bash
# Backend (server)
docker build -t vlow-api ./server

# Frontend (client) — build may depend on API routing; see notes below
docker build -t vlow-frontend ./client
```

**Frontend note:**  
`client/vite.config.js` can proxy to a production API depending on build/runtime assumptions. If frontend and API are served under the same host (Nginx proxies `/api` to the backend), the important part is that production requests to `/api` are routed to the backend. If frontend and API are on different domains, adjust `vite.config.js` or introduce a build-time env (e.g. `VITE_API_URL`) and update the frontend to use it.

### 3.2 Run containers

**Backend:**

```bash
docker run -d --name vlow-api \
  -p 5000:5000 \
  --env-file server/.env \
  -e NODE_ENV=production \
  vlow-api
```

Replace `--env-file server/.env` with your env file path. Ensure your `.env` contains all production variables.

**Frontend:**

The Nginx config in `client/vlow_nginx.conf` proxies `/api/` to `http://vlow-api:5000`. Therefore, frontend and backend must be able to resolve the name `vlow-api` (e.g. within the same Docker network).

Example using a **Docker network**:

```bash
docker network create vlow-net

docker run -d --name vlow-api --network vlow-net \
  -p 5000:5000 \
  --env-file server/.env \
  -e NODE_ENV=production \
  vlow-api

docker run -d --name vlow-frontend --network vlow-net \
  -p 8080:8080 \
  vlow-frontend
```

Then access the frontend at **[http://SERVER_IP:8080](http://SERVER_IP:8080)**. For production, place **Nginx (or Caddy) on the host** as a reverse proxy to `localhost:8080` and `localhost:5000`, and terminate SSL there (see section 5).

### 3.3 Docker Compose (optional)

Example `docker-compose.yml` at the project root:

```yaml
services:
  vlow-api:
    build: ./server
    image: vlow-api
    container_name: vlow-api
    restart: unless-stopped
    env_file: ./server/.env
    environment:
      - NODE_ENV=production
    ports:
      - "5000:5000"
    # If using DB/MinIO in host:
    # extra_hosts:
    #   - "host.docker.internal:host-gateway"

  vlow-frontend:
    build: ./client
    image: vlow-frontend
    container_name: vlow-frontend
    restart: unless-stopped
    depends_on:
      - vlow-api
    ports:
      - "8080:8080"
```

Run:

```bash
docker compose up -d
```

Make sure `server/.env` exists and contains production configuration. If your database and MinIO are outside Docker, set `DB_HOST` / `MINIO_ENDPOINT` to the host IP or use `host.docker.internal` (Linux: `extra_hosts: - \"host.docker.internal:host-gateway\"`).

---

## 4. Database & MinIO in production

### 4.1 PostgreSQL

- Use a production PostgreSQL instance (managed or a dedicated VPS). Create a database and a least-privilege user.
- Do **not** set `SYNC_ALTER=true`. For schema changes, use Sequelize migrations or controlled SQL changes.
- Run regular backups: `pg_dump` or provider-managed backups.

### 4.2 MinIO

- Deploy MinIO separately (container or managed). Create the bucket matching `MINIO_BUCKET`.
- Set `MINIO_PUBLIC_URL` to a browser-accessible URL (HTTPS). If behind Nginx, configure proxying for bucket/object paths.

### 4.3 Seed admin

Run the seed **once** after the database is ready (from the host or a temporary container):

```bash
cd server
# Set env production, then run this command:
node seed.js
```

---

## 5. Reverse proxy & SSL

To serve the frontend and `/api` from a single domain:

### 5.1 Nginx on the host (example)

- Frontend: proxy ke `http://127.0.0.1:8080` (container vlow-frontend).
- API: proxy `/api/` dan `/socket.io/` ke `http://127.0.0.1:5000` (container vlow-api).

Example server block (replace `vlow.portproject.my.id` with your domain):

```nginx
server {
    listen 80;
    server_name vlow.portproject.my.id;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

Then install SSL using **Certbot**:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d vlow.portproject.my.id
```

Certbot will update your Nginx config for HTTPS.

### 5.2 Cloudflare Tunnel

If using **Cloudflare Tunnel** (without opening ports 80/443 on the VPS):

- Install `cloudflared` and create a tunnel to `localhost:8080` (frontend) or to a single local Nginx that proxies both frontend + backend.
- Configure the tunnel so `/api` and `/socket.io` route to the backend (port 5000) and `/` routes to the frontend (8080), or route everything to a single local Nginx that already handles this split.

In this setup, `FRONTEND_URL` and CORS should reference the Cloudflare domain (e.g. `https://vlow.portproject.my.id`).

---

## 6. WAHA & n8n in production

- **WAHA:** Deploy WAHA (Core/Pro/Plus) on a separate server or as containers. Set `WAHA_BASE_URL` and `WAHA_WORKER_URL` (Plus) to production URLs. Ensure HTTPS and that `WAHA_API_KEY` matches the WAHA configuration.
- **n8n:** Deploy n8n (Docker or managed). Configure per-customer production (and test) webhooks; these URLs are registered to WAHA when customers connect numbers. Ensure n8n webhook URLs are reachable from WAHA (HTTPS).

For WAHA Plus VPS resource recommendations, refer to any dedicated repo documentation.

---

## 7. Quick checklist

- VPS meets requirements and Docker (or Node + PM2) is installed.
- PostgreSQL production is ready; database/user created; **SYNC_ALTER** is not used.
- MinIO production is ready; bucket created; `MINIO_PUBLIC_URL` and production credentials set.
- `server/.env` production is complete: `NODE_ENV=production`, HTTPS `FRONTEND_URL`, strong `JWT_SECRET`.
- Build backend & frontend Docker images; run them with production env.
- Seed admin once: `node seed.js` with production env.
- Nginx (or another reverse proxy) routes the domain to frontend (8080) and `/api` + `/socket.io` to backend (5000).
- SSL enabled (Certbot or Cloudflare).
- WAHA and n8n (if used) are production-ready and URLs/API keys are correct.

After that, access the app via `https://your-domain` and log in using the seeded admin account. For development setup and a feature overview, see the root **[README.md](../README.md)** and **[SETUP.md](./SETUP.md)**.