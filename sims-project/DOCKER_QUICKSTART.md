# 🐳 Docker Quick Start (10 Menit)

Deploy backend dengan Docker - super mudah!

---

## ⚡ 5 Langkah Cepat

### 1️⃣ Install Docker
```
👉 https://www.docker.com/products/docker-desktop
Download & Install untuk OS Anda
```

### 2️⃣ Build Image
```bash
cd sims-project/backend
docker build -t sims-backend:latest .
```

### 3️⃣ Test Locally
```bash
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e FIREBASE_PROJECT_ID=your-id \
  -e FIREBASE_PRIVATE_KEY="your-key" \
  -e FIREBASE_CLIENT_EMAIL="your-email" \
  -e CORS_ORIGIN="http://localhost:5173" \
  -e JWT_SECRET="your-secret" \
  sims-backend:latest
```

### 4️⃣ Test Endpoint
```bash
curl http://localhost:3000/api/health
```

### 5️⃣ Push & Deploy
```bash
# Push to Docker Hub (optional)
docker login
docker tag sims-backend:latest your-username/sims-backend:latest
docker push your-username/sims-backend:latest

# Or deploy to Railway with Docker image
```

---

## ✅ Files Created

- ✅ `backend/Dockerfile` - Docker configuration
- ✅ `backend/.dockerignore` - Ignore patterns
- ✅ `docker-compose.yml` - Local development (optional)

---

## 🎯 What You Get

- 🐳 Containerized backend
- 📦 Portable across platforms
- 🚀 Ready for production
- 🔄 Easy to scale
- 💪 Self-contained

---

## 📖 Full Guide

See: **DOCKER_DEPLOYMENT.md** for complete documentation

---

**Status:** ✅ Docker ready!
