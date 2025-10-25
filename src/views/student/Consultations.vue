<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div>
              <h1 class="text-2xl font-normal text-gray-800">Weekly Consultations Schedule</h1>
              <p class="text-gray-500 font-normal">Book consultations with advisers for academic guidance and support</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-3">
            <!-- View Toggle -->
            <div class="bg-gray-100 p-1 rounded-lg">
            <button
                @click="currentView = 'calendar'"
                :class="[
                    'px-3 py-1.5 rounded-md text-sm font-normal transition-colors',
                  currentView === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
            >
              Calendar View
            </button>
            <button
                @click="currentView = 'list'"
                :class="[
                    'px-3 py-1.5 rounded-md text-sm font-normal transition-colors',
                  currentView === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
            >
              List View
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
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Loading consultations...</span>
      </div>
    </div>
    
    <!-- Calendar View -->
    <div v-else-if="currentView === 'calendar'" class="bg-white rounded-2xl shadow-lg border border-gray-100">
      <!-- Calendar Header with Title, Date, and Navigation -->
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <div>
              <p class="text-md text-gray-800">{{ formatWeekRange(currentWeek) }}</p>
              <p class="text-sm text-gray-500">
                <span v-if="consultationsForWeek.length > 0">
                  {{ consultationsForWeek.length }} consultation{{ consultationsForWeek.length !== 1 ? 's' : '' }} scheduled
                </span>
                <span v-else class="text-gray-400">
                  No scheduled consultations this week yet
                </span>
              </p>
          </div>
        <!-- Legend -->
            <div class="flex items-center space-x-4 text-xs">
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-orange-200 border border-orange-300"></div>
            <span class="text-gray-600">Available</span>
          </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-blue-200 border border-blue-300"></div>
                <span class="text-gray-600">Booked</span>
          </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div>
                <span class="text-gray-600">Pending</span>
          </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-green-200 border border-green-300"></div>
                <span class="text-gray-600">Complete</span>
              </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-gray-200 border border-gray-300"></div>
                <span class="text-gray-600">Inactive</span>
              </div>
            </div>
          </div>
          <div class="inline-flex items-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <button
              @click="previousMonth"
              class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Previous Month"
              title="Previous Month"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button
              @click="previousWeek"
              class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Previous Week"
              title="Previous Week"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button
              @click="goToCurrentWeek"
              class="px-2.5 py-2 text-green-600 hover:text-green-900 hover:bg-green-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              aria-label="Current Week"
              title="Current Week"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button
              @click="nextWeek"
              class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Next Week"
              title="Next Week"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button
              @click="nextMonth"
              class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Next Month"
              title="Next Month"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
          </div>
          
      <!-- Calendar Grid -->
      <div class="p-6">
        <div class="border rounded-lg">
        <!-- Calendar Grid Header -->
        <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
          <div class="py-3 px-2 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
            <div v-for="day in weekDaysWithDates" :key="day.day" 
               class="py-3 px-2 text-gray-500 text-xs font-medium text-center">
              <div class="font-semibold">{{ day.day }}</div>
              <div class="text-gray-400">{{ day.date }}</div>
          </div>
        </div>
        
        <!-- Calendar Grid Body -->
        <div class="relative">
          <div class="divide-y divide-gray-200">
            <div v-for="(timeSlot, index) in formattedTimeSlots" :key="index" class="grid grid-cols-6">
              <!-- Time Label -->
              <div class="py-2 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[50px]">
                <span class="text-center leading-tight">{{ timeSlot }}</span>
              </div>
              
              <!-- Day Columns -->
              <div 
                  v-for="(day, dayIndex) in weekDaysWithDates" 
                  :key="`${day.day}-${index}`"
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
            :class="getConsultationCardClass(consultationBlock.consultation)"
            :style="{
              left: `calc(${consultationBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
              top: `${consultationBlock.top}px`,
              height: `${consultationBlock.height}px`,
              width: 'calc(16.67% - 2px)'
            }"
            @click="selectConsultation(consultationBlock.consultation)"
          >
              <div class="font-medium text-sm truncate p-2 flex justify-between items-center">
                <span>{{ consultationBlock.consultation.adviser.salutation }} {{ consultationBlock.consultation.adviser.firstName }} {{ consultationBlock.consultation.adviser.lastName }}</span>
                <span v-if="isConsultationBooked(consultationBlock.consultation)" 
                      class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-blue-200 text-blue-800': getConsultationBookingStatus(consultationBlock.consultation) === 'Booked',
                        'bg-yellow-200 text-yellow-800': getConsultationBookingStatus(consultationBlock.consultation) === 'Pending',
                        'bg-green-200 text-green-800': getConsultationBookingStatus(consultationBlock.consultation) === 'Completed'
                      }">
                  {{ getConsultationBookingStatus(consultationBlock.consultation) === 'Completed' ? 'Complete' : getConsultationBookingStatus(consultationBlock.consultation) }}
                </span>
              </div>
              <div class="text-xs truncate px-2 pb-2">
                  {{ formatTimeRange(consultationBlock.consultation.startTime, consultationBlock.consultation.endTime) }}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
    <div v-else-if="currentView === 'list'" class="bg-white rounded-2xl shadow-lg border border-gray-100">
      <!-- List Header with Title, Date, and Navigation -->
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <div>
              <p class="text-md text-gray-800">{{ formatWeekRange(currentWeek) }}</p>
              <p class="text-sm text-gray-500">
                <span v-if="consultationsForWeek.length > 0">
                  {{ consultationsForWeek.length }} consultation{{ consultationsForWeek.length !== 1 ? 's' : '' }} scheduled
                </span>
                <span v-else class="text-gray-400">
                  No scheduled consultations this week yet
                </span>
              </p>
            </div>
            <!-- Legend -->
            <div class="flex items-center space-x-4 text-xs">
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-orange-200 border border-orange-300"></div>
                <span class="text-gray-600">Available</span>
              </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-blue-200 border border-blue-300"></div>
                <span class="text-gray-600">Booked</span>
              </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div>
                <span class="text-gray-600">Pending</span>
              </div>
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-green-200 border border-green-300"></div>
                <span class="text-gray-600">Complete</span>
              </div>

              <div class="flex items-center space-x-1">
                <div class="w-3 h-3 rounded bg-gray-200 border border-gray-300"></div>
                <span class="text-gray-600">Inactive</span>
              </div>
            </div>
          </div>
          <div class="inline-flex items-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <button
              @click="previousMonth"
              class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Previous Month"
              title="Previous Month"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button
              @click="previousWeek"
              class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Previous Week"
              title="Previous Week"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button
              @click="goToCurrentWeek"
              class="px-2.5 py-2 text-green-600 hover:text-green-900 hover:bg-green-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              aria-label="Current Week"
              title="Current Week"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div class="h-5 w-px bg-gray-200"></div>
            <button
              @click="nextWeek"
              class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Next Week"
              title="Next Week"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div class="h-5 w-px bg-gray-200"></div>
                  <button
              @click="nextMonth"
              class="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Next Month"
              title="Next Month"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
        
      <!-- List Content -->
      <div class="p-6">
        <div class="border rounded-lg">
          <div v-if="consultationsForWeek.length > 0" class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6">
                    Adviser
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Day
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Time
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Duration
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Available Slots
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
              </tr>
            </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="consultation in consultationsForWeek" :key="consultation._id" class="hover:bg-gray-50">
                  <!-- Adviser Column -->
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">
                            {{ consultation.adviser.firstName?.charAt(0) }}{{ consultation.adviser.lastName?.charAt(0) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ consultation.adviser.salutation }} {{ consultation.adviser.firstName }} {{ consultation.adviser.lastName }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ consultation.adviser.email }}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <!-- Day Column -->
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div class="text-sm text-gray-900">
                      {{ weekDays[consultation.dayOfWeek] }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ formatConsultationDate(consultation) }}
                    </div>
                  </td>
                  
                  <!-- Time Column -->
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div class="text-sm text-gray-900">
                      {{ formatTimeRange(consultation.startTime, consultation.endTime) }}
                    </div>
                  </td>
                  
                  <!-- Duration Column -->
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div class="text-sm text-gray-900">
                      {{ consultation.duration }} hours
                    </div>
                  </td>
                  
                  <!-- Available Slots Column -->
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div class="text-sm text-gray-900">
                      {{ consultation.maxStudents - (consultation.bookedStudents || 0) }} / {{ consultation.maxStudents }}
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div class="bg-green-600 h-2 rounded-full" 
                           :style="{ width: `${((consultation.maxStudents - (consultation.bookedStudents || 0)) / consultation.maxStudents) * 100}%` }">
                      </div>
                    </div>
                  </td>
                  
                  <!-- Status Column -->
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                          :class="{
                            'bg-green-100 text-green-800': consultation.status === 'Active',
                            'bg-gray-100 text-gray-800': consultation.status === 'Inactive',
                            'bg-yellow-100 text-yellow-800': consultation.status === 'Pending_Adviser_Acceptance'
                          }">
                      {{ consultation.status === 'Active' ? 'Available' : 
                         consultation.status === 'Inactive' ? 'Inactive' : 
                         consultation.status === 'Pending_Adviser_Acceptance' ? 'Pending' : 
                         consultation.status }}
                    </span>
                  </td>
                  
                  <!-- Actions Column -->
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button
                      v-if="isConsultationBooked(consultation)"
                      @click="selectConsultation(consultation)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      View Consultation Status
                    </button>
                    <button
                      v-else-if="consultation.status === 'Active'"
                      @click="selectConsultation(consultation)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Book Consultation
                    </button>
                    <span v-else-if="consultation.status === 'Inactive'" class="text-xs text-gray-400 italic">
                      Consultation ended
                    </span>
                    <span v-else class="text-xs text-gray-400 italic">
                      Not available
                    </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
          <div v-else class="p-8 text-center">
            <div class="text-gray-400 mb-4">
              <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No consultations available</h3>
            <p class="text-gray-500">There are no consultation schedules for this week yet.</p>
          </div>
        </div>
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
            <select v-model="historyFilters.adviser" class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">All Advisers</option>
              <option v-for="adviser in availableAdvisers" :key="adviser._id" :value="adviser._id">
                {{ adviser.salutation }} {{ adviser.firstName }} {{ adviser.lastName }}
              </option>
            </select>
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
              @click="clearHistoryFilters"
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      <!-- History Content -->
      <div class="p-6">
        <div v-if="loadingHistory" class="text-center py-12">
          <div class="inline-flex items-center">
            <svg class="animate-spin h-5 w-5 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
            Loading consultation history...
      </div>
    </div>
    
        <div v-else-if="filteredHistory.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No consultation history</h3>
          <p class="text-gray-500">You haven't completed any consultations yet.</p>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="consultation in filteredHistory" :key="consultation._id" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ consultation.adviser.salutation }} {{ consultation.adviser.firstName }} {{ consultation.adviser.lastName }}
                  </h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-gray-700">Date:</span>
                    <p class="text-gray-600">{{ formatConsultationDate(consultation) }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Time:</span>
                    <p class="text-gray-600">{{ formatTimeRange(consultation.startTime, consultation.endTime) }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Type:</span>
                    <p class="text-gray-600">{{ consultation.consultationType === 'chat' ? 'Virtual' : 'In-Person' }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Concern:</span>
                    <p class="text-gray-600">{{ consultation.concern }}</p>
                  </div>
                  <div v-if="consultation.completionNotes">
                    <span class="font-medium text-gray-700">Adviser Notes:</span>
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
    
    <!-- Booking Modal -->
    <Teleport to="body">
      <div v-if="showBookingModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeBookingModal">
        <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-green-600">Book Consultation</h2>
            <button @click="closeBookingModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedConsultation && !selectedBooking">
          <!-- Consultation Info -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 class="font-semibold text-lg text-gray-900 mb-2">
                {{ selectedConsultation.adviser.salutation }} {{ selectedConsultation.adviser.firstName }} {{ selectedConsultation.adviser.lastName }}
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Day:</span>
                <p class="text-gray-600">{{ weekDays[selectedConsultation.dayOfWeek] }}</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">Time:</span>
                <p class="text-gray-600">{{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">Duration:</span>
                <p class="text-gray-600">{{ selectedConsultation.duration }} hours</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">Available slots:</span>
                <p class="text-gray-600">{{ selectedConsultation.maxStudents - (selectedConsultation.bookedStudents || 0) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Booking Form -->
          <form @submit.prevent="bookConsultation" class="space-y-6">
            <!-- Concern Selection -->
            <div>
              <label for="concern" class="block text-sm font-medium text-gray-700 mb-2">
                What is your consultation concern? *
              </label>
              <select
                id="concern"
                v-model="bookingForm.concern"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">Please select your concern</option>
                <option v-for="concern in consultationConcerns" :key="concern" :value="concern">
                  {{ concern }}
                </option>
              </select>
            </div>
              
              <!-- Meeting Type Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Type *
                </label>
                <div class="grid grid-cols-2 gap-4">
                  <label class="relative cursor-pointer">
                    <input
                      type="radio"
                      v-model="bookingForm.meetingType"
                      value="in-person"
                      class="sr-only"
                    />
                    <div class="p-4 border-2 rounded-lg transition-all"
                         :class="bookingForm.meetingType === 'in-person' 
                           ? 'border-green-500 bg-green-50' 
                           : 'border-gray-300 hover:border-gray-400'">
                      <div class="flex items-center">
                        <div class="flex-shrink-0">
                          <svg class="h-6 w-6" :class="bookingForm.meetingType === 'in-person' ? 'text-green-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium" :class="bookingForm.meetingType === 'in-person' ? 'text-green-900' : 'text-gray-900'">
                            In-Person Meeting
                          </p>
                          <p class="text-xs" :class="bookingForm.meetingType === 'in-person' ? 'text-green-700' : 'text-gray-500'">
                            Physical meeting with adviser
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  <label class="relative cursor-pointer">
                    <input
                      type="radio"
                      v-model="bookingForm.meetingType"
                      value="virtual"
                      class="sr-only"
                    />
                    <div class="p-4 border-2 rounded-lg transition-all"
                         :class="bookingForm.meetingType === 'virtual' 
                           ? 'border-green-500 bg-green-50' 
                           : 'border-gray-300 hover:border-gray-400'">
                      <div class="flex items-center">
                        <div class="flex-shrink-0">
                          <svg class="h-6 w-6" :class="bookingForm.meetingType === 'virtual' ? 'text-green-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium" :class="bookingForm.meetingType === 'virtual' ? 'text-green-900' : 'text-gray-900'">
                            Virtual Meeting
                          </p>
                          <p class="text-xs" :class="bookingForm.meetingType === 'virtual' ? 'text-green-700' : 'text-gray-500'">
                            Virtual Meeting
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
            </div>
            
            <!-- Additional Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                v-model="bookingForm.notes"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                placeholder="Please provide any additional details about your consultation needs..."
              ></textarea>
            </div>
            
            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="closeBookingModal"
                class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                  :disabled="booking || !bookingForm.concern || !bookingForm.meetingType"
                class="px-6 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
              >
                {{ booking ? 'Booking...' : 'Book Consultation' }}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Status Modal -->
    <Teleport to="body">
      <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeStatusModal">
        <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-blue-600">Consultation Status</h2>
            <button @click="closeStatusModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
    </div>
          
          <div v-if="selectedConsultation && selectedBooking">
            <!-- Consultation Info -->
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-lg text-gray-900">
                    {{ selectedConsultation.adviser.salutation }} {{ selectedConsultation.adviser.firstName }} {{ selectedConsultation.adviser.lastName }}
                  </h4>
                  <p class="text-sm text-gray-600">{{ formatWeekDayDate(selectedConsultation) }}</p>
  </div>
                <div>
                  <span class="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                        :class="{
                          'bg-blue-100 text-blue-800': selectedBooking.status === 'Booked',
                          'bg-yellow-100 text-yellow-800': selectedBooking.status === 'Pending',
                          'bg-green-100 text-green-800': selectedBooking.status === 'Completed'
                        }">
                    {{ selectedBooking.status }}
                  </span>
                </div>
              </div>
              
              <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-700">Time:</span>
                  <p class="text-gray-600">{{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Meeting Type:</span>
                  <p class="text-gray-600">{{ selectedBooking.consultationType === 'chat' ? 'Virtual' : 'In-Person' }}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Concern:</span>
                  <p class="text-gray-600">{{ selectedBooking.concern }}</p>
                </div>
              </div>
              
              <!-- Meeting Instructions -->
              <div v-if="selectedBooking.status === 'Pending'" class="mt-4 p-3 rounded-lg"
                   :class="selectedBooking.consultationType === 'chat' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'">
                <h5 class="font-medium text-sm mb-1"
                    :class="selectedBooking.consultationType === 'chat' ? 'text-blue-800' : 'text-green-800'">
                  Meeting Instructions
                </h5>
                <p class="text-sm" :class="selectedBooking.consultationType === 'chat' ? 'text-blue-700' : 'text-green-700'">
                  <template v-if="selectedBooking.consultationType === 'chat'">
                    <span v-if="selectedBooking.meetingLink">
                      Join your virtual meeting at your scheduled time using 
                      <a :href="selectedBooking.meetingLink" target="_blank" class="font-medium underline">this Google Meet link</a>.
                    </span>
                    <span v-else>
                      A Google Meet link will be provided when your consultation is ready.
                    </span>
                  </template>
                  <template v-else>
                    Please go to the faculty room at your scheduled time for your in-person consultation.
                  </template>
                </p>
              </div>
              
              <!-- Notes -->
              <div v-if="selectedBooking.notes" class="mt-4">
                <span class="font-medium text-gray-700">Your Notes:</span>
                <p class="text-gray-600 text-sm">{{ selectedBooking.notes }}</p>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                v-if="selectedBooking.status !== 'Completed'"
                type="button"
                @click="cancelBooking"
                :disabled="cancelling"
                class="px-6 py-3 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
              >
                {{ cancelling ? 'Cancelling...' : 'Cancel Booking' }}
              </button>
              <button
                type="button"
                @click="closeStatusModal"
                class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          
          <div v-if="selectedConsultation && !selectedBooking">
          <!-- Consultation Info -->
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 class="font-semibold text-lg text-gray-900 mb-2">
              {{ selectedConsultation.adviser.salutation }} {{ selectedConsultation.adviser.firstName }} {{ selectedConsultation.adviser.lastName }}
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Day:</span>
                <p class="text-gray-600">{{ weekDays[selectedConsultation.dayOfWeek] }}</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">Time:</span>
                <p class="text-gray-600">{{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">Duration:</span>
                <p class="text-gray-600">{{ selectedConsultation.duration }} hours</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">Available slots:</span>
                <p class="text-gray-600">{{ selectedConsultation.maxStudents - (selectedConsultation.bookedStudents || 0) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Booking Form -->
          <form @submit.prevent="bookConsultation" class="space-y-6">
            <!-- Concern Selection -->
            <div>
              <label for="concern" class="block text-sm font-medium text-gray-700 mb-2">
                What is your consultation concern? *
              </label>
              <select
                id="concern"
                v-model="bookingForm.concern"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">Please select your concern</option>
                <option v-for="concern in consultationConcerns" :key="concern" :value="concern">
                  {{ concern }}
                </option>
              </select>
            </div>
            
            <!-- Meeting Type Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type *
              </label>
              <div class="grid grid-cols-2 gap-4">
                <label class="relative cursor-pointer">
                  <input
                    type="radio"
                    v-model="bookingForm.meetingType"
                    value="in-person"
                    class="sr-only"
                  />
                  <div class="p-4 border-2 rounded-lg transition-all"
                       :class="bookingForm.meetingType === 'in-person' 
                         ? 'border-green-500 bg-green-50' 
                         : 'border-gray-300 hover:border-gray-400'">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="h-6 w-6" :class="bookingForm.meetingType === 'in-person' ? 'text-green-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium" :class="bookingForm.meetingType === 'in-person' ? 'text-green-900' : 'text-gray-900'">
                          In-Person Meeting
                        </p>
                        <p class="text-xs" :class="bookingForm.meetingType === 'in-person' ? 'text-green-700' : 'text-gray-500'">
                          Physical meeting with adviser
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
                
                <label class="relative cursor-pointer">
                  <input
                    type="radio"
                    v-model="bookingForm.meetingType"
                    value="virtual"
                    class="sr-only"
                  />
                  <div class="p-4 border-2 rounded-lg transition-all"
                       :class="bookingForm.meetingType === 'virtual' 
                         ? 'border-green-500 bg-green-50' 
                         : 'border-gray-300 hover:border-gray-400'">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="h-6 w-6" :class="bookingForm.meetingType === 'virtual' ? 'text-green-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium" :class="bookingForm.meetingType === 'virtual' ? 'text-green-900' : 'text-gray-900'">
                          Virtual Meeting
                        </p>
                        <p class="text-xs" :class="bookingForm.meetingType === 'virtual' ? 'text-green-700' : 'text-gray-500'">
                          Google Meet video call
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            <!-- Additional Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                v-model="bookingForm.notes"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                placeholder="Please provide any additional details about your consultation needs..."
              ></textarea>
            </div>
            
            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="closeBookingModal"
                class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="booking || !bookingForm.concern || !bookingForm.meetingType"
                class="px-6 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
              >
                {{ booking ? 'Booking...' : 'Book Consultation' }}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Status Modal -->
    <Teleport to="body">
      <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeStatusModal">
        <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-blue-600">Consultation Status</h2>
            <button @click="closeStatusModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedConsultation && selectedBooking">
            <!-- Consultation Info -->
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-lg text-gray-900">
                    {{ selectedConsultation.adviser.salutation }} {{ selectedConsultation.adviser.firstName }} {{ selectedConsultation.adviser.lastName }}
                  </h4>
                  <p class="text-sm text-gray-600">{{ formatWeekDayDate(selectedConsultation) }}</p>
                </div>
                <div>
                  <span class="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                        :class="{
                          'bg-blue-100 text-blue-800': selectedBooking.status === 'Booked',
                          'bg-yellow-100 text-yellow-800': selectedBooking.status === 'Pending',
                          'bg-green-100 text-green-800': selectedBooking.status === 'Completed'
                        }">
                    {{ selectedBooking.status }}
                  </span>
                </div>
              </div>
              
              <!-- Basic Information (Always shown) -->
              <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-700">Time:</span>
                  <p class="text-gray-600">{{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Meeting Type:</span>
                  <p class="text-gray-600">{{ selectedBooking.consultationType === 'chat' ? 'Virtual' : 'In-Person' }}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Concern:</span>
                  <p class="text-gray-600">{{ selectedBooking.concern }}</p>
                </div>
              </div>
              
              <!-- Status-specific content -->
              
              <!-- BOOKED Status: Just show basic info and waiting message -->
              <div v-if="selectedBooking.status === 'Booked'" class="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <h5 class="font-medium text-sm mb-1 text-blue-800">
                  Waiting for Adviser Approval
                </h5>
                <p class="text-sm text-blue-700">
                  Your consultation booking is waiting for approval from your adviser. You will be notified once it's accepted.
                </p>
              </div>
              
              <!-- PENDING Status: Show meeting instructions -->
              <div v-if="selectedBooking.status === 'Pending'" class="mt-4 p-3 rounded-lg"
                   :class="selectedBooking.consultationType === 'chat' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'">
                <h5 class="font-medium text-sm mb-1"
                    :class="selectedBooking.consultationType === 'chat' ? 'text-blue-800' : 'text-green-800'">
                  Meeting Instructions
                </h5>
                
                <!-- Virtual Meeting Instructions -->
                <div v-if="selectedBooking.consultationType === 'chat'">
                  <!-- If adviser hasn't started meeting yet -->
                  <div v-if="!selectedBooking.meetingStarted" class="waiting-state">
                    <p class="text-sm text-blue-700 mb-2">
                      🕐 Your adviser will start the meeting at your scheduled time. 
                      Please wait for the meeting to become available.
                    </p>
                    <div class="flex items-center mt-2 p-2 bg-blue-100 rounded-md">
                      <div class="flex items-center">
                        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                        <span class="text-sm text-blue-700">Waiting for adviser to start meeting...</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- If adviser has started meeting -->
                  <div v-else class="meeting-ready">
                    <p class="text-sm text-green-700 mb-2">
                      ✅ Your adviser has started the meeting! You can now join.
                    </p>
                    <a 
                      :href="selectedBooking.meetingLink" 
                      target="_blank" 
                      class="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                      </svg>
                      Join Meeting Room
                    </a>
                    <p class="text-xs text-gray-600 mt-2">
                      Started at: {{ formatDateTime(selectedBooking.meetingStartedAt) }}
                    </p>
                  </div>
                </div>
                
                <!-- In-Person Meeting Instructions -->
                <div v-else>
                  <p class="text-sm text-green-700">
                    Please go to the faculty room at your scheduled time for your in-person consultation.
                  </p>
                </div>
              </div>
              
                <!-- COMPLETED Status: Show completion message -->
                <div v-if="selectedBooking.status === 'Completed'" class="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                  <h5 class="font-medium text-sm mb-1 text-green-800">
                    Consultation Completed
                  </h5>
                  <p class="text-sm text-green-700">
                    Your consultation has been completed successfully. Thank you for participating!
                  </p>
                  <div v-if="selectedBooking.completionNotes" class="mt-3 p-2 bg-white rounded border border-green-300">
                    <h6 class="font-medium text-xs text-green-800 mb-1">Adviser Notes:</h6>
                    <p class="text-sm text-green-700">{{ selectedBooking.completionNotes }}</p>
                  </div>
                </div>
              
              <!-- Notes (Always shown if available) -->
              <div v-if="selectedBooking.notes" class="mt-4">
                <span class="font-medium text-gray-700">Your Notes:</span>
                <p class="text-gray-600 text-sm">{{ selectedBooking.notes }}</p>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                v-if="selectedBooking.status === 'Booked' || selectedBooking.status === 'Pending'"
                type="button"
                @click="cancelBooking"
                :disabled="cancelling"
                class="px-6 py-3 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
              >
                {{ cancelling ? 'Cancelling...' : 'Cancel Booking' }}
              </button>
              <button
                type="button"
                @click="closeStatusModal"
                class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, Teleport } from 'vue'
import { notificationService } from '../../services/notificationService'
import { useAuthStore } from '../../stores/authStore'
import api from '../../services/api'

const authStore = useAuthStore()

// Reactive data
const loading = ref(false)
const booking = ref(false)
const consultations = ref([])
const myBookings = ref([])
const showBookingModal = ref(false)
const showStatusModal = ref(false)
const selectedConsultation = ref(null)
const selectedBooking = ref(null)
const cancelling = ref(false)
const currentView = ref('calendar')
const currentWeek = ref(new Date())

// History data
const consultationHistory = ref([])
const loadingHistory = ref(false)
const availableAdvisers = ref([])
const historyFilters = reactive({
  adviser: '',
  dateFrom: '',
  dateTo: ''
})

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

// Consultation concerns
const consultationConcerns = [
  'Academic Performance and Grades',
  'Career Planning and Future Goals',
  'Time Management and Workload',
  'Financial Concerns',
  'Mental Health and Personal Well-being',
  'Other'
]

// Booking form
const bookingForm = ref({
  concern: '',
  notes: '',
  meetingType: 'in-person' // Default to in-person
})

// Methods
const formatTime = (hour) => {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${ampm}`
}

const formatTimeRange = (startTime, endTime) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

const formatConsultationDate = (consultation) => {
  if (consultation.dayOfWeek === undefined) return ''
  // Use the current week being viewed instead of the consultation's original weekStart
  const currentWeekStart = getWeekStart(currentWeek.value)
  const d = new Date(currentWeekStart)
  d.setDate(currentWeekStart.getDate() + Number(consultation.dayOfWeek))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatWeekDayDate = (consultation) => {
  if (consultation.dayOfWeek === undefined) return ''
  const day = weekDays[consultation.dayOfWeek]
  const date = formatConsultationDate(consultation)
  return `${day}, ${date}`
}

const getWeekStart = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

const getWeekEnd = (date) => {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 4) // Friday
  return weekEnd
}

const formatWeekRange = (date) => {
  const weekStart = getWeekStart(date)
  const weekEnd = getWeekEnd(date)
  return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

const weekDaysWithDates = computed(() => {
  const weekStart = getWeekStart(currentWeek.value)
  return weekDays.map((day, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)
    return {
      day,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  })
})

const getPositionedConsultationBlocks = () => {
  const blocks = []
  const timeSlotHeight = 50 // Height of each time slot in pixels
  
  // Ensure consultationsForWeek is an array
  if (!Array.isArray(consultationsForWeek.value)) {
    console.log('consultationsForWeek is not an array:', consultationsForWeek.value)
    return blocks
  }
  
  consultationsForWeek.value.forEach(consultation => {
    const dayIndex = consultation.dayOfWeek
    const startHour = consultation.startTime
    const endHour = consultation.endTime
    
    // Calculate position
    const top = (startHour - 7) * timeSlotHeight
    const height = (endHour - startHour) * timeSlotHeight
    
    blocks.push({
      consultation,
      dayIndex,
      top,
      height
    })
  })
  
  return blocks
}

// Check if the student has booked this consultation
const isConsultationBooked = (consultation) => {
  return myBookings.value.some(booking => 
    booking.consultation && booking.consultation._id === consultation._id
  )
}

const getConsultationBookingStatus = (consultation) => {
  const booking = myBookings.value.find(booking => 
    booking.consultation && booking.consultation._id === consultation._id
  )
  return booking ? booking.status : null
}

const getConsultationCardClass = (consultation) => {
  // Handle inactive consultations
  if (consultation.status === 'Inactive') {
    return 'bg-gray-100 border-gray-300 text-gray-600'
  }
  
  // Check if the student has booked this consultation
  if (isConsultationBooked(consultation)) {
    const status = getConsultationBookingStatus(consultation)
    if (status === 'Completed') {
      return 'bg-green-100 border-green-300 text-green-800'
    } else if (status === 'Pending') {
      return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    } else {
      return 'bg-blue-100 border-blue-300 text-blue-800'
    }
  }
  
  const availableSlots = consultation.maxStudents - (consultation.bookedStudents || 0)
  
  if (availableSlots === 0) {
    return 'bg-red-100 border-red-300 text-red-800' // Full consultations in red
  } else {
    return 'bg-orange-100 border-orange-300 text-orange-800' // Available consultations in orange
  }
}

const selectConsultation = (consultation) => {
  // Don't allow booking inactive consultations
  if (consultation.status === 'Inactive') {
    notificationService.showWarning('This consultation is no longer available for booking')
    return
  }
  
  // Check if the student has already booked this consultation
  if (isConsultationBooked(consultation)) {
    // Show status modal instead of booking modal
    selectedConsultation.value = consultation
    showStatusModal.value = true
    
    // Find the booking details for this consultation
    const booking = myBookings.value.find(b => 
      b.consultation && b.consultation._id === consultation._id
    )
    selectedBooking.value = booking
    return
  }
  
  // Otherwise show booking modal
  selectedConsultation.value = consultation
  showBookingModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedConsultation.value = null
  bookingForm.value = {
    concern: '',
    notes: '',
    meetingType: 'in-person'
  }
}

const closeStatusModal = () => {
  showStatusModal.value = false
  selectedConsultation.value = null
  selectedBooking.value = null
}

const bookConsultation = async () => {
  if (!selectedConsultation.value) return
  
    booking.value = true
    
  try {
    const response = await api.post(`/consultations/${selectedConsultation.value._id}/book`, {
      concern: bookingForm.value.concern,
      notes: bookingForm.value.notes,
      meetingType: bookingForm.value.meetingType
    })
    
    notificationService.showSuccess('Consultation booked successfully!')
    closeBookingModal()
    await loadMyBookings(true) // Silent reload to avoid error notifications
    await loadConsultations()
  } catch (error) {
    console.error('Booking error:', error)
    
    // Show specific error message from backend as warning (yellow) instead of error (red)
    const errorMessage = error.response?.data?.message || 'Failed to book consultation'
    notificationService.showWarning(errorMessage)
  } finally {
    booking.value = false
  }
}

const cancelBooking = async () => {
  if (!selectedBooking.value || !selectedConsultation.value) return
  
  cancelling.value = true
  
  try {
    await api.delete(`/consultations/${selectedConsultation.value._id}/bookings/${selectedBooking.value._id}`)
    
    notificationService.showSuccess('Booking cancelled successfully!')
    closeStatusModal()
    await loadMyBookings(true) // Silent reload to avoid error notifications
    await loadConsultations()
  } catch (error) {
    console.error('Cancellation error:', error)
    notificationService.showError('Failed to cancel booking')
  } finally {
    cancelling.value = false
  }
}

const loadMyBookings = async (silent = false) => {
  try {
    console.log('Loading student bookings in consultations page...')
    
    // Try the main endpoint first
    let response
    try {
      response = await api.get('/consultations/my-bookings')
      console.log('Main endpoint response:', response.data)
    } catch (mainError) {
      console.error('Main endpoint failed:', mainError)
      
      // Try the alternative endpoint
      console.log('Trying alternative endpoint...')
      response = await api.get('/consultations/my-bookings-alt')
      console.log('Alternative endpoint response:', response.data)
    }
    
    myBookings.value = response.data || []
    console.log('My bookings loaded:', myBookings.value)
  } catch (error) {
    console.error('Error loading my bookings:', error)
    // Only show error notification if not silent
    if (!silent) {
    notificationService.showError('Failed to load your bookings')
    }
  }
}

// Week navigation functions
const previousWeek = () => {
  const newWeek = new Date(currentWeek.value)
  newWeek.setDate(newWeek.getDate() - 7)
  currentWeek.value = newWeek
}

const nextWeek = () => {
  const newWeek = new Date(currentWeek.value)
  newWeek.setDate(newWeek.getDate() + 7)
  currentWeek.value = newWeek
}

const goToCurrentWeek = () => {
  currentWeek.value = new Date()
}

const previousMonth = () => {
  const newWeek = new Date(currentWeek.value)
  newWeek.setMonth(newWeek.getMonth() - 1)
  currentWeek.value = newWeek
}

const nextMonth = () => {
  const newWeek = new Date(currentWeek.value)
  newWeek.setMonth(newWeek.getMonth() + 1)
  currentWeek.value = newWeek
}

const loadConsultations = async () => {
  try {
    loading.value = true
    console.log('Loading consultations for student...')
    console.log('API base URL:', api.defaults.baseURL)
    console.log('Auth token:', localStorage.getItem('token'))
    
    // Get all available consultations for students
    const response = await api.get('/consultations/available/all')
    console.log('Consultations response:', response.data)
    console.log('Response status:', response.status)
    consultations.value = response.data || []
    console.log('Loaded consultations:', consultations.value.length)
    
    if (consultations.value.length === 0) {
      console.log('No consultations found - this might be normal if no consultations are scheduled')
    }
  } catch (error) {
    console.error('Error loading consultations:', error)
    console.error('Error details:', error.response?.data || error.message)
    notificationService.showError('Failed to load consultations')
  } finally {
    loading.value = false
  }
}

// Filter consultations for current week only
const consultationsForWeek = computed(() => {
  const start = getWeekStart(currentWeek.value)
  const end = getWeekEnd(currentWeek.value)
  console.log('Filtering consultations for week:', start, 'to', end)
  console.log('Total consultations:', consultations.value.length)
  const filtered = consultations.value.filter(c => {
    if (!c.weekStart || !c.weekEnd) return false
    const cs = new Date(c.weekStart)
    const ce = new Date(c.weekEnd)
    return cs <= end && ce >= start
  })
  console.log('Filtered consultations for week:', filtered.length)
  return filtered
})

// History computed properties
const filteredHistory = computed(() => {
  let filtered = consultationHistory.value

  if (historyFilters.adviser) {
    filtered = filtered.filter(consultation => 
      consultation.adviser._id === historyFilters.adviser
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
        toDate.setHours(23, 59, 59, 999) // Include the entire end date
        withinRange = withinRange && consultationDate <= toDate
      }
      
      return withinRange
    })
  }

  return filtered.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
})

// History functions
const loadConsultationHistory = async () => {
  try {
    loadingHistory.value = true
    const response = await api.get('/consultations/my-history')
    consultationHistory.value = response.data || []
    
    // Extract unique advisers for filter
    const advisers = new Map()
    consultationHistory.value.forEach(consultation => {
      if (consultation.adviser) {
        advisers.set(consultation.adviser._id, consultation.adviser)
      }
    })
    availableAdvisers.value = Array.from(advisers.values())
  } catch (error) {
    console.error('Error loading consultation history:', error)
    notificationService.showError('Failed to load consultation history')
  } finally {
    loadingHistory.value = false
  }
}

const clearHistoryFilters = () => {
  historyFilters.adviser = ''
  historyFilters.dateFrom = ''
  historyFilters.dateTo = ''
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

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return 'Invalid Time'
  }
}


// Real-time meeting status checking
let meetingStatusInterval = null

const checkMeetingStatus = async () => {
  if (selectedBooking.value && 
      selectedBooking.value.consultationType === 'chat' && 
      selectedBooking.value.status === 'Pending' &&
      !selectedBooking.value.meetingStarted) {
    
    try {
      const response = await api.get(`/consultations/bookings/${selectedBooking.value._id}/status`)
      if (response.data.meetingStarted && !selectedBooking.value.meetingStarted) {
        // Meeting just started! Update UI
        selectedBooking.value.meetingStarted = true
        selectedBooking.value.meetingStartedAt = response.data.meetingStartedAt
        notificationService.showSuccess('Your adviser has started the meeting! You can now join.')
      }
    } catch (error) {
      console.error('Error checking meeting status:', error)
    }
  }
}

// Watch for selectedBooking changes to start/stop polling
watch(selectedBooking, (newBooking) => {
  // Clear existing interval
  if (meetingStatusInterval) {
    clearInterval(meetingStatusInterval)
    meetingStatusInterval = null
  }
  
  // Start polling if student is waiting for virtual meeting
  if (newBooking && 
      newBooking.consultationType === 'chat' && 
      newBooking.status === 'Pending' && 
      !newBooking.meetingStarted) {
    meetingStatusInterval = setInterval(checkMeetingStatus, 10000) // Poll every 10 seconds
  }
})

// Watch for view changes to load history
watch(currentView, (newView) => {
  if (newView === 'history' && consultationHistory.value.length === 0) {
    loadConsultationHistory()
  }
})

// Cleanup interval on component unmount
onUnmounted(() => {
  if (meetingStatusInterval) {
    clearInterval(meetingStatusInterval)
  }
})

// Lifecycle
onMounted(async () => {
  console.log('Student consultation page mounted')
  await loadConsultations()
  await loadMyBookings()
})
</script>

<style scoped>
.min-h-80px {
  min-height: 80px;
}
</style> 