# 🚀 Deploy SIMS ke Vercel - Langkah-Langkah Final

## ✅ Status Saat Ini

- ✅ Frontend code di GitHub
- ✅ Backend code di GitHub  
- ✅ Firebase credentials ready
- ✅ Deployment guides created
- ⏳ Deployment: Pending

---

## 🎯 Langkah Deploy (Total: 15 Menit)

### **1️⃣ Deploy Frontend ke Vercel (5 menit)**

#### A. Buka Vercel Dashboard
```
👉 https://vercel.com/dashboard
```

#### B. Klik "Add New" → "Project"
![screenshot placeholder]

#### C. Select Repository
```
Repository: fajarnazila/gg
```

#### D. Configure Project Settings
```
Framework: Vite
Root Directory: sims-project/frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### E. Add Environment Variables (PENTING!)

Klik "Environment Variables" dan add:

```env
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=AIzaSyD_...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> ⚠️ **PENTING:** Dapatkan credentials dari:
> - Firebase Console → Project Settings → Web App Config

#### F. Klik "Deploy"

Tunggu 2-5 menit sampai deploy selesai.

**Result:** 🎉 Frontend live di `https://gg.vercel.app`

---

### **2️⃣ Deploy Backend ke Railway (5 menit)**

#### A. Buka Railway Dashboard
```
👉 https://railway.app/dashboard
```

#### B. Click "New Project"

#### C. Select "Deploy from GitHub"
```
Repository: fajarnazila/gg
```

#### D. Configure
```
Root Directory: sims-project/backend
```

#### E. Add Variables

Di Railway Variables section, add:

```
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
CORS_ORIGIN=https://gg.vercel.app
JWT_SECRET=your-random-secret-key-here
```

> 📝 Credentials dari: Firebase Console → Service Account JSON

#### F. Deploy

Railway auto-deploy. Tunggu hingga status "Active".

**Result:** 🎉 Backend live di `https://your-project.railway.app`

---

### **3️⃣ Update Frontend dengan Backend URL (2 menit)**

#### A. Kembali ke Vercel Dashboard
```
Project: gg
```

#### B. Settings → Environment Variables

#### C. Update VITE_API_URL
```
VITE_API_URL=https://your-project.railway.app
```

#### D. Redeploy
```
Klik "Deployments" → Latest → "Redeploy"
```

---

### **4️⃣ Test End-to-End (3 menit)**

#### A. Open Frontend
```
https://gg.vercel.app
```

#### B. Check Console (F12)
- Ada error? No? ✅
- Firebase connected? Yes? ✅

#### C. Try Login
```
Email: test@example.com
Password: test123456
```

#### D. Check Requests
- F12 → Network tab
- Login request → 200 OK? ✅
- API calls → 200 OK? ✅

#### E. Navigate Dashboard
- Dashboard loads? ✅
- Data displays? ✅
- Can interact? ✅

---

## 🔗 Important URLs

Setelah deploy, Anda punya:

```
Frontend (Vercel)
┌─────────────────────────────────┐
│ https://gg.vercel.app           │
│ Auto-update on every push       │
└─────────────────────────────────┘

Backend (Railway)
┌─────────────────────────────────┐
│ https://your-project.railway.app│
│ Auto-redeploy on every push     │
└─────────────────────────────────┘

Database (Firebase)
┌─────────────────────────────────┐
│ Firestore + Storage             │
│ Already live                    │
└─────────────────────────────────┘
```

---

## ✅ Verification Checklist

Sebelum dinyatakan "LIVE":

### Frontend
- [ ] Page loads tanpa error
- [ ] Console F12 tidak ada error
- [ ] Login form appears
- [ ] Firebase connected (check console)

### Backend
- [ ] Health check: `https://your-backend.railway.app/api/health`
- [ ] Response: `{"status": "ok", ...}`

### Login Flow
- [ ] Can login dengan credentials
- [ ] JWT token di localStorage
- [ ] Redirect ke dashboard
- [ ] Dashboard shows role-specific data

### Database
- [ ] Firestore rules published
- [ ] Storage rules published
- [ ] Can read user data
- [ ] Can write data (if admin)

---

## 🐛 Troubleshooting

### ❌ Frontend tidak connect ke backend

**Solusi:**
1. Check VITE_API_URL di Vercel dashboard
2. Verify backend is running: `curl https://your-backend.railway.app/api/health`
3. Check CORS di backend
4. Redeploy frontend

### ❌ Login tidak work

**Solusi:**
1. Check Firebase credentials di .env
2. Verify Firebase Auth enabled
3. Check browser console for errors
4. Try `npm run test-firebase` locally

### ❌ 404 on page refresh

**Solusi:**
```
vercel.json sudah ada dengan rewrites?
✅ Sudah ada, deploy seharusnya work.
```

### ❌ Environment variables not found

**Solusi:**
1. Vercel: Settings → Environment Variables
2. Add semua VITE_* variables
3. Redeploy
4. Clear browser cache (Ctrl+Shift+Delete)

---

## 🔐 Security Checklist

Sebelum production:

- [ ] JWT_SECRET di-set (random string 32+ char)
- [ ] Firestore rules restrict access
- [ ] Storage rules restrict access
- [ ] CORS hanya allow frontend domain
- [ ] API keys di environment variables (bukan hardcoded)
- [ ] Service account key secure (tidak di-commit)

---

## 📊 Monitoring

Setelah live, monitor:

### Vercel
- Dashboard → Analytics
- Real-time traffic
- Build times
- Error rates

### Railway
- Dashboard → Logs
- Check for errors
- Monitor uptime
- Check CPU/Memory

### Firebase
- Firestore → Stats
- Check read/write operations
- Monitor storage usage
- Check active users

---

## 🎉 Done!

Selamat! SIMS project Anda sudah live! 🚀

### Next Steps

1. **Share dengan users:**
   ```
   Frontend: https://gg.vercel.app
   ```

2. **Monitor & maintain:**
   - Check logs regularly
   - Update code jika ada bugs
   - Scale jika traffic tinggi

3. **Improvements:**
   - Add monitoring/alerting
   - Setup backups
   - Add CDN untuk assets
   - Optimize performance

---

## 📚 Documentation Links

- Frontend Deployment: `VERCEL_DEPLOYMENT.md`
- Backend Deployment: `BACKEND_DEPLOYMENT.md`
- Firebase Setup: `FIREBASE_SETUP.md`
- Troubleshooting: `FIREBASE_TROUBLESHOOTING.md`

---

**Status:** ✅ Ready to Deploy
**Last Updated:** December 7, 2025
