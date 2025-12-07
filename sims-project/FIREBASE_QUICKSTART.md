# Firebase Quick Start Guide

## 🚀 Setup Firebase - 5 Langkah Mudah

### Langkah 1: Dapatkan Service Account (Backend)

```bash
# 1. Go to: https://console.firebase.google.com/
# 2. Select project → Settings → Service Accounts
# 3. Click "Generate New Private Key"
# 4. Copy downloaded file ke:

backend/firebase-service-account.json
```

### Langkah 2: Setup Backend Environment

```bash
# Buka backend/.env dan update:

PORT=5000
NODE_ENV=development
USE_FIREBASE=true
FIREBASE_DB_URL=https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-super-secret-key-12345
```

### Langkah 3: Setup Frontend Environment

```bash
# Buat file frontend/.env.local dan isi:

# 1. Go to: https://console.firebase.google.com/
# 2. Select project → Project Settings
# 3. Scroll ke "Your apps" → Click Web app
# 4. Copy credentials dan paste:

VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:...

VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

### Langkah 4: Update Firestore & Storage Rules

```bash
# 1. Firebase Console → Firestore Database → Rules
# 2. Hapus rules default
# 3. Copy dari file: firestore.rules
# 4. Paste dan Publish

# Ulangi untuk Storage:
# 1. Firebase Console → Storage → Rules
# 2. Copy dari file: storage.rules
# 3. Paste dan Publish
```

### Langkah 5: Test Connection

```bash
# Terminal 1
cd backend
npm install
npm run test-firebase

# Should output:
# ✓ firebase-service-account.json loaded
# ✓ Firebase Admin SDK initialized
# ✓ Firestore connection successful

# Terminal 2
cd frontend
npm install
npm run dev

# Open: http://localhost:5173
# Try login dengan email test@example.com
```

---

## 📋 File Structure Setelah Setup

```
sims-project/
├── backend/
│   ├── firebase-service-account.json    ← Add this (download dari Firebase)
│   ├── .env                              ← Create this (dari .env.example)
│   ├── firebase-test.js                  ← Run untuk test
│   └── ... (rest of files)
│
├── frontend/
│   ├── .env.local                        ← Create this (credentials Firebase)
│   ├── src/
│   │   └── firebase/
│   │       └── config.js                 ← Already configured
│   └── ... (rest of files)
│
├── firestore.rules                       ← Copy ke Firebase Console
├── storage.rules                         ← Copy ke Firebase Console
├── FIREBASE_SETUP.md                     ← Complete guide (you are here)
├── FIREBASE_CHECKLIST.md                 ← Verification checklist
└── FIREBASE_TROUBLESHOOTING.md           ← If having issues
```

---

## 🔧 Credentials dari Firebase Console

Ambil dari sini:

```
Project Settings → General
├── Project ID: your-project-id
├── Project Number: 123456789
└── Web API Key: AIzaSyD...

Project Settings → Service Accounts
└── Generate New Private Key → firebase-service-account.json

Project Settings → Your apps
└── Web config:
    ├── apiKey: AIzaSyD...
    ├── authDomain: your-project.firebaseapp.com
    ├── projectId: your-project-id
    ├── storageBucket: your-project.appspot.com
    ├── messagingSenderId: 123456789
    └── appId: 1:123456789:web:abc123def456ghi789
```

---

## 🧪 Test Commands

```bash
# Test Firebase Connection (Backend)
cd backend
npm run test-firebase

# Expect:
# ✓ firebase-service-account.json loaded
# ✓ Firebase Admin SDK initialized
# ✓ Firestore connection successful

# Run Backend Development Server
cd backend
npm run dev

# Expect:
# Server running on port 5000
# Firebase Admin SDK initialized successfully

# Run Frontend Development Server
cd frontend
npm run dev

# Expect:
# VITE v5.2.0 running at:
# ➜ Local: http://localhost:5173/
```

---

## 🔐 Firestore Collections to Create

Buat collections ini di Firestore Console:

1. **users** - User profiles
2. **classes** - Classes/sections
3. **grades** - Student grades
4. **attendance** - Attendance records
5. **payments** - Payment records

---

## 📱 Test Login Credentials

Setelah Firebase Auth disetup:

```
Email: test@example.com
Password: Test123456

Roles:
- admin (access admin dashboard)
- teacher (access teacher dashboard)
- student (access student dashboard)
```

---

## ✅ Verification Checklist

Sebelum mulai coding:

- [ ] `firebase-service-account.json` ada di backend/
- [ ] `backend/.env` sudah diisi credentials
- [ ] `frontend/.env.local` sudah diisi credentials
- [ ] Firestore Rules sudah dipublish
- [ ] Storage Rules sudah dipublish
- [ ] Backend bisa connect ke Firebase (test-firebase pass)
- [ ] Frontend bisa load tanpa error
- [ ] Login works dengan test credentials

---

## 🚨 Jika Ada Error

Cek sini:
1. **PERMISSION_DENIED** → Update Firestore Rules
2. **apiKey not found** → Check frontend/.env.local
3. **Connection refused** → Start backend with `npm run dev`
4. **service account not configured** → Check firebase-service-account.json
5. **Cannot find module** → Run `npm install`

Lihat: `FIREBASE_TROUBLESHOOTING.md` untuk detail lengkap

---

## 📖 Full Guides

- **Complete Setup:** `FIREBASE_SETUP.md`
- **Verification:** `FIREBASE_CHECKLIST.md`
- **Troubleshooting:** `FIREBASE_TROUBLESHOOTING.md`

---

## 🎯 Next Steps

Setelah Firebase connected:

1. Create first user via Firebase Console
2. Test login dengan credentials tersebut
3. Create sample data (users, classes, grades)
4. Verify CRUD operations work
5. Test role-based access control
6. Check security rules work correctly

---

**Last Updated:** December 7, 2025
**Status:** ✅ Ready to Deploy
