const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const AdvisoryClass = require('../models/AdvisoryClass');
const Student = require('../models/Student');
const SessionHistory = require('../models/SessionHistory');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

// Get at-risk students
router.get('/analytics/at-risk-students', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { weeks = '1', yearLevel, section, major } = req.query;

    const studentFilter = { status: 'active' };
    if (yearLevel) studentFilter['classDetails.yearLevel'] = yearLevel;
    if (section) studentFilter['classDetails.section'] = section;
    if (major) studentFilter['classDetails.major'] = major;

    const students = await Student.find(studentFilter)
      .populate('user', 'firstName lastName')
      .populate('class', 'sspSubject firstSemester secondSemester');
    console.log('students:', students.length);

    const atRiskStudents = [];

    for (const student of students) {
      if (!student.class) {
        console.warn(`Student ${student._id} has no class, skipping.`);
        continue;
      }

      // Determine the current subject for the student's class
      const classData = student.class;
      const subjectId = classData.secondSemester?.sspSubject || classData.firstSemester?.sspSubject || classData.sspSubject;

      if (!subjectId) {
        console.warn(`Student ${student._id} in class ${classData._id} has no SSP subject assigned.`);
        continue;
      }

      const subject = await Subject.findById(subjectId);
      if (!subject) {
        console.warn(`Subject ${subjectId} not found for student ${student._id}.`);
        continue;
      }

      // Determine which sessions to check (1st or 2nd semester)
      const isSecondSemester = !!classData.secondSemester?.sspSubject;
      const allSubjectSessions = isSecondSemester 
        ? (subject.secondSemesterSessions || subject.sessions) 
        : subject.sessions;

      if (!allSubjectSessions || allSubjectSessions.length === 0) {
        console.warn(`No sessions defined for subject ${subject.name} for student ${student._id}.`);
        continue;
      }

      const completedSessions = await SessionHistory.find({
        student: student._id,
        completed: true,
      });

      const completedSessionIds = completedSessions.map(s => s.session.toString());
      const missingSessionCount = allSubjectSessions.filter(s => !completedSessionIds.includes(s._id.toString())).length;

      if (missingSessionCount > 0) {
        // Find the adviser for the student's class
        const advisoryClass = await AdvisoryClass.findOne({ class: student.class._id }).select('adviser');
        const adviserId = advisoryClass ? advisoryClass.adviser : null;

        if (!adviserId) {
          console.warn(`No adviser found for class ${student.class._id} of student ${student._id}.`);
        }

        atRiskStudents.push({
          studentId: student._id,
          adviserId: adviserId,
          name: `${student.user.firstName} ${student.user.lastName}`,
          sspCode: subject.name, // Add SSP code here
          missingSessions: missingSessionCount,
          section: student.classDetails.section,
          major: student.classDetails.major,
        });
      }
    }

    console.log('Final at-risk students data being sent:', JSON.stringify(atRiskStudents, null, 2));
    console.log('atRiskStudents:', atRiskStudents.length);
    res.json(atRiskStudents);
  } catch (error) {
    console.error('Error fetching at-risk students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
