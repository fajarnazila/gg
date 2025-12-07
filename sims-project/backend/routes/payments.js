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

// Get payments with filtering and pagination
router.get('/', verifyToken, [
  query('studentId').optional().isString().trim(),
  query('type').optional().isIn(['tuition', 'building', 'activity', 'transportation', 'meal', 'book', 'uniform', 'other']),
  query('status').optional().isIn(['paid', 'pending', 'overdue', 'cancelled']),
  query('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'online']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('recordedBy').optional().isString().trim(),
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
      type,
      status,
      paymentMethod,
      startDate,
      endDate,
      recordedBy,
      page = 1,
      limit = 20
    } = req.query;

    // Check user permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    let query = admin.firestore().collection('payments');

    // Apply role-based filtering
    if (userData?.role === 'student') {
      query = query.where('studentId', '==', req.user.uid);
    } else if (userData?.role === 'parent') {
      // Parents can see payments for their children - this would need additional logic
      query = query.where('studentId', '==', req.user.uid); // Placeholder
    }

    // Apply additional filters
    if (studentId && (userData?.role === 'admin' || userData?.role === 'treasurer' || userData?.role === 'vice_principal')) {
      query = query.where('studentId', '==', studentId);
    }
    if (type) {
      query = query.where('type', '==', type);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    if (paymentMethod) {
      query = query.where('paymentMethod', '==', paymentMethod);
    }
    if (recordedBy && userData?.role === 'admin') {
      query = query.where('recordedBy', '==', recordedBy);
    }
    if (startDate && endDate) {
      query = query.where('paymentDate', '>=', new Date(startDate)).where('paymentDate', '<=', new Date(endDate));
    }

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply ordering and pagination
    query = query.orderBy('paymentDate', 'desc').orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();
    const payments = [];

    for (const doc of snapshot.docs) {
      const paymentData = doc.data();

      // Get student information
      let studentInfo = null;
      try {
        const studentDoc = await admin.firestore().collection('users').doc(paymentData.studentId).get();
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

      // Get recorded by information
      let recordedByInfo = null;
      try {
        const recordedByDoc = await admin.firestore().collection('users').doc(paymentData.recordedBy).get();
        if (recordedByDoc.exists) {
          const recordedByData = recordedByDoc.data();
          recordedByInfo = {
            uid: recordedByDoc.id,
            displayName: recordedByData.displayName,
            email: recordedByData.email
          };
        }
      } catch (error) {
        console.warn('Failed to fetch recorded by info:', error);
      }

      payments.push({
        id: doc.id,
        ...paymentData,
        student: studentInfo,
        recordedBy: recordedByInfo,
        paymentDate: paymentData.paymentDate?.toDate?.() || paymentData.paymentDate,
        createdAt: paymentData.createdAt?.toDate?.() || paymentData.createdAt,
      });
    }

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { studentId, type, status, paymentMethod, startDate, endDate, recordedBy },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment by ID
router.get('/:id', verifyToken, [
  param('id').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid payment ID', details: errors.array() });
    }

    const { id } = req.params;

    const paymentDoc = await admin.firestore().collection('payments').doc(id).get();

    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const paymentData = paymentDoc.data();

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'student' && paymentData.studentId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Cannot access this payment' });
    }

    // Get student information
    let studentInfo = null;
    try {
      const studentDoc = await admin.firestore().collection('users').doc(paymentData.studentId).get();
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

    // Get recorded by information
    let recordedByInfo = null;
    try {
      const recordedByDoc = await admin.firestore().collection('users').doc(paymentData.recordedBy).get();
      if (recordedByDoc.exists) {
        const recordedByData = recordedByDoc.data();
        recordedByInfo = {
          uid: recordedByDoc.id,
          displayName: recordedByData.displayName,
          email: recordedByData.email
        };
      }
    } catch (error) {
      console.warn('Failed to fetch recorded by info:', error);
    }

    const payment = {
      id,
      ...paymentData,
      student: studentInfo,
      recordedBy: recordedByInfo,
      paymentDate: paymentData.paymentDate?.toDate?.() || paymentData.paymentDate,
      createdAt: paymentData.createdAt?.toDate?.() || paymentData.createdAt,
    };

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new payment
router.post('/', verifyToken, [
  body('studentId').isString().trim(),
  body('amount').isFloat({ min: 0.01 }),
  body('type').isIn(['tuition', 'building', 'activity', 'transportation', 'meal', 'book', 'uniform', 'other']),
  body('description').isString().trim().isLength({ min: 1, max: 500 }),
  body('paymentMethod').isIn(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'online']),
  body('referenceNumber').optional().isString().trim(),
  body('notes').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const {
      studentId,
      amount,
      type,
      description,
      paymentMethod,
      referenceNumber,
      notes,
    } = req.body;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'treasurer' && userData.role !== 'admin' && userData.role !== 'vice_principal')) {
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

    const paymentData = {
      studentId,
      amount: parseFloat(amount),
      type,
      description,
      paymentMethod,
      referenceNumber: referenceNumber || '',
      notes: notes || '',
      status: 'paid',
      recordedBy: req.user.uid,
      paymentDate: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection('payments').add(paymentData);

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: {
        id: docRef.id,
        ...paymentData,
        paymentDate: new Date(),
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment
router.put('/:id', verifyToken, [
  param('id').isString().trim(),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('type').optional().isIn(['tuition', 'building', 'activity', 'transportation', 'meal', 'book', 'uniform', 'other']),
  body('description').optional().isString().trim().isLength({ min: 1, max: 500 }),
  body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'online']),
  body('referenceNumber').optional().isString().trim(),
  body('notes').optional().isString().trim(),
  body('status').optional().isIn(['paid', 'pending', 'overdue', 'cancelled']),
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

    if (!userData || (userData.role !== 'treasurer' && userData.role !== 'admin' && userData.role !== 'vice_principal')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const paymentDoc = await admin.firestore().collection('payments').doc(id).get();
    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const firestoreUpdate = {
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Only allow amount changes for admin
    if (updateData.amount && userData.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Cannot modify payment amount' });
    }

    await admin.firestore().collection('payments').doc(id).update(firestoreUpdate);

    res.json({
      message: 'Payment updated successfully',
      id,
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete payment
router.delete('/:id', verifyToken, [
  param('id').isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid payment ID', details: errors.array() });
    }

    const { id } = req.params;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admin can delete payments' });
    }

    const paymentDoc = await admin.firestore().collection('payments').doc(id).get();
    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await admin.firestore().collection('payments').doc(id).delete();

    res.json({
      message: 'Payment deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student payment summary
router.get('/student/:studentId/summary', verifyToken, [
  param('studentId').isString().trim(),
  query('academicYear').optional().isString().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid parameters', details: errors.array() });
    }

    const { studentId } = req.params;
    const { academicYear, startDate, endDate } = req.query;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role === 'student' && studentId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: Cannot access this student\'s payments' });
    }

    let query = admin.firestore().collection('payments').where('studentId', '==', studentId);

    if (startDate) {
      query = query.where('paymentDate', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('paymentDate', '<=', new Date(endDate));
    }

    const paymentsSnapshot = await query.get();

    const summary = {
      studentId,
      totalPayments: paymentsSnapshot.size,
      totalAmount: 0,
      paymentsByType: {},
      paymentsByStatus: {},
      paymentsByMethod: {},
      recentPayments: [],
    };

    paymentsSnapshot.forEach(doc => {
      const payment = doc.data();
      summary.totalAmount += payment.amount;

      // Group by type
      if (!summary.paymentsByType[payment.type]) {
        summary.paymentsByType[payment.type] = { count: 0, amount: 0 };
      }
      summary.paymentsByType[payment.type].count++;
      summary.paymentsByType[payment.type].amount += payment.amount;

      // Group by status
      if (!summary.paymentsByStatus[payment.status]) {
        summary.paymentsByStatus[payment.status] = { count: 0, amount: 0 };
      }
      summary.paymentsByStatus[payment.status].count++;
      summary.paymentsByStatus[payment.status].amount += payment.amount;

      // Group by method
      if (!summary.paymentsByMethod[payment.paymentMethod]) {
        summary.paymentsByMethod[payment.paymentMethod] = { count: 0, amount: 0 };
      }
      summary.paymentsByMethod[payment.paymentMethod].count++;
      summary.paymentsByMethod[payment.paymentMethod].amount += payment.amount;

      // Add to recent payments (last 10)
      if (summary.recentPayments.length < 10) {
        summary.recentPayments.push({
          id: doc.id,
          ...payment,
          paymentDate: payment.paymentDate?.toDate?.() || payment.paymentDate,
        });
      }
    });

    res.json({ summary });
  } catch (error) {
    console.error('Get student payment summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment statistics
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'treasurer' && userData.role !== 'admin' && userData.role !== 'vice_principal')) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const paymentsSnapshot = await admin.firestore().collection('payments').get();

    const stats = {
      totalPayments: paymentsSnapshot.size,
      totalAmount: 0,
      monthlyRevenue: 0,
      paymentsByType: {},
      paymentsByStatus: {},
      paymentsByMethod: {},
    };

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    paymentsSnapshot.forEach(doc => {
      const payment = doc.data();
      stats.totalAmount += payment.amount;

      // Calculate monthly revenue
      const paymentDate = payment.paymentDate?.toDate?.() || payment.paymentDate;
      if (paymentDate >= currentMonth) {
        stats.monthlyRevenue += payment.amount;
      }

      // Group by type
      if (!stats.paymentsByType[payment.type]) {
        stats.paymentsByType[payment.type] = { count: 0, amount: 0 };
      }
      stats.paymentsByType[payment.type].count++;
      stats.paymentsByType[payment.type].amount += payment.amount;

      // Group by status
      if (!stats.paymentsByStatus[payment.status]) {
        stats.paymentsByStatus[payment.status] = { count: 0, amount: 0 };
      }
      stats.paymentsByStatus[payment.status].count++;
      stats.paymentsByStatus[payment.status].amount += payment.amount;

      // Group by method
      if (!stats.paymentsByMethod[payment.paymentMethod]) {
        stats.paymentsByMethod[payment.paymentMethod] = { count: 0, amount: 0 };
      }
      stats.paymentsByMethod[payment.paymentMethod].count++;
      stats.paymentsByMethod[payment.paymentMethod].amount += payment.amount;
    });

    res.json({ stats });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
