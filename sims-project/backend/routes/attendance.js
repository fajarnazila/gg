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

// Get attendance records with filtering and pagination
router.get('/', verifyToken, [
  query('studentId').optional().isString().trim(),
  query('classId').optional().isString().trim(),
  query('teacherId').optional().isString().trim(),
  query('date').optional().isISO8601(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('status').optional().isIn(['present', 'absent', 'late', 'excused']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid query parameters', details: errors.array() });
    }

    const {
      studentId,
      classId,
      teacherId,
      date,
      startDate,
      endDate,
      status,
      page = 1,
      limit = 20
    } = req.query;

    // Check user permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    let query = admin.firestore().collection('attendance');

    // Apply role-based filtering
    if (userData?.role === 'student') {
      query = query.where('studentId', '==', req.user.uid);
    } else if (userData?.role === 'parent') {
      // Parents can see attendance for their children - this would need additional logic
      query = query.where('studentId', '==', req.user.uid); // Placeholder
    } else if (userData?.role === 'teacher') {
      query = query.where('teacherId', '==', req.user.uid);
    }

    // Apply additional filters
    if (studentId && (userData?.role === 'admin' || userData?.role === 'teacher' || userData?.role === 'school_health')) {
      query = query.where('studentId', '==', studentId);
    }
    if (classId) {
      query = query.where('classId', '==', classId);
    }
    if (teacherId && userData?.role === 'admin') {
      query = query.where('teacherId', '==', teacherId);
    }
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query = query.where('date', '>=', startOfDay).where('date', '<=', endOfDay);
    }
    if (startDate && endDate) {
      query = query.where('date', '>=', new Date(startDate)).where('date', '<=', new Date(endDate));
    }

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply ordering and pagination
    query = query.orderBy('date', 'desc').orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();
    const attendance = [];

    for (const doc of snapshot.docs) {
      const attendanceData = doc.data();

      // Get student information
      let studentInfo = null;
      try {
        const studentDoc = await admin.firestore().collection('users').doc(attendanceData.studentId).get();
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
        const teacherDoc = await admin.firestore().collection('users').doc(attendanceData.teacherId).get();
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

      // Filter records by status if specified
      let records = attendanceData.records || [];
      if (status) {
        records = records.filter(record => record.status === status);
      }

      attendance.push({
        id: doc.id,
        ...attendanceData,
        student: studentInfo,
        teacher: teacherInfo,
        records,
        date: attendanceData.date?.toDate?.() || attendanceData.date,
        createdAt: attendanceData.createdAt?.toDate?.() || attendanceData.createdAt,
      });
    }

    res.json({
      attendance,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { studentId, classId, teacherId, date, startDate, endDate, status },
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance by ID
router.get('/:id', verifyToken, [
  param('id').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid attendance ID', details: errors.array() });
    }

    const { id } = req.params;

    const attendanceDoc = await admin.firestore().collection('attendance').doc(id).get();

    if (!attendanceDoc.exists) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    const attendanceData = attendanceDoc.data();

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'student') {
      const hasStudentRecord = attendanceData.records?.some(record => record.studentId === req.user.uid);
      if (!hasStudentRecord) {
        return res.status(403).json({ error: 'Forbidden: Cannot access this attendance record' });
      }
    } else if (userData?.role === 'teacher' && attendanceData.teacherId !== req.user.uid && userData?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Cannot access this attendance record' });
    }

    // Get student information for each record
    const records = attendanceData.records || [];
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        const studentDoc = await admin.firestore().collection('users').doc(record.studentId).get();
        if (studentDoc.exists) {
          const studentData = studentDoc.data();
          records[i].student = {
            uid: studentDoc.id,
            displayName: studentData.displayName,
            email: studentData.email
          };
        }
      } catch (error) {
        console.warn(`Failed to fetch student info for ${record.studentId}:`, error);
      }
    }

    // Get teacher information
    let teacherInfo = null;
    try {
      const teacherDoc = await admin.firestore().collection('users').doc(attendanceData.teacherId).get();
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

    const attendance = {
      id,
      ...attendanceData,
      teacher: teacherInfo,
      records,
      date: attendanceData.date?.toDate?.() || attendanceData.date,
      createdAt: attendanceData.createdAt?.toDate?.() || attendanceData.createdAt,
    };

    res.json({ attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create attendance record
router.post('/', verifyToken, [
  body('classId').isString().trim(),
  body('date').isISO8601(),
  body('records').isArray({ min: 1 }),
  body('records.*.studentId').isString().trim(),
  body('records.*.status').isIn(['present', 'absent', 'late', 'excused']),
  body('records.*.notes').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const { classId, date, records } = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'vice_principal')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    // Validate class exists
    const classDoc = await admin.firestore().collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return res.status(400).json({ error: 'Class not found' });
    }

    const classData = classDoc.data();

    // Check if teacher is assigned to this class (unless admin)
    if (userData.role === 'teacher' && classData.teacherId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Not assigned to this class' });
    }

    // Validate all students exist and are in the class
    const studentIds = records.map(record => record.studentId);
    const uniqueStudentIds = [...new Set(studentIds)];

    for (const studentId of uniqueStudentIds) {
      const studentDoc = await admin.firestore().collection('users').doc(studentId).get();
      if (!studentDoc.exists) {
        return res.status(400).json({ error: `Student ${studentId} not found` });
      }
      const studentData = studentDoc.data();
      if (studentData.role !== 'student') {
        return res.status(400).json({ error: `User ${studentId} is not a student` });
      }
      if (!classData.students || !classData.students.includes(studentId)) {
        return res.status(400).json({ error: `Student ${studentId} is not in this class` });
      }
    }

    // Check if attendance already exists for this class and date
    const attendanceDate = new Date(date);
    const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

    const existingAttendance = await admin.firestore()
      .collection('attendance')
      .where('classId', '==', classId)
      .where('date', '>=', startOfDay)
      .where('date', '<=', endOfDay)
      .get();

    if (!existingAttendance.empty) {
      return res.status(409).json({ error: 'Attendance already recorded for this class and date' });
    }

    // Process records and add timestamps
    const processedRecords = records.map(record => ({
      studentId: record.studentId,
      status: record.status,
      notes: record.notes || '',
      markedAt: admin.firestore.FieldValue.serverTimestamp(),
    }));

    const attendanceData = {
      classId,
      teacherId: req.user.uid,
      date: admin.firestore.Timestamp.fromDate(new Date(date)),
      records: processedRecords,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection('attendance').add(attendanceData);

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance: {
        id: docRef.id,
        ...attendanceData,
        date: new Date(date),
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update attendance record
router.put('/:id', verifyToken, [
  param('id').isString().trim(),
  body('records').optional().isArray(),
  body('records.*.studentId').isString().trim(),
  body('records.*.status').isIn(['present', 'absent', 'late', 'excused']),
  body('records.*.notes').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const { id } = req.params;
    const { records } = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'vice_principal')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const attendanceDoc = await admin.firestore().collection('attendance').doc(id).get();
    if (!attendanceDoc.exists) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    const attendanceData = attendanceDoc.data();

    // Check if teacher is assigned to this class (unless admin)
    if (userData.role === 'teacher' && attendanceData.teacherId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Not assigned to this class' });
    }

    const firestoreUpdate = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (records) {
      // Process records and add timestamps
      const processedRecords = records.map(record => ({
        studentId: record.studentId,
        status: record.status,
        notes: record.notes || '',
        markedAt: admin.firestore.FieldValue.serverTimestamp(),
      }));

      firestoreUpdate.records = processedRecords;
    }

    await admin.firestore().collection('attendance').doc(id).update(firestoreUpdate);

    res.json({
      message: 'Attendance updated successfully',
      id,
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete attendance record
router.delete('/:id', verifyToken, [
  param('id').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid attendance ID', details: errors.array() });
    }

    const { id } = req.params;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'vice_principal')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const attendanceDoc = await admin.firestore().collection('attendance').doc(id).get();
    if (!attendanceDoc.exists) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    await admin.firestore().collection('attendance').doc(id).delete();

    res.json({
      message: 'Attendance record deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student attendance summary
router.get('/student/:studentId/summary', verifyToken, [
  param('studentId').isString().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('academicYear').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid parameters', details: errors.array() });
    }

    const { studentId } = req.params;
    const { startDate, endDate, academicYear } = req.query;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'student' && studentId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Cannot access this student\'s attendance' });
    }

    let query = admin.firestore().collection('attendance');

    // Find all attendance records for this student
    const allAttendance = await query.get();
    const studentRecords = [];

    allAttendance.forEach(doc => {
      const attendanceData = doc.data();
      const studentRecord = attendanceData.records?.find(record => record.studentId === studentId);
      if (studentRecord) {
        studentRecords.push({
          id: doc.id,
          date: attendanceData.date,
          status: studentRecord.status,
          notes: studentRecord.notes,
          classId: attendanceData.classId,
        });
      }
    });

    // Apply date filters
    let filteredRecords = studentRecords;
    if (startDate) {
      const start = new Date(startDate);
      filteredRecords = filteredRecords.filter(record => record.date.toDate() >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filteredRecords = filteredRecords.filter(record => record.date.toDate() <= end);
    }

    // Calculate statistics
    const totalDays = filteredRecords.length;
    const presentDays = filteredRecords.filter(record => record.status === 'present').length;
    const absentDays = filteredRecords.filter(record => record.status === 'absent').length;
    const lateDays = filteredRecords.filter(record => record.status === 'late').length;
    const excusedDays = filteredRecords.filter(record => record.status === 'excused').length;

    const attendanceRate = totalDays > 0 ? ((presentDays + excusedDays) / totalDays) * 100 : 0;

    res.json({
      studentId,
      summary: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      },
      records: filteredRecords.slice(0, 50), // Limit to last 50 records
      filters: { startDate, endDate, academicYear },
    });
  } catch (error) {
    console.error('Get student attendance summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get class attendance summary
router.get('/class/:classId/summary', verifyToken, [
  param('classId').isString().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid parameters', details: errors.array() });
    }

    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'vice_principal')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    // Validate class exists
    const classDoc = await admin.firestore().collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const classData = classDoc.data();

    // Check if teacher is assigned to this class (unless admin)
    if (userData.role === 'teacher' && classData.teacherId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Not assigned to this class' });
    }

    let query = admin.firestore().collection('attendance').where('classId', '==', classId);

    if (startDate) {
      query = query.where('date', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('date', '<=', new Date(endDate));
    }

    const attendanceSnapshot = await query.get();

    const studentStats = {};
    let totalAttendanceRecords = 0;

    attendanceSnapshot.forEach(doc => {
      const attendanceData = doc.data();
      const records = attendanceData.records || [];

      records.forEach(record => {
        const studentId = record.studentId;
        if (!studentStats[studentId]) {
          studentStats[studentId] = {
            studentId,
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            excusedDays: 0,
          };
        }

        studentStats[studentId].totalDays++;
        totalAttendanceRecords++;

        switch (record.status) {
          case 'present':
            studentStats[studentId].presentDays++;
            break;
          case 'absent':
            studentStats[studentId].absentDays++;
            break;
          case 'late':
            studentStats[studentId].lateDays++;
            break;
          case 'excused':
            studentStats[studentId].excusedDays++;
            break;
        }
      });
    });

    // Calculate attendance rates for each student
    Object.keys(studentStats).forEach(studentId => {
      const stats = studentStats[studentId];
      stats.attendanceRate = stats.totalDays > 0
        ? ((stats.presentDays + stats.excusedDays) / stats.totalDays) * 100
        : 0;
      stats.attendanceRate = parseFloat(stats.attendanceRate.toFixed(2));
    });

    const summary = {
      classId,
      totalStudents: Object.keys(studentStats).length,
      totalAttendanceRecords,
      averageAttendanceRate: Object.values(studentStats).length > 0
        ? Object.values(studentStats).reduce((sum, stats) => sum + stats.attendanceRate, 0) / Object.values(studentStats).length
        : 0,
      studentStats: Object.values(studentStats),
    };

    res.json({ summary });
  } catch (error) {
    console.error('Get class attendance summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
