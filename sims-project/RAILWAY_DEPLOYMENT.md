# 🚂 Deploy Backend ke Railway - Complete Guide

Railway adalah platform deployment yang sangat mudah untuk backend. Ini adalah panduan lengkap.

---

## 📋 Prerequisites

Sebelum mulai, pastikan:

- [ ] GitHub account (dengan code sudah di-push)
- [ ] Railway account (gratis di https://railway.app)
- [ ] Backend code siap di GitHub
- [ ] Firebase credentials ready

---

## 🎯 Step 1: Buat Railway Account

### 1.1 Kunjungi Railway
```
👉 https://railway.app
```

### 1.2 Sign Up
- Click "Sign Up"
- Pilih "Continue with GitHub"
- Authorize Railway untuk akses GitHub

### 1.3 Verifikasi Email
- Check email untuk verification link
- Click link untuk confirm

**✅ Railway account ready!**

---

## 🔧 Step 2: Create New Project

### 2.1 Di Railway Dashboard
1. Login: https://railway.app/dashboard
2. Click "New Project" (atau "Create")

### 2.2 Select Template
- Pilih: "Deploy from GitHub"
- Atau: "Blank Project"

**Untuk pemula:** Gunakan "Deploy from GitHub"

---

## 📁 Step 3: Connect Repository

### 3.1 Select GitHub Repository
1. Click "Deploy from GitHub"
2. Authorize Railway untuk akses GitHub
3. Select repository: `fajarnazila/gg` atau `fajarnazila/back`

### 3.2 Configure Root Directory
Jika memilih `fajarnazila/gg`:
```
Root Directory: sims-project/backend
```

Jika memilih `fajarnazila/back`:
```
Root Directory: . (root folder, karena backend sudah root)
```

### 3.3 Auto-Detection
Railway akan auto-detect:
- ✅ Node.js project
- ✅ package.json
- ✅ Build command
- ✅ Start command

Click "Deploy" untuk lanjut.

---

## ⚙️ Step 4: Add Environment Variables

Ini adalah langkah **PENTING**!

### 4.1 Go to Variables Section
1. Di Railway Dashboard, lihat project Anda
2. Tab: "Variables" atau "Settings"
3. Click "Add Variable"

### 4.2 Tambah Variables Satu Per Satu

#### Variable 1: NODE_ENV
```
Key:   NODE_ENV
Value: production
```

#### Variable 2: FIREBASE_PROJECT_ID
```
Key:   FIREBASE_PROJECT_ID
Value: your-project-id
```
📍 Dari Firebase Console → Project Settings

#### Variable 3: FIREBASE_PRIVATE_KEY
```
Key:   FIREBASE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```
📍 Dari Firebase Service Account JSON file

**⚠️ PENTING:** Pastikan newline characters (`\n`) ada di akhir dan tengah key!

#### Variable 4: FIREBASE_CLIENT_EMAIL
```
Key:   FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```
📍 Dari Firebase Service Account JSON

#### Variable 5: CORS_ORIGIN
```
Key:   CORS_ORIGIN
Value: https://gg.vercel.app
```
⏳ Ganti dengan URL Vercel Anda nanti

#### Variable 6: JWT_SECRET
```
Key:   JWT_SECRET
Value: your-random-secret-key-at-least-32-characters-long
```
🔒 Generate random string, contoh:
```
aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3w
```

#### Variable 7: PORT (Optional, Railway set default)
```
Key:   PORT
Value: 3000
```

### 4.3 Save Variables
- Click "Save" atau "Add"
- Railway akan show: "Variables added"

---

## 📊 Step 5: Deployment

### 5.1 Trigger Deployment
Setelah add variables:
1. Railway otomatis build & deploy
2. Atau click "Deploy" button
3. Tunggu 3-5 menit

### 5.2 Monitor Build
1. Lihat "Build Logs"
2. Check untuk error messages
3. Tunggu hingga status "Success"

### 5.3 Get URL
Setelah deployment berhasil:
1. Di Railway Dashboard
2. Lihat "Domains" atau "Public URL"
3. URL akan seperti: `https://your-project.railway.app`

**✅ Backend live!**

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Health Endpoint
```bash
curl https://your-project.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-07T10:00:00Z"
}
```

### 6.2 Check Logs
1. Railway Dashboard → Project
2. Tab: "Logs"
3. Check untuk error messages

### 6.3 If Error
Baca error message dengan teliti:
- Firebase key invalid? Update di Variables
- Port already in use? Change PORT variable
- Module not found? Check package.json

---

## 🔄 Step 7: Update Frontend

Sekarang backend live, update frontend:

### 7.1 Get Backend URL
```
https://your-project.railway.app
```

### 7.2 Update Vercel
1. Vercel Dashboard → Project: `gg`
2. Settings → Environment Variables
3. Update `VITE_API_URL`:
```
VITE_API_URL=https://your-project.railway.app
```

### 7.3 Redeploy Frontend
1. Deployments tab
2. Latest deployment → "Redeploy"
3. Confirm dan tunggu 2 menit

### 7.4 Test Connection
1. Visit: https://gg.vercel.app
2. F12 Console → check errors
3. Try login
4. Check network tab → backend calls work?

---

## 🐛 Troubleshooting

### ❌ Error 1: Build Failed

**Error message:**
```
npm ERR! ERR! code ENOENT
npm ERR! code ENOENT
npm ERR! 404 not found - npm ERR!
```

**Solution:**
1. Check `package.json` syntax
2. Verify all dependencies listed
3. Check `.gitignore` - node_modules should be ignored
4. Local test: `npm install && npm start`

---

### ❌ Error 2: Firebase Auth Failed

**Error message:**
```
Error: Failed to initialize Firebase Admin SDK
```

**Solution:**
1. Check FIREBASE_PRIVATE_KEY
2. Verify newline characters (`\n`)
3. Check FIREBASE_CLIENT_EMAIL matches
4. Verify Firebase project ID correct
5. Check Firebase Admin SDK enabled

---

### ❌ Error 3: Port Already in Use

**Error message:**
```
Error: listen EADDRINUSE :::3000
```

**Solution:**
1. Railway → Variables
2. Change PORT: 3000 → 4000
3. Redeploy

---

### ❌ Error 4: Cannot Find Module

**Error message:**
```
Error: Cannot find module 'express'
```

**Solution:**
1. Check `package.json` has dependencies
2. Local test: `npm install`
3. Check node_modules not in .gitignore
4. Railway should auto-install

---

### ❌ Error 5: CORS Not Working

**Error message:**
```
Access to XMLHttpRequest blocked by CORS
```

**Solution:**
1. Check CORS_ORIGIN variable set
2. Verify frontend URL correct
3. Check server.js has CORS middleware:
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

---

## 📊 Environment Variables Checklist

- [ ] NODE_ENV = production
- [ ] FIREBASE_PROJECT_ID = your-id
- [ ] FIREBASE_PRIVATE_KEY = from service account (with \n)
- [ ] FIREBASE_CLIENT_EMAIL = your-email
- [ ] CORS_ORIGIN = https://gg.vercel.app
- [ ] JWT_SECRET = random-secret-key
- [ ] PORT = 3000 (or your port)

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- Railway Support: https://railway.app/support

---

## 💡 Tips & Best Practices

### ✅ Do's
- ✅ Use environment variables for secrets
- ✅ Test locally first: `npm start`
- ✅ Check logs regularly
- ✅ Monitor usage in Railway dashboard
- ✅ Setup alerts for errors

### ❌ Don'ts
- ❌ Don't commit .env file
- ❌ Don't hardcode secrets in code
- ❌ Don't share private keys
- ❌ Don't use free tier for production (upgrade plan)

---

## 📈 Monitor & Scale

### Monitor
1. Railway Dashboard → Project
2. Tab: "Metrics" atau "Overview"
3. Check:
   - CPU usage
   - Memory usage
   - Network usage
   - Uptime

### Scale
Jika traffic tinggi:
1. Railway Dashboard → Settings
2. Upgrade plan (free → hobby → pro)
3. Or set auto-scaling if available

---

## 🎯 Quick Recap

### 5 Langkah Deploy:

1. **Create Railway Account**
   - Sign up di railway.app

2. **Connect GitHub**
   - Select repository (gg atau back)
   - Set root directory

3. **Add Variables**
   - Firebase credentials
   - CORS_ORIGIN
   - JWT_SECRET

4. **Deploy**
   - Railway otomatis build & deploy
   - Tunggu 3-5 menit

5. **Test & Update Frontend**
   - Test health endpoint
   - Update VITE_API_URL di Vercel
   - Redeploy frontend

---

## ✅ Verification Checklist

- [ ] Railway account created
- [ ] GitHub connected
- [ ] Repository selected
- [ ] Variables added (all 6-7)
- [ ] Deployment successful
- [ ] Health endpoint works
- [ ] Logs show no errors
- [ ] Frontend updated with backend URL
- [ ] Frontend redeployed
- [ ] Login flow works end-to-end

---

## 🎉 Done!

Backend Anda sekarang live di Railway! 🚀

**Backend URL:** https://your-project.railway.app
**Status:** ✅ Production Ready

---

## 📞 Need Help?

### Common Issues
1. Firebase not initializing → Check credentials in Variables
2. CORS errors → Update CORS_ORIGIN
3. Build failed → Check package.json syntax
4. Port issues → Change PORT variable

### Documentation
- FIREBASE_TROUBLESHOOTING.md - Error solutions
- BACKEND_DEPLOYMENT.md - Detailed guide
- DEPLOYMENT_FINAL_STEPS.md - Integration steps

---

**Last Updated:** December 7, 2025
**Version:** 1.0
**Status:** ✅ Complete Guide
