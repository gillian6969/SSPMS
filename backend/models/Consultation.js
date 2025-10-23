const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  adviser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Weekly scheduling fields
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  // Exact calendar date computed from weekStart + dayOfWeek
  consultationDate: {
    type: Date,
    required: false
  },
  // Adviser acceptance status
  adviserAccepted: {
    type: Boolean,
    default: false
  },
  adviserAcceptedAt: {
    type: Date
  },
  adviserDeclinedAt: {
    type: Date
  },
  adviserDeclineReason: {
    type: String,
    trim: true
  },
  // Original consultation fields
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 4 // Monday (0) to Friday (4)
  },
  startTime: {
    type: Number,
    required: true,
    min: 7,
    max: 17 // 7 AM to 5 PM
  },
  endTime: {
    type: Number,
    required: true,
    min: 7,
    max: 18 // 7 AM to 6 PM (end time can be 6 PM if start is 3 PM)
  },
  duration: {
    type: Number,
    required: true,
    default: 3 // 3 hours
  },
  maxStudents: {
    type: Number,
    required: true,
    default: 5,
    min: 1,
    max: 10
  },
  bookedStudents: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Full', 'Pending_Adviser_Acceptance', 'Not_Available', 'Reschedule_Requested', 'Not_Available_Requested'],
    default: 'Pending_Adviser_Acceptance'
  },
  notes: {
    type: String,
    trim: true
  },
  // Reschedule request details
  rescheduleRequest: {
    reason: {
      type: String,
      trim: true
    },
    originalValues: {
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 4
      },
      startTime: {
        type: Number,
        min: 7,
        max: 17
      },
      endTime: {
        type: Number,
        min: 7,
        max: 17
      }
    },
    newDayOfWeek: {
      type: Number,
      min: 0,
      max: 4
    },
    newStartTime: {
      type: Number,
      min: 7,
      max: 17
    },
    newEndTime: {
      type: Number,
      min: 7,
      max: 17
    },
    requestedAt: {
      type: Date
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Array of student bookings
  bookings: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Booked', 'Pending', 'Confirmed', 'Cancelled', 'Resolved', 'Escalated', 'Completed'],
      default: 'Booked'
    },
    // Consultation type (in-person or chat)
    consultationType: {
      type: String,
      enum: ['in-person', 'chat'],
      default: 'in-person'
    },
    concern: {
      type: String,
      enum: [
        'Academic Performance and Grades',
        'Career Planning and Future Goals', 
        'Time Management and Workload',
        'Financial Concerns',
        'Mental Health and Personal Well-being',
        'Other'
      ],
      required: true
    },
    notes: String,
    // Time allocation within the consultation slot
    allocatedStartTime: {
      type: String, // Format: "HH:MM"
      trim: true
    },
    allocatedEndTime: {
      type: String, // Format: "HH:MM"  
      trim: true
    },
    allocatedDuration: {
      type: Number, // Duration in minutes
      default: 30 // Default 30 minutes per student
    },
    // Virtual meeting link
    meetingLink: {
      type: String,
      trim: true
    },
    meetingStarted: {
      type: Boolean,
      default: false
    },
    meetingStartedAt: {
      type: Date
    },
    // Google Calendar event ID for meeting management
    googleEventId: {
      type: String,
      trim: true
    },
    // Notifications
    scheduleNotificationSent: {
      type: Boolean,
      default: false
    },
    scheduleNotificationSentAt: {
      type: Date
    },
    // Resolution (when status is 'Resolved')
    resolution: {
      type: String,
      trim: true
    },
    resolvedAt: {
      type: Date
    },
    // Feedback and escalation (when status is 'Escalated')
    feedback: {
      type: String,
      trim: true
    },
    feedbackAt: {
      type: Date
    },
    // Completion notes (when status is 'Completed')
    completionNotes: {
      type: String,
      trim: true
    },
    completedAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
ConsultationSchema.index({ adviser: 1, dayOfWeek: 1, startTime: 1 });
ConsultationSchema.index({ status: 1 });

// Virtual for checking if consultation is full
ConsultationSchema.virtual('isFull').get(function() {
  return this.bookedStudents >= this.maxStudents;
});

// Virtual for available slots
ConsultationSchema.virtual('availableSlots').get(function() {
  return this.maxStudents - this.bookedStudents;
});

// Pre-save middleware to update status based on bookings
ConsultationSchema.pre('save', function(next) {
  // Update bookedStudents count (count all bookings except cancelled)
  this.bookedStudents = this.bookings.filter(booking => 
    booking.status !== 'Cancelled'
  ).length;
  
  // Update status based on availability and adviser acceptance
  // Don't override Reschedule_Requested or Not_Available_Requested status
  if (this.status !== 'Reschedule_Requested' && this.status !== 'Not_Available_Requested') {
    if (!this.adviserAccepted) {
      this.status = 'Pending_Adviser_Acceptance';
    } else if (this.bookedStudents >= this.maxStudents) {
      this.status = 'Full';
    } else if (this.status === 'Full' && this.bookedStudents < this.maxStudents) {
      this.status = 'Active';
    } else if (this.adviserAccepted && this.status === 'Pending_Adviser_Acceptance') {
      this.status = 'Active';
    }
  }
  
  // Auto-allocate time slots for confirmed bookings that don't have them yet
  this.autoAllocateTimeSlots();

  // Ensure consultationDate is set from weekStart + dayOfWeek
  try {
    if (this.weekStart && (this.dayOfWeek === 0 || this.dayOfWeek === 1 || this.dayOfWeek === 2 || this.dayOfWeek === 3 || this.dayOfWeek === 4)) {
      const base = new Date(this.weekStart);
      const d = new Date(base);
      d.setDate(base.getDate() + Number(this.dayOfWeek));
      this.consultationDate = d;
    }
  } catch (e) {
    // noop
  }
  
  next();
});

// Method to automatically allocate time slots to confirmed bookings
ConsultationSchema.methods.autoAllocateTimeSlots = function() {
  const confirmedBookings = this.bookings.filter(booking => 
    booking.status === 'Confirmed' && !booking.allocatedStartTime
  );
  
  if (confirmedBookings.length === 0) return;
  
  const totalDurationMinutes = this.duration * 60; // Convert hours to minutes
  const baseSlotDuration = Math.floor(totalDurationMinutes / this.maxStudents);
  
  // Ensure minimum 20 minutes per student, maximum 60 minutes
  const slotDuration = Math.max(20, Math.min(60, baseSlotDuration));
  
  let currentStartTime = this.startTime * 60; // Convert to minutes from midnight
  
  confirmedBookings.forEach((booking, index) => {
    const startMinutes = currentStartTime + (index * slotDuration);
    const endMinutes = startMinutes + slotDuration;
    
    // Convert back to HH:MM format
    booking.allocatedStartTime = this.minutesToTimeString(startMinutes);
    booking.allocatedEndTime = this.minutesToTimeString(endMinutes);
    booking.allocatedDuration = slotDuration;
  });
};

// Helper method to convert minutes to HH:MM format
ConsultationSchema.methods.minutesToTimeString = function(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Method to get formatted time range for a booking
ConsultationSchema.methods.getBookingTimeRange = function(booking) {
  if (!booking.allocatedStartTime || !booking.allocatedEndTime) {
    return 'Time not allocated';
  }
  
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };
  
  return `${formatTime(booking.allocatedStartTime)} - ${formatTime(booking.allocatedEndTime)}`;
};

// Static method to find available consultations for a specific day and time
ConsultationSchema.statics.findAvailable = function(dayOfWeek, startTime, endTime) {
  return this.find({
    dayOfWeek: dayOfWeek,
    startTime: { $lte: startTime },
    endTime: { $gte: endTime },
    status: 'Active'
  }).populate('adviser', 'firstName lastName email');
};

// Static method to find consultations by adviser
ConsultationSchema.statics.findByAdviser = function(adviserId) {
  return this.find({ adviser: adviserId })
    .populate('adviser', 'firstName lastName email')
    .populate('bookings.student', 'user')
    .populate({
      path: 'bookings.student',
      populate: {
        path: 'user',
        select: 'firstName lastName email idNumber'
      }
    });
};

// Static method to find consultations for a specific week
ConsultationSchema.statics.findByWeek = function(weekStart, weekEnd) {
  return this.find({
    weekStart: { $gte: weekStart },
    weekEnd: { $lte: weekEnd }
  })
  .populate('adviser', 'firstName lastName email')
  .populate({
    path: 'bookings.student',
    populate: {
      path: 'user',
      select: 'firstName lastName email idNumber'
    }
  });
};

// Static method to find pending adviser acceptances
ConsultationSchema.statics.findPendingAcceptance = function(adviserId) {
  return this.find({
    adviser: adviserId,
    adviserAccepted: false,
    status: 'Pending_Adviser_Acceptance'
  })
  .populate('adviser', 'firstName lastName email');
};

// Method to accept weekly schedule
ConsultationSchema.methods.acceptSchedule = function() {
  this.adviserAccepted = true;
  this.adviserAcceptedAt = new Date();
  this.status = 'Active';
  return this.save();
};

// Method to decline weekly schedule
ConsultationSchema.methods.declineSchedule = function(reason) {
  this.adviserAccepted = false;
  this.adviserDeclinedAt = new Date();
  this.adviserDeclineReason = reason;
  this.status = 'Inactive';
  return this.save();
};

module.exports = mongoose.model('Consultation', ConsultationSchema); 