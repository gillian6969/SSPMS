<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Pending Upcoming Consutlation schedule</h1>
            <p class="text-gray-500 font-normal">Review and accept/decline weekly schedules created by admin</p>
          </div>
          <div class="bg-gray-100 p-1 rounded-lg">
            <button @click="currentView = 'calendar'" :class="['px-3 py-1.5 rounded-md text-sm font-normal transition-colors', currentView === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">Calendar View</button>
            <button @click="currentView = 'list'" :class="['px-3 py-1.5 rounded-md text-sm font-normal transition-colors', currentView === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">List View</button>
          </div>
        </div>
        
      </div>

      <div v-if="currentView === 'calendar'" class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-6">
              <p class="text-md text-gray-800">{{ formatWeekRange(currentWeek) }}</p>
              <!-- Legend -->
              <div class="flex items-center space-x-4 text-sm">
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

        <div class="p-6">
          <div class="border rounded-lg">
            <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
              <div class="py-3 px-2 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
              <div v-for="(day, index) in weekDaysWithDates" :key="index" class="py-3 px-2 text-gray-500 text-xs font-medium text-center">
                <div class="font-semibold">{{ day.name }}</div>
                <div class="text-gray-400">{{ day.date }}</div>
              </div>
            </div>

            <!-- Calendar Grid Body (matches admin sizing) -->
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
                  ></div>
                </div>
              </div>

              <!-- Absolutely positioned pending blocks (one per consultation) -->
              <div 
                v-for="(block, idx) in getPositionedPendingBlocks()" 
                :key="idx"
                class="absolute rounded-md text-xs bg-opacity-95 cursor-pointer overflow-hidden z-10 shadow-sm flex flex-col border"
                :class="block.consultation.status === 'Reschedule_Requested' 
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300'
                  : block.consultation.status === 'Not_Available_Requested'
                  ? 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300'
                  : 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300'"
                :style="{
                  left: `calc(${block.dayIndex * 16.67}% + 16.67% + 1px)`,
                  top: `${block.top}px`,
                  height: `${block.height}px`,
                  width: 'calc(16.67% - 2px)'
                }"
                @click="openConsultationModal(block.consultation)"
              >
                <div class="font-normal text-xs truncate p-2">
                  {{ block.consultation.status === 'Reschedule_Requested' ? 'Pending Reschedule Approval' 
                    : block.consultation.status === 'Not_Available_Requested' ? 'Pending Schedule Removal'
                    : 'Pending Schedule' }}
                </div>
                <div class="text-xs flex flex-col justify-between px-2 pb-2 flex-grow">
                  <div class="mt-1 flex flex-col">
                    <span :class="block.consultation.status === 'Reschedule_Requested' ? 'text-[10px] text-blue-700' 
                      : block.consultation.status === 'Not_Available_Requested' ? 'text-[10px] text-red-700'
                      : 'text-[10px] text-orange-700'">
                      {{ formatConsultationDate(block.consultation) }}
                    </span>
                    <span :class="block.consultation.status === 'Reschedule_Requested' 
                      ? 'rounded-full px-2 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max text-blue-800'
                      : block.consultation.status === 'Not_Available_Requested'
                      ? 'rounded-full px-2 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max text-red-800'
                      : 'rounded-full px-2 py-0.5 bg-white bg-opacity-40 text-xs mt-1 inline-block w-max text-orange-800'">
                      {{ (block.consultation.bookedStudents || 0) }} / {{ block.consultation.maxStudents || 0 }} slots
                    </span>
                    <span :class="block.consultation.status === 'Reschedule_Requested' ? 'text-xs mt-1 text-blue-700' 
                      : block.consultation.status === 'Not_Available_Requested' ? 'text-xs mt-1 text-red-700'
                      : 'text-xs mt-1 text-orange-700'">
                      {{ formatTimeRange(block.consultation.startTime, block.consultation.endTime) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="pendingConsultations.length === 0" class="p-6 text-center text-gray-500">No pending schedules for this week</div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-md text-gray-800">{{ formatWeekRange(currentWeek) }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="previousMonth" class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md" title="Previous Month">«</button>
              <button @click="previousWeek" class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md" title="Previous Week">‹</button>
              <button @click="goToCurrentWeek" class="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-md" title="Current Week">↻</button>
              <button @click="nextWeek" class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md" title="Next Week">›</button>
              <button @click="nextMonth" class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md" title="Next Month">»</button>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div v-if="pendingConsultations.length === 0" class="text-center text-gray-500 py-8">No pending schedules</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slots</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="c in pendingConsultations" :key="c._id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatConsultationDate(c) || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ weekDays[c?.dayOfWeek ?? 0] }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatTimeRange(c?.startTime ?? 7, c?.endTime ?? ((c?.startTime ?? 7)+3)) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ (c?.bookedStudents||0) }} / {{ c?.maxStudents || 0 }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span v-if="c.status === 'Reschedule_Requested'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Pending Reschedule Approval
                    </span>
                    <span v-else-if="c.status === 'Not_Available_Requested'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Pending Schedule Removal
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Acceptance
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div v-if="c.status === 'Reschedule_Requested'" class="flex items-center justify-end space-x-2">
                      <span class="text-xs text-gray-500">Awaiting admin approval</span>
                    </div>
                    <div v-else-if="c.status === 'Not_Available_Requested'" class="flex items-center justify-end space-x-2">
                      <span class="text-xs text-gray-500">Awaiting admin approval</span>
                    </div>
                    <div v-else class="flex items-center justify-end space-x-2">
                      <button @click="accept(c)" class="px-3 py-1.5 text-xs font-normal text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100">Accept</button>
                      <button @click="decline(c)" class="px-3 py-1.5 text-xs font-normal text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">Decline</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Consultation Details Modal -->
    <div v-if="selectedConsultation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeConsultationModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ selectedConsultation.status === 'Reschedule_Requested' ? 'Pending Reschedule Info' 
              : selectedConsultation.status === 'Not_Available_Requested' ? 'Pending Schedule Removal Info'
              : 'Consultation Schedule Details' }}
          </h3>
        </div>
        <div class="px-6 py-4 space-y-4">
          <!-- Regular consultation details -->
          <div v-if="selectedConsultation.status !== 'Reschedule_Requested' && selectedConsultation.status !== 'Not_Available_Requested'">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <p class="text-sm text-gray-900">{{ formatConsultationDate(selectedConsultation) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <p class="text-sm text-gray-900">{{ weekDays[selectedConsultation.dayOfWeek] }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <p class="text-sm text-gray-900">{{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <p class="text-sm text-gray-900">{{ (selectedConsultation.endTime || (selectedConsultation.startTime + 3)) - selectedConsultation.startTime }} hours</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Available Slots</label>
              <p class="text-sm text-gray-900">{{ (selectedConsultation.bookedStudents || 0) }} / {{ selectedConsultation.maxStudents || 0 }} students</p>
            </div>
            <div v-if="selectedConsultation.notes">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <p class="text-sm text-gray-900">{{ selectedConsultation.notes }}</p>
            </div>
          </div>
          
          <!-- Reschedule request details -->
          <div v-else-if="selectedConsultation.status === 'Reschedule_Requested'">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-blue-800">Reschedule Request Pending</h3>
                  <div class="mt-2 text-sm text-blue-700">
                    <p>Your reschedule request is awaiting admin approval.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Original Schedule</label>
              <p class="text-sm text-gray-900">
                {{ weekDays[selectedConsultation.rescheduleRequest?.originalValues?.dayOfWeek || selectedConsultation.dayOfWeek] }}, 
                {{ formatTimeRange(selectedConsultation.rescheduleRequest?.originalValues?.startTime || selectedConsultation.startTime, selectedConsultation.rescheduleRequest?.originalValues?.endTime || selectedConsultation.endTime) }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Requested Schedule</label>
              <p class="text-sm text-gray-900">
                {{ weekDays[selectedConsultation.rescheduleRequest?.newDayOfWeek || selectedConsultation.dayOfWeek] }}, 
                {{ formatTimeRange(selectedConsultation.rescheduleRequest?.newStartTime || selectedConsultation.startTime, selectedConsultation.rescheduleRequest?.newEndTime || selectedConsultation.endTime) }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <p class="text-sm text-gray-900">{{ selectedConsultation.rescheduleRequest?.reason || 'Not specified' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Requested Date</label>
              <p class="text-sm text-gray-900">{{ new Date(selectedConsultation.rescheduleRequest?.requestedAt).toLocaleString() }}</p>
            </div>
          </div>
          
          <!-- Schedule removal request details -->
          <div v-else-if="selectedConsultation.status === 'Not_Available_Requested'">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Schedule Removal Request Pending</h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>Your schedule removal request is awaiting admin approval.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Schedule to Remove</label>
              <p class="text-sm text-gray-900">
                {{ weekDays[selectedConsultation.dayOfWeek] }}, 
                {{ formatTimeRange(selectedConsultation.startTime, selectedConsultation.endTime) }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <p class="text-sm text-gray-900">{{ selectedConsultation.adviserDeclineReason || selectedConsultation.declineReason || 'Not specified' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Requested Date</label>
              <p class="text-sm text-gray-900">{{ new Date(selectedConsultation.updatedAt).toLocaleString() }}</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button @click="closeConsultationModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            {{ selectedConsultation.status === 'Reschedule_Requested' || selectedConsultation.status === 'Not_Available_Requested' ? 'Close' : 'Cancel' }}
          </button>
          <template v-if="selectedConsultation.status !== 'Reschedule_Requested' && selectedConsultation.status !== 'Not_Available_Requested'">
            <button @click="decline(selectedConsultation)" class="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">
              Decline
            </button>
            <button @click="accept(selectedConsultation)" class="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100">
              Accept
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Decline Consultation Modal -->
    <div v-if="showDeclineModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="mt-2 text-center">
            <h3 class="text-lg font-medium text-gray-900">Decline Consultation Schedule</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Please select a reason for declining this consultation schedule:
              </p>
            </div>
          </div>
        </div>

        <!-- Decline Reason Selection -->
        <div class="mt-4">
          <div class="space-y-3">
            <label v-for="reason in declineReasons" :key="reason.value" class="flex items-center">
              <input 
                type="radio" 
                :value="reason.value" 
                v-model="selectedDeclineReason"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
              >
              <span class="ml-3 text-sm text-gray-700">{{ reason.label }}</span>
            </label>
            <!-- Other reason -->
            <label class="flex items-center">
              <input 
                type="radio" 
                value="other" 
                v-model="selectedDeclineReason"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
              >
              <span class="ml-3 text-sm text-gray-700">Other</span>
            </label>
            <div v-if="selectedDeclineReason === 'other'" class="mt-2">
              <textarea v-model="otherDeclineReason" rows="3" placeholder="Please specify other reason..." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"></textarea>
            </div>
          </div>
        </div>

        <!-- Secondary Options -->
        <div v-if="selectedDeclineReason" class="mt-6">
          <p class="text-sm text-gray-600 mb-3">What would you like to do?</p>
          <div class="space-y-3">
            <button 
              @click="showReschedule()"
              class="w-full flex items-center justify-center px-4 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reschedule
            </button>
            <button 
              @click="declineAsNotAvailable"
              class="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Not Available
            </button>
          </div>
        </div>

        <!-- Reschedule Options - Always show when decline modal is open -->
        <div v-if="showRescheduleOptions" class="mt-6">
          <div class="border-t pt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Select Available Time Slot</h4>
            
            <!-- Calendar View for Reschedule - Exact Admin Design -->
            <div class="bg-white border rounded-lg overflow-hidden">
              <!-- Calendar Header -->
              <div class="bg-gray-50 px-6 py-4 border-b">
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="text-lg font-medium text-gray-900">Reschedule Consultation</h5>
                    <p class="text-sm text-gray-500">{{ formatRescheduleWeekRange() }}</p>
                    <div v-if="currentSchedule || newSchedule" class="mt-2 flex items-center space-x-4 text-sm">
                      <div v-if="currentSchedule" class="flex items-center space-x-2">
                        <span class="text-gray-600">Current:</span>
                        <span class="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs">
                          {{ currentSchedule.day }} {{ currentSchedule.date }} {{ currentSchedule.time }}
                        </span>
                      </div>
                      <div v-if="newSchedule" class="flex items-center space-x-2">
                        <span class="text-gray-600">New:</span>
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                          {{ newSchedule.day }} {{ newSchedule.date }} {{ newSchedule.time }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Calendar Grid - Exact Admin Structure -->
              <div class="p-6">
                <div class="border rounded-lg">
                  <!-- Calendar Grid Header -->
                  <div class="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
                    <div class="py-3 px-2 text-gray-500 text-xs font-medium border-r border-gray-200 text-center">Time</div>
                    <div v-for="(day, index) in rescheduleWeekDaysWithDates" :key="index" 
                         class="py-3 px-2 text-gray-500 text-xs font-medium text-center">
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
                          :class="[
                            'relative p-0 min-h-[50px] border-r border-gray-100 transition-colors',
                            isRescheduleSlotAvailable(dayIndex, index) 
                              ? 'hover:bg-gray-50 cursor-pointer' 
                              : 'bg-gray-50 cursor-not-allowed opacity-60'
                          ]"
                          @click.stop="selectRescheduleSlot({ dayIndex, hour: index, day: day })"
                        >
                          <!-- Add button for empty slots -->
                          <div 
                            v-if="isRescheduleSlotAvailable(dayIndex, index)"
                            class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            @click.stop="selectRescheduleSlot({ dayIndex, hour: index, day: day })"
                          >
                            <div class="bg-gray-200 hover:bg-green-100 rounded-full p-1.5 transition-colors">
                              <svg class="h-3 w-3 text-gray-600 hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                    

                    <!-- Absolutely positioned consultation blocks -->
                    <div
                      v-for="(consultationBlock, index) in getPositionedRescheduleConsultationBlocks()"
                      :key="index"
                      class="absolute rounded-md text-xs bg-opacity-95 cursor-pointer overflow-hidden z-30 shadow-sm flex flex-col border"
                      :class="[
                        consultationBlock.consultation.isNewSchedule
                          ? 'bg-green-200 text-green-800 border-green-300 shadow-lg transform transition-all duration-300'
                          : consultationBlock.consultation.isCurrentSchedule
                          ? 'bg-blue-200 text-blue-800 border-blue-300'
                          : consultationBlock.consultation.isCutout
                          ? 'bg-transparent text-gray-500 border-gray-300 border-dashed border-2 cursor-pointer hover:bg-gray-50'
                          : 'bg-gray-200 text-gray-700 border-gray-300'
                      ]"
                      :style="{
                        left: `calc(${consultationBlock.dayIndex * 16.67}% + 16.67% + 1px)`,
                        top: `${consultationBlock.top}px`,
                        height: `${consultationBlock.height}px`,
                        width: 'calc(16.67% - 2px)'
                      }"
                      @click.stop="consultationBlock.consultation.isCutout ? returnToOriginalPosition() : null"
                    >
                      <div class="font-normal text-xs truncate p-2">
                        {{ 
                          consultationBlock.consultation.isNewSchedule 
                            ? 'New Schedule' 
                            : consultationBlock.consultation.isCurrentSchedule
                            ? 'Current Schedule'
                            : consultationBlock.consultation.isCutout
                            ? 'Original Position'
                            : 'Taken' 
                        }}
                      </div>
                      <div class="text-xs flex flex-col justify-between px-2 pb-2 flex-grow">
                        <span class="truncate font-normal">
                          {{ 
                            consultationBlock.consultation.isNewSchedule 
                              ? 'Your rescheduled time' 
                            : consultationBlock.consultation.isCurrentSchedule
                              ? 'Your current time'
                              : consultationBlock.consultation.isCutout
                              ? 'Click to return here'
                              : 'Unavailable' 
                          }}
                        </span>
                        <div class="mt-1 flex flex-col">
                          <span class="text-[10px] text-gray-700">
                            {{ formatConsultationDate(consultationBlock.consultation) }}
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
            </div>
            
            <p v-if="availableTimeSlots.length === 0" class="text-sm text-gray-500 text-center py-2">
              No available time slots for this week
            </p>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="mt-6 flex justify-end space-x-3">
          <button 
            @click="closeDeclineModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            v-if="selectedRescheduleSlot"
            @click="submitRescheduleRequest"
            class="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
          >
            Submit Reschedule Request
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../../services/api'
import { notificationService } from '../../services/notificationService'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()

// Helper: wait for auth id before making adviser API calls
const waitForAuthId = async (timeoutMs = 2000) => {
  const start = Date.now()
  while ((!authStore.user || !authStore.user._id) && Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, 50))
  }
  return authStore.user && authStore.user._id ? authStore.user._id : null
}

const currentView = ref('calendar')
const currentWeek = ref(new Date())
const pendingConsultations = ref([])
const selectedConsultation = ref(null)
const hasNavigated = ref(false)

// Decline modal state
const showDeclineModal = ref(false)
const selectedDeclineReason = ref('')
const showRescheduleOptions = ref(false)
const selectedRescheduleSlot = ref(null)
const declineConsultation = ref(null)
const otherDeclineReason = ref('')

// Reschedule calendar state
const rescheduleWeek = ref(new Date())

// Reschedule consultations data
const rescheduleConsultations = ref([])

// Current and new schedule display
const currentSchedule = ref(null)
const newSchedule = ref(null)

// Reschedule week days with dates - for the specific week of the pending consultation
const rescheduleWeekDaysWithDates = computed(() => {
  const start = getWeekStart(rescheduleWeek.value)
  return weekDays.map((day, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      name: day.substring(0, 3),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  })
})

// Decline reasons
const declineReasons = ref([
  { value: 'class_conflict', label: 'Class schedule conflict' },
  { value: 'on_leave', label: 'On leave (Sick/Filled)' },
  { value: 'in_seminar', label: 'In seminar (Academic or Business)' }
])

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const weekDaysWithDates = computed(() => {
  const start = getWeekStart(currentWeek.value)
  return weekDays.map((day, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      name: day.substring(0, 3),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  })
})

const timeSlots = computed(() => {
  const slots = []
  for (let hour = 7; hour <= 17; hour++) {
    slots.push(hour)
  }
  return slots
})

const getConsultationsForSlotAndDay = (hour, dayIndex) => {
  return pendingConsultations.value.filter(consultation => {
    if (!consultation.dayOfWeek && consultation.dayOfWeek !== 0) return false
    if (consultation.dayOfWeek !== dayIndex) return false
    if (!consultation.startTime) return false
    
    const startHour = consultation.startTime
    const endHour = consultation.endTime || (startHour + 3)
    
    return hour >= startHour && hour < endHour
  })
}

const formatTime = (hour) => {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${ampm}`
}
const formatTimeRange = (startHour, endHour) => `${formatTime(startHour)} - ${formatTime(endHour)}`
const formatConsultationDate = (c) => {
  if (c.dayOfWeek === undefined) return ''
  // Use the current week being viewed instead of the consultation's original weekStart
  const currentWeekStart = getWeekStart(currentWeek.value)
  const d = new Date(currentWeekStart)
  d.setDate(currentWeekStart.getDate() + Number(c.dayOfWeek))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Available time slots for rescheduling (current week)
const availableTimeSlots = computed(() => {
  const slots = []
  const weekStart = getWeekStart(rescheduleWeek.value) // Use reschedule week
  
  // Generate all possible time slots for current week
  for (let dayIndex = 0; dayIndex < 5; dayIndex++) { // Monday to Friday
    for (let hour = 7; hour <= 17; hour++) {
      // Check if this slot is available (not occupied by any consultation)
      const isOccupied = rescheduleConsultations.value.some(consultation => {
        return consultation.dayOfWeek === dayIndex && 
               consultation.startTime <= hour && 
               (consultation.endTime || consultation.startTime + 3) > hour
      })
      
      if (!isOccupied) {
        slots.push({
          day: weekDays[dayIndex],
          dayIndex,
          hour,
          date: new Date(weekStart.getTime() + dayIndex * 24 * 60 * 60 * 1000)
        })
      }
    }
  }
  
  return slots
})

// Check if reschedule slot is available
const isRescheduleSlotAvailable = (dayIndex, hour) => {
  // Convert hour index to actual hour (7 + index)
  const actualHour = 7 + hour
  const actualEndHour = actualHour + 3 // Default 3-hour duration
  
  // Check if there's already a consultation at this time slot
  const hasConsultation = rescheduleConsultations.value.some(consultation => {
    // Skip if it's the current consultation being rescheduled
    if (declineConsultation.value && consultation._id === declineConsultation.value._id) {
      return false
    }
    
    const consultationStart = Number(consultation.startTime)
    const consultationEnd = Number(consultation.endTime ?? (consultationStart + 3))
    
    // Check for time overlap
    const hasTimeOverlap = (
      (actualHour < consultationEnd && actualEndHour > consultationStart) &&
      consultation.dayOfWeek === dayIndex &&
      (consultation.status === 'Active' || consultation.status === 'Pending_Adviser_Acceptance' || consultation.status === 'Reschedule_Requested' || consultation.status === 'Not_Available_Requested')
    )
    
    return hasTimeOverlap
  })
  
  return !hasConsultation
}

// Load consultations for reschedule week
const loadRescheduleConsultations = async () => {
  try {
    const start = getWeekStart(rescheduleWeek.value)
    const end = getWeekEnd(rescheduleWeek.value)

    // Call adviser-accessible weekly endpoint to get Active + Pending schedules
    const res = await api.get(`/consultations/week-accessible/${start.toISOString()}/${end.toISOString()}`)
    const list = Array.isArray(res.data) ? res.data : []

  rescheduleConsultations.value = list

  console.log('Loaded reschedule consultations:', rescheduleConsultations.value)
  try {
    const dbgBlocks = getPositionedRescheduleConsultationBlocks()
    console.log('Positioned reschedule blocks:', dbgBlocks.length, dbgBlocks)
  } catch (e) {
    console.warn('Block positioning error:', e)
  }
    console.log('Reschedule week:', rescheduleWeek.value)
    console.log('Show reschedule options:', showRescheduleOptions.value)
  } catch (error) {
    console.error('Error loading reschedule consultations:', error)
    rescheduleConsultations.value = []
  }
}

// Removed auto-open watcher; calendar opens only after clicking Reschedule

// Keep only one reason; clear custom text when changing away from 'other'
watch(selectedDeclineReason, (val) => {
  if (val !== 'other') {
    otherDeclineReason.value = ''
  }
})

// Helper functions for consultation positioning (from admin)
const convertTimeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  let totalMinutes = hours * 60 + (minutes || 0)
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60
  if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60
  return totalMinutes
}

const getPositionedRescheduleConsultationBlocks = () => {
  // Constants for positioning
  const ROW_HEIGHT = 50 // Match the min-height of time slots

  // Process each consultation to determine its position
  const consultationBlocks = []
  
  // Add all consultations from the API (excluding the current one being rescheduled)
  rescheduleConsultations.value.forEach(consultation => {
    // Skip if it's the current consultation being rescheduled
    if (declineConsultation.value && consultation._id === declineConsultation.value._id) {
      return
    }
    
    // Ensure required fields
    const dayIdx = Number(consultation.dayOfWeek)
    if (Number.isNaN(dayIdx) || dayIdx < 0 || dayIdx > 4) return
    const startHour = Number(consultation.startTime)
    const endHour = Number(consultation.endTime ?? (startHour + 3))
    if (Number.isNaN(startHour) || Number.isNaN(endHour)) return
    
    // Calculate row indices directly from hour values
    const startRowIndex = Math.max(0, startHour - 7) // 7 AM = index 0
    const endRowIndex = Math.min(formattedTimeSlots.length - 1, endHour - 7) // 5 PM = index 10
    
    if (startRowIndex >= 0 && endRowIndex >= startRowIndex) {
      const top = startRowIndex * ROW_HEIGHT
      const height = (endRowIndex - startRowIndex + 1) * ROW_HEIGHT
      
      consultationBlocks.push({
        consultation,
        dayIndex: dayIdx,
        top,
        height
      })
    }
  })
  
  // Show current schedule block in its original position initially
  if (declineConsultation.value && !selectedRescheduleSlot.value) {
    const originalDayIdx = Number(declineConsultation.value.dayOfWeek)
    const originalStartHour = Number(declineConsultation.value.startTime)
    const originalEndHour = Number(declineConsultation.value.endTime ?? (originalStartHour + 3))
    
    if (!Number.isNaN(originalDayIdx) && !Number.isNaN(originalStartHour) && !Number.isNaN(originalEndHour)) {
      const startRowIndex = Math.max(0, originalStartHour - 7)
      const endRowIndex = Math.min(formattedTimeSlots.length - 1, originalEndHour - 7)
      
      if (startRowIndex >= 0 && endRowIndex >= startRowIndex) {
        const top = startRowIndex * ROW_HEIGHT
        const height = (endRowIndex - startRowIndex + 1) * ROW_HEIGHT
        
        // Create current schedule object for display
        const currentScheduleConsultation = {
          ...declineConsultation.value,
          isCurrentSchedule: true
        }
        
        consultationBlocks.push({
          consultation: currentScheduleConsultation,
          dayIndex: originalDayIdx,
          top,
          height
        })
      }
    }
  }
  
  // Show cutout in original position when schedule has moved
  if (declineConsultation.value && selectedRescheduleSlot.value) {
    const originalDayIdx = Number(declineConsultation.value.dayOfWeek)
    const originalStartHour = Number(declineConsultation.value.startTime)
    const originalEndHour = Number(declineConsultation.value.endTime ?? (originalStartHour + 3))
    
    if (!Number.isNaN(originalDayIdx) && !Number.isNaN(originalStartHour) && !Number.isNaN(originalEndHour)) {
      const startRowIndex = Math.max(0, originalStartHour - 7)
      const endRowIndex = Math.min(formattedTimeSlots.length - 1, originalEndHour - 7)
      
      if (startRowIndex >= 0 && endRowIndex >= startRowIndex) {
        const top = startRowIndex * ROW_HEIGHT
        const height = (endRowIndex - startRowIndex + 1) * ROW_HEIGHT
        
        // Create cutout object for display
        const cutoutConsultation = {
          ...declineConsultation.value,
          isCutout: true
        }
        
        consultationBlocks.push({
          consultation: cutoutConsultation,
          dayIndex: originalDayIdx,
          top,
          height
        })
      }
    }
  }
  
  // Add the new schedule block (only if a slot has been selected)
  if (selectedRescheduleSlot.value && declineConsultation.value) {
    const dayIdx = selectedRescheduleSlot.value.dayIndex
    const startHour = selectedRescheduleSlot.value.hour
    const endHour = startHour + 3
    
    const startRowIndex = Math.max(0, startHour - 7)
    const endRowIndex = Math.min(formattedTimeSlots.length - 1, endHour - 7)
    
    if (startRowIndex >= 0 && endRowIndex >= startRowIndex) {
      const top = startRowIndex * ROW_HEIGHT
      const height = (endRowIndex - startRowIndex + 1) * ROW_HEIGHT
      
      // Create a new schedule object for display
      const newScheduleConsultation = {
        ...declineConsultation.value,
        dayOfWeek: dayIdx,
        startTime: startHour,
        endTime: endHour,
        isNewSchedule: true
      }
      
      consultationBlocks.push({
        consultation: newScheduleConsultation,
        dayIndex: dayIdx,
        top,
        height
      })
    }
  }
  
  console.log('Positioned reschedule blocks:', consultationBlocks.length, consultationBlocks)
  
  // Debug: Log each block's positioning details
  consultationBlocks.forEach((block, index) => {
    console.log(`Block ${index}:`, {
      dayIndex: block.dayIndex,
      top: block.top,
      height: block.height,
      left: `calc(${block.dayIndex * 16.67}% + 16.67% + 1px)`,
      width: 'calc(16.67% - 2px)',
      consultation: block.consultation
    })
  })
  
  return consultationBlocks
}

// Get consultation color classes for reschedule calendar
const getRescheduleConsultationColorClasses = (consultation) => {
  // Soft, muted colors for each adviser
  const colors = [
    'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
    'bg-green-100 text-green-700 hover:bg-green-200 border-green-200',
    'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200',
    'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200',
    'bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200',
    'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200',
    'bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200',
    'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-200',
    'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
    'bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200',
    'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
    'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200',
    'bg-lime-100 text-lime-700 hover:bg-lime-200 border-lime-200',
    'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
    'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200',
  ]

  let adviserId = consultation.adviser._id || consultation.adviser
  if (typeof adviserId === 'string' && !adviserId.match(/^[0-9a-fA-F]{24}$/)) {
    const nameHash = consultation.adviser.split('').reduce((hash, char) => {
      return hash + char.charCodeAt(0)
    }, 0)
    adviserId = nameHash.toString()
  }

  const colorIndex = adviserId ? adviserId.slice(-1).charCodeAt(0) % colors.length : 0
  return colors[colorIndex]
}

// Helper functions for consultation display (already defined above)
const formatStatus = (status) => {
  const statusMap = {
    'Active': 'Active',
    'Pending_Adviser_Acceptance': 'Pending',
    'Not_Available': 'Not Available',
    'Reschedule_Requested': 'Reschedule'
  }
  return statusMap[status] || status
}

const getStatusColor = (status) => {
  const colorMap = {
    'Active': 'text-green-700',
    'Pending_Adviser_Acceptance': 'text-yellow-700',
    'Not_Available': 'text-red-700',
    'Reschedule_Requested': 'text-blue-700'
  }
  return colorMap[status] || 'text-gray-700'
}

// Check if consultation is the current one being rescheduled

// Check if a slot is currently selected
const isSelectedSlot = (dayIndex, hourIndex) => {
  return selectedRescheduleSlot.value && 
         selectedRescheduleSlot.value.dayIndex === dayIndex && 
         selectedRescheduleSlot.value.hour === hourIndex
}

// Return to original position
const returnToOriginalPosition = () => {
  selectedRescheduleSlot.value = null
}



// Check for time conflicts with detailed messaging
const checkTimeConflict = (dayIndex, startHour) => {
  const endHour = startHour + 3
  
  // Check all consultations for conflicts
  for (const consultation of rescheduleConsultations.value) {
    // Skip if it's the current consultation being rescheduled
    if (declineConsultation.value && consultation._id === declineConsultation.value._id) {
      continue
    }
    
    // Skip if not on the same day
    if (consultation.dayOfWeek !== dayIndex) {
      continue
    }
    
    // Skip if not active, pending, reschedule requested, or not available requested
    if (consultation.status !== 'Active' && consultation.status !== 'Pending_Adviser_Acceptance' && consultation.status !== 'Reschedule_Requested' && consultation.status !== 'Not_Available_Requested') {
      continue
    }
    
    const consultationStart = Number(consultation.startTime)
    const consultationEnd = Number(consultation.endTime ?? (consultationStart + 3))
    
    // Check for time overlap
    if (startHour < consultationEnd && endHour > consultationStart) {
      const conflictStart = Math.max(startHour, consultationStart)
      const conflictEnd = Math.min(endHour, consultationEnd)
      const conflictDuration = conflictEnd - conflictStart
      
      return {
        hasConflict: true,
        message: `Overlaps with existing schedule (${formatTime(consultationStart)}-${formatTime(consultationEnd)}) by ${conflictDuration} hour(s)`
      }
    }
  }
  
  return { hasConflict: false, message: '' }
}

// Format reschedule week range
const formatRescheduleWeekRange = () => {
  const start = getWeekStart(rescheduleWeek.value)
  const end = getWeekEnd(rescheduleWeek.value)
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

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

// Admin-like helpers for positioned blocks
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

// convertTimeToMinutes already defined above

const getPositionedPendingBlocks = () => {
  const ROW_HEIGHT = 50
  const timeSlotRanges = formattedTimeSlots.map(slot => {
    const [start, end] = slot.split(' - ')
    return { start: convertTimeToMinutes(start), end: convertTimeToMinutes(end) }
  })

  const dayIndices = { 'Monday':0, 'Tuesday':1, 'Wednesday':2, 'Thursday':3, 'Friday':4 }
  const result = []

  const weekStart = getWeekStart(currentWeek.value)
  const weekEnd = getWeekEnd(currentWeek.value)

  const inWeek = (c) => {
    if (!c.weekStart || !c.weekEnd) return false
    const cs = new Date(c.weekStart)
    const ce = new Date(c.weekEnd)
    return cs <= weekEnd && ce >= weekStart
  }

  pendingConsultations.value
    .filter(inWeek)
    .forEach(c => {
      const dayIndex = dayIndices[weekDays[c.dayOfWeek]]
      if (dayIndex === undefined) return

      const startLabel = formatTime(c.startTime)
      const endLabel = formatTime(c.endTime || (c.startTime + 3))

      let startRowIndex = -1
      let endRowIndex = -1
      formattedTimeSlots.forEach((slot, i) => {
        if (slot.startsWith(startLabel)) startRowIndex = i
        if (slot.endsWith(endLabel)) endRowIndex = i
      })

      if (startRowIndex === -1 || endRowIndex === -1) {
        const sMin = convertTimeToMinutes(startLabel)
        const eMin = convertTimeToMinutes(endLabel)
        if (startRowIndex === -1) {
          let best = Infinity, bestIdx = 0
          timeSlotRanges.forEach((range, i) => {
            const d = Math.abs(range.start - sMin)
            if (d < best) { best = d; bestIdx = i }
          })
          startRowIndex = bestIdx
        }
        if (endRowIndex === -1) {
          let best = Infinity, bestIdx = startRowIndex
          timeSlotRanges.forEach((range, i) => {
            const d = Math.abs(range.end - eMin)
            if (d < best) { best = d; bestIdx = i }
          })
          endRowIndex = bestIdx
        }
      }

      if (startRowIndex === -1) startRowIndex = 0
      if (endRowIndex === -1 || endRowIndex < startRowIndex) endRowIndex = startRowIndex

      const top = startRowIndex * ROW_HEIGHT
      const height = (endRowIndex - startRowIndex + 1) * ROW_HEIGHT

      result.push({ consultation: c, dayIndex, top, height })
    })

  return result
}

const loadPending = async () => {
  try {
    // Load all pending acceptances for adviser
    const res = await api.get('/consultations/pending-acceptance')
    const all = Array.isArray(res.data) ? res.data : []
    
    // If this is the initial load and we have pending consultations, 
    // automatically navigate to the week with the first pending consultation
    if (all.length > 0 && !hasNavigated.value) {
      const firstConsultation = all[0]
      if (firstConsultation.weekStart) {
        currentWeek.value = new Date(firstConsultation.weekStart)
        hasNavigated.value = true
      }
    }
    
    // Filter consultations for the current week display
    const start = getWeekStart(currentWeek.value)
    const end = getWeekEnd(currentWeek.value)
    pendingConsultations.value = all.filter(c => {
      if (!c.weekStart || !c.weekEnd) return false
      const cs = new Date(c.weekStart)
      const ce = new Date(c.weekEnd)
      return cs <= end && ce >= start
    })
  } catch (e) {
    pendingConsultations.value = []
  }
}

const previousWeek = async () => { 
  hasNavigated.value = true
  const d = new Date(currentWeek.value)
  d.setDate(d.getDate()-7)
  currentWeek.value = d
  await loadPending() 
}
const nextWeek = async () => { 
  hasNavigated.value = true
  const d = new Date(currentWeek.value)
  d.setDate(d.getDate()+7)
  currentWeek.value = d
  await loadPending() 
}
const previousMonth = async () => { 
  hasNavigated.value = true
  const d = new Date(currentWeek.value)
  d.setMonth(d.getMonth()-1)
  currentWeek.value = d
  await loadPending() 
}
const nextMonth = async () => { 
  hasNavigated.value = true
  const d = new Date(currentWeek.value)
  d.setMonth(d.getMonth()+1)
  currentWeek.value = d
  await loadPending() 
}
const goToCurrentWeek = async () => { 
  hasNavigated.value = true
  currentWeek.value = new Date()
  await loadPending() 
}

const accept = async (c) => {
  try {
    await api.post(`/consultations/${c._id}/accept`)
    notificationService.showSuccess('Schedule accepted')
    closeConsultationModal()
    await loadPending()
  } catch (e) {
    notificationService.showError('Failed to accept schedule')
  }
}

const openConsultationModal = (consultation) => {
  selectedConsultation.value = consultation
}

const closeConsultationModal = () => {
  selectedConsultation.value = null
}

// Decline consultation with modal
const decline = async (c) => {
  console.log('Decline function called with consultation:', c)
  declineConsultation.value = c
  selectedDeclineReason.value = ''
  showRescheduleOptions.value = false
  selectedRescheduleSlot.value = null
  showDeclineModal.value = true
  console.log('Decline modal opened, showRescheduleOptions:', showRescheduleOptions.value)
  
  // Prefer to keep calendar closed until user chooses Reschedule
  // Prepare week reference so showReschedule() can open the right week
  if (c.weekStart) {
    rescheduleWeek.value = new Date(c.weekStart)
  }
  // Close the consultation details modal
  closeConsultationModal()
}

// Open reschedule calendar after user selects reason and clicks Reschedule
const showReschedule = async () => {
  if (!selectedDeclineReason.value) {
    notificationService.showWarning('Please select a decline reason first')
    return
  }
  // Ensure other reason has content if chosen
  if (selectedDeclineReason.value === 'other' && !otherDeclineReason.value.trim()) {
    notificationService.showWarning('Please specify your reason')
    return
  }
  showRescheduleOptions.value = true
  // Ensure week is set to the consultation's week if available
  if (declineConsultation.value?.weekStart) {
    rescheduleWeek.value = new Date(declineConsultation.value.weekStart)
  }
  
  // Set current schedule for display
  if (declineConsultation.value) {
    currentSchedule.value = {
      day: weekDays[declineConsultation.value.dayOfWeek],
      date: formatConsultationDate(declineConsultation.value),
      time: formatTimeRange(declineConsultation.value.startTime, declineConsultation.value.endTime)
    }
  }
  
  await loadRescheduleConsultations()
}

// Close decline modal
const closeDeclineModal = () => {
  showDeclineModal.value = false
  declineConsultation.value = null
  selectedDeclineReason.value = ''
  showRescheduleOptions.value = false
  selectedRescheduleSlot.value = null
  currentSchedule.value = null
  newSchedule.value = null
  rescheduleWeek.value = new Date() // Reset to current week
}

// Decline as not available
const declineAsNotAvailable = async () => {
  try {
    await api.post(`/consultations/${declineConsultation.value._id}/decline`, { 
      reason: selectedDeclineReason.value === 'other' ? (otherDeclineReason.value || 'Other') : selectedDeclineReason.value,
      action: 'not_available'
    })
    notificationService.showSuccess('Schedule declined and marked as not available')
    closeDeclineModal()
    closeConsultationModal()
    await loadPending()
  } catch (e) {
    notificationService.showError('Failed to decline schedule')
  }
}

// Select reschedule slot
const selectRescheduleSlot = (slot) => {
  // Convert hour index to actual hour (7 + index)
  const actualHour = 7 + slot.hour
  
  // Check for conflicts with existing schedules
  const conflictDetails = checkTimeConflict(slot.dayIndex, actualHour)
  if (conflictDetails.hasConflict) {
    notificationService.showWarning(`Time conflict: ${conflictDetails.message}`)
    return
  }
  
  selectedRescheduleSlot.value = {
    ...slot,
    hour: actualHour
  }
  
  // Set new schedule for display
  newSchedule.value = {
    day: weekDays[slot.dayIndex],
    date: formatConsultationDate({
      weekStart: rescheduleWeek.value,
      dayOfWeek: slot.dayIndex
    }),
    time: formatTimeRange(actualHour, actualHour + 3)
  }
  
  // Note: Current schedule block is removed when new schedule is selected
}

// Submit reschedule request
const submitRescheduleRequest = async () => {
  try {
    await api.post(`/consultations/${declineConsultation.value._id}/reschedule-request`, {
      reason: selectedDeclineReason.value === 'other' ? (otherDeclineReason.value || 'Other') : selectedDeclineReason.value,
      newDayOfWeek: selectedRescheduleSlot.value.dayIndex,
      newStartTime: selectedRescheduleSlot.value.hour,
      newEndTime: selectedRescheduleSlot.value.hour + 3
    })
    notificationService.showSuccess('Reschedule request submitted for admin review')
    closeDeclineModal()
    closeConsultationModal()
    await loadPending()
  } catch (e) {
    notificationService.showError('Failed to submit reschedule request')
  }
}

onMounted(async () => {
  await loadPending()
  // If no consultations are shown in current week, try to find and navigate to a week with consultations
  if (pendingConsultations.value.length === 0) {
    try {
      const res = await api.get('/consultations/pending-acceptance')
      const all = Array.isArray(res.data) ? res.data : []
      if (all.length > 0) {
        const firstConsultation = all[0]
        if (firstConsultation.weekStart) {
          currentWeek.value = new Date(firstConsultation.weekStart)
          await loadPending()
        }
      }
    } catch (e) {
      console.error('Error loading pending consultations:', e)
    }
  }
})
</script>

<style scoped>
</style>


