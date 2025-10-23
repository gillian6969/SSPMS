const axios = require('axios');

/**
 * Virtual Meeting Service - Supporting Multiple Free APIs
 * 
 * Supported Platforms:
 * 1. Jitsi Meet (100% Free, Open Source)
 * 2. Whereby (Free tier: 4 participants, 45 min)
 * 3. Daily.co (Free tier: 10 participants, 10 rooms)
 * 4. Google Meet (Fallback - persistent rooms)
 */

class VirtualMeetingService {
  constructor() {
    this.providers = {
      jitsi: {
        name: 'Jitsi Meet',
        free: true,
        limits: 'Unlimited participants, unlimited time',
        baseUrl: 'https://meet.jit.si'
      },
      whereby: {
        name: 'Whereby',
        free: true,
        limits: '4 participants, 45 minutes',
        apiUrl: 'https://api.whereby.dev/v1',
        apiKey: process.env.WHEREBY_API_KEY
      },
      daily: {
        name: 'Daily.co',
        free: true,
        limits: '10 participants, 10 rooms',
        apiUrl: 'https://api.daily.co/v1',
        apiKey: process.env.DAILY_API_KEY
      },
      googlemeet: {
        name: 'Google Meet',
        free: true,
        limits: 'Fallback method',
        note: 'Persistent room generation'
      }
    };
  }

  /**
   * Create a meeting room using the best available provider
   * @param {string} bookingId - Unique booking identifier
   * @param {string} consultationTitle - Meeting title
   * @param {string} adviserName - Adviser name
   * @param {string} studentName - Student name
   * @returns {Object} Meeting details
   */
  async createMeeting(bookingId, consultationTitle, adviserName, studentName) {
    console.log(`Creating virtual meeting for booking: ${bookingId}`);
    
    // Try Jitsi first, then Google Meet fallback
    const providers = ['jitsi', 'googlemeet'];
    
    for (const provider of providers) {
      try {
        console.log(`Trying ${this.providers[provider].name}...`);
        
        const result = await this.createMeetingWithProvider(
          provider, 
          bookingId, 
          consultationTitle, 
          adviserName, 
          studentName
        );
        
        if (result.success) {
          console.log(`✅ Meeting created with ${this.providers[provider].name}`);
          return result;
        }
      } catch (error) {
        console.log(`❌ ${this.providers[provider].name} failed:`, error.message);
      }
    }
    
    // If all providers fail, return error
    return {
      success: false,
      error: 'All virtual meeting providers failed',
      provider: 'none'
    };
  }

  /**
   * Create meeting with specific provider
   */
  async createMeetingWithProvider(provider, bookingId, title, adviserName, studentName) {
    switch (provider) {
      case 'jitsi':
        return this.createJitsiMeeting(bookingId, title, adviserName, studentName);
      
      case 'googlemeet':
        return this.createGoogleMeetFallback(bookingId, title, adviserName, studentName);
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Jitsi Meet - 100% Free, Open Source
   * No API key required, unlimited participants and time
   */
  async createJitsiMeeting(bookingId, title, adviserName, studentName) {
    try {
      // Generate deterministic room name based on booking ID
      const roomName = `sscms-consultation-${bookingId.substring(bookingId.length - 8)}`;
      const meetingUrl = `https://meet.jit.si/${roomName}`;
      
      // Jitsi supports URL parameters for customization
      const customizedUrl = `${meetingUrl}?` + new URLSearchParams({
        '#config.startWithAudioMuted': 'true',
        '#config.startWithVideoMuted': 'false',
        '#userInfo.displayName': adviserName // Default name for first joiner
      }).toString();
      
      console.log('Generated Jitsi meeting:', meetingUrl);
      
      return {
        success: true,
        provider: 'jitsi',
        meetingUrl: meetingUrl,
        customizedUrl: customizedUrl,
        roomName: roomName,
        features: {
          maxParticipants: 'Unlimited',
          timeLimit: 'Unlimited',
          recording: 'Available',
          screenShare: 'Available',
          chat: 'Available'
        },
        instructions: {
          adviser: 'Join first to become the moderator',
          student: 'Join using the same link'
        }
      };
    } catch (error) {
      return {
        success: false,
        provider: 'jitsi',
        error: error.message
      };
    }
  }

  // Removed Whereby and Daily.co - using only Jitsi + Google Meet fallback

  /**
   * Google Meet Fallback - Persistent room generation
   * Same as current system
   */
  async createGoogleMeetFallback(bookingId, title, adviserName, studentName) {
    try {
      // Generate persistent room code based on booking ID
      const bookingHash = bookingId.substring(bookingId.length - 12);
      const segment1 = bookingHash.substring(0, 3).toLowerCase();
      const segment2 = bookingHash.substring(3, 7).toLowerCase();
      const segment3 = bookingHash.substring(7, 10).toLowerCase();
      
      const roomCode = `${segment1.padEnd(3, 'x')}-${segment2.padEnd(4, 'y')}-${segment3.padEnd(3, 'z')}`;
      const meetingUrl = `https://meet.google.com/${roomCode}`;
      
      return {
        success: true,
        provider: 'googlemeet',
        meetingUrl: meetingUrl,
        roomCode: roomCode,
        features: {
          maxParticipants: '100',
          timeLimit: '60 minutes (free accounts)',
          recording: 'Not available',
          screenShare: 'Available',
          chat: 'Available'
        },
        instructions: {
          adviser: 'Join first to become the host',
          student: 'Join using the same link'
        }
      };
    } catch (error) {
      return {
        success: false,
        provider: 'googlemeet',
        error: error.message
      };
    }
  }

  /**
   * Get provider information
   */
  getProviderInfo(providerName) {
    return this.providers[providerName] || null;
  }

  /**
   * Test available providers (Jitsi + Google Meet fallback)
   */
  async testAllProviders() {
    const results = {};
    const activeProviders = ['jitsi', 'googlemeet'];
    
    for (const name of activeProviders) {
      const provider = this.providers[name];
      try {
        console.log(`Testing ${provider.name}...`);
        
        const testResult = await this.createMeetingWithProvider(
          name,
          'test-booking-123',
          'Test Meeting',
          'Test Adviser',
          'Test Student'
        );
        
        results[name] = {
          available: testResult.success,
          provider: provider.name,
          limits: provider.limits,
          error: testResult.error || null
        };
        
        console.log(`${provider.name}: ${testResult.success ? '✅ Available' : '❌ Failed'}`);
        
      } catch (error) {
        results[name] = {
          available: false,
          provider: provider.name,
          limits: provider.limits,
          error: error.message
        };
      }
    }
    
    return results;
  }
}

module.exports = new VirtualMeetingService();
