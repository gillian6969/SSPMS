const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  async sendEmail(to, subject, html) {
    try {
      if (this.isProduction) {
        // Production: Use SendGrid
        if (!process.env.EMAIL_PASSWORD) {
          throw new Error('EMAIL_PASSWORD environment variable is required for SendGrid in production');
        }
        
        // Validate SendGrid API key format
        if (!process.env.EMAIL_PASSWORD.startsWith('SG.')) {
          throw new Error('Invalid SendGrid API key format. API key must start with "SG."');
        }
        
        sgMail.setApiKey(process.env.EMAIL_PASSWORD);
        
        const msg = {
          to: to,
          from: 'noreply@sscms-au.com',
          subject: subject,
          html: html
        };
        
        await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid to:', to);
      } else {
        // Development: Use Gmail/Nodemailer
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: to,
          subject: subject,
          html: html
        };
        
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully via Gmail to:', to);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  // Consultation created by admin
  generateConsultationCreatedEmail(adviser, consultation) {
    const weekStart = new Date(consultation.weekStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const weekEnd = new Date(consultation.weekEnd).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][consultation.dayOfWeek];
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">PHINMA SSCMS</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Student Success Compliance and Monitoring System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">New Consultation Schedule Created</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${adviser.salutation} ${adviser.firstName} ${adviser.lastName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            A new consultation schedule has been created for you. Please review and accept the schedule as soon as possible.
          </p>
          
          <!-- Consultation Details -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Consultation Details</h3>
            <div style="color: #374151; font-size: 14px; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>Week:</strong> ${weekStart} - ${weekEnd}</p>
              <p style="margin: 5px 0;"><strong>Day:</strong> ${dayName}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${consultation.startTime} - ${consultation.endTime}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${consultation.duration} hours</p>
              <p style="margin: 5px 0;"><strong>Max Students:</strong> ${consultation.maxStudents}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://sscms-au.com'}/adviser/consultations" style="display: inline-block; background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Review Consultation Schedule
            </a>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 14px;">Important</h4>
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
              Please accept or decline this consultation schedule as soon as possible. Students will not be able to book consultations until you accept the schedule.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 PHINMA Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  // Adviser accepts consultation
  generateConsultationAcceptedEmail(admin, consultation, adviser) {
    const weekStart = new Date(consultation.weekStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const weekEnd = new Date(consultation.weekEnd).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][consultation.dayOfWeek];
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">PHINMA SSCMS</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Student Success Compliance and Monitoring System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">✅ Consultation Schedule Accepted</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${admin.firstName} ${admin.lastName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            <strong>${adviser.salutation} ${adviser.firstName} ${adviser.lastName}</strong> has accepted the consultation schedule for the week of ${weekStart} - ${weekEnd}.
          </p>
          
          <!-- Consultation Details -->
          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Accepted Schedule</h3>
            <div style="color: #374151; font-size: 14px; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>Adviser:</strong> ${adviser.salutation} ${adviser.firstName} ${adviser.lastName}</p>
              <p style="margin: 5px 0;"><strong>Week:</strong> ${weekStart} - ${weekEnd}</p>
              <p style="margin: 5px 0;"><strong>Day:</strong> ${dayName}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${consultation.startTime} - ${consultation.endTime}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${consultation.duration} hours</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://sscms-au.com'}/admin/consultations" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Consultation Schedule
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 PHINMA Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  // Adviser declines consultation
  generateConsultationDeclinedEmail(admin, consultation, adviser, reason) {
    const weekStart = new Date(consultation.weekStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const weekEnd = new Date(consultation.weekEnd).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][consultation.dayOfWeek];
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">PHINMA SSCMS</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Student Success Compliance and Monitoring System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">❌ Consultation Schedule Declined</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${admin.firstName} ${admin.lastName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            <strong>${adviser.salutation} ${adviser.firstName} ${adviser.lastName}</strong> has declined the consultation schedule for the week of ${weekStart} - ${weekEnd}.
          </p>
          
          <!-- Decline Reason -->
          <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Decline Reason</h3>
            <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">${reason}</p>
          </div>
          
          <!-- Consultation Details -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Declined Schedule</h3>
            <div style="color: #374151; font-size: 14px; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>Adviser:</strong> ${adviser.salutation} ${adviser.firstName} ${adviser.lastName}</p>
              <p style="margin: 5px 0;"><strong>Week:</strong> ${weekStart} - ${weekEnd}</p>
              <p style="margin: 5px 0;"><strong>Day:</strong> ${dayName}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${consultation.startTime} - ${consultation.endTime}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://sscms-au.com'}/admin/consultations" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Consultation Schedule
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 PHINMA Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  // Reschedule approved by admin
  generateRescheduleApprovedEmail(adviser, consultation) {
    const weekStart = new Date(consultation.weekStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const weekEnd = new Date(consultation.weekEnd).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][consultation.dayOfWeek];
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">PHINMA SSCMS</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Student Success Compliance and Monitoring System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">✅ Reschedule Request Approved</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${adviser.salutation} ${adviser.firstName} ${adviser.lastName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Your reschedule request has been approved. The consultation schedule has been updated with your new preferred time.
          </p>
          
          <!-- Updated Schedule -->
          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Updated Schedule</h3>
            <div style="color: #374151; font-size: 14px; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>Week:</strong> ${weekStart} - ${weekEnd}</p>
              <p style="margin: 5px 0;"><strong>Day:</strong> ${dayName}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${consultation.startTime} - ${consultation.endTime}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${consultation.duration} hours</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://sscms-au.com'}/adviser/consultations" style="display: inline-block; background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Updated Schedule
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 PHINMA Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  // Reschedule rejected by admin
  generateRescheduleRejectedEmail(adviser, consultation, reason) {
    const weekStart = new Date(consultation.weekStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const weekEnd = new Date(consultation.weekEnd).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][consultation.dayOfWeek];
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">PHINMA SSCMS</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Student Success Compliance and Monitoring System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">❌ Reschedule Request Rejected</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${adviser.salutation} ${adviser.firstName} ${adviser.lastName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Your reschedule request has been rejected. The consultation schedule remains as originally assigned.
          </p>
          
          <!-- Rejection Reason -->
          <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Rejection Reason</h3>
            <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">${reason}</p>
          </div>
          
          <!-- Original Schedule -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Original Schedule</h3>
            <div style="color: #374151; font-size: 14px; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>Week:</strong> ${weekStart} - ${weekEnd}</p>
              <p style="margin: 5px 0;"><strong>Day:</strong> ${dayName}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${consultation.startTime} - ${consultation.endTime}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${consultation.duration} hours</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://sscms-au.com'}/adviser/consultations" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Consultation Schedule
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 PHINMA Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  // Schedule removal approved by admin
  generateRemovalApprovedEmail(adviser, consultation) {
    const weekStart = new Date(consultation.weekStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const weekEnd = new Date(consultation.weekEnd).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][consultation.dayOfWeek];
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">PHINMA SSCMS</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Student Success Compliance and Monitoring System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">✅ Schedule Removal Approved</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${adviser.salutation} ${adviser.firstName} ${adviser.lastName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Your request to remove the consultation schedule has been approved. The schedule has been removed from the system.
          </p>
          
          <!-- Removed Schedule -->
          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Removed Schedule</h3>
            <div style="color: #374151; font-size: 14px; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>Week:</strong> ${weekStart} - ${weekEnd}</p>
              <p style="margin: 5px 0;"><strong>Day:</strong> ${dayName}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${consultation.startTime} - ${consultation.endTime}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${consultation.duration} hours</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://sscms-au.com'}/adviser/consultations" style="display: inline-block; background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Consultation Schedule
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 PHINMA Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  // Schedule removal rejected by admin
  generateRemovalRejectedEmail(adviser, consultation, reason) {
    const weekStart = new Date(consultation.weekStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const weekEnd = new Date(consultation.weekEnd).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][consultation.dayOfWeek];
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">PHINMA SSCMS</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Student Success Compliance and Monitoring System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">❌ Schedule Removal Rejected</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${adviser.salutation} ${adviser.firstName} ${adviser.lastName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Your request to remove the consultation schedule has been rejected. The consultation schedule remains active.
          </p>
          
          <!-- Rejection Reason -->
          <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Rejection Reason</h3>
            <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">${reason}</p>
          </div>
          
          <!-- Active Schedule -->
          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Active Schedule</h3>
            <div style="color: #374151; font-size: 14px; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>Week:</strong> ${weekStart} - ${weekEnd}</p>
              <p style="margin: 5px 0;"><strong>Day:</strong> ${dayName}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${consultation.startTime} - ${consultation.endTime}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${consultation.duration} hours</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://sscms-au.com'}/adviser/consultations" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Consultation Schedule
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 PHINMA Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  // Student booked consultation - email to student
  generateStudentBookingConfirmationEmail(student, consultation, booking) {
    const weekStart = new Date(consultation.weekStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const weekEnd = new Date(consultation.weekEnd).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][consultation.dayOfWeek];
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">PHINMA SSCMS</h1>
          <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 16px;">Student Success Compliance and Monitoring System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Consultation Booking Confirmed</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${student.user.firstName} ${student.user.lastName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Your consultation booking has been confirmed. Please review the details below and wait for your adviser to accept your booking.
          </p>
          
          <!-- Consultation Details -->
          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Consultation Details</h3>
            <div style="color: #374151; font-size: 14px; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>Adviser:</strong> ${consultation.adviser.salutation} ${consultation.adviser.firstName} ${consultation.adviser.lastName}</p>
              <p style="margin: 5px 0;"><strong>Week:</strong> ${weekStart} - ${weekEnd}</p>
              <p style="margin: 5px 0;"><strong>Day:</strong> ${dayName}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${consultation.startTime} - ${consultation.endTime}</p>
              <p style="margin: 5px 0;"><strong>Meeting Type:</strong> ${booking.consultationType === 'chat' ? 'Virtual Meeting' : 'In-Person Meeting'}</p>
              <p style="margin: 5px 0;"><strong>Concern:</strong> ${booking.concern}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #0ea5e9; font-weight: bold;">Booked (Waiting for Adviser Acceptance)</span></p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://sscms-au.com'}/student/consultations" style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View My Consultations
            </a>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 14px;">Next Steps</h4>
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
              Your adviser will review and accept your booking. You will receive another notification once your consultation is confirmed and ready.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 PHINMA Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  // Student consultation accepted - email to student
  generateStudentConsultationAcceptedEmail(student, consultation, booking) {
    const weekStart = new Date(consultation.weekStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const weekEnd = new Date(consultation.weekEnd).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][consultation.dayOfWeek];
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">PHINMA SSCMS</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Student Success Compliance and Monitoring System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Consultation Confirmed - Ready for Meeting</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${student.user.firstName} ${student.user.lastName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Great news! Your adviser has accepted your consultation booking. Your consultation is now confirmed and ready.
          </p>
          
          <!-- Consultation Details -->
          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Confirmed Consultation</h3>
            <div style="color: #374151; font-size: 14px; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>Adviser:</strong> ${consultation.adviser.salutation} ${consultation.adviser.firstName} ${consultation.adviser.lastName}</p>
              <p style="margin: 5px 0;"><strong>Week:</strong> ${weekStart} - ${weekEnd}</p>
              <p style="margin: 5px 0;"><strong>Day:</strong> ${dayName}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${consultation.startTime} - ${consultation.endTime}</p>
              <p style="margin: 5px 0;"><strong>Meeting Type:</strong> ${booking.consultationType === 'chat' ? 'Virtual Meeting' : 'In-Person Meeting'}</p>
              <p style="margin: 5px 0;"><strong>Concern:</strong> ${booking.concern}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">Confirmed - Ready for Meeting</span></p>
            </div>
          </div>
          
          <!-- Meeting Instructions -->
          <div style="background-color: ${booking.consultationType === 'chat' ? '#eff6ff' : '#f0fdf4'}; border: 1px solid ${booking.consultationType === 'chat' ? '#3b82f6' : '#22c55e'}; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Meeting Instructions</h3>
            ${booking.consultationType === 'chat' ? `
              <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                <strong>Virtual Meeting:</strong> Your adviser will start the meeting at the scheduled time. You will receive the meeting link when the session begins.
              </p>
              <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">
                Please be ready to join the virtual meeting room when notified.
              </p>
              ${booking.meetingLink && booking.meetingStarted ? `
                <div style="margin-top: 15px; padding: 10px; background-color: #dbeafe; border-radius: 6px;">
                  <p style="color: #1e40af; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">Meeting is now active!</p>
                  <a href="${booking.meetingLink}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px;">
                    Join Meeting Now
                  </a>
                </div>
              ` : ''}
            ` : `
              <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>In-Person Meeting:</strong> Please go to the faculty room at your scheduled time for your consultation.
              </p>
            `}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://sscms-au.com'}/student/consultations" style="display: inline-block; background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View My Consultations
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 PHINMA Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  // Consultation reminder - 1 hour before
  generateConsultationReminderEmail(student, consultation, booking) {
    const weekStart = new Date(consultation.weekStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][consultation.dayOfWeek];
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">PHINMA SSCMS</h1>
          <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Student Success Compliance and Monitoring System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Consultation Reminder - Starting Soon</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${student.user.firstName} ${student.user.lastName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            This is a friendly reminder that your consultation with your adviser is starting in <strong>1 hour</strong>. Please prepare accordingly.
          </p>
          
          <!-- Consultation Details -->
          <div style="background-color: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Upcoming Consultation</h3>
            <div style="color: #374151; font-size: 14px; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>Adviser:</strong> ${consultation.adviser.salutation} ${consultation.adviser.firstName} ${consultation.adviser.lastName}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${dayName}, ${weekStart}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${consultation.startTime} - ${consultation.endTime}</p>
              <p style="margin: 5px 0;"><strong>Meeting Type:</strong> ${booking.consultationType === 'chat' ? 'Virtual Meeting' : 'In-Person Meeting'}</p>
              <p style="margin: 5px 0;"><strong>Concern:</strong> ${booking.concern}</p>
            </div>
          </div>
          
          <!-- Meeting Instructions -->
          <div style="background-color: ${booking.consultationType === 'chat' ? '#eff6ff' : '#f0fdf4'}; border: 1px solid ${booking.consultationType === 'chat' ? '#3b82f6' : '#22c55e'}; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Preparation Instructions</h3>
            ${booking.consultationType === 'chat' ? `
              <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                <strong>Virtual Meeting:</strong> Please ensure you have a stable internet connection and test your camera/microphone. Your adviser will start the meeting at the scheduled time.
              </p>
              <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">
                You will receive the meeting link when your adviser starts the session.
              </p>
            ` : `
              <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>In-Person Meeting:</strong> Please arrive at the faculty room a few minutes before your scheduled time. Bring any necessary documents or materials for your consultation.
              </p>
            `}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://sscms-au.com'}/student/consultations" style="display: inline-block; background-color: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View My Consultations
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">© 2024 PHINMA Education. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }
}

module.exports = new EmailService();
