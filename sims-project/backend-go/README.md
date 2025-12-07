# SIMS Backend (Golang + Firebase)

Backend API untuk Sistem Informasi Manajemen Sekolah (SIMS) yang dibangun dengan Golang dan Firebase.

## 🚀 Fitur

- **Authentication & Authorization**: Firebase Auth dengan role-based access control
- **User Management**: CRUD operations untuk users dengan berbagai role
- **Class Management**: Pengelolaan kelas dan jadwal
- **Attendance Tracking**: Pencatatan kehadiran siswa
- **Grade Management**: Sistem penilaian dan rapor
- **Payment Management**: Sistem pembayaran SPP dan biaya lainnya

## 🛠️ Teknologi

- **Golang**: Bahasa pemrograman utama
- **Gin**: HTTP web framework
- **Firebase**: Authentication dan Firestore database
- **Docker**: Containerization

## 📋 Prerequisites

- Go 1.21 atau lebih baru
- Firebase project dengan Firestore database
- Firebase service account key

## 🚀 Quick Start

### 1. Clone dan Setup

```bash
cd sims-project/backend-go
go mod download
```

### 2. Environment Variables

Copy `.env.example` ke `.env` dan isi dengan konfigurasi Anda:

```bash
cp .env.example .env
```

### 3. Firebase Setup

- Download Firebase service account key dari Firebase Console
- Rename menjadi `firebase-service-account.json`
- Letakkan di root directory project

### 4. Run Development

```bash
go run main.go
```

### 5. Build Production

```bash
go build -o main .
./main
```

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t sims-backend-go .
```

### Run Container

```bash
docker run -p 8080:8080 --env-file .env sims-backend-go
```

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/verify     - Verifikasi token Firebase
POST /api/auth/login      - Login (redirect to frontend)
POST /api/auth/logout     - Logout
GET  /api/auth/profile    - Get user profile
PUT  /api/auth/profile    - Update user profile
POST /api/auth/change-password - Change password
```

### User Management

```
GET    /api/users         - Get all users (admin/teacher/vice_principal)
POST   /api/users         - Create user (admin/vice_principal)
GET    /api/users/:id     - Get user by ID
PUT    /api/users/:id     - Update user (admin/vice_principal)
DELETE /api/users/:id     - Delete user (admin/vice_principal)
```

### Class Management

```
GET    /api/classes       - Get all classes
POST   /api/classes       - Create class (admin/vice_principal)
GET    /api/classes/:id   - Get class by ID
PUT    /api/classes/:id   - Update class (admin/vice_principal)
DELETE /api/classes/:id   - Delete class (admin/vice_principal)
```

### Attendance Management

```
GET    /api/attendance    - Get all attendance records
POST   /api/attendance    - Create attendance record (admin/teacher)
GET    /api/attendance/:id - Get attendance record
PUT    /api/attendance/:id - Update attendance (admin/teacher)
DELETE /api/attendance/:id - Delete attendance (admin/teacher)
```

### Grade Management

```
GET    /api/grades        - Get all grades
POST   /api/grades        - Create grade (admin/teacher/exam_supervisor)
GET    /api/grades/:id    - Get grade by ID
PUT    /api/grades/:id    - Update grade (admin/teacher/exam_supervisor)
DELETE /api/grades/:id    - Delete grade (admin/exam_supervisor)
```

### Payment Management

```
GET    /api/payments      - Get all payments (admin/treasurer)
POST   /api/payments      - Create payment (admin/treasurer)
GET    /api/payments/:id  - Get payment by ID
PUT    /api/payments/:id  - Update payment (admin/treasurer)
DELETE /api/payments/:id  - Delete payment (admin/treasurer)
```

## 🔐 Role-based Access Control

- **admin**: Full access ke semua fitur
- **vice_principal**: User dan class management
- **teacher**: Attendance dan grade management
- **exam_supervisor**: Grade management
- **treasurer**: Payment management
- **student**: Read-only access
- **parent**: Limited access untuk data anak

## 🧪 Testing

```bash
# Run tests
go test ./...

# Run with coverage
go test -cover ./...
```

## 📦 Deployment

### Railway (Recommended)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Google Cloud Run

```bash
gcloud run deploy sims-backend-go \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated
```

### VPS dengan Docker

```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.
