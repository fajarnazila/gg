# ✅ Monorepo Deployment Checklist

Pastikan semua siap sebelum deploy ke production!

---

## 📋 Pre-Deployment

- [ ] Semua branch di-merge ke main
- [ ] Testing di local berhasil (docker-compose up works)
- [ ] Frontend build succeeds: `npm run build` (di frontend folder)
- [ ] Backend start succeeds: `node server.js` (di backend folder)
- [ ] Health check endpoint responding: `curl http://localhost:3000/api/health`
- [ ] Frontend API calls working
- [ ] Environment variables set
- [ ] Credentials uploaded secure

**Waktu:** 10 menit  
**Status:** _____ (Mark when complete)

---

## 🔒 Security Checklist

- [ ] firebase-service-account.json di .gitignore ✅ (sudah ada)
- [ ] .env di .gitignore ✅ (sudah ada)
- [ ] Tidak ada hardcoded password di code
- [ ] CORS properly configured (untuk frontend domain)
- [ ] JWT_SECRET aman (random 32+ char)
- [ ] Firebase rules updated untuk production
- [ ] API rate limiting enabled (di railway/render)

**Waktu:** 5 menit  
**Status:** _____ (Mark when complete)

---

## 📦 Docker Verification

### Build Images

```bash
# Frontend dev
docker build -f frontend/Dockerfile.dev -t sims-frontend:dev ./frontend

# Frontend prod
docker build -f frontend/Dockerfile.prod -t sims-frontend:prod ./frontend

# Backend
docker build -t sims-backend:latest ./backend
```

- [ ] Frontend dev image builds ✅
- [ ] Frontend prod image builds ✅
- [ ] Backend image builds ✅
- [ ] All images less than 500MB
- [ ] docker-compose.yml valid
- [ ] Ports not conflicting

**Waktu:** 10 menit  
**Status:** _____ (Mark when complete)

---

## 🎯 Deployment Method Selection

### Option A: Docker Compose on VPS

```
Requirements:
✅ VPS dengan Docker installed
✅ Domain/DNS pointing ke VPS
✅ Git access (SSH key)
✅ 1GB RAM minimum
✅ $3-5/month

Steps:
1. SSH ke VPS
2. git clone repo
3. docker-compose up -d
4. Done!
```

**Recommended:** YES - Cheapest, full control

- [ ] VPS ready (IP/domain)
- [ ] Docker installed on VPS
- [ ] SSH key configured
- [ ] Firewall rules set (80, 443, 3000)

**Status:** _____ (Mark when ready)

---

### Option B: Railway

```
Requirements:
✅ GitHub account
✅ Railway account (free tier available)
✅ Card (only if upgrading)
✅ 5-10 minutes setup

Steps:
1. Login to railway.app
2. New Project
3. Deploy from GitHub
4. Select fajarnazila/gg
5. Done!
```

**Recommended:** YES - Easiest, automatic

- [ ] Railway account created
- [ ] GitHub connected
- [ ] Environment variables set
- [ ] Domain configured (if custom)

**Status:** _____ (Mark when ready)

---

### Option C: Render

```
Requirements:
✅ GitHub account
✅ Render account (free tier)
✅ No card needed for free tier
✅ 5-10 minutes setup

Steps:
1. Login to render.com
2. New Web Service
3. Deploy from GitHub
4. Done!
```

**Recommended:** YES - Alternative to Railway

- [ ] Render account created
- [ ] GitHub connected
- [ ] Environment variables set

**Status:** _____ (Mark when ready)

---

## 🌐 Environment Variables

### Railway/Render Dashboard

Set these in their dashboard, NOT in code:

```
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY (multiline)
FIREBASE_CLIENT_EMAIL
JWT_SECRET

VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID

NODE_ENV=production
VITE_API_URL=https://yourdomain.com/api
```

- [ ] All variables set di platform
- [ ] Private key properly formatted (with \n)
- [ ] API URL matches domain
- [ ] No typos in variable names

**Status:** _____ (Mark when complete)

---

## 🚀 Deployment Execution

### 1. Git Push

```bash
git status  # Review changes
git add .
git commit -m "Ready for production deployment"
git push origin main
```

- [ ] All changes committed
- [ ] No uncommitted files
- [ ] Pushed to main branch

**Status:** _____ (Mark when complete)

---

### 2. Deploy (Choose One)

#### Docker Compose on VPS:

```bash
ssh user@your-vps-ip
cd /var/www/sims-project
git pull
docker-compose down
docker-compose up -d
docker-compose logs -f
```

- [ ] Connected to VPS
- [ ] Code pulled latest
- [ ] Containers running
- [ ] Logs showing no errors

**Status:** _____ (Mark when complete)

#### Railway:

1. Go to railway.app
2. Select project
3. Click Deploy
4. Wait 2-3 minutes
5. Check Domain

- [ ] Project showing in Railway
- [ ] Domain assigned (xxxxx.railway.app)
- [ ] Build successful (green checkmark)
- [ ] Services running

**Status:** _____ (Mark when complete)

#### Render:

1. Go to render.com
2. Select Web Service
3. Click Deploy
4. Wait 2-3 minutes
5. Check Domain

- [ ] Service showing in Render
- [ ] Domain assigned
- [ ] Build successful (green)
- [ ] Service running

**Status:** _____ (Mark when complete)

---

## ✅ Post-Deployment Verification

### Test Health Endpoints

```bash
# Backend health
curl https://yourdomain.com/api/health

# Should return: {"status": "OK"}
```

- [ ] Backend health check passing
- [ ] Response time < 500ms

**Status:** _____ (Mark when complete)

---

### Test Frontend

1. Open: https://yourdomain.com
2. Login dengan test user
3. Navigate semua pages
4. Check browser console (F12) untuk errors
5. Test API calls (network tab)

- [ ] Frontend loads without errors
- [ ] Login works
- [ ] Dashboard displays data
- [ ] API calls successful
- [ ] No 404 errors

**Status:** _____ (Mark when complete)

---

### Test API Endpoints

```bash
# List users
curl https://yourdomain.com/api/users

# Should return JSON array

# Check logs
docker-compose logs -f backend
# or in platform dashboard
```

- [ ] /api/users responds
- [ ] /api/classes responds
- [ ] /api/grades responds
- [ ] /api/attendance responds
- [ ] No error logs in backend

**Status:** _____ (Mark when complete)

---

### Database Verification

```bash
# Check Firebase Console
1. Go to console.firebase.google.com
2. Select project
3. Check Firestore has data
4. Check Storage accessible
```

- [ ] Firestore accessible
- [ ] Data present
- [ ] Storage accessible
- [ ] No permission errors

**Status:** _____ (Mark when complete)

---

## 📊 Performance Check

```bash
# Website speed
# Use: https://pagespeed.web.dev/
# Target: > 80/100

Frontend Score: _____ / 100
Backend Response Time: _____ ms (should be < 200ms)
Database Query Time: _____ ms (should be < 100ms)
```

- [ ] Frontend score > 70
- [ ] API response < 200ms
- [ ] No timeout errors
- [ ] Memory usage reasonable

**Status:** _____ (Mark when complete)

---

## 🔔 Monitoring Setup

### Railway/Render Alerts

- [ ] Setup email alerts
- [ ] Monitor deployment logs
- [ ] Check service health
- [ ] Monitor cost (if on paid tier)

### Local Monitoring (if VPS)

```bash
# Monitor containers
docker-compose stats

# Watch logs
docker-compose logs -f

# Health check script
curl http://localhost:3000/api/health
```

- [ ] Monitoring configured
- [ ] Log system ready
- [ ] Alert system ready

**Status:** _____ (Mark when complete)

---

## 🎉 Deployment Complete!

When all checked: ✅ PRODUCTION READY

**Next Steps:**

1. **Share with team:** https://yourdomain.com
2. **Monitor first week:** Check logs daily
3. **Get feedback:** Collect user feedback
4. **Fix bugs:** Hot-fix if needed
5. **Plan next features:** Update roadmap

---

## 📞 Troubleshooting

### Frontend not loading

```bash
# Check frontend service
docker-compose logs frontend

# Verify Nginx config
docker exec sims-frontend nginx -t

# Check port
lsof -i :5173
```

### Backend returning errors

```bash
# Check backend logs
docker-compose logs backend

# Test health endpoint
curl http://localhost:3000/api/health

# Check Firebase connection
# Look for: "Firebase initialized"
```

### Environment variables not loading

```bash
# In docker-compose.yml, check env_file
cat docker-compose.yml | grep env

# Verify .env exists
ls -la .env

# Check values
docker-compose exec backend env | grep FIREBASE
```

### Deployment failed on Railway/Render

1. Check build logs in dashboard
2. Verify all env variables set
3. Check port configuration (should be 3000 for backend)
4. Verify Docker image builds locally
5. Contact support with deployment ID

---

**Last Updated:** 2024
**Status:** PRODUCTION READY ✅
**All Systems Go! 🚀**
