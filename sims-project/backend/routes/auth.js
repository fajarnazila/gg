const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Verify authentication endpoint
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    res.json({
      uid: req.user.uid,
      email: req.user.email,
      role: userData?.role || 'student',
      profile: userData
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Failed to verify authentication' });
  }
});

// Login endpoint (for custom authentication if needed)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // This would typically be handled by Firebase Auth on the frontend
    // This endpoint could be used for custom authentication logic
    res.json({
      message: 'Use Firebase Auth on frontend for login',
      redirect: '/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In Firebase, logout is typically handled on the client side
    // This endpoint can be used for server-side cleanup if needed
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();

    res.json({
      uid: req.user.uid,
      email: req.user.email,
      role: userData.role,
      profile: userData,
      lastLogin: userData.lastLogin,
      isActive: userData.isActive !== false
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const { displayName, phone, address, emergencyContact, profilePicture } = req.body;

    const updateData = {
      displayName,
      phone,
      address,
      emergencyContact,
      profilePicture,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await db.collection('users').doc(req.user.uid).update(updateData);

    // Update Firebase Auth display name if provided
    if (displayName) {
      await admin.auth().updateUser(req.user.uid, { displayName });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password endpoint
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Note: Password verification should be done on the client side with Firebase Auth
    // This endpoint can be used for additional validation or logging

    await admin.auth().updateUser(req.user.uid, {
      password: newPassword
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = {
  router,
  authenticateToken,
  authorizeRoles
};
