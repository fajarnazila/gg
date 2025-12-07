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
        } else if (req.query.id) {
          return await handleGetGrade(req, res, user);
        } else {
          return await handleGetGrades(req, res, user);
        }

      case 'POST':
        return await handleCreateGrade(req, res, user);

      case 'PUT':
        return await handleUpdateGrade(req, res, user);

      case 'DELETE':
        return await handleDeleteGrade(req, res, user);

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Grades API error:', error);
    res.status(error.message.includes('token') ? 401 :
               error.message.includes('Admin') ? 403 : 500)
       .json({ error: error.message });
  }
}

async function handleGetGrades(req, res, user) {
  try {
    const { studentId, classId, subjectId, teacherId, type, semester, academicYear, page = 1, limit = 20 } = req.query;

    // Check user permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    let query = admin.firestore().collection('grades');

    // Apply role-based filtering
    if (userData?.role === 'student') {
      query = query.where('studentId', '==', user.uid);
    } else if (userData?.role === 'parent') {
      // Parents can see grades for their children - this would need additional logic
      query = query.where('studentId', '==', user.uid); // Placeholder
    } else if (userData?.role === 'teacher') {
      query = query.where('teacherId', '==', user.uid);
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
    query = query.orderBy('createdAt', 'desc').limit(parseInt(limit));

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
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { studentId, classId, subjectId, teacherId, type, semester, academicYear },
    });
  } catch (error) {
    console.error('Get grades error:', error);
    throw error;
  }
}

async function handleGetGrade(req, res, user) {
  try {
    const { id } = req.query;

    const gradeDoc = await admin.firestore().collection('grades').doc(id).get();

    if (!gradeDoc.exists) {
      res.status(404).json({ error: 'Grade not found' });
      return;
    }

    const gradeData = gradeDoc.data();

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'student' && gradeData.studentId !== user.uid) {
      throw new Error('Cannot access this grade');
    }
    if (userData?.role === 'teacher' && gradeData.teacherId !== user.uid && userData?.role !== 'admin') {
      throw new Error('Cannot access this grade');
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
    throw error;
  }
}

async function handleCreateGrade(req, res, user) {
  try {
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
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'exam_supervisor')) {
      throw new Error('Insufficient permissions');
    }

    // Validate student exists and is a student
    const studentDoc = await admin.firestore().collection('users').doc(studentId).get();
    if (!studentDoc.exists) {
      res.status(400).json({ error: 'Student not found' });
      return;
    }
    const studentData = studentDoc.data();
    if (studentData.role !== 'student') {
      res.status(400).json({ error: 'Invalid student ID' });
      return;
    }

    // Validate class exists
    const classDoc = await admin.firestore().collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      res.status(400).json({ error: 'Class not found' });
      return;
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
      teacherId: user.uid,
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
    throw error;
  }
}

async function handleUpdateGrade(req, res, user) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'exam_supervisor')) {
      throw new Error('Insufficient permissions');
    }

    const gradeDoc = await admin.firestore().collection('grades').doc(id).get();
    if (!gradeDoc.exists) {
      res.status(404).json({ error: 'Grade not found' });
      return;
    }

    const gradeData = gradeDoc.data();

    // Only allow updating by the teacher who created it or admin
    if (userData.role !== 'admin' && gradeData.teacherId !== user.uid) {
      throw new Error('Cannot update this grade');
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
    throw error;
  }
}

async function handleDeleteGrade(req, res, user) {
  try {
    const { id } = req.query;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'exam_supervisor')) {
      throw new Error('Insufficient permissions');
    }

    const gradeDoc = await admin.firestore().collection('grades').doc(id).get();
    if (!gradeDoc.exists) {
      res.status(404).json({ error: 'Grade not found' });
      return;
    }

    await admin.firestore().collection('grades').doc(id).delete();

    res.json({
      message: 'Grade deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    throw error;
  }
}

async function handleGetStudentSummary(req, res, user) {
  try {
    const { studentId } = req.query;
    const { academicYear, semester } = req.query;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'student' && studentId !== user.uid) {
      throw new Error('Cannot access this student\'s grades');
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
    throw error;
  }
}
