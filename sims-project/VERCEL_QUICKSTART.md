# Vercel Deployment - Quick Start (5 Menit)

## ⚡ Quick Steps

### 1. Vercel Account
- Kunjungi https://vercel.com
- Sign up dengan GitHub

### 2. Import Project
- Dashboard → "Add New" → "Project"
- Select repo: `fajarnazila/gg`
- Root Directory: `sims-project/frontend`

### 3. Environment Variables (PENTING!)

Add di Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Deploy!

Click "Deploy" button → Tunggu 2-5 menit → Done! 🎉

---

## ✅ Status

- Frontend: Vercel (otomatis update)
- Backend: Perlu hosted (Railway/Render/Heroku)
- Database: Firebase (sudah online)

---

**Untuk detail, baca:** `VERCEL_DEPLOYMENT.md`
