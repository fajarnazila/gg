#!/bin/bash
# Project completion verification script

echo "🔍 SIMS Project Completion Verification"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check backend files
echo -e "\n${YELLOW}Backend Files:${NC}"
backend_files=(
  "backend/server.js"
  "backend/package.json"
  "backend/routes/auth.js"
  "backend/routes/users.js"
  "backend/routes/classes.js"
  "backend/routes/grades.js"
  "backend/routes/attendance.js"
  "backend/routes/payments.js"
  "backend/routes/health.js"
  "backend/.env.example"
  "backend/firebase-service-account.example.json"
)

for file in "${backend_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file"
  fi
done

# Check frontend files
echo -e "\n${YELLOW}Frontend Files:${NC}"
frontend_files=(
  "frontend/src/App.jsx"
  "frontend/src/main.jsx"
  "frontend/src/pages/Login.jsx"
  "frontend/src/contexts/AuthContext.jsx"
  "frontend/src/firebase/config.js"
  "frontend/src/components/auth/ProtectedRoute.jsx"
  "frontend/src/components/dashboard/Dashboard.jsx"
  "frontend/src/components/dashboard/AdminDashboard.jsx"
  "frontend/src/components/dashboard/TeacherDashboard.jsx"
  "frontend/src/components/dashboard/StudentDashboard.jsx"
  "frontend/src/components/dashboard/VicePrincipalDashboard.jsx"
  "frontend/src/components/dashboard/TreasurerDashboard.jsx"
  "frontend/src/components/dashboard/ExamSupervisorDashboard.jsx"
  "frontend/src/components/dashboard/SchoolHealthDashboard.jsx"
  "frontend/src/components/dashboard/ParentDashboard.jsx"
  "frontend/package.json"
  "frontend/.env.example"
)

for file in "${frontend_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file"
  fi
done

# Check root files
echo -e "\n${YELLOW}Root Files:${NC}"
root_files=(
  "TODO.md"
  "SETUP.md"
  ".gitignore"
)

for file in "${root_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file"
  fi
done

echo -e "\n${GREEN}Verification Complete!${NC}"
