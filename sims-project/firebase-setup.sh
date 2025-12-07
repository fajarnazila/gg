#!/bin/bash

# SIMS Firebase Setup Script
# Script ini membantu setup Firebase secara otomatis

echo "=================================="
echo "SIMS Firebase Setup Helper"
echo "=================================="
echo ""

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function untuk print header
print_header() {
  echo ""
  echo -e "${YELLOW}$1${NC}"
  echo "=================================="
}

# Function untuk print success
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function untuk print error
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Cek apakah file-file required ada
print_header "Step 1: Checking Prerequisites"

if [ -f "backend/.env.example" ]; then
  print_success "backend/.env.example ditemukan"
else
  print_error "backend/.env.example tidak ditemukan"
fi

if [ -f "frontend/.env.example" ]; then
  print_success "frontend/.env.example ditemukan"
else
  print_error "frontend/.env.example tidak ditemukan"
fi

# Create .env files if they don't exist
print_header "Step 2: Creating .env files"

if [ ! -f "backend/.env" ]; then
  echo "Membuat backend/.env..."
  cp backend/.env.example backend/.env
  print_success "backend/.env dibuat"
  echo -e "${YELLOW}⚠ PENTING: Update backend/.env dengan credentials Firebase Anda!${NC}"
else
  print_success "backend/.env sudah ada"
fi

if [ ! -f "frontend/.env.local" ]; then
  echo "Membuat frontend/.env.local..."
  cat > frontend/.env.local << 'EOF'
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Backend API
VITE_API_URL=http://localhost:5000/api

# Development
VITE_NODE_ENV=development
EOF
  print_success "frontend/.env.local dibuat"
  echo -e "${YELLOW}⚠ PENTING: Update frontend/.env.local dengan credentials Firebase Anda!${NC}"
else
  print_success "frontend/.env.local sudah ada"
fi

# Create required directories
print_header "Step 3: Creating required directories"

mkdir -p backend/uploads 2>/dev/null && print_success "backend/uploads dibuat"
mkdir -p frontend/public/uploads 2>/dev/null && print_success "frontend/public/uploads dibuat"

# Check for service account file
print_header "Step 4: Checking Firebase Service Account"

if [ -f "backend/firebase-service-account.json" ]; then
  print_success "firebase-service-account.json ditemukan"
else
  print_error "firebase-service-account.json TIDAK ditemukan"
  echo ""
  echo "Untuk mendapatkan service account:"
  echo "1. Buka https://console.firebase.google.com/"
  echo "2. Pilih project Anda"
  echo "3. Buka Settings → Service Accounts"
  echo "4. Klik 'Generate New Private Key'"
  echo "5. Copy file ke: backend/firebase-service-account.json"
fi

# Summary
print_header "Setup Summary"

echo ""
echo "Langkah berikutnya:"
echo ""
echo "1. Update environment variables:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo ""
echo "2. Tambahkan firebase-service-account.json ke backend/"
echo ""
echo "3. Buat Security Rules di Firebase Console:"
echo "   - Firestore Rules: Copy dari firestore.rules"
echo "   - Storage Rules: Copy dari storage.rules"
echo ""
echo "4. Install dependencies:"
echo "   cd backend && npm install"
echo "   cd ../frontend && npm install"
echo ""
echo "5. Jalankan aplikasi:"
echo "   # Terminal 1"
echo "   cd backend && npm run dev"
echo ""
echo "   # Terminal 2"
echo "   cd frontend && npm run dev"
echo ""
echo "6. Akses aplikasi di http://localhost:5173"
echo ""
echo -e "${GREEN}Setup selesai!${NC}"
