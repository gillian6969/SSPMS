const { google } = require('googleapis');
const path = require('path');

// Initialize Google Auth using the existing service account
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/google-service-account.json'),
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/meetings.space.created',
    'https://www.googleapis.com/auth/meetings.space.readonly'
  ]
});

const calendar = google.calendar({ version: 'v3', auth });

/**
 * Create a consultation meeting with Google Meet integration
 * @param {string} bookingId - The booking ID
 * @param {string} consultationTitle - Title of the consultation
 * @param {string} adviserName - Name of the adviser
 * @param {string} studentName - Name of the student
 * @returns {Object} Meeting details including Google Meet URL
 */
const createConsultationMeeting = async (bookingId, consultationTitle, adviserName, studentName) => {
  try {
    console.log(`Creating consultation meeting for booking ${bookingId}`);
    
    const now = new Date();
    const endTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration
    
    // First, try to create event with Google Meet
    let event = {
      summary: `SSCMS Consultation: ${consultationTitle}`,
      description: `Virtual consultation session between ${adviserName} and ${studentName}\n\nBooking ID: ${bookingId}\nSystem: Student Success Compliance and Monitoring System\n\nNote: This meeting was created automatically. Please join at the scheduled time.`,
      start: {
        dateTime: now.toISOString(),
        timeZone: 'Asia/Manila'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Manila'
      },
      // Set visibility to public so both adviser and student can join
      visibility: 'public',
      // Add some metadata
      extendedProperties: {
        private: {
          bookingId: bookingId,
          system: 'sscms',
          type: 'consultation'
        }
      }
    };
    
    console.log('Creating calendar event...');
    
    // Skip Google Meet API integration - using alternative APIs and fallback
    
    // Create basic calendar event for record keeping
    console.log('Creating calendar event for consultation record...');
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });
    
    console.log('Calendar event created successfully');
    console.log('Event ID:', response.data.id);
    
    // Use the new Virtual Meeting Service to create meeting
    const virtualMeetingService = require('./virtualMeetingService');
    
    console.log('Creating virtual meeting with alternative APIs...');
    const meetingResult = await virtualMeetingService.createMeeting(
      bookingId,
      consultationTitle,
      adviserName,
      studentName
    );
    
    if (!meetingResult.success) {
      throw new Error(`Failed to create virtual meeting: ${meetingResult.error}`);
    }
    
    console.log(`Virtual meeting created with ${meetingResult.provider}:`, meetingResult.meetingUrl);
    
    return {
      success: true,
      meetingUrl: meetingResult.meetingUrl,
      eventId: response.data.id,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime,
      provider: meetingResult.provider,
      features: meetingResult.features,
      instructions: meetingResult.instructions,
      method: 'virtual_meeting_service',
      note: `Meeting created with ${meetingResult.provider} - both adviser and student will join the same room`
    };
    
  } catch (error) {
    console.error('Google Calendar API Error:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};

/**
 * Delete a consultation meeting
 * @param {string} eventId - The Google Calendar event ID
 * @returns {Object} Deletion result
 */
const deleteConsultationMeeting = async (eventId) => {
  try {
    console.log(`Deleting Google Calendar event: ${eventId}`);
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });
    
    console.log('Calendar event deleted successfully');
    
    return {
      success: true,
      message: 'Meeting deleted successfully'
    };
    
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Google Meet API functions removed - using alternative free APIs

/**
 * Test the Google Calendar API connection
 * @returns {Object} Test result
 */
const testCalendarConnection = async () => {
  try {
    console.log('Testing Google Calendar API connection...');
    
    // Try to list calendars to test connection
    const response = await calendar.calendarList.list({
      maxResults: 1
    });
    
    console.log('Google Calendar API connection successful');
    console.log('Service account email:', response.data.items[0]?.id);
    
    return {
      success: true,
      message: 'Google Calendar API connection successful',
      serviceAccountEmail: response.data.items[0]?.id
    };
    
  } catch (error) {
    console.error('Google Calendar API connection failed:', error);
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};

module.exports = {
  createConsultationMeeting,
  deleteConsultationMeeting,
  testCalendarConnection
};
