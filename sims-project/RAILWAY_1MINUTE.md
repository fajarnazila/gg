# ⚡ 1 Menit Deploy ke Railway - Super Simple

Ini cara PALING MUDAH deploy backend. Hanya 5 langkah!

---

## 🎯 5 Langkah (5 Menit Total)

### 1️⃣ Kunjungi Railway
```
https://railway.app
```

### 2️⃣ Sign Up dengan GitHub
```
Click "Start Now" atau "Sign Up"
→ "Continue with GitHub"
→ Authorize
→ Done
```

### 3️⃣ Create New Project
```
Dashboard → "New Project"
→ "Deploy from GitHub"
→ Select: fajarnazila/back
```

### 4️⃣ Configure (Default OK)
```
Root Directory: . (otomatis benar)
→ Click "Deploy"
```

### 5️⃣ Add Secrets/Variables

Di Railway, cari "Variables" tab:

```
Click "Add Variable"

Add ini satu-satu:

NODE_ENV = production
FIREBASE_PROJECT_ID = [dari Firebase Console]
FIREBASE_PRIVATE_KEY = [dari Firebase Console]
FIREBASE_CLIENT_EMAIL = [dari Firebase Console]
CORS_ORIGIN = https://gg.vercel.app
JWT_SECRET = aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3w
```

---

## ✅ SELESAI!

Setelah deploy:

1. **Tunggu 3-5 menit** - Railway build & deploy
2. **Copy URL** - Contoh: https://sims-back.railway.app
3. **Update Vercel** - VITE_API_URL = https://sims-back.railway.app
4. **Redeploy Frontend** - Vercel akan auto-update
5. **Test** - Login di https://gg.vercel.app

---

## 📋 Itu saja!

| Step | Time |
|------|------|
| Sign Up | 1 min |
| Create Project | 1 min |
| Add Variables | 2 min |
| Deploy | 3-5 min |
| **Total** | **5-7 min** ⚡ |

---

## 🔍 Gimana Cek Status?

1. Di Railway Dashboard
2. Lihat "Logs" tab
3. Tunggu sampai status "Success"
4. Copy URL dari "Public URL"

---

## ❌ Jika Ada Error

1. Check "Logs" di Railway
2. Verify semua variables ada
3. Re-add variables jika perlu
4. Redeploy

---

## 🎊 DONE!

Backend sekarang LIVE! 🚀

**Next:** Update VITE_API_URL di Vercel & redeploy

---

**For detailed guide:** RAILWAY_DEPLOYMENT.md
**For other options:** FREE_DEPLOYMENT_OPTIONS.md
