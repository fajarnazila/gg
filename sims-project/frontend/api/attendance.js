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
        if (req.query.studentId && req.query.summary) {
          return await handleGetStudentSummary(req, res, user);
        } else if (req.query.classId && req.query.summary) {
          return await handleGetClassSummary(req, res, user);
        } else if (req.query.id) {
          return await handleGetAttendance(req, res, user);
        } else {
          return await handleGetAttendances(req, res, user);
        }

      case 'POST':
        return await handleCreateAttendance(req, res, user);

      case 'PUT':
        return await handleUpdateAttendance(req, res, user);

      case 'DELETE':
        return await handleDeleteAttendance(req, res, user);

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Attendance API error:', error);
    res.status(error.message.includes('token') ? 401 :
               error.message.includes('Admin') ? 403 : 500)
       .json({ error: error.message });
  }
}

async function handleGetAttendances(req, res, user) {
  try {
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
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    let query = admin.firestore().collection('attendance');

    // Apply role-based filtering
    if (userData?.role === 'student') {
      query = query.where('studentId', '==', user.uid);
    } else if (userData?.role === 'parent') {
      // Parents can see attendance for their children - this would need additional logic
      query = query.where('studentId', '==', user.uid); // Placeholder
    } else if (userData?.role === 'teacher') {
      query = query.where('teacherId', '==', user.uid);
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
    query = query.orderBy('date', 'desc').orderBy('createdAt', 'desc').limit(parseInt(limit));

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
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { studentId, classId, teacherId, date, startDate, endDate, status },
    });
  } catch (error) {
    console.error('Get attendances error:', error);
    throw error;
  }
}

async function handleGetAttendance(req, res, user) {
  try {
    const { id } = req.query;

    const attendanceDoc = await admin.firestore().collection('attendance').doc(id).get();

    if (!attendanceDoc.exists) {
      res.status(404).json({ error: 'Attendance record not found' });
      return;
    }

    const attendanceData = attendanceDoc.data();

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'student') {
      const hasStudentRecord = attendanceData.records?.some(record => record.studentId === user.uid);
      if (!hasStudentRecord) {
        throw new Error('Cannot access this attendance record');
      }
    } else if (userData?.role === 'teacher' && attendanceData.teacherId !== user.uid && userData?.role !== 'admin') {
      throw new Error('Cannot access this attendance record');
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
    throw error;
  }
}

async function handleCreateAttendance(req, res, user) {
  try {
    const { classId, date, records } = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'vice_principal')) {
      throw new Error('Insufficient permissions');
    }

    // Validate class exists
    const classDoc = await admin.firestore().collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      res.status(400).json({ error: 'Class not found' });
      return;
    }

    const classData = classDoc.data();

    // Check if teacher is assigned to this class (unless admin)
    if (userData.role === 'teacher' && classData.teacherId !== user.uid) {
      throw new Error('Not assigned to this class');
    }

    // Validate all students exist and are in the class
    const studentIds = records.map(record => record.studentId);
    const uniqueStudentIds = [...new Set(studentIds)];

    for (const studentId of uniqueStudentIds) {
      const studentDoc = await admin.firestore().collection('users').doc(studentId).get();
      if (!studentDoc.exists) {
        res.status(400).json({ error: `Student ${studentId} not found` });
        return;
      }
      const studentData = studentDoc.data();
      if (studentData.role !== 'student') {
        res.status(400).json({ error: `User ${studentId} is not a student` });
        return;
      }
      if (!classData.students || !classData.students.includes(studentId)) {
        res.status(400).json({ error: `Student ${studentId} is not in this class` });
        return;
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
      res.status(409).json({ error: 'Attendance already recorded for this class and date' });
      return;
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
      teacherId: user.uid,
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
    throw error;
  }
}

async function handleUpdateAttendance(req, res, user) {
  try {
    const { id } = req.query;
    const { records } = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'vice_principal')) {
      throw new Error('Insufficient permissions');
    }

    const attendanceDoc = await admin.firestore().collection('attendance').doc(id).get();
    if (!attendanceDoc.exists) {
      res.status(404).json({ error: 'Attendance record not found' });
      return;
    }

    const attendanceData = attendanceDoc.data();

    // Check if teacher is assigned to this class (unless admin)
    if (userData.role === 'teacher' && attendanceData.teacherId !== user.uid) {
      throw new Error('Not assigned to this class');
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
    throw error;
  }
}

async function handleDeleteAttendance(req, res, user) {
  try {
    const { id } = req.query;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'vice_principal')) {
      throw new Error('Insufficient permissions');
    }

    const attendanceDoc = await admin.firestore().collection('attendance').doc(id).get();
    if (!attendanceDoc.exists) {
      res.status(404).json({ error: 'Attendance record not found' });
      return;
    }

    await admin.firestore().collection('attendance').doc(id).delete();

    res.json({
      message: 'Attendance record deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    throw error;
  }
}

async function handleGetStudentSummary(req, res, user) {
  try {
    const { studentId } = req.query;
    const { startDate, endDate, academicYear } = req.query;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'student' && studentId !== user.uid) {
      throw new Error('Cannot access this student\'s attendance');
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
    throw error;
  }
}

async function handleGetClassSummary(req, res, user) {
  try {
    const { classId } = req.query;
    const { startDate, endDate } = req.query;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'vice_principal')) {
      throw new Error('Insufficient permissions');
    }

    // Validate class exists
    const classDoc = await admin.firestore().collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    const classData = classDoc.data();

    // Check if teacher is assigned to this class (unless admin)
    if (userData.role === 'teacher' && classData.teacherId !== user.uid) {
      throw new Error('Not assigned to this class');
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
    throw error;
  }
}
