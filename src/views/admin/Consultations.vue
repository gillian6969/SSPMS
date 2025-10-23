<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div>
              <h1 class="text-2xl font-normal text-gray-800">Consultation Management</h1>
              <p class="text-gray-500 font-normal">Manage consultation schedules for advisers and students</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
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
          
          <div class="flex items-center space-x-3">
            <!-- Copy Schedule Button -->
          <button
          v-if="!isCurrentWeekInPast"
          @click="openCopyScheduleModal"
          :disabled="!isCurrentWeekEmpty"
          :class="[
            'inline-flex items-center px-3 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
            !isCurrentWeekEmpty
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : 'text-white bg-green-600 hover:bg-green-700'
          ]"
        >
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
            
            <!-- Tooltip for disabled state -->
            <div v-if="!isCurrentWeekEmpty" class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Cannot copy schedule - this week already has consultations
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
            
            <!-- Add Schedule Button -->
            <div class="relative">
              <button
                @click="!isCurrentWeekInPast && (showAddModal = true)"
                :disabled="isCurrentWeekInPast"
                :class="[
                  'inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
                  isCurrentWeekInPast 
                    ? 'text-gray-400 bg-gray-300 cursor-not-allowed' 
                    : 'text-white bg-green-600 hover:bg-green-700'
                ]"
          >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Consultation Schedule
          </button>
              
              <!-- Tooltip for disabled state -->
              <div v-if="isCurrentWeekInPast" class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Cannot schedule consultations for past weeks
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
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
            <p class="text-md text-gray-800">{{ formatWeekRange(currentWeek) }}</p>
            <!-- Legend beside date -->
            <div class="hidden md:flex items-center space-x-4 text-sm">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
                <span class="text-gray-600">Active</span>
          </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
                <span class="text-gray-600">Pending Acceptance</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-blue-200 border border-blue-300 rounded"></div>
                <span class="text-gray-600">Pending Reschedule Approval</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
                <span class="text-gray-600">Pending Schedule Removal</span>
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
            <div v-for="(day, index) in weekDaysWithDates" :key="index" 
                 class="py-3 px-2 text-gray-500 text-xs font-medium text-center">
              <div class="font-semibold">{{ day.name }}</div>
              <div class="text-gray-400">{{ day.date }}</div>
            </div>
          </div>
          
          <!-- Calendar Grid Body -->
          <div class="relative max-h-[600px] overflow-y-auto">
            <div class="divide-y divide-gray-200">
              <div v-for="(timeSlot, index) in timeSlots" :key="index" class="grid grid-cols-6">
                <!-- Time Label -->
                <div class="py-2 px-1 text-xs font-normal text-gray-700 bg-gray-50 border-r border-gray-200 flex items-center justify-center min-h-[50px]">
                  <span class="text-center leading-tight">{{ timeSlot }}</span>
            </div>
            
            <!-- Day Columns -->
            <div 
              v-for="(day, dayIndex) in weekDays" 
                  :key="`${day}-${index}`"
                  :class="[
                    'relative p-0 min-h-[50px] border-r border-gray-100 transition-colors',
                    isCurrentWeekInPast || isDayInPast(dayIndex)
                      ? 'bg-gray-50 cursor-not-allowed opacity-60' 
                      : 'hover:bg-gray-50 cursor-pointer'
                  ]"
                  @click="selectTimeSlot(dayIndex, index)"
                >
                  <!-- Add button for empty slots -->
                  <div 
                    v-if="getConsultationsForSlotAndDay(dayIndex, index).length === 0 && !isCurrentWeekInPast && !isDayInPast(dayIndex)"
                    class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    @click="openAddModalForSlot(dayIndex, index)"
                  >
                    <div class="bg-gray-200 hover:bg-blue-100 rounded-full p-1.5 transition-colors">
                      <svg class="h-3 w-3 text-gray-600 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                </div>
                </div>
                </div>
              </div>
              
            <!-- Absolutely positioned consultation blocks -->
            <div 
              v-for="(consultationBlock, index) in getPositionedConsultationBlocks()" 
              :key="index"
              class="absolute rounded-md text-xs bg-opacity-95 cursor-pointer overflow-hidden shadow-sm flex flex-col border transition-all duration-200"
              :class="getConsultationColorClasses(consultationBlock.consultation)"
              :style="{
                left: `calc(${consultationBlock.dayIndex * 16.67}% + 16.67% + 1px)`, 
                top: `${consultationBlock.top}px`,
                height: `${consultationBlock.height}px`,
                width: 'calc(16.67% - 2px)',
                ...getConsultationHoverStyles(consultationBlock.consultation)
              }"
              @click="viewConsultation(consultationBlock.consultation)"
              @mouseenter="onConsultationMouseEnter(consultationBlock.consultation)"
              @mouseleave="onConsultationMouseLeave"
            >
              <div class="font-normal text-xs truncate p-2">
                {{ consultationBlock.consultation.adviser.firstName }} {{ consultationBlock.consultation.adviser.lastName }}
              </div>
              <div class="text-xs flex flex-col justify-between px-2 pb-2 flex-grow">
                <span class="truncate font-normal">{{ consultationBlock.consultation.notes || 'Consultation' }}</span>
                <div class="mt-1 flex flex-col">
                  <span class="text-[10px] text-gray-700">
                    {{ formatConsultationDate(consultationBlock.consultation) }}
                  </span>
                  <span class="rounded-full px-2 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max">
                    {{ consultationBlock.consultation.maxStudents }} slots
                  </span>
                  <span class="text-xs mt-1">
                    {{ formatTimeRange(consultationBlock.consultation.startTime, consultationBlock.consultation.endTime) }}
                  </span>
                  <span class="text-xs mt-1 font-medium" :class="getStatusColor(consultationBlock.consultation.status)">
                    {{ formatStatus(consultationBlock.consultation.status) }}
                  </span>
                </div>
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
            <p class="text-md text-gray-800">{{ formatWeekRange(currentWeek) }}</p>
            <!-- Legend beside date (list view) -->
            <div class="hidden md:flex items-center space-x-4 text-sm">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
                <span class="text-gray-600">Active</span>
      </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
                <span class="text-gray-600">Pending Acceptance</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-blue-200 border border-blue-300 rounded"></div>
                <span class="text-gray-600">Pending Reschedule Approval</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
                <span class="text-gray-600">Pending Schedule Removal</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <!-- Month Navigation (Double Arrow) -->
            <button
              @click="previousMonth"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Previous Month"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            <!-- Week Navigation (Single Arrow) -->
            <button
              @click="previousWeek"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Previous Week"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
            </button>
            
            <!-- Current Week Button -->
            <button
              @click="goToCurrentWeek"
              class="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-md transition-colors"
              title="Current Week"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <!-- Week Navigation (Single Arrow) -->
            <button
              @click="nextWeek"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Next Week"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <!-- Month Navigation (Double Arrow) -->
            <button
              @click="nextMonth"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Next Month"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div class="mt-4">
        <UnifiedTable
          :data="consultationsForUnifiedTable"
          :columns="tableColumns"
          :sortable-columns="sortableColumns"
          :loading="loading"
          loading-text="Loading consultations..."
          search-placeholder="Search by adviser, day, or status"
          empty-state-title="No consultation schedules found"
          empty-state-message="Try adjusting your search criteria or add a new schedule"
          @search="handleUnifiedSearch"
          @sort="handleUnifiedSort"
          @page-change="handleUnifiedPageChange"
        >
          <!-- Custom row template -->
          <template #row="{ item: consultation }">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {{ getAdviserInitials(consultation.adviser) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                    {{ consultation.adviser }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ consultation.date }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ consultation.day }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ consultation.time }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ consultation.duration }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(consultation.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ consultation.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ consultation.bookings }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <div class="flex items-center justify-center space-x-2">
                <button
                  @click="viewConsultation(consultation)"
                  class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                >
                  View
                </button>
                <button
                  @click="editConsultation(consultation)"
                  class="px-3 py-1.5 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  @click="deleteConsultation(consultation)"
                  class="px-3 py-1.5 text-xs font-normal text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
              </td>
          </template>
        </UnifiedTable>
      </div>
      </div>
    </div>

    <!-- Add/Edit Consultation Modal -->
    <Teleport to="body">
        <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50" @click.self="closeAddModal">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h2 class="text-xl font-normal text-gray-800">
            {{ editingConsultation ? 'Edit Consultation Schedule' : 'Add Consultation Schedule' }}
            </h2>
              <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
          <form @submit.prevent="saveConsultation" class="space-y-6">
          <!-- Week Information -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-sm font-medium text-blue-800">Scheduling for Week</p>
                <p class="text-sm text-blue-600">{{ formatWeekRange(currentWeek) }}</p>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Adviser Selection -->
          <div>
              <label for="adviser" class="block text-sm font-medium text-gray-700 mb-2">
              Select Adviser
            </label>
            <select
              id="adviser"
              v-model="consultationForm.adviserId"
              required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose an adviser</option>
              <option v-for="adviser in advisers" :key="adviser._id" :value="adviser._id">
                {{ adviser.firstName }} {{ adviser.lastName }}
              </option>
            </select>
          </div>
          
          <!-- Day Selection -->
          <div>
              <label for="day" class="block text-sm font-medium text-gray-700 mb-2">
              Day of Week
            </label>
            <select
              id="day"
              v-model="consultationForm.dayOfWeek"
              required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose a day</option>
              <option 
                v-for="(day, index) in weekDays" 
                :key="index" 
                :value="index"
                :disabled="isDayInPast(index)"
                :class="{ 'text-gray-400': isDayInPast(index) }"
              >
                {{ day }}{{ isDayInPast(index) ? ' ' : '' }}{{ isDayToday(index) ? '' : '' }}
              </option>
            </select>
          </div>
          
          <!-- Time Schedule -->
          <div>
              <label for="startTime" class="block text-sm font-medium text-gray-700 mb-2">
              Time Schedule
            </label>
            <select
              id="startTime"
              v-model="consultationForm.startTime"
              required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose time schedule</option>
              <option v-for="hour in availableTimeSlots" :key="hour.value" :value="hour.value">
                {{ hour.label }}
              </option>
            </select>
          </div>
          
          <!-- Duration (Fixed at 3 hours) -->
          <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
              <div class="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              3 hours (Fixed)
            </div>
          </div>
          
          <!-- Max Students -->
          <div>
              <label for="maxStudents" class="block text-sm font-medium text-gray-700 mb-2">
              Maximum Students
            </label>
            <input
              id="maxStudents"
              type="number"
              v-model="consultationForm.maxStudents"
              min="1"
              max="10"
              required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            </div>
          </div>
          
          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              v-model="consultationForm.notes"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Any additional notes..."
            ></textarea>
          </div>
          
          <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeAddModal"
                class="px-4 py-2 text-sm font-normal text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
                class="px-4 py-2 text-sm font-normal text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
                {{ saving ? 'Saving...' : (editingConsultation ? 'Update Schedule' : 'Create Schedule') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>

    <!-- View Consultation Modal -->
    <Teleport to="body">
      <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center" style="z-index: 999999;" @click.self="closeViewModal">
        <div class="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-7xl mx-auto p-6 max-h-[95vh] overflow-y-auto scrollbar-hide transition-all duration-200" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-xl font-semibold text-gray-800">Consultation Details</h2>
            <button @click="closeViewModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
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
                  <span>Adviser: {{ selectedConsultation.adviser.salutation }} {{ selectedConsultation.adviser.firstName }} {{ selectedConsultation.adviser.lastName }}</span>
                  <span>Duration: {{ selectedConsultation.duration }}h</span>
                  <span>Max Students: {{ selectedConsultation.maxStudents }}</span>
                  <span>Time per Student: {{ Math.floor((selectedConsultation.duration * 60) / selectedConsultation.maxStudents) }}m</span>
            </div>
            </div>
              <div class="text-right">
                <span :class="getStatusClass(selectedConsultation.status)" class="inline-flex px-4 py-2 text-sm font-medium rounded-full">{{ selectedConsultation.status }}</span>
                <div class="mt-2 text-sm text-gray-600">
                  {{ selectedConsultation.bookedStudents || 0 }} students booked
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
          <div v-if="selectedConsultation.status === 'Active'" class="border border-gray-300 rounded-lg">
            <!-- Tab Navigation -->
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  @click="adminActiveTab = 'booked'"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    adminActiveTab === 'booked'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  Booked ({{ adminBookedStudents.length }})
                </button>
                <button
                  @click="adminActiveTab = 'pending'"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    adminActiveTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  Pending ({{ adminPendingStudents.length }})
                </button>
                <button
                  @click="adminActiveTab = 'completed'"
                  :class="[
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                    adminActiveTab === 'completed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  Completed ({{ adminCompletedStudents.length }})
                </button>
              </nav>
              </div>

            <!-- Tab Content -->
            <div class="p-0">
              <!-- Booked Tab -->
              <div v-if="adminActiveTab === 'booked'">
                <div v-if="adminBookedStudents.length === 0" class="text-center py-12 text-gray-500">
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
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="(booking, index) in adminBookedStudents" :key="booking._id" class="hover:bg-gray-50">
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
                            {{ booking.student.class?.major || booking.student.classDetails?.major || 'N/A' }}
                        </div>
                      </td>
                      
                        <!-- Concern / Meeting Type Column -->
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="flex flex-col space-y-1">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {{ booking.concern }}
                            </span>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {{ booking.consultationType === 'chat' ? 'Virtual' : 'In-Person' }}
                            </span>
                        </div>
                      </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Pending Tab -->
              <div v-if="adminActiveTab === 'pending'">
                <div v-if="adminPendingStudents.length === 0" class="text-center py-12 text-gray-500">
                  <h3 class="text-sm font-medium text-gray-900 mb-1">No pending students</h3>
                  <p class="text-sm text-gray-500">No students are currently pending for this consultation.</p>
                </div>
              
                <div v-else class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Level</th>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section & Major</th>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concern / Meeting Type</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="booking in adminPendingStudents" :key="booking._id" class="hover:bg-gray-50">
                        <td class="px-3 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="flex-shrink-0 h-8 w-8">
                              <div class="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                <span class="text-xs font-medium text-yellow-600">
                                  {{ booking.student?.user?.firstName?.charAt(0) }}{{ booking.student?.user?.lastName?.charAt(0) }}
                            </span>
                          </div>
                        </div>
                            <div class="ml-3">
                              <div class="text-sm font-medium text-gray-900">
                                {{ booking.student?.user?.firstName }} {{ booking.student?.user?.lastName }}
                        </div>
                              <div class="text-sm text-gray-500">{{ booking.student?.user?.email }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ booking.student?.user?.idNumber || 'N/A' }}
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ booking.student?.class?.yearLevel || booking.student?.classDetails?.yearLevel || 'N/A' }}
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{{ booking.student?.class?.section || booking.student?.classDetails?.section || 'N/A' }}</div>
                          <div class="text-xs text-gray-500">{{ booking.student?.class?.major || booking.student?.classDetails?.major || 'N/A' }}</div>
                        </td>
                        <td class="px-3 py-4 text-sm text-gray-900">
                          <div class="flex flex-col space-y-1">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {{ booking.concern }}
                            </span>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {{ booking.consultationType === 'chat' ? 'Virtual' : 'In-Person' }}
                            </span>
                            <div v-if="booking.consultationType === 'chat' && booking.meetingLink && booking.meetingStarted" class="mt-1">
                              <a :href="booking.meetingLink" target="_blank" class="text-xs text-blue-600 hover:text-blue-800 underline">
                                Meeting Link
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                      </div>
                      
              <!-- Completed Tab -->
              <div v-if="adminActiveTab === 'completed'">
                <div v-if="adminCompletedStudents.length === 0" class="text-center py-12 text-gray-500">
                  <h3 class="text-sm font-medium text-gray-900 mb-1">No completed consultations</h3>
                  <p class="text-sm text-gray-500">No consultations have been completed yet.</p>
                </div>
                
                <div v-else class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Level</th>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section & Major</th>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concern / Meeting Type</th>
                        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Notes</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="booking in adminCompletedStudents" :key="booking._id" class="hover:bg-gray-50">
                        <td class="px-3 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="flex-shrink-0 h-8 w-8">
                              <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <span class="text-xs font-medium text-green-600">
                                  {{ booking.student?.user?.firstName?.charAt(0) }}{{ booking.student?.user?.lastName?.charAt(0) }}
                          </span>
                              </div>
                            </div>
                            <div class="ml-3">
                              <div class="text-sm font-medium text-gray-900">
                                {{ booking.student?.user?.firstName }} {{ booking.student?.user?.lastName }}
                              </div>
                              <div class="text-sm text-gray-500">{{ booking.student?.user?.email }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ booking.student?.user?.idNumber || 'N/A' }}
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ booking.student?.class?.yearLevel || booking.student?.classDetails?.yearLevel || 'N/A' }}
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{{ booking.student?.class?.section || booking.student?.classDetails?.section || 'N/A' }}</div>
                          <div class="text-xs text-gray-500">{{ booking.student?.class?.major || booking.student?.classDetails?.major || 'N/A' }}</div>
                        </td>
                        <td class="px-3 py-4 text-sm text-gray-900">
                          <div class="flex flex-col space-y-1">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {{ booking.concern }}
                            </span>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {{ booking.consultationType === 'chat' ? 'Virtual' : 'In-Person' }}
                            </span>
                          </div>
                        </td>
                        <td class="px-3 py-4 text-sm text-gray-500">
                          <div class="text-sm text-gray-900 max-w-xs truncate" :title="booking.completionNotes || 'No notes'">
                            {{ booking.completionNotes || 'No notes' }}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
                        </div>
                        
        <!-- Reschedule Request Section -->
        <div v-if="selectedConsultation && selectedConsultation.status === 'Reschedule_Requested'" class="mt-6 border-t border-gray-200 pt-6">
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div class="flex items-center space-x-2 mb-4">
              <svg class="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 class="text-lg font-medium text-orange-800">Reschedule Request</h4>
                        </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Current Schedule</label>
                <p class="text-sm text-gray-900">
                  {{ weekDays[selectedConsultation.rescheduleRequest.originalValues.dayOfWeek] }} • 
                  {{ selectedConsultation.rescheduleRequest.originalValues.startTime }}:00 - {{ selectedConsultation.rescheduleRequest.originalValues.endTime }}:00
                </p>
                      </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Requested Schedule</label>
                <p class="text-sm text-gray-900">
                  {{ weekDays[selectedConsultation.rescheduleRequest.newDayOfWeek] }} • 
                  {{ selectedConsultation.rescheduleRequest.newStartTime }}:00 - {{ selectedConsultation.rescheduleRequest.newEndTime }}:00
                </p>
                    </div>
                  </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Reason</label>
              <p class="text-sm text-gray-900 bg-white p-3 rounded border">{{ selectedConsultation.rescheduleRequest.reason }}</p>
                </div>
            
            <div class="flex space-x-3">
              <button
                @click="approveReschedule(selectedConsultation._id)"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Approve Reschedule
              </button>
              <button
                @click="consultationToReject = selectedConsultation._id; showRejectModal = true; rejectReason = ''; closeViewModal()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Reschedule
              </button>
              </div>
          </div>
        </div>
        
        <!-- Removal Request Section -->
        <div v-if="selectedConsultation && selectedConsultation.status === 'Not_Available_Requested'" class="mt-6 border-t border-gray-200 pt-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center space-x-2 mb-4">
              <svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h4 class="text-lg font-medium text-red-800">Schedule Removal Request</h4>
      </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Schedule to Remove</label>
              <p class="text-sm text-gray-900">
                {{ weekDays[selectedConsultation.dayOfWeek] }} • 
                {{ selectedConsultation.startTime }}:00 - {{ selectedConsultation.endTime }}:00
              </p>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Reason</label>
              <p class="text-sm text-gray-900 bg-white p-3 rounded border">{{ selectedConsultation.adviserDeclineReason || selectedConsultation.declineReason || 'Not specified' }}</p>
            </div>
            
            <div class="flex space-x-3">
              <button
                @click="approveRemoval(selectedConsultation._id)"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Approve Removal
              </button>
              <button
                @click="consultationToReject = selectedConsultation._id; showRejectModal = true; rejectReason = ''; closeViewModal()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Removal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </Teleport>
    
    <!-- Reject Reschedule Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-[60]" @click.self="showRejectModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ getRejectModalTitle() }}
          </h3>
          <button @click="showRejectModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
    </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Reason for rejection</label>
          <textarea
            v-model="rejectReason"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            :placeholder="getRejectModalPlaceholder()"
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="showRejectModal = false; consultationToReject = null; rejectReason = ''"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            @click="handleRejectRequest(consultationToReject)"
            :disabled="!rejectReason.trim()"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
              rejectReason.trim()
                ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'text-gray-400 bg-gray-300 cursor-not-allowed'
            ]"
          >
            {{ getRejectButtonText() }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Copy Schedule Modal -->
    <Teleport to="body">
      <div v-if="showCopyScheduleModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50" @click.self="closeCopyScheduleModal">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Copy Schedule from Previous Week
            </h3>
            <button @click="closeCopyScheduleModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="p-6">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Week to Copy From</label>
              <select
                v-model="selectedWeekToCopy"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a week...</option>
                <option v-for="week in availableWeeks" :key="week.value" :value="week.value">
                  {{ week.label }}
                </option>
              </select>
            </div>
            
            
            <div class="flex justify-end space-x-3">
              <button
                @click="closeCopyScheduleModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                @click="copySchedule"
                :disabled="!selectedWeekToCopy || copyingSchedule"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                  selectedWeekToCopy && !copyingSchedule
                    ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    : 'text-gray-400 bg-gray-300 cursor-not-allowed'
                ]"
              >
                <span v-if="copyingSchedule">Copying...</span>
                <span v-else>Copy Schedule</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, Teleport } from 'vue'
import { notificationService } from '../../services/notificationService'
import api from '../../services/api'
import UnifiedTable from '../../components/ui/UnifiedTable.vue'

// Reactive data
const loading = ref(false)
const saving = ref(false)
const currentView = ref('calendar')
const consultations = ref([])
const allConsultations = ref([])
const advisers = ref([])
const showAddModal = ref(false)
const showViewModal = ref(false)
const editingConsultation = ref(null)
const selectedConsultation = ref(null)
const statusFilter = ref('All')
const bookingFilter = ref('Confirmed')
const showRejectModal = ref(false)
const rejectReason = ref('')
const consultationToReject = ref(null)

// Admin modal tab state
const adminActiveTab = ref('booked')

// Copy schedule modal
const showCopyScheduleModal = ref(false)
const copyingSchedule = ref(false)
const availableWeeks = ref([])
const selectedWeekToCopy = ref(null)

// Hover state for consultation blocks
const hoveredConsultation = ref(null)

// UnifiedTable data
const tableColumns = [
  { key: 'adviser', label: 'Adviser', class: '' },
  { key: 'date', label: 'Date', class: '' },
  { key: 'day', label: 'Day', class: '' },
  { key: 'time', label: 'Time', class: '' },
  { key: 'duration', label: 'Duration', class: '' },
  { key: 'status', label: 'Status', class: '' },
  { key: 'bookings', label: 'Bookings', class: '' },
  { key: 'actions', label: 'Actions', class: 'text-center' }
]

const sortableColumns = [
  { value: 'adviser.firstName', label: 'Adviser' },
  { value: 'date', label: 'Date' },
  { value: 'dayOfWeek', label: 'Day' },
  { value: 'startTime', label: 'Time' },
  { value: 'status', label: 'Status' }
]

// Week days (Monday to Friday)
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Time slots (7 AM to 5 PM) - matching Classes format
const timeSlots = [
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

// Available time slots for 3-hour consultations (7 AM to 3 PM start times)
const availableTimeSlots = computed(() => {
  const slots = []
  for (let hour = 7; hour <= 15; hour++) { // 7 AM to 3 PM (3 PM + 3 hours = 6 PM)
    const startTime = formatTime(hour)
    const endTime = formatTime(hour + 3)
    slots.push({
      value: hour,
      label: `${startTime} - ${endTime}`
    })
  }
  return slots
})

// Form data
const consultationForm = ref({
  adviserId: '',
  dayOfWeek: '',
  startTime: '',
  duration: 3,
  maxStudents: 5,
  notes: ''
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

// Format exact calendar date for a consultation based on weekStart + dayOfWeek
const formatConsultationDate = (consultation) => {
  try {
    if (consultation.dayOfWeek === undefined) return ''
    // Use the current week being viewed instead of the consultation's original weekStart
    const currentWeekStart = getWeekStart(currentWeek.value)
    const date = new Date(currentWeekStart)
    // Add dayOfWeek (0..4) to get the correct day in the current week
    date.setDate(currentWeekStart.getDate() + Number(consultation.dayOfWeek))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

// Format consultation status for display
const formatStatus = (status) => {
  const statusMap = {
    'Active': 'Active',
    'Pending_Adviser_Acceptance': 'Pending',
    'Not_Available': 'Not Available',
    'Reschedule_Requested': 'Reschedule'
  }
  return statusMap[status] || status
}

// Get status color classes
const getStatusColor = (status) => {
  const colorMap = {
    'Active': 'text-green-700',
    'Pending_Adviser_Acceptance': 'text-yellow-700',
    'Not_Available': 'text-red-700',
    'Reschedule_Requested': 'text-blue-700'
  }
  return colorMap[status] || 'text-gray-700'
}

const getAdviserInitials = (adviser) => {
  if (!adviser) return '--'
  // If adviser is a plain string (e.g., "Katrina Santiago")
  if (typeof adviser === 'string') {
    const parts = adviser.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
  }
  // If adviser is an object with names
  const first = adviser.firstName ? adviser.firstName.charAt(0) : ''
  const last = adviser.lastName ? adviser.lastName.charAt(0) : ''
  const initials = `${first}${last}`
  return initials ? initials.toUpperCase() : '--'
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Inactive':
      return 'bg-red-100 text-red-800'
    case 'Full':
      return 'bg-yellow-100 text-yellow-800'
    case 'Pending_Adviser_Acceptance':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getConsultationsForSlot = (dayIndex, timeSlotIndex) => {
  return consultations.value
    .filter(c => statusFilter.value === 'All' ? true : c.status === statusFilter.value)
    .filter(consultation => {
      // Convert time slot index to hour (7 AM = index 0, 8 AM = index 1, etc.)
      const hour = 7 + timeSlotIndex
    return consultation.dayOfWeek === dayIndex && 
           consultation.startTime <= hour && 
           consultation.endTime > hour
    })
}

// New function for weekly consultations
const getConsultationsForSlotAndDay = (dayIndex, timeSlotIndex) => {
  return consultations.value
    .filter(c => statusFilter.value === 'All' ? true : c.status === statusFilter.value)
    .filter(consultation => {
      // Check if consultation is for the current week
      const consultationWeekStart = new Date(consultation.weekStart)
      const consultationWeekEnd = new Date(consultation.weekEnd)
      const currentWeekStart = getWeekStart(currentWeek.value)
      const currentWeekEnd = getWeekEnd(currentWeek.value)
      
      const isInCurrentWeek = consultationWeekStart <= currentWeekEnd && consultationWeekEnd >= currentWeekStart
      
      if (!isInCurrentWeek) return false
      
      // Convert time slot index to hour (7 AM = index 0, 8 AM = index 1, etc.)
      const hour = 7 + timeSlotIndex
      return consultation.dayOfWeek === dayIndex && 
             consultation.startTime <= hour && 
             consultation.endTime > hour
    })
}

// Check for time conflicts between advisers
const hasTimeConflict = (adviserId, dayOfWeek, startTime, endTime, excludeId = null) => {
  return consultations.value.some(consultation => {
    // Skip the consultation being edited
    if (excludeId && consultation._id === excludeId) return false
    
    // Check if it's the same day and time slot (regardless of adviser)
    if (consultation.dayOfWeek === dayOfWeek) {
      // Check for time overlap
      return (startTime < consultation.endTime && endTime > consultation.startTime)
    }
    return false
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

// Get color classes for consultation blocks based on status
const getConsultationColorClasses = (consultation) => {
  // Status-based colors matching the legend
  const statusColors = {
    'Active': 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300',
    'Pending_Adviser_Acceptance': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300',
    'Reschedule_Requested': 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300',
    'Not_Available_Requested': 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300',
    'Not_Available': 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300',
    'Inactive': 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300',
    'Full': 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300'
  }
  
  return statusColors[consultation.status] || 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'
}

// Function to get positioned consultation blocks
const getPositionedConsultationBlocks = () => {
  // Constants for positioning
  const ROW_HEIGHT = 50 // Match the min-height of time slots

  // Map time slots to their start and end times in minutes
  const timeSlotRanges = timeSlots.map(slot => {
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
  
  // Use the same data source and filtering logic as list view for consistency
  const weekStart = getWeekStart(currentWeek.value)
  const weekEnd = getWeekEnd(currentWeek.value)
  const dataToUse = (allConsultations.value || []).filter(c => {
    if (!c.weekStart || !c.weekEnd) return false
    const cStart = new Date(c.weekStart)
    const cEnd = new Date(c.weekEnd)
    return cStart <= weekEnd && cEnd >= weekStart
  })
  
  dataToUse
    .filter(c => statusFilter.value === 'All' ? true : c.status === statusFilter.value)
    .forEach(consultation => {
      // Get the day index (0-4 for Monday-Friday)
      const dayIndex = dayIndices[weekDays[consultation.dayOfWeek]]
      if (dayIndex === undefined) return
      
      // Calculate start and end times
      const startTime = formatTime(consultation.startTime)
      const endTime = formatTime(consultation.endTime)
      
      // Find the matching time slot for the start time
      let startRowIndex = -1
      timeSlots.forEach((timeSlot, index) => {
        if (timeSlot.startsWith(startTime)) {
          startRowIndex = index
        }
      })
      
      // Find the matching time slot for the end time
      let endRowIndex = -1
      timeSlots.forEach((timeSlot, index) => {
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

const selectTimeSlot = (dayIndex, timeSlotIndex) => {
  // Check if current week is in the past
  if (isCurrentWeekInPast.value) {
    notificationService.showWarning('Cannot schedule consultations for past weeks')
    return
  }
  
  // Check if the specific day is in the past
  if (isDayInPast(dayIndex)) {
    notificationService.showWarning('Cannot schedule consultations for past days')
    return
  }
  
  // Open add modal for this time slot
  openAddModalForSlot(dayIndex, timeSlotIndex)
}

const openAddModalForSlot = (dayIndex, timeSlotIndex) => {
  // Check if current week is in the past
  if (isCurrentWeekInPast.value) {
    notificationService.showWarning('Cannot schedule consultations for past weeks')
    return
  }
  
  // Check if the specific day is in the past
  if (isDayInPast(dayIndex)) {
    notificationService.showWarning('Cannot schedule consultations for past days')
    return
  }
  
  const hour = 7 + timeSlotIndex // Convert index to actual hour
  
  consultationForm.value.dayOfWeek = dayIndex
  consultationForm.value.startTime = hour
  showAddModal.value = true
}

const viewConsultation = async (consultation) => {
  try {
    // Fetch full consultation details with bookings
    const response = await api.get(`/consultations/${consultation._id}`)
    selectedConsultation.value = response.data
  showViewModal.value = true
  } catch (error) {
    console.error('Error fetching consultation details:', error)
    notificationService.showError('Failed to load consultation details')
  }
}

const editConsultation = (consultation) => {
  editingConsultation.value = consultation
  
  // Handle both string and object adviser data
  let adviserId = consultation.adviser?._id || consultation.adviser
  
  // If adviser is a string (name), find the matching adviser ID
  if (typeof consultation.adviser === 'string') {
    const matchingAdviser = advisers.value.find(adv => 
      `${adv.firstName} ${adv.lastName}` === consultation.adviser
    )
    adviserId = matchingAdviser?._id || consultation.adviser
  }
  
  consultationForm.value = {
    adviserId: adviserId,
    dayOfWeek: consultation.dayOfWeek,
    startTime: consultation.startTime,
    duration: consultation.duration,
    maxStudents: consultation.maxStudents,
    notes: consultation.notes || ''
  }
  showAddModal.value = true
}

const deleteConsultation = async (consultation) => {
  if (!confirm('Are you sure you want to delete this consultation schedule?')) return
  
  try {
    await api.delete(`/consultations/${consultation._id}`)
    await loadConsultations()
    await loadConsultationsForWeek()
    notificationService.showSuccess('Consultation schedule deleted successfully')
  } catch (error) {
    console.error('Error deleting consultation:', error)
    notificationService.showError('Failed to delete consultation schedule')
  }
}

const saveConsultation = async () => {
  if (!validateForm()) return
  
  try {
    saving.value = true
    
    const weekStart = getWeekStart(currentWeek.value)
    const weekEnd = getWeekEnd(currentWeek.value)
    
    const consultationData = {
      adviserId: consultationForm.value.adviserId,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      dayOfWeek: parseInt(consultationForm.value.dayOfWeek),
      startTime: parseInt(consultationForm.value.startTime),
      duration: parseInt(consultationForm.value.duration),
      maxStudents: parseInt(consultationForm.value.maxStudents),
      notes: consultationForm.value.notes || '',
      endTime: parseInt(consultationForm.value.startTime) + parseInt(consultationForm.value.duration),
      status: 'Pending_Adviser_Acceptance'
    }
    
    if (editingConsultation.value) {
      await api.put(`/consultations/${editingConsultation.value._id}`, consultationData)
      notificationService.showSuccess('Consultation schedule updated successfully')
    } else {
      await api.post('/consultations', consultationData)
      notificationService.showSuccess('Consultation schedule created successfully')
    }
    
    await loadConsultations()
    await loadConsultationsForWeek()
    closeAddModal()
  } catch (error) {
    console.error('Error saving consultation:', error)
    notificationService.showWarning('The Adviser has already scheduled consutlation this week')
  } finally {
    saving.value = false
  }
}

const validateForm = () => {
  const form = consultationForm.value
  
  if (!form.adviserId || form.dayOfWeek === '' || form.startTime === '' || !form.maxStudents) {
    notificationService.showError('Please fill in all required fields')
    return false
  }
  
  // Check if selected day is in the past
  if (isDayInPast(parseInt(form.dayOfWeek))) {
    notificationService.showError('Cannot schedule consultations for past days')
    return false
  }
  
  // Check if end time exceeds business hours
  const endTime = parseInt(form.startTime) + parseInt(form.duration)
  if (endTime > 18) {
    notificationService.showError('Consultation would extend beyond business hours (6 PM)')
    return false
  }
  
  // Check for time conflicts
  const startTime = parseInt(form.startTime)
  const excludeId = editingConsultation.value ? editingConsultation.value._id : null
  
  if (hasTimeConflict(form.adviserId, parseInt(form.dayOfWeek), startTime, endTime, excludeId)) {
    notificationService.showError('This time slot is already occupied by another consultation. Please choose a different time.')
    return false
  }
  
  return true
}

const closeAddModal = () => {
  showAddModal.value = false
  editingConsultation.value = null
  consultationForm.value = {
    adviserId: '',
    dayOfWeek: '',
    startTime: '',
    duration: 3,
    maxStudents: 5,
    notes: ''
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedConsultation.value = null
}

// Approve reschedule request
const approveReschedule = async (consultationId) => {
  try {
    await api.post(`/consultations/${consultationId}/approve-reschedule`)
    notificationService.showSuccess('Reschedule request approved successfully')
    closeViewModal()
    await loadConsultations()
  } catch (error) {
    console.error('Error approving reschedule:', error)
    notificationService.showError('Failed to approve reschedule request')
  }
}

// Reject reschedule request
const rejectReschedule = async (consultationId) => {
  try {
    console.log('Rejecting reschedule for consultation:', consultationId)
    console.log('Reject reason:', rejectReason.value)
    
    await api.post(`/consultations/${consultationId}/reject-reschedule`, {
      reason: rejectReason.value
    })
    notificationService.showSuccess('Reschedule request rejected successfully')
    showRejectModal.value = false
    rejectReason.value = ''
    consultationToReject.value = null
    closeViewModal()
    await loadConsultations()
  } catch (error) {
    console.error('Error rejecting reschedule:', error)
    notificationService.showError('Failed to reject reschedule request')
  }
}

// Approve removal request
const approveRemoval = async (consultationId) => {
  try {
    await api.post(`/consultations/${consultationId}/approve-removal`)
    notificationService.showSuccess('Removal request approved successfully')
    closeViewModal()
    await loadConsultations()
  } catch (error) {
    console.error('Error approving removal:', error)
    notificationService.showError('Failed to approve removal request')
  }
}

// Reject removal request
const rejectRemoval = async (consultationId) => {
  try {
    await api.post(`/consultations/${consultationId}/reject-removal`, {
      reason: rejectReason.value
    })
    notificationService.showSuccess('Removal request rejected successfully')
    showRejectModal.value = false
    rejectReason.value = ''
    consultationToReject.value = null
    closeViewModal()
    await loadConsultations()
  } catch (error) {
    console.error('Error rejecting removal:', error)
    notificationService.showError('Failed to reject removal request')
  }
}

// Handle reject request - determines whether it's reschedule or removal
const handleRejectRequest = async (consultationId) => {
  // Find the consultation to determine its status
  const consultation = consultations.value.find(c => c._id === consultationId)
  if (consultation) {
    if (consultation.status === 'Reschedule_Requested') {
      await rejectReschedule(consultationId)
    } else if (consultation.status === 'Not_Available_Requested') {
      await rejectRemoval(consultationId)
    }
  }
}

// Get reject modal title based on consultation status
const getRejectModalTitle = () => {
  if (!consultationToReject.value) return 'Reject Request'
  
  const consultation = consultations.value.find(c => c._id === consultationToReject.value)
  if (consultation) {
    if (consultation.status === 'Reschedule_Requested') {
      return 'Reject Reschedule Request'
    } else if (consultation.status === 'Not_Available_Requested') {
      return 'Reject Removal Request'
    }
  }
  return 'Reject Request'
}

// Get reject modal placeholder based on consultation status
const getRejectModalPlaceholder = () => {
  if (!consultationToReject.value) return 'Please provide a reason for rejecting this request...'
  
  const consultation = consultations.value.find(c => c._id === consultationToReject.value)
  if (consultation) {
    if (consultation.status === 'Reschedule_Requested') {
      return 'Please provide a reason for rejecting this reschedule request...'
    } else if (consultation.status === 'Not_Available_Requested') {
      return 'Please provide a reason for rejecting this removal request...'
    }
  }
  return 'Please provide a reason for rejecting this request...'
}

// Get reject button text based on consultation status
const getRejectButtonText = () => {
  if (!consultationToReject.value) return 'Reject Request'
  
  const consultation = consultations.value.find(c => c._id === consultationToReject.value)
  if (consultation) {
    if (consultation.status === 'Reschedule_Requested') {
      return 'Reject Reschedule'
    } else if (consultation.status === 'Not_Available_Requested') {
      return 'Reject Removal'
    }
  }
  return 'Reject Request'
}

const loadConsultations = async () => {
  try {
    loading.value = true
    const response = await api.get('/consultations')
    consultations.value = response.data || []
    allConsultations.value = response.data || []
  } catch (error) {
    console.error('Error loading consultations:', error)
    notificationService.showError('Failed to load consultations')
  } finally {
    loading.value = false
  }
}

const loadAdvisers = async () => {
  try {
    const response = await api.get('/advisers')
    advisers.value = response.data || []
  } catch (error) {
    console.error('Error loading advisers:', error)
    notificationService.showError('Failed to load advisers')
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

// UnifiedTable event handlers
const handleUnifiedSearch = (searchTerm) => {
  // Search is handled by UnifiedTable component
}

const handleUnifiedSort = (sortField, sortDirection) => {
  // Sort is handled by UnifiedTable component
}

const handleUnifiedPageChange = (page) => {
  // Pagination is handled by UnifiedTable component
}

// Week navigation methods
const currentWeek = ref(new Date())

// Helper functions for week calculations
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
  return `${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
}

const goToCurrentWeek = () => {
  currentWeek.value = new Date()
  loadConsultationsForWeek()
}

const previousWeek = () => {
  const newDate = new Date(currentWeek.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeek.value = newDate
  loadConsultationsForWeek()
}

const nextWeek = () => {
  const newDate = new Date(currentWeek.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeek.value = newDate
  loadConsultationsForWeek()
}

const previousMonth = () => {
  const newDate = new Date(currentWeek.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentWeek.value = newDate
  loadConsultationsForWeek()
}

const nextMonth = () => {
  const newDate = new Date(currentWeek.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentWeek.value = newDate
  loadConsultationsForWeek()
}

const loadConsultationsForWeek = async () => {
  try {
    loading.value = true
    const weekStart = getWeekStart(currentWeek.value)
    const weekEnd = getWeekEnd(currentWeek.value)
    
    console.log('Loading consultations for week:', weekStart.toISOString().split('T')[0], 'to', weekEnd.toISOString().split('T')[0])
    
    // Try to load weekly consultations
    try {
      const response = await api.get(`/consultations/week/${weekStart.toISOString().split('T')[0]}/${weekEnd.toISOString().split('T')[0]}`)
      consultations.value = response.data || []
      console.log('Loaded consultations for week:', consultations.value.length, 'consultations')
    } catch (weeklyError) {
      console.log('Weekly consultation route failed, using all consultations:', weeklyError.message)
      // If weekly route fails, use all consultations and filter by week
      consultations.value = allConsultations.value.filter(consultation => {
        if (!consultation.weekStart || !consultation.weekEnd) return false
        const consultationWeekStart = new Date(consultation.weekStart)
        const consultationWeekEnd = new Date(consultation.weekEnd)
        return consultationWeekStart <= weekEnd && consultationWeekEnd >= weekStart
      })
      console.log('Filtered consultations for week:', consultations.value.length, 'consultations')
    }
    
    // If still no consultations found, filter allConsultations for current week only
    if (consultations.value.length === 0 && allConsultations.value.length > 0) {
      console.log('No weekly consultations found, filtering allConsultations for current week')
      consultations.value = allConsultations.value.filter(consultation => {
        if (!consultation.weekStart || !consultation.weekEnd) return false
        const consultationWeekStart = new Date(consultation.weekStart)
        const consultationWeekEnd = new Date(consultation.weekEnd)
        return consultationWeekStart <= weekEnd && consultationWeekEnd >= weekStart
      })
      console.log('Filtered consultations for current week:', consultations.value.length, 'consultations')
    }
  } catch (error) {
    console.error('Error loading weekly consultations:', error)
    // Don't show error notification for weekly loading failures
    console.log('Using filtered allConsultations as fallback due to error')
    const weekStart = getWeekStart(currentWeek.value)
    const weekEnd = getWeekEnd(currentWeek.value)
    consultations.value = allConsultations.value.filter(consultation => {
      if (!consultation.weekStart || !consultation.weekEnd) return false
      const consultationWeekStart = new Date(consultation.weekStart)
      const consultationWeekEnd = new Date(consultation.weekEnd)
      return consultationWeekStart <= weekEnd && consultationWeekEnd >= weekStart
    })
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadConsultations()
  await loadAdvisers()
  await loadConsultationsForWeek()
})

// Watch for week changes
watch(currentWeek, async () => {
  await loadConsultationsForWeek()
})

const filteredConsultations = computed(() => {
  // Use all consultations if weekly data is empty
  const dataToUse = consultations.value.length > 0 ? consultations.value : allConsultations.value
  
  if (statusFilter.value === 'All') return dataToUse
  return dataToUse.filter(c => c.status === statusFilter.value)
})

const filteredBookings = computed(() => {
  if (!selectedConsultation.value) return []
  const list = selectedConsultation.value.bookings || []
  if (!Array.isArray(list)) return []
  return list.filter(b => b.status === bookingFilter.value)
})

// Admin modal computed properties for tabs
const adminBookedStudents = computed(() => {
  if (!selectedConsultation.value) return []
  const bookings = selectedConsultation.value.bookings || []
  return bookings.filter(booking => booking.status === 'Booked')
})

const adminPendingStudents = computed(() => {
  if (!selectedConsultation.value) return []
  const bookings = selectedConsultation.value.bookings || []
  return bookings.filter(booking => booking.status === 'Pending')
})

const adminCompletedStudents = computed(() => {
  if (!selectedConsultation.value) return []
  const bookings = selectedConsultation.value.bookings || []
  return bookings.filter(booking => booking.status === 'Completed')
})

// Data for UnifiedTable
const consultationsForUnifiedTable = computed(() => {
  // Show only consultations in the currently selected week for list view
  const weekStart = getWeekStart(currentWeek.value)
  const weekEnd = getWeekEnd(currentWeek.value)
  const dataToUse = (allConsultations.value || []).filter(c => {
    if (!c.weekStart || !c.weekEnd) return false
    const cStart = new Date(c.weekStart)
    const cEnd = new Date(c.weekEnd)
    return cStart <= weekEnd && cEnd >= weekStart
  })
  
  console.log('consultationsForUnifiedTable - All consultations:', dataToUse.length)
  
  return dataToUse.map(consultation => ({
    ...consultation,
    adviser: `${consultation.adviser?.firstName || ''} ${consultation.adviser?.lastName || ''}`.trim(),
    date: formatConsultationDate(consultation),
    day: weekDays[consultation.dayOfWeek] || '-',
    time: formatTimeRange(consultation.startTime, consultation.endTime),
    duration: `${consultation.duration} hours`,
    status: consultation.status,
    bookings: `${consultation.bookedStudents || 0} / ${consultation.maxStudents}`
  }))
})

// Check if current week is in the past
const isCurrentWeekInPast = computed(() => {
  const today = new Date()
  const weekStart = getWeekStart(currentWeek.value)
  const weekEnd = getWeekEnd(currentWeek.value)
  
  // Set time to start of day for accurate comparison
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const weekEndStart = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate())
  
  // Only block if the week has completely passed (week end is before today)
  return weekEndStart < todayStart
})

// Check if a specific day is in the past
const isDayInPast = (dayIndex) => {
  const today = new Date()
  const weekStart = getWeekStart(currentWeek.value)
  const dayDate = new Date(weekStart)
  dayDate.setDate(weekStart.getDate() + dayIndex)
  
  // Set time to start of day for accurate comparison
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
  
  return dayStart < todayStart
}

// Check if a specific day is today
const isDayToday = (dayIndex) => {
  const today = new Date()
  const weekStart = getWeekStart(currentWeek.value)
  const dayDate = new Date(weekStart)
  dayDate.setDate(weekStart.getDate() + dayIndex)
  
  // Set time to start of day for accurate comparison
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
  
  return dayStart.getTime() === todayStart.getTime()
}

// Hover handlers for consultation blocks
const onConsultationMouseEnter = (consultation) => {
  hoveredConsultation.value = consultation._id
}

const onConsultationMouseLeave = () => {
  hoveredConsultation.value = null
}

// Get dynamic z-index for consultation blocks
const getConsultationZIndex = (consultation) => {
  const isHovered = hoveredConsultation.value === consultation._id
  return isHovered ? 50 : 10
}

// Get hover styles for consultation blocks
const getConsultationHoverStyles = (consultation) => {
  const isHovered = hoveredConsultation.value === consultation._id
  return {
    zIndex: getConsultationZIndex(consultation),
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
    boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease-in-out'
  }
}

// Check if current week is empty (no consultations)
    const isCurrentWeekEmpty = computed(() => {
      return consultations.value.length === 0
    })


// Week days with dates for calendar header
const weekDaysWithDates = computed(() => {
  const weekStart = getWeekStart(currentWeek.value)
  return weekDays.map((day, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)
    return {
      name: day,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  })
})

// Copy schedule functions
const openCopyScheduleModal = async () => {
  showCopyScheduleModal.value = true
  
  // Ensure allConsultations is loaded before populating weeks
  if (allConsultations.value.length === 0) {
    console.log('allConsultations is empty, loading consultations first...')
    await loadConsultations()
  }
  
  await loadAvailableWeeks()
}

const closeCopyScheduleModal = () => {
  showCopyScheduleModal.value = false
  selectedWeekToCopy.value = null
  availableWeeks.value = []
}

const loadAvailableWeeks = async () => {
  try {
    console.log('Loading available weeks, allConsultations count:', allConsultations.value.length)
    
    // Get all unique weeks that have consultations
    const weekMap = new Map()
    
    allConsultations.value.forEach(consultation => {
      if (!consultation.weekStart || !consultation.weekEnd) {
        console.log(`Consultation ${consultation._id}: Missing weekStart or weekEnd`)
        return
      }
      
      const weekStart = new Date(consultation.weekStart)
      const weekEnd = new Date(consultation.weekEnd)
      const weekKey = weekStart.toISOString().split('T')[0] // Use weekStart as key
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          weekStart: weekStart,
          weekEnd: weekEnd,
          consultations: [],
          activeConsultations: []
        })
      }
      
      const weekData = weekMap.get(weekKey)
      weekData.consultations.push(consultation)
      
          if (consultation.status === 'Active' || consultation.status === 'Inactive') {
            weekData.activeConsultations.push(consultation)
          }
    })
    
    console.log('Found weeks with consultations:', weekMap.size)
    
    // Convert to array, filter out weeks with no active/inactive consultations, and sort by date (most recent first)
    const weeks = Array.from(weekMap.values())
      .filter(weekData => weekData.activeConsultations.length > 0) // Only include weeks with active/inactive consultations
      .sort((a, b) => b.weekStart - a.weekStart) // Sort by date descending
      .slice(0, 10) // Limit to 10 most recent weeks
      .map(weekData => {
        const weekDate = weekData.weekStart
        const label = formatWeekRange(weekDate)
        
        console.log(`Week ${weekDate.toISOString().split('T')[0]}: ${weekData.consultations.length} consultations (${weekData.activeConsultations.length} active/inactive)`)
        
        return {
          value: weekDate.toISOString().split('T')[0],
          label: label
        }
      })
    
    availableWeeks.value = weeks
    console.log('Available weeks for copying:', weeks)
  } catch (error) {
    console.error('Error loading available weeks:', error)
    notificationService.showError('Failed to load available weeks')
  }
}

const copySchedule = async () => {
  if (!selectedWeekToCopy.value) return
  
  try {
    copyingSchedule.value = true
    
    const response = await api.post('/consultations/copy-schedule', {
      fromWeek: selectedWeekToCopy.value,
      toWeek: getWeekStart(currentWeek.value).toISOString().split('T')[0]
    })
    
    notificationService.showSuccess('Schedule copied successfully!')
    
    // Reload consultations
    await loadConsultationsForWeek()
    
    closeCopyScheduleModal()
  } catch (error) {
    console.error('Error copying schedule:', error)
    const message = error.response?.data?.message || 'Failed to copy schedule'
    notificationService.showError(message)
  } finally {
    copyingSchedule.value = false
  }
}
</script>

<style scoped>
.min-h-80 {
  min-height: 80px;
}
</style> 