# ✅ SIMS Deployment Checklist - Interactive

Gunakan file ini untuk tracking progress deployment Anda.

---

## 📋 Phase 1: Pre-Deployment (15 menit)

### Verifikasi Code
- [ ] Code sudah push ke GitHub
  ```bash
  git push origin main
  ```
- [ ] Tidak ada uncommitted changes
  ```bash
  git status
  ```

### Verifikasi Frontend Build
- [ ] Frontend bisa build
  ```bash
  cd frontend
  npm run build
  ```
- [ ] Build output ada di `dist/` folder
  ```bash
  ls -la dist/
  ```

### Verifikasi Backend
- [ ] Backend start tanpa error
  ```bash
  cd backend
  npm start
  ```
- [ ] Health endpoint works
  ```bash
  curl http://localhost:5000/api/health
  ```

### Firebase Credentials Ready
- [ ] Service Account JSON downloaded
  ```
  📝 File: firebase-service-account.json
  ```
- [ ] Web App credentials copied
  ```
  📝 API Key, Auth Domain, Project ID, etc.
  ```

---

## 🚀 Phase 2: Frontend Deployment (5-10 menit)

### Step 1: Vercel Account Setup
- [ ] Account created: https://vercel.com
- [ ] GitHub connected
- [ ] Logged in to dashboard

### Step 2: Import Project
- [ ] Klik "Add New" → "Project"
- [ ] Repository selected: `fajarnazila/gg`
- [ ] Import clicked

### Step 3: Configure Settings
- [ ] Framework: `Vite` ✓
- [ ] Root Directory: `sims-project/frontend` ✓
- [ ] Build Command: `npm run build` ✓
- [ ] Output Directory: `dist` ✓

### Step 4: Environment Variables
- [ ] VITE_API_URL: `https://your-backend.railway.app` (placeholder)
- [ ] VITE_FIREBASE_API_KEY: `AIzaSyD...` ✓
- [ ] VITE_FIREBASE_AUTH_DOMAIN: `your-project.firebaseapp.com` ✓
- [ ] VITE_FIREBASE_PROJECT_ID: `your-project-id` ✓
- [ ] VITE_FIREBASE_STORAGE_BUCKET: `your-project.appspot.com` ✓
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID: `123456789` ✓
- [ ] VITE_FIREBASE_APP_ID: `1:123456789:web:abc123` ✓

### Step 5: Deploy
- [ ] Klik "Deploy" button
- [ ] Tunggu build selesai (2-5 menit)
- [ ] Vercel URL generated: `https://gg.vercel.app`
  ```
  🔗 Save URL: ____________________________
  ```

### Step 6: Verify Frontend
- [ ] Visit `https://gg.vercel.app`
- [ ] Page loads tanpa error
- [ ] Console (F12) tidak ada error
- [ ] Login form visible

**✅ Phase 2 Complete at:** `___________ (time)`

---

## 🔧 Phase 3: Backend Deployment (5-10 menit)

### Step 1: Railway Account Setup
- [ ] Account created: https://railway.app
- [ ] GitHub connected
- [ ] Logged in to dashboard

### Step 2: New Project
- [ ] Klik "New Project"
- [ ] Selected: "Deploy from GitHub"
- [ ] Repository: `fajarnazila/gg`

### Step 3: Configure
- [ ] Root Directory: `sims-project/backend` ✓
- [ ] Auto-detect: Node.js ✓

### Step 4: Environment Variables
- [ ] NODE_ENV: `production` ✓
- [ ] FIREBASE_PROJECT_ID: `your-project-id` ✓
- [ ] FIREBASE_PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` ✓
- [ ] FIREBASE_CLIENT_EMAIL: `firebase-adminsdk-xxxxx@...` ✓
- [ ] CORS_ORIGIN: `https://gg.vercel.app` ✓
- [ ] JWT_SECRET: `your-random-secret` ✓

### Step 5: Deploy
- [ ] Tunggu auto-deploy
- [ ] Status: "Active" ✓
- [ ] Railway URL: `https://your-project.railway.app`
  ```
  🔗 Save URL: ____________________________
  ```

### Step 6: Verify Backend
- [ ] Test health endpoint:
  ```bash
  curl https://your-project.railway.app/api/health
  ```
- [ ] Response: `{"status": "ok", ...}` ✓

**✅ Phase 3 Complete at:** `___________ (time)`

---

## 🔗 Phase 4: Connect Frontend & Backend (2-5 menit)

### Step 1: Update Environment Variable
- [ ] Back to Vercel Dashboard
- [ ] Project: `gg`
- [ ] Settings → Environment Variables
- [ ] Update VITE_API_URL:
  ```
  https://your-project.railway.app
  ```

### Step 2: Redeploy Frontend
- [ ] Go to Deployments tab
- [ ] Latest deployment
- [ ] Klik "Redeploy"
- [ ] Tunggu 1-2 menit

### Step 3: Verify Connection
- [ ] Visit frontend: `https://gg.vercel.app`
- [ ] F12 Console → Network tab
- [ ] Try login
- [ ] Check API call goes to Railway backend
- [ ] Status 200 OK ✓

**✅ Phase 4 Complete at:** `___________ (time)`

---

## 🧪 Phase 5: End-to-End Testing (5-10 menit)

### A. Frontend Verification
- [ ] Page loads: `https://gg.vercel.app`
- [ ] No 404 errors
- [ ] CSS/styling correct
- [ ] All images load
- [ ] Console (F12) clean
- [ ] Network tab: no red errors

### B. Login Flow
- [ ] Login page displays
- [ ] Can enter email
- [ ] Can enter password
- [ ] Submit button works
- [ ] Firebase auth message appears
- [ ] Redirects to dashboard

### C. Dashboard Display
- [ ] Correct role dashboard shows
- [ ] Student: Student Dashboard
- [ ] Teacher: Teacher Dashboard
- [ ] Admin: Admin Dashboard
- [ ] Data displays correctly
- [ ] Charts load (if any)

### D. API Operations
- [ ] Can fetch data (GET)
- [ ] Network tab shows backend calls
- [ ] Response status: 200
- [ ] Data renders correctly

### E. Logout
- [ ] Logout button works
- [ ] Redirects to login
- [ ] Token cleared

### F. Firebase
- [ ] AuthContext working
- [ ] User profile loaded
- [ ] Firestore data accessible
- [ ] Storage accessible (if any)

**✅ Phase 5 Complete at:** `___________ (time)`

---

## 🔐 Phase 6: Security Verification (5 menit)

### Environment & Credentials
- [ ] No credentials in frontend code
- [ ] All secrets in environment variables
- [ ] Service account key not committed to GitHub
- [ ] API keys restricted (if possible)

### CORS
- [ ] Frontend domain in CORS whitelist
- [ ] Backend only allows specific origins
- [ ] Preflight requests work

### Firebase Security Rules
- [ ] Firestore rules published
- [ ] Storage rules published
- [ ] User data protected (can't read others)
- [ ] Admin operations restricted

### Authentication
- [ ] JWT tokens generated on login
- [ ] Tokens stored securely
- [ ] Tokens sent in API headers
- [ ] Token expiration works

**✅ Phase 6 Complete at:** `___________ (time)`

---

## 📊 Phase 7: Monitoring & Documentation (5 menit)

### Monitoring Setup
- [ ] Bookmarked Vercel dashboard
- [ ] Bookmarked Railway dashboard
- [ ] Bookmarked Firebase console
- [ ] Know where to check logs

### Documentation
- [ ] Saved Vercel URL: `_________`
- [ ] Saved Backend URL: `_________`
- [ ] Firebase Project ID: `_________`
- [ ] Created backup of credentials

### Team Communication
- [ ] Documented deployment process
- [ ] Shared URLs with team
- [ ] Documented environment setup
- [ ] Created troubleshooting guide

**✅ Phase 7 Complete at:** `___________ (time)`

---

## 🎉 Phase 8: Final Verification (2 menit)

### Complete Checklist
- [ ] Frontend deployed ✓
- [ ] Backend deployed ✓
- [ ] Connected & working ✓
- [ ] Login works ✓
- [ ] Dashboard displays ✓
- [ ] API calls successful ✓
- [ ] No errors in console ✓
- [ ] Security rules active ✓
- [ ] Monitoring setup ✓

### Go-Live Status
```
✅ SYSTEM READY FOR PRODUCTION
✅ ALL CHECKS PASSED
✅ READY FOR USERS
```

**🚀 Go-Live at:** `___________ (time)`

---

## 📈 Post-Deployment (First Week)

### Daily Checks
- [ ] Day 1: Monitor for errors
- [ ] Day 2-3: Check performance
- [ ] Day 4-5: User feedback
- [ ] Day 6-7: Plan improvements

### Monitoring Checklist
- [ ] Vercel analytics: Traffic normal?
- [ ] Railway logs: Errors?
- [ ] Firebase stats: Data growing?
- [ ] User reports: Issues?

### Improvements
- [ ] Add error tracking (Sentry)
- [ ] Setup uptime monitoring
- [ ] Create backup schedule
- [ ] Plan scaling

---

## 📞 Support & Help

### If Something Breaks
1. Check logs:
   - Vercel: Deployments → Logs
   - Railway: Logs section
   - Firebase: Logs in console

2. Check guides:
   - FIREBASE_TROUBLESHOOTING.md
   - DEPLOYMENT_FINAL_STEPS.md

3. Common Issues:
   - Frontend not connecting: Update VITE_API_URL
   - Login failing: Check Firebase rules
   - 404 on routes: Check vercel.json rewrites
   - CORS error: Update backend CORS config

### Resources
- Vercel Support: https://vercel.com/support
- Railway Support: https://railway.app/support
- Firebase Support: https://firebase.google.com/support

---

## 🎓 Summary

**Total Time:** ~30-45 minutes

**What You Have Now:**
- ✅ Frontend live on Vercel (auto-updates)
- ✅ Backend live on Railway (auto-updates)
- ✅ Database live on Firebase
- ✅ Full SIMS system in production
- ✅ Auto-deployment on code push
- ✅ Monitoring & logging setup

**Next Actions:**
- Monitor first week
- Gather user feedback
- Plan improvements
- Scale if needed

---

**Status:** ✅ DEPLOYMENT COMPLETE
**Go-Live Date:** `_______________`
**Deployed By:** `_______________`

---

Last Updated: December 7, 2025
