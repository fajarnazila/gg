# 🏗️ Monorepo Quick Start (5 Menit)

Frontend dan Backend dalam satu project - deploy lebih mudah!

---

## ⚡ Option 1: Docker Compose (EASIEST - 2 Menit)

### 1. Create .env file

```env
FIREBASE_PROJECT_ID=your-id
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email
JWT_SECRET=your-secret

VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-id
VITE_FIREBASE_APP_ID=your-id
```

### 2. Run Everything

```bash
docker-compose up
```

### 3. Access

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API: http://localhost:3000/api/health

**Done! Both running!**

---

## ⚡ Option 2: npm Workspaces (DEVELOPMENT)

### 1. Install

```bash
npm install
```

### 2. Run Both

```bash
npm run dev -ws
```

Or separate terminals:

```bash
npm run start:frontend
# In another terminal
npm run start:backend
```

### 3. Access

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 🎯 Benefits

✅ **Single Repository** - One git repo for everything
✅ **Easy Deployment** - Deploy both together
✅ **Shared Environment** - Frontend + Backend same container
✅ **Unified Logging** - See both logs together
✅ **Easy Scaling** - Scale entire app as one

---

## 📊 Structure

```
sims-project/
├── frontend/          ← React app
├── backend/           ← Express server
├── docker-compose.yml ← Run both
├── nginx.conf         ← Reverse proxy
└── .env              ← Credentials
```

---

## 🚀 Production Deployment

### Option A: Docker Compose on VPS

```bash
git clone https://github.com/fajarnazila/gg.git
cd sims-project
docker-compose up -d
# Everything running!
```

### Option B: Railway (Recommended)

```
Railway Dashboard → New Project
→ Deploy from GitHub
→ Select: fajarnazila/gg
→ Configure both frontend + backend
→ Deploy!
```

### Option C: Render

Similar to Railway - both services in one project

---

## ✅ Status

- ✅ Frontend Dockerfile.dev (development)
- ✅ Frontend Dockerfile.prod (production)
- ✅ Backend Dockerfile (production-ready)
- ✅ docker-compose.yml (local development)
- ✅ nginx.conf (production reverse proxy)
- ✅ nginx.frontend.conf (frontend serving)

---

## 📖 Full Guide

See: **MONOREPO_SETUP.md** for complete documentation

---

**Status:** ✅ Monorepo ready!
**Time to Deploy:** 5 minutes
**Difficulty:** VERY EASY
