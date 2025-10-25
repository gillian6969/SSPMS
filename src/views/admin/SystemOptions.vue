<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-normal text-gray-800">System Options</h1>
              <p class="text-gray-500 font-normal">Configure system settings and preferences</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="resetToDefaults" 
              class="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-normal text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reset to Defaults
            </button>
            <button 
              @click="saveOptions" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-normal text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div class="flex justify-center items-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span class="text-gray-500">Loading system options...</span>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button
              @click="activeTab = 'class'"
              class="py-4 px-6 font-normal text-sm border-b-2 focus:outline-none transition-colors"
              :class="activeTab === 'class' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Class Settings
            </button>
            <button
              @click="activeTab = 'subject'"
              class="py-4 px-6 font-normal text-sm border-b-2 focus:outline-none transition-colors"
              :class="activeTab === 'subject' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Subject Settings
          </button>
            <button
              @click="activeTab = 'consultation'"
              class="py-4 px-6 font-normal text-sm border-b-2 focus:outline-none transition-colors"
              :class="activeTab === 'consultation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Consultation Settings
          </button>
        </nav>
      </div>

      <!-- Class Settings Tab -->
      <div v-if="activeTab === 'class'" class="p-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Year Levels</h3>
          <div class="space-y-2 mb-4">
            <div v-for="(yearLevel, index) in options.class.yearLevels" :key="index" class="flex items-center">
              <input 
                type="text" 
                v-model="options.class.yearLevels[index]" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <button 
                @click="removeYearLevel(index)" 
                class="ml-2 text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <button 
            @click="addYearLevel" 
            class="text-primary hover:text-primary-dark flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Year Level
          </button>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Sections by Year Level</h3>
          <div class="space-y-6">
            <div v-for="yearLevel in options.class.yearLevels" :key="yearLevel" class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium mb-2">{{ yearLevel }} Year Sections</h4>
              <div class="space-y-2 mb-4">
                <div v-for="(section, index) in getSectionsForYearLevel(yearLevel)" :key="index" class="flex items-center">
                  <input 
                    type="text" 
                    v-model="getSectionsForYearLevel(yearLevel)[index]" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                  <button 
                    @click="removeSectionForYearLevel(yearLevel, index)" 
                    class="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <button 
                @click="addSectionForYearLevel(yearLevel)" 
                class="text-primary hover:text-primary-dark flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Add Section for {{ yearLevel }} Year
              </button>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Majors by Year Level</h3>
          
          <!-- Year Level Tabs for Majors -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="border-b border-gray-200">
              <nav class="flex -mb-px">
                <button 
                  v-for="yearLevel in options.class.yearLevels" 
                  :key="yearLevel" 
                  @click="activeMajorTab = yearLevel"
                  class="py-3 px-4 text-sm font-medium border-b-2 focus:outline-none"
                  :class="[
                    activeMajorTab === yearLevel 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  {{ yearLevel }} Year Majors
                </button>
              </nav>
            </div>
            
            <div class="p-4">
              <div v-for="yearLevel in options.class.yearLevels" :key="yearLevel" v-show="activeMajorTab === yearLevel">
                <div class="space-y-2 mb-4">
                  <div v-for="(major, index) in getMajorsForYearLevel(yearLevel)" :key="index" class="flex items-center">
                  <input 
                    type="text" 
                      v-model="getMajorsForYearLevel(yearLevel)[index]" 
                    class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                  <button 
                      @click="removeMajorForYearLevel(yearLevel, index)" 
                    class="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <button 
                  @click="addMajorForYearLevel(yearLevel)" 
                  class="text-primary hover:text-primary-dark flex items-center"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                  Add Major for {{ yearLevel }} Year
              </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Room Configuration</h3>
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium mb-2">Available Rooms</h4>
            <div class="space-y-2 mb-4">
              <div v-for="(room, index) in options.class.rooms" :key="index" class="flex items-center">
                <input
                  type="text"
                  v-model="options.class.rooms[index]"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="e.g. 301"
                />
                <button
                  @click="removeRoom(index)"
                  class="ml-2 text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              @click="addRoom"
              class="text-primary hover:text-primary-dark flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Add Room
            </button>
            <p class="text-sm text-gray-500 mt-4">
              These rooms will be available for selection when creating or editing classes.
            </p>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Default Sessions</h3>
          <p class="text-sm text-gray-500 mb-4">These sessions will be automatically added to new classes</p>
          <div class="space-y-2 mb-4">
            <div v-for="(session, index) in options.class.defaultSessions" :key="index" class="flex items-center">
              <input
                type="text"
                v-model="options.class.defaultSessions[index].title"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <button
                @click="removeDefaultSession(index)"
                class="ml-2 text-red-500 hover:text-red-700"
                :disabled="index === 0"
                :class="{'opacity-50 cursor-not-allowed': index === 0}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <button
            @click="addDefaultSession"
            class="text-primary hover:text-primary-dark flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Default Session
          </button>
        </div>
      </div>

      <!-- Subject Settings Tab -->
      <div v-if="activeTab === 'subject'" class="p-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Subject Year Levels</h3>
          <div class="space-y-2 mb-4">
            <div v-for="(yearLevel, index) in options.subject.yearLevels" :key="index" class="flex items-center">
                <input 
                  type="text" 
                v-model="options.subject.yearLevels[index]" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <button 
                @click="removeSubjectYearLevel(index)" 
                class="ml-2 text-red-500 hover:text-red-700"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
            </div>
          </div>
          <button
            @click="addSubjectYearLevel" 
            class="text-primary hover:text-primary-dark flex items-center"     
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Year Level
          </button>
          <p class="mt-2 text-sm text-gray-500">These are the year levels available for subjects. Different from class year levels.</p>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">School Year</h3>
          <div class="space-y-2 mb-4">
            <input 
              type="text" 
              v-model="options.subject.schoolYear" 
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <p class="text-sm text-gray-500">This will be the fixed school year for all subjects</p>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">First Day Session</h3>
          <div class="space-y-2 mb-4">
            <input 
              type="text" 
              v-model="options.subject.defaultZeroDayTitle" 
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <p class="text-sm text-gray-500">This is the title for day zero session (automatically added to all subjects)</p>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Hours Options</h3>
          <div class="space-y-2 mb-4">
            <div v-for="(hour, index) in options.subject.hoursOptions" :key="index" class="flex items-center">
              <input 
                type="number" 
                v-model.number="options.subject.hoursOptions[index]" 
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <button 
                @click="removeHoursOption(index)" 
                class="ml-2 text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <button
            @click="addHoursOption" 
            class="text-primary hover:text-primary-dark flex items-center"     
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Hours Option
          </button>
        </div>

        <!-- SSP Subject Setup -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">SSP Subject Setup</h3>
          <p class="text-sm text-gray-500 mb-4">Configure SSP codes and session titles for specific year level and semester combinations</p>
          
          <!-- Template Selection -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Select Year Level</label>
                <select 
                  v-model="selectedTemplate.yearLevel" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                >
                  <option value="">Choose Year Level</option>
                  <option v-for="yearLevel in options.subject.yearLevels" :key="yearLevel" :value="yearLevel">
                    {{ yearLevel }} Year
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Select Semester</label>
                <select 
                  v-model="selectedTemplate.semester" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                  :disabled="!selectedTemplate.yearLevel"
                >
                  <option value="">Choose Semester</option>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Template Editor -->
          <div v-if="selectedTemplate.yearLevel && selectedTemplate.semester" class="border border-gray-200 rounded-lg p-6">
            <div class="mb-6">
              <h4 class="text-lg font-medium text-gray-800">
                {{ selectedTemplate.yearLevel }} Year - {{ selectedTemplate.semester }}
              </h4>
            </div>
            
            <!-- SSP Code -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-600 mb-2">SSP Code</label>
              <input 
                type="text" 
                v-model="currentTemplate.sspCode" 
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="e.g., SSP-2A-1"
              />
            </div>
            
            <!-- Session Titles -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-3">Session Titles (Day 0-17)</label>
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="grid grid-cols-1 gap-3">
                  <!-- Day 0 - Introduction (read-only) -->
                  <div class="flex items-center space-x-3 bg-blue-50 p-3 rounded-md">
                    <span class="w-12 text-sm font-medium text-blue-700 text-center">Day 0</span>
                    <input 
                      type="text" 
                      v-model="currentTemplate.dayZeroTitle" 
                      class="flex-1 p-2 border border-blue-200 rounded-md bg-blue-50 text-sm"
                      readonly
                      placeholder="Auto-populated introduction session"
                    />
                    <span class="text-xs text-blue-600">Auto-added</span>
                  </div>
                  
                  <!-- Days 1-17 -->
                  <div v-for="day in 17" :key="day" class="flex items-center space-x-3" :class="{ 'bg-yellow-50': isExamSessionDay(day) }">
                    <span class="w-12 text-sm font-medium text-gray-600 text-center">Day {{ day }}</span>
                    <input 
                      type="text" 
                      v-model="currentTemplate.sessions[day-1]" 
                      class="flex-1 p-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                      :class="{ 
                        'bg-yellow-50 border-yellow-300 cursor-not-allowed': isExamSessionDay(day),
                        'bg-white': !isExamSessionDay(day)
                      }"
                      :readonly="isExamSessionDay(day)"
                      :placeholder="isExamSessionDay(day) ? 'Auto-populated from exam sessions' : `Enter session title for day ${day}`"
                    />
                    <span v-if="isExamSessionDay(day)" class="text-xs text-yellow-600 font-medium">Auto-filled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- No Selection State -->
          <div v-else class="text-center py-12 text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 class="text-lg font-medium text-gray-600 mb-2">No Template Selected</h4>
            <p class="text-sm">Please select a year level and semester to configure the SSP template.</p>
          </div>
        </div>

        <!-- Periodical Examination Sessions -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Periodical Examination Sessions</h3>
          <p class="text-sm text-gray-500 mb-4">Define which session days will be used for periodical examinations</p>
          
          <div class="border border-gray-200 rounded-lg p-4">
            
            <div v-if="!options.subject.examSessionDays || options.subject.examSessionDays.length === 0" class="mb-4 text-gray-500 text-sm">
              No exam sessions configured. Add sessions below.
            </div>
            
            <div v-else class="space-y-4 mb-4">
              <div v-for="(sessionInfo, index) in options.subject.examSessionDays" :key="index" 
                   class="border border-gray-200 rounded-lg p-3 bg-yellow-50">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                    <input 
                      type="text" 
                      v-model="sessionInfo.name" 
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white"
                      placeholder="e.g. Periodical Exam 1"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Session Day Number</label>
                    <select
                      v-model="sessionInfo.day"
                      class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white"
                    >
                      <option v-for="day in 17" :key="day" :value="day">Day {{ day }}</option>
                    </select>
                  </div>
                </div>
                
                <div class="flex justify-end mt-3">
                  <button 
                    @click="removeExamSessionDay(index)" 
                    class="text-red-500 hover:text-red-700 text-sm flex items-center"
                    :disabled="options.subject.examSessionDays.length <= 1"
                    :class="{'opacity-50 cursor-not-allowed': options.subject.examSessionDays.length <= 1}"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              @click="addExamSessionDay" 
              class="text-primary hover:text-primary-dark flex items-center"
              :disabled="options.subject.examSessionDays && options.subject.examSessionDays.length >= 3"
              :class="{'opacity-50 cursor-not-allowed': options.subject.examSessionDays && options.subject.examSessionDays.length >= 3}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Add Exam Session
            </button>
     
          </div>
        </div>
      </div>

      <!-- Consultation Settings Tab -->
      <div v-if="activeTab === 'consultation'" class="p-6">
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Consultation Duration</h3>
          <div class="space-y-2 mb-4">
            <input
              type="number"
              v-model.number="options.consultation.defaultDuration" 
              min="1"
              max="8"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <p class="text-sm text-gray-500">Default duration in hours for consultation sessions. This can be changed when creating consultations.</p>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Consultation Hours</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <select 
                v-model="options.consultation.businessHours.start"      
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="7">7:00 AM</option>
                <option value="8">8:00 AM</option>
                <option value="9">9:00 AM</option>
                <option value="10">10:00 AM</option>
                <option value="11">11:00 AM</option>
                <option value="12">12:00 PM</option>
              </select>
              <p class="text-sm text-gray-500 mt-1">Consultation hours start time</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <select 
                v-model="options.consultation.businessHours.end"        
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="13">1:00 PM</option>
                <option value="14">2:00 PM</option>
                <option value="15">3:00 PM</option>
                <option value="16">4:00 PM</option>
                <option value="17">5:00 PM</option>
                <option value="18">6:00 PM</option>
              </select>
              <p class="text-sm text-gray-500 mt-1">Consultation hours end time</p>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">These settings control when consultations can be scheduled and the available time range.</p>
        </div>
      </div>
    </div>

    <!-- Status Message -->
    <div v-if="statusMessage" class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md">
      <div class="flex items-center">
        <svg v-if="statusType === 'success'" class="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <svg v-if="statusType === 'error'" class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ statusMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { systemOptionsService } from '../../services/systemOptionsService'
import { notificationService } from '../../services/notificationService'

const loading = ref(true)
const activeTab = ref('class')
const statusMessage = ref('')
const statusType = ref('')
const activeMajorTab = ref('') // Active tab for majors section

// Template selection and editing
const selectedTemplate = reactive({
  yearLevel: '',
  semester: ''
})

const currentTemplate = reactive({
  sspCode: '',
  dayZeroTitle: 'INTRODUCTION',
  sessions: Array(17).fill('')
})

const options = reactive({
  class: {
    yearLevels: ['2nd', '3rd', '4th'],
    majors: {
      '2nd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
      '3rd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
      '4th': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security']
    },
    defaultSessions: [
      { title: 'INTRODUCTION', count: 0 },
      { title: 'ORIENTATION', count: 0 }
    ],
    sections: {
      '2nd': ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'],
      '3rd': ['South-1', 'South-2', 'South-3'],
      '4th': ['South-1', 'South-2']
    },
    rooms: ['301', '302', '303', '304', '401', '402', '403', '404']
  },
  subject: {
    schoolYear: '2025 - 2026',
    defaultZeroDayTitle: 'INTRODUCTION',
    hoursOptions: [1, 2, 3],
    yearLevels: ['1st', '2nd', '3rd', '4th'],
    examSessionDays: [
      { name: 'Prelim Exam', day: 5 },
      { name: 'Midterm Exam', day: 10 },
      { name: 'Final Exam', day: 15 }
    ]
  },
  consultation: {
    defaultDuration: 3,
    businessHours: {
      start: 7,
      end: 18
    }
  }
})

// Default options for reset functionality
const defaultOptions = {
  class: {
    yearLevels: ['2nd', '3rd', '4th'],
    majors: {
      '2nd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
      '3rd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
      '4th': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security']
    },
    defaultSessions: [
      { title: 'INTRODUCTION', count: 0 },
      { title: 'ORIENTATION', count: 0 }
    ],
    sections: {
      '2nd': ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'],
      '3rd': ['South-1', 'South-2', 'South-3'],
      '4th': ['South-1', 'South-2']
    },
    rooms: ['301', '302', '303', '304', '401', '402', '403', '404']
  },
  subject: {
    schoolYear: '2025 - 2026',
    defaultZeroDayTitle: 'INTRODUCTION',
    hoursOptions: [1, 2, 3],
    yearLevels: ['1st', '2nd', '3rd', '4th'],
    examSessionDays: [
      { name: 'Prelim Exam', day: 5 },
      { name: 'Midterm Exam', day: 10 },
      { name: 'Final Exam', day: 15 }
    ]
  },
  consultation: {
    defaultDuration: 3,
    businessHours: {
      start: 7,
      end: 18
    }
  }
}

// Watch for year level changes to sync with sections and majors
watch(() => options.class.yearLevels, (newYearLevels, oldYearLevels) => {
  // Handle removed year levels
  for (const yearLevel in options.class.sections) {
    if (!newYearLevels.includes(yearLevel)) {
      delete options.class.sections[yearLevel];
    }
  }
  
  for (const yearLevel in options.class.majors) {
      if (!newYearLevels.includes(yearLevel)) {
        delete options.class.majors[yearLevel];
      }
  }

  // Handle added year levels
  newYearLevels.forEach(yearLevel => {
    if (!options.class.sections[yearLevel]) {
      options.class.sections[yearLevel] = ['Section 1'];
    }
    
    if (!options.class.majors[yearLevel]) {
      options.class.majors[yearLevel] = ['New Major'];
    }
  });
}, { deep: true });

// Watch for defaultZeroDayTitle changes to update current template
watch(() => options.subject.defaultZeroDayTitle, (newTitle) => {
  if (currentTemplate.dayZeroTitle !== newTitle) {
    currentTemplate.dayZeroTitle = newTitle
  }
})

onMounted(async () => {
  await fetchOptions()
  // Set default active major tab to the first year level
  if (options.class.yearLevels.length > 0) {
    activeMajorTab.value = options.class.yearLevels[0]
  }
})

async function fetchOptions() {
  loading.value = true
  try {
    // Try to fetch options from API
    const data = await systemOptionsService.getAll()
    
    // If options exist, update our local state
    if (data) {
      // Handle legacy majors format (flat array instead of by year level)
      if (data.class && Array.isArray(data.class.majors)) {
        // Convert flat majors array to per-year-level object
        const majorsObject = {};
        options.class.yearLevels.forEach(yearLevel => {
          majorsObject[yearLevel] = [...data.class.majors];
        });
        data.class.majors = majorsObject;
      }
      
      // Add rooms if they don't exist
      if (data.class && !data.class.rooms) {
        data.class.rooms = defaultOptions.class.rooms;
      }

      // Ensure examSessionDays exists
      if (!data.subject || !data.subject.examSessionDays) {
        data.subject = { ...data.subject, examSessionDays: defaultOptions.subject.examSessionDays };
      }

      // Merge with defaults to ensure we have all properties
      options.class = { ...options.class, ...data.class }
      options.subject = { ...options.subject, ...data.subject }
      options.consultation = { ...options.consultation, ...data.consultation }

      
      showStatus('Settings loaded successfully', 'success')
    }
  } catch (error) {
    console.error('Error fetching system options:', error)
    notificationService.showWarning('Failed to load system options. Using defaults.')
    showStatus('Error loading settings. Using defaults.', 'error')
    // Keep using default options
  } finally {
    loading.value = false
  }
}

async function saveOptions() {
  try {
    // Check if user is logged in first
    const token = localStorage.getItem('token');
    if (!token) {
      notificationService.showError('You must be logged in as an admin to save options');
      showStatus('Authentication required', 'error');
          return;
    }
    
    await systemOptionsService.update(options)
    notificationService.showSuccess('System options saved successfully')
    showStatus('Settings saved successfully', 'success')
  } catch (error) {
    console.error('Error saving system options:', error)
    
    if (error.response) {
      if (error.response.status === 401) {
        notificationService.showError('You must be logged in to save options');
      } else if (error.response.status === 403) {
        notificationService.showError('You must be an admin to save options');
      } else {
        notificationService.showError('Failed to save system options: ' + (error.response.data?.message || 'Server error'));
      }
    } else {
      notificationService.showError('Failed to save system options: Network error');
    }
    
    showStatus('Error saving settings', 'error')
  }
}

async function resetToDefaults() {
  if (confirm('Are you sure you want to reset all options to defaults? This cannot be undone.')) {
    try {
      // Check if user is logged in first
      const token = localStorage.getItem('token');
      if (!token) {
        notificationService.showError('You must be logged in as an admin to reset options');
        showStatus('Authentication required', 'error');
        return;
      }
      
      // Try API first
      await systemOptionsService.resetToDefaults();
      await fetchOptions(); // Refresh options from server
      
      notificationService.showSuccess('Options reset to defaults successfully.');
      showStatus('Settings reset to defaults', 'success');
    } catch (error) {
      console.error('Error resetting system options:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          notificationService.showError('You must be logged in to reset options');
        } else if (error.response.status === 403) {
          notificationService.showError('You must be an admin to reset options');
        } else {
          notificationService.showError('Failed to reset options: ' + (error.response.data?.message || 'Server error'));
        }
    } else {
      // Fallback to local reset
        options.class = JSON.parse(JSON.stringify(defaultOptions.class));
        options.subject = JSON.parse(JSON.stringify(defaultOptions.subject));
      notificationService.showWarning('Reset applied locally. Server reset failed.');                                                                            
    }
      
      showStatus('Reset applied locally only', 'warning');
    }
  }
}

function showStatus(message, type) {
  statusMessage.value = message
  statusType.value = type
  
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

// Class options functions
function addYearLevel() {
  options.class.yearLevels.push('')
}

function removeYearLevel(index) {
  options.class.yearLevels.splice(index, 1)
}

// Majors functions - per year level
function getMajorsForYearLevel(yearLevel) {
  if (!options.class.majors[yearLevel]) {
    options.class.majors[yearLevel] = [];
  }
  return options.class.majors[yearLevel];
}

function addMajorForYearLevel(yearLevel) {
  if (!options.class.majors[yearLevel]) {
    options.class.majors[yearLevel] = [];
  }
  options.class.majors[yearLevel].push('');
}

function removeMajorForYearLevel(yearLevel, index) {
  if (options.class.majors[yearLevel]) {
    options.class.majors[yearLevel].splice(index, 1);
  }
}

function addDefaultSession() {
  options.class.defaultSessions.push({ title: '', count: 0 })
}

function removeDefaultSession(index) {
  // Don't allow removing the INTRODUCTION session
  if (index === 0) return
  options.class.defaultSessions.splice(index, 1)
}

// Room configuration functions
function addRoom() {
  options.class.rooms.push('')
}

function removeRoom(index) {
  options.class.rooms.splice(index, 1)
}

// Subject options functions
function addHoursOption() {
  options.subject.hoursOptions.push(1)
}

function removeHoursOption(index) {
  options.subject.hoursOptions.splice(index, 1)
}

// Functions for section management
function getSectionsForYearLevel(yearLevel) {
  if (!options.class.sections[yearLevel]) {
    options.class.sections[yearLevel] = [];
  }
  return options.class.sections[yearLevel];
}

function addSectionForYearLevel(yearLevel) {
  if (!options.class.sections[yearLevel]) {
    options.class.sections[yearLevel] = [];
  }
  options.class.sections[yearLevel].push('');
}

function removeSectionForYearLevel(yearLevel, index) {
  if (options.class.sections[yearLevel]) {
    options.class.sections[yearLevel].splice(index, 1);
  }
}

function addSubjectYearLevel() {
  options.subject.yearLevels.push('')
}

function removeSubjectYearLevel(index) {
  options.subject.yearLevels.splice(index, 1)
}

// Periodical Examination Sessions
function addExamSessionDay() {
  options.subject.examSessionDays.push({ name: '', day: 1 })
}

function removeExamSessionDay(index) {
  options.subject.examSessionDays.splice(index, 1)
}

// Template management - auto-load when selection changes
watch(() => [selectedTemplate.yearLevel, selectedTemplate.semester], ([yearLevel, semester]) => {
  if (yearLevel && semester) {
    
    // Initialize sspTemplates if it doesn't exist
    if (!options.subject.sspTemplates) {
      options.subject.sspTemplates = {}
    }
    
    if (!options.subject.sspTemplates[yearLevel]) {
      options.subject.sspTemplates[yearLevel] = {}
    }
    
    if (!options.subject.sspTemplates[yearLevel][semester]) {
      options.subject.sspTemplates[yearLevel][semester] = {
        sspCode: '',
        sessions: Array(17).fill('')
      }
    }
    
    // Load existing template data
    const template = options.subject.sspTemplates[yearLevel][semester]
    currentTemplate.sspCode = template.sspCode || ''
    currentTemplate.dayZeroTitle = options.subject.defaultZeroDayTitle || 'INTRODUCTION'
    currentTemplate.sessions = [...(template.sessions || Array(17).fill(''))]
    
    // Apply exam session titles to the sessions array
    if (options.subject.examSessionDays && options.subject.examSessionDays.length > 0) {
      options.subject.examSessionDays.forEach(exam => {
        if (exam.day > 0 && exam.day < 18 && exam.name) {
          currentTemplate.sessions[exam.day - 1] = exam.name
        }
      })
    }
    
  }
}, { immediate: true })

// Auto-save template changes
watch(() => [currentTemplate.sspCode, currentTemplate.sessions], () => {
  if (selectedTemplate.yearLevel && selectedTemplate.semester) {
    // Ensure sspTemplates structure exists
    if (!options.subject.sspTemplates) {
      options.subject.sspTemplates = {}
    }
    
    if (!options.subject.sspTemplates[selectedTemplate.yearLevel]) {
      options.subject.sspTemplates[selectedTemplate.yearLevel] = {}
    }
    
    // Save the template data automatically
    options.subject.sspTemplates[selectedTemplate.yearLevel][selectedTemplate.semester] = {
      sspCode: currentTemplate.sspCode,
      sessions: [...currentTemplate.sessions]
    }
  }
}, { deep: true })

// Watch for exam session changes and update template sessions
watch(() => options.subject.examSessionDays, () => {
  if (selectedTemplate.yearLevel && selectedTemplate.semester && options.subject.examSessionDays) {
    // Apply exam session titles to the sessions array
    options.subject.examSessionDays.forEach(exam => {
      if (exam.day > 0 && exam.day < 18 && exam.name) {
        currentTemplate.sessions[exam.day - 1] = exam.name
      }
    })
  }
}, { deep: true })

// Check if a day is an exam session day
function isExamSessionDay(day) {
  return options.subject.examSessionDays && options.subject.examSessionDays.some(exam => exam.day === day)
}
</script>