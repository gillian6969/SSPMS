const cron = require('node-cron');
const Consultation = require('../models/Consultation');
const Notification = require('../models/Notification');
const emailService = require('./emailService');

class NotificationScheduler {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the notification scheduler
   * Runs every 15 minutes to check for upcoming consultations
   */
  start() {
    if (this.isRunning) {
      console.log('Notification scheduler is already running');
      return;
    }

    try {
      console.log('Starting notification scheduler...');
      
      // Run every 15 minutes: 0 */15 * * * *
      // For testing, you can use every minute: * * * * *
      this.cronJob = cron.schedule('0 */15 * * * *', async () => {
        try {
          await this.checkUpcomingConsultations();
        } catch (error) {
          console.error('❌ Error in scheduled consultation check:', error);
        }
      }, {
        scheduled: true,
        timezone: 'Asia/Manila'
      });

      this.isRunning = true;
      console.log('✅ Notification scheduler started - checking every 15 minutes');
      
      // Run once immediately for testing (after 5 seconds)
      setTimeout(() => {
        this.checkUpcomingConsultations().catch(error => {
          console.error('❌ Error in initial consultation check:', error);
        });
      }, 5000);
      
    } catch (error) {
      console.error('❌ Failed to start notification scheduler:', error);
      this.isRunning = false;
    }
  }

  /**
   * Stop the notification scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.isRunning = false;
      console.log('Notification scheduler stopped');
    }
  }

  /**
   * Check for consultations starting in 1 hour and send reminders
   */
  async checkUpcomingConsultations() {
    try {
      console.log('🔍 Checking for upcoming consultations...');
      
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes buffer
      
      // Get current day of week (0 = Sunday, 1 = Monday, etc.)
      const currentDayOfWeek = now.getDay();
      
      // Convert to our system's day format (0 = Monday, 1 = Tuesday, etc.)
      const systemDayOfWeek = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      
      console.log(`Current time: ${now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`);
      console.log(`Looking for consultations on day ${systemDayOfWeek} between ${oneHourFromNow.toLocaleTimeString()} and ${fifteenMinutesFromNow.toLocaleTimeString()}`);
      
      // Find consultations for today that are starting in about 1 hour
      const consultations = await Consultation.find({
        dayOfWeek: systemDayOfWeek,
        status: 'Active',
        'bookings.status': 'Booked' // Only send reminders for booked consultations
      })
      .populate('adviser', 'firstName lastName email salutation')
      .populate({
        path: 'bookings.student',
        populate: [
          { path: 'user', select: 'firstName lastName email idNumber' },
          { path: 'class', select: 'yearLevel section major' },
          { path: 'classDetails', select: 'yearLevel section major' }
        ]
      });

      console.log(`Found ${consultations.length} active consultations for today`);

      for (const consultation of consultations) {
        // Parse consultation start time (stored as number like 10.5 for 10:30 AM)
        const startHour = Math.floor(consultation.startTime);
        const startMinute = Math.round((consultation.startTime - startHour) * 60);
        
        // Create consultation start time for today
        const consultationStartTime = new Date(now);
        consultationStartTime.setHours(startHour, startMinute, 0, 0);
        
        // Check if consultation is starting in approximately 1 hour (±15 minutes window)
        const timeDiff = consultationStartTime.getTime() - now.getTime();
        const isWithinReminderWindow = timeDiff >= (45 * 60 * 1000) && timeDiff <= (75 * 60 * 1000); // 45-75 minutes
        
        if (isWithinReminderWindow) {
          console.log(`📅 Consultation ${consultation._id} starts at ${consultation.startTime} - sending reminders`);
          
          // Send reminders to all booked students
          const bookedStudents = consultation.bookings.filter(booking => booking.status === 'Booked');
          
          for (const booking of bookedStudents) {
            await this.sendConsultationReminder(consultation, booking);
          }
          
          // Send reminder to adviser
          await this.sendAdviserConsultationReminder(consultation);
        }
      }
      
      console.log('✅ Upcoming consultation check completed');
      
    } catch (error) {
      console.error('❌ Error checking upcoming consultations:', error);
    }
  }

  /**
   * Send consultation reminder to a student
   */
  async sendConsultationReminder(consultation, booking) {
    try {
      const student = booking.student;
      const studentUserId = student.user._id;
      
      // Check if reminder was already sent for this booking today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingReminder = await Notification.findOne({
        recipient: studentUserId,
        'meta.consultationId': consultation._id,
        'meta.bookingId': booking._id,
        'meta.reminderType': 'consultation_reminder',
        createdAt: { $gte: today }
      });
      
      if (existingReminder) {
        console.log(`⏭️  Reminder already sent today for booking ${booking._id}`);
        return;
      }
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[consultation.dayOfWeek];
      
      // Send system notification
      const notification = new Notification({
        recipient: studentUserId,
        title: 'Consultation Reminder - Starting in 1 Hour',
        message: `Your consultation with ${consultation.adviser.salutation} ${consultation.adviser.firstName} ${consultation.adviser.lastName} is starting in 1 hour.`,
        details: `Day: ${dayName}, Time: ${consultation.startTime} - ${consultation.endTime}. Meeting Type: ${booking.consultationType === 'chat' ? 'Virtual Meeting' : 'In-Person Meeting'}. Please prepare accordingly.`,
        type: 'warning',
        meta: {
          consultationId: consultation._id,
          bookingId: booking._id,
          reminderType: 'consultation_reminder'
        }
      });
      
      await notification.save();
      console.log(`📢 System reminder sent to student ${student.user.firstName} ${student.user.lastName}`);
      
      // Send email reminder
      try {
        const emailHtml = emailService.generateConsultationReminderEmail(
          student,
          consultation,
          booking
        );
        
        await emailService.sendEmail(
          student.user.email,
          'PHINMA SSCMS - Consultation Reminder (Starting in 1 Hour)',
          emailHtml
        );
        console.log(`📧 Email reminder sent to: ${student.user.email}`);
        
      } catch (emailError) {
        console.error('Failed to send reminder email:', emailError);
      }
      
    } catch (error) {
      console.error('Error sending consultation reminder:', error);
    }
  }

  /**
   * Send consultation reminder to adviser
   */
  async sendAdviserConsultationReminder(consultation) {
    try {
      const adviser = consultation.adviser;
      const adviserUserId = adviser._id;
      
      // Check if reminder was already sent for this consultation today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingReminder = await Notification.findOne({
        recipient: adviserUserId,
        'meta.consultationId': consultation._id,
        'meta.reminderType': 'adviser_consultation_reminder',
        createdAt: { $gte: today }
      });
      
      if (existingReminder) {
        console.log(`⏭️  Adviser reminder already sent today for consultation ${consultation._id}`);
        return;
      }
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[consultation.dayOfWeek];
      
      // Count booked students
      const bookedStudents = consultation.bookings.filter(booking => booking.status === 'Booked');
      
      // Send system notification to adviser
      const notification = new Notification({
        recipient: adviserUserId,
        title: 'Consultation Reminder - Starting in 1 Hour',
        message: `Your consultation is starting in 1 hour. You have ${bookedStudents.length} student(s) booked.`,
        details: `Day: ${dayName}, Time: ${consultation.startTime} - ${consultation.endTime}. Please prepare for your consultation session.`,
        type: 'info',
        meta: {
          consultationId: consultation._id,
          reminderType: 'adviser_consultation_reminder'
        }
      });
      
      await notification.save();
      console.log(`📢 System reminder sent to adviser ${adviser.firstName} ${adviser.lastName}`);
      
      // Send email reminder to adviser
      try {
        const emailHtml = emailService.generateAdviserConsultationReminderEmail(
          adviser,
          consultation,
          bookedStudents
        );
        
        await emailService.sendEmail(
          adviser.email,
          'PHINMA SSCMS - Consultation Reminder (Starting in 1 Hour)',
          emailHtml
        );
        console.log(`📧 Email reminder sent to adviser: ${adviser.email}`);
        
      } catch (emailError) {
        console.error('Failed to send adviser reminder email:', emailError);
      }
      
    } catch (error) {
      console.error('Error sending adviser consultation reminder:', error);
    }
  }

  /**
   * Send a test reminder (for development/testing)
   */
  async sendTestReminder() {
    try {
      console.log('🧪 Sending test reminder...');
      
      // Find any active consultation with booked students
      const consultation = await Consultation.findOne({
        status: 'Active',
        'bookings.status': 'Booked'
      })
      .populate('adviser', 'firstName lastName email salutation')
      .populate({
        path: 'bookings.student',
        populate: [
          { path: 'user', select: 'firstName lastName email idNumber' },
          { path: 'class', select: 'yearLevel section major' },
          { path: 'classDetails', select: 'yearLevel section major' }
        ]
      });
      
      if (consultation) {
        const bookedStudent = consultation.bookings.find(b => b.status === 'Booked');
        if (bookedStudent) {
          await this.sendConsultationReminder(consultation, bookedStudent);
          console.log('✅ Test reminder sent successfully');
        } else {
          console.log('❌ No booked students found for test');
        }
      } else {
        console.log('❌ No active consultations found for test');
      }
      
    } catch (error) {
      console.error('Error sending test reminder:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.cronJob ? 'Every 15 minutes' : null,
      schedule: '0 */15 * * * *'
    };
  }
}

module.exports = new NotificationScheduler();
