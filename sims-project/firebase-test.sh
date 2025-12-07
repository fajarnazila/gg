#!/bin/bash

# Firebase Connection Test Script
# Script ini menguji koneksi ke Firebase

echo "=================================="
echo "Firebase Connection Test"
echo "=================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function untuk print result
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ $2${NC}"
  else
    echo -e "${RED}✗ $2${NC}"
  fi
}

# Test 1: Check .env files
echo "Test 1: Environment Files"
echo "------------------------"

if [ -f "backend/.env" ]; then
  print_result 0 "backend/.env exists"
else
  print_result 1 "backend/.env NOT found"
fi

if [ -f "frontend/.env.local" ]; then
  print_result 0 "frontend/.env.local exists"
else
  print_result 1 "frontend/.env.local NOT found"
fi

# Test 2: Check service account
echo ""
echo "Test 2: Firebase Service Account"
echo "--------------------------------"

if [ -f "backend/firebase-service-account.json" ]; then
  print_result 0 "firebase-service-account.json exists"
  
  # Check if valid JSON
  if python3 -m json.tool backend/firebase-service-account.json > /dev/null 2>&1; then
    print_result 0 "firebase-service-account.json is valid JSON"
  else
    print_result 1 "firebase-service-account.json is INVALID JSON"
  fi
else
  print_result 1 "firebase-service-account.json NOT found"
fi

# Test 3: Check environment variables
echo ""
echo "Test 3: Required Environment Variables"
echo "-------------------------------------"

# Backend
if grep -q "FIREBASE_DB_URL" backend/.env; then
  print_result 0 "FIREBASE_DB_URL found in backend/.env"
else
  print_result 1 "FIREBASE_DB_URL NOT found in backend/.env"
fi

if grep -q "USE_FIREBASE" backend/.env; then
  print_result 0 "USE_FIREBASE found in backend/.env"
else
  print_result 1 "USE_FIREBASE NOT found in backend/.env"
fi

# Frontend
if grep -q "VITE_FIREBASE_API_KEY" frontend/.env.local; then
  print_result 0 "VITE_FIREBASE_API_KEY found in frontend/.env.local"
else
  print_result 1 "VITE_FIREBASE_API_KEY NOT found in frontend/.env.local"
fi

if grep -q "VITE_FIREBASE_PROJECT_ID" frontend/.env.local; then
  print_result 0 "VITE_FIREBASE_PROJECT_ID found in frontend/.env.local"
else
  print_result 1 "VITE_FIREBASE_PROJECT_ID NOT found in frontend/.env.local"
fi

# Test 4: Check node_modules
echo ""
echo "Test 4: Dependencies"
echo "-------------------"

if [ -d "backend/node_modules" ]; then
  print_result 0 "backend/node_modules exists"
else
  print_result 1 "backend/node_modules NOT found - run 'npm install' in backend"
fi

if [ -d "frontend/node_modules" ]; then
  print_result 0 "frontend/node_modules exists"
else
  print_result 1 "frontend/node_modules NOT found - run 'npm install' in frontend"
fi

# Test 5: Check required npm packages
echo ""
echo "Test 5: Required Packages"
echo "------------------------"

if grep -q "firebase-admin" backend/package.json; then
  print_result 0 "firebase-admin in backend/package.json"
else
  print_result 1 "firebase-admin NOT in backend/package.json"
fi

if grep -q "firebase" frontend/package.json; then
  print_result 0 "firebase in frontend/package.json"
else
  print_result 1 "firebase NOT in frontend/package.json"
fi

# Test 6: Runtime check (if node is available)
echo ""
echo "Test 6: Runtime Check"
echo "-------------------"

if command -v node &> /dev/null; then
  print_result 0 "Node.js is installed"
  
  # Try to load backend config
  if node -e "require('dotenv').config({path: 'backend/.env'}); console.log(process.env.FIREBASE_DB_URL);" 2>/dev/null | grep -q "http"; then
    print_result 0 "Backend Firebase URL is configured"
  else
    print_result 1 "Backend Firebase URL NOT configured"
  fi
else
  print_result 1 "Node.js is NOT installed"
fi

# Final summary
echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
echo ""
echo "Jika ada test yang FAILED (✗):"
echo "1. Pastikan firebase-service-account.json ada di backend/"
echo "2. Update .env files dengan credentials yang benar"
echo "3. Jalankan 'npm install' di backend dan frontend"
echo "4. Restart development servers"
echo ""
