# TODO: Merge Frontend and Backend for Vercel Deployment

## ✅ Completed Tasks

### Initial Setup
- [x] Analyze current project structure
- [x] Understand backend Express routes
- [x] Plan conversion to Vercel serverless functions
- [x] Get user approval for plan

## 🔄 In Progress / Next Steps

### 1. Project Structure Changes
- [ ] Create `frontend/api/` directory for serverless functions
- [ ] Move Firebase service account from backend to frontend
- [ ] Merge backend dependencies into frontend package.json

### 2. Convert Backend Routes to Serverless Functions
- [ ] Convert `backend/routes/auth.js` → `frontend/api/auth/[...auth].js`
- [ ] Convert `backend/routes/users.js` → `frontend/api/users.js`
- [ ] Convert `backend/routes/classes.js` → `frontend/api/classes.js`
- [ ] Convert `backend/routes/grades.js` → `frontend/api/grades.js`
- [ ] Convert `backend/routes/attendance.js` → `frontend/api/attendance.js`
- [ ] Convert `backend/routes/payments.js` → `frontend/api/payments.js`
- [ ] Convert `backend/routes/health.js` → `frontend/api/health.js`

### 3. Firebase Integration
- [ ] Initialize Firebase Admin SDK in serverless functions
- [ ] Ensure Firebase service account is properly configured
- [ ] Test Firebase Firestore connections

### 4. Frontend Updates
- [ ] Update API calls to use relative `/api/` paths
- [ ] Remove external API URL dependencies
- [ ] Update environment variables

### 5. Vercel Configuration
- [ ] Update `vercel.json` for serverless functions
- [ ] Configure build settings
- [ ] Set up environment variables for Vercel

### 6. Testing & Validation
- [ ] Test all API endpoints locally
- [ ] Verify Firebase database operations
- [ ] Test authentication flow
- [ ] Test role-based access
- [ ] Deploy to Vercel and verify functionality

### 7. Cleanup
- [ ] Remove old backend directory
- [ ] Update documentation
- [ ] Final verification

## 📋 Key Technical Details

- **Current Structure:** Separate frontend/ and backend/ folders
- **Target Structure:** Unified frontend with api/ serverless functions
- **Firebase:** Admin SDK for serverless, Client SDK for frontend
- **Deployment:** Single Vercel project with frontend + serverless backend
- **API Routes:** Convert Express routers to Vercel API routes

## 🔧 Dependencies to Add to Frontend
- express (for middleware compatibility)
- cors
- dotenv
- firebase-admin
- helmet
- compression
- express-rate-limit
- express-validator
- bcryptjs
- jsonwebtoken
- multer
- nodemailer
- winston
- express-fileupload

## 📝 Notes
- All serverless functions will use Firebase Admin SDK
- Authentication middleware needs conversion to work with Vercel
- File uploads may need adjustment for serverless environment
- CORS needs to be handled per function or globally
