const express = require('express');
const admin = require('firebase-admin');
const { body, param, query, validationResult } = require('express-validator');

const router = express.Router();

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Middleware to check admin role
const requireAdmin = async (req, res, next) => {
  try {
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    req.userProfile = userData;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users with filtering and pagination
router.get('/', verifyToken, requireAdmin, [
  query('role').optional().isIn(['admin', 'teacher', 'student', 'vice_principal', 'treasurer', 'exam_supervisor', 'school_health', 'parent']),
  query('status').optional().isIn(['active', 'inactive']),
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid query parameters', details: errors.array() });
    }

    const { role, status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = admin.firestore().collection('users');

    // Apply filters
    if (role) {
      query = query.where('role', '==', role);
    }
    if (status) {
      query = query.where('status', '==', status);
    }

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply ordering and pagination
    query = query.orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();
    let users = [];

    for (const doc of snapshot.docs) {
      const userData = doc.data();

      // Get Firebase Auth user data
      try {
        const firebaseUser = await admin.auth().getUser(doc.id);
        users.push({
          uid: doc.id,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          disabled: firebaseUser.disabled,
          ...userData,
          createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
          updatedAt: userData.updatedAt?.toDate?.() || userData.updatedAt,
        });
      } catch (firebaseError) {
        // If Firebase user doesn't exist, still include Firestore data
        console.warn(`Firebase user not found for UID: ${doc.id}`);
        users.push({
          uid: doc.id,
          ...userData,
          createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
          updatedAt: userData.updatedAt?.toDate?.() || userData.updatedAt,
        });
      }
    }

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.uid?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { role, status, search },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by UID
router.get('/:uid', verifyToken, [
  param('uid').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid user ID', details: errors.array() });
    }

    const { uid } = req.params;

    // Check if user can access this profile (admin or own profile)
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin' && req.user.uid !== uid) {
      return res.status(403).json({ error: 'Forbidden: Cannot access this user profile' });
    }

    const targetUserDoc = await admin.firestore().collection('users').doc(uid).get();

    if (!targetUserDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetUserData = targetUserDoc.data();

    // Get Firebase Auth user data
    try {
      const firebaseUser = await admin.auth().getUser(uid);
      const user = {
        uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        disabled: firebaseUser.disabled,
        ...targetUserData,
        createdAt: targetUserData.createdAt?.toDate?.() || targetUserData.createdAt,
        updatedAt: targetUserData.updatedAt?.toDate?.() || targetUserData.updatedAt,
      };

      res.json({ user });
    } catch (firebaseError) {
      // If Firebase user doesn't exist, return Firestore data only
      console.warn(`Firebase user not found for UID: ${uid}`);
      const user = {
        uid,
        ...targetUserData,
        createdAt: targetUserData.createdAt?.toDate?.() || targetUserData.createdAt,
        updatedAt: targetUserData.updatedAt?.toDate?.() || targetUserData.updatedAt,
      };

      res.json({ user });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user
router.post('/', verifyToken, requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').isString().trim().isLength({ min: 1, max: 100 }),
  body('role').isIn(['admin', 'teacher', 'student', 'vice_principal', 'treasurer', 'exam_supervisor', 'school_health', 'parent']),
  body('phone').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('gender').optional().isIn(['male', 'female']),
  body('dateOfBirth').optional().isISO8601(),
  body('emergencyContact').optional().isObject(),
  body('classId').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const {
      email,
      password,
      displayName,
      role,
      phone,
      address,
      gender,
      dateOfBirth,
      emergencyContact,
      classId,
    } = req.body;

    // Check if email already exists
    try {
      await admin.auth().getUserByEmail(email);
      return res.status(409).json({ error: 'User with this email already exists' });
    } catch (error) {
      // Email doesn't exist, continue
    }

    // Create Firebase Auth user
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    // Prepare user data for Firestore
    const userData = {
      role,
      status: 'active',
      phone: phone || null,
      address: address || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      emergencyContact: emergencyContact || null,
      classId: classId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save to Firestore
    await admin.firestore().collection('users').doc(firebaseUser.uid).set(userData);

    // If student and classId provided, add to class
    if (role === 'student' && classId) {
      try {
        const classRef = admin.firestore().collection('classes').doc(classId);
        await classRef.update({
          students: admin.firestore.FieldValue.arrayUnion(firebaseUser.uid),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (classError) {
        console.warn('Failed to add student to class:', classError);
        // Don't fail the user creation if class update fails
      }
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role,
        status: 'active',
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Create user error:', error);

    // Clean up Firebase user if Firestore save failed
    if (error.code !== 'auth/email-already-exists') {
      try {
        // Note: In a real implementation, you'd want to clean up the Firebase user
        // but this is complex in Firebase Admin SDK
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    if (error.code === 'auth/email-already-exists') {
      res.status(409).json({ error: 'User with this email already exists' });
    } else if (error.code === 'auth/weak-password') {
      res.status(400).json({ error: 'Password is too weak' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update user
router.put('/:uid', verifyToken, [
  param('uid').isString().trim(),
  body('displayName').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('phone').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('gender').optional().isIn(['male', 'female']),
  body('dateOfBirth').optional().isISO8601(),
  body('emergencyContact').optional().isObject(),
  body('classId').optional().isString().trim(),
  body('status').optional().isIn(['active', 'inactive']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const { uid } = req.params;
    const updateData = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin' && req.user.uid !== uid) {
      return res.status(403).json({ error: 'Forbidden: Cannot update this user' });
    }

    // Only admins can update status and classId
    if ((updateData.status || updateData.classId) && userData?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required for this update' });
    }

    const targetUserDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!targetUserDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetUserData = targetUserDoc.data();

    // Handle class changes for students
    if (updateData.classId !== undefined && targetUserData.role === 'student') {
      const oldClassId = targetUserData.classId;
      const newClassId = updateData.classId;

      // Remove from old class
      if (oldClassId) {
        try {
          const oldClassRef = admin.firestore().collection('classes').doc(oldClassId);
          await oldClassRef.update({
            students: admin.firestore.FieldValue.arrayRemove(uid),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (error) {
          console.warn('Failed to remove student from old class:', error);
        }
      }

      // Add to new class
      if (newClassId) {
        try {
          const newClassRef = admin.firestore().collection('classes').doc(newClassId);
          await newClassRef.update({
            students: admin.firestore.FieldValue.arrayUnion(uid),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (error) {
          console.warn('Failed to add student to new class:', error);
        }
      }
    }

    // Prepare update data
    const firestoreUpdate = {
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Remove fields that shouldn't be in Firestore
    delete firestoreUpdate.displayName; // This is handled by Firebase Auth

    // Update Firestore
    await admin.firestore().collection('users').doc(uid).update(firestoreUpdate);

    // Update Firebase Auth display name if provided
    if (updateData.displayName) {
      try {
        await admin.auth().updateUser(uid, {
          displayName: updateData.displayName,
        });
      } catch (firebaseError) {
        console.warn('Failed to update Firebase Auth display name:', firebaseError);
      }
    }

    res.json({
      message: 'User updated successfully',
      uid,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (soft delete by setting status to inactive)
router.delete('/:uid', verifyToken, requireAdmin, [
  param('uid').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid user ID', details: errors.array() });
    }

    const { uid } = req.params;

    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete by updating status
    await admin.firestore().collection('users').doc(uid).update({
      status: 'inactive',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      message: 'User deactivated successfully',
      uid,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk operations
router.post('/bulk', verifyToken, requireAdmin, [
  body('operation').isIn(['activate', 'deactivate']),
  body('userIds').isArray({ min: 1 }),
  body('userIds.*').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const { operation, userIds } = req.body;
    const newStatus = operation === 'activate' ? 'active' : 'inactive';

    const batch = admin.firestore().batch();

    userIds.forEach(uid => {
      const userRef = admin.firestore().collection('users').doc(uid);
      batch.update(userRef, {
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    res.json({
      message: `${operation}d ${userIds.length} users successfully`,
      operation,
      userIds,
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats/overview', verifyToken, requireAdmin, async (req, res) => {
  try {
    const usersSnapshot = await admin.firestore().collection('users').get();

    const stats = {
      total: 0,
      active: 0,
      inactive: 0,
      byRole: {
        admin: 0,
        teacher: 0,
        student: 0,
        vice_principal: 0,
        treasurer: 0,
        exam_supervisor: 0,
        school_health: 0,
        parent: 0,
      },
    };

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      stats.total++;

      if (userData.status === 'active') {
        stats.active++;
      } else {
        stats.inactive++;
      }

      if (userData.role && stats.byRole.hasOwnProperty(userData.role)) {
        stats.byRole[userData.role]++;
      }
    });

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
