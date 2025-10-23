const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Student = require('../models/Student');
const { authenticate, authorizeAdmin, authorizeAdviser } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Get all consultations (Admin only)
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Auto-inactivate past consultations before returning data
    await autoInactivatePastConsultations();
    
    const consultations = await Consultation.find()
      .populate('adviser', 'firstName lastName email salutation')
      .populate({
        path: 'bookings.student',
        populate: [
          {
          path: 'user',
          select: 'firstName lastName email idNumber'
          },
          {
            path: 'class',
            select: 'className section yearLevel major'
        }
        ],
        select: 'user classDetails major gender contactNumber class'
      })
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json(consultations);
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all consultations for admin analytics
router.get('/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { yearLevel, section, major } = req.query;
    
    // Build filter for students
    const studentFilter = { status: 'active' };
    if (yearLevel) studentFilter['classDetails.yearLevel'] = yearLevel;
    if (section) studentFilter['classDetails.section'] = section;
    if (major) studentFilter['classDetails.major'] = major;
    
    // Get student IDs that match the filters
    const filteredStudents = await Student.find(studentFilter).select('_id');
    const studentIds = filteredStudents.map(s => s._id);
    
    // Build consultation filter
    let consultationFilter = {};
    if (studentIds.length > 0) {
      consultationFilter = {
        'bookings.student': { $in: studentIds }
      };
    }
    
    const consultations = await Consultation.find(consultationFilter)
      .populate('adviser', 'firstName lastName email salutation')
      .populate({
        path: 'bookings.student',
        populate: [
          {
            path: 'user',
            select: 'firstName lastName email idNumber'
          },
          {
            path: 'class',
            select: '_id name'
          }
        ]
      })
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json(consultations);
  } catch (error) {
    console.error('Get all consultations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's bookings (moved before /:id route to prevent conflicts)
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    console.log('My-bookings endpoint called by user:', req.user._id, 'role:', req.user.role);
    
    // Only students can access this endpoint
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }
    
    // Find the student record
    const student = await Student.findOne({ user: req.user._id });
    console.log('Found student:', student ? student._id : 'not found');
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Find all consultations that have bookings from this student
    const consultations = await Consultation.find({
      'bookings.student': student._id
    })
    .populate('adviser', 'firstName lastName email salutation')
    .sort({ dayOfWeek: 1, startTime: 1 });
    
    console.log('Found consultations with student bookings:', consultations.length);
    
    // Extract and flatten the bookings for this student
    const studentBookings = [];
    
    consultations.forEach(consultation => {
      console.log(`Consultation ${consultation._id} has ${consultation.bookings.length} bookings`);
      
      consultation.bookings.forEach(booking => {
        console.log('Checking booking student:', booking.student.toString(), 'vs student:', student._id.toString());
        
        if (booking.student.toString() === student._id.toString()) {
          console.log('Found matching booking:', booking._id, 'feedback:', booking.feedback ? 'exists' : 'none');
          
          studentBookings.push({
            _id: booking._id,
            consultation: {
              _id: consultation._id,
              dayOfWeek: consultation.dayOfWeek,
              startTime: consultation.startTime,
              endTime: consultation.endTime,
              duration: consultation.duration,
              adviser: consultation.adviser,
              maxStudents: consultation.maxStudents,
              status: consultation.status
            },
            status: booking.status,
            concern: booking.concern,
            notes: booking.notes,
            consultationType: booking.consultationType, // Add missing consultationType
            meetingLink: booking.meetingLink, // Add meeting link for virtual meetings
            meetingStarted: booking.meetingStarted, // Add meeting started status
            meetingStartedAt: booking.meetingStartedAt, // Add meeting started timestamp
            allocatedStartTime: booking.allocatedStartTime, // Add allocated time
            allocatedEndTime: booking.allocatedEndTime, // Add allocated time
            feedback: booking.feedback,
            feedbackAt: booking.feedbackAt,
            bookedAt: booking.bookedAt,
            updatedAt: booking.updatedAt
          });
        }
      });
    });
    
    console.log('Total student bookings found:', studentBookings.length);
    
    // Sort bookings by booking date (newest first)
    studentBookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    
    res.json(studentBookings);
  } catch (error) {
    console.error('Get student bookings error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Alternative method to get student's bookings using aggregation
router.get('/my-bookings-alt', authenticate, async (req, res) => {
  try {
    console.log('My-bookings-alt endpoint called by user:', req.user._id, 'role:', req.user.role);
    
    // Only students can access this endpoint
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }
    
    // Find the student record
    const student = await Student.findOne({ user: req.user._id });
    console.log('Found student:', student ? student._id : 'not found');
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Use aggregation to get bookings
    const result = await Consultation.aggregate([
      // Match consultations that have bookings from this student
      {
        $match: {
          'bookings.student': student._id
        }
      },
      // Unwind bookings array
      {
        $unwind: '$bookings'
      },
      // Match only bookings from this student
      {
        $match: {
          'bookings.student': student._id
        }
      },
      // Lookup adviser information
      {
        $lookup: {
          from: 'users',
          localField: 'adviser',
          foreignField: '_id',
          as: 'adviserInfo'
        }
      },
      // Project the desired fields
      {
        $project: {
          _id: '$bookings._id',
          consultation: {
            _id: '$_id',
            dayOfWeek: '$dayOfWeek',
            startTime: '$startTime',
            endTime: '$endTime',
            duration: '$duration',
            maxStudents: '$maxStudents',
            status: '$status',
            adviser: { $arrayElemAt: ['$adviserInfo', 0] }
          },
          status: '$bookings.status',
          concern: '$bookings.concern',
          notes: '$bookings.notes',
          consultationType: '$bookings.consultationType', // Add missing consultationType
          meetingLink: '$bookings.meetingLink', // Add meeting link for virtual meetings
          allocatedStartTime: '$bookings.allocatedStartTime', // Add allocated time
          allocatedEndTime: '$bookings.allocatedEndTime', // Add allocated time
          feedback: '$bookings.feedback',
          feedbackAt: '$bookings.feedbackAt',
          bookedAt: '$bookings.bookedAt',
          updatedAt: '$bookings.updatedAt'
        }
      },
      // Sort by booking date (newest first)
      {
        $sort: { bookedAt: -1 }
      }
    ]);
    
    console.log('Aggregation result count:', result.length);
    
    // Clean up adviser info
    const studentBookings = result.map(booking => ({
      ...booking,
      consultation: {
        ...booking.consultation,
        adviser: {
          _id: booking.consultation.adviser._id,
          firstName: booking.consultation.adviser.firstName,
          lastName: booking.consultation.adviser.lastName,
          email: booking.consultation.adviser.email,
          salutation: booking.consultation.adviser.salutation
        }
      }
    }));
    
    res.json(studentBookings);
  } catch (error) {
    console.error('Get student bookings (alt) error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Debug endpoint to check student and consultation data
router.get('/debug/student-data', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }
    
    // Find the student record
    const student = await Student.findOne({ user: req.user._id });
    
    // Get all consultations
    const allConsultations = await Consultation.find({})
      .populate('adviser', 'firstName lastName email')
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    // Get consultations with any bookings
    const consultationsWithBookings = await Consultation.find({
      'bookings.0': { $exists: true }
    }).populate('adviser', 'firstName lastName email');
    
    // Get consultations with this student's bookings
    const consultationsWithStudentBookings = await Consultation.find({
      'bookings.student': student ? student._id : null
    }).populate('adviser', 'firstName lastName email');
    
    res.json({
      user: {
        _id: req.user._id,
        role: req.user.role,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      },
      student: student ? {
        _id: student._id,
        user: student.user,
        idNumber: student.idNumber
      } : null,
      stats: {
        totalConsultations: allConsultations.length,
        consultationsWithBookings: consultationsWithBookings.length,
        consultationsWithStudentBookings: consultationsWithStudentBookings.length
      },
      consultationsWithStudentBookings: consultationsWithStudentBookings.map(c => ({
        _id: c._id,
        adviser: c.adviser,
        dayOfWeek: c.dayOfWeek,
        startTime: c.startTime,
        endTime: c.endTime,
        bookings: c.bookings.map(b => ({
          _id: b._id,
          student: b.student,
          status: b.status,
          concern: b.concern,
          feedback: b.feedback,
          feedbackAt: b.feedbackAt,
          bookedAt: b.bookedAt
        }))
      }))
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get available consultations for students
router.get('/available/all', authenticate, async (req, res) => {
  try {
    // Auto-inactivate past consultations before returning data
    await autoInactivatePastConsultations();
    
    const { dayOfWeek, startTime, endTime } = req.query;
    
    let query = { status: { $in: ['Active', 'Inactive'] } };
    
    if (dayOfWeek !== undefined) {
      query.dayOfWeek = parseInt(dayOfWeek);
    }
    
    if (startTime !== undefined && endTime !== undefined) {
      query.startTime = { $lte: parseInt(startTime) };
      query.endTime = { $gte: parseInt(endTime) };
    }
    
    const consultations = await Consultation.find(query)
      .populate('adviser', 'firstName lastName email salutation')
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    // Filter out full consultations
    const availableConsultations = consultations.filter(consultation => 
      consultation.bookedStudents < consultation.maxStudents
    );
    
    res.json(availableConsultations);
  } catch (error) {
    console.error('Get available consultations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultations by adviser (For adviser use)
router.get('/adviser/:adviserId', authenticate, async (req, res) => {
  try {
    const { adviserId } = req.params;
    
    // Check if requesting user is the adviser or an admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== adviserId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Auto-inactivate past consultations before returning data
    await autoInactivatePastConsultations();
    
    console.log('Fetching consultations for adviser:', adviserId);
    
    const consultations = await Consultation.find({ adviser: adviserId })
      .populate('adviser', 'firstName lastName email salutation')
      .populate({
        path: 'bookings.student',
        populate: [
          {
            path: 'user',
            select: 'firstName lastName email idNumber'
          },
          {
            path: 'class',
            select: '_id name'
          }
        ]
      })
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    console.log(`Found ${consultations.length} consultations for adviser ${adviserId}`);
    console.log('Sample consultation bookings:', consultations[0]?.bookings?.map(b => ({
      student: b.student?.user?.firstName + ' ' + b.student?.user?.lastName,
      studentClass: b.student?.class,
      status: b.status,
      concern: b.concern
    })));
    
    res.json(consultations);
  } catch (error) {
    console.error('Get adviser consultations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending schedule acceptances for adviser
router.get('/pending-acceptance', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const adviserId = (req.user && (req.user._id || req.user.id)) || null;
    if (!adviserId) {
      return res.status(401).json({ message: 'Unauthorized: adviser not identified' });
    }

    // Fallback to explicit query to avoid any static-method issues
    const consultations = await Consultation.find({
      adviser: adviserId,
      status: { $in: ['Pending_Adviser_Acceptance', 'Reschedule_Requested', 'Not_Available_Requested'] }
    })
      .populate('adviser', 'firstName lastName email')
      .populate({
        path: 'bookings.student',
        populate: [
          {
          path: 'user',
          select: 'firstName lastName email idNumber'
          },
          {
            path: 'class',
            select: 'className section yearLevel major'
          }
        ],
        select: 'user classDetails major gender contactNumber class'
      })
      .sort({ weekStart: 1, dayOfWeek: 1, startTime: 1 });

    res.json(Array.isArray(consultations) ? consultations : []);
  } catch (error) {
    console.error('Error fetching pending acceptances:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultation statistics for adviser dashboard
router.get('/adviser-stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Only allow advisers to access this endpoint
    if (userRole !== 'adviser') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Adviser role required.' 
      });
    }
    
    // Find consultations for this adviser
    const consultations = await Consultation.find({ adviser: userId });
    
    // Calculate statistics
    const totalConsultations = consultations.length;
    const activeConsultations = consultations.filter(c => c.status === 'Active').length;
    const pendingConsultations = consultations.filter(c => c.status === 'Pending_Adviser_Acceptance').length;
    
    // Calculate total bookings across all consultations
    let totalBookings = 0;
    let confirmedBookings = 0;
    let pendingBookings = 0;
    
    consultations.forEach(consultation => {
      if (consultation.bookings && Array.isArray(consultation.bookings)) {
        totalBookings += consultation.bookings.length;
        confirmedBookings += consultation.bookings.filter(b => b.status === 'Confirmed').length;
        pendingBookings += consultation.bookings.filter(b => b.status === 'Pending').length;
      }
    });
    
    res.json({
      success: true,
      stats: {
        totalConsultations,
        activeConsultations,
        pendingConsultations,
        totalBookings,
        confirmedBookings,
        pendingBookings
      }
    });
  } catch (error) {
    console.error('Error fetching adviser consultation stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Create new consultation (Admin only) - Weekly scheduling
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { adviserId, dayOfWeek, startTime, duration, maxStudents, notes, weekStart, weekEnd } = req.body;
    
    // Validate required fields
    if (!adviserId || dayOfWeek === undefined || !startTime || !duration || !maxStudents || !weekStart || !weekEnd) {
      return res.status(400).json({ message: 'Missing required fields. Include weekStart and weekEnd for weekly scheduling.' });
    }
    
    // Validate adviser exists
    const adviser = await User.findOne({ _id: adviserId, role: 'adviser', status: 'active' });
    if (!adviser) {
      return res.status(404).json({ message: 'Adviser not found or inactive' });
    }
    
    // Validate day of week (0-4 for Monday-Friday)
    if (dayOfWeek < 0 || dayOfWeek > 4) {
      return res.status(400).json({ message: 'Invalid day of week. Must be 0-4 (Monday-Friday)' });
    }
    
    // Get system options for consultation settings
    const SystemOption = require('../models/SystemOption');
    const systemOptions = await SystemOption.findOne();
    const consultationSettings = systemOptions?.consultation || { fixedDuration: 3, businessHours: { start: 7, end: 18 } };
    
    // Validate duration matches system setting
    if (duration !== consultationSettings.fixedDuration) {
      return res.status(400).json({ 
        message: `Consultation duration must be ${consultationSettings.fixedDuration} hours as configured in system options` 
      });
    }
    
    // Validate time slots using system settings
    if (startTime < consultationSettings.businessHours.start || startTime > (consultationSettings.businessHours.end - duration)) {
      return res.status(400).json({ 
        message: `Start time must be between ${consultationSettings.businessHours.start} AM and ${consultationSettings.businessHours.end - duration} PM` 
      });
    }
    
    const endTime = startTime + duration;
    if (endTime > consultationSettings.businessHours.end) {
      return res.status(400).json({ 
        message: `Consultation would extend beyond business hours (${consultationSettings.businessHours.end} PM)` 
      });
    }
    
    // Validate week dates
    const startDate = new Date(weekStart);
    const endDate = new Date(weekEnd);
    
    if (startDate >= endDate) {
      return res.status(400).json({ message: 'Week start date must be before week end date' });
    }
    
    // Enforce: only one consultation schedule per adviser per week
    const existingWeekly = await Consultation.findOne({
      adviser: adviserId,
      weekStart: { $lte: endDate },
      weekEnd: { $gte: startDate }
    });
    if (existingWeekly) {
      return res.status(400).json({
        message: 'This adviser already has a consultation schedule for the selected week',
        existing: {
          dayOfWeek: existingWeekly.dayOfWeek,
          startTime: existingWeekly.startTime,
          endTime: existingWeekly.endTime,
          weekStart: existingWeekly.weekStart,
          weekEnd: existingWeekly.weekEnd
        }
      });
    }

    // Check for conflicts with existing consultations for this adviser in the same week (time overlap safety)
    const conflictingConsultation = await Consultation.findOne({
      adviser: adviserId,
      dayOfWeek: dayOfWeek,
      weekStart: { $lte: endDate },
      weekEnd: { $gte: startDate },
      $or: [
        {
          // New consultation starts during existing consultation
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        {
          // New consultation ends during existing consultation
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        {
          // New consultation completely overlaps existing consultation
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    });
    
    if (conflictingConsultation) {
      return res.status(400).json({ 
        message: 'Consultation time conflicts with existing schedule for this week',
        conflictWith: {
          startTime: conflictingConsultation.startTime,
          endTime: conflictingConsultation.endTime,
          weekStart: conflictingConsultation.weekStart,
          weekEnd: conflictingConsultation.weekEnd
        }
      });
    }
    
    // Create new consultation with weekly scheduling
    const consultation = new Consultation({
      adviser: adviserId,
      weekStart: startDate,
      weekEnd: endDate,
      dayOfWeek,
      startTime,
      endTime,
      duration,
      maxStudents,
      notes: notes || '',
      status: 'Pending_Adviser_Acceptance',
      adviserAccepted: false
    });
    
    await consultation.save();
    
    // Populate adviser info for response
    await consultation.populate('adviser', 'firstName lastName email salutation');

    // Send email notification to adviser
    try {
      const emailHtml = emailService.generateConsultationCreatedEmail(consultation.adviser, consultation);
      await emailService.sendEmail(
        consultation.adviser.email,
        'PHINMA SSCMS - New Consultation Schedule Created',
        emailHtml
      );
      console.log('Consultation creation email sent to:', consultation.adviser.email);
    } catch (emailError) {
      console.error('Failed to send consultation creation email:', emailError);
      // Continue with the response even if email fails
    }

    // Notify adviser about pending weekly schedule
    try {
      const Notification = require('../models/Notification');
      const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
      const dayName = dayNames[dayOfWeek] || 'Day';
      const fmtTime = (h) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const display = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        return `${display}:00 ${ampm}`;
      };
      const timeRange = `${fmtTime(startTime)} - ${fmtTime(endTime)}`;
      const ws = new Date(weekStart);
      const we = new Date(weekEnd);
      const weekLabel = `${ws.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${we.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

      const notif = new Notification({
        recipient: adviser._id,
        type: 'info',
        title: 'New Consultation Schedule Pending Acceptance',
        message: `Week ${weekLabel} • ${dayName} • ${timeRange}`,
        details: `A new weekly consultation schedule has been created by admin. Please accept or decline.`,
        meta: {
          consultationId: consultation._id,
          weekStart: ws,
          weekEnd: we,
          dayOfWeek,
          startTime,
          endTime
        }
      });
      await notif.save();
      console.log(`Adviser notification created for ${adviser._id} consultation ${consultation._id}`);
    } catch (notificationError) {
      console.error('Error creating adviser schedule notification:', notificationError);
    }
    
    res.status(201).json({
      message: 'Consultation schedule created successfully',
      consultation
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update consultation (Admin only)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { adviserId, dayOfWeek, startTime, duration, maxStudents, notes, status } = req.body;
    
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
  // Defensive defaults to avoid runtime errors
  if (typeof consultation.maxStudents !== 'number' || consultation.maxStudents <= 0) {
    consultation.maxStudents = 5;
  }
  if (typeof consultation.bookedStudents !== 'number') {
    consultation.bookedStudents = 0;
  }
  if (!Array.isArray(consultation.bookings)) {
    consultation.bookings = [];
  }

    // If changing adviser, validate new adviser
    if (adviserId && adviserId !== consultation.adviser.toString()) {
      const adviser = await User.findOne({ _id: adviserId, role: 'adviser', status: 'active' });
      if (!adviser) {
        return res.status(404).json({ message: 'Adviser not found or inactive' });
      }
      consultation.adviser = adviserId;
    }
    
    // Update fields if provided
    if (dayOfWeek !== undefined) {
      if (dayOfWeek < 0 || dayOfWeek > 4) {
        return res.status(400).json({ message: 'Invalid day of week. Must be 0-4 (Monday-Friday)' });
      }
      consultation.dayOfWeek = dayOfWeek;
    }
    
    if (startTime !== undefined) {
      // Get system options for consultation settings
      const SystemOption = require('../models/SystemOption');
      const systemOptions = await SystemOption.findOne();
      const consultationSettings = systemOptions?.consultation || { businessHours: { start: 7, end: 18 } };
      
      if (startTime < consultationSettings.businessHours.start || startTime > (consultationSettings.businessHours.end - consultation.duration)) {
        return res.status(400).json({ 
          message: `Start time must be between ${consultationSettings.businessHours.start} AM and ${consultationSettings.businessHours.end - consultation.duration} PM` 
        });
      }
      consultation.startTime = startTime;
    }
    
    if (duration !== undefined) {
      // Get system options for consultation settings
      const SystemOption = require('../models/SystemOption');
      const systemOptions = await SystemOption.findOne();
      const consultationSettings = systemOptions?.consultation || { fixedDuration: 3, businessHours: { start: 7, end: 18 } };
      
      // Validate duration matches system setting
      if (duration !== consultationSettings.fixedDuration) {
        return res.status(400).json({ 
          message: `Consultation duration must be ${consultationSettings.fixedDuration} hours as configured in system options` 
        });
      }
      consultation.duration = duration;
    }
    
    // Recalculate end time
    consultation.endTime = consultation.startTime + consultation.duration;
    
    // Get system options for validation
    const SystemOption = require('../models/SystemOption');
    const systemOptions = await SystemOption.findOne();
    const consultationSettings = systemOptions?.consultation || { businessHours: { start: 7, end: 18 } };
    
    if (consultation.endTime > consultationSettings.businessHours.end) {
      return res.status(400).json({ 
        message: `Consultation would extend beyond business hours (${consultationSettings.businessHours.end} PM)` 
      });
    }
    
    if (maxStudents !== undefined) {
      consultation.maxStudents = maxStudents;
    }
    
    if (notes !== undefined) {
      consultation.notes = notes;
    }
    
    if (status) {
      consultation.status = status;
    }
    
    consultation.updatedAt = Date.now();
    await consultation.save();
    
    // Populate adviser info for response
    await consultation.populate('adviser', 'firstName lastName email salutation');
    
    res.json({
      message: 'Consultation schedule updated successfully',
      consultation
    });
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete consultation (Admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Check if there are any active bookings
    const activeBookings = consultation.bookings.filter(booking => 
      booking.status === 'Pending' || booking.status === 'Confirmed'
    );
    
    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete consultation with active bookings',
        activeBookings: activeBookings.length
      });
    }
    
    await Consultation.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Consultation schedule deleted successfully' });
  } catch (error) {
    console.error('Delete consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book a consultation (Student only)
router.post('/:id/book', authenticate, async (req, res) => {
  try {
    // Only students can book consultations
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can book consultations' });
    }
    
    const { concern, notes, meetingType } = req.body;
    
    // Validate concern field
    const validConcerns = [
      'Academic Performance and Grades',
      'Career Planning and Future Goals', 
      'Time Management and Workload',
      'Financial Concerns',
      'Mental Health and Personal Well-being',
      'Other'
    ];
    
    if (!concern || !validConcerns.includes(concern)) {
      return res.status(400).json({ 
        message: 'Please select a valid concern',
        validConcerns 
      });
    }
    
    // Validate meeting type
    const validMeetingTypes = ['in-person', 'virtual'];
    if (!meetingType || !validMeetingTypes.includes(meetingType)) {
      return res.status(400).json({ 
        message: 'Please select a valid meeting type',
        validMeetingTypes 
      });
    }
    
    const consultation = await Consultation.findById(req.params.id)
      .populate('adviser', 'firstName lastName email salutation');
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    if (consultation.status !== 'Active') {
      return res.status(400).json({ message: 'Consultation is not available for booking' });
    }
    
    // Find the student record with populated user and class data
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email idNumber')
      .populate('class', 'yearLevel section major')
      .populate('classDetails', 'yearLevel section major');
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Check if student already has ANY active booking with ANY adviser (NEW RESTRICTION)
    const existingActiveBookings = await Consultation.find({
      'bookings.student': student._id,
      'bookings.status': { $in: ['Booked', 'Pending'] }
    }).populate('adviser', 'firstName lastName');
    
  if (existingActiveBookings.length > 0) {
    const existingAdviser = existingActiveBookings[0].adviser || { firstName: 'an adviser', lastName: '' };
    const adviserName = [existingAdviser.firstName, existingAdviser.lastName].filter(Boolean).join(' ').trim() || 'your adviser';
    return res.status(400).json({ 
      message: `You already have an active consultation booking with ${adviserName}. Please complete or cancel your current booking before booking with another adviser.`,
      existingBooking: {
        adviser: adviserName,
        consultationId: existingActiveBookings[0]._id
      }
    });
  }
    
    // Check if student already has a booking for this specific consultation
    const existingBooking = consultation.bookings.find(booking => 
      booking.student.toString() === student._id.toString() &&
      (booking.status === 'Booked' || booking.status === 'Pending')
    );
    
    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this consultation' });
    }
    
    // Check for time conflicts with other student bookings (keep existing logic for safety)
    const conflictingConsultations = await Consultation.find({
      dayOfWeek: consultation.dayOfWeek,
      'bookings.student': student._id,
      'bookings.status': { $in: ['Booked', 'Pending'] },
      $or: [
        {
          // New consultation starts during existing consultation
          startTime: { $lte: consultation.startTime },
          endTime: { $gt: consultation.startTime }
        },
        {
          // New consultation ends during existing consultation
          startTime: { $lt: consultation.endTime },
          endTime: { $gte: consultation.endTime }
        },
        {
          // New consultation completely overlaps existing consultation
          startTime: { $gte: consultation.startTime },
          endTime: { $lte: consultation.endTime }
        }
      ]
    }).populate('adviser', 'firstName lastName');
    
  if (conflictingConsultations.length > 0) {
    const conflictAdviser = conflictingConsultations[0].adviser || { firstName: 'an adviser', lastName: '' };
    const adviserName = [conflictAdviser.firstName, conflictAdviser.lastName].filter(Boolean).join(' ').trim() || 'your adviser';
    return res.status(400).json({ 
      message: `You have a conflicting consultation with ${adviserName} at the same time slot`,
      conflictWith: {
        adviser: adviserName,
        time: `${conflictingConsultations[0].startTime}:00 - ${conflictingConsultations[0].endTime}:00`
      }
    });
  }
    
    // Check if consultation is full
    if (consultation.bookedStudents >= consultation.maxStudents) {
      return res.status(400).json({ message: 'Consultation is fully booked' });
    }
    
    // Add booking
    consultation.bookings.push({
      student: student._id,
      status: 'Booked', // New default status
      concern: concern,
      notes: notes || '',
      consultationType: meetingType === 'virtual' ? 'chat' : 'in-person'
    });
    
    await consultation.save();
    
    // Get the newly created booking
    const newBooking = consultation.bookings[consultation.bookings.length - 1];
    
    // Send notification to student (system notification)
    try {
      const Notification = require('../models/Notification');
      const studentNotif = new Notification({
        recipient: req.user._id,
        type: 'success',
        title: 'Consultation Booked Successfully',
        message: `Your consultation with ${consultation.adviser.salutation} ${consultation.adviser.firstName} ${consultation.adviser.lastName} has been booked.`,
        details: `Concern: ${concern}. Meeting Type: ${meetingType === 'virtual' ? 'Virtual Meeting' : 'In-Person Meeting'}. Please wait for your adviser to accept your booking.`,
        meta: {
          consultationId: consultation._id,
          bookingId: newBooking._id
        }
      });
      await studentNotif.save();
      console.log('Student booking notification sent');
    } catch (notifError) {
      console.error('Failed to send student booking notification:', notifError);
    }
    
    // Send notification to adviser (system notification)
    try {
      const Notification = require('../models/Notification');
      const adviserNotif = new Notification({
        recipient: consultation.adviser._id,
        type: 'info',
        title: 'New Consultation Booking',
        message: `${student.user.firstName} ${student.user.lastName} has booked your consultation.`,
        details: `Student: ${student.user.firstName} ${student.user.lastName} (${student.user.idNumber})\nYear Level: ${student.class?.yearLevel || student.classDetails?.yearLevel || 'N/A'}\nSection & Major: ${student.class?.section || student.classDetails?.section || 'N/A'} - ${student.class?.major || student.classDetails?.major || 'N/A'}\nConcern: ${concern}\nMeeting Type: ${meetingType === 'virtual' ? 'Virtual Meeting' : 'In-Person Meeting'}`,
        meta: {
          consultationId: consultation._id,
          bookingId: newBooking._id
        }
      });
      await adviserNotif.save();
      console.log('Adviser booking notification sent');
    } catch (notifError) {
      console.error('Failed to send adviser booking notification:', notifError);
    }
    
    res.json({ 
      message: 'Consultation booked successfully! You can only have one active consultation booking at a time.',
      booking: newBooking
    });
  } catch (error) {
    console.error('Book consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a booking (Student only)
router.delete('/:id/bookings/:bookingId', authenticate, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    const booking = consultation.bookings.id(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Find the student record
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Check if this booking belongs to the requesting student or if user is admin/adviser
    if (req.user.role === 'student' && booking.student.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    booking.status = 'Cancelled';
    await consultation.save();
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (Adviser only)
router.put('/bookings/:bookingId/status', authenticate, async (req, res) => {
  try {
    const { status, completionNotes } = req.body;
    const { bookingId } = req.params;
    
    // Validate status
    const validStatuses = ['Booked', 'Pending', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status',
        validStatuses 
      });
    }
    
    // Find consultation with this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    }).populate('adviser', 'firstName lastName email')
    .populate({
      path: 'bookings.student',
      populate: {
        path: 'user',
        select: 'firstName lastName email idNumber'
      }
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the adviser for this consultation or admin
    if (req.user.role !== 'admin' && consultation.adviser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find and update the specific booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    booking.status = status;
    
    // Add completion notes if status is Completed
    if (status === 'Completed' && completionNotes) {
      booking.completionNotes = completionNotes;
      booking.completedAt = new Date();
    }
    
    // If accepting a booking (Booked -> Pending), send notifications
    if (status === 'Pending') {
      await consultation.save();
      
      // Reload to get updated booking with populated student data
      await consultation.populate({
        path: 'bookings.student',
        populate: [
          { path: 'user', select: 'firstName lastName email idNumber' },
          { path: 'class', select: 'yearLevel section major' },
          { path: 'classDetails', select: 'yearLevel section major' }
        ]
      });
      const updatedBooking = consultation.bookings.id(bookingId);
      
      // Send system notification to student
      try {
        const Notification = require('../models/Notification');
        const emailService = require('../services/emailService');
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[consultation.dayOfWeek];
        
        // System notification
        const notification = new Notification({
          recipient: updatedBooking.student.user._id,
          title: 'Consultation Accepted - Ready for Meeting',
          message: `Your consultation with ${consultation.adviser.salutation} ${consultation.adviser.firstName} ${consultation.adviser.lastName} has been accepted and is now ready.`,
          details: `Day: ${dayName}, Time: ${consultation.startTime} - ${consultation.endTime}. Meeting Type: ${updatedBooking.consultationType === 'chat' ? 'Virtual Meeting' : 'In-Person Meeting'}.`,
          type: 'success',
          meta: {
            consultationId: consultation._id,
            bookingId: updatedBooking._id
          }
        });
        
        await notification.save();
        console.log(`Acceptance notification sent to student ${updatedBooking.student.user._id}`);
        
        // Send email notification to student
        try {
          const emailHtml = emailService.generateStudentConsultationAcceptedEmail(
            updatedBooking.student,
            consultation,
            updatedBooking
          );
          
          await emailService.sendEmail(
            updatedBooking.student.user.email,
            'PHINMA SSCMS - Consultation Confirmed and Ready',
            emailHtml
          );
          console.log('Acceptance email sent to student:', updatedBooking.student.user.email);
        } catch (emailError) {
          console.error('Failed to send acceptance email to student:', emailError);
        }
        
      } catch (notificationError) {
        console.error('Error creating acceptance notification:', notificationError);
      }
    }
    
    await consultation.save();
    
    res.json({ 
      message: 'Booking status updated successfully',
      booking: {
        _id: booking._id,
        status: booking.status,
        concern: booking.concern,
        notes: booking.notes,
        allocatedStartTime: booking.allocatedStartTime,
        allocatedEndTime: booking.allocatedEndTime,
        allocatedDuration: booking.allocatedDuration
      }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking meeting link (Adviser only)
router.put('/bookings/:bookingId/meeting-link', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { meetingLink } = req.body;
    
    // Validate meeting link
    if (!meetingLink || !meetingLink.startsWith('https://meet.google.com/')) {
      return res.status(400).json({ message: 'Invalid meeting link' });
    }
    
    // Find the consultation with this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the adviser for this consultation or admin
    if (req.user.role !== 'admin' && consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find the booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Update the booking meeting link
    booking.meetingLink = meetingLink;
    
    await consultation.save();
    
    res.json({ message: 'Meeting link updated successfully', booking });
  } catch (error) {
    console.error('Update meeting link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking (Adviser)
router.delete('/bookings/:bookingId/cancel', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Find the consultation with this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    }).populate({
      path: 'bookings.student',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the adviser for this consultation or admin
    if (req.user.role !== 'admin' && consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find the booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Update the booking status
    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;
    
    await consultation.save();
    
    // Send notification to student
    try {
      const Notification = require('../models/Notification');
      
      const notification = new Notification({
        recipient: booking.student.user._id,
        title: 'Consultation Cancelled',
        message: `Your consultation with ${req.user.firstName} ${req.user.lastName} has been cancelled by the adviser.`,
        type: 'warning',
        link: '/student/consultations',
        sender: req.user._id,
        createdAt: new Date()
      });
      
      await notification.save();
    } catch (notificationError) {
      console.error('Error creating cancellation notification:', notificationError);
    }
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add feedback to booking (Adviser only)
router.put('/bookings/:bookingId/feedback', authenticate, async (req, res) => {
  try {
    const { feedback } = req.body;
    const { bookingId } = req.params;
    
    if (!feedback || feedback.trim().length === 0) {
      return res.status(400).json({ message: 'Feedback is required' });
    }
    
    // Find the consultation containing this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the adviser for this consultation
    if (req.user.role !== 'admin' && consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find the booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only allow feedback for completed consultations
    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only add feedback to completed consultations' });
    }
    
    // Update feedback
    booking.feedback = feedback.trim();
    booking.feedbackAt = new Date();
    
    await consultation.save();
    
    console.log(`Feedback added to booking ${bookingId} by adviser ${req.user._id}`);
    
    res.json({ 
      message: 'Feedback added successfully', 
      booking: {
        _id: booking._id,
        feedback: booking.feedback,
        feedbackAt: booking.feedbackAt,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Add booking feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Escalate consultation to admin (Adviser only)
router.post('/bookings/:bookingId/escalate', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Escalation reason is required' });
    }
    
    // Find the consultation containing this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    }).populate({
      path: 'bookings.student',
      populate: {
        path: 'user',
        select: 'firstName lastName email idNumber'
      }
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the adviser for this consultation
    if (req.user.role !== 'admin' && consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find the booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only allow escalation for confirmed consultations
    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Can only escalate confirmed consultations' });
    }
    
    // Create admin report for escalation
    const AdminReport = require('../models/AdminReport');
    const Student = require('../models/Student');
    
    const student = await Student.findById(booking.student._id || booking.student).populate('user');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get semester from student's current class SSP subject
    let semester = '1st'; // default
    if (student.class) {
      // Populate the class with SSP subject to get semester information
      const Class = require('../models/Class');
      const populatedClass = await Class.findById(student.class._id)
        .populate('sspSubject', 'semester')
        .populate('firstSemester.sspSubject', 'semester')
        .populate('secondSemester.sspSubject', 'semester');
      
      if (populatedClass) {
        // Check if the class has the new semester structure
        if (populatedClass.firstSemester?.sspSubject || populatedClass.secondSemester?.sspSubject) {
          // Use the SSP subject semester from the current semester structure
          if (populatedClass.firstSemester?.sspSubject?.semester) {
            semester = populatedClass.firstSemester.sspSubject.semester.includes('1st') ? '1st' : '2nd';
          } else if (populatedClass.secondSemester?.sspSubject?.semester) {
            semester = populatedClass.secondSemester.sspSubject.semester.includes('2nd') ? '2nd' : '1st';
          }
        } else if (populatedClass.sspSubject?.semester) {
          // For legacy classes, use the main SSP subject semester
          semester = populatedClass.sspSubject.semester.includes('2nd') ? '2nd' : '1st';
        }
      }
    }
    
    await AdminReport.createConsultationEscalation(student, req.user, {
      consultationId: consultation._id,
      bookingId: bookingId,
      reason: reason.trim(),
      feedback: booking.feedback || '',
      concern: booking.concern
    }, semester);
    
    // Update booking status to 'Escalated'
    booking.status = 'Escalated';
    await consultation.save();
    
    console.log(`Consultation escalated to admin by adviser ${req.user._id} for booking ${bookingId}`);
    
    res.json({ 
      message: 'Consultation escalated to admin successfully',
      escalation: {
        bookingId: bookingId,
        reason: reason.trim(),
        escalatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Escalate consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resolve consultation (Adviser only)
router.post('/bookings/:bookingId/resolve', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { resolution } = req.body;
    
    if (!resolution || resolution.trim().length === 0) {
      return res.status(400).json({ message: 'Resolution description is required' });
    }
    
    // Find the consultation containing this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    }).populate({
      path: 'bookings.student',
      populate: {
        path: 'user',
        select: 'firstName lastName email idNumber'
      }
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the adviser for this consultation
    if (req.user.role !== 'admin' && consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find the booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only allow resolution for confirmed consultations
    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Can only resolve confirmed consultations' });
    }
    
    // Update booking with resolution
    booking.status = 'Resolved';
    booking.resolution = resolution.trim();
    booking.resolvedAt = new Date();
    
    await consultation.save();
    
    // Create notification for student
    try {
      const Notification = require('../models/Notification');
      
      const notification = new Notification({
        recipient: booking.student.user._id,
        title: 'Consultation Resolved',
        message: `Your consultation regarding "${booking.concern}" has been resolved by your adviser.`,
        type: 'success',
        link: '/student/consultations',
        sender: req.user._id,
        createdAt: new Date()
      });
      
      await notification.save();
      console.log(`Resolution notification sent to student ${booking.student.user._id}`);
    } catch (notificationError) {
      console.error('Error creating resolution notification:', notificationError);
    }
    
    console.log(`Consultation resolved by adviser ${req.user._id} for booking ${bookingId}`);
    
    res.json({ 
      message: 'Consultation resolved successfully',
      resolution: {
        bookingId: bookingId,
        resolution: resolution.trim(),
        resolvedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Resolve consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept weekly schedule (Adviser only)
router.post('/:id/accept', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Check if this adviser owns this consultation
    if (consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only accept your own consultations' });
    }
    
    // Check if already accepted
    if (consultation.adviserAccepted) {
      return res.status(400).json({ message: 'Schedule already accepted' });
    }
    
    await consultation.acceptSchedule();
    
    // Send email notification to admin about acceptance
    try {
      // Ensure consultation is populated with adviser info
      await consultation.populate('adviser', 'firstName lastName email salutation');
      
      // Get admin users to notify
      const admins = await User.find({ role: 'admin', status: 'active' });
      
      for (const admin of admins) {
        const emailHtml = emailService.generateConsultationAcceptedEmail(admin, consultation, consultation.adviser);
        await emailService.sendEmail(
          admin.email,
          'PHINMA SSCMS - Consultation Schedule Accepted',
          emailHtml
        );
        console.log('Consultation acceptance email sent to admin:', admin.email);
      }
    } catch (emailError) {
      console.error('Failed to send consultation acceptance email:', emailError);
      // Continue with the response even if email fails
    }
    
    res.json({
      message: 'Weekly schedule accepted successfully',
      consultation
    });
  } catch (error) {
    console.error('Error accepting schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decline weekly schedule (Adviser only)
router.post('/:id/decline', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { reason, action } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Check if this adviser owns this consultation
    if (consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only decline your own consultations' });
    }
    
    // Check if already accepted
    if (consultation.adviserAccepted) {
      return res.status(400).json({ message: 'Schedule already accepted' });
    }
    
    await consultation.declineSchedule(reason);
    
    // Update consultation status based on action
    if (action === 'not_available') {
      consultation.status = 'Not_Available_Requested';
      await consultation.save();
    }
    
    // Send notification to admin about decline
    const Notification = require('../models/Notification');
    const admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      const weekStart = new Date(consultation.weekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 4);
      
      const weekLabel = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][consultation.dayOfWeek];
      const timeRange = `${consultation.startTime}:00 - ${consultation.endTime || consultation.startTime + 3}:00`;
      
      const notif = new Notification({
        recipient: admin._id,
        type: 'warning',
        title: 'Consultation Schedule Declined',
        message: `${req.user.firstName} ${req.user.lastName} declined their consultation schedule`,
        details: `Week ${weekLabel} • ${dayName} • ${timeRange} • Reason: ${reason || 'No reason provided'}`,
        meta: {
          consultationId: consultation._id,
          adviserId: req.user._id,
          reason,
          action
        }
      });
      await notif.save();
    }
    
    // Send email notification to admin about decline
    try {
      // Ensure consultation is populated with adviser info
      await consultation.populate('adviser', 'firstName lastName email salutation');
      
      const admins = await User.find({ role: 'admin', status: 'active' });
      
      for (const admin of admins) {
        const emailHtml = emailService.generateConsultationDeclinedEmail(admin, consultation, consultation.adviser, reason);
        await emailService.sendEmail(
          admin.email,
          'PHINMA SSCMS - Consultation Schedule Declined',
          emailHtml
        );
        console.log('Consultation decline email sent to admin:', admin.email);
      }
    } catch (emailError) {
      console.error('Failed to send consultation decline email:', emailError);
      // Continue with the response even if email fails
    }
    
    res.json({
      message: 'Weekly schedule declined successfully',
      consultation
    });
  } catch (error) {
    console.error('Error declining schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit reschedule request (Adviser only)
router.post('/:id/reschedule-request', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { reason, newDayOfWeek, newStartTime, newEndTime } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Check if this adviser owns this consultation
    if (consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only reschedule your own consultations' });
    }
    
    // Check if already accepted
    if (consultation.adviserAccepted) {
      return res.status(400).json({ message: 'Schedule already accepted' });
    }
    
    // Store original values for admin review
    const originalValues = {
      dayOfWeek: consultation.dayOfWeek,
      startTime: consultation.startTime,
      endTime: consultation.endTime || consultation.startTime + 3
    };
    
    // Update consultation with new schedule immediately
    consultation.dayOfWeek = newDayOfWeek;
    consultation.startTime = newStartTime;
    consultation.endTime = newEndTime;
    consultation.status = 'Reschedule_Requested';
    consultation.rescheduleRequest = {
      reason,
      originalValues,
      newDayOfWeek,
      newStartTime,
      newEndTime,
      requestedAt: new Date(),
      requestedBy: req.user._id
    };
    
    // Update consultation date
    const weekStart = new Date(consultation.weekStart);
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + newDayOfWeek);
    consultation.consultationDate = newDate;
    
    await consultation.save();
    
    // Send notification to admin about reschedule request
    const Notification = require('../models/Notification');
    const admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      const weekStart = new Date(consultation.weekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 4);
      
      const weekLabel = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      const currentDayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][originalValues.dayOfWeek];
      const newDayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][newDayOfWeek];
      const currentTimeRange = `${originalValues.startTime}:00 - ${originalValues.endTime}:00`;
      const newTimeRange = `${newStartTime}:00 - ${newEndTime}:00`;
      
      const notif = new Notification({
        recipient: admin._id,
        type: 'info',
        title: 'Consultation Reschedule Request',
        message: `${req.user.firstName || 'Adviser'} ${req.user.lastName || ''} requested to reschedule their consultation`,
        details: `Current: Week ${weekLabel} • ${currentDayName} • ${currentTimeRange}\nRequested: ${newDayName} • ${newTimeRange}\nReason: ${reason}`,
        meta: {
          consultationId: consultation._id,
          adviserId: req.user._id,
          reason,
          newDayOfWeek,
          newStartTime,
          newEndTime
        }
      });
      await notif.save();
    }
    
    res.json({
      message: 'Reschedule request submitted successfully',
      consultation
    });
  } catch (error) {
    console.error('Error submitting reschedule request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve reschedule request (Admin only)
router.post('/:id/approve-reschedule', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    if (consultation.status !== 'Reschedule_Requested') {
      return res.status(400).json({ message: 'No reschedule request found' });
    }
    
    // Update status to Active and set adviserAccepted to prevent pre-save hook override
    consultation.status = 'Active';
    consultation.adviserAccepted = true;
    consultation.rescheduleRequest.approvedAt = new Date();
    consultation.rescheduleRequest.approvedBy = req.user._id;
    
    await consultation.save();
    
    // Send notification to adviser about approval
    const Notification = require('../models/Notification');
    const notif = new Notification({
      recipient: consultation.adviser,
      type: 'success',
      title: 'Reschedule Request Approved',
      message: 'Your consultation reschedule request has been approved',
      details: `Your consultation has been rescheduled and is now active`,
      meta: {
        consultationId: consultation._id
      }
    });
    await notif.save();
    
    // Send email notification to adviser about reschedule approval
    try {
      // Ensure consultation is populated with adviser info
      await consultation.populate('adviser', 'firstName lastName email salutation');
      
      if (consultation.adviser && consultation.adviser.email) {
        const emailHtml = emailService.generateRescheduleApprovedEmail(consultation.adviser, consultation);
        await emailService.sendEmail(
          consultation.adviser.email,
          'PHINMA SSCMS - Reschedule Request Approved',
          emailHtml
        );
        console.log('Reschedule approval email sent to adviser:', consultation.adviser.email);
      } else {
        console.error('Adviser email not found for consultation:', consultation._id);
      }
    } catch (emailError) {
      console.error('Failed to send reschedule approval email:', emailError);
      // Continue with the response even if email fails
    }
    
    res.json({
      message: 'Reschedule request approved successfully',
      consultation
    });
  } catch (error) {
    console.error('Error approving reschedule request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject reschedule request (Admin only)
router.post('/:id/reject-reschedule', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    if (consultation.status !== 'Reschedule_Requested') {
      return res.status(400).json({ message: 'No reschedule request found' });
    }
    
    // Revert to original values
    if (consultation.rescheduleRequest && consultation.rescheduleRequest.originalValues) {
      consultation.dayOfWeek = consultation.rescheduleRequest.originalValues.dayOfWeek;
      consultation.startTime = consultation.rescheduleRequest.originalValues.startTime;
      consultation.endTime = consultation.rescheduleRequest.originalValues.endTime;
      
      // Update consultation date
      const weekStart = new Date(consultation.weekStart);
      const newDate = new Date(weekStart);
      newDate.setDate(weekStart.getDate() + consultation.dayOfWeek);
      consultation.consultationDate = newDate;
    }
    
    consultation.status = 'Active';
    consultation.adviserAccepted = true; // Set to true to prevent pre-save hook from overriding to Pending_Adviser_Acceptance
    consultation.rescheduleRequest.rejectedAt = new Date();
    consultation.rescheduleRequest.rejectedBy = req.user._id;
    consultation.rescheduleRequest.rejectionReason = reason;
    
    await consultation.save();
    
    // Send notification to adviser about rejection
    const Notification = require('../models/Notification');
    const notif = new Notification({
      recipient: consultation.adviser,
      type: 'warning',
      title: 'Reschedule Request Rejected',
      message: `Your consultation reschedule request has been rejected. Reason: ${reason || 'No reason provided'}`,
      details: `Your consultation schedule has been reverted to the original time slot.`,
      meta: {
        consultationId: consultation._id
      }
    });
    await notif.save();
    
    // Send email notification to adviser about reschedule rejection
    try {
      // Ensure consultation is populated with adviser info
      await consultation.populate('adviser', 'firstName lastName email salutation');
      
      if (consultation.adviser && consultation.adviser.email) {
        const emailHtml = emailService.generateRescheduleRejectedEmail(consultation.adviser, consultation, reason);
        await emailService.sendEmail(
          consultation.adviser.email,
          'PHINMA SSCMS - Reschedule Request Rejected',
          emailHtml
        );
        console.log('Reschedule rejection email sent to adviser:', consultation.adviser.email);
      } else {
        console.error('Adviser email not found for consultation:', consultation._id);
      }
    } catch (emailError) {
      console.error('Failed to send reschedule rejection email:', emailError);
      // Continue with the response even if email fails
    }
    
    res.json({
      message: 'Reschedule request rejected successfully',
      consultation
    });
  } catch (error) {
    console.error('Error rejecting reschedule request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultations by week (Admin only)
router.get('/week/:weekStart/:weekEnd', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.params;
    const startDate = new Date(weekStart);
    const endDate = new Date(weekEnd);
    
    const consultations = await Consultation.findByWeek(startDate, endDate);
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching weekly consultations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultations by week (Adviser view): show Active and Pending_Adviser_Acceptance for ALL advisers
router.get('/week-accessible/:weekStart/:weekEnd', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.params;
    const startDate = new Date(weekStart);
    const endDate = new Date(weekEnd);

    // Find consultations overlapping the week window and with relevant statuses
    const consultations = await Consultation.find({
      weekStart: { $lte: endDate },
      weekEnd: { $gte: startDate },
      status: { $in: ['Active', 'Pending_Adviser_Acceptance'] }
    })
      .populate('adviser', 'firstName lastName email salutation')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json(consultations);
  } catch (error) {
    console.error('Error fetching adviser-accessible weekly consultations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultation by ID (moved to the very end to prevent conflicts with other routes)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('adviser', 'firstName lastName email salutation')
      .populate({
        path: 'bookings.student',
        populate: [
          {
            path: 'user',
            select: 'firstName lastName email idNumber'
          },
          {
            path: 'class',
            select: 'className section yearLevel major'
          }
        ],
        select: 'user classDetails major gender contactNumber class'
      });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Check if user has permission to view this consultation
    if (req.user.role === 'adviser' && consultation.adviser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(consultation);
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve removal request
router.post('/:id/approve-removal', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    if (consultation.status !== 'Not_Available_Requested') {
      return res.status(400).json({ message: 'No removal request found' });
    }

    // Delete the consultation entirely
    await Consultation.findByIdAndDelete(req.params.id);

    // Send notification to adviser about approval
    const Notification = require('../models/Notification');
    const notif = new Notification({
      recipient: consultation.adviser,
      type: 'success',
      title: 'Schedule Removal Approved',
      message: 'Your consultation schedule removal request has been approved',
      details: `Your consultation schedule has been removed from the system`,
      meta: { consultationId: consultation._id }
    });
    await notif.save();

    // Send email notification to adviser about removal approval
    try {
      // Ensure consultation is populated with adviser info
      await consultation.populate('adviser', 'firstName lastName email salutation');
      
      if (consultation.adviser && consultation.adviser.email) {
        const emailHtml = emailService.generateRemovalApprovedEmail(consultation.adviser, consultation);
        await emailService.sendEmail(
          consultation.adviser.email,
          'PHINMA SSCMS - Schedule Removal Approved',
          emailHtml
        );
        console.log('Removal approval email sent to adviser:', consultation.adviser.email);
      } else {
        console.error('Adviser email not found for consultation:', consultation._id);
      }
    } catch (emailError) {
      console.error('Failed to send removal approval email:', emailError);
      // Continue with the response even if email fails
    }

    res.json({ message: 'Removal request approved successfully' });
  } catch (error) {
    console.error('Error approving removal request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject removal request
router.post('/:id/reject-removal', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    if (consultation.status !== 'Not_Available_Requested') {
      return res.status(400).json({ message: 'No removal request found' });
    }

    // Revert to Active status
    consultation.status = 'Active';
    consultation.adviserAccepted = true; // Set to true to prevent pre-save hook from overriding
    await consultation.save();

    // Send notification to adviser about rejection
    const Notification = require('../models/Notification');
    const notif = new Notification({
      recipient: consultation.adviser,
      type: 'warning',
      title: 'Schedule Removal Rejected',
      message: `Your consultation schedule removal request has been rejected. Reason: ${reason || 'No reason provided'}`,
      details: `Your consultation schedule has been restored and is now active`,
      meta: { consultationId: consultation._id }
    });
    await notif.save();

    // Send email notification to adviser about removal rejection
    try {
      // Ensure consultation is populated with adviser info
      await consultation.populate('adviser', 'firstName lastName email salutation');
      
      if (consultation.adviser && consultation.adviser.email) {
        const emailHtml = emailService.generateRemovalRejectedEmail(consultation.adviser, consultation, reason);
        await emailService.sendEmail(
          consultation.adviser.email,
          'PHINMA SSCMS - Schedule Removal Rejected',
          emailHtml
        );
        console.log('Removal rejection email sent to adviser:', consultation.adviser.email);
      } else {
        console.error('Adviser email not found for consultation:', consultation._id);
      }
    } catch (emailError) {
      console.error('Failed to send removal rejection email:', emailError);
      // Continue with the response even if email fails
    }

    res.json({ message: 'Removal request rejected successfully', consultation });
  } catch (error) {
    console.error('Error rejecting removal request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auto-inactivate consultations after their day ends (daily check based on Manila time)
const autoInactivatePastConsultations = async () => {
  try {
    // Get current Manila time (UTC+8)
    const manilaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"})
    const today = new Date(manilaTime)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Find all active consultations
    const activeConsultations = await Consultation.find({
      status: { $in: ['Active', 'Pending_Adviser_Acceptance'] }
    })
    
    let inactivatedCount = 0
    
    // Check each consultation's actual date
    for (const consultation of activeConsultations) {
      if (!consultation.weekStart || consultation.dayOfWeek === undefined) continue
      
      // Calculate the actual consultation date
      const consultationDate = new Date(consultation.weekStart)
      consultationDate.setDate(consultationDate.getDate() + consultation.dayOfWeek)
      
      // If consultation date is before today (Manila time), make it inactive
      if (consultationDate < todayStart) {
        await Consultation.findByIdAndUpdate(consultation._id, { status: 'Inactive' })
        inactivatedCount++
      }
    }
    
    if (inactivatedCount > 0) {
      console.log(`Auto-inactivated ${inactivatedCount} past consultations (daily check)`)
    }
  } catch (error) {
    console.error('Error auto-inactivating past consultations:', error)
  }
}

// Copy schedule from one week to another
router.post('/copy-schedule', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { fromWeek, toWeek } = req.body;
    
    if (!fromWeek || !toWeek) {
      return res.status(400).json({ message: 'Both fromWeek and toWeek are required' });
    }
    
    // Get the source week start and end dates
    const fromWeekStart = new Date(fromWeek);
    const fromWeekEnd = new Date(fromWeekStart);
    fromWeekEnd.setDate(fromWeekEnd.getDate() + 4); // Friday
    
    // Get the target week start and end dates
    const toWeekStart = new Date(toWeek);
    const toWeekEnd = new Date(toWeekStart);
    toWeekEnd.setDate(toWeekEnd.getDate() + 4); // Friday
    
    // Check if target week already has consultations
    const existingConsultations = await Consultation.find({
      weekStart: { $gte: toWeekStart, $lte: toWeekEnd },
      weekEnd: { $gte: toWeekStart, $lte: toWeekEnd }
    });
    
    if (existingConsultations.length > 0) {
      return res.status(400).json({ message: 'Target week already has consultations' });
    }
    
    // Find consultations from the source week (include both Active and Inactive)
    const sourceConsultations = await Consultation.find({
      weekStart: { $gte: fromWeekStart, $lte: fromWeekEnd },
      weekEnd: { $gte: fromWeekStart, $lte: fromWeekEnd },
      status: { $in: ['Active', 'Inactive'] }  // Include both Active and Inactive consultations
    }).populate('adviser', 'firstName lastName email');
    
    if (sourceConsultations.length === 0) {
      return res.status(404).json({ message: 'No consultations found in the source week' });
    }
    
    // Create new consultations for the target week
    const newConsultations = sourceConsultations.map(consultation => {
      const newConsultation = consultation.toObject();
      delete newConsultation._id;
      delete newConsultation.__v;
      delete newConsultation.createdAt;
      delete newConsultation.updatedAt;
      delete newConsultation.bookings;
      delete newConsultation.bookedStudents;
      delete newConsultation.rescheduleRequest;
      
      // Set new week dates
      newConsultation.weekStart = toWeekStart;
      newConsultation.weekEnd = toWeekEnd;
      
      // Set status to pending adviser acceptance
      newConsultation.status = 'Pending_Adviser_Acceptance';
      newConsultation.adviserAccepted = false;
      
      // Reset booking-related fields
      newConsultation.bookedStudents = 0;
      
      return newConsultation;
    });
    
    // Insert the new consultations
    const createdConsultations = await Consultation.insertMany(newConsultations);
    
    // Send notifications to advisers about new consultations (using existing notification system)
    const Notification = require('../models/Notification');
    const notifications = createdConsultations.map(consultation => {
      return new Notification({
        recipient: consultation.adviser,
        type: 'info',
        title: 'New Consultation Schedule',
        message: `A new consultation schedule has been created for you for the week of ${toWeekStart.toLocaleDateString()}`,
        details: `Please review and accept your consultation schedule for ${toWeekStart.toLocaleDateString()} - ${toWeekEnd.toLocaleDateString()}`,
        meta: { consultationId: consultation._id }
      });
    });
    
    await Notification.insertMany(notifications);
    
    // Send email notifications to advisers about copied consultations
    try {
      for (const consultation of createdConsultations) {
        // Ensure consultation is populated with adviser info
        await consultation.populate('adviser', 'firstName lastName email salutation');
        
        if (consultation.adviser && consultation.adviser.email) {
          const emailHtml = emailService.generateConsultationCreatedEmail(consultation.adviser, consultation);
          await emailService.sendEmail(
            consultation.adviser.email,
            'PHINMA SSCMS - New Consultation Schedule Created',
            emailHtml
          );
          console.log('Copy schedule email sent to adviser:', consultation.adviser.email);
        } else {
          console.error('Adviser email not found for copied consultation:', consultation._id);
        }
      }
    } catch (emailError) {
      console.error('Failed to send copy schedule emails:', emailError);
      // Continue with the response even if email fails
    }
    
    res.json({ 
      message: 'Schedule copied successfully', 
      copiedCount: createdConsultations.length,
      consultations: createdConsultations 
    });
  } catch (error) {
    console.error('Error copying schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's consultation history (completed consultations)
router.get('/my-history', authenticate, async (req, res) => {
  try {
    console.log('My-history endpoint called by user:', req.user._id, 'role:', req.user.role);
    
    // Only students can access this endpoint
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }
    
    // Find the student record
    const student = await Student.findOne({ user: req.user._id });
    console.log('Found student:', student ? student._id : 'not found');
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    console.log('Searching for consultations with student ID:', student._id);
    
    // Find all consultations that have bookings from this student
    const consultations = await Consultation.find({
      'bookings.student': student._id
    })
    .populate('adviser', 'firstName lastName email salutation')
    .sort({ weekStart: -1, dayOfWeek: 1, startTime: 1 });
    
    console.log('Found consultations with any bookings:', consultations.length);
    
    // Extract and flatten the completed bookings for this student
    const completedConsultations = [];
    
    consultations.forEach(consultation => {
      if (consultation.bookings && consultation.bookings.length > 0) {
        consultation.bookings.forEach(booking => {
          if (booking.student && booking.student.toString() === student._id.toString() && booking.status === 'Completed') {
            completedConsultations.push({
              _id: booking._id,
              adviser: consultation.adviser,
              dayOfWeek: consultation.dayOfWeek,
              startTime: consultation.startTime,
              endTime: consultation.endTime,
              duration: consultation.duration,
              weekStart: consultation.weekStart,
              concern: booking.concern,
              notes: booking.notes,
              consultationType: booking.consultationType,
              completionNotes: booking.completionNotes,
              completedAt: booking.completedAt,
              bookedAt: booking.bookedAt
            });
          }
        });
      }
    });
    
    console.log('Total completed consultations found:', completedConsultations.length);
    
    res.json(completedConsultations);
  } catch (error) {
    console.error('Get student consultation history error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start meeting for virtual consultation (Adviser only)
router.post('/bookings/:bookingId/start-meeting', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Find the consultation with this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the adviser for this consultation
    if (req.user.role !== 'admin' && consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Only the adviser can start meetings.' });
    }
    
    // Find the booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if booking is virtual and in pending status
    if (booking.consultationType !== 'chat') {
      return res.status(400).json({ message: 'This is not a virtual consultation' });
    }
    
    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: 'Booking must be in Pending status to start meeting' });
    }
    
    // Check if meeting is already started
    if (booking.meetingStarted) {
      return res.status(400).json({ message: 'Meeting is already started' });
    }
    
    // Start the meeting
    booking.meetingStarted = true;
    booking.meetingStartedAt = new Date();
    
    await consultation.save();
    
    console.log(`Meeting started for booking ${bookingId} by adviser ${req.user._id}`);
    
    res.json({ 
      message: 'Meeting started successfully', 
      booking: {
        _id: booking._id,
        meetingStarted: booking.meetingStarted,
        meetingStartedAt: booking.meetingStartedAt,
        meetingLink: booking.meetingLink
      }
    });
  } catch (error) {
    console.error('Start meeting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Google Meet meeting for consultation
router.post('/bookings/:bookingId/create-meeting', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { consultationTitle } = req.body;
    
    console.log(`Creating meeting for booking ${bookingId}`);
    
    // Find the consultation with this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    }).populate('adviser', 'firstName lastName email salutation');
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Find the booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Populate student data
    await consultation.populate({
      path: 'bookings.student',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    });
    
    const populatedBooking = consultation.bookings.id(bookingId);
    
    // Check if user is the adviser for this consultation
    if (req.user.role !== 'admin' && consultation.adviser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Only the adviser can create meetings.' });
    }
    
    // Check if booking is virtual
    if (populatedBooking.consultationType !== 'chat') {
      return res.status(400).json({ message: 'This is not a virtual consultation' });
    }
    
    // Check if booking is in pending status
    if (populatedBooking.status !== 'Pending') {
      return res.status(400).json({ message: 'Booking must be in Pending status to create meeting' });
    }
    
    // Check if meeting is already created
    if (populatedBooking.meetingLink && populatedBooking.meetingStarted) {
      console.log('Meeting already exists, returning existing URL:', populatedBooking.meetingLink);
      return res.json({ 
        success: true,
        meetingUrl: populatedBooking.meetingLink,
        eventId: populatedBooking.googleEventId,
        message: 'Meeting already exists',
        booking: {
          _id: populatedBooking._id,
          meetingLink: populatedBooking.meetingLink,
          meetingStarted: populatedBooking.meetingStarted,
          meetingStartedAt: populatedBooking.meetingStartedAt
        }
      });
    }
    
    // Use Virtual Meeting Service directly
    const virtualMeetingService = require('../services/virtualMeetingService');
    
    // Create virtual meeting directly
    const adviserName = `${consultation.adviser.salutation || ''} ${consultation.adviser.firstName} ${consultation.adviser.lastName}`.trim();
    const studentName = `${populatedBooking.student.user.firstName} ${populatedBooking.student.user.lastName}`;
    const title = consultationTitle || consultation.title || 'Academic Consultation';
    
    console.log(`Creating virtual meeting between ${adviserName} and ${studentName}`);
    
    const meetingResult = await virtualMeetingService.createMeeting(
      bookingId,
      title,
      adviserName,
      studentName
    );
    
    if (!meetingResult.success) {
      console.error('Failed to create virtual meeting:', meetingResult.error);
      return res.status(500).json({ 
        message: 'Failed to create meeting', 
        error: meetingResult.error
      });
    }
    
    console.log('Virtual meeting created successfully:', meetingResult.meetingUrl);
    
    // Save meeting details to booking
    populatedBooking.meetingLink = meetingResult.meetingUrl;
    populatedBooking.meetingStarted = true;
    populatedBooking.meetingStartedAt = new Date();
    
    await consultation.save();
    
    console.log(`Meeting saved to database for booking ${bookingId}`);
    
    res.json({
      success: true,
      meetingUrl: meetingResult.meetingUrl,
      provider: meetingResult.provider,
      message: 'Meeting created successfully',
      booking: {
        _id: populatedBooking._id,
        meetingLink: populatedBooking.meetingLink,
        meetingStarted: populatedBooking.meetingStarted,
        meetingStartedAt: populatedBooking.meetingStartedAt
      }
    });
    
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Removed Google Calendar API - using direct virtual meeting service

// Test Virtual Meeting APIs
router.get('/test-virtual-meeting-apis', authenticate, async (req, res) => {
  try {
    // Only allow admins to test the APIs
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const virtualMeetingService = require('../services/virtualMeetingService');
    
    console.log('Testing all virtual meeting providers...');
    const testResults = await virtualMeetingService.testAllProviders();
    
    // Count available providers
    const availableProviders = Object.values(testResults).filter(result => result.available).length;
    const totalProviders = Object.keys(testResults).length;
    
    res.json({
      success: true,
      summary: `${availableProviders}/${totalProviders} providers available`,
      providers: testResults,
      recommendation: availableProviders > 0 ? 'Virtual meeting system is ready!' : 'No providers available - check configuration'
    });
    
  } catch (error) {
    console.error('Test virtual meeting APIs error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
});

// Test Notification Scheduler
router.get('/test-reminder-notifications', authenticate, async (req, res) => {
  try {
    // Only allow admins to test the scheduler
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const notificationScheduler = require('../services/notificationScheduler');
    
    console.log('Testing reminder notification system...');
    await notificationScheduler.sendTestReminder();
    
    res.json({
      success: true,
      message: 'Test reminder sent successfully',
      schedulerStatus: notificationScheduler.getStatus()
    });
    
  } catch (error) {
    console.error('Test reminder notifications error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
});

// Test Email Configuration
router.get('/test-email-config', authenticate, async (req, res) => {
  try {
    // Only allow admins to test email
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const emailService = require('../services/emailService');
    
    console.log('Testing email configuration...');
    
    // Test email content
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Email Configuration Test</h2>
        <p>This is a test email to verify your email configuration.</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Configuration Details:</h3>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Email Service:</strong> ${process.env.NODE_ENV === 'production' ? 'SendGrid' : 'Gmail/Nodemailer'}</p>
          <p><strong>Frontend URL:</strong> ${process.env.FRONTEND_URL || 'https://sscms-au.com'}</p>
        </div>
        <p>If you received this email, your configuration is working correctly!</p>
      </div>
    `;
    
    // Send test email to the admin user
    await emailService.sendEmail(
      req.user.email,
      'PHINMA SSCMS - Email Configuration Test',
      testHtml
    );
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      environment: process.env.NODE_ENV || 'development',
      emailService: process.env.NODE_ENV === 'production' ? 'SendGrid' : 'Gmail/Nodemailer',
      sentTo: req.user.email
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Email test failed',
      error: error.message,
      environment: process.env.NODE_ENV || 'development',
      emailService: process.env.NODE_ENV === 'production' ? 'SendGrid' : 'Gmail/Nodemailer'
    });
  }
});

// Get booking status (for real-time updates)
router.get('/bookings/:bookingId/status', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Find the consultation with this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Find the booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user has access to this booking
    const hasAccess = req.user.role === 'admin' || 
                     consultation.adviser.toString() === req.user._id.toString() ||
                     booking.student.toString() === req.user._id.toString();
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({
      _id: booking._id,
      status: booking.status,
      consultationType: booking.consultationType,
      meetingStarted: booking.meetingStarted,
      meetingStartedAt: booking.meetingStartedAt,
      meetingLink: booking.meetingLink
    });
  } catch (error) {
    console.error('Get booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get adviser's consultation history (completed consultations)
router.get('/adviser-history', authenticate, async (req, res) => {
  try {
    console.log('Adviser-history endpoint called by user:', req.user._id, 'role:', req.user.role);
    
    // Only advisers can access this endpoint
    if (req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Only advisers can access this endpoint' });
    }
    
    console.log('Searching for consultations with adviser ID:', req.user._id);
    
    // Find all consultations created by this adviser that have completed bookings
    const consultations = await Consultation.find({
      adviser: req.user._id
    })
    .populate({
      path: 'bookings.student',
      populate: [
        {
          path: 'user',
          select: 'firstName lastName email idNumber'
        },
        {
          path: 'class',
          select: 'className section yearLevel major'
        }
      ],
      select: 'user classDetails major gender contactNumber class yearLevel section'
    })
    .sort({ weekStart: -1, dayOfWeek: 1, startTime: 1 });
    
    console.log('Found consultations:', consultations.length);
    
    // Extract and flatten the completed bookings
    const completedConsultations = [];
    
    consultations.forEach(consultation => {
      if (consultation.bookings && consultation.bookings.length > 0) {
        consultation.bookings.forEach(booking => {
          if (booking.status === 'Completed') {
            completedConsultations.push({
              _id: booking._id,
              student: booking.student,
              dayOfWeek: consultation.dayOfWeek,
              startTime: consultation.startTime,
              endTime: consultation.endTime,
              duration: consultation.duration,
              weekStart: consultation.weekStart,
              concern: booking.concern,
              notes: booking.notes,
              consultationType: booking.consultationType,
              completionNotes: booking.completionNotes,
              completedAt: booking.completedAt,
              bookedAt: booking.bookedAt
            });
          }
        });
      }
    });
    
    console.log('Total completed consultations found:', completedConsultations.length);
    
    res.json(completedConsultations);
  } catch (error) {
    console.error('Get adviser consultation history error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 