import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DB_URL,
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.warn('Firebase service account not configured:', error.message);
  }
}

// Authentication middleware
const authenticateToken = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new Error('Access token required');
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Admin check middleware
const requireAdmin = async (user) => {
  try {
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      throw new Error('Admin access required');
    }

    return userData;
  } catch (error) {
    throw new Error('Admin check failed');
  }
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
    res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
    res.setHeader('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials']);
    res.status(200).end();
    return;
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const user = await authenticateToken(req);

    switch (req.method) {
      case 'GET':
        if (req.query.stats === 'overview') {
          return await handleGetStats(req, res, user);
        } else if (req.query.uid) {
          return await handleGetUser(req, res, user);
        } else {
          return await handleGetUsers(req, res, user);
        }

      case 'POST':
        if (req.query.bulk) {
          return await handleBulkOperation(req, res, user);
        } else {
          return await handleCreateUser(req, res, user);
        }

      case 'PUT':
        return await handleUpdateUser(req, res, user);

      case 'DELETE':
        return await handleDeleteUser(req, res, user);

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Users API error:', error);
    res.status(error.message.includes('token') ? 401 :
               error.message.includes('Admin') ? 403 : 500)
       .json({ error: error.message });
  }
}

async function handleGetUsers(req, res, user) {
  try {
    // Check admin access
    await requireAdmin(user);

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
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { role, status, search },
    });
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
}

async function handleGetUser(req, res, user) {
  try {
    const { uid } = req.query;

    // Check if user can access this profile (admin or own profile)
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin' && user.uid !== uid) {
      throw new Error('Cannot access this user profile');
    }

    const targetUserDoc = await admin.firestore().collection('users').doc(uid).get();

    if (!targetUserDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const targetUserData = targetUserDoc.data();

    // Get Firebase Auth user data
    try {
      const firebaseUser = await admin.auth().getUser(uid);
      const userResponse = {
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

      res.json({ user: userResponse });
    } catch (firebaseError) {
      // If Firebase user doesn't exist, return Firestore data only
      console.warn(`Firebase user not found for UID: ${uid}`);
      const userResponse = {
        uid,
        ...targetUserData,
        createdAt: targetUserData.createdAt?.toDate?.() || targetUserData.createdAt,
        updatedAt: targetUserData.updatedAt?.toDate?.() || targetUserData.updatedAt,
      };

      res.json({ user: userResponse });
    }
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}

async function handleCreateUser(req, res, user) {
  try {
    // Check admin access
    await requireAdmin(user);

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

    // Validate required fields
    if (!email || !password || !displayName || !role) {
      throw new Error('Missing required fields');
    }

    // Check if email already exists
    try {
      await admin.auth().getUserByEmail(email);
      res.status(409).json({ error: 'User with this email already exists' });
      return;
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
    throw error;
  }
}

async function handleUpdateUser(req, res, user) {
  try {
    const { uid } = req.query;
    const updateData = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin' && user.uid !== uid) {
      throw new Error('Cannot update this user');
    }

    // Only admins can update status and classId
    if ((updateData.status || updateData.classId) && userData?.role !== 'admin') {
      throw new Error('Admin access required for this update');
    }

    const targetUserDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!targetUserDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
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
    throw error;
  }
}

async function handleDeleteUser(req, res, user) {
  try {
    // Check admin access
    await requireAdmin(user);

    const { uid } = req.query;

    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
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
    throw error;
  }
}

async function handleBulkOperation(req, res, user) {
  try {
    // Check admin access
    await requireAdmin(user);

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
    throw error;
  }
}

async function handleGetStats(req, res, user) {
  try {
    // Check admin access
    await requireAdmin(user);

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
    throw error;
  }
}
