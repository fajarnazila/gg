# Panduan Lengkap Koneksi Firebase ke SIMS

## 📋 Daftar Checklist Firebase

Ikuti langkah-langkah ini untuk menghubungkan Firebase dengan sempurna:

## ✅ Langkah 1: Membuat Proyek Firebase

### A. Buka Firebase Console
1. Kunjungi https://console.firebase.google.com/
2. Klik "Buat Proyek" atau "Create Project"
3. Masukkan nama proyek (contoh: "SIMS-School")
4. Pilih lokasi (Indonesia/Asia Tenggara)
5. Klik "Buat Proyek" dan tunggu selesai

### B. Catat Project ID
- Project ID dapat dilihat di:
  - Firebase Console → Project Settings → General
  - Contoh format: `sims-school-abc123`

---

## ✅ Langkah 2: Setup Authentication (Firebase Auth)

### Enable Email/Password Authentication
1. Di Firebase Console, buka: **Authentication** → **Sign-in method**
2. Klik provider **Email/Password**
3. Aktifkan **Email/Password** (toggle ke ON)
4. Klik **Save**
5. (Opsional) Aktifkan juga "Email link (passwordless sign-in)" jika diperlukan

### Konfigurasi Pengaturan Keamanan
- Buka **Authentication** → **Settings**
- Di bawah "User account linking", pastikan sesuai kebutuhan
- Di bawah "Multi-tenancy", tidak perlu diubah

---

## ✅ Langkah 3: Setup Firestore Database

### Create Firestore Database
1. Buka menu **Firestore Database**
2. Klik **Create Database**
3. Pilih mode:
   - **Development Mode**: Untuk testing (REKOMENDASI awal)
   - **Production Mode**: Untuk production
4. Pilih lokasi: **asia-southeast1** (Indonesia)
5. Klik **Create**
6. Tunggu hingga database siap

### Setup Firestore Security Rules (Penting!)
1. Buka **Firestore Database** → **Rules**
2. Hapus rules default yang tidak aman
3. Ganti dengan rules di bawah (lihat file `firestore.rules`)

---

## ✅ Langkah 4: Setup Storage (Firebase Storage)

### Create Storage Bucket
1. Buka **Storage**
2. Klik **Get Started** atau **Create Bucket**
3. Pilih lokasi: **asia-southeast1** (Indonesia)
4. Pilih mode: **Start in test mode** (untuk development)
5. Klik **Create**

---

## ✅ Langkah 5: Dapatkan Kunci API Frontend

### Web App Configuration
1. Di Project Settings, klik **Aplikasi** atau **Your apps**
2. Cari atau buat aplikasi dengan icon Web `</>`
3. Jika belum ada, klik tombol `</>`
4. Masukkan nama app (contoh: "SIMS-Web")
5. Klik **Register app**
6. Copy konfigurasi Firebase (akan tampil di layar)

Contoh konfigurasi:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "sims-school-abc123.firebaseapp.com",
  projectId: "sims-school-abc123",
  storageBucket: "sims-school-abc123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

---

## ✅ Langkah 6: Buat Service Account untuk Backend

### Generate Service Account Key
1. Buka **Project Settings** → **Service Accounts**
2. Klik tab **Service Accounts**
3. Klik **Generate New Private Key**
4. File JSON akan otomatis di-download
5. **PENTING**: Simpan file ini dengan aman!

File JSON berisi:
```json
{
  "type": "service_account",
  "project_id": "sims-school-abc123",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@sims-school-abc123.iam.gserviceaccount.com",
  ...
}
```

---

## ✅ Langkah 7: Konfigurasi File Backend

### 1. Copy Service Account ke Backend
```bash
# Dari folder download, copy ke:
# sims-project/backend/firebase-service-account.json
```

### 2. Setup File `.env` Backend
Buat file `backend/.env`:

```dotenv
# Firebase Configuration
PORT=5000
NODE_ENV=development
USE_FIREBASE=true

# Database URL
FIREBASE_DB_URL=https://sims-school-abc123-default-rtdb.firebaseio.com

# Server
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-key-12345

# Security
BCRYPT_ROUNDS=12

# Email (opsional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## ✅ Langkah 8: Konfigurasi File Frontend

### 1. Setup File `.env.local` Frontend
Buat file `frontend/.env.local`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=sims-school-abc123.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sims-school-abc123
VITE_FIREBASE_STORAGE_BUCKET=sims-school-abc123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Backend API
VITE_API_URL=http://localhost:5000/api

# Development
VITE_NODE_ENV=development
```

### 2. Verifikasi Frontend Config
File `frontend/src/firebase/config.js` sudah benar:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

---

## ✅ Langkah 9: Setup Firestore Collections

### Buat Struktur Database
Di Firebase Console → Firestore Database, buat collection berikut:

#### 1. Collection: `users`
Struktur dokumen:
```json
{
  "uid": "user-id",
  "email": "user@example.com",
  "displayName": "Nama User",
  "role": "student", // admin, teacher, student, parent, dll
  "status": "active",
  "classId": "class-123",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### 2. Collection: `classes`
Struktur dokumen:
```json
{
  "name": "Kelas X A",
  "grade": "10",
  "academicYear": "2024-2025",
  "teacherId": "teacher-uid",
  "students": ["student-uid-1", "student-uid-2"],
  "status": "active",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### 3. Collection: `grades`
Struktur dokumen:
```json
{
  "studentId": "student-uid",
  "teacherId": "teacher-uid",
  "classId": "class-123",
  "subjectId": "subject-123",
  "type": "midterm", // assignment, quiz, midterm, final, project
  "score": 85,
  "maxScore": 100,
  "percentage": 85.0,
  "gradeLetter": "B",
  "createdAt": "timestamp"
}
```

#### 4. Collection: `attendance`
Struktur dokumen:
```json
{
  "classId": "class-123",
  "teacherId": "teacher-uid",
  "date": "timestamp",
  "records": [
    {
      "studentId": "student-uid",
      "status": "present", // present, absent, late, excused
      "notes": "..."
    }
  ],
  "createdAt": "timestamp"
}
```

#### 5. Collection: `payments`
Struktur dokumen:
```json
{
  "studentId": "student-uid",
  "amount": 500000,
  "type": "tuition", // tuition, building, activity, etc
  "description": "Biaya SPP Bulan Januari",
  "paymentMethod": "cash",
  "status": "paid", // paid, pending, overdue
  "recordedBy": "treasurer-uid",
  "paymentDate": "timestamp",
  "createdAt": "timestamp"
}
```

---

## ✅ Langkah 10: Test Koneksi

### Backend Test
```bash
cd backend

# Install dependencies jika belum
npm install

# Jalankan server
npm run dev
```

Di console backend, harus muncul:
```
Firebase Admin SDK initialized successfully
Server running on port 5000
Environment: development
```

### Frontend Test
```bash
cd frontend

# Install dependencies jika belum
npm install

# Jalankan development server
npm run dev
```

Akses: `http://localhost:5173`

Harus bisa:
- ✅ Buka halaman login
- ✅ Coba login dengan email (akan terhubung ke Firebase Auth)
- ✅ Lihat pesan error jika user tidak ada

---

## ✅ Langkah 11: Keamanan Firestore Rules

### Setup Production Security Rules
1. Di Firebase Console, buka **Firestore Database** → **Rules**
2. Copy rules dari file `firestore.rules` (lihat di project)
3. Paste dan klik **Publish**

Atau gunakan rules dasar untuk development:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Setiap user bisa baca/tulis dokumen miliknya
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Admin bisa baca semua
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## ✅ Langkah 12: Setup Storage Rules

1. Firebase Console → **Storage** → **Rules**
2. Ganti dengan:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
  }
}
```

---

## 🔧 Troubleshooting

### Error: "Firebase service account not configured"
**Solusi:**
1. Pastikan `firebase-service-account.json` ada di folder backend
2. Pastikan file JSON valid (buka dengan text editor)
3. Set `USE_FIREBASE=true` di `.env`

### Error: "PERMISSION_DENIED"
**Solusi:**
1. Check Firestore Rules di Firebase Console
2. Pastikan user sudah login (authenticated)
3. Check collection name sesuai dengan rules

### Error: "apiKey not found"
**Solusi:**
1. Pastikan `.env.local` ada di folder frontend
2. Pastikan variable `VITE_FIREBASE_API_KEY` ada
3. Restart dev server setelah update `.env.local`

### Frontend Tidak Bisa Login
**Solusi:**
1. Check browser console untuk error (F12)
2. Pastikan backend running di `http://localhost:5000`
3. Check CORS setting di backend `.env`

---

## 📊 Diagram Koneksi

```
┌─────────────────┐
│   Firebase      │
│   Console       │
└────────┬────────┘
         │
         ├─── Service Account ──────┐
         │                          │
         ├─── Web Config ────────┐  │
         │                       │  │
         │                    ┌──┴──┴──────────────┐
         │                    │                    │
    ┌────┴────────┐      ┌────┴──────┐    ┌──────┴─────┐
    │   Frontend   │      │  Backend   │    │  Firestore │
    │ (React/Vite)│      │ (Express)  │    │ Database   │
    └─────────────┘      └────────────┘    └────────────┘
```

---

## ✅ Verifikasi Final

Sebelum go-live, pastikan:

- [ ] Firebase Project sudah dibuat
- [ ] Authentication diaktifkan
- [ ] Firestore Database dibuat
- [ ] Storage Bucket dibuat
- [ ] Service Account key sudah download
- [ ] `.env` backend sudah setup
- [ ] `.env.local` frontend sudah setup
- [ ] `firebase-service-account.json` ada di backend
- [ ] Collections sudah dibuat
- [ ] Firestore Rules sudah diupdate
- [ ] Backend bisa koneksi ke Firebase
- [ ] Frontend bisa koneksi ke Firebase
- [ ] Login berfungsi normal
- [ ] API endpoints berfungsi

---

## 📞 Support

Jika ada masalah:
1. Check browser console (F12)
2. Check backend console
3. Verifikasi credentials di Firebase Console
4. Baca error message dengan teliti
5. Check dokumentasi Firebase: https://firebase.google.com/docs

---

**Status:** ✅ Siap untuk Production setelah semua langkah selesai
