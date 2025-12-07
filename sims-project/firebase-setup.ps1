# Firebase Setup Script untuk Windows
# Run sebagai Administrator

Write-Host "================================" -ForegroundColor Cyan
Write-Host "SIMS Firebase Setup Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Colors
$Success = 'Green'
$Error = 'Red'
$Warning = 'Yellow'

# Function untuk print header
function Print-Header($text) {
    Write-Host ""
    Write-Host $text -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
}

# Function untuk print success
function Print-Success($text) {
    Write-Host "✓ $text" -ForegroundColor Green
}

# Function untuk print error
function Print-Error($text) {
    Write-Host "✗ $text" -ForegroundColor Red
}

# Function untuk print warning
function Print-Warning($text) {
    Write-Host "⚠ $text" -ForegroundColor Yellow
}

# Step 1: Check Prerequisites
Print-Header "Step 1: Checking Prerequisites"

$files = @(
    "backend\.env.example",
    "frontend\.env.example",
    "firestore.rules",
    "storage.rules"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Print-Success "$file found"
    } else {
        Print-Error "$file NOT found"
    }
}

# Step 2: Create .env files
Print-Header "Step 2: Creating .env files"

# Backend .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend\.env..."
    Copy-Item "backend\.env.example" "backend\.env"
    Print-Success "backend\.env created"
    Print-Warning "IMPORTANT: Update backend\.env with Firebase credentials!"
} else {
    Print-Success "backend\.env already exists"
}

# Frontend .env.local
if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "Creating frontend\.env.local..."
    @"
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
"@ | Out-File "frontend\.env.local" -Encoding UTF8
    Print-Success "frontend\.env.local created"
    Print-Warning "IMPORTANT: Update frontend\.env.local with Firebase credentials!"
} else {
    Print-Success "frontend\.env.local already exists"
}

# Step 3: Create directories
Print-Header "Step 3: Creating required directories"

$dirs = @(
    "backend\uploads",
    "frontend\public\uploads",
    "logs"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Print-Success "$dir created"
    } else {
        Print-Success "$dir already exists"
    }
}

# Step 4: Check service account
Print-Header "Step 4: Checking Firebase Service Account"

if (Test-Path "backend\firebase-service-account.json") {
    Print-Success "firebase-service-account.json found"
    
    # Validate JSON
    try {
        $json = Get-Content "backend\firebase-service-account.json" | ConvertFrom-Json
        Print-Success "firebase-service-account.json is valid JSON"
        Write-Host "  Project ID: $($json.project_id)" -ForegroundColor Gray
        Write-Host "  Client Email: $($json.client_email)" -ForegroundColor Gray
    } catch {
        Print-Error "firebase-service-account.json is INVALID JSON"
    }
} else {
    Print-Error "firebase-service-account.json NOT found"
    Write-Host ""
    Write-Host "To get service account:" -ForegroundColor Yellow
    Write-Host "1. Go to https://console.firebase.google.com/" -ForegroundColor Gray
    Write-Host "2. Select your project" -ForegroundColor Gray
    Write-Host "3. Go to Settings → Service Accounts" -ForegroundColor Gray
    Write-Host "4. Click 'Generate New Private Key'" -ForegroundColor Gray
    Write-Host "5. Save as: backend\firebase-service-account.json" -ForegroundColor Gray
}

# Step 5: Summary
Print-Header "Setup Summary"

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Update environment variables:" -ForegroundColor Gray
Write-Host "   - backend\.env" -ForegroundColor Gray
Write-Host "   - frontend\.env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Add firebase-service-account.json to backend\" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Update Firestore Rules in Firebase Console:" -ForegroundColor Gray
Write-Host "   - Copy content from: firestore.rules" -ForegroundColor Gray
Write-Host "   - Paste in: Firestore Database → Rules" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Update Storage Rules in Firebase Console:" -ForegroundColor Gray
Write-Host "   - Copy content from: storage.rules" -ForegroundColor Gray
Write-Host "   - Paste in: Storage → Rules" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Install dependencies:" -ForegroundColor Gray
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   cd .." -ForegroundColor Gray
Write-Host ""
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   npm install tailwindcss postcss autoprefixer recharts" -ForegroundColor Gray
Write-Host "   cd .." -ForegroundColor Gray
Write-Host ""
Write-Host "6. Test Firebase connection:" -ForegroundColor Gray
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run test-firebase" -ForegroundColor Gray
Write-Host "   cd .." -ForegroundColor Gray
Write-Host ""
Write-Host "7. Run application:" -ForegroundColor Gray
Write-Host "   # Terminal 1" -ForegroundColor Gray
Write-Host "   cd backend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Terminal 2" -ForegroundColor Gray
Write-Host "   cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "8. Open browser:" -ForegroundColor Gray
Write-Host "   http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
