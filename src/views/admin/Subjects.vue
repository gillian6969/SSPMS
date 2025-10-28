<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">SSP Subjects</h1>
            <p class="text-gray-500 mt-1 font-normal">Manage Student Success Program subjects and sessions</p>
          </div>
          <button 
            @click="openAddModal" 
              class="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 transition-colors"
          >
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Subject
            </span>
          </button>
        </div>
      </div>

      <!-- Subjects Table using UnifiedTable -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-7xl mx-auto mt-4">
        <UnifiedTable
          :data="filteredSubjects"
          :columns="tableColumns"
          :sortable-columns="sortableColumns"
          :loading="loading"
          loading-text="Loading subjects..."
          search-placeholder="Search by SSP code"
          empty-state-title="No subjects found"
          empty-state-message="Try adjusting your search criteria or add a subject to get started"
          @search="handleUnifiedSearch"
          @sort="handleUnifiedSort"
          @page-change="handleUnifiedPageChange"
        >
          <template #filters>
            <!-- School Year Filter -->
            <select
              v-model="filters.schoolYear"
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All School Years</option>
              <option v-for="schoolYear in availableSchoolYears" :key="schoolYear" :value="schoolYear">{{ schoolYear }}</option>
            </select>

            <!-- Year Level Filter from system options -->
            <select
              v-model="filters.yearLevel"
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Years</option>
              <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }} Year</option>
            </select>

            <!-- Semester Filter -->
            <select 
              v-model="filters.semester" 
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Semesters</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
            </select>

            <!-- Hours Filter from system options -->
            <select 
              v-model="filters.hours" 
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Hours</option>
              <option v-for="hour in hoursOptions" :key="hour" :value="hour">{{ hour }} {{ hour === 1 ? 'Hour' : 'Hours' }}</option>
            </select>
          </template>

          <template #row="{ item: subject }">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-sm font-normal text-blue-600">
                        {{ subject.sspCode?.charAt(0) || 'S' }}
                      </span>
                    </div>
                    <div>
                      <div class="text-sm font-normal text-gray-800">{{ subject.sspCode || 'No Code' }}</div>
                      <div class="text-xs text-gray-500">Subject Code</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ subject.yearLevel }} Year
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ subject.schoolYear || '2024 - 2025' }}
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-normal rounded-md"
                    :class="subject.semester === '1st Semester' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                  >
                    {{ subject.semester }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ subject.hours || '1' }} {{ subject.hours === 1 ? 'Hour' : 'Hours' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ subject.sessions ? subject.sessions.length : 0 }} / 18
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button 
                      @click="viewSessions(subject)" 
                      class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      View Sessions
                    </button>
                  </div>
                </td>
          </template>
        </UnifiedTable>
      </div>
    </div>

    <!-- Add Subject Modal -->
    <UnifiedModal v-model="showAddModal" title="Add New SSP Subject" @close="closeAddModal">
      <template #default>
        <div class="space-y-6">
          <!-- Basic Information -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-4">Subject Information</h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SSP Code *</label>
                  <input
                    v-model="newSubject.sspCode"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.sspCode }"
                    :placeholder="getTemplateSSPCode()"
                    readonly
                  />
                  <p v-if="errors.sspCode" class="mt-1 text-sm text-red-600">{{ errors.sspCode }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Year Level *</label>
                  <select v-model="newSubject.yearLevel" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm" :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.yearLevel }">
                    <option value="">Select Year Level</option>
                    <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }} Year</option>
                  </select>
                  <p v-if="errors.yearLevel" class="mt-1 text-sm text-red-600">{{ errors.yearLevel }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Hours *</label>
                  <select v-model="newSubject.hours" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm" :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.hours }">
                    <option v-for="hour in hoursOptions" :key="hour" :value="hour.toString()">{{ hour }} {{ hour === 1 ? 'Hour' : 'Hours' }}</option>
                  </select>
                  <p v-if="errors.hours" class="mt-1 text-sm text-red-600">{{ errors.hours }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                  <select v-model="newSubject.semester" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm" :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.semester }">
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                  </select>
                  <p v-if="errors.semester" class="mt-1 text-sm text-red-600">{{ errors.semester }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">School Year *</label>
                  <select
                    v-model="newSubject.schoolYear"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.schoolYear }"
                  >
                    <option value="">Select School Year</option>
                    <option v-for="schoolYear in availableSchoolYears" :key="schoolYear" :value="schoolYear">{{ schoolYear }}</option>
                  </select>
                  <p v-if="errors.schoolYear" class="mt-1 text-sm text-red-600">{{ errors.schoolYear }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sessions Count -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-800">Sessions Defined</h4>
              <span class="text-sm text-blue-700">{{ sessionTitles.filter(t => t).length || 0 }} / 18 sessions</span>
            </div>
          </div>

          <!-- Template Validation Warning -->
          <div v-if="newSubject.yearLevel && newSubject.semester && newSubject.schoolYear && !hasValidTemplate" class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 class="text-sm font-medium text-yellow-800">Template Not Configured</h4>
                <p class="text-sm text-yellow-700 mt-1">
                  {{ newSubject.yearLevel }} Year - {{ newSubject.semester }} for {{ newSubject.schoolYear }} is not yet set up in Subject Settings. 
                  Please configure it in System Options first.
                </p>
              </div>
            </div>
          </div>

          <!-- Sessions Table -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-4">{{ newSubject.semester }} Sessions</h4>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div class="max-h-96 overflow-y-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50 sticky top-0">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Day</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Title</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <!-- Day 0 - Introduction (read-only) -->
                    <tr class="bg-blue-50">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800">0</td>
                      <td class="px-4 py-3">
                        <input 
                          type="text" 
                          v-model="sessionTitles[0]" 
                          class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                          readonly
                        />
                        <span class="text-xs text-gray-500 mt-1 block">Auto-added introduction session</span>
                      </td>
                    </tr>
                    <!-- Days 1-17 -->
                    <tr v-for="day in 17" :key="day" :class="{ 'bg-amber-50': isExamSession(day) }">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ day }}</td>
                      <td class="px-4 py-3">
                        <input 
                          type="text" 
                          v-model="sessionTitles[day]" 
                          class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                          :class="{ 'bg-amber-50 border-amber-300': isExamSession(day) }"
                          readonly
                          :placeholder="getTemplateSessionTitle(day-1)"
                        />
                        <span v-if="isExamSession(day)" class="text-xs text-amber-600 mt-1 block">
                          <span v-if="getExamDateForDay(day)" class="block text-xs text-amber-700 font-medium">
                            {{ getExamDateForDay(day) }}
                          </span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        </div>
      </template>
      <template #footer>
        <button @click="closeAddModal" class="px-5 py-2.5 mr-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200">Cancel</button>
        <button @click="addSubject" class="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-800 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-colors duration-200">Add Subject</button>
      </template>
    </UnifiedModal>
    
    <!-- View Sessions Modal -->
    <UnifiedModal v-model="showSessionsModal" title="View Sessions" @close="showSessionsModal = false">
      <template #default>
        <div class="space-y-6">
          <!-- Basic Information -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-4">Subject Information</h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SSP Code</label>
                  <div class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm font-medium text-gray-800">
                    {{ selectedSubject?.sspCode }}
        </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
                  <div class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm font-medium text-gray-800">
                    {{ selectedSubject?.yearLevel }} Year
      </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                  <div class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm font-medium text-gray-800">
                    {{ selectedSubject?.hours }} {{ selectedSubject?.hours === 1 ? 'Hour' : 'Hours' }}
            </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                  <div class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm font-medium text-gray-800">
                    {{ selectedSubject?.semester }}
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                  <div class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm font-medium text-gray-800">
                    {{ selectedSubject?.schoolYear || '2024 - 2025' }}
                </div>
              </div>
            </div>
          </div>
          </div>
          <!-- Sessions Count -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-800">Sessions Defined</h4>
              <span class="text-sm text-blue-700">{{ sortedSessions.length || 0 }} / 18 sessions</span>
            </div>
          </div>

          <!-- Sessions Table -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-4">{{ selectedSubject?.semester }} Sessions</h4>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div class="max-h-96 overflow-y-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50 sticky top-0">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Day</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Title</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                  <tr v-for="session in sortedSessions" :key="session.day" :class="{ 'bg-amber-50': isSessionAnExam(session) }">
                    <td class="px-4 py-3 text-sm font-medium text-gray-800 text-center">{{ session.day }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800">
                      {{ session.title }}
                      <span v-if="isSessionAnExam(session)" class="ml-2 inline-flex px-2 py-1 text-xs font-normal rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                        Exam
                      </span>
                      <span v-if="isSessionAnExam(session)" class="text-xs text-amber-600 mt-1 block">
                        <span v-if="session.startDate && session.endDate" class="block text-xs text-amber-700 font-medium">
                          {{ formatDate(session.startDate) }} - {{ formatDate(session.endDate) }}
                        </span>
                        <span v-else-if="getExamDateForDayView(session.day)" class="block text-xs text-amber-700 font-medium">
                          {{ getExamDateForDayView(session.day) }}
                        </span>
                      </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        
        </div>
      </template>
      <template #footer>
        <button @click="showSessionsModal = false" class="px-5 py-2.5 mr-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200">Close</button>
      </template>
    </UnifiedModal>
    
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import UnifiedTable from '../../components/ui/UnifiedTable.vue'
import UnifiedModal from '../../components/ui/UnifiedModal.vue'
import { subjectService } from '../../services/subjectService'
import { notificationService } from '../../services/notificationService'
import { systemOptionsService } from '../../services/systemOptionsService'

// State
const subjects = ref([])
const allSubjects = ref([])
const loading = ref(false)
const showAddModal = ref(false)
const sessionTitles = ref(Array(18).fill(''))
const selectedSubject = ref(null)
const showSessionsModal = ref(false)
const currentSubject = ref(null)

// Dynamic options
const yearLevelOptions = ref(['1st', '2nd', '3rd', '4th'])
const hoursOptions = ref([1, 2, 3])
const availableSchoolYears = ref([])
const defaultZeroDayTitle = ref('INTRODUCTION')
const examSessionDays = ref([
  { name: 'Prelim Exam', day: 5 },
  { name: 'Midterm Exam', day: 10 },
  { name: 'Final Exam', day: 15 }
])

// Form state
const newSubject = reactive({
  sspCode: '',
  name: '',
  yearLevel: '',
  sessions: [],
  semester: '1st Semester',
  hours: 1,
  schoolYear: ''
})

// Error state
const errors = reactive({
  sspCode: '',
  yearLevel: '',
  semester: '',
  hours: '',
  schoolYear: ''
})

// Filters
const filters = reactive({
  schoolYear: '',
  yearLevel: '',
  semester: '',
  hours: '',
  search: ''
})

// Search input debounce
let searchTimeout = null

onMounted(async () => {
  try {
    // First fetch system options
    const systemOptions = await systemOptionsService.getAll()
    
    // Cache the system options for template access
    systemOptionsService.setCachedOptions(systemOptions)
    
    // Update school year options
    if (systemOptions?.subject?.sspSubjectsBySchoolYear) {
      availableSchoolYears.value = Object.keys(systemOptions.subject.sspSubjectsBySchoolYear)
      console.log('Available school years:', availableSchoolYears.value)
      console.log('SSP Subjects by School Year data:', systemOptions.subject.sspSubjectsBySchoolYear)
    } else {
      console.log('No sspSubjectsBySchoolYear found in system options')
    }
    
    // Update zero day title
    if (systemOptions?.subject?.defaultZeroDayTitle) {
      defaultZeroDayTitle.value = systemOptions.subject.defaultZeroDayTitle
      console.log('Setting default zero day title from system config:', defaultZeroDayTitle.value)
    }
    
    // Update year level options - now use subject-specific year levels
    if (systemOptions?.subject?.yearLevels && systemOptions.subject.yearLevels.length > 0) {
      yearLevelOptions.value = systemOptions.subject.yearLevels
      console.log('Setting year level options from subject config:', yearLevelOptions.value)
    }
    
    // Update hours options
    if (systemOptions?.subject?.hoursOptions && systemOptions.subject.hoursOptions.length > 0) {
      hoursOptions.value = systemOptions.subject.hoursOptions
      console.log('Setting hours options from system config:', hoursOptions.value)
    }
    
    // Update exam session days
    if (systemOptions?.subject?.examSessionDays && systemOptions.subject.examSessionDays.length > 0) {
      examSessionDays.value = systemOptions.subject.examSessionDays
      console.log('Setting exam session days from system config:', examSessionDays.value)
    }
    
    console.log('System options loaded successfully')
  } catch (error) {
    console.error('Error loading system options:', error)
    // Continue with defaults
    notificationService.showWarning('Using default system options. Settings not loaded from server.')
  }
  
  await fetchSubjects()
})

// Filtered subjects based on current filters
const filteredSubjects = computed(() => {
  return filterSubjects(allSubjects.value)
})

function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    subjects.value = filteredSubjects.value
  }, 300)
}

async function fetchSubjects() {
  try {
    loading.value = true
    const data = await subjectService.getAll()
    console.log('Fetched subjects:', data)
    console.log('Number of subjects fetched:', data?.length || 0)
    
    // Debug: Log each subject's details
    if (data && data.length > 0) {
      data.forEach((subject, index) => {
        console.log(`Subject ${index + 1}:`, {
          sspCode: subject.sspCode,
          yearLevel: subject.yearLevel,
          schoolYear: subject.schoolYear,
          semester: subject.semester,
          sessionsCount: subject.sessions?.length || 0
        })
      })
    }
    
    allSubjects.value = data || []
    
    // Apply filters
    subjects.value = filteredSubjects.value
    console.log('Filtered subjects count:', subjects.value.length)
  } catch (error) {
    console.error('Failed to fetch subjects:', error)
    notificationService.showError('Failed to load subjects. Please try again.')
    allSubjects.value = []
    subjects.value = []
  } finally {
    loading.value = false
  }
}

function filterSubjects(subjectsData) {
  return subjectsData.filter(subject => {
    // Filter by school year
    if (filters.schoolYear && subject.schoolYear !== filters.schoolYear) {
      return false
    }
    // Filter by year level
    if (filters.yearLevel && subject.yearLevel !== filters.yearLevel) {
      return false
    }
    // Filter by semester
    if (filters.semester && subject.semester !== filters.semester) {
      return false
    }
    // Filter by hours
    if (filters.hours && Number(subject.hours) !== Number(filters.hours)) {
      return false
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const sspCode = subject.sspCode?.toLowerCase() || ''
      
      if (!sspCode.includes(searchTerm)) {
        return false
      }
    }
    
    return true
  })
}

// UnifiedTable events
function handleUnifiedSearch(query) {
  filters.search = query
}

function handleUnifiedSort() {
  // Sorting handled internally by UnifiedTable
}

function handleUnifiedPageChange() {
  // Pagination handled internally by UnifiedTable
}

// UnifiedTable columns and sortables
const tableColumns = [
  { key: 'sspCode', label: 'SSP Code', class: '' },
  { key: 'yearLevel', label: 'Year Level', class: '' },
  { key: 'schoolYear', label: 'School Year', class: '' },
  { key: 'semester', label: 'Semester', class: '' },
  { key: 'hours', label: 'Hours', class: '' },
  { key: 'sessions.length', label: 'Sessions', class: '' },
  { key: 'actions', label: 'Actions', class: 'text-right' }
]

const sortableColumns = [
  { value: 'sspCode', label: 'SSP Code' },
  { value: 'yearLevel', label: 'Year Level' },
  { value: 'schoolYear', label: 'School Year' },
  { value: 'semester', label: 'Semester' },
  { value: 'hours', label: 'Hours' },
  { value: 'sessions.length', label: 'Sessions' }
]

function openAddModal() {
  // Reset form
  newSubject.sspCode = ''
  newSubject.yearLevel = ''
  newSubject.sessions = []
  newSubject.semester = '1st Semester'  // Default to 1st semester but hide from UI
  newSubject.hours = ''
  newSubject.schoolYear = ''
  
  // Reset session titles to empty array first
  sessionTitles.value = Array(18).fill('')
  
  // Set default title for day 0
  sessionTitles.value[0] = defaultZeroDayTitle.value
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

function validateForm() {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  if (!newSubject.sspCode) {
    errors.sspCode = 'SSP Code is required'
    isValid = false
  }
  
  if (!newSubject.yearLevel) {
    errors.yearLevel = 'Year level is required'
    isValid = false
  } else if (!yearLevelOptions.value.includes(newSubject.yearLevel)) {
    errors.yearLevel = `Year level must be one of: ${yearLevelOptions.value.join(', ')}`
    isValid = false
  }
  
  // Validate semester
  if (!newSubject.semester) {
    newSubject.semester = '1st Semester' // Default to 1st Semester
  } else if (!['1st Semester', '2nd Semester'].includes(newSubject.semester)) {
    errors.semester = 'Semester must be either "1st Semester" or "2nd Semester"'
    isValid = false
  }
  
  if (!newSubject.hours) {
    errors.hours = 'Hours are required'
    isValid = false
  } else if (!hoursOptions.value.map(h => h.toString()).includes(newSubject.hours)) {
    errors.hours = `Hours must be one of: ${hoursOptions.value.join(', ')}`
    isValid = false
  }
  
  if (!newSubject.schoolYear) {
    errors.schoolYear = 'School Year is required'
    isValid = false
  }
  
  // Check if any session has an empty title
  const emptyTitleIndex = sessionTitles.value.findIndex(title => title !== '' && title.trim() === '')
  if (emptyTitleIndex !== -1) {
    notificationService.showWarning(`Session ${emptyTitleIndex + 1} has an empty title. Please provide a title or remove it.`)
    isValid = false
  }
  
  return isValid
}

async function addSubject() {
  if (!validateForm()) {
    return
  }
  
  try {
    // Create sessions array from the titles that have been entered
    const sessions = []
    
    // Always add day zero with title from system options
    if (sessionTitles.value[0] && sessionTitles.value[0].trim()) {
      sessions.push({
        day: 0,
        title: sessionTitles.value[0].trim()
      })
    }
    
    // Add sessions for days 1-17 (all 17 sessions, even if empty)
    for (let index = 1; index < 18; index++) {
      const title = sessionTitles.value[index];
      const sessionData = {
        day: index,
        title: title && title.trim() ? title.trim() : `Session ${index}` // Default title if empty
      };
      
      // Check if this is an exam session day and add dates
      const examDates = getTemplateExamDates();
      if (examDates && isExamSession(index)) {
        const systemOptions = systemOptionsService.getCachedOptions();
        const examSessionDays = systemOptions?.subject?.examSessionDays || [];
        
        // Find which exam period this day belongs to
        const examDay = examSessionDays.find(exam => exam.day === index);
        if (examDay) {
          // Override the title with the actual exam name
          sessionData.title = examDay.name;
          
          let examPeriod = null;
          if (examDay.name.includes('P1') || examDay.name.toLowerCase().includes('prelim')) {
            examPeriod = examDates.prelim;
          } else if (examDay.name.includes('P2') || examDay.name.toLowerCase().includes('midterm')) {
            examPeriod = examDates.midterm;
          } else if (examDay.name.includes('P3') || examDay.name.toLowerCase().includes('finals')) {
            examPeriod = examDates.finals;
          }
          
          if (examPeriod && examPeriod.start && examPeriod.end) {
            sessionData.startDate = examPeriod.start;
            sessionData.endDate = examPeriod.end;
          }
        }
      }
      
      sessions.push(sessionData);
    }
    
    // Create a copy of the subject with properly typed values
    const subjectToCreate = {
      sspCode: newSubject.sspCode,
      name: newSubject.sspCode, // Always set name to match SSP code
      yearLevel: newSubject.yearLevel,
      semester: newSubject.semester,
      // Convert hours from string to number
      hours: parseInt(newSubject.hours, 10),
      schoolYear: newSubject.schoolYear,
      sessions: sessions,
      dayZeroTitle: getTemplateDayZeroTitle(),
      examDateRanges: getTemplateExamDates()
    }
    
    // Log the data we're sending
    console.log('Sending subject data:', JSON.stringify(subjectToCreate))
    
    const response = await subjectService.create(subjectToCreate)
    console.log('New subject created:', response)
    
    // Refresh the subject list to show the new entry
    await fetchSubjects()
    
    notificationService.showSuccess('Subject added successfully')
    closeAddModal()
  } catch (error) {
    console.error('Error adding subject:', error)
    console.error('Error details:', error.response?.data || error.message)
    
    if (error.response && error.response.data && error.response.data.message) {
      notificationService.showError(error.response.data.message)
    } else {
      notificationService.showError('Failed to add subject. Please try again later.')
    }
  }
}

function viewSessions(subject) {
  // Show sessions for this subject
  if (!subject.sessions || subject.sessions.length === 0) {
    notificationService.showInfo('This subject has no sessions defined yet.')
    return
  }
  
  // Save selected subject for sessions view
  selectedSubject.value = subject
  
  showSessionsModal.value = true
}

// Computed properties
const sortedSessions = computed(() => {
  if (!selectedSubject.value || !selectedSubject.value.sessions) return [];
  return [...selectedSubject.value.sessions].sort((a, b) => a.day - b.day);
})

// Check if current selection has a valid template
const hasValidTemplate = computed(() => {
  if (!newSubject.yearLevel || !newSubject.semester || !newSubject.schoolYear) return false;
  
  const systemOptions = systemOptionsService.getCachedOptions();
  if (!systemOptions?.subject?.sspSubjectsBySchoolYear) return false;
  
  const schoolYearData = systemOptions.subject.sspSubjectsBySchoolYear[newSubject.schoolYear];
  if (!schoolYearData) return false;
  
  const template = schoolYearData[newSubject.yearLevel]?.[newSubject.semester];
  return !!template;
})

// Add watchers for semester changes
watch(() => newSubject.semester, (newSemester) => {
  console.log(`Subject semester changed to ${newSemester}`)
})

function isExamSession(day) {
  return examSessionDays.value.some(exam => exam.day === day && exam.name);
}

function isSessionAnExam(session) {
  return examSessionDays.value.some(exam => exam.day === session.day);
}

// Template methods for SSP subject flow
function getTemplateSSPCode() {
  if (!newSubject.yearLevel || !newSubject.semester || !newSubject.schoolYear) return 'Select year level, semester, and school year first'
  
  const systemOptions = systemOptionsService.getCachedOptions()
  if (!systemOptions?.subject?.sspSubjectsBySchoolYear) return 'No template configured'
  
  const schoolYearData = systemOptions.subject.sspSubjectsBySchoolYear[newSubject.schoolYear]
  if (!schoolYearData) return 'No template for this school year'
  
  const template = schoolYearData[newSubject.yearLevel]?.[newSubject.semester]
  return template?.sspCode || 'No template configured'
}

function getTemplateSessionTitle(dayIndex) {
  if (!newSubject.yearLevel || !newSubject.semester || !newSubject.schoolYear) return 'Select year level, semester, and school year first'
  
  const systemOptions = systemOptionsService.getCachedOptions()
  if (!systemOptions?.subject?.sspSubjectsBySchoolYear) return 'No template configured'
  
  const schoolYearData = systemOptions.subject.sspSubjectsBySchoolYear[newSubject.schoolYear]
  if (!schoolYearData) return 'No template for this school year'
  
  const template = schoolYearData[newSubject.yearLevel]?.[newSubject.semester]
  return template?.sessions?.[dayIndex] || `Day ${dayIndex + 1} title`
}

function getTemplateExamDates() {
  if (!newSubject.yearLevel || !newSubject.semester || !newSubject.schoolYear) return null
  
  const systemOptions = systemOptionsService.getCachedOptions()
  if (!systemOptions?.subject?.sspSubjectsBySchoolYear) return null
  
  const schoolYearData = systemOptions.subject.sspSubjectsBySchoolYear[newSubject.schoolYear]
  if (!schoolYearData) return null
  
  const template = schoolYearData[newSubject.yearLevel]?.[newSubject.semester]
  return template?.examDateRanges || null
}

function getTemplateDayZeroTitle() {
  if (!newSubject.yearLevel || !newSubject.semester || !newSubject.schoolYear) return 'INTRODUCTION'
  
  const systemOptions = systemOptionsService.getCachedOptions()
  if (!systemOptions?.subject?.sspSubjectsBySchoolYear) return 'INTRODUCTION'
  
  const schoolYearData = systemOptions.subject.sspSubjectsBySchoolYear[newSubject.schoolYear]
  if (!schoolYearData) return 'INTRODUCTION'
  
  const template = schoolYearData[newSubject.yearLevel]?.[newSubject.semester]
  return template?.dayZeroTitle || 'INTRODUCTION'
}

function formatDate(dateString) {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

function getExamDateForDay(day) {
  const examDates = getTemplateExamDates()
  if (!examDates) return ''
  
  // Map exam days to exam periods based on system options
  const systemOptions = systemOptionsService.getCachedOptions()
  const examSessionDays = systemOptions?.subject?.examSessionDays || []
  
  // Find which exam period this day belongs to
  const examDay = examSessionDays.find(exam => exam.day === day)
  if (!examDay) return ''
  
  // Map exam names to exam periods
  let examPeriod = null
  if (examDay.name.includes('P1') || examDay.name.toLowerCase().includes('prelim')) {
    examPeriod = examDates.prelim
  } else if (examDay.name.includes('P2') || examDay.name.toLowerCase().includes('midterm')) {
    examPeriod = examDates.midterm
  } else if (examDay.name.includes('P3') || examDay.name.toLowerCase().includes('finals')) {
    examPeriod = examDates.finals
  }
  
  if (examPeriod && examPeriod.start && examPeriod.end) {
    return `${formatDate(examPeriod.start)} - ${formatDate(examPeriod.end)}`
  }
  
  return ''
}

function getExamDateForDayView(day) {
  if (!selectedSubject.value?.examDateRanges) return ''
  
  const examDates = selectedSubject.value.examDateRanges
  
  // Map exam days to exam periods based on system options
  const systemOptions = systemOptionsService.getCachedOptions()
  const examSessionDays = systemOptions?.subject?.examSessionDays || []
  
  // Find which exam period this day belongs to
  const examDay = examSessionDays.find(exam => exam.day === day)
  if (!examDay) return ''
  
  // Map exam names to exam periods
  let examPeriod = null
  if (examDay.name.includes('P1') || examDay.name.toLowerCase().includes('prelim')) {
    examPeriod = examDates.prelim
  } else if (examDay.name.includes('P2') || examDay.name.toLowerCase().includes('midterm')) {
    examPeriod = examDates.midterm
  } else if (examDay.name.includes('P3') || examDay.name.toLowerCase().includes('finals')) {
    examPeriod = examDates.finals
  }
  
  if (examPeriod && examPeriod.start && examPeriod.end) {
    return `${formatDate(examPeriod.start)} - ${formatDate(examPeriod.end)}`
  }
  
  return ''
}

// Watch for year level, semester, and school year changes to auto-populate from templates
watch(() => [newSubject.yearLevel, newSubject.semester, newSubject.schoolYear], ([yearLevel, semester, schoolYear]) => {
  if (yearLevel && semester && schoolYear) {
    const systemOptions = systemOptionsService.getCachedOptions()
    if (systemOptions?.subject?.sspSubjectsBySchoolYear) {
      const schoolYearData = systemOptions.subject.sspSubjectsBySchoolYear[schoolYear]
      if (schoolYearData) {
        const template = schoolYearData[yearLevel]?.[semester]
        if (template) {
          // Auto-populate SSP code
          newSubject.sspCode = template.sspCode || ''
          
          // Auto-populate session titles from template
          if (template.sessions && template.sessions.length > 0) {
            template.sessions.forEach((title, index) => {
              if (title && index < 17) {
                sessionTitles.value[index + 1] = title
              }
            })
          }
          
          // Set day zero title from template
          if (template.dayZeroTitle) {
            sessionTitles.value[0] = template.dayZeroTitle
          }
        } else {
          // No template found for this semester, reset to defaults
          newSubject.sspCode = ''
          sessionTitles.value = Array(18).fill('')
          sessionTitles.value[0] = defaultZeroDayTitle.value
        }
      }
    }
  }
}, { immediate: true })
</script>