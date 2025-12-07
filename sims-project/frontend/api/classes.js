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
        if (req.query.id) {
          return await handleGetClass(req, res);
        } else {
          return await handleGetClasses(req, res);
        }

      case 'POST':
        if (req.query.id && req.query.students) {
          return await handleAddStudent(req, res, user);
        } else {
          return await handleCreateClass(req, res, user);
        }

      case 'PUT':
        return await handleUpdateClass(req, res, user);

      case 'DELETE':
        if (req.query.studentId) {
          return await handleRemoveStudent(req, res, user);
        } else {
          return await handleDeleteClass(req, res, user);
        }

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Classes API error:', error);
    res.status(error.message.includes('token') ? 401 :
               error.message.includes('Admin') ? 403 : 500)
       .json({ error: error.message });
  }
}

async function handleGetClasses(req, res) {
  try {
    const { grade, academicYear, teacherId, status, page = 1, limit = 20 } = req.query;

    let query = admin.firestore().collection('classes');

    // Apply filters
    if (grade) {
      query = query.where('grade', '==', grade);
    }
    if (academicYear) {
      query = query.where('academicYear', '==', academicYear);
    }
    if (teacherId) {
      query = query.where('teacherId', '==', teacherId);
    }
    if (status) {
      query = query.where('status', '==', status);
    }

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply ordering and pagination
    query = query.orderBy('createdAt', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();
    const classes = [];

    for (const doc of snapshot.docs) {
      const classData = doc.data();

      // Get teacher information
      let teacherInfo = null;
      if (classData.teacherId) {
        try {
          const teacherDoc = await admin.firestore().collection('users').doc(classData.teacherId).get();
          if (teacherDoc.exists) {
            const teacherData = teacherDoc.data();
            teacherInfo = {
              uid: teacherDoc.id,
              displayName: teacherData.displayName,
              email: teacherData.email
            };
          }
        } catch (error) {
          console.warn('Failed to fetch teacher info:', error);
        }
      }

      // Get student count
      const studentCount = classData.students ? classData.students.length : 0;

      classes.push({
        id: doc.id,
        ...classData,
        teacher: teacherInfo,
        studentCount,
        createdAt: classData.createdAt?.toDate?.() || classData.createdAt,
        updatedAt: classData.updatedAt?.toDate?.() || classData.updatedAt,
      });
    }

    res.json({
      classes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { grade, academicYear, teacherId, status },
    });
  } catch (error) {
    console.error('Get classes error:', error);
    throw error;
  }
}

async function handleGetClass(req, res) {
  try {
    const { id } = req.query;

    const classDoc = await admin.firestore().collection('classes').doc(id).get();

    if (!classDoc.exists) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    const classData = classDoc.data();

    // Get teacher information
    let teacherInfo = null;
    if (classData.teacherId) {
      try {
        const teacherDoc = await admin.firestore().collection('users').doc(classData.teacherId).get();
        if (teacherDoc.exists) {
          const teacherData = teacherDoc.data();
          teacherInfo = {
            uid: teacherDoc.id,
            displayName: teacherData.displayName,
            email: teacherData.email
          };
        }
      } catch (error) {
        console.warn('Failed to fetch teacher info:', error);
      }
    }

    // Get student information
    const students = [];
    if (classData.students && classData.students.length > 0) {
      for (const studentId of classData.students) {
        try {
          const studentDoc = await admin.firestore().collection('users').doc(studentId).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            students.push({
              uid: studentDoc.id,
              displayName: studentData.displayName,
              email: studentData.email,
              status: studentData.status
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch student ${studentId}:`, error);
        }
      }
    }

    const classInfo = {
      id,
      ...classData,
      teacher: teacherInfo,
      students,
      studentCount: students.length,
      createdAt: classData.createdAt?.toDate?.() || classData.createdAt,
      updatedAt: classData.updatedAt?.toDate?.() || classData.updatedAt,
    };

    res.json({ class: classInfo });
  } catch (error) {
    console.error('Get class error:', error);
    throw error;
  }
}

async function handleCreateClass(req, res, user) {
  try {
    // Check admin access
    await requireAdmin(user);

    const {
      name,
      grade,
      academicYear,
      teacherId,
      description,
      schedule,
      subjects,
    } = req.body;

    // Validate required fields
    if (!name || !grade || !academicYear) {
      throw new Error('Missing required fields');
    }

    // Check if teacher exists and is a teacher
    if (teacherId) {
      const teacherDoc = await admin.firestore().collection('users').doc(teacherId).get();
      if (!teacherDoc.exists) {
        res.status(400).json({ error: 'Teacher not found' });
        return;
      }
      const teacherData = teacherDoc.data();
      if (teacherData.role !== 'teacher') {
        res.status(400).json({ error: 'Assigned user is not a teacher' });
        return;
      }
    }

    const classData = {
      name,
      grade,
      academicYear,
      teacherId: teacherId || null,
      description: description || '',
      schedule: schedule || [],
      subjects: subjects || [],
      students: [],
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection('classes').add(classData);

    res.status(201).json({
      message: 'Class created successfully',
      class: {
        id: docRef.id,
        ...classData,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Create class error:', error);
    throw error;
  }
}

async function handleUpdateClass(req, res, user) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin' && userData?.role !== 'vice_principal') {
      throw new Error('Insufficient permissions');
    }

    // Check if teacher exists and is a teacher
    if (updateData.teacherId) {
      const teacherDoc = await admin.firestore().collection('users').doc(updateData.teacherId).get();
      if (!teacherDoc.exists) {
        res.status(400).json({ error: 'Teacher not found' });
        return;
      }
      const teacherData = teacherDoc.data();
      if (teacherData.role !== 'teacher') {
        res.status(400).json({ error: 'Assigned user is not a teacher' });
        return;
      }
    }

    const classDoc = await admin.firestore().collection('classes').doc(id).get();
    if (!classDoc.exists) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    const firestoreUpdate = {
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('classes').doc(id).update(firestoreUpdate);

    res.json({
      message: 'Class updated successfully',
      id,
    });
  } catch (error) {
    console.error('Update class error:', error);
    throw error;
  }
}

async function handleDeleteClass(req, res, user) {
  try {
    // Check admin access
    await requireAdmin(user);

    const { id } = req.query;

    const classDoc = await admin.firestore().collection('classes').doc(id).get();
    if (!classDoc.exists) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    // Soft delete
    await admin.firestore().collection('classes').doc(id).update({
      status: 'inactive',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      message: 'Class deactivated successfully',
      id,
    });
  } catch (error) {
    console.error('Delete class error:', error);
    throw error;
  }
}

async function handleAddStudent(req, res, user) {
  try {
    const { id } = req.query;
    const { studentId } = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'vice_principal' && userData.role !== 'teacher')) {
      throw new Error('Insufficient permissions');
    }

    // Check if class exists
    const classDoc = await admin.firestore().collection('classes').doc(id).get();
    if (!classDoc.exists) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    // Check if student exists and is a student
    const studentDoc = await admin.firestore().collection('users').doc(studentId).get();
    if (!studentDoc.exists) {
      res.status(400).json({ error: 'Student not found' });
      return;
    }
    const studentData = studentDoc.data();
    if (studentData.role !== 'student') {
      res.status(400).json({ error: 'User is not a student' });
      return;
    }

    // Check if student is already in class
    const classData = classDoc.data();
    if (classData.students && classData.students.includes(studentId)) {
      res.status(409).json({ error: 'Student is already in this class' });
      return;
    }

    // Add student to class
    await admin.firestore().collection('classes').doc(id).update({
      students: admin.firestore.FieldValue.arrayUnion(studentId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update student's classId
    await admin.firestore().collection('users').doc(studentId).update({
      classId: id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      message: 'Student added to class successfully',
      classId: id,
      studentId,
    });
  } catch (error) {
    console.error('Add student to class error:', error);
    throw error;
  }
}

async function handleRemoveStudent(req, res, user) {
  try {
    const { id, studentId } = req.query;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'vice_principal' && userData.role !== 'teacher')) {
      throw new Error('Insufficient permissions');
    }

    // Check if class exists
    const classDoc = await admin.firestore().collection('classes').doc(id).get();
    if (!classDoc.exists) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    // Remove student from class
    await admin.firestore().collection('classes').doc(id).update({
      students: admin.firestore.FieldValue.arrayRemove(studentId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Remove classId from student
    await admin.firestore().collection('users').doc(studentId).update({
      classId: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      message: 'Student removed from class successfully',
      classId: id,
      studentId,
    });
  } catch (error) {
    console.error('Remove student from class error:', error);
    throw error;
  }
}
