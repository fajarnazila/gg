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

// Get all grades with filtering and pagination
router.get('/', verifyToken, [
  query('studentId').optional().isString().trim(),
  query('classId').optional().isString().trim(),
  query('subjectId').optional().isString().trim(),
  query('teacherId').optional().isString().trim(),
  query('type').optional().isIn(['assignment', 'quiz', 'midterm', 'final', 'project']),
  query('semester').optional().isString().trim(),
  query('academicYear').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid query parameters', details: errors.array() });
    }

    const { studentId, classId, subjectId, teacherId, type, semester, academicYear, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check user permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    let query = admin.firestore().collection('grades');

    // Apply role-based filtering
    if (userData?.role === 'student') {
      query = query.where('studentId', '==', req.user.uid);
    } else if (userData?.role === 'parent') {
      // Parents can see grades for their children - this would need additional logic
      // For now, we'll assume parents have access to all grades (this should be improved)
      query = query.where('studentId', '==', req.user.uid); // Placeholder
    } else if (userData?.role === 'teacher') {
      query = query.where('teacherId', '==', req.user.uid);
    }

    // Apply additional filters
    if (studentId && (userData?.role === 'admin' || userData?.role === 'teacher')) {
      query = query.where('studentId', '==', studentId);
    }
    if (classId) {
      query = query.where('classId', '==', classId);
    }
    if (subjectId) {
      query = query.where('subjectId', '==', subjectId);
    }
    if (teacherId && userData?.role === 'admin') {
      query = query.where('teacherId', '==', teacherId);
    }
    if (type) {
      query = query.where('type', '==', type);
    }
    if (semester) {
      query = query.where('semester', '==', semester);
    }
    if (academicYear) {
      query = query.where('academicYear', '==', academicYear);
    }

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply ordering and pagination
    query = query.orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();
    const grades = [];

    for (const doc of snapshot.docs) {
      const gradeData = doc.data();

      // Get student information
      let studentInfo = null;
      try {
        const studentDoc = await admin.firestore().collection('users').doc(gradeData.studentId).get();
        if (studentDoc.exists) {
          const studentData = studentDoc.data();
          studentInfo = {
            uid: studentDoc.id,
            displayName: studentData.displayName,
            email: studentData.email
          };
        }
      } catch (error) {
        console.warn('Failed to fetch student info:', error);
      }

      // Get teacher information
      let teacherInfo = null;
      try {
        const teacherDoc = await admin.firestore().collection('users').doc(gradeData.teacherId).get();
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

      grades.push({
        id: doc.id,
        ...gradeData,
        student: studentInfo,
        teacher: teacherInfo,
        createdAt: gradeData.createdAt?.toDate?.() || gradeData.createdAt,
      });
    }

    res.json({
      grades,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { studentId, classId, subjectId, teacherId, type, semester, academicYear },
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get grade by ID
router.get('/:id', verifyToken, [
  param('id').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid grade ID', details: errors.array() });
    }

    const { id } = req.params;

    const gradeDoc = await admin.firestore().collection('grades').doc(id).get();

    if (!gradeDoc.exists) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    const gradeData = gradeDoc.data();

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'student' && gradeData.studentId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Cannot access this grade' });
    }
    if (userData?.role === 'teacher' && gradeData.teacherId !== req.user.uid && userData?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Cannot access this grade' });
    }

    // Get student information
    let studentInfo = null;
    try {
      const studentDoc = await admin.firestore().collection('users').doc(gradeData.studentId).get();
      if (studentDoc.exists) {
        const studentData = studentDoc.data();
        studentInfo = {
          uid: studentDoc.id,
          displayName: studentData.displayName,
          email: studentData.email
        };
      }
    } catch (error) {
      console.warn('Failed to fetch student info:', error);
    }

    // Get teacher information
    let teacherInfo = null;
    try {
      const teacherDoc = await admin.firestore().collection('users').doc(gradeData.teacherId).get();
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

    const grade = {
      id,
      ...gradeData,
      student: studentInfo,
      teacher: teacherInfo,
      createdAt: gradeData.createdAt?.toDate?.() || gradeData.createdAt,
    };

    res.json({ grade });
  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new grade
router.post('/', verifyToken, [
  body('studentId').isString().trim(),
  body('subjectId').isString().trim(),
  body('classId').isString().trim(),
  body('type').isIn(['assignment', 'quiz', 'midterm', 'final', 'project']),
  body('score').isFloat({ min: 0 }),
  body('maxScore').isFloat({ min: 0.1 }),
  body('semester').isString().trim(),
  body('academicYear').isString().trim().matches(/^\d{4}-\d{4}$/),
  body('comments').optional().isString().trim(),
  body('weight').optional().isFloat({ min: 0, max: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const {
      studentId,
      subjectId,
      classId,
      type,
      score,
      maxScore,
      semester,
      academicYear,
      comments,
      weight,
    } = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'exam_supervisor')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    // Validate student exists and is a student
    const studentDoc = await admin.firestore().collection('users').doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(400).json({ error: 'Student not found' });
    }
    const studentData = studentDoc.data();
    if (studentData.role !== 'student') {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    // Validate class exists
    const classDoc = await admin.firestore().collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return res.status(400).json({ error: 'Class not found' });
    }

    // Calculate percentage
    const percentage = (score / maxScore) * 100;

    // Determine grade letter
    let gradeLetter = 'F';
    if (percentage >= 90) gradeLetter = 'A';
    else if (percentage >= 80) gradeLetter = 'B';
    else if (percentage >= 70) gradeLetter = 'C';
    else if (percentage >= 60) gradeLetter = 'D';

    const gradeData = {
      studentId,
      subjectId,
      classId,
      teacherId: req.user.uid,
      type,
      score: parseFloat(score),
      maxScore: parseFloat(maxScore),
      percentage: parseFloat(percentage.toFixed(2)),
      gradeLetter,
      semester,
      academicYear,
      comments: comments || '',
      weight: weight || 1.0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection('grades').add(gradeData);

    res.status(201).json({
      message: 'Grade recorded successfully',
      grade: {
        id: docRef.id,
        ...gradeData,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update grade
router.put('/:id', verifyToken, [
  param('id').isString().trim(),
  body('score').optional().isFloat({ min: 0 }),
  body('maxScore').optional().isFloat({ min: 0.1 }),
  body('comments').optional().isString().trim(),
  body('weight').optional().isFloat({ min: 0, max: 1 }),
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

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'exam_supervisor')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const gradeDoc = await admin.firestore().collection('grades').doc(id).get();
    if (!gradeDoc.exists) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    const gradeData = gradeDoc.data();

    // Only allow updating by the teacher who created it or admin
    if (userData.role !== 'admin' && gradeData.teacherId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Cannot update this grade' });
    }

    const firestoreUpdate = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Recalculate percentage if score or maxScore changed
    if (updateData.score !== undefined || updateData.maxScore !== undefined) {
      const newScore = updateData.score !== undefined ? updateData.score : gradeData.score;
      const newMaxScore = updateData.maxScore !== undefined ? updateData.maxScore : gradeData.maxScore;
      const percentage = (newScore / newMaxScore) * 100;

      let gradeLetter = 'F';
      if (percentage >= 90) gradeLetter = 'A';
      else if (percentage >= 80) gradeLetter = 'B';
      else if (percentage >= 70) gradeLetter = 'C';
      else if (percentage >= 60) gradeLetter = 'D';

      firestoreUpdate.score = parseFloat(newScore);
      firestoreUpdate.maxScore = parseFloat(newMaxScore);
      firestoreUpdate.percentage = parseFloat(percentage.toFixed(2));
      firestoreUpdate.gradeLetter = gradeLetter;
    }

    if (updateData.comments !== undefined) firestoreUpdate.comments = updateData.comments;
    if (updateData.weight !== undefined) firestoreUpdate.weight = updateData.weight;

    await admin.firestore().collection('grades').doc(id).update(firestoreUpdate);

    res.json({
      message: 'Grade updated successfully',
      id,
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete grade
router.delete('/:id', verifyToken, [
  param('id').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid grade ID', details: errors.array() });
    }

    const { id } = req.params;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'exam_supervisor')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const gradeDoc = await admin.firestore().collection('grades').doc(id).get();
    if (!gradeDoc.exists) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    await admin.firestore().collection('grades').doc(id).delete();

    res.json({
      message: 'Grade deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student grade summary
router.get('/student/:studentId/summary', verifyToken, [
  param('studentId').isString().trim(),
  query('academicYear').optional().isString().trim(),
  query('semester').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid parameters', details: errors.array() });
    }

    const { studentId } = req.params;
    const { academicYear, semester } = req.query;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'student' && studentId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Cannot access this student\'s grades' });
    }

    let query = admin.firestore().collection('grades').where('studentId', '==', studentId);

    if (academicYear) {
      query = query.where('academicYear', '==', academicYear);
    }
    if (semester) {
      query = query.where('semester', '==', semester);
    }

    const gradesSnapshot = await query.get();

    const subjects = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    gradesSnapshot.forEach(doc => {
      const grade = doc.data();
      const subjectId = grade.subjectId;

      if (!subjects[subjectId]) {
        subjects[subjectId] = {
          subjectId,
          grades: [],
          average: 0,
          gradeLetter: 'F'
        };
      }

      subjects[subjectId].grades.push({
        id: doc.id,
        ...grade
      });

      // Calculate weighted average
      totalWeightedScore += grade.percentage * grade.weight;
      totalWeight += grade.weight;
    });

    // Calculate subject averages
    Object.keys(subjects).forEach(subjectId => {
      const subject = subjects[subjectId];
      const grades = subject.grades;

      let subjectTotalWeighted = 0;
      let subjectTotalWeight = 0;

      grades.forEach(grade => {
        subjectTotalWeighted += grade.percentage * grade.weight;
        subjectTotalWeight += grade.weight;
      });

      subject.average = subjectTotalWeight > 0 ? subjectTotalWeighted / subjectTotalWeight : 0;

      if (subject.average >= 90) subject.gradeLetter = 'A';
      else if (subject.average >= 80) subject.gradeLetter = 'B';
      else if (subject.average >= 70) subject.gradeLetter = 'C';
      else if (subject.average >= 60) subject.gradeLetter = 'D';
      else subject.gradeLetter = 'F';
    });

    const overallAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    let overallGradeLetter = 'F';
    if (overallAverage >= 90) overallGradeLetter = 'A';
    else if (overallAverage >= 80) overallGradeLetter = 'B';
    else if (overallAverage >= 70) overallGradeLetter = 'C';
    else if (overallAverage >= 60) overallGradeLetter = 'D';

    res.json({
      studentId,
      academicYear,
      semester,
      subjects: Object.values(subjects),
      overallAverage: parseFloat(overallAverage.toFixed(2)),
      overallGradeLetter,
      totalGrades: gradesSnapshot.size,
    });
  } catch (error) {
    console.error('Get student grade summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
