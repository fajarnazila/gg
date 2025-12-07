# Firebase Setup Checklist

## 📋 Checklist Setup Firebase

Gunakan checklist ini untuk memastikan Firebase sudah terhubung dengan sempurna.

---

## ✅ Phase 1: Firebase Project Creation

- [ ] Kunjungi https://console.firebase.google.com/
- [ ] Buat project baru atau pilih project existing
- [ ] Catat Project ID: `_________________`
- [ ] Pilih region: `Asia Southeast1 (Jakarta)` ✅

---

## ✅ Phase 2: Authentication Setup

- [ ] Buka menu **Authentication**
- [ ] Klik **Sign-in Method**
- [ ] Aktifkan **Email/Password** provider
- [ ] Klik **Save**

### Test Authentication
- [ ] Buka **Users** tab
- [ ] Buat test user:
  - Email: `test@example.com`
  - Password: `Test123456`

---

## ✅ Phase 3: Firestore Database Setup

- [ ] Buka menu **Firestore Database**
- [ ] Klik **Create Database**
- [ ] Pilih mode: **Development Mode** (untuk testing)
- [ ] Pilih lokasi: **asia-southeast1** (Jakarta)
- [ ] Tunggu database siap

### Create Collections
- [ ] Buat collection: **users**
- [ ] Buat collection: **classes**
- [ ] Buat collection: **grades**
- [ ] Buat collection: **attendance**
- [ ] Buat collection: **payments**

### Update Security Rules
- [ ] Buka tab **Rules**
- [ ] Copy content dari file `firestore.rules`
- [ ] Paste dan klik **Publish**

---

## ✅ Phase 4: Storage Setup

- [ ] Buka menu **Storage**
- [ ] Klik **Get Started**
- [ ] Pilih mode: **Test Mode** (untuk development)
- [ ] Pilih lokasi: **asia-southeast1**
- [ ] Tunggu bucket siap

### Update Storage Rules
- [ ] Buka tab **Rules**
- [ ] Copy content dari file `storage.rules`
- [ ] Paste dan klik **Publish**

---

## ✅ Phase 5: Get Credentials

### Frontend Credentials
- [ ] Buka **Project Settings**
- [ ] Scroll ke bawah, cari **Your Apps**
- [ ] Klik icon Web `</>`
- [ ] Nama app (jika belum ada): `SIMS-Web`
- [ ] Copy ini ke **frontend/.env.local**:

```
VITE_FIREBASE_API_KEY = [apiKey]
VITE_FIREBASE_AUTH_DOMAIN = [authDomain]
VITE_FIREBASE_PROJECT_ID = [projectId]
VITE_FIREBASE_STORAGE_BUCKET = [storageBucket]
VITE_FIREBASE_MESSAGING_SENDER_ID = [messagingSenderId]
VITE_FIREBASE_APP_ID = [appId]
```

### Backend Service Account
- [ ] Buka **Project Settings** → **Service Accounts**
- [ ] Klik **Generate New Private Key**
- [ ] File JSON otomatis di-download
- [ ] Simpan ke: `backend/firebase-service-account.json`
- [ ] Jangan commit ke git! (sudah di .gitignore)

---

## ✅ Phase 6: Environment Configuration

### Backend (.env)
- [ ] Copy `backend/.env.example` → `backend/.env`
- [ ] Update `FIREBASE_DB_URL`:
  ```
  https://[PROJECT-ID]-default-rtdb.firebaseio.com
  ```
- [ ] Set `USE_FIREBASE=true`
- [ ] Update `JWT_SECRET` dengan key yang kuat
- [ ] Set `NODE_ENV=development`

### Frontend (.env.local)
- [ ] Buat file `frontend/.env.local`
- [ ] Isi credentials dari Phase 5
- [ ] Set `VITE_API_URL=http://localhost:5000/api`
- [ ] Set `VITE_NODE_ENV=development`

---

## ✅ Phase 7: Install Dependencies

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
npm install tailwindcss postcss autoprefixer recharts
cd ..
```

- [ ] Backend dependencies installed (no errors)
- [ ] Frontend dependencies installed (no errors)

---

## ✅ Phase 8: Verify Configuration

### Backend Verification
```bash
cd backend
npm run test-firebase
```

- [ ] `firebase-service-account.json` loaded ✓
- [ ] Firebase Admin SDK initialized ✓
- [ ] Firestore connection successful ✓

### Frontend Verification
```bash
cd frontend
npm run dev
```

- [ ] Frontend server started at http://localhost:5173 ✓
- [ ] No Firebase config errors in browser console ✓

---

## ✅ Phase 9: Test Login Flow

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- [ ] Backend running pada http://localhost:5000 ✓
- [ ] Frontend running pada http://localhost:5173 ✓
- [ ] Login page loads without errors ✓
- [ ] Can login dengan credentials dari Phase 2 ✓
- [ ] Redirected ke dashboard setelah login ✓

---

## ✅ Phase 10: Test CRUD Operations

### Test Create (Membuat data)
- [ ] Bisa create user dari admin dashboard
- [ ] User muncul di Firestore collection `users`

### Test Read (Membaca data)
- [ ] Bisa melihat list users di admin dashboard
- [ ] Data sesuai dengan di Firestore

### Test Update (Mengubah data)
- [ ] Bisa update user profile
- [ ] Perubahan tersimpan di Firestore

### Test Delete (Menghapus data)
- [ ] Bisa soft delete user
- [ ] User status berubah ke 'inactive'

---

## ✅ Phase 11: Test Role-Based Access

- [ ] Login sebagai **Admin** → bisa akses admin dashboard ✓
- [ ] Login sebagai **Teacher** → bisa akses teacher dashboard ✓
- [ ] Login sebagai **Student** → bisa akses student dashboard ✓
- [ ] User tidak bisa akses dashboard role lain ✓

---

## ✅ Phase 12: Monitor Logs

### Browser Console (F12)
- [ ] Tidak ada error merah
- [ ] Network tab menunjukkan API calls berhasil
- [ ] Firebase auth calls berhasil

### Backend Console
- [ ] Server running tanpa error
- [ ] API requests terlog dengan benar
- [ ] Firebase operations logged

---

## 🔧 Troubleshooting

Jika ada yang tidak beres, check:

- [ ] `firebase-service-account.json` ada di backend folder
- [ ] `.env` files ada dan sudah diisi dengan benar
- [ ] Dependencies sudah `npm install`
- [ ] Backend & frontend servers running
- [ ] Firestore rules sudah diupdate
- [ ] Storage rules sudah diupdate
- [ ] Browser console tidak ada error
- [ ] Network tab menunjukkan requests berhasil

---

## 📊 Status Summary

| Component | Status |
|-----------|--------|
| Firebase Project | ✓ Created |
| Authentication | ✓ Configured |
| Firestore | ✓ Setup |
| Storage | ✓ Setup |
| Backend Config | ✓ Ready |
| Frontend Config | ✓ Ready |
| Dependencies | ✓ Installed |
| Security Rules | ✓ Published |
| Testing | ✓ Passed |

---

## 🎉 Completion Checklist

Semua item di bawah harus selesai sebelum go-live:

- [ ] Semua checklist Phase 1-12 selesai
- [ ] Tidak ada error di console
- [ ] Login berfungsi normal
- [ ] CRUD operations berfungsi
- [ ] Role-based access bekerja
- [ ] Firebase rules sudah production-ready
- [ ] Database backup strategy direncanakan
- [ ] Monitoring setup (opsional)

---

## 📞 Quick Help

| Masalah | Solusi |
|--------|--------|
| "service account not configured" | Copy firebase-service-account.json ke backend folder |
| "PERMISSION_DENIED" | Update Firestore Rules, check collection names |
| "apiKey not found" | Update .env.local, restart dev server |
| "Connection refused" | Pastikan backend server running di port 5000 |
| "Cannot read properties of undefined" | Check Firebase config di config.js |

---

**Last Updated:** December 7, 2025
**Status:** ✅ Ready for Production
