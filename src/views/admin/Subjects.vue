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
              {{ getSessionCount(subject) }} / {{ getMaxSessionsForYear(subject.yearLevel) }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end space-x-2">
                <button 
                  @click="viewSessions(subject)" 
                  class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                >
                  View Sessions
                </button>
                <button 
                  @click="editSubject(subject)" 
                  class="px-3 py-1.5 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                >
                  Edit
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
            <h4 class="text-sm font-medium text-gray-800 mb-4">Select Year and Semester</h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Year Level *</label>
                  <select v-model="newSubject.yearLevel" @change="handleYearLevelChange" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm" :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.yearLevel }">
                    <option value="">Select Year Level</option>
                    <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }} Year</option>
                  </select>
                  <p v-if="errors.yearLevel" class="mt-1 text-sm text-red-600">{{ errors.yearLevel }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                  <select v-model="newSubject.semester" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm" :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.semester }">
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                  </select>
                  <p v-if="errors.semester" class="mt-1 text-sm text-red-600">{{ errors.semester }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="newSubject.yearLevel">
            <h4 class="text-sm font-medium text-gray-800 mb-4">Subject Information</h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SSP Code *</label>
                  <input
                    v-model="newSubject.sspCode"
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                    readonly
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.sspCode }"
                  />
                  <p v-if="errors.sspCode" class="mt-1 text-sm text-red-600">{{ errors.sspCode }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Hours *</label>
                  <input v-model="newSubject.hours" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm" readonly />
                  <p v-if="errors.hours" class="mt-1 text-sm text-red-600">{{ errors.hours }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                  <input
                    v-model="newSubject.schoolYear"
                    type="text"
                    placeholder="e.g., 2025 - 2026"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                    readonly
                  />
                  <p class="text-xs text-gray-500 mt-1">Fixed school year</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sessions Count -->
          <div v-if="newSubject.yearLevel" class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-800">Sessions Defined</h4>
              <span class="text-sm text-blue-700">{{ sessionTitles.filter(t => t).length || 0 }} / {{ maxSessionsForNewSubject }} sessions</span>
            </div>
          </div>

          <!-- Sessions Table --> 
          <div v-if="newSubject.yearLevel">
            <h4 class="text-sm font-medium text-gray-800 mb-4">{{ newSubject.semester }} Sessions</h4>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div class="max-h-96 overflow-y-auto" :style="{ 'max-height': '24rem' }">
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
                    <tr class="bg-blue-50">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800">1</td>
                      <td class="px-4 py-3">
                        <input 
                          type="text" 
                          v-model="sessionTitles[1]" 
                          class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                          readonly
                        />
                        <span class="text-xs text-gray-500 mt-1 block">Auto-added orientation session</span>
                      </td>
                    </tr>
                    <!-- Days 2 onwards -->
                    <tr v-for="day in (maxSessionsForNewSubject - 2)" :key="day + 1" :class="{ 'bg-amber-50': isExamSession(day + 1) }">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ day + 1 }}</td>
                      <td class="px-4 py-3">
                        <input 
                          type="text" 
                          v-model="sessionTitles[day + 1]" 
                          class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          :class="{ 'bg-amber-50 border-amber-300': isExamSession(day + 1) }"
                        />
                        <span v-if="isExamSession(day + 1)" class="text-xs text-amber-600 mt-1 block">Periodical Exam Session</span>
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
    <div v-if="showSessionsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="showSessionsModal = false">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-normal text-gray-800">Subject: {{ selectedSubject?.sspCode }}</h3>
            <div class="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
              <div>Year Level: <span class="font-medium text-gray-800">{{ selectedSubject?.yearLevel }} Year</span></div>
              <div>School Year: <span class="font-medium text-gray-800">{{ selectedSubject?.schoolYear || '2024 - 2025' }}</span></div>
              <div>Semester: <span class="font-medium text-gray-800">{{ selectedSubject?.semester }}</span></div>
              <div>Hours: <span class="font-medium text-gray-800">{{ selectedSubject?.hours }} {{ selectedSubject?.hours === 1 ? 'Hour' : 'Hours' }}</span></div>
            </div>
          </div>
          <button @click="showSessionsModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Sessions Count -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-800">Sessions Defined</h4>
              <span class="text-sm text-blue-700">{{ sortedSessions.length || 0 }} / {{ getMaxSessionsForYear(selectedSubject.yearLevel) }} sessions</span>
            </div>
          </div>

          <!-- Sessions Table -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="max-h-96 overflow-y-auto">
              <table class="min-w-full">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Day</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ selectedSubject?.semester }} Title</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <!-- Day 0 and Day 1 as read-only -->
                  <template v-if="sortedSessions.length > 0">
                    <tr class="bg-blue-50">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800 text-center">0</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ sortedSessions[0]?.title || 'INTRODUCTION' }}</td>
                    </tr>
                  </template>
                  <template v-if="sortedSessions.length > 1">
                    <tr class="bg-blue-50">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800 text-center">1</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ sortedSessions[1]?.title || 'ORIENTATION' }}</td>
                    </tr>
                  </template>
                  <!-- Other sessions -->
                  <tr v-for="session in sortedSessions.slice(2)" :key="session.day" :class="{ 'bg-amber-50': isSessionAnExam(session) }">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800 text-center">{{ session.day }}</td>
                      <td class="px-4 py-3 text-sm text-gray-800">
                        {{ session.title }}
                        <span v-if="isSessionAnExam(session)" class="ml-2 inline-flex px-2 py-1 text-xs font-normal rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                          Exam
                        </span>
                      </td>
                    </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            @click="showSessionsModal = false"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit Subject Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="showEditModal = false">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Edit Subject</h3>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Basic Information -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-4">Subject Information</h4>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">SSP Code *</label>
                  <input
                    v-model="editedSubject.sspCode"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.sspCode }"
                  />
                  <p v-if="errors.sspCode" class="mt-1 text-sm text-red-600">{{ errors.sspCode }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Year Level *</label>
                  <select
                    v-model="editedSubject.yearLevel"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.yearLevel }"
                    disabled
                  >
                    <option value="">Select Year Level</option>
                    <option v-for="option in yearLevelOptions" :key="option" :value="option">{{ option }} Year</option>
                  </select>
                  <p v-if="errors.yearLevel" class="mt-1 text-sm text-red-600">{{ errors.yearLevel }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                  <input
                    v-model="editedSubject.schoolYear"
                    type="text"
                    placeholder="e.g., 2025 - 2026"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                    readonly
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Hours *</label>
                  <select
                    v-model="editedSubject.hours"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.hours }"
                    disabled
                  >
                    <option v-for="hour in hoursOptions" :key="hour" :value="hour.toString()">{{ hour }} {{ hour === 1 ? 'Hour' : 'Hours' }}</option>
                  </select>
                  <p v-if="errors.hours" class="mt-1 text-sm text-red-600">{{ errors.hours }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                  <select
                    v-model="editedSubject.semester"
                    class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.semester }"
                    disabled
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                  </select>
                  <p v-if="errors.semester" class="mt-1 text-sm text-red-600">{{ errors.semester }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sessions Count -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-800">Sessions Defined</h4>
              <span class="text-sm text-blue-700">{{ editSessionTitles.filter(t => t).length || 0 }} / {{ maxSessionsForEditedSubject }} sessions</span>
            </div>
          </div>

          <!-- Sessions Table -->
          <div>
            <h4 class="text-sm font-medium text-gray-800 mb-4">{{ editedSubject.semester }} Sessions</h4>
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
                          v-model="editSessionTitles[0]" 
                          class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                          readonly
                        />
                        <span class="text-xs text-gray-500 mt-1 block">Auto-added introduction session</span>
                      </td>
                    </tr>
                    <!-- Days 1-17 -->
                    <tr class="bg-blue-50">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800">1</td>
                      <td class="px-4 py-3">
                        <input 
                          type="text" 
                          v-model="editSessionTitles[1]" 
                          class="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-sm"
                          readonly
                        />
                        <span class="text-xs text-gray-500 mt-1 block">Auto-added orientation session</span>
                      </td>
                    </tr>
                    <!-- Days 2 onwards -->
                    <tr v-for="day in (maxSessionsForEditedSubject - 2)" :key="day + 1" :class="{ 'bg-amber-50': isExamSession(day + 1) }">
                      <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ day + 1 }}</td>
                      <td class="px-4 py-3">
                        <input 
                          type="text" 
                          v-model="editSessionTitles[day + 1]" 
                          class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          :class="{ 'bg-amber-50 border-amber-300': isExamSession(day + 1) }"
                        />
                        <span v-if="isExamSession(day + 1)" class="text-xs text-amber-600 mt-1 block">Periodical Exam Session</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
          <button
            @click="showEditModal = false"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="updateSubject"
            class="px-4 py-2 text-sm font-normal text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Update Subject
          </button>
        </div>
      </div>
    </div>
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
const sessionTitles = ref([])
const selectedSubject = ref(null)
const showSessionsModal = ref(false)
const currentSubject = ref(null)
const editedSubject = ref({})
const editSessionTitles = ref([])
const showEditModal = ref(false)

// Dynamic options
const yearLevelOptions = ref([])
const hoursOptions = ref([1, 2, 3])
const defaultZeroDayTitle = ref('INTRODUCTION')
const examSessionDays = ref([
  { name: 'Prelim Exam', day: 5 },
  { name: 'Midterm Exam', day: 10 },
  { name: 'Final Exam', day: 15 }
])

// Form state
const systemOptions = ref(null);

const newSubject = reactive({
  sspCode: '',
  name: '',
  yearLevel: '',
  sessions: [],
  semester: '1st Semester',
  hours: 1,
  schoolYear: '2025 - 2026'
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
  yearLevel: '',
  semester: '',
  hours: '',
  search: ''
})

// Search input debounce
let searchTimeout = null

onMounted(async () => {
  try {
    // First fetch system options and store them
    systemOptions.value = await systemOptionsService.getAll()
    console.log('Fetched system options:', JSON.parse(JSON.stringify(systemOptions.value)));
    
    // Update school year
    if (systemOptions.value?.subject?.schoolYear) {
      newSubject.schoolYear = systemOptions.value.subject.schoolYear
      console.log('Setting school year from system config:', newSubject.schoolYear)
    }
    
    // Update zero day title
    if (systemOptions.value?.subject?.defaultZeroDayTitle) {
      defaultZeroDayTitle.value = systemOptions.value.subject.defaultZeroDayTitle
      console.log('Setting default zero day title from system config:', defaultZeroDayTitle.value)
    }
    
    // Update year level options - now use subject-specific year levels
    if (systemOptions.value?.subject?.yearLevels && systemOptions.value.subject.yearLevels.length > 0) {
      yearLevelOptions.value = systemOptions.value.subject.yearLevels
      console.log('Setting year level options from subject config:', yearLevelOptions.value)
    }
    
    // Update hours options
    if (systemOptions.value?.subject?.hoursOptions && systemOptions.value.subject.hoursOptions.length > 0) {
      hoursOptions.value = systemOptions.value.subject.hoursOptions
      console.log('Setting hours options from system config:', hoursOptions.value)
    }
    
    // Update exam session days
    if (systemOptions.value?.subject?.examSessionDays && systemOptions.value.subject.examSessionDays.length > 0) {
      examSessionDays.value = systemOptions.value.subject.examSessionDays
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

// Computed properties for dynamic session counts
const maxSessionsForNewSubject = computed(() => {
  const yearLevel = newSubject.yearLevel;
  if (yearLevel && systemOptions.value?.subject?.sessionsPerYearLevel?.[yearLevel]) {
    return systemOptions.value.subject.sessionsPerYearLevel[yearLevel];
  }
  return 18; // Default fallback
});

const maxSessionsForEditedSubject = computed(() => {
  const yearLevel = editedSubject.value.yearLevel;
  if (yearLevel && systemOptions.value?.subject?.sessionsPerYearLevel?.[yearLevel]) {
    return systemOptions.value.subject.sessionsPerYearLevel[yearLevel];
  }
  // Fallback to the specific subject's session count if available, or default
  const subject = allSubjects.value.find(s => s._id === editedSubject.value._id);
  if (subject) return getMaxSessionsForYear(subject.yearLevel);
  return 18;
});

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
    console.log('Fetching subjects from subjectService...');
    loading.value = true
    const data = await subjectService.getAll()
    console.log('Fetched subjects:', data)
    allSubjects.value = data || []
    
    // Apply filters
    subjects.value = filteredSubjects.value
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

function getMaxSessionsForYear(yearLevel) {
  if (yearLevel && systemOptions.value?.subject?.sessionsPerYearLevel?.[yearLevel]) {
    return systemOptions.value.subject.sessionsPerYearLevel[yearLevel];
  }
  return 18; // Default fallback
}

function getSessionCount(subject) {
  if (subject.semester === '2nd Semester') {
    return subject.secondSemesterSessions?.length || 0;
  }
  return subject.sessions?.length || 0;
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
  
  sessionTitles.value = []
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  showAddModal.value = true
}

function handleYearLevelChange() {
  const yearLevel = newSubject.yearLevel;
  const maxSessions = maxSessionsForNewSubject.value;
  if (!yearLevel || !systemOptions.value || !systemOptions.value.subject) {
    // Clear fields if no year level is selected or options are not loaded
    newSubject.sspCode = '';
    newSubject.hours = '';
    sessionTitles.value = Array(maxSessions).fill('');
    return;
  }

  const subjectOptions = systemOptions.value.subject;

  // Auto-fill SSP Code
  newSubject.sspCode = subjectOptions.sspCodePerYearLevel?.[yearLevel] || '';

  // Auto-fill Hours - assuming 1 hour for 1st sem, 2 for 2nd sem as a default logic
  // This can be adjusted if there's a different rule.
  newSubject.hours = newSubject.semester === '1st Semester' ? '1' : '2';

  // Auto-fill session titles
  const defaultSessions = subjectOptions.defaultSessionsPerYearLevel?.[yearLevel] || [];
  const titles = Array(maxSessions).fill('');
  
  defaultSessions.forEach(session => {
    if (session.day >= 0 && session.day < maxSessions) {
      titles[session.day] = session.title;
    }
  });

  sessionTitles.value = titles;
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
    // Prepare the sessions array based on the selected semester
    const firstSemSessions = [];
    const secondSemSessions = [];
    const yearLevel = newSubject.yearLevel;
    const totalSessionsForYear = systemOptions.value?.subject?.sessionsPerYearLevel?.[yearLevel] || 18;

    const sessionData = sessionTitles.value.map((title, index) => ({
      day: index,
      title: title.trim()
    })).filter(session => session.title);

    if (newSubject.semester === '1st Semester') {
      firstSemSessions.push(...sessionData);
    } else {
      // For 2nd semester, we still need to provide the sessions array
      // but the main data goes into secondSemesterSessions
      // The backend seems to use `sessions` for 1st sem and `secondSemesterSessions` for 2nd
      // To be safe, let's send the data in the correct property.
      // The backend route for POST /subjects uses `sessions` and `secondSemesterSessions`
      // Let's adjust the payload to match.
      if (newSubject.semester === '2nd Semester') {
        secondSemSessions.push(...sessionData);
      }
    }

    const subjectToCreate = {
      sspCode: newSubject.sspCode,
      name: newSubject.sspCode,
      yearLevel: newSubject.yearLevel,
      semester: newSubject.semester,
      hours: parseInt(newSubject.hours, 10),
      schoolYear: newSubject.schoolYear,
      sessions: firstSemSessions,
      secondSemesterSessions: secondSemSessions
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

function editSubject(subject) {
  setupEditForm(subject)
  loadSessionsForSemester(subject._id, subject.semester)
  showEditModal.value = true
}

function setupEditForm(subject) {
  // Clone the subject to avoid directly modifying the original
  editedSubject.value = {
    _id: subject._id,
    sspCode: subject.sspCode || '',
    yearLevel: subject.yearLevel || '',
    semester: subject.semester || '1st Semester',
    hours: subject.hours ? subject.hours.toString() : '1',
    schoolYear: subject.schoolYear || newSubject.schoolYear
  }
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

function closeEditModal() {
  showEditModal.value = false
}

function validateEditForm() {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  if (!editedSubject.value.sspCode) {
    errors.sspCode = 'SSP Code is required'
    isValid = false
  }
  
  if (!editedSubject.value.yearLevel) {
    errors.yearLevel = 'Year level is required'
    isValid = false
  } else if (!yearLevelOptions.value.includes(editedSubject.value.yearLevel)) {
    errors.yearLevel = `Year level must be one of: ${yearLevelOptions.value.join(', ')}`
    isValid = false
  }
  
  // Validate semester
  if (!editedSubject.value.semester) {
    errors.semester = 'Semester is required'
    isValid = false
  } else if (!['1st Semester', '2nd Semester'].includes(editedSubject.value.semester)) {
    errors.semester = 'Semester must be either "1st Semester" or "2nd Semester"'
    isValid = false
  }
  
  if (!editedSubject.value.hours) {
    errors.hours = 'Hours is required'
    isValid = false
  } else if (!hoursOptions.value.map(h => h.toString()).includes(editedSubject.value.hours.toString())) {
    errors.hours = `Hours must be one of: ${hoursOptions.value.join(', ')}`
    isValid = false
  }
  
  if (!editedSubject.value.schoolYear) {
    errors.schoolYear = 'School Year is required'
    isValid = false
  }
  
  return isValid
}

async function updateSubject() {
  if (!validateEditForm()) {
    return
  }
  
  try {
    // Prepare session data based on the active semester in the edit modal
    const firstSemSessions = [];
    const secondSemSessions = [];

    const sessionData = editSessionTitles.value.map((title, index) => ({
      day: index,
      title: title.trim()
    })).filter(session => session.title);

    if (editedSubject.value.semester === '1st Semester') {
      firstSemSessions.push(...sessionData);
      // Find the original subject to see if it had 2nd sem sessions to preserve
      const originalSubject = allSubjects.value.find(s => s._id === editedSubject.value._id);
      if (originalSubject && originalSubject.secondSemesterSessions) {
        secondSemSessions.push(...originalSubject.secondSemesterSessions);
      }
    } else { // 2nd Semester
      secondSemSessions.push(...sessionData);
      // Find the original subject to see if it had 1st sem sessions to preserve
      const originalSubject = allSubjects.value.find(s => s._id === editedSubject.value._id);
      if (originalSubject && originalSubject.sessions) {
        firstSemSessions.push(...originalSubject.sessions);
      }
    }

    const subjectToUpdate = {
      _id: editedSubject.value._id,
      sspCode: editedSubject.value.sspCode,
      yearLevel: editedSubject.value.yearLevel,
      semester: editedSubject.value.semester,
      hours: parseInt(editedSubject.value.hours, 10),
      schoolYear: editedSubject.value.schoolYear,
      sessions: firstSemSessions,
      secondSemesterSessions: secondSemSessions
    }
    
    // Log the data we're sending
    console.log('Updating subject data:', JSON.stringify(subjectToUpdate))
    
    const response = await subjectService.update(editedSubject.value._id, subjectToUpdate)
    console.log('Subject updated:', response)
    
    // Refresh the subject list to show the updated entry
    await fetchSubjects()
    
    notificationService.showSuccess('Subject updated successfully')
    showEditModal.value = false
  } catch (error) {
    console.error('Error updating subject:', error)
    
    if (error.response && error.response.data && error.response.data.message) {
      notificationService.showError(error.response.data.message)
    } else {
      notificationService.showError('Failed to update subject. Please try again later.')
    }
  }
}

// Computed properties
const sortedSessions = computed(() => {
  if (!selectedSubject.value || !selectedSubject.value.sessions) return [];
  return [...selectedSubject.value.sessions].sort((a, b) => a.day - b.day);
})

// Add watchers for semester changes
watch(() => newSubject.semester, (newSemester) => {
  console.log(`Subject semester changed to ${newSemester}`)
})

watch(() => editedSubject.value?.semester, (newSemester) => {
  console.log(`Edited subject semester changed to ${newSemester}`)
  if (newSemester && editedSubject.value._id) {
    loadSessionsForSemester(editedSubject.value._id, newSemester)
  }
})

// Load sessions for a specific semester
function loadSessionsForSemester(subjectId, semester) {
  const subject = allSubjects.value.find(s => s._id === subjectId)
  if (!subject) return;
  
  const maxSessions = getMaxSessionsForYear(subject.yearLevel);
  // Reset session titles
  editSessionTitles.value = Array(maxSessions).fill('')
  
  // Determine which session array to use
  const sessionsToLoad = semester === '2nd Semester' ? subject.secondSemesterSessions : subject.sessions;

  if (sessionsToLoad && sessionsToLoad.length > 0) {
    // Load from existing subject data
    sessionsToLoad.forEach(session => {
      if (session.day >= 0 && session.day < maxSessions) {
        editSessionTitles.value[session.day] = session.title || '';
      }
    });
  } else {
    // If no sessions are defined for that semester, load from system options defaults
    const yearLevel = subject.yearLevel;
    if (yearLevel && systemOptions.value?.subject?.defaultSessionsPerYearLevel?.[yearLevel]) {
      const defaultSessions = systemOptions.value.subject.defaultSessionsPerYearLevel[yearLevel];
      defaultSessions.forEach(session => {
        if (session.day >= 0 && session.day < maxSessions) {
          editSessionTitles.value[session.day] = session.title;
        }
      });
    }
  }
}

function isExamSession(day) {
  // Determine the current year level from the context (add or edit modal)
  let yearLevel;
  if (showAddModal.value) {
    yearLevel = newSubject.yearLevel;
  } else if (showEditModal.value) {
    yearLevel = editedSubject.value.yearLevel;
  }

  if (!yearLevel || !systemOptions.value?.subject?.defaultSessionsPerYearLevel?.[yearLevel]) {
    return false;
  }

  // Find if there's a default session for this day that is marked as an exam
  const defaultSessions = systemOptions.value.subject.defaultSessionsPerYearLevel[yearLevel];
  return defaultSessions.some(session => session.day === day && session.isExam);
}

function isSessionAnExam(session) {
  // Use the same logic as isExamSession(day), but with a session object
  if (!selectedSubject.value || !selectedSubject.value.yearLevel) {
    return false;
  }
  const yearLevel = selectedSubject.value.yearLevel;

  if (!yearLevel || !systemOptions.value?.subject?.defaultSessionsPerYearLevel?.[yearLevel]) {
    return false;
  }
  const defaultSessions = systemOptions.value.subject.defaultSessionsPerYearLevel[yearLevel];
  return defaultSessions.some(defaultSession => defaultSession.day === session.day && defaultSession.isExam);
}
</script>