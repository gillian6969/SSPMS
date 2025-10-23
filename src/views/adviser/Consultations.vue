<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Consultation Management</h1>
            <p class="text-gray-500 font-normal">Manage your consultation schedules and student bookings</p>
          </div>
        </div>
        
        <!-- View Toggle -->
        <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            @click="currentView = 'calendar'"
            :class="currentView === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Calendar</span>
          </button>
          <button
            @click="currentView = 'list'"
            :class="currentView === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>List</span>
            </button>
          </div>
          
          <!-- History Button -->
          <button
            @click="currentView = 'history'"
            :class="[
              'inline-flex items-center px-3 py-1.5 rounded-md text-sm font-normal transition-colors border',
              currentView === 'history'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
            title="Consultation History"
          >
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            History
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Loading your consultation schedule...</span>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-else-if="currentView === 'calendar'" class="bg-white rounded-2xl shadow-lg border border-gray-100">
      <!-- Calendar Header with Title, Date, and Navigation -->
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div>
              <p class="text-md text-gray-800">{{ formatWeekRange(currentWeek) }}</p>
          </div>
            <!-- Legend -->
            <div class="flex items-center space-x-4 text-xs">
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-green-200 border border-green-300"></div>
                <span class="text-gray-600">Active</span>
              </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-gray-200 border border-gray-300"></div>
                <span class="text-gray-600">Inactive</span>
              </div>
            </div>
          </div>
          <div class="inline-flex items-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <button @click="previousMonth" class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Previous Month" title="Previous Month">«</button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button @click="previousWeek" class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Previous Week" title="Previous Week">‹</button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button @click="goToCurrentWeek" class="px-2.5 py-2 text-green-600 hover:text-green-900 hover:bg-green-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500" aria-label="Current Week" title="Current Week">↻</button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button @click="nextWeek" class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Next Week" title="Next Week">›</button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button @click="nextMonth" class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Next Month" title="Next Month">»</button>
          </div>
        </div>
      </div>
      
      <!-- Calendar Grid -->
      <div class="p-6">
        <div class="border rounded-lg">
        <!-- Calendar Grid Header -->
        <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
          <div class="py-3 px-2 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
          <div v-for="(day, index) in weekDaysWithDates" :key="index" class="py-3 px-2 text-gray-500 text-xs font-medium text-center">
            <div class="font-semibold">{{ day.name }}</div>
            <div class="text-gray-400">{{ day.date }}</div>
          </div>
        </div>
        
        <!-- Calendar Grid Body -->
        <div class="relative max-h-[600px] overflow-y-auto">
          <div class="divide-y divide-gray-200">
            <div v-for="(timeSlot, index) in formattedTimeSlots" :key="index" class="grid grid-cols-6">
              <!-- Time Label -->
              <div class="py-2 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[50px]">
                <span class="text-center leading-tight">{{ timeSlot }}</span>
              </div>
              
              <!-- Day Columns -->
              <div 
                v-for="(day, dayIndex) in weekDays" 
                :key="`${day}-${index}`"
                class="relative p-0 min-h-[50px] border-r border-gray-100"
              >
                <!-- Consultation blocks will be positioned here -->
              </div>
            </div>
          </div>

          <!-- Absolutely positioned consultation blocks -->
          <div 
            v-for="(consultationBlock, index) in getPositionedConsultationBlocks()" 
            :key="index"
            class="absolute rounded-md text-xs bg-opacity-95 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border"
            :class="getAdviserConsultationColorClass(consultationBlock.consultation)"
            :style="{
              left: `calc(${consultationBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
              top: `${consultationBlock.top}px`,
              height: `${consultationBlock.height}px`,
              width: 'calc(16.67% - 2px)'
            }"
            @click="viewConsultation(consultationBlock.consultation)"
          >
            <div class="font-normal text-xs truncate p-2">
              {{ consultationBlock.consultation.notes || 'Consultation' }}
            </div>
            <div class="text-xs flex flex-col justify-between px-2 pb-2 flex-grow">
              <div class="mt-1 flex flex-col">
                <span class="text-[10px] text-gray-700">{{ formatConsultationDate(consultationBlock.consultation) }}</span>
                <span class="rounded-full px-2 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max">
                  Booked: {{ consultationBlock.consultation.bookedStudents || 0 }} / {{ consultationBlock.consultation.maxStudents }}
                </span>
                <span class="text-xs mt-1">
                  {{ formatTimeRange(consultationBlock.consultation.startTime, consultationBlock.consultation.endTime) }}
                </span>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="consultations.length === 0" class="p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Consultation Schedules</h3>
        <p class="text-gray-600">Contact your administrator to set up consultation schedules</p>
      </div>
    </div>

    <!-- List View with weekly filter -->
    <div v-else-if="currentView === 'list'" class="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div>
              <h3 class="text-xl font-medium text-gray-900">Consultation Schedule</h3>
              <p class="text-md text-gray-800">{{ formatWeekRange(currentWeek) }}</p>
            </div>
          </div>
          <div class="inline-flex items-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <button @click="previousMonth" class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50" aria-label="Previous Month" title="Previous Month">«</button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button @click="previousWeek" class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50" aria-label="Previous Week" title="Previous Week">‹</button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button @click="goToCurrentWeek" class="px-2.5 py-2 text-green-600 hover:text-green-900 hover:bg-green-50" aria-label="Current Week" title="Current Week">↻</button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button @click="nextWeek" class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50" aria-label="Next Week" title="Next Week">›</button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button @click="nextMonth" class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50" aria-label="Next Month" title="Next Month">»</button>
          </div>
        </div>
      </div>
      <!-- Table View -->
      <div v-if="consultationsForList.length === 0" class="p-6 text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Consultation Schedules</h3>
        <p class="text-gray-600">No consultations found for this week</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-for="c in consultationsForList" :key="c._id">
              <!-- Main Consultation Row -->
              <tr class="hover:bg-gray-50">
                <!-- Day Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ weekDays[c.dayOfWeek] }}</div>
                </td>
                
                <!-- Time Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatTimeRange(c.startTime, c.endTime) }}</div>
                </td>
                
                <!-- Duration Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ c.duration }}h</div>
                </td>
                
                <!-- Date Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatConsultationDate(c) }}</div>
                </td>
                
                <!-- Capacity Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-sm text-gray-900">
                      <span class="font-medium">{{ c.bookedStudents || 0 }}</span>
                      <span class="text-gray-500">/ {{ c.maxStudents || 0 }}</span>
                    </div>
                    <div class="ml-2 w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full" 
                        :style="{ width: `${((c.bookedStudents || 0) / (c.maxStudents || 1)) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </td>
                
                <!-- Status Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(c.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ c.status }}
                  </span>
                </td>
                
                <!-- Actions Column -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="viewConsultation(c)"
                    class="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                View Details
              </button>
                </td>
              </tr>
              
              <!-- Booked Students Row -->
              <tr class="bg-gray-50 border-t border-gray-200">
                <td colspan="7" class="px-6 py-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <h4 class="text-sm font-medium text-gray-800">Booked Students</h4>
                      <span class="text-sm text-gray-500">
                        {{ (c.bookings || []).filter(b => b.status === 'Pending' || b.status === 'Confirmed').length }} active bookings
                      </span>
            </div>
                    
                    <div class="relative">
                      <button 
                        @click="toggleStudentDropdown(c._id)"
                        class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <span>{{ expandedStudents[c._id] ? 'Hide' : 'Show' }} Students</span>
                        <svg 
                          class="ml-1 h-4 w-4 transition-transform duration-200" 
                          :class="{ 'rotate-180': expandedStudents[c._id] }"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
          </div>
                  </div>
                  
                  <!-- Student Dropdown Content -->
                  <div 
                    v-if="expandedStudents[c._id]" 
                    class="mt-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div class="p-4">
                      <div v-if="(c.bookings || []).filter(b => b.status === 'Pending' || b.status === 'Confirmed').length === 0" class="text-center py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p class="text-sm text-gray-500">No active bookings for this consultation</p>
                      </div>
                      <div v-else class="space-y-4">
                        <div v-for="b in (c.bookings || []).filter(b => b.status === 'Pending' || b.status === 'Confirmed')" :key="b._id" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div class="flex items-start justify-between">
                            <div class="flex-1 min-w-0">
                              <div class="flex items-center space-x-3">
                                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <span class="text-sm font-medium text-blue-600">
                                    {{ b.student?.user?.firstName?.charAt(0) }}{{ b.student?.user?.lastName?.charAt(0) }}
                                  </span>
                                </div>
                                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900">
                    {{ b.student?.user?.firstName }} {{ b.student?.user?.lastName }}
                  </div>
                                  <div class="text-xs text-gray-500">{{ b.student?.user?.email }}</div>
                                  <div class="text-xs text-gray-400">ID: {{ b.student?.user?.idNumber }}</div>
                </div>
                  </div>
                              <div class="mt-3">
                                <div class="text-xs text-gray-600">
                                  <span class="font-medium">Concern:</span> 
                                  <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs ml-1">{{ b.concern }}</span>
              </div>
            </div>
          </div>
                            <div class="ml-4 flex-shrink-0">
                              <span :class="getBookingStatusClass(b.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                                {{ b.status }}
                              </span>
        </div>
                          </div>
                          <div class="mt-4 flex items-center gap-2">
                            <button v-if="b.status === 'Pending'" @click="updateBookingStatus(b._id, 'Confirmed')" class="text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                              Confirm
                            </button>
                            <button v-if="b.status === 'Confirmed'" @click="updateBookingStatus(b._id, 'Completed')" class="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                              Mark Complete
                            </button>
                            <button v-if="b.status === 'Completed' && !b.feedback" @click="openFeedbackModal(b)" class="text-xs px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                              Add Feedback
                            </button>
                            <button v-if="b.status === 'Completed' && b.feedback" @click="openFeedbackModal(b)" class="text-xs px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                              Edit Feedback
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- History View -->
    <div v-else-if="currentView === 'history'" class="bg-white rounded-2xl shadow-lg border border-gray-100">
      <!-- History Header -->
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Consultation History</h2>
          </div>
          
          <!-- History Filters -->
          <div class="flex items-center space-x-3">
            <select v-model="historyFilters.yearLevel" class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">All Year Levels</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <select v-model="historyFilters.section" class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">All Sections</option>
              <option v-for="section in availableSections" :key="section" :value="section">{{ section }}</option>
            </select>
            <select v-model="historyFilters.major" class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">All Majors</option>
              <option v-for="major in availableMajors" :key="major" :value="major">{{ major }}</option>
            </select>
            <input 
              type="text" 
              v-model="historyFilters.concern"
              placeholder="Search concerns..."
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
            <input 
              type="date" 
              v-model="historyFilters.dateFrom"
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="From date"
            >
            <input 
              type="date" 
              v-model="historyFilters.dateTo"
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="To date"
            >
            <button 
              @click="clearAdviserHistoryFilters"
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      <!-- History Content -->
      <div class="p-6">
        <div v-if="loadingAdviserHistory" class="text-center py-12">
          <div class="inline-flex items-center">
            <svg class="animate-spin h-5 w-5 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading consultation history...
          </div>
        </div>
        
        <div v-else-if="filteredAdviserHistory.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No consultation history</h3>
          <p class="text-gray-500">No completed consultations found with the current filters.</p>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="consultation in filteredAdviserHistory" :key="consultation._id" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ consultation.student.user.firstName }} {{ consultation.student.user.lastName }}
                  </h3>
                  <span class="text-xs text-gray-500">
                    ID: {{ consultation.student.user.idNumber }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-gray-700">Date:</span>
                    <p class="text-gray-600">{{ formatAdviserConsultationDate(consultation) }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Time:</span>
                    <p class="text-gray-600">{{ formatTime(consultation.startTime) }} - {{ formatTime(consultation.endTime) }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Student Info:</span>
                    <p class="text-gray-600">
                      Year {{ consultation.student.yearLevel || consultation.student.class?.yearLevel || 'N/A' }} - 
                      {{ consultation.student.section || consultation.student.class?.section || 'N/A' }}
                      <br>
                      {{ consultation.student.major || consultation.student.class?.major || 'N/A' }}
                    </p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Type:</span>
                    <p class="text-gray-600">{{ consultation.consultationType === 'chat' ? 'Virtual' : 'In-Person' }}</p>
                  </div>
                  <div class="md:col-span-2">
                    <span class="font-medium text-gray-700">Concern:</span>
                    <p class="text-gray-600">{{ consultation.concern }}</p>
                  </div>
                  <div class="md:col-span-2" v-if="consultation.completionNotes">
                    <span class="font-medium text-gray-700">Completion Notes:</span>
                    <p class="text-gray-600">{{ consultation.completionNotes }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Completed:</span>
                    <p class="text-gray-600">{{ formatDate(consultation.completedAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Consultation Details Modal -->
    <Teleport to="body">
      <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center" style="z-index: 999999;" @click.self="closeDetailsModal">
        <div class="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-7xl mx-auto p-6 max-h-[95vh] overflow-y-auto scrollbar-hide transition-all duration-200" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-xl font-semibold text-gray-800">Consultation Details</h2>
            <button @click="closeDetailsModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedConsultation">
          <!-- Consultation Info Header -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-200">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <div class="flex items-center space-x-4">
                  <div class="text-lg font-semibold text-gray-800">{{ weekDays[selectedConsultation.dayOfWeek] }}</div>
                  <div class="text-lg font-medium text-blue-600">{{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}</div>
              </div>
                <div class="flex items-center space-x-6 text-sm text-gray-600">
                  <span>Duration: {{ selectedConsultation.duration }}h</span>
                  <span>Max Students: {{ selectedConsultation.maxStudents }}</span>
                  <span>Time per Student: {{ Math.floor((selectedConsultation.duration * 60) / selectedConsultation.maxStudents) }}m</span>
            </div>
          </div>
              <div class="text-right">
                <span class="inline-flex px-4 py-2 text-sm font-medium rounded-full bg-blue-100 text-blue-800">{{ selectedConsultation.status }}</span>
                <div class="mt-2 text-sm text-gray-600">
                  {{ selectedConsultation.bookedStudents || 0 }} students booked
            </div>
            </div>
            </div>
          </div>
            
            <!-- Notes -->
            <div v-if="selectedConsultation.notes" class="mt-4 bg-white p-3 rounded-lg border border-gray-200">
              <p class="text-sm font-medium text-gray-700 mb-1">Notes</p>
              <p class="text-sm text-gray-600">{{ selectedConsultation.notes }}</p>
            </div>
          </div>
          
          <!-- Booked Students Section -->
          <div class="border border-gray-300 rounded-lg">
            <!-- Tab Navigation -->
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  @click="activeTab = 'booked'"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === 'booked'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  Booked ({{ bookedStudents.length }})
                </button>
                <button
                  @click="activeTab = 'pending'"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  Pending ({{ pendingStudents.length }})
                </button>
                <button
                  @click="activeTab = 'completed'"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === 'completed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  Completed ({{ completedStudents.length }})
                </button>
              </nav>
            </div>
            
            <!-- Tab Content -->
            <div class="p-0">
              <!-- Booked Tab -->
              <div v-if="activeTab === 'booked'">
                <div v-if="bookedStudents.length === 0" class="text-center py-12 text-gray-500">
                  <h3 class="text-sm font-medium text-gray-900 mb-1">No booked students</h3>
                  <p class="text-sm text-gray-500">No students have booked this consultation yet.</p>
              </div>
                <div v-else class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6">
                          Student Name
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Student ID
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Year Level
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Section & Major
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Concern / Meeting Type
                      </th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="(booking, index) in bookedStudents" :key="booking._id" class="hover:bg-gray-50">
                        <!-- Student Name Column -->
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div class="flex items-center">
                          <div class="h-10 w-10 flex-shrink-0">
                          <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">
                                {{ booking.student.user.firstName?.charAt(0) }}{{ booking.student.user.lastName?.charAt(0) }}
                              </span>
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                              {{ booking.student.user.firstName }} {{ booking.student.user.lastName }}
                            </div>
                            </div>
                            </div>
                        </td>
                        
                        <!-- Student ID Column -->
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900">
                            {{ booking.student.user.idNumber }}
                          </div>
                      </td>
                      
                        <!-- Year Level Column -->
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900">
                            Year {{ booking.student.class?.yearLevel || booking.student.classDetails?.yearLevel || 'N/A' }}
                        </div>
                      </td>
                      
                        <!-- Section & Major Column -->
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900">
                            {{ booking.student.class?.section || booking.student.classDetails?.section || 'N/A' }}
                        </div>
                          <div class="text-xs text-gray-500">
                            {{ booking.student.class?.major || booking.student.classDetails?.major || booking.student.major || 'N/A' }}
                        </div>
                      </td>
                      
                        <!-- Concern / Meeting Type Column -->
                      <td class="px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900 font-medium mb-1">
                            {{ booking.concern }}
                          </div>
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                :class="booking.consultationType === 'chat' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                            <svg v-if="booking.consultationType === 'chat'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                            </svg>
                            <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                            {{ booking.consultationType === 'chat' ? 'Virtual' : 'In-Person' }}
                          </span>
                      </td>
                      
                        <!-- Actions Column -->
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            @click="acceptBooking(booking._id)"
                            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            Accept
                          </button>
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Pending Tab -->
              <div v-if="activeTab === 'pending'">
                <div v-if="pendingStudents.length === 0" class="text-center py-12 text-gray-500">
                  <h3 class="text-sm font-medium text-gray-900 mb-1">No pending students</h3>
                  <p class="text-sm text-gray-500">No students are currently pending for this consultation.</p>
                            </div>
                <div v-else class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6">
                          Student Name
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Student ID
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Year Level
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Section & Major
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Concern / Meeting Type
                        </th>
                        <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span class="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="booking in pendingStudents" :key="booking._id" class="hover:bg-gray-50">
                        <!-- Student Name Column -->
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0">
                              <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-gray-700">
                                  {{ booking.student.user.firstName?.charAt(0) }}{{ booking.student.user.lastName?.charAt(0) }}
                                </span>
                          </div>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">
                                {{ booking.student.user.firstName }} {{ booking.student.user.lastName }}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <!-- Student ID Column -->
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900">
                            {{ booking.student.user.idNumber }}
                          </div>
                        </td>
                        
                        <!-- Year Level Column -->
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900">
                            Year {{ booking.student.class?.yearLevel || booking.student.classDetails?.yearLevel || 'N/A' }}
                            </div>
                        </td>
                        
                        <!-- Section & Major Column -->
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900">
                            {{ booking.student.class?.section || booking.student.classDetails?.section || 'N/A' }}
                          </div>
                          <div class="text-xs text-gray-500">
                            {{ booking.student.class?.major || booking.student.classDetails?.major || booking.student.major || 'N/A' }}
                        </div>
                      </td>
                        
                        <!-- Concern / Meeting Type Column -->
                        <td class="px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900 font-medium mb-1">
                            {{ booking.concern }}
                          </div>
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                :class="booking.consultationType === 'chat' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                            <svg v-if="booking.consultationType === 'chat'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                            </svg>
                            <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                            {{ booking.consultationType === 'chat' ? 'Virtual' : 'In-Person' }}
                          </span>
                      </td>
                      
                      <!-- Actions Column -->
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div class="flex items-center justify-end space-x-2">
                            <!-- Cancel Button -->
                          <button
                              @click="cancelBooking(booking._id)"
                              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          >
                              Cancel
                          </button>
                          
                            <!-- Virtual Meeting Buttons -->
                            <div v-if="booking.consultationType === 'chat'">
                              <!-- If meeting not started yet -->
                              <button
                                v-if="!booking.meetingStarted"
                                @click="startMeeting(booking)"
                                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                                </svg>
                                Start Meeting
                              </button>
                              
                              <!-- If meeting already started -->
                              <button
                                v-else
                                @click="joinMeeting(booking)"
                                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                              >
                                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                                </svg>
                                Join Meeting (Active)
                              </button>
                            </div>
                            
                            <!-- Complete Button -->
                            <button
                              @click="completeBooking(booking._id)"
                              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                              Complete
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Completed Tab -->
              <div v-if="activeTab === 'completed'">
                <div v-if="completedStudents.length === 0" class="text-center py-12 text-gray-500">
                  <h3 class="text-sm font-medium text-gray-900 mb-1">No completed consultations</h3>
                  <p class="text-sm text-gray-500">No students have completed their consultations yet.</p>
                </div>
                <div v-else class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6">
                          Student Name
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Student ID
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Year Level
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Section & Major
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Concern / Meeting Type
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                          Completion Notes
                        </th>
                        <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span class="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="booking in completedStudents" :key="booking._id" class="hover:bg-gray-50">
                        <!-- Student Name Column -->
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0">
                              <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-gray-700">
                                  {{ booking.student.user.firstName?.charAt(0) }}{{ booking.student.user.lastName?.charAt(0) }}
                          </span>
                              </div>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">
                                {{ booking.student.user.firstName }} {{ booking.student.user.lastName }}
                              </div>
                            </div>
                        </div>
                      </td>
                        
                        <!-- Student ID Column -->
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900">
                            {{ booking.student.user.idNumber }}
                          </div>
                        </td>
                        
                        <!-- Year Level Column -->
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900">
                            Year {{ booking.student.class?.yearLevel || booking.student.classDetails?.yearLevel || 'N/A' }}
                          </div>
                        </td>
                        
                        <!-- Section & Major Column -->
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900">
                            {{ booking.student.class?.section || booking.student.classDetails?.section || 'N/A' }}
                          </div>
                          <div class="text-xs text-gray-500">
                            {{ booking.student.class?.major || booking.student.classDetails?.major || booking.student.major || 'N/A' }}
                          </div>
                        </td>
                        
                        <!-- Concern / Meeting Type Column -->
                        <td class="px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900 font-medium mb-1">
                            {{ booking.concern }}
                          </div>
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                :class="booking.consultationType === 'chat' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                            <svg v-if="booking.consultationType === 'chat'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                            </svg>
                            <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                            {{ booking.consultationType === 'chat' ? 'Virtual' : 'In-Person' }}
                          </span>
                        </td>
                        
                        <!-- Completion Notes Column -->
                        <td class="px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900 max-w-xs truncate" :title="booking.completionNotes || 'No notes'">
                            {{ booking.completionNotes || 'No notes' }}
                          </div>
                        </td>
                        
                        <!-- Actions Column -->
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <span class="text-xs text-gray-400 italic">
                            Completed
                          </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Feedback Modal -->
    <Teleport to="body">
      <div v-if="showFeedbackModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeFeedbackModal">
          <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-gray-900">
              {{ feedbackModalMode === 'escalation' ? '🚨 Add Feedback for Escalation' : (selectedBooking?.feedback ? 'Edit Feedback' : 'Add Feedback') }}
            </h2>
            <button @click="closeFeedbackModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Student Info -->
          <div v-if="selectedBooking" class="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Consultation Details</h3>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Student:</span> {{ selectedBooking.student?.user?.firstName }} {{ selectedBooking.student?.user?.lastName }}
            </p>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Concern:</span> {{ selectedBooking.concern }}
            </p>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Status:</span> {{ selectedBooking.status }}
            </p>
          </div>
          
          <!-- Feedback Form -->
          <form @submit.prevent="submitFeedback">
            <div class="mb-6">
              <label for="feedback" class="block text-sm font-medium text-gray-700 mb-2">
                Consultation Feedback
              </label>
              <textarea
                id="feedback"
                v-model="feedbackForm.text"
                rows="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                placeholder="Provide feedback about the consultation session, outcomes, recommendations, or next steps..."
                required
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                This feedback will be visible to the student and can help track consultation outcomes.
              </p>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeFeedbackModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              
              <!-- For escalation mode: Submit feedback then escalate -->
              <button
                v-if="feedbackModalMode === 'escalation'"
                type="submit"
                :disabled="submittingFeedback || !feedbackForm.text.trim()"
                class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="submittingFeedback">Processing...</span>
                <span v-else>🚨 Submit & Escalate</span>
              </button>
              
              <!-- For normal feedback mode -->
              <button
                v-else
                type="submit"
                :disabled="submittingFeedback || !feedbackForm.text.trim()"
                class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="submittingFeedback">Saving...</span>
                <span v-else>{{ selectedBooking?.feedback ? 'Update Feedback' : 'Add Feedback' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
    
    <!-- Resolution Modal -->
    <Teleport to="body">
      <div v-if="showResolutionModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeResolutionModal">
        <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-gray-900">✅ Resolve Consultation</h2>
            <button @click="closeResolutionModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Student Info -->
          <div v-if="selectedBooking" class="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
            <h3 class="text-sm font-medium text-green-800 mb-2">Resolving Consultation</h3>
            <p class="text-sm text-green-700">
              <span class="font-medium">Student:</span> {{ selectedBooking.student?.user?.firstName }} {{ selectedBooking.student?.user?.lastName }}
            </p>
            <p class="text-sm text-green-700">
              <span class="font-medium">Concern:</span> {{ selectedBooking.concern }}
            </p>
            <p class="text-sm text-green-700">
              <span class="font-medium">Status:</span> {{ selectedBooking.status }}
            </p>
          </div>
          
          <!-- Resolution Form -->
          <form @submit.prevent="submitResolution">
            <div class="mb-6">
              <label for="resolution" class="block text-sm font-medium text-gray-700 mb-2">
                Resolution Summary <span class="text-red-500">*</span>
              </label>
              <textarea
                id="resolution"
                v-model="resolutionForm.text"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                placeholder="Describe how the consultation concern was resolved, actions taken, and any follow-up recommendations..."
                required
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                This resolution will be recorded and the student will be notified.
              </p>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeResolutionModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submittingResolution || !resolutionForm.text.trim()"
                class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="submittingResolution">Resolving...</span>
                <span v-else>✅ Resolve Consultation</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
    
    <!-- Escalation Modal -->
    <Teleport to="body">
      <div v-if="showEscalationModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeEscalationModal">
        <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-gray-900">🚨 Escalate to Admin</h2>
            <button @click="closeEscalationModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Student Info -->
          <div v-if="selectedBooking" class="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
            <h3 class="text-sm font-medium text-red-800 mb-2">Escalating Consultation</h3>
            <p class="text-sm text-red-700">
              <span class="font-medium">Student:</span> {{ selectedBooking.student?.user?.firstName }} {{ selectedBooking.student?.user?.lastName }}
            </p>
            <p class="text-sm text-red-700">
              <span class="font-medium">Concern:</span> {{ selectedBooking.concern }}
            </p>
            <p class="text-sm text-red-700">
              <span class="font-medium">Status:</span> {{ selectedBooking.status }}
            </p>
          </div>
          
          <!-- Escalation Form -->
          <form @submit.prevent="submitEscalation">
            <div class="mb-6">
              <label for="escalationReason" class="block text-sm font-medium text-gray-700 mb-2">
                Escalation Reason <span class="text-red-500">*</span>
              </label>
              <textarea
                id="escalationReason"
                v-model="escalationForm.reason"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                placeholder="Describe why this consultation needs administrative intervention..."
                required
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                Explain why this consultation requires admin attention (e.g., serious concerns, need for additional resources, policy violations, etc.)
              </p>
            </div>
            
            <!-- Current Feedback Display -->
            <div v-if="selectedBooking?.feedback" class="mb-6 bg-gray-50 p-3 rounded-lg border">
              <h4 class="text-sm font-medium text-gray-800 mb-2">Current Feedback (will be included):</h4>
              <p class="text-sm text-gray-600">{{ selectedBooking.feedback }}</p>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeEscalationModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submittingEscalation || !escalationForm.reason.trim()"
                class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="submittingEscalation">Escalating...</span>
                <span v-else>🚨 Escalate to Admin</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, Teleport, nextTick } from 'vue'
import { notificationService } from '../../services/notificationService'
import { useAuthStore } from '../../stores/authStore'
import api from '../../services/api'

const authStore = useAuthStore()

// Reactive data
const loading = ref(false)
const currentView = ref('calendar')
const consultations = ref([])
const currentWeek = ref(new Date())
const showDetailsModal = ref(false)
const selectedConsultation = ref(null)
const activeTab = ref('booked')

// Feedback modal data
const showFeedbackModal = ref(false)
const selectedBooking = ref(null)
const submittingFeedback = ref(false)
const feedbackForm = ref({
  text: ''
})

// Escalation modal data
const showEscalationModal = ref(false)
const submittingEscalation = ref(false)
const escalationForm = ref({
  reason: ''
})

// History data
const adviserConsultationHistory = ref([])
const loadingAdviserHistory = ref(false)
const availableSections = ref(['South-1', 'South-2', 'South-3', 'South-4', 'South-5'])
const availableMajors = ref(['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'])
const historyFilters = reactive({
  yearLevel: '',
  section: '',
  major: '',
  concern: '',
  dateFrom: '',
  dateTo: ''
})

// Resolution modal data
const showResolutionModal = ref(false)
const submittingResolution = ref(false)
const resolutionForm = ref({
  text: ''
})

// Feedback modal mode ('normal' or 'escalation')
const feedbackModalMode = ref('normal')

// Student dropdown state
const expandedStudents = ref({})

// Week days (Monday to Friday)
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Time slots (7 AM to 5 PM)
const timeSlots = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

// Formatted time slots for display
const formattedTimeSlots = [
  '7:00 AM - 8:00 AM', 
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM'
]

// Date helpers and weekly range
const getWeekStart = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}
const getWeekEnd = (date) => {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 4)
  return end
}
const formatWeekRange = (date) => {
  const start = getWeekStart(date)
  const end = getWeekEnd(date)
  return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
}
const weekDaysWithDates = computed(() => {
  const weekStart = getWeekStart(currentWeek.value)
  return weekDays.map((day, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)
    return { name: day, date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  })
})
const formatConsultationDate = (c) => {
  if (c.dayOfWeek === undefined) return ''
  // Use the current week being viewed instead of the consultation's original weekStart
  const currentWeekStart = getWeekStart(currentWeek.value)
  const d = new Date(currentWeekStart)
  d.setDate(currentWeekStart.getDate() + Number(c.dayOfWeek))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Computed properties for tab system
const bookedStudents = computed(() => {
  if (!selectedConsultation.value) return []
  const bookings = selectedConsultation.value.bookings || []
  // Sort by booking time (first come, first served)
  return bookings
    .filter(b => b.status === 'Booked')
    .sort((a, b) => new Date(a.bookedAt) - new Date(b.bookedAt))
})

const pendingStudents = computed(() => {
  if (!selectedConsultation.value) return []
  const bookings = selectedConsultation.value.bookings || []
  return bookings
    .filter(b => b.status === 'Pending')
    .sort((a, b) => new Date(a.bookedAt) - new Date(b.bookedAt))
})

const completedStudents = computed(() => {
  if (!selectedConsultation.value) return []
  const bookings = selectedConsultation.value.bookings || []
  return bookings
    .filter(b => b.status === 'Completed')
    .sort((a, b) => new Date(a.bookedAt) - new Date(b.bookedAt))
})


// Methods
const formatTime = (hour) => {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${ampm}`
}

const formatTimeRange = (startHour, endHour) => {
  return `${formatTime(startHour)} - ${formatTime(endHour)}`
}

// Format time range for HH:MM format (for allocated time slots)
const formatAllocatedTimeRange = (startTime, endTime) => {
  const formatTimeString = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }
  
  return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Inactive':
      return 'bg-red-100 text-red-800'
    case 'Full':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColorClass = (status) => {
  switch (status) {
    case 'Active':
      return 'text-green-600'
    case 'Inactive':
      return 'text-red-600'
    case 'Full':
      return 'text-yellow-600'
    default:
      return 'text-gray-600'
  }
}

const getBookingStatusClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Confirmed':
      return 'bg-green-100 text-green-800'
    case 'Completed':
      return 'bg-blue-100 text-blue-800'
    case 'Cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getConsultationsForSlot = (dayIndex, hour) => {
  return consultations.value.filter(consultation => {
    return consultation.dayOfWeek === dayIndex && 
           consultation.startTime <= hour && 
           consultation.endTime > hour
  })
}

// Convert time string (e.g., "7:00 AM") to minutes since midnight
const convertTimeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  let totalMinutes = hours * 60 + minutes
  
  if (period === 'PM' && hours !== 12) {
    totalMinutes += 12 * 60
  } else if (period === 'AM' && hours === 12) {
    totalMinutes = minutes
  }
  
  return totalMinutes
}

// Get color classes for adviser consultation blocks
const getAdviserConsultationColorClass = (consultation) => {
  switch (consultation.status) {
    case 'Active':
      return 'bg-green-200 text-green-800 hover:bg-green-300 border-green-300'
    case 'Full':
      return 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border-yellow-300'
    case 'Inactive':
      return 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-gray-300'
    default:
      return 'bg-blue-200 text-blue-800 hover:bg-blue-300 border-blue-300'
  }
}

// Function to get positioned consultation blocks
const getPositionedConsultationBlocks = () => {
  // Constants for positioning
  const ROW_HEIGHT = 50 // Match the min-height of time slots

  // Map time slots to their start and end times in minutes
  const timeSlotRanges = formattedTimeSlots.map(slot => {
    const [start, end] = slot.split(' - ')
    return {
      start: convertTimeToMinutes(start),
      end: convertTimeToMinutes(end)
    }
  })
  
  // Process each consultation to determine its position
  const consultationBlocks = []
  
  // Day indices for positioning
  const dayIndices = {
    'Monday': 0,
    'Tuesday': 1,
    'Wednesday': 2,
    'Thursday': 3,
    'Friday': 4
  }
  
  const currentStart = getWeekStart(currentWeek.value)
  const currentEnd = getWeekEnd(currentWeek.value)
  const isInCurrentWeek = (c) => {
    if (!c.weekStart || !c.weekEnd) return false
    const cStart = new Date(c.weekStart)
    const cEnd = new Date(c.weekEnd)
    return cStart <= currentEnd && cEnd >= currentStart
  }

  consultations.value
    .filter(c => (c.status === 'Active' || c.status === 'Inactive') && c.adviserAccepted !== false)
    .filter(isInCurrentWeek)
    .forEach(consultation => {
    // Get the day index (0-4 for Monday-Friday)
    const dayIndex = dayIndices[weekDays[consultation.dayOfWeek]]
    if (dayIndex === undefined) return
    
    // Calculate start and end times
    const startTime = formatTime(consultation.startTime)
    const endTime = formatTime(consultation.endTime)
    
    // Find the matching time slot for the start time
    let startRowIndex = -1
    formattedTimeSlots.forEach((timeSlot, index) => {
      if (timeSlot.startsWith(startTime)) {
        startRowIndex = index
      }
    })
    
    // Find the matching time slot for the end time
    let endRowIndex = -1
    formattedTimeSlots.forEach((timeSlot, index) => {
      if (timeSlot.endsWith(endTime)) {
        endRowIndex = index
      }
    })
    
    // If exact matches weren't found, calculate based on minutes
    if (startRowIndex === -1 || endRowIndex === -1) {
      const startMinutes = convertTimeToMinutes(startTime)
      const endMinutes = convertTimeToMinutes(endTime)
      
      // Find closest time slots
      if (startRowIndex === -1) {
        let minDiff = Infinity
        timeSlotRanges.forEach((range, index) => {
          const diff = Math.abs(range.start - startMinutes)
          if (diff < minDiff) {
            minDiff = diff
            startRowIndex = index
          }
        })
      }
      
      if (endRowIndex === -1) {
        let minDiff = Infinity
        timeSlotRanges.forEach((range, index) => {
          const diff = Math.abs(range.end - endMinutes)
          if (diff < minDiff) {
            minDiff = diff
            endRowIndex = index
          }
        })
      }
    }
    
    // Ensure valid indices
    if (startRowIndex === -1) startRowIndex = 0
    if (endRowIndex === -1 || endRowIndex < startRowIndex) endRowIndex = startRowIndex
    
    // Calculate position and dimensions
    const top = startRowIndex * ROW_HEIGHT
    const height = (endRowIndex - startRowIndex + 1) * ROW_HEIGHT
    
    // Add to consultation blocks
    consultationBlocks.push({
      consultation,
      dayIndex,
      top,
      height,
      startTime,
      endTime
    })
  })
  
  return consultationBlocks
}

const viewConsultation = async (consultation) => {
  // Normalize to prevent runtime errors that can block modal rendering
  const normalized = {
    ...consultation,
    bookings: Array.isArray(consultation.bookings) ? consultation.bookings : [],
    maxStudents: typeof consultation.maxStudents === 'number' && consultation.maxStudents > 0 ? consultation.maxStudents : 5,
    bookedStudents: typeof consultation.bookedStudents === 'number' ? consultation.bookedStudents : 0,
    dayOfWeek: typeof consultation.dayOfWeek === 'number' ? consultation.dayOfWeek : 0
  }
  selectedConsultation.value = normalized
  await nextTick()
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedConsultation.value = null
}

// Accept booking (Booked -> Pending)
const acceptBooking = async (bookingId) => {
  try {
    await api.put(`/consultations/bookings/${bookingId}/status`, {
      status: 'Pending'
    })
    
    notificationService.showSuccess('Booking accepted successfully')
    await loadConsultations()
    
    // Update the selected consultation
    if (selectedConsultation.value) {
      const updatedConsultation = consultations.value.find(c => c._id === selectedConsultation.value._id)
      if (updatedConsultation) {
        selectedConsultation.value = updatedConsultation
        
        // Generate meeting link for virtual meetings
        const acceptedBooking = updatedConsultation.bookings.find(b => b._id === bookingId)
        if (acceptedBooking && acceptedBooking.consultationType === 'chat' && !acceptedBooking.meetingLink) {
          await generateMeetingLink(acceptedBooking)
      }
    }
    }
    
    // Switch to pending tab to see the accepted student
    activeTab.value = 'pending'
  } catch (error) {
    console.error('Error accepting booking:', error)
    const message = error.response?.data?.message || 'Failed to accept booking'
    notificationService.showError(message)
  }
}

// Complete booking (Pending -> Completed)
const completeBooking = async (bookingId) => {
  // Show a prompt for completion notes
  const notes = prompt('Please add completion notes for this consultation:')
  if (notes === null) return // User cancelled
  
  try {
    await api.put(`/consultations/bookings/${bookingId}/status`, {
      status: 'Completed',
      completionNotes: notes || ''
    })
    
    notificationService.showSuccess('Booking completed successfully')
    await loadConsultations()
    
    // Update the selected consultation
    if (selectedConsultation.value) {
      const updatedConsultation = consultations.value.find(c => c._id === selectedConsultation.value._id)
      if (updatedConsultation) {
        selectedConsultation.value = updatedConsultation
      }
    }
    
    // Switch to completed tab to see the completed student
    activeTab.value = 'completed'
  } catch (error) {
    console.error('Error completing booking:', error)
    const message = error.response?.data?.message || 'Failed to complete booking'
    notificationService.showError(message)
  }
}

const cancelBooking = async (bookingId) => {
  if (!confirm('Are you sure you want to cancel this booking? This cannot be undone.')) return
  
  try {
    await api.delete(`/consultations/bookings/${bookingId}/cancel`)
    
    notificationService.showSuccess('Booking cancelled successfully')
    await loadConsultations()
    
    // Update the selected consultation
    if (selectedConsultation.value) {
      const updatedConsultation = consultations.value.find(c => c._id === selectedConsultation.value._id)
      if (updatedConsultation) {
        selectedConsultation.value = updatedConsultation
      }
    }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    const message = error.response?.data?.message || 'Failed to cancel booking'
    notificationService.showError(message)
  }
}

// Legacy function - now handled by Google Calendar API
const generateMeetingLink = async (booking) => {
  // This function is kept for backward compatibility
  // New meetings are created via Google Calendar API in startMeeting()
  if (booking.meetingLink) return booking.meetingLink
  
  console.warn('generateMeetingLink called - meetings should now be created via Calendar API')
  return null
}

// Start meeting for virtual consultation using Google Calendar API
const startMeeting = async (booking) => {
  try {
    console.log('Creating Google Meet via Calendar API for booking:', booking._id)
    
    // Show loading state
    const loadingToast = notificationService.showInfo('Creating Google Meet room...', { duration: 0 })
    
    // Call backend to create Google Meet via Calendar API
    const response = await api.post(`/consultations/bookings/${booking._id}/create-meeting`, {
      consultationTitle: selectedConsultation.value?.title || 'Academic Consultation'
    })
    
    // Clear loading toast
    if (loadingToast && loadingToast.close) {
      loadingToast.close()
    }
    
    const { meetingUrl, eventId, conferenceId } = response.data
    
    console.log('Google Meet created successfully:', meetingUrl)
    
    // Update local booking state
    booking.meetingLink = meetingUrl
    booking.meetingStarted = true
    booking.meetingStartedAt = new Date()
    booking.googleEventId = eventId
    
    // Open meeting for adviser (becomes host by being first to join)
    window.open(meetingUrl, '_blank')
    
    // Notify success
    notificationService.showSuccess('Google Meet created! Students can now join the same room.')
    
    // Refresh consultation data to ensure UI is updated
    await loadConsultations()
    
  } catch (error) {
    console.error('Error creating Google Meet:', error)
    
    // Clear any loading toast
    notificationService.hideAll?.()
    
    // Show specific error message
    const errorMessage = error.response?.data?.message || 'Failed to create Google Meet'
    const errorDetails = error.response?.data?.error
    
    if (errorDetails) {
      console.error('Error details:', errorDetails)
      notificationService.showError(`${errorMessage}: ${errorDetails}`)
    } else {
      notificationService.showError(errorMessage)
    }
    
    // If it's an API configuration issue, provide helpful message
    if (errorMessage.includes('Calendar API') || errorMessage.includes('authentication')) {
      notificationService.showWarning('Please ensure Google Calendar API is enabled in Google Cloud Console')
    }
  }
}

// Join meeting (for already started meetings)
const joinMeeting = async (booking) => {
  try {
    if (!booking.meetingLink) {
      notificationService.showError('Meeting link not available')
      return
    }
    
    window.open(booking.meetingLink, '_blank')
  } catch (error) {
    console.error('Error joining meeting:', error)
    notificationService.showError('Failed to join meeting')
  }
}

// Open meeting link (generate if needed) - Legacy function for backward compatibility
const openMeetingLink = async (booking) => {
  if (booking.meetingStarted) {
    await joinMeeting(booking)
  } else {
    await startMeeting(booking)
  }
}

// Save meeting link to booking
const saveMeetingLink = async (bookingId, meetingLink) => {
  try {
    await api.put(`/consultations/bookings/${bookingId}/meeting-link`, {
      meetingLink
    })
    
    // Update the selected consultation to reflect the new meeting link
    if (selectedConsultation.value) {
      const booking = selectedConsultation.value.bookings.find(b => b._id === bookingId)
      if (booking) {
        booking.meetingLink = meetingLink
      }
    }
    
    // Also update the consultations list
    await loadConsultations()
  } catch (error) {
    console.error('Error saving meeting link:', error)
  }
}

const loadConsultations = async () => {
  try {
    loading.value = true
    console.log('Loading consultations for adviser:', authStore.user._id)
    const response = await api.get(`/consultations/adviser/${authStore.user._id}`)
    console.log('Consultation response:', response.data)
    // Only show accepted/active consultations
    const all = response.data || []
    consultations.value = all.filter(c => (c.status === 'Active' || c.status === 'Inactive') && c.adviserAccepted !== false)
    console.log('Loaded consultations:', consultations.value.length)
  } catch (error) {
    console.error('Error loading consultations:', error)
    notificationService.showError('Failed to load consultation schedule')
  } finally {
    loading.value = false
  }
}

// Weekly navigation
const previousWeek = () => { const d = new Date(currentWeek.value); d.setDate(d.getDate()-7); currentWeek.value = d }
const nextWeek = () => { const d = new Date(currentWeek.value); d.setDate(d.getDate()+7); currentWeek.value = d }
const previousMonth = () => { const d = new Date(currentWeek.value); d.setMonth(d.getMonth()-1); currentWeek.value = d }
const nextMonth = () => { const d = new Date(currentWeek.value); d.setMonth(d.getMonth()+1); currentWeek.value = d }
const goToCurrentWeek = () => { currentWeek.value = new Date() }

// List view data for current week only
const consultationsForList = computed(() => {
  const start = getWeekStart(currentWeek.value)
  const end = getWeekEnd(currentWeek.value)
  return consultations.value.filter(c => {
    if (!c.weekStart || !c.weekEnd) return false
    const cs = new Date(c.weekStart)
    const ce = new Date(c.weekEnd)
    return cs <= end && ce >= start
  })
})

// Student dropdown functions
const toggleStudentDropdown = (consultationId) => {
  expandedStudents.value[consultationId] = !expandedStudents.value[consultationId]
}

// Close dropdown when clicking outside
const closeAllDropdowns = () => {
  expandedStudents.value = {}
}

// Feedback functions
const openFeedbackModal = (booking) => {
  selectedBooking.value = booking
  feedbackForm.value.text = booking.feedback || ''
  showFeedbackModal.value = true
}

const closeFeedbackModal = () => {
  showFeedbackModal.value = false
  selectedBooking.value = null
  feedbackForm.value.text = ''
  feedbackModalMode.value = 'normal'
  submittingFeedback.value = false
}

const submitFeedback = async () => {
  if (!selectedBooking.value || !feedbackForm.value.text.trim()) {
    return
  }
  
  try {
    submittingFeedback.value = true
    
    // If in escalation mode, submit feedback then escalate
    if (feedbackModalMode.value === 'escalation') {
      // First save the feedback
      await api.put(`/consultations/bookings/${selectedBooking.value._id}/feedback`, {
        feedback: feedbackForm.value.text.trim()
      })
      
      // Then escalate
      await api.post(`/consultations/bookings/${selectedBooking.value._id}/escalate`, {
        reason: 'Consultation escalated after feedback review'
      })
      
      notificationService.showSuccess('Feedback saved and consultation escalated to admin successfully')
      
      // Refresh consultations
      await loadConsultations()
      closeFeedbackModal()
      
    } else {
      // Normal feedback submission
      await api.put(`/consultations/bookings/${selectedBooking.value._id}/feedback`, {
        feedback: feedbackForm.value.text.trim()
      })
      
      notificationService.showSuccess('Feedback saved successfully')
      
      // Refresh consultations to get updated data
      await loadConsultations()
      
      // Update the selected consultation if it's open
      if (selectedConsultation.value) {
        const updatedConsultation = consultations.value.find(c => c._id === selectedConsultation.value._id)
        if (updatedConsultation) {
          selectedConsultation.value = updatedConsultation
        }
      }
      
      closeFeedbackModal()
    }
    
  } catch (error) {
    console.error('Error submitting feedback:', error)
    const message = error.response?.data?.message || 'Failed to save feedback'
    notificationService.showError(message)
  } finally {
    submittingFeedback.value = false
  }
}

// Escalation functions
const openEscalationModal = (booking) => {
  selectedBooking.value = booking
  escalationForm.value.reason = ''
  showEscalationModal.value = true
}

const closeEscalationModal = () => {
  showEscalationModal.value = false
  selectedBooking.value = null
  escalationForm.value.reason = ''
  submittingEscalation.value = false
}

const submitEscalation = async () => {
  if (!selectedBooking.value || !escalationForm.value.reason.trim()) {
    return
  }
  
  try {
    submittingEscalation.value = true
    
    await api.post(`/consultations/bookings/${selectedBooking.value._id}/escalate`, {
      reason: escalationForm.value.reason.trim()
    })
    
    notificationService.showSuccess('Consultation escalated to admin successfully')
    
    // Refresh consultations to get updated data
    await loadConsultations()
    
    // Update the selected consultation if it's open
    if (selectedConsultation.value) {
      const updatedConsultation = consultations.value.find(c => c._id === selectedConsultation.value._id)
      if (updatedConsultation) {
        selectedConsultation.value = updatedConsultation
      }
    }
    
    closeEscalationModal()
    
  } catch (error) {
    console.error('Error escalating consultation:', error)
    const message = error.response?.data?.message || 'Failed to escalate consultation'
    notificationService.showError(message)
  } finally {
    submittingEscalation.value = false
  }
}

// Additional feedback functions for escalation
const openFeedbackModalForEscalation = (booking) => {
  selectedBooking.value = booking
  feedbackForm.value.text = booking.feedback || ''
  feedbackModalMode.value = 'escalation'
  showFeedbackModal.value = true
}

// Resolution functions
const openResolutionModal = (booking) => {
  selectedBooking.value = booking
  resolutionForm.value.text = ''
  showResolutionModal.value = true
}

const closeResolutionModal = () => {
  showResolutionModal.value = false
  selectedBooking.value = null
  resolutionForm.value.text = ''
  submittingResolution.value = false
}

const submitResolution = async () => {
  if (!selectedBooking.value || !resolutionForm.value.text.trim()) {
    return
  }
  
  try {
    submittingResolution.value = true
    
    await api.post(`/consultations/bookings/${selectedBooking.value._id}/resolve`, {
      resolution: resolutionForm.value.text.trim()
    })
    
    notificationService.showSuccess('Consultation resolved successfully')
    
    // Refresh consultations to get updated data
    await loadConsultations()
    
    // Update the selected consultation if it's open
    if (selectedConsultation.value) {
      const updatedConsultation = consultations.value.find(c => c._id === selectedConsultation.value._id)
      if (updatedConsultation) {
        selectedConsultation.value = updatedConsultation
      }
    }
    
    closeResolutionModal()
    
  } catch (error) {
    console.error('Error resolving consultation:', error)
    const message = error.response?.data?.message || 'Failed to resolve consultation'
    notificationService.showError(message)
  } finally {
    submittingResolution.value = false
  }
}

// History computed properties and functions
const filteredAdviserHistory = computed(() => {
  let filtered = adviserConsultationHistory.value

  if (historyFilters.yearLevel) {
    filtered = filtered.filter(consultation => {
      const yearLevel = consultation.student.yearLevel || consultation.student.class?.yearLevel
      return yearLevel && yearLevel.toString() === historyFilters.yearLevel.toString()
    })
  }

  if (historyFilters.section) {
    filtered = filtered.filter(consultation => {
      const section = consultation.student.section || consultation.student.class?.section
      return section === historyFilters.section
    })
  }

  if (historyFilters.major) {
    filtered = filtered.filter(consultation => {
      const major = consultation.student.major || consultation.student.class?.major
      return major === historyFilters.major
    })
  }

  if (historyFilters.concern) {
    filtered = filtered.filter(consultation => 
      consultation.concern.toLowerCase().includes(historyFilters.concern.toLowerCase())
    )
  }

  if (historyFilters.dateFrom || historyFilters.dateTo) {
    filtered = filtered.filter(consultation => {
      const consultationDate = new Date(consultation.weekStart)
      consultationDate.setDate(consultationDate.getDate() + consultation.dayOfWeek)
      
      let withinRange = true
      
      if (historyFilters.dateFrom) {
        const fromDate = new Date(historyFilters.dateFrom)
        withinRange = withinRange && consultationDate >= fromDate
      }
      
      if (historyFilters.dateTo) {
        const toDate = new Date(historyFilters.dateTo)
        toDate.setHours(23, 59, 59, 999)
        withinRange = withinRange && consultationDate <= toDate
      }
      
      return withinRange
    })
  }

  return filtered.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
})

const loadAdviserConsultationHistory = async () => {
  try {
    loadingAdviserHistory.value = true
    const response = await api.get('/consultations/adviser-history')
    adviserConsultationHistory.value = response.data || []
  } catch (error) {
    console.error('Error loading adviser consultation history:', error)
    notificationService.showError('Failed to load consultation history')
  } finally {
    loadingAdviserHistory.value = false
  }
}

const clearAdviserHistoryFilters = () => {
  historyFilters.yearLevel = ''
  historyFilters.section = ''
  historyFilters.major = ''
  historyFilters.concern = ''
  historyFilters.dateFrom = ''
  historyFilters.dateTo = ''
}

const formatAdviserConsultationDate = (consultation) => {
  if (consultation.dayOfWeek === undefined) return ''
  const weekStart = new Date(consultation.weekStart)
  const d = new Date(weekStart)
  d.setDate(weekStart.getDate() + Number(consultation.dayOfWeek))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

// Watch for view changes to load history
watch(currentView, (newView) => {
  if (newView === 'history' && adviserConsultationHistory.value.length === 0) {
    loadAdviserConsultationHistory()
  }
})

// Lifecycle
onMounted(async () => {
  // Wait a tick to ensure auth store populated
  if (!authStore?.user?._id) {
    await new Promise(r => setTimeout(r, 100));
  }
  if (authStore?.user?._id) {
    await loadConsultations()
  }
  
  // Add click outside listener to close dropdowns
  document.addEventListener('click', closeAllDropdowns)
})

onUnmounted(() => {
  // Remove click outside listener
  document.removeEventListener('click', closeAllDropdowns)
})
</script> 

<style scoped>
.min-h-80px {
  min-height: 80px;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>