# 🚂 Railway Quick Start (5 Menit)

Deploy backend ke Railway dalam 5 langkah mudah.

---

## ⚡ 5 Langkah Cepat

### 1️⃣ Sign Up Railway
```
👉 https://railway.app
→ "Sign Up"
→ "Continue with GitHub"
→ Verify email
```

### 2️⃣ Create Project
```
Dashboard → "New Project"
→ "Deploy from GitHub"
→ Select: fajarnazila/gg (atau fajarnazila/back)
```

### 3️⃣ Configure
```
Root Directory: sims-project/backend (atau . untuk back repo)
→ Click "Deploy"
```

### 4️⃣ Add Environment Variables
```
NODE_ENV = production
FIREBASE_PROJECT_ID = your-id (dari Firebase Console)
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@...
CORS_ORIGIN = https://gg.vercel.app
JWT_SECRET = random-secret-string
```

### 5️⃣ Deploy & Test
```
Railway auto-build (3-5 menit)
→ Get URL: https://your-project.railway.app
→ Test: curl https://your-project.railway.app/api/health
→ Update VITE_API_URL di Vercel
→ Redeploy frontend
```

---

## ✅ Selesai!

Backend live di Railway! 🎉

**Next:** Update `VITE_API_URL` di Vercel dengan Railway URL

---

For details, see: **RAILWAY_DEPLOYMENT.md**
