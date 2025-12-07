# Firebase Troubleshooting Guide

## 🔧 Panduan Pemecahan Masalah Firebase

Panduan ini membantu mengatasi masalah umum saat setup Firebase.

---

## ❌ Error: "Firebase service account not configured"

### Penyebab
- File `firebase-service-account.json` tidak ada di folder backend
- Path file tidak benar
- File corrupted atau format salah

### Solusi
1. Buka Firebase Console: https://console.firebase.google.com/
2. Pilih project Anda
3. Pergi ke **Project Settings** → **Service Accounts**
4. Klik **Generate New Private Key**
5. File JSON akan ter-download
6. Letakkan file di: `backend/firebase-service-account.json`
7. Restart backend server

### Verifikasi
```bash
# Check apakah file ada
ls backend/firebase-service-account.json

# Validate JSON
node -e "console.log(JSON.stringify(require('./backend/firebase-service-account.json'), null, 2))"
```

---

## ❌ Error: "PERMISSION_DENIED"

### Penyebab Umum
1. Firestore Security Rules tidak diupdate
2. User tidak authenticated
3. Collection name tidak sesuai
4. Permission rule tidak match dengan operasi

### Solusi

#### 1. Update Firestore Rules
```javascript
// Buka Firebase Console → Firestore Database → Rules
// Ganti dengan content dari firestore.rules file

// Contoh rule untuk development:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 2. Check Authenticated User
Pastikan user sudah login sebelum akses database:
```javascript
// Frontend
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <div>Please login first</div>;
  }
  
  // Now can access Firestore
}
```

#### 3. Verifikasi Collection Name
```javascript
// Pastikan collection name sesuai di Firestore
// ✓ Benar: /users/{uid}
// ✗ Salah: /user/{uid} atau /Users/{uid}

// Backend
const db = admin.firestore();
const usersCollection = db.collection('users'); // 'users' = collection name
```

---

## ❌ Error: "apiKey not found" atau "VITE_FIREBASE_API_KEY"

### Penyebab
- `.env.local` file tidak ada di frontend folder
- Environment variables tidak di-load
- Development server belum di-restart setelah update `.env.local`

### Solusi

#### 1. Buat/Update `.env.local`
```bash
cd frontend

# Buat file
echo "VITE_FIREBASE_API_KEY=your-api-key" > .env.local
echo "VITE_FIREBASE_AUTH_DOMAIN=your-domain" >> .env.local
# ... dst
```

#### 2. Dapatkan Credentials
1. Firebase Console → Project Settings
2. Scroll ke "Your apps" section
3. Klik Web app `</>`
4. Copy configuration

#### 3. Restart Dev Server
```bash
# Stop development server (Ctrl+C)
# Kemudian:
npm run dev
```

#### 4. Verifikasi di Browser
```javascript
// Open browser console (F12)
// Type:
console.log(import.meta.env.VITE_FIREBASE_API_KEY)
```

---

## ❌ Error: "Connection refused" di `http://localhost:5000`

### Penyebab
- Backend server belum jalan
- Port 5000 sudah digunakan aplikasi lain
- Backend error saat startup

### Solusi

#### 1. Pastikan Backend Jalan
```bash
cd backend
npm run dev

# Harus muncul:
# Server running on port 5000
# Firebase Admin SDK initialized successfully
```

#### 2. Port Sudah Digunakan?
```bash
# Windows - check port 5000
netstat -ano | findstr :5000

# Linux/Mac - check port 5000
lsof -i :5000

# Jika ada, kill process atau gunakan port lain
# Update PORT di backend/.env
```

#### 3. Check untuk Error
Lihat pesan error di backend console:
```
TypeError: Cannot find module 'express'
  → Solution: npm install

Firebase initialization failed
  → Solution: Check firebase-service-account.json

Environment variable not set
  → Solution: Create/update .env file
```

---

## ❌ Error: "Cannot read properties of undefined" di Frontend

### Penyebab
- Firebase config belum di-initialize
- import path salah
- AuthContext tidak wrap aplikasi

### Solusi

#### 1. Verifikasi Firebase Config
```javascript
// frontend/src/firebase/config.js harus ada

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ... semua env vars
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

#### 2. Pastikan AuthProvider Wrap App
```javascript
// frontend/src/main.jsx
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
```

#### 3. Check Import Paths
```javascript
// ✓ Benar
import { auth, db } from '../firebase/config';

// ✗ Salah
import { auth, db } from './firebase-config';
```

---

## ❌ Error: "Email already exists" di Login

### Penyebab
- User sudah registrasi dengan email ini
- Cache browser menyimpan email lama

### Solusi

#### 1. Gunakan Email Berbeda
```javascript
// Try dengan email baru
test123@example.com  // Ganti angka atau domain
```

#### 2. Clear Browser Cache
- F12 → Application → Clear Storage
- Atau gunakan Incognito window

#### 3. Hapus User dari Firebase
- Firebase Console → Authentication → Users
- Pilih user, klik delete

---

## ❌ Error: "Invalid JSON" di Service Account

### Penyebab
- File format tidak UTF-8
- Ada whitespace atau karakters invalid
- File partial/incomplete

### Solusi

#### 1. Validate JSON
```bash
# Terminal
node -e "console.log(JSON.parse(require('fs').readFileSync('./backend/firebase-service-account.json', 'utf8')))"
```

#### 2. Download Ulang
- Hapus file lama
- Ke Firebase Console → Service Accounts
- Generate New Private Key lagi
- Download dan letakkan di backend folder

#### 3. Check File Encoding
- Pastikan file UTF-8 (bukan ANSI atau encoding lain)
- Gunakan text editor yang support UTF-8
- Contoh: VS Code (sudah default UTF-8)

---

## ❌ Error: "Cannot find module 'dotenv'"

### Penyebab
- Dependencies belum di-install
- package.json tidak ada 'dotenv'

### Solusi

#### 1. Install Dependencies
```bash
cd backend
npm install

# Atau jika ingin install dotenv saja:
npm install dotenv
```

#### 2. Verifikasi package.json
```json
{
  "dependencies": {
    "dotenv": "^16.3.1",
    "firebase-admin": "^11.11.1",
    "express": "^4.18.2"
    // ... more packages
  }
}
```

---

## ❌ Error: CORS Error

### Penyebab
- Frontend dan backend CORS mismatch
- Browser blocking request dari domain berbeda

### Solusi

#### 1. Update Backend CORS
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```

#### 2. Update Environment Variable
```dotenv
# backend/.env
CORS_ORIGIN=http://localhost:5173

# Jika frontend di port berbeda:
CORS_ORIGIN=http://localhost:3000
```

#### 3. Restart Backend
```bash
cd backend
npm run dev
```

---

## ❌ Error: Firestore Collection Not Found

### Penyebab
- Collection belum dibuat di Firestore
- Collection name typo (case sensitive)

### Solusi

#### 1. Create Collections Manually
Di Firebase Console → Firestore Database:
1. Klik "Create collection"
2. Masukkan nama: `users`, `classes`, `grades`, dll
3. Klik "Create"

#### 2. Atau Buat via Code
```javascript
// Backend code
const db = admin.firestore();

// Create collection dengan doc pertama
await db.collection('users').doc('doc-id').set({
  name: 'Test User',
  role: 'student'
});
```

#### 3. Verifikasi Case Sensitivity
```javascript
// ✓ Benar - sesuai dengan Firestore
db.collection('users')
db.collection('classes')
db.collection('grades')

// ✗ Salah - case sensitivity
db.collection('Users')  // Capital U
db.collection('CLASSES')  // All caps
```

---

## ❌ Error: Storage Upload Failed

### Penyebab
- Storage Rules tidak allow write
- File size terlalu besar
- Path tidak valid

### Solusi

#### 1. Update Storage Rules
```javascript
// Firebase Console → Storage → Rules

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/{allPaths=**} {
      allow read, write: if request.auth.uid == uid;
    }
    match /{allPaths=**} {
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
  }
}
```

#### 2. Check File Size
```javascript
// Max file size: 5MB
const maxSize = 5 * 1024 * 1024; // bytes

if (file.size > maxSize) {
  console.error('File too large');
}
```

#### 3. Verify Upload Path
```javascript
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from './config';

const storageRef = ref(storage, `users/${uid}/profile.jpg`);
await uploadBytes(storageRef, file);
```

---

## ✅ Quick Debug Checklist

Sebelum report bug, check:

- [ ] `.env` dan `.env.local` sudah setup
- [ ] `firebase-service-account.json` ada di backend
- [ ] Backend running tanpa error
- [ ] Frontend running tanpa error
- [ ] Browser console F12 tidak ada error merah
- [ ] Network tab menunjukkan API call success
- [ ] Firestore Rules sudah diupdate
- [ ] Storage Rules sudah diupdate
- [ ] User sudah authenticated
- [ ] Collection names sesuai (case sensitive)

---

## 📞 Jika Masih Bermasalah

1. **Check Dokumentasi:**
   - https://firebase.google.com/docs
   - https://firebase.google.com/docs/firestore/troubleshoot

2. **Check Console Logs:**
   - Browser Console (F12)
   - Backend Console
   - Firebase Console Logs

3. **Stack Overflow:**
   - Search error message + Firebase

4. **Firebase Support:**
   - Firebase Console → Help & Support

---

## 📋 Error Message Reference

| Error | Solution |
|-------|----------|
| "service account not configured" | Copy service account JSON to backend folder |
| "PERMISSION_DENIED" | Update Firestore Security Rules |
| "apiKey not found" | Create/update .env.local with credentials |
| "Connection refused" | Start backend server with `npm run dev` |
| "Cannot find module" | Run `npm install` |
| "CORS error" | Update CORS_ORIGIN in .env |
| "Collection not found" | Create collection in Firestore Console |
| "Unauthorized" | Check authentication & user login |

---

**Last Updated:** December 7, 2025
**Status:** ✅ Comprehensive Troubleshooting Guide
