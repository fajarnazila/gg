# Deploy ke Vercel - Step by Step

## 📋 Prerequisites

Sebelum mulai, pastikan Anda sudah punya:

- [ ] GitHub account dan repo sudah di-push
- [ ] Vercel account (gratis di https://vercel.com)
- [ ] Backend sudah hosted (Heroku, Railway, Render, atau server sendiri)

---

## 🚀 Step 1: Persiapkan Frontend

### 1.1 Update Backend URL di Environment

Edit `frontend/.env.local`:

```env
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 1.2 Create `vercel.json` di root frontend

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url",
    "VITE_FIREBASE_API_KEY": "@firebase_api_key",
    "VITE_FIREBASE_AUTH_DOMAIN": "@firebase_auth_domain",
    "VITE_FIREBASE_PROJECT_ID": "@firebase_project_id",
    "VITE_FIREBASE_STORAGE_BUCKET": "@firebase_storage_bucket",
    "VITE_FIREBASE_MESSAGING_SENDER_ID": "@firebase_messaging_sender_id",
    "VITE_FIREBASE_APP_ID": "@firebase_app_id"
  }
}
```

### 1.3 Push ke GitHub

```bash
cd sims-project/frontend
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

---

## 🔐 Step 2: Setup Vercel Account

### 2.1 Buat Vercel Account

Kunjungi https://vercel.com dan sign up dengan GitHub account Anda.

### 2.2 Authorize GitHub

Vercel akan meminta akses ke GitHub repositories Anda. Accept untuk melanjutkan.

---

## 🔗 Step 3: Import Project ke Vercel

### 3.1 Import Repository

1. Login ke https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Pilih "Import Git Repository"
4. Cari repository `fajarnazila/gg`
5. Click "Import"

### 3.2 Configure Project

**Framework:** Vite
**Root Directory:** `sims-project/frontend`
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### 3.3 Environment Variables

Dalam halaman "Environment Variables", tambahkan semua variables:

```
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## ⚙️ Step 4: Deploy

### 4.1 Deploy Otomatis

Click "Deploy" button. Vercel akan otomatis:

- Clone repository dari GitHub
- Install dependencies
- Build project dengan `npm run build`
- Deploy ke production

Tunggu proses selesai (biasanya 2-5 menit).

### 4.2 Monitor Deployment

- Vercel dashboard menampukkan status deployment
- Klik "Deployments" tab untuk history
- Lihat logs jika ada error

---

## 🌐 Step 5: Domain Configuration

### 5.1 Auto-Generated Domain

Setelah deploy berhasil, Anda akan dapat:

```
https://gg.vercel.app  (atau similar)
```

### 5.2 Custom Domain (Optional)

Jika punya custom domain:

1. Di Vercel dashboard → Settings → Domains
2. Add custom domain Anda
3. Ikuti instruksi DNS configuration
4. Update backend CORS untuk domain baru

---

## 🔄 Step 6: Auto-Deploy Setup

Vercel otomatis deploy ketika:

- Anda push ke `main` branch
- Pull request di-create (preview deployment)
- Merge ke main

Tidak perlu manual deploy lagi!

---

## 🧪 Step 7: Verify Deployment

### 7.1 Check Frontend

```bash
# Visit di browser
https://your-vercel-url.vercel.app
```

### 7.2 Check Console

1. Buka browser → F12 (Developer Tools)
2. Tab "Console" - lihat ada error?
3. Tab "Network" - semua requests success?
4. Tab "Application" → "Storage" - LocalStorage ada?

### 7.3 Test Login

1. Navigate ke `/login`
2. Coba login dengan test account
3. Check Firebase Connection di console
4. Verify dashboard muncul

---

## ✅ Checklist Pre-Deployment

Sebelum deploy final:

- [ ] Semua environment variables ada
- [ ] Backend URL benar di `.env.local`
- [ ] Firebase credentials benar
- [ ] CORS di backend allow Vercel domain
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Root directory benar: `sims-project/frontend`
- [ ] GitHub push sudah done
- [ ] Test build locally: `npm run build`

---

## 🐛 Troubleshooting

### Error 1: Build Failed

```
Error: Cannot find module 'react'
```

**Solusi:**
```bash
# Delete node_modules & lock file
rm -r node_modules package-lock.json

# Reinstall
npm install

# Build lagi
npm run build
```

### Error 2: Environment Variables Not Found

```
Error: process.env.VITE_API_URL is undefined
```

**Solusi:**
1. Check Vercel dashboard → Settings → Environment Variables
2. Pastikan semua variables ada
3. Redeploy dengan "Redeploy" button

### Error 3: 404 Routes

```
Error: Cannot GET /dashboard
```

**Solusi:**
Add `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Error 4: CORS Issues

```
Error: Access to XMLHttpRequest blocked by CORS
```

**Solusi:**
Update backend CORS:
```javascript
app.use(cors({
  origin: ['https://your-vercel-url.vercel.app', 'http://localhost:5173']
}));
```

### Error 5: Firebase Connection Failed

```
Error: Firebase initialization failed
```

**Solusi:**
1. Verify Firebase credentials di `.env`
2. Check Firebase Security Rules
3. Verify API keys enabled di Firebase Console

---

## 📊 Monitoring & Analytics

### 7.1 Vercel Analytics

Di Vercel dashboard:
- Real-time analytics
- Build times
- Deployment history
- Performance metrics

### 7.2 Check Logs

```bash
# SSH into Vercel
vercel logs

# Atau lihat di dashboard → Logs
```

### 7.3 Performance Metrics

- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push

Setiap push ke main, Vercel otomatis:
1. Clone repo terbaru
2. Install dependencies
3. Build project
4. Deploy ke production

### Preview Deployment

Setiap pull request membuat preview URL:
```
https://gg-git-feature-name.vercel.app
```

Useful untuk testing sebelum merge!

---

## 🚨 Important: Backend Deployment

Jangan lupa backend juga perlu hosted! Options:

### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Setup
railway init
railway add

# Deploy
railway up
```

### Option 2: Render
1. Kunjungi https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - Build: `npm install`
   - Start: `npm start`
5. Add environment variables
6. Deploy

### Option 3: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

---

## 📝 Final Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway/Render/Heroku)
- [ ] Environment variables configured
- [ ] CORS configured properly
- [ ] Firebase rules published
- [ ] Login works end-to-end
- [ ] Dashboard displays correctly
- [ ] CRUD operations work
- [ ] Role-based access works
- [ ] No console errors
- [ ] Custom domain configured (if needed)

---

## 🎉 Selesai!

Frontend Anda sekarang live di Vercel! 🎊

**Vercel URL:** https://your-domain.vercel.app
**Auto-updates:** Setiap push ke main

---

## 📞 Support Links

- Vercel Docs: https://vercel.com/docs
- Vite Deployment: https://vitejs.dev/guide/ssr.html
- Firebase Hosting: https://firebase.google.com/docs/hosting

---

**Last Updated:** December 7, 2025
