const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const User = require('../models/User');

// Send a reminder to an adviser about an at-risk student
router.post('/adviser', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { studentId, adviserId, missingSessions, section, major } = req.body;

    if (!studentId || !adviserId) {
      return res.status(400).json({ message: 'Student ID and Adviser ID are required' });
    }

    const student = await Student.findById(studentId).populate('user', 'firstName lastName');
    const adviser = await User.findById(adviserId);

    if (!student || !adviser) {
      return res.status(404).json({ message: 'Student or Adviser not found' });
    }

    const studentName = `${student.user.firstName} ${student.user.lastName}`;
    const message = `Please follow up with your student, ${studentName} (${major || 'N/A Major'}) from section ${section || 'N/A'}, regarding their ${missingSessions || 'multiple'} incomplete SSP sessions.`;

    const notification = new Notification({
      recipient: adviserId,
      sender: req.user._id,
      title: 'Reminder: Incomplete SSP Sessions',
      message: message,
      type: 'warning',
    });

    await notification.save();

    res.status(201).json({ message: 'Reminder notification sent successfully.' });
  } catch (error) {
    console.error('Error sending reminder notification:', error);
    res.status(500).json({ message: 'Server error while sending reminder.' });
  }
});

module.exports = router;
