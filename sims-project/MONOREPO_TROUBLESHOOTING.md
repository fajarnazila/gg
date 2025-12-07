# 🔧 Monorepo Troubleshooting Guide

Solusi cepat untuk masalah yang sering terjadi.

---

## 🚨 Container Issues

### Problem: `docker-compose up` fails

**Error:** `Cannot connect to Docker daemon`

```bash
# Solution 1: Start Docker
docker --version  # Verify Docker installed
sudo systemctl start docker  # Linux
# macOS: Start Docker Desktop manually
# Windows: Start Docker Desktop

# Solution 2: Check Docker running
docker ps
```

---

### Problem: Port already in use

**Error:** `bind: address already in use`

```bash
# Solution: Find what's using port
# Port 3000 (backend)
lsof -i :3000
# Port 5173 (frontend)
lsof -i :5173

# Kill process (find PID from above)
kill -9 PID

# Or change port in docker-compose.yml
# Change: "5173:5173" to "5174:5173"
```

---

### Problem: Container exits immediately

**Error:** Container stopped, exit code 1

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Common causes:
# 1. Environment variables missing
# 2. Port conflict
# 3. Health check failing

# Solution: Add missing env vars to .env
# Then: docker-compose up -d --force-recreate
```

---

## 🌐 Frontend Issues

### Problem: Frontend not loading

**Error:** `Cannot GET /` or blank page

```bash
# Check if running
docker-compose logs frontend

# Check port
curl http://localhost:5173

# Solution 1: Rebuild
docker-compose down
docker-compose up -d --build

# Solution 2: Check nginx config
# Verify: frontend/nginx.frontend.conf exists
# If production: check nginx.conf routing

# Solution 3: Check VITE_API_URL
# Must point to backend URL (http://backend:3000 in docker)
```

---

### Problem: Frontend can't connect to backend API

**Error:** `Cannot POST /api/users` or CORS error

```bash
# Check API URL in frontend
# In browser console, check: VITE_API_URL
# Should be: http://backend:3000 (in docker)
# Or: https://yourdomain.com/api (in production)

# Check backend CORS
curl -H "Origin: http://localhost:5173" http://localhost:3000

# Solution 1: Update docker-compose.yml
# Change VITE_API_URL=http://backend:3000

# Solution 2: Check backend CORS headers
# In backend/server.js:
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

# Solution 3: Check network
docker-compose logs frontend
# Look for: "Successfully connected"
```

---

### Problem: "Module not found" in frontend

**Error:** React component not importing correctly

```bash
# Solution 1: Rebuild container
docker-compose down
docker-compose build frontend
docker-compose up -d

# Solution 2: Check source file exists
# In host machine:
ls -la frontend/src/components/

# Solution 3: Check Vite config
# frontend/vite.config.js should have:
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

---

### Problem: Styling not applied (Tailwind CSS)

**Error:** Buttons/layout look unstyled

```bash
# Solution 1: Rebuild
docker-compose down
docker-compose build frontend
docker-compose up -d

# Solution 2: Check Tailwind config
# frontend/tailwind.config.js exists?
# Content paths correct?

# Solution 3: Check CSS imported
# frontend/src/App.jsx should have:
import './index.css'

# frontend/src/index.css should have:
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🔙 Backend Issues

### Problem: Backend can't connect to Firebase

**Error:** `Error: Invalid service account`

```bash
# Solution 1: Check .env file
# Must contain: FIREBASE_PRIVATE_KEY

# Solution 2: Format private key correctly
# Private key in .env should be:
# On ONE line, OR with literal \n characters
# NOT actual line breaks

# Solution 3: Verify Firebase initialized
docker-compose logs backend
# Look for: "Firebase initialized" or error message

# Solution 4: Check credentials in Firebase Console
# console.firebase.google.com > Project Settings
# > Service Accounts > Node.js
# Regenerate key if needed
```

---

### Problem: Health check endpoint returns 503

**Error:** `curl http://localhost:3000/api/health` returns error

```bash
# Solution 1: Server not started
docker-compose logs backend
# Should show: "Server running on port 3000"

# Solution 2: Routes not loaded
# Check backend/server.js has:
app.use('/api/health', require('./routes/health'));

# Solution 3: Firebase not initialized
# Check for Firebase error in logs
docker-compose exec backend node -e "console.log(process.env.FIREBASE_PROJECT_ID)"

# Solution 4: Rebuild
docker-compose down
docker-compose build backend
docker-compose up -d
```

---

### Problem: Database queries returning null

**Error:** `Cannot read property of null` or empty arrays

```bash
# Solution 1: Check Firebase Firestore
# console.firebase.google.com > Firestore Database
# Verify collections exist and have data

# Solution 2: Check Firebase rules
# Firestore Rules should allow reads:
match /databases/{database}/documents {
  match /{document=**} {
    allow read, write: if request.auth != null;
  }
}

# Solution 3: Check API call
# Verify endpoint: /api/users, /api/classes, etc.
curl http://localhost:3000/api/users

# Solution 4: Check JWT token
# Some endpoints require authentication
# Make sure header contains: Authorization: Bearer TOKEN

# Solution 5: Check data structure
# Data in Firestore might use different field names
# Check backend/routes/*.js for exact field names
```

---

## 🔐 Environment Variables

### Problem: Environment variables not loading

**Error:** `undefined` or `process.env.X is null`

```bash
# Solution 1: .env file missing
# Create: .env in project root
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
...

# Solution 2: .env not in docker-compose.yml
# Check docker-compose.yml:
backend:
  env_file:
    - .env

# Solution 3: Verify .env loaded
docker-compose exec backend env | grep FIREBASE
# Should show all Firebase variables

# Solution 4: Wrong format
# CORRECT:
# FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nXXX\n-----END PRIVATE KEY-----\n

# WRONG:
# FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
# XXX
# -----END PRIVATE KEY-----
```

---

### Problem: Frontend can't access Vite variables

**Error:** `VITE_API_URL is undefined`

```bash
# Solution 1: Check .env has VITE_ prefix
# CORRECT:
VITE_API_URL=http://localhost:3000

# WRONG:
API_URL=http://localhost:3000
# (Vite only exposes VITE_* variables)

# Solution 2: Restart container
docker-compose down
docker-compose up -d

# Solution 3: Check it's accessible in code
// In React component:
const apiUrl = import.meta.env.VITE_API_URL;
console.log(apiUrl); // Should print URL
```

---

## 🌍 Networking Issues

### Problem: Containers can't communicate

**Error:** `Cannot connect to backend:3000` from frontend

```bash
# Solution 1: Check network exists
docker network ls
# Should show: sims-network

# Solution 2: Check containers on network
docker network inspect sims-network
# Should show both backend and frontend

# Solution 3: Rebuild network
docker-compose down
docker-compose up -d --remove-orphans

# Solution 4: Check API URL
# In docker-compose.yml, frontend should use:
VITE_API_URL=http://backend:3000
# NOT http://localhost:3000

# Solution 5: Test connectivity
docker-compose exec frontend curl http://backend:3000/api/health
# Should return JSON
```

---

### Problem: Can't access from external machine

**Error:** `Connection refused` when accessing from different computer

```bash
# Solution 1: Check firewall
# Allow ports 80, 443, 3000, 5173

# Solution 2: Check docker-compose.yml
# Verify ports exposed:
ports:
  - "3000:3000"  # External:Internal
  - "5173:5173"

# Solution 3: Use machine IP, not localhost
# On server: hostname -I or ipconfig
# From client: http://192.168.X.X:3000 (not http://localhost:3000)

# Solution 4: Production setup
# In production, use Nginx reverse proxy (port 80)
# docker-compose.prod.yml with nginx service
```

---

## 🔨 Build Issues

### Problem: Docker image build fails

**Error:** `Error building image` or `npm ERR!`

```bash
# Solution 1: Check Dockerfile exists
ls -la frontend/Dockerfile.dev
ls -la backend/Dockerfile

# Solution 2: Check dependencies
docker-compose build --no-cache
# --no-cache forces fresh download

# Solution 3: Check package.json
# Verify package.json in both frontend/ and backend/
# Must have valid JSON syntax

# Solution 4: Network issue
# Try build with proxy:
docker build --build-arg HTTP_PROXY=http://proxy:port -t app .

# Solution 5: Out of disk space
docker system prune -a
# Removes unused images/containers

# Solution 6: Check Dockerfile syntax
docker run --rm -i hadolint/hadolint < Dockerfile
```

---

### Problem: npm dependencies conflict

**Error:** `npm ERR! peer dep missing`

```bash
# Solution 1: Clean install
docker-compose down
docker-compose up -d --build

# Solution 2: Force reinstall
docker-compose exec frontend npm install --force
docker-compose exec backend npm install --force

# Solution 3: Check package-lock.json
# Delete package-lock.json and rebuild
# In host: rm frontend/package-lock.json
docker-compose up -d --build

# Solution 4: Specific version
# Edit frontend/package.json and backend/package.json
# Pin versions: "react": "^18.2.0"
```

---

## 🚀 Deployment Issues

### Problem: Deployment to Railway/Render fails

**Error:** `Build failed` in dashboard

```bash
# Solution 1: Check environment variables
# In Railway/Render dashboard:
# Settings > Environment
# Verify all variables set correctly

# Solution 2: Check build logs
# In dashboard, expand build logs
# Look for specific error message

# Solution 3: Verify Dockerfile
# Must have EXPOSE statement:
EXPOSE 3000

# Solution 4: Check Node version
# In Dockerfile: FROM node:18-alpine
# Verify matches your test machine

# Solution 5: Verify port
# Backend must listen on PORT env var:
const PORT = process.env.PORT || 3000;
app.listen(PORT, ...)
```

---

### Problem: Application crashes after deployment

**Error:** Service shows as "crashed" or "unhealthy"

```bash
# Solution 1: Check logs in dashboard
# Go to Logs tab and read error message

# Solution 2: Environment variables
# Common issue: Missing env vars
# Double-check all required variables set

# Solution 3: Firebase credentials
# Check FIREBASE_PRIVATE_KEY has literal \n (not real line breaks)

# Solution 4: Health check
# Verify endpoint works locally:
curl http://localhost:3000/api/health

# Solution 5: Memory/CPU
# Check resource limits
# May need to upgrade plan
```

---

## 📊 Monitoring & Debugging

### Check Everything at Once

```bash
# Status summary
docker-compose ps

# All logs
docker-compose logs

# Specific service
docker-compose logs -f backend

# Health check
curl http://localhost:3000/api/health
curl http://localhost:5173

# Resource usage
docker stats

# Network
docker network inspect sims-network
```

---

### Emergency Reset

```bash
# Stop everything
docker-compose down

# Remove all containers/images (WARNING: destructive)
docker-compose down -v --remove-orphans

# Full clean
docker system prune -a

# Start fresh
docker-compose up -d --build
```

---

## 📞 Get Help

If still stuck:

1. **Check logs first:**
   ```bash
   docker-compose logs -f
   ```

2. **Describe the problem:**
   - What happened?
   - What did you expect?
   - Error message (full text)?
   - Steps to reproduce?

3. **Provide context:**
   ```bash
   docker -v
   docker-compose -v
   ```

4. **Share relevant files:**
   - Error log output
   - docker-compose.yml (sanitize secrets)
   - .env variables (without values)
   - Dockerfile

---

**Last Updated:** 2024
**Status:** Continuously Updated ✅
