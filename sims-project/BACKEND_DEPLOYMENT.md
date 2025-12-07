# Deploy Backend - Railway/Render/Heroku

## 🚀 Pilihan: Railway (Recommended)

### Step 1: Persiapan Backend

Pastikan `backend/package.json` punya:

```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 2: Create Railway Account

- Kunjungi https://railway.app
- Sign up dengan GitHub
- Grant permissions

### Step 3: Deploy

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Di folder backend
cd sims-project/backend

# Initialize railway project
railway init

# Link environment
railway link

# Deploy
railway up

# Get URL
railway open
```

### Step 4: Environment Variables

Di Railway Dashboard:

```
NODE_ENV=production
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
MONGODB_URI=your-mongodb-uri (if using)
CORS_ORIGIN=https://your-frontend-url.vercel.app
JWT_SECRET=your-jwt-secret
```

### Step 5: Get Backend URL

Railway akan generate URL seperti:
```
https://your-project.railway.app
```

Update di frontend `.env.local`:
```
VITE_API_URL=https://your-project.railway.app
```

---

## 🚀 Alternative: Render

### Step 1: Create Account

- Kunjungi https://render.com
- Sign up dengan GitHub

### Step 2: Create Web Service

1. Dashboard → "New +" → "Web Service"
2. Select repo: `fajarnazila/gg`
3. Configure:
   - Name: `sims-project-backend`
   - Root Directory: `sims-project/backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`

### Step 3: Add Environment Variables

```
NODE_ENV=production
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
CORS_ORIGIN=https://your-frontend.vercel.app
JWT_SECRET=your-secret
```

### Step 4: Deploy

Click "Create Web Service" → Tunggu build → Deploy otomatis

Backend URL:
```
https://sims-project-backend.onrender.com
```

---

## 🚀 Alternative: Heroku

### Step 1: Setup

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Verify
git remote -v
```

### Step 2: Environment Variables

```bash
# Set variables
heroku config:set NODE_ENV=production
heroku config:set FIREBASE_PROJECT_ID=your-id
heroku config:set FIREBASE_PRIVATE_KEY=your-key
heroku config:set FIREBASE_CLIENT_EMAIL=your-email
heroku config:set CORS_ORIGIN=https://your-frontend.vercel.app
```

### Step 3: Deploy

```bash
# Push ke Heroku
git push heroku main

# Check logs
heroku logs --tail
```

Backend URL:
```
https://your-app-name.herokuapp.com
```

---

## 📋 Verifikasi Backend Deployment

Setelah deploy, test backend:

```bash
# Test health endpoint
curl https://your-backend-url.com/api/health

# Should return:
# {"status": "ok", "timestamp": "2025-12-07T10:00:00Z"}
```

Atau buat script test:

```bash
# backend/test-deployment.sh
#!/bin/bash

BACKEND_URL="https://your-backend-url.com"

echo "Testing backend connection..."

# Test health
curl -X GET "$BACKEND_URL/api/health"

echo ""
echo "✅ Backend is running!"
```

---

## 🔄 CORS Configuration

Update `backend/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## ✅ Final Setup

### 1. Frontend (.env.local)
```
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=...
...
```

### 2. Backend (.env)
```
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 3. Firebase Security Rules
- Copy `firestore.rules` ke Firebase Console
- Copy `storage.rules` ke Firebase Console

### 4. Test End-to-End
- Login page works? ✅
- Can authenticate? ✅
- Can fetch data? ✅
- Can create data? ✅

---

## 📊 Architecture (After Deployment)

```
User Browser
    ↓
[Frontend] → Vercel (https://your-app.vercel.app)
    ↓
    ├─→ [Backend] → Railway (https://your-backend.railway.app)
    │       ↓
    │   [Firebase] → Firestore + Storage
    │
    └─→ [Firebase Auth] → Google Sign-in
```

---

## 🎉 Selesai!

Sekarang full stack Anda live di production! 🚀

---

**Last Updated:** December 7, 2025
