# 🔐 Vercel Environment Variables Setup

## ✅ Cara Benar Setup Environment Variables di Vercel

Jangan gunakan `@` references di vercel.json karena bisa cause error. Gunakan Dashboard Vercel langsung!

---

## 🎯 Step-by-Step Setup

### Step 1: Go to Vercel Dashboard

1. Login: https://vercel.com/dashboard
2. Select project: `gg`
3. Go to: **Settings** tab

### Step 2: Add Environment Variables

Di halaman Settings, cari **Environment Variables**

Tambahkan variables satu per satu:

#### Variable 1: VITE_API_URL
```
Name:  VITE_API_URL
Value: https://your-project.railway.app
```
(Ganti dengan URL backend Anda setelah deploy backend)

#### Variable 2: VITE_FIREBASE_API_KEY
```
Name:  VITE_FIREBASE_API_KEY
Value: AIzaSyD...
```
(Copy dari Firebase Console → Project Settings → Web App Config)

#### Variable 3: VITE_FIREBASE_AUTH_DOMAIN
```
Name:  VITE_FIREBASE_AUTH_DOMAIN
Value: your-project.firebaseapp.com
```

#### Variable 4: VITE_FIREBASE_PROJECT_ID
```
Name:  VITE_FIREBASE_PROJECT_ID
Value: your-project-id
```

#### Variable 5: VITE_FIREBASE_STORAGE_BUCKET
```
Name:  VITE_FIREBASE_STORAGE_BUCKET
Value: your-project.appspot.com
```

#### Variable 6: VITE_FIREBASE_MESSAGING_SENDER_ID
```
Name:  VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 123456789
```

#### Variable 7: VITE_FIREBASE_APP_ID
```
Name:  VITE_FIREBASE_APP_ID
Value: 1:123456789:web:abc123
```

### Step 3: Save Variables

1. Setiap variable sudah benar
2. Click "Save"
3. Vercel akan show: "Environment variables added"

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Find latest deployment
3. Click **three dots** → **Redeploy**
4. Click **Redeploy** (confirm)

Tunggu 2-3 menit hingga deployment selesai.

---

## ✅ Verification

Setelah redeploy:

1. Visit: https://gg.vercel.app
2. Open DevTools (F12)
3. Go to **Console** tab
4. Check untuk error messages

Jika ada error `VITE_API_URL is undefined`:
1. Go back to Settings → Environment Variables
2. Verify VITE_API_URL ada dan benar
3. Redeploy lagi

---

## 📋 Complete Variables Checklist

- [ ] VITE_API_URL: ✅ Set to backend URL
- [ ] VITE_FIREBASE_API_KEY: ✅ Set
- [ ] VITE_FIREBASE_AUTH_DOMAIN: ✅ Set
- [ ] VITE_FIREBASE_PROJECT_ID: ✅ Set
- [ ] VITE_FIREBASE_STORAGE_BUCKET: ✅ Set
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID: ✅ Set
- [ ] VITE_FIREBASE_APP_ID: ✅ Set

---

## 🐛 Troubleshooting

### Error: "VITE_API_URL is undefined"
**Solution:**
1. Check Settings → Environment Variables
2. Verify VITE_API_URL exists
3. Redeploy

### Error: "Firebase initialization failed"
**Solution:**
1. Check all VITE_FIREBASE_* variables
2. Verify values match Firebase Console exactly
3. Redeploy

### Changes not showing after redeploy
**Solution:**
1. Clear browser cache: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+Shift+R
3. Or use private/incognito window

---

## 💡 Tips

- ✅ Use Vercel Dashboard, NOT vercel.json for production vars
- ✅ Each variable must have correct name (VITE_* prefix)
- ✅ Values are case-sensitive
- ✅ Always redeploy after changing variables
- ✅ Check console (F12) for errors after deploy

---

## 🔗 Related Files

- vercel.json (removed env references - now clean)
- DEPLOYMENT_FINAL_STEPS.md (main guide)
- VERCEL_DEPLOYMENT.md (detailed guide)

---

**Last Updated:** December 7, 2025
