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

// Get all classes with filtering and pagination
router.get('/', verifyToken, [
  query('grade').optional().isString().trim(),
  query('academicYear').optional().isString().trim(),
  query('teacherId').optional().isString().trim(),
  query('status').optional().isIn(['active', 'inactive']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid query parameters', details: errors.array() });
    }

    const { grade, academicYear, teacherId, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

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
    query = query.orderBy('createdAt', 'desc').limit(limit);

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
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { grade, academicYear, teacherId, status },
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get class by ID
router.get('/:id', verifyToken, [
  param('id').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid class ID', details: errors.array() });
    }

    const { id } = req.params;

    const classDoc = await admin.firestore().collection('classes').doc(id).get();

    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Class not found' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new class
router.post('/', verifyToken, requireAdmin, [
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('grade').isString().trim().isLength({ min: 1, max: 20 }),
  body('academicYear').isString().trim().matches(/^\d{4}-\d{4}$/),
  body('teacherId').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('schedule').optional().isArray(),
  body('subjects').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const {
      name,
      grade,
      academicYear,
      teacherId,
      description,
      schedule,
      subjects,
    } = req.body;

    // Check if teacher exists and is a teacher
    if (teacherId) {
      const teacherDoc = await admin.firestore().collection('users').doc(teacherId).get();
      if (!teacherDoc.exists) {
        return res.status(400).json({ error: 'Teacher not found' });
      }
      const teacherData = teacherDoc.data();
      if (teacherData.role !== 'teacher') {
        return res.status(400).json({ error: 'Assigned user is not a teacher' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update class
router.put('/:id', verifyToken, [
  param('id').isString().trim(),
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('grade').optional().isString().trim().isLength({ min: 1, max: 20 }),
  body('academicYear').optional().isString().trim().matches(/^\d{4}-\d{4}$/),
  body('teacherId').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('schedule').optional().isArray(),
  body('subjects').optional().isArray(),
  body('status').optional().isIn(['active', 'inactive']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin' && userData?.role !== 'vice_principal') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    // Check if teacher exists and is a teacher
    if (updateData.teacherId) {
      const teacherDoc = await admin.firestore().collection('users').doc(updateData.teacherId).get();
      if (!teacherDoc.exists) {
        return res.status(400).json({ error: 'Teacher not found' });
      }
      const teacherData = teacherDoc.data();
      if (teacherData.role !== 'teacher') {
        return res.status(400).json({ error: 'Assigned user is not a teacher' });
      }
    }

    const classDoc = await admin.firestore().collection('classes').doc(id).get();
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Class not found' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete class (soft delete)
router.delete('/:id', verifyToken, requireAdmin, [
  param('id').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid class ID', details: errors.array() });
    }

    const { id } = req.params;

    const classDoc = await admin.firestore().collection('classes').doc(id).get();
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Class not found' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add student to class
router.post('/:id/students', verifyToken, [
  param('id').isString().trim(),
  body('studentId').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const { id } = req.params;
    const { studentId } = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'vice_principal' && userData.role !== 'teacher')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    // Check if class exists
    const classDoc = await admin.firestore().collection('classes').doc(id).get();
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if student exists and is a student
    const studentDoc = await admin.firestore().collection('users').doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(400).json({ error: 'Student not found' });
    }
    const studentData = studentDoc.data();
    if (studentData.role !== 'student') {
      return res.status(400).json({ error: 'User is not a student' });
    }

    // Check if student is already in class
    const classData = classDoc.data();
    if (classData.students && classData.students.includes(studentId)) {
      return res.status(409).json({ error: 'Student is already in this class' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove student from class
router.delete('/:id/students/:studentId', verifyToken, [
  param('id').isString().trim(),
  param('studentId').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const { id, studentId } = req.params;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'vice_principal' && userData.role !== 'teacher')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    // Check if class exists
    const classDoc = await admin.firestore().collection('classes').doc(id).get();
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Class not found' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
