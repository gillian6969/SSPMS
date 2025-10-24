const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Get all subjects
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subject by ID
router.get('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new subject
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { sspCode, name, yearLevel, sessions, secondSemesterSessions, description, semester, hours, schoolYear } = req.body;
    
    // Check if subject with same code and semester already exists
    const existingSubject = await Subject.findOne({ sspCode, semester });
    if (existingSubject) {
      return res.status(400).json({ message: `Subject with SSP code "${sspCode}" for "${semester}" already exists` });
    }
    
    // Validate semester
    if (!semester || !['1st Semester', '2nd Semester'].includes(semester)) {
      return res.status(400).json({ message: 'Valid semester (1st Semester or 2nd Semester) is required' });
    }
    
    // Create subject
    const subject = new Subject({
      sspCode,
      name: name || sspCode, // Use sspCode as fallback for name
      yearLevel,
      description,
      semester,
      schoolYear: schoolYear || '2024 - 2025', // Default to current school year
      hours: hours || 1, // Default to 1 hour if not specified
      sessions: sessions || [],
      secondSemesterSessions: secondSemesterSessions || [] 
    });
    
    await subject.save();
    
    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject with this SSP code and semester already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subject
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Only allow sspCode and sessions to be updated
    const { sspCode, sessions } = req.body;
    
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // --- Update SSP Code ---
    if (sspCode) {
      // Check if another subject with this code and semester already exists
      const existingSubject = await Subject.findOne({ 
        sspCode, 
        semester: subject.semester, // Use the existing semester from the subject
        _id: { $ne: req.params.id } 
      });
      
      if (existingSubject) {
        return res.status(400).json({ 
          message: `Another subject with SSP code "${sspCode}" for "${subject.semester}" already exists` 
        });
      }
      subject.sspCode = sspCode;
      // Also update the name to match the sspCode, maintaining consistency
      subject.name = sspCode;
    }
    
    // --- Update Sessions ---
    // The frontend now sends both arrays, so we can update them directly.
    // We check for `undefined` to allow clearing sessions by sending an empty array.
    if (sessions !== undefined) {
      // The session count is now dynamic, so we remove the hardcoded limit of 18.
      // The frontend should enforce the limit based on system options.
      subject.sessions = sessions;
    }
    
    // The frontend logic ensures that when editing 1st sem, the original 2nd sem sessions are preserved,
    // and vice-versa. This backend logic now simply accepts the session arrays as provided.
    // Other fields like yearLevel, semester, hours, and schoolYear are intentionally not updated
    // to match the read-only state of the frontend form.
    
    subject.updatedAt = Date.now();
    await subject.save();
    
    // Return the updated subject
    res.json(subject);
  } catch (error) {
    console.error('Update subject error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject with this SSP code and semester already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Add session to subject
router.post('/:id/sessions', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, isSemesterTwo } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Session title is required' });
    }
    
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Determine if session is for first or second semester
    if (isSemesterTwo) {
      // Check if already at 18 sessions for second semester
      if (subject.secondSemesterSessions.length >= 18) {
        return res.status(400).json({ message: 'Maximum 18 sessions allowed for second semester' });
      }
      
      // Add new session to second semester
      subject.secondSemesterSessions.push({ title });
    } else {
      // Check if already at 18 sessions for first semester
    if (subject.sessions.length >= 18) {
      return res.status(400).json({ message: 'Maximum 18 sessions allowed per subject' });
    }
    
      // Add new session to first semester
    subject.sessions.push({ title });
    }
    
    subject.updatedAt = Date.now();
    
    await subject.save();
    
    res.status(201).json({ message: 'Session added successfully' });
  } catch (error) {
    console.error('Add session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update session status
router.put('/:id/sessions/:sessionId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { status, title, isSemesterTwo } = req.body;
    
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Find session in the appropriate semester array
    const sessionArray = isSemesterTwo ? subject.secondSemesterSessions : subject.sessions;
    const sessionIndex = sessionArray.findIndex(
      session => session._id.toString() === req.params.sessionId
    );
    
    if (sessionIndex === -1) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Update session
    if (status) {
      if (isSemesterTwo) {
        subject.secondSemesterSessions[sessionIndex].status = status;
      } else {
        subject.sessions[sessionIndex].status = status;
      }
    }
    
    if (title) {
      if (isSemesterTwo) {
        subject.secondSemesterSessions[sessionIndex].title = title;
      } else {
        subject.sessions[sessionIndex].title = title;
      }
    }
    
    subject.updatedAt = Date.now();
    await subject.save();
    
    res.json({ message: 'Session updated successfully' });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete session
router.delete('/:id/sessions/:sessionId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { isSemesterTwo } = req.body;
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Find and remove session from the appropriate semester array
    const sessionArray = isSemesterTwo ? 'secondSemesterSessions' : 'sessions';
    const sessionIndex = subject[sessionArray].findIndex(
      session => session._id.toString() === req.params.sessionId
    );
    
    if (sessionIndex === -1) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    subject[sessionArray].splice(sessionIndex, 1);
    subject.updatedAt = Date.now();
    
    await subject.save();
    
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 