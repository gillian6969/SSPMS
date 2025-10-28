const cron = require('node-cron');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const MMSubmission = require('../models/MidtermFinals');
const ExamPermit = require('../models/ExamPermit');
const emailService = require('./emailService');

class ExamReminderScheduler {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the exam reminder scheduler
   * Runs every 6 hours to check for exams starting in 3 days
   */
  start() {
    if (this.isRunning) {
      console.log('Exam reminder scheduler is already running');
      return;
    }

    try {
      console.log('Starting exam reminder scheduler...');
      
      // Run every 6 hours: 0 */6 * * *
      // For testing, you can use every hour: 0 * * * *
      this.cronJob = cron.schedule('0 */6 * * *', async () => {
        try {
          await this.checkUpcomingExams();
        } catch (error) {
          console.error('❌ Error in scheduled exam reminder check:', error);
        }
      }, {
        scheduled: true,
        timezone: 'Asia/Manila'
      });

      this.isRunning = true;
      console.log('✅ Exam reminder scheduler started - checking every 6 hours');
      
      // Run once immediately for testing (after 10 seconds)
      setTimeout(() => {
        this.checkUpcomingExams().catch(error => {
          console.error('❌ Error in initial exam reminder check:', error);
        });
      }, 10000);
      
    } catch (error) {
      console.error('❌ Failed to start exam reminder scheduler:', error);
      this.isRunning = false;
    }
  }

  /**
   * Stop the exam reminder scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log('Exam reminder scheduler stopped');
  }

  /**
   * Check for exams starting in 3 days and send reminders
   */
  async checkUpcomingExams() {
    try {
      console.log('🔍 Checking for upcoming exams (3 days ahead)...');
      
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      
      // Set time to start of day for comparison
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(threeDaysFromNow);
      targetDate.setHours(0, 0, 0, 0);
      
      console.log(`Current time: ${now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`);
      console.log(`Looking for exams starting on: ${targetDate.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' })}`);
      
      // Get all active classes
      const classes = await Class.find({ status: 'active' })
        .populate('students')
        .populate('firstSemester.sspSubject')
        .populate('secondSemester.sspSubject');
      
      console.log(`Found ${classes.length} active classes to check`);

      let totalRemindersSent = 0;

      for (const classData of classes) {
        try {
          const remindersSent = await this.checkClassExams(classData, targetDate);
          totalRemindersSent += remindersSent;
        } catch (error) {
          console.error(`❌ Error checking exams for class ${classData._id}:`, error);
        }
      }
      
      console.log(`✅ Exam reminder check completed. Sent ${totalRemindersSent} reminders`);
      
    } catch (error) {
      console.error('❌ Error checking upcoming exams:', error);
    }
  }

  /**
   * Check exams for a specific class
   */
  async checkClassExams(classData, targetDate) {
    let remindersSent = 0;
    
    // Check both semesters
    const semesters = [
      { 
        semester: '1st', 
        subject: classData.firstSemester?.sspSubject || classData.sspSubject,
        students: classData.students 
      },
      { 
        semester: '2nd', 
        subject: classData.secondSemester?.sspSubject,
        students: classData.students 
      }
    ];

    for (const semesterData of semesters) {
      if (!semesterData.subject) continue;

      try {
        const subject = await Subject.findById(semesterData.subject._id || semesterData.subject);
        if (!subject) continue;

        // Get sessions for this semester
        let sessions = [];
        if (semesterData.semester === '1st') {
          sessions = subject.sessions || [];
        } else {
          // For 2nd semester, prioritize secondSemesterSessions
          if (subject.secondSemesterSessions && subject.secondSemesterSessions.length > 0) {
            sessions = subject.secondSemesterSessions;
          } else {
            sessions = subject.sessions || [];
          }
        }

        // Find exam sessions
        const examSessions = sessions.filter(session => 
          session.startDate && session.endDate
        );

        console.log(`Found ${examSessions.length} exam sessions for ${semesterData.semester} semester in class ${classData.yearLevel}-${classData.section}`);

        // Check each exam session
        for (const examSession of examSessions) {
          const examStartDate = new Date(examSession.startDate);
          examStartDate.setHours(0, 0, 0, 0);
          
          // Check if this exam starts on the target date (3 days from now)
          if (examStartDate.getTime() === targetDate.getTime()) {
            console.log(`📅 Found exam starting in 3 days: ${examSession.title} on ${examStartDate.toLocaleDateString()}`);
            
            // Determine exam type based on session order
            const sortedExamSessions = examSessions.sort((a, b) => (a.day || 0) - (b.day || 0));
            const examIndex = sortedExamSessions.findIndex(s => s._id.toString() === examSession._id.toString());
            const examType = examIndex === 0 ? 'P1' : examIndex === 1 ? 'P2' : examIndex === 2 ? 'P3' : 'Exam';
            
            // Send reminders to students who haven't submitted M&M and permit
            for (const student of semesterData.students) {
              try {
                const reminderSent = await this.sendExamReminder(student, examSession, examType, semesterData.semester, classData.yearLevel);
                if (reminderSent) {
                  remindersSent++;
                }
              } catch (error) {
                console.error(`❌ Error sending reminder to student ${student._id}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${semesterData.semester} semester for class ${classData._id}:`, error);
      }
    }

    return remindersSent;
  }

  /**
   * Send exam reminder to a student
   */
  async sendExamReminder(student, examSession, examType, semester, yearLevel) {
    try {
      // Populate student user data
      const populatedStudent = await Student.findById(student._id).populate('user');
      if (!populatedStudent || !populatedStudent.user) {
        console.log(`⏭️  Student or user not found for student ${student._id}`);
        return false;
      }

      // Check if student already has M&M submission for this exam
      const existingMMSubmission = await MMSubmission.findOne({
        student: student._id,
        yearLevel: yearLevel,
        semester: semester,
        examType: examType
      });

      // Check if student already has permit for this exam
      const existingPermit = await ExamPermit.findOne({
        student: student._id,
        yearLevel: yearLevel,
        semester: semester,
        examType: examType
      });

      // If student already has both M&M and permit, skip reminder
      if (existingMMSubmission && existingPermit) {
        console.log(`⏭️  Student ${populatedStudent.user.firstName} ${populatedStudent.user.lastName} already has ${examType} M&M and permit, skipping reminder`);
        return false;
      }

      // Check if reminder was already sent for this exam (within last 7 days)
      const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
      
      const existingReminder = await Notification.findOne({
        recipient: populatedStudent.user._id,
        title: `${examType} Exam Reminder - ${semester} Semester`,
        type: 'warning',
        createdAt: { $gte: sevenDaysAgo }
      });

      if (existingReminder) {
        console.log(`⏭️  Reminder already sent recently for student ${populatedStudent.user.firstName} ${populatedStudent.user.lastName} for ${examType} exam`);
        return false;
      }

      // Create system notification
      const notification = new Notification({
        recipient: populatedStudent.user._id,
        title: `${examType} Exam Reminder - ${semester} Semester`,
        message: `Your ${examType} exam is coming in 3 days. Make sure you've secured your permit and completed the M&M survey.`,
        type: 'warning',
        read: false,
        link: '/student/surveys'
      });

      await notification.save();
      console.log(`📧 System notification created for student ${populatedStudent.user.firstName} ${populatedStudent.user.lastName}`);

      // Send email if student has email address
      if (populatedStudent.user.email) {
        try {
          await emailService.sendExamReminderEmail(
            populatedStudent.user.email,
            populatedStudent,
            examSession,
            examType,
            semester
          );
          console.log(`📧 Email reminder sent to ${populatedStudent.user.email} for ${examType} exam`);
        } catch (emailError) {
          console.error(`❌ Failed to send email to ${populatedStudent.user.email}:`, emailError);
          // Don't fail the entire operation if email fails
        }
      } else {
        console.log(`⚠️  No email address for student ${populatedStudent.user.firstName} ${populatedStudent.user.lastName}, only system notification sent`);
      }

      return true;

    } catch (error) {
      console.error(`❌ Error sending exam reminder to student ${student._id}:`, error);
      return false;
    }
  }
}

module.exports = new ExamReminderScheduler();
