# 🏗️ Monorepo Setup - Frontend + Backend Integration

Menggabungkan frontend dan backend menjadi satu project untuk deployment yang lebih mudah dan efisien!

---

## 🎯 Keuntungan Monorepo

✅ **Unified Deployment** - Deploy bersama
✅ **Shared Code** - Share utilities, types, constants
✅ **Single Repository** - Satu git repo
✅ **Easier Testing** - Test integration lebih mudah
✅ **Consistent Versioning** - Satu versi untuk semua
✅ **Simplified Deployment** - One command to deploy

---

## 📁 Target Struktur

```
sims-project/
├── apps/
│   ├── frontend/              ← React + Vite
│   │   ├── src/
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── Dockerfile         ← Frontend container
│   │
│   └── backend/               ← Express + Node.js
│       ├── routes/
│       ├── server.js
│       ├── package.json
│       └── Dockerfile         ← Backend container
│
├── packages/                   ← Shared code (optional)
│   ├── shared/
│   │   ├── constants/
│   │   ├── types/
│   │   └── utils/
│   └── ...
│
├── docker-compose.yml         ← Run both locally
├── Dockerfile.nginx           ← Production setup
├── nginx.conf                 ← Reverse proxy
├── package.json               ← Root workspace
├── pnpm-workspace.yaml        ← (OR) npm workspaces
└── .github/workflows/         ← CI/CD automation
```

---

## 🚀 Option 1: Docker Compose (Recommended)

Gabungkan dalam satu docker-compose file yang bisa run frontend + backend + nginx!

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend Service
  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    container_name: sims-frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://backend:3000
    depends_on:
      - backend
    networks:
      - sims-network

  # Backend Service
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    container_name: sims-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
      - FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
      - CORS_ORIGIN=http://frontend
      - JWT_SECRET=${JWT_SECRET}
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    networks:
      - sims-network

  # Nginx Reverse Proxy (Optional)
  nginx:
    image: nginx:alpine
    container_name: sims-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - sims-network

networks:
  sims-network:
    driver: bridge
```

### Run Locally

```bash
# Start everything
docker-compose up -d

# Or with logs
docker-compose up

# Stop
docker-compose down
```

---

## 📦 Option 2: npm Workspaces (For Development)

Setup npm workspaces untuk development yang lebih smooth:

### Root package.json

```json
{
  "name": "sims-project",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/frontend",
    "apps/backend",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev -ws",
    "build": "npm run build -ws",
    "start:frontend": "npm run dev --workspace=apps/frontend",
    "start:backend": "npm run dev --workspace=apps/backend",
    "start:all": "npm run dev -ws",
    "test": "npm run test -ws",
    "lint": "npm run lint -ws"
  }
}
```

### Run Both

```bash
# Install all dependencies once
npm install

# Start all in development
npm run start:all

# Start specific
npm run start:frontend
npm run start:backend

# Build all
npm run build
```

---

## 🐳 Option 3: Multi-Container Production (Best)

### Frontend Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY apps/frontend/package*.json ./
RUN npm install
COPY apps/frontend .
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm install --production
COPY apps/backend .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["npm", "start"]
```

---

## 🌐 Nginx Configuration (nginx.conf)

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name _;

        # Frontend
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        # API Proxy
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## 📊 Deployment Options

### Option 1: Docker Compose to VPS
```bash
git clone https://github.com/fajarnazila/gg.git
cd sims-project
docker-compose up -d
# Everything runs on one server!
```

### Option 2: Container Registry + Kubernetes
```bash
# Build and push images
docker build -t sims-frontend:1.0 -f apps/frontend/Dockerfile .
docker build -t sims-backend:1.0 -f apps/backend/Dockerfile .

# Push to Docker Hub or cloud registry
docker push your-registry/sims-frontend:1.0
docker push your-registry/sims-backend:1.0

# Deploy to Kubernetes
kubectl apply -f k8s/
```

### Option 3: Cloud Platforms

**Railway:** 
- Deploy docker-compose directly
- One click deployment

**Render:**
- Deploy both services
- Linked services

**Vercel + Railway:**
- Frontend: Vercel (from ./apps/frontend)
- Backend: Railway (from ./apps/backend)

---

## 🔧 Development Setup

### Prerequisites
```bash
# Install Node.js 18+
# Install Docker Desktop (for docker-compose)
# Install npm or pnpm
```

### Quick Start

```bash
# Clone
git clone https://github.com/fajarnazila/gg.git
cd sims-project

# Option A: Using npm workspaces
npm install
npm run start:all

# Option B: Using Docker Compose
docker-compose up

# Option C: Individual
cd apps/frontend && npm install && npm run dev
# In another terminal
cd apps/backend && npm install && npm start
```

### Environment Variables

Create `.env` in root or in each app:

**Root .env:**
```
FIREBASE_PROJECT_ID=your-id
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email
JWT_SECRET=your-secret

VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-key
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build frontend
        run: npm run build --workspace=apps/frontend
      
      - name: Build backend
        run: npm run build --workspace=apps/backend
      
      - name: Deploy to Railway
        run: |
          # Deploy frontend to Vercel
          # Deploy backend to Railway
          # Or use docker-compose on VPS
```

---

## 📈 Shared Code (Optional)

Jika ingin share code antara frontend dan backend:

### packages/shared/src/constants.ts

```typescript
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  LOGIN: '/api/auth/login',
  USERS: '/api/users',
  CLASSES: '/api/classes',
  GRADES: '/api/grades',
  ATTENDANCE: '/api/attendance',
  PAYMENTS: '/api/payments'
};

export const ROLES = ['admin', 'teacher', 'student', 'parent', 'vice_principal', 'treasurer', 'exam_supervisor', 'school_health'];
```

### packages/shared/src/types.ts

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Usage

**Frontend:**
```typescript
import { API_ENDPOINTS, ROLES } from '@sims/shared';
const url = API_ENDPOINTS.LOGIN;
```

**Backend:**
```typescript
import { ROLES, User } from '@sims/shared';
```

---

## ✅ Migration Checklist

- [ ] Reorganize to apps/frontend and apps/backend
- [ ] Update import paths in both apps
- [ ] Create root package.json with workspaces
- [ ] Test with npm workspaces
- [ ] Create docker-compose.yml
- [ ] Create Dockerfiles for both apps
- [ ] Create nginx.conf
- [ ] Test with docker-compose up
- [ ] Setup CI/CD (optional)
- [ ] Update documentation
- [ ] Push to GitHub
- [ ] Test deployment

---

## 📊 Benefits Comparison

| Aspect | Separate Repos | Monorepo |
|--------|----------------|----------|
| Deployment | 2 deploys | 1 deploy |
| Setup | More complex | Simple |
| Shared code | Copy/paste | Import directly |
| Testing | Separate | Integrated |
| Version sync | Manual | Automatic |
| CI/CD | Multiple | Single |

---

## 🎯 Recommended Setup

**For SIMS Project:**

1. **Development:** npm workspaces
2. **Local Testing:** docker-compose
3. **Production:** Docker images on Railway/Render

---

## 📚 Next Steps

1. **Option A: Quick Setup (Docker Compose)**
   - Copy docker-compose.yml
   - Update Dockerfiles
   - Run: docker-compose up
   - Done in 10 minutes!

2. **Option B: Professional Setup (npm workspaces)**
   - Reorganize folders
   - Create root package.json
   - Setup workspaces
   - 30 minutes setup

3. **Option C: Full Monorepo (Shared packages)**
   - Everything above
   - Add packages/ folder
   - Share types and constants
   - Advanced setup

---

## 🔗 Quick Links

- Docker Docs: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- npm Workspaces: https://docs.npmjs.com/cli/v7/using-npm/workspaces
- Nginx: https://nginx.org/en/docs/

---

**Status:** ✅ Monorepo Strategy Ready
**Complexity:** Easy to Advanced
**Time to Implement:** 10 minutes to 1 hour
**Benefits:** Easier deployment, unified development

---

**Last Updated:** December 7, 2025
