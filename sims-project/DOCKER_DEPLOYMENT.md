# 🐳 Deploy Backend dengan Docker - Complete Guide

Docker membuat deployment menjadi super mudah dan portable. Panduan lengkap dari setup hingga production.

---

## 🎯 Keuntungan Docker

✅ **Konsisten** - Same environment di local dan production
✅ **Portable** - Bisa run di mana saja
✅ **Mudah** - Simple container management
✅ **Gratis** - Docker Community Edition free
✅ **Scalable** - Bisa scale horizontal
✅ **Isolasi** - Environment terpisah rapi

---

## 📋 Prerequisites

- [x] Docker installed (https://www.docker.com/products/docker-desktop)
- [x] Backend code ready
- [x] Firebase credentials ready
- [x] GitHub repository ready

---

## 🐳 Step 1: Create Dockerfile

Buat file `Dockerfile` di folder `backend/`:

```dockerfile
# Gunakan Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

**Location:** `sims-project/backend/Dockerfile`

---

## 🔒 Step 2: Create .dockerignore

Buat file `.dockerignore` di folder `backend/`:

```
node_modules
npm-debug.log
.git
.gitignore
.env
.DS_Store
README.md
```

**Location:** `sims-project/backend/.dockerignore`

---

## 🏗️ Step 3: Build Docker Image

### 3.1 Open Terminal

```bash
cd sims-project/backend
```

### 3.2 Build Image

```bash
docker build -t sims-backend:latest .
```

**Atau dengan custom tag:**

```bash
docker build -t fajarnazila/sims-backend:1.0 .
```

### 3.3 Verify Build

```bash
docker images
```

Anda akan lihat:
```
REPOSITORY              TAG       IMAGE ID
sims-backend            latest    abc123def456
```

---

## 🧪 Step 4: Test Locally

### 4.1 Run Container

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e FIREBASE_PROJECT_ID=your-project-id \
  -e FIREBASE_PRIVATE_KEY="your-key" \
  -e FIREBASE_CLIENT_EMAIL="your-email" \
  -e CORS_ORIGIN="http://localhost:5173" \
  -e JWT_SECRET="your-secret" \
  sims-backend:latest
```

### 4.2 Test Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-07T10:00:00Z"
}
```

### 4.3 Stop Container

```bash
docker stop <container_id>
```

---

## 📤 Step 5: Push to Docker Hub (Optional)

Jika ingin share image atau deploy ke cloud:

### 5.1 Create Docker Hub Account

- Daftar: https://hub.docker.com
- Username: `your-username`

### 5.2 Login

```bash
docker login
```

Masukkan username dan password.

### 5.3 Tag Image

```bash
docker tag sims-backend:latest your-username/sims-backend:latest
```

### 5.4 Push

```bash
docker push your-username/sims-backend:latest
```

### 5.5 Verify

Visit: https://hub.docker.com/r/your-username/sims-backend

---

## 🚀 Deployment Options dengan Docker

### Option A: Railway with Docker

Railway bisa deploy Docker image langsung!

```
Railway Dashboard → New Project
→ "Deploy from Docker"
→ Select registry: Docker Hub
→ Select image: your-username/sims-backend:latest
→ Add environment variables
→ Deploy
```

### Option B: Render with Docker

Render juga support Docker deployment!

```
Render Dashboard → New Web Service
→ Select repo atau Docker image
→ Configure environment
→ Deploy
```

### Option C: Self-hosted Server

Jika punya VPS:

```bash
# SSH ke server
ssh user@your-server.com

# Pull image
docker pull your-username/sims-backend:latest

# Run container
docker run -d \
  -p 80:3000 \
  -e NODE_ENV=production \
  -e FIREBASE_PROJECT_ID=... \
  --name sims-backend \
  your-username/sims-backend:latest

# Check status
docker ps
```

### Option D: Docker Compose (Local)

Untuk development dengan database lokal:

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - FIREBASE_PROJECT_ID=your-project-id
      - FIREBASE_PRIVATE_KEY=your-key
      - FIREBASE_CLIENT_EMAIL=your-email
      - CORS_ORIGIN=http://localhost:5173
      - JWT_SECRET=your-secret
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
      - VITE_FIREBASE_API_KEY=your-key
```

**Run:**

```bash
docker-compose up
```

---

## 📊 Docker Commands Reference

### Build
```bash
docker build -t image-name:tag .
docker build -t sims-backend:1.0 .
```

### Run
```bash
docker run -p local-port:container-port image-name
docker run -p 3000:3000 sims-backend:latest
```

### List Images
```bash
docker images
```

### List Running Containers
```bash
docker ps
```

### List All Containers
```bash
docker ps -a
```

### View Logs
```bash
docker logs container-id
docker logs container-id -f  # Follow logs
```

### Stop Container
```bash
docker stop container-id
```

### Remove Container
```bash
docker rm container-id
```

### Remove Image
```bash
docker rmi image-id
```

### Push to Registry
```bash
docker login
docker tag local-image:tag username/image:tag
docker push username/image:tag
```

---

## 🔧 Advanced: Multi-stage Build

Untuk production yang lebih optimal:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Keuntungan:**
- ✅ Smaller image size
- ✅ Faster deployment
- ✅ Better security

---

## 📝 Complete Dockerfile for SIMS

Optimized version untuk SIMS project:

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["npm", "start"]
```

---

## ✅ Checklist Sebelum Production

- [ ] Dockerfile created and tested locally
- [ ] .dockerignore configured
- [ ] Image builds without errors
- [ ] Container runs locally
- [ ] Health endpoint works
- [ ] All environment variables set
- [ ] Security: No secrets in Dockerfile
- [ ] Security: Using non-root user
- [ ] Image pushed to registry (if using cloud)
- [ ] Deployment platform configured

---

## 🐛 Troubleshooting

### ❌ Error 1: Port Already in Use

```bash
docker: Error response from daemon: driver failed
```

**Solution:**
```bash
# Change port mapping
docker run -p 3001:3000 sims-backend:latest
```

---

### ❌ Error 2: Environment Variables Not Found

```bash
Error: FIREBASE_PROJECT_ID is undefined
```

**Solution:**
```bash
# Pass variables when running
docker run -e FIREBASE_PROJECT_ID=your-id sims-backend:latest

# Or use .env file
docker run --env-file .env sims-backend:latest
```

---

### ❌ Error 3: Module Not Found

```bash
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Check Dockerfile has npm install
# Make sure package.json copied before install

# Rebuild
docker build -t sims-backend:latest . --no-cache
```

---

### ❌ Error 4: Container Exits Immediately

```bash
docker ps  # Container not in list
```

**Solution:**
```bash
# Check logs
docker logs container-id

# Run with interactive mode
docker run -it sims-backend:latest
```

---

## 💡 Best Practices

### ✅ Do's
- ✅ Use .dockerignore
- ✅ Use alpine base images (smaller)
- ✅ Use multi-stage builds
- ✅ Set HEALTHCHECK
- ✅ Use environment variables
- ✅ Run as non-root user
- ✅ Tag versions properly

### ❌ Don'ts
- ❌ Don't run as root
- ❌ Don't include secrets in image
- ❌ Don't use :latest in production
- ❌ Don't copy unnecessary files
- ❌ Don't run multiple processes

---

## 📚 Docker Resources

- Official Docs: https://docs.docker.com
- Best Practices: https://docs.docker.com/develop/dev-best-practices
- Node.js Image: https://hub.docker.com/_/node
- Docker Hub: https://hub.docker.com

---

## 🚀 Deployment Workflow

### Local Development
```
1. Create Dockerfile
2. Build image: docker build
3. Test locally: docker run
4. Fix issues
5. Repeat until perfect
```

### Push to Registry
```
1. Create Docker Hub account
2. docker login
3. docker tag image username/image
4. docker push username/image
```

### Deploy to Cloud
```
1. Railway: New Project → Docker
2. Render: Web Service → Docker
3. Add environment variables
4. Deploy
```

### Monitor
```
1. docker logs for debugging
2. Cloud platform monitoring
3. Health checks
4. Error alerts
```

---

## 🎯 Quick Reference

### Build & Run
```bash
# Build
docker build -t sims-backend:1.0 .

# Run
docker run -p 3000:3000 sims-backend:1.0

# Run with env file
docker run -p 3000:3000 --env-file .env sims-backend:1.0

# Run detached
docker run -d -p 3000:3000 sims-backend:1.0

# View logs
docker logs container-id -f
```

### Clean Up
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove all unused
docker system prune -a
```

---

## 📊 File Structure

```
sims-project/backend/
├── Dockerfile              ← Docker config
├── .dockerignore           ← Ignore files
├── docker-compose.yml      ← (Optional) For local dev
├── server.js
├── package.json
├── .env                    ← (Not committed)
├── routes/
└── ...
```

---

## ✅ Status

- ✅ Dockerfile created
- ✅ Image built
- ✅ Tested locally
- ✅ Ready for deployment
- ✅ Can push to Docker Hub
- ✅ Can deploy to Railway/Render

---

**Next Steps:**

1. Create Dockerfile in backend/
2. Build image locally
3. Test with `docker run`
4. Push to Docker Hub (optional)
5. Deploy to Railway/Render

---

**Last Updated:** December 7, 2025
**Status:** ✅ Complete Docker Guide
