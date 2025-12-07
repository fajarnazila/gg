#!/bin/bash

# Deployment Helper Script
# Usage: bash deploy.sh

set -e

echo "🚀 SIMS Project Deployment Helper"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if git is up to date
echo -e "${BLUE}Step 1: Check Git Status${NC}"
cd "$(dirname "$0")"

if [ -z "$(git status --porcelain)" ]; then
  echo -e "${GREEN}✅ Working directory is clean${NC}"
else
  echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
  git status --porcelain
  echo ""
  echo "Please commit changes first:"
  echo "  git add ."
  echo "  git commit -m 'Your message'"
  exit 1
fi

# 2. Verify frontend build
echo ""
echo -e "${BLUE}Step 2: Building Frontend${NC}"
cd frontend
npm install
npm run build

if [ -d "dist" ]; then
  echo -e "${GREEN}✅ Frontend build successful${NC}"
else
  echo -e "${YELLOW}❌ Frontend build failed${NC}"
  exit 1
fi

# 3. Check backend
echo ""
echo -e "${BLUE}Step 3: Checking Backend${NC}"
cd ../backend
npm install

if [ -f "server.js" ]; then
  echo -e "${GREEN}✅ Backend ready${NC}"
else
  echo -e "${YELLOW}❌ Backend server.js not found${NC}"
  exit 1
fi

# 4. Summary
echo ""
echo -e "${GREEN}=================================="
echo "✅ All checks passed!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Frontend deployment (Vercel):"
echo "   - Push to GitHub"
echo "   - Vercel auto-deploys"
echo ""
echo "2️⃣  Backend deployment (Railway/Render):"
echo "   - railway up (if using Railway)"
echo "   - Or push to Render"
echo ""
echo "3️⃣  Update environment variables:"
echo "   - Frontend .env.local"
echo "   - Backend .env"
echo ""
echo "For details, see:"
echo "  - VERCEL_QUICKSTART.md"
echo "  - BACKEND_DEPLOYMENT.md"
echo -e "${NC}"
