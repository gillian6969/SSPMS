const Class = require('../models/Class');
const Subject = require('../models/Subject');
const SessionCompletion = require('../models/SessionCompletion');

/**
 * Service for managing class current period validation and updates
 */
class PeriodService {
  
  /**
   * Update the current period for a class based on validation rules
   * @param {string} classId - The class ID
   * @returns {Promise<Object>} Result with updated period
   */
  static async updateCurrentPeriod(classId) {
    try {
      console.log(`🔄 [PeriodService] Updating current period for class ${classId}`);
      
      // Get class with populated subject data
      const classData = await Class.findById(classId)
        .populate('sspSubject', 'examDateRanges sessions secondSemesterSessions')
        .populate('firstSemester.sspSubject', 'examDateRanges sessions secondSemesterSessions')
        .populate('secondSemester.sspSubject', 'examDateRanges sessions secondSemesterSessions');
      
      if (!classData) {
        throw new Error('Class not found');
      }
      
      console.log(`📊 [PeriodService] Current period: ${classData.currentPeriod}, Semester: ${classData.currentSemester}`);
      
      // Determine current semester and get appropriate subject
      const currentSemester = classData.currentSemester || '1st';
      let subject;
      
      if (currentSemester === '1st') {
        subject = classData.firstSemester?.sspSubject || classData.sspSubject;
      } else {
        subject = classData.secondSemester?.sspSubject;
      }
      
      if (!subject) {
        console.log(`❌ [PeriodService] No subject found for ${currentSemester} semester`);
        return { success: false, message: 'No subject found for current semester' };
      }
      
      // Get sessions for current semester
      let sessions = [];
      if (currentSemester === '1st') {
        sessions = subject.sessions || [];
      } else {
        sessions = subject.secondSemesterSessions || subject.sessions || [];
      }
      
      // Find exam sessions - use all sessions and let the completion logic determine which are exams
      const examSessions = sessions; // Use all sessions, let completion determine which are exams
      
      // Debug: Show all sessions
      const allSessions = sessions.map(s => ({ 
        id: s._id, 
        day: s.day, 
        title: s.title,
        hasStartDate: !!s.startDate,
        hasEndDate: !!s.endDate
      }));
      console.log(`📝 [PeriodService] All sessions:`, allSessions);
      
      console.log(`📝 [PeriodService] Found ${examSessions.length} exam sessions for ${currentSemester} semester`);
      console.log(`📝 [PeriodService] Exam sessions:`, examSessions.map(s => ({ 
        id: s._id, 
        day: s.day, 
        title: s.title 
      })));
      
      // Method B: Checkbox-based validation (takes precedence)
      const checkboxPeriod = await this.checkCheckboxBasedPeriod(classId, examSessions, currentSemester);
      if (checkboxPeriod) {
        if (checkboxPeriod !== classData.currentPeriod) {
          console.log(`✅ [PeriodService] Checkbox-based period change: ${classData.currentPeriod} → ${checkboxPeriod}`);
          await this.updateClassPeriod(classId, checkboxPeriod);
          return { success: true, period: checkboxPeriod, method: 'checkbox' };
        } else {
          console.log(`ℹ️ [PeriodService] Checkbox period ${checkboxPeriod} same as current period, no change needed`);
        }
      }
      
      console.log(`ℹ️ [PeriodService] No checkbox-based period advancement detected`);
      
      // Method A: Date-based validation (fallback)
      const datePeriod = this.checkDateBasedPeriod(subject.examDateRanges);
      console.log(`📅 [PeriodService] Date-based period: ${datePeriod}`);
      
      if (datePeriod && datePeriod !== classData.currentPeriod) {
        console.log(`✅ [PeriodService] Date-based period change: ${classData.currentPeriod} → ${datePeriod}`);
        await this.updateClassPeriod(classId, datePeriod);
        return { success: true, period: datePeriod, method: 'date' };
      }
      
      console.log(`ℹ️ [PeriodService] No period change needed (current: ${classData.currentPeriod})`);
      return { success: true, period: classData.currentPeriod, method: 'no_change' };
      
    } catch (error) {
      console.error('❌ [PeriodService] Error updating current period:', error);
      throw error;
    }
  }
  
  /**
   * Check period based on exam session completion (override method)
   * Only checks if ALL students have completed specific exam sessions
   * @param {string} classId - The class ID
   * @param {Array} examSessions - Array of exam sessions
   * @param {string} semester - Current semester
   * @returns {Promise<string|null>} Period or null if no checkbox override
   */
  static async checkCheckboxBasedPeriod(classId, examSessions, semester) {
    try {
      console.log(`🔍 [PeriodService] Checking exam session completion for class ${classId}, semester ${semester}`);
      console.log(`🔍 [PeriodService] Exam sessions found:`, examSessions.map(s => ({ id: s._id, day: s.day, title: s.title })));
      
      // Get all students in the class
      const classData = await Class.findById(classId).populate('students');
      if (!classData || !classData.students || classData.students.length === 0) {
        console.log(`❌ [PeriodService] No students found in class ${classId}`);
        return null;
      }
      
      const studentIds = classData.students.map(student => student._id);
      console.log(`👥 [PeriodService] Found ${studentIds.length} students in class`);
      
      // Debug: Check what SessionCompletion records exist for this class
      const allCompletions = await SessionCompletion.find({
        class: classId,
        completed: true
      }).populate('student', 'firstName lastName').populate('session', 'title day');
      
      console.log(`🔍 [PeriodService] All completed sessions for this class:`, allCompletions.map(c => ({
        student: `${c.student?.firstName} ${c.student?.lastName}`,
        session: c.session?.title,
        semester: c.semester,
        sessionId: c.session?._id
      })));
      
      // Try different semester formats for SessionCompletion queries
      const semesterFormats = [
        `${semester} Semester`,  // "1st Semester", "2nd Semester"
        `${semester} semester`,  // "1st semester", "2nd semester"
        semester,                // "1st", "2nd"
        semester === '1st' ? '1st Semester' : '2nd Semester',
        semester === '1st' ? '1st semester' : '2nd semester',
        semester === '1st' ? 'First Semester' : 'Second Semester',
        semester === '1st' ? 'first semester' : 'second semester'
      ];
      
      // Find sessions that have completions (these are likely exams)
      const sessionsWithCompletions = [];
      for (const session of examSessions) {
        const completions = await SessionCompletion.find({
          class: classId,
          session: session._id,
          completed: true
        });
        
        if (completions.length > 0) {
          sessionsWithCompletions.push({
            session,
            completions: completions.length,
            totalStudents: studentIds.length
          });
        }
      }
      
      console.log(`📊 [PeriodService] Sessions with completions:`, sessionsWithCompletions.map(s => ({
        title: s.session.title,
        day: s.session.day,
        completions: s.completions,
        totalStudents: s.totalStudents
      })));
      
      // Sort by day to determine order
      sessionsWithCompletions.sort((a, b) => (a.session.day || 0) - (b.session.day || 0));
      
      // Check all exam sessions and determine the highest completed exam
      console.log(`📝 [PeriodService] Checking all exam sessions for completions...`);
      
      let highestCompletedExam = 0;
      let periodToSet = null;
      
      // Check each exam session
      for (let i = 0; i < sessionsWithCompletions.length; i++) {
        const exam = sessionsWithCompletions[i];
        console.log(`📝 [PeriodService] Checking exam ${i + 1}:`, { 
          id: exam.session._id, 
          day: exam.session.day, 
          title: exam.session.title,
          completions: exam.completions,
          totalStudents: exam.totalStudents
        });
        
        // If ANY student has completed this exam, mark it as completed
        if (exam.completions > 0) {
          highestCompletedExam = i + 1;
          console.log(`✅ [PeriodService] Exam ${i + 1} completed by ${exam.completions}/${exam.totalStudents} students`);
        }
      }
      
      console.log(`📊 [PeriodService] Highest completed exam: ${highestCompletedExam}`);
      
      // Determine period based on highest completed exam
      if (highestCompletedExam >= 1) {
        periodToSet = 'Midterm';
        console.log(`🎯 [PeriodService] 1st exam completed → setting period to Midterm`);
      }
      
      if (highestCompletedExam >= 2) {
        periodToSet = 'Finals';
        console.log(`🎯 [PeriodService] 2nd exam completed → setting period to Finals`);
      }
      
      if (highestCompletedExam >= 3) {
        periodToSet = 'Finals';
        console.log(`🎯 [PeriodService] 3rd exam completed → staying in Finals`);
      }
      
      if (periodToSet) {
        console.log(`🎯 [PeriodService] Final period decision: ${periodToSet} (based on ${highestCompletedExam} exams completed)`);
        return periodToSet;
      }
      
      console.log(`ℹ️ [PeriodService] No exam session completion threshold met for period advancement`);
      return null; // No checkbox override
      
    } catch (error) {
      console.error('❌ [PeriodService] Error checking checkbox-based period:', error);
      return null;
    }
  }
  
  /**
   * Check period based on exam dates
   * @param {Object} examDateRanges - Exam date ranges from subject
   * @returns {string|null} Current period based on dates or null if no dates
   */
  static checkDateBasedPeriod(examDateRanges) {
    if (!examDateRanges) {
      return null; // No default, return null if no dates
    }
    
    const now = new Date();
    
    // Check if we're past prelim end date
    if (examDateRanges.prelim && examDateRanges.prelim.end) {
      const prelimEnd = new Date(examDateRanges.prelim.end);
      if (now > prelimEnd) {
        // Check if we're past midterm end date
        if (examDateRanges.midterm && examDateRanges.midterm.end) {
          const midtermEnd = new Date(examDateRanges.midterm.end);
          if (now > midtermEnd) {
            return 'Finals';
          }
        }
        return 'Midterm';
      }
    }
    
    // Only return Prelim if we have prelim dates and we're within the range
    if (examDateRanges.prelim && examDateRanges.prelim.start) {
      const prelimStart = new Date(examDateRanges.prelim.start);
      if (now >= prelimStart) {
        return 'Prelim';
      }
    }
    
    return null; // No period determined from dates
  }
  
  /**
   * Update the class current period
   * @param {string} classId - The class ID
   * @param {string} period - The new period
   */
  static async updateClassPeriod(classId, period) {
    try {
      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        { 
          currentPeriod: period,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      console.log(`Updated class ${classId} current period to ${period}`);
      return updatedClass;
      
    } catch (error) {
      console.error('Error updating class period:', error);
      throw error;
    }
  }
  
  /**
   * Get current period for a class
   * @param {string} classId - The class ID
   * @returns {Promise<string|null>} Current period or null if not set
   */
  static async getCurrentPeriod(classId) {
    try {
      const classData = await Class.findById(classId).select('currentPeriod');
      return classData?.currentPeriod || null; // No default, return null if not set
    } catch (error) {
      console.error('Error getting current period:', error);
      return null;
    }
  }
  
  /**
   * Reset the current period to "Prelim" for a class (used after promotion)
   * @param {string} classId - The class ID
   * @returns {Promise<Object>} Result with updated period
   */
  static async resetCurrentPeriodToPrelim(classId) {
    try {
      console.log(`🔄 [PeriodService] Resetting current period to Prelim for class ${classId}`);
      
      // Get class data
      const classData = await Class.findById(classId);
      if (!classData) {
        throw new Error('Class not found');
      }
      
      console.log(`📊 [PeriodService] Current period: ${classData.currentPeriod} → Prelim`);
      
      // Update the class current period to Prelim
      await this.updateClassPeriod(classId, 'Prelim');
      
      console.log(`✅ [PeriodService] Successfully reset class ${classId} current period to Prelim`);
      return { success: true, period: 'Prelim', method: 'reset_after_promotion' };
      
    } catch (error) {
      console.error('❌ [PeriodService] Error resetting current period to Prelim:', error);
      throw error;
    }
  }
  
  /**
   * Reset current period to Prelim for multiple classes (bulk operation)
   * @param {Array<string>} classIds - Array of class IDs
   * @returns {Promise<Object>} Summary of updates
   */
  static async resetMultipleClassesPeriodToPrelim(classIds) {
    try {
      console.log(`🔄 [PeriodService] Resetting current period to Prelim for ${classIds.length} classes`);
      
      const results = {
        total: classIds.length,
        updated: 0,
        errors: 0,
        details: []
      };
      
      for (const classId of classIds) {
        try {
          const result = await this.resetCurrentPeriodToPrelim(classId);
          if (result.success) {
            results.updated++;
          }
          results.details.push({
            classId,
            success: result.success,
            period: result.period,
            method: result.method
          });
        } catch (error) {
          results.errors++;
          results.details.push({
            classId,
            success: false,
            error: error.message
          });
        }
      }
      
      console.log(`✅ [PeriodService] Bulk reset completed: ${results.updated}/${results.total} classes updated to Prelim`);
      return results;
      
    } catch (error) {
      console.error('❌ [PeriodService] Error in bulk reset to Prelim:', error);
      throw error;
    }
  }
    try {
      console.log('Updating periods for all active classes...');
      
      const activeClasses = await Class.find({ status: 'active' }).select('_id');
      const results = {
        total: activeClasses.length,
        updated: 0,
        errors: 0,
        details: []
      };
      
      for (const classItem of activeClasses) {
        try {
          const result = await this.updateCurrentPeriod(classItem._id);
          if (result.success && result.method !== 'no_change') {
            results.updated++;
          }
          results.details.push({
            classId: classItem._id,
            success: result.success,
            period: result.period,
            method: result.method
          });
        } catch (error) {
          results.errors++;
          results.details.push({
            classId: classItem._id,
            success: false,
            error: error.message
          });
        }
      }
      
      console.log(`Period update completed: ${results.updated}/${results.total} classes updated`);
      return results;
      
    } catch (error) {
      console.error('Error updating all class periods:', error);
      throw error;
    }
  }
}

module.exports = PeriodService;
