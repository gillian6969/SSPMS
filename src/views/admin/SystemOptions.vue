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

        </div>
        
        <!-- Subject Settings Tab -->
        <div v-if="activeTab === 'subject'" class="p-6">
          <div class="mb-6">
            <h3 class="text-lg font-medium mb-3">Subject Year Levels, Sessions, & Default Titles</h3>
            <div class="space-y-4">
              <div v-for="(yearLevel, index) in options.subject.yearLevels" :key="index" class="border border-gray-200 rounded-lg">
                <!-- Year Level Header -->
                <div class="flex items-center space-x-3 p-4 bg-gray-50 rounded-t-lg">
                  <input 
                    type="text" 
                    :value="yearLevel"
                    @input="updateYearLevelName(index, $event.target.value)"
                    class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Year Level Name"
                  />
                  <input 
                    type="number" 
                    :value="getDisplaySessions(yearLevel)"
                    @input="setDisplaySessions(yearLevel, $event.target.value)"
                    min="0"
                    class="w-48 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Sessions"
                  />
                  <input 
                    type="text" 
                    v-model="options.subject.sspCodePerYearLevel[yearLevel]" 
                    class="w-48 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="SSP Code"
                  />
                  <button @click="toggleYearLevel(yearLevel)" class="p-2 text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform duration-200" :class="{'transform rotate-180': expandedYearLevels[yearLevel]}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button @click="removeSubjectYearLevel(index)" class="p-2 text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <!-- Collapsible Default Sessions -->
                <div v-if="expandedYearLevels[yearLevel]" class="p-4 border-t border-gray-200">
                  <h4 class="font-medium text-sm text-gray-600 mb-3">Default Session Titles for {{ yearLevel }} Year</h4>
                  <p class="text-xs text-gray-500 mb-4">"INTRODUCTION" and "ORIENTATION" are default sessions. Add more session if needed .</p>
                  <div class="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
                    <div v-for="(session, s_index) in getYearLevelDefaultSessions(yearLevel)" :key="s_index" class="flex items-center space-x-3">
                      <input type="number" :value="session.day" readonly class="w-24 p-2 border border-gray-200 bg-gray-100 rounded-md text-gray-600 focus:outline-none" placeholder="Day" />                      
                      <input 
                        type="text" 
                        v-model="session.title" 
                        :readonly="s_index < 2 || (session.isExam && session.examType)"
                        :class="[
                          'w-full p-2 border rounded-md',
                          (s_index < 2 || (session.isExam && session.examType))
                            ? 'bg-gray-100 border-gray-200 text-gray-600 focus:outline-none'
                            : 'border-gray-300 focus:ring-primary focus:border-primary'
                        ]"
                        placeholder="Session Title" 
                      />
                      <div v-if="session.isExam" class="w-48">
                        <select v-model="session.examType" class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                          <option value="">Select Exam</option>
                          <option value="Prelims">Prelims</option>
                          <option value="Midterms">Midterms</option>
                          <option value="Finals">Finals</option>
                        </select>
                      </div>
                      <div class="flex items-center space-x-2">
                        <input type="checkbox" v-model="session.isExam" :id="`isExam-${yearLevel}-${s_index}`" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" :disabled="s_index < 2">
                        <label :for="`isExam-${yearLevel}-${s_index}`" class="text-sm text-gray-700">Is Exam</label>
                      </div>
                      <button v-if="s_index >= 2" @click="removeYearLevelDefaultSession(yearLevel, s_index)" class="text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
                  <button @click="addYearLevelDefaultSession(yearLevel)" class="text-primary hover:text-primary-dark flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                    Add Default Session
                  </button>
                </div>
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
            <p class="mt-2 text-sm text-gray-500">Configure year levels, session counts, and default session titles for subjects.</p>
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

        </div>
        
        <!-- Consultation Settings Tab -->
        <div v-if="activeTab === 'consultation'" class="p-6">
          <div class="mb-6">
            <h3 class="text-lg font-medium mb-3">Fixed Consultation Duration</h3>
            <div class="space-y-2 mb-4">
              <input 
                type="number" 
                v-model.number="options.consultation.fixedDuration" 
                min="1"
                max="8"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <p class="text-sm text-gray-500">Fixed duration in hours for all consultation sessions. This cannot be changed when creating consultations.</p>
            </div>
          </div>
          
          <div class="mb-6">
            <h3 class="text-lg font-medium mb-3">Business Hours</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Start Time (AM)</label>
                <input 
                  type="number" 
                  v-model.number="options.consultation.businessHours.start" 
                  min="6"
                  max="12"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
                <p class="text-sm text-gray-500 mt-1">Business hours start time (6-12 AM)</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">End Time (PM)</label>
                <input 
                  type="number" 
                  v-model.number="options.consultation.businessHours.end" 
                  min="17"
                  max="22"
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
                <p class="text-sm text-gray-500 mt-1">Business hours end time (5-10 PM)</p>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-2">These settings control when consultations can be scheduled and how long they can run.</p>
          </div>
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
    sspCodePerYearLevel: {
      '1st': '',
      '2nd': '',
      '3rd': '',
      '4th': ''
    },
    sessionsPerYearLevel: {
      '1st': 18,
      '2nd': 18,
      '3rd': 18,
      '4th': 18
    },
    defaultSessionsPerYearLevel: {
      '1st': [
        { day: 0, title: 'INTRODUCTION', isExam: false, examType: '' },
        { day: 1, title: 'ORIENTATION', isExam: false, examType: '' }
      ],
      '2nd': [
        { day: 0, title: 'INTRODUCTION', isExam: false, examType: '' },
        { day: 1, title: 'ORIENTATION', isExam: false, examType: '' }
      ],
      '3rd': [
        { day: 0, title: 'INTRODUCTION', isExam: false, examType: '' },
        { day: 1, title: 'ORIENTATION', isExam: false, examType: '' }
      ],
      '4th': [
        { day: 0, title: 'INTRODUCTION', isExam: false, examType: '' },
        { day: 1, title: 'ORIENTATION', isExam: false, examType: '' }
      ]
    },
    examSessionDays: [ // This is now legacy, but we keep it for migration
      { name: 'Periodical Exam 1', day: 6 },
      { name: 'Periodical Exam 2', day: 12 },
      { name: 'Periodical Exam 3', day: 18 }
    ]
  },
  consultation: {
    fixedDuration: 3,
    businessHours: {
      start: 7,
      end: 18
    }
  }
})

// Default options for reset functionality
const defaultOptions = JSON.parse(JSON.stringify(options))

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

    if (!options.subject.sessionsPerYearLevel[yearLevel]) {
      options.subject.sessionsPerYearLevel[yearLevel] = 18; // Default value
    }

    if (!options.subject.defaultSessionsPerYearLevel[yearLevel]) {
      options.subject.defaultSessionsPerYearLevel[yearLevel] = [
        { day: 0, title: 'INTRODUCTION', isExam: false, examType: '' },
        { day: 1, title: 'ORIENTATION', isExam: false, examType: '' }
      ]; // Default value
    }
  });
}, { deep: true });

watch(
  () => options.subject.sessionsPerYearLevel,
  (newSessionsConfig) => {
    for (const yearLevel in newSessionsConfig) {
      const newCount = newSessionsConfig[yearLevel] || 0;

      if (!options.subject.defaultSessionsPerYearLevel[yearLevel]) {
        options.subject.defaultSessionsPerYearLevel[yearLevel] = [
          { day: 0, title: 'INTRODUCTION', isExam: false, examType: '' },
          { day: 1, title: 'ORIENTATION', isExam: false, examType: '' },
        ];
      }

      const currentDefaults = options.subject.defaultSessionsPerYearLevel[yearLevel];
      const currentCount = currentDefaults.length;

      if (newCount > currentCount) {
        for (let i = currentCount; i < newCount; i++) {
          currentDefaults.push({ day: i, title: '', isExam: false, examType: '' });
        }
      } else if (newCount < currentCount) {
        // Ensure we don't remove the first two default sessions
        const startSplice = Math.max(2, newCount);
        if (currentCount > startSplice) {
          currentDefaults.splice(startSplice);
        }
      }
    }
  }, { deep: true }
);

watch(() => options.subject.defaultSessionsPerYearLevel, (newDefaults) => {
  for (const yearLevel in newDefaults) {
    newDefaults[yearLevel].forEach((session, index) => {
      // Skip the first two default sessions (INTRODUCTION, ORIENTATION)
      if (index < 2) return;

      if (session.isExam && session.examType) {
        // Automatically set the title based on the exam type
        session.title = `${session.examType} Exam`;
      } else if (!session.isExam) {
        // If it's not an exam, clear the examType
        session.examType = '';
      }
    });
  }
}, { deep: true });

const expandedYearLevels = ref({});

function updateYearLevelName(index, newName) {
  const oldName = options.subject.yearLevels[index];
  if (oldName === newName) return;

  // Update the year level name
  // Make sure to handle the case where newName is empty or a duplicate
  if (!newName || options.subject.yearLevels.some((yl, i) => yl === newName && i !== index)) {
    notificationService.showError("Year level name must be unique and not empty.");
    // Revert the change in the input field if possible or just don't update the state
    // For simplicity, we'll just log and not update. A more robust solution might involve
    // re-rendering or forcing the input value back.
    console.error("Attempted to set a duplicate or empty year level name.");
    // To prevent the UI from being out of sync, you might want to force a re-render
    // or directly manipulate the input's value, but that's more complex.
    // For now, we prevent the state update.
    // To revert the input, you'd need a reference to it.
    // A simpler approach is to just let the user see their invalid input and correct it.
    return;
  }

  options.subject.yearLevels[index] = newName;

  // Update the key in sessionsPerYearLevel
  if (options.subject.sessionsPerYearLevel.hasOwnProperty(oldName)) {
    options.subject.sessionsPerYearLevel[newName] = options.subject.sessionsPerYearLevel[oldName];
    delete options.subject.sessionsPerYearLevel[oldName];
  }
  // Update the key in defaultSessionsPerYearLevel
  if (options.subject.defaultSessionsPerYearLevel.hasOwnProperty(oldName)) {
    options.subject.defaultSessionsPerYearLevel[newName] = options.subject.defaultSessionsPerYearLevel[oldName];
    delete options.subject.defaultSessionsPerYearLevel[oldName];
  }
  // Update the key in sspCodePerYearLevel
  if (options.subject.sspCodePerYearLevel.hasOwnProperty(oldName)) {
    options.subject.sspCodePerYearLevel[newName] = options.subject.sspCodePerYearLevel[oldName];
    delete options.subject.sspCodePerYearLevel[oldName];
  }
  // Also update the expanded state
  if (expandedYearLevels.value.hasOwnProperty(oldName)) {
    expandedYearLevels.value[newName] = expandedYearLevels.value[oldName];
    delete expandedYearLevels.value[oldName];
  }
}

function getDisplaySessions(yearLevel) {
  const totalSessions = options.subject.sessionsPerYearLevel[yearLevel] || 0;
  return Math.max(0, totalSessions - 2);
}

function setDisplaySessions(yearLevel, value) {
  const numValue = Number(value);
  if (!isNaN(numValue) && numValue >= 0) {
    options.subject.sessionsPerYearLevel[yearLevel] = Math.max(2, numValue + 2);
  }
}

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
      
      // Add defaultSessionsPerYearLevel if it doesn't exist
      if (data.subject && !data.subject.defaultSessionsPerYearLevel) {
        data.subject.defaultSessionsPerYearLevel = defaultOptions.subject.defaultSessionsPerYearLevel;
      }

      // Add sspCodePerYearLevel if it doesn't exist
      if (data.subject && !data.subject.sspCodePerYearLevel) {
        data.subject.sspCodePerYearLevel = {};
        if (data.subject.yearLevels && Array.isArray(data.subject.yearLevels)) {
            data.subject.yearLevels.forEach(yl => {
                data.subject.sspCodePerYearLevel[yl] = '';
            });
        }
      }

      // Add examSessionDays if it doesn't exist
      if (data.subject && !data.subject.examSessionDays) {
        data.subject.examSessionDays = defaultOptions.subject.examSessionDays;
      }

      // Merge with defaults to ensure we have all properties
      options.class = { ...options.class, ...data.class }
      options.subject = { ...options.subject, ...data.subject }

      // Ensure INTRODUCTION and ORIENTATION are always present for each year level
      if (options.subject.yearLevels && options.subject.defaultSessionsPerYearLevel) {
        options.subject.yearLevels.forEach(yearLevel => {
          if (!options.subject.defaultSessionsPerYearLevel[yearLevel]) {
            options.subject.defaultSessionsPerYearLevel[yearLevel] = [];
          }
          const sessions = options.subject.defaultSessionsPerYearLevel[yearLevel];
          
          // Check and enforce Day 0: INTRODUCTION
          let introSession = sessions.find(s => s.day === 0);
          if (!introSession) {
            sessions.unshift({ day: 0, title: 'INTRODUCTION', isExam: false, examType: '' });
          } else {
            introSession.title = 'INTRODUCTION';
            introSession.isExam = false;
          }

          // Check and enforce Day 1: ORIENTATION
          let orientationSession = sessions.find(s => s.day === 1);
          if (!orientationSession) {
            sessions.splice(1, 0, { day: 1, title: 'ORIENTATION', isExam: false, examType: '' });
          } else {
            orientationSession.title = 'ORIENTATION';
            orientationSession.isExam = false;
          }
        });
      }

      // Migrate old examSessionDays to new format if it exists
      if (options.subject.examSessionDays && options.subject.examSessionDays.length > 0) {
        for (const yearLevel in options.subject.defaultSessionsPerYearLevel) {
          const defaultSessions = options.subject.defaultSessionsPerYearLevel[yearLevel];
          options.subject.examSessionDays.forEach(exam => {
            const existingSession = defaultSessions.find(s => s.day === exam.day);
            if (existingSession) {
              existingSession.isExam = true;
              existingSession.examType = exam.name.includes('1') ? 'Prelims' : exam.name.includes('2') ? 'Midterms' : 'Finals';
            }
          });
        }
        // Clear the old format after migration
        options.subject.examSessionDays = [];
      }
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
    // Validate session titles before saving
    for (const yearLevel in options.subject.defaultSessionsPerYearLevel) {
      const sessions = options.subject.defaultSessionsPerYearLevel[yearLevel];
      for (const session of sessions) {
        if (!session.title || session.title.trim() === '') {
          notificationService.showError(`Please fill in all session titles for ${yearLevel} Year`);
          showStatus('Please fill in all session titles', 'error');
          return;
        }
      }
    }
    
    // Rest of your save logic...
    await systemOptionsService.update(options);
    notificationService.showSuccess('System options saved successfully');
    showStatus('Settings saved successfully', 'success');
  } catch (error) {
    // Error handling...
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
        Object.assign(options, JSON.parse(JSON.stringify(defaultOptions)));
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
  const newYearLevelName = `New Year Level ${options.subject.yearLevels.length + 1}`;
  if (!options.subject.yearLevels.includes(newYearLevelName)) {
    options.subject.yearLevels.push(newYearLevelName);
    options.subject.sessionsPerYearLevel[newYearLevelName] = 2; // Start with the 2 default sessions
    options.subject.defaultSessionsPerYearLevel[newYearLevelName] = [
      { day: 0, title: 'INTRODUCTION', isExam: false, examType: '' },
      { day: 1, title: 'ORIENTATION', isExam: false, examType: '' }
    ];
    options.subject.sspCodePerYearLevel[newYearLevelName] = '';
  }
}

function removeSubjectYearLevel(index) {
  const yearLevelToRemove = options.subject.yearLevels[index];
  
  // Remove from yearLevels array
  options.subject.yearLevels.splice(index, 1)

  // Remove from sessionsPerYearLevel object
  if (options.subject.sessionsPerYearLevel.hasOwnProperty(yearLevelToRemove)) {
    delete options.subject.sessionsPerYearLevel[yearLevelToRemove];
  }

  // Remove from defaultSessionsPerYearLevel object
  if (options.subject.defaultSessionsPerYearLevel.hasOwnProperty(yearLevelToRemove)) {
    delete options.subject.defaultSessionsPerYearLevel[yearLevelToRemove];
  }

  // Remove from sspCodePerYearLevel object
  if (options.subject.sspCodePerYearLevel.hasOwnProperty(yearLevelToRemove)) {
    delete options.subject.sspCodePerYearLevel[yearLevelToRemove];
  }

  // Remove from expanded state
  if (expandedYearLevels.value.hasOwnProperty(yearLevelToRemove)) {
    delete expandedYearLevels.value[yearLevelToRemove];
  }
}

// Toggle year level expansion
function toggleYearLevel(yearLevel) {
  expandedYearLevels.value[yearLevel] = !expandedYearLevels.value[yearLevel];
}

// Year level default sessions functions
function getYearLevelDefaultSessions(yearLevel) {
  if (!options.subject.defaultSessionsPerYearLevel[yearLevel]) {
    options.subject.defaultSessionsPerYearLevel[yearLevel] = [];
  }
  return options.subject.defaultSessionsPerYearLevel[yearLevel];
}

function addYearLevelDefaultSession(yearLevel) {
  const sessions = getYearLevelDefaultSessions(yearLevel);
  const nextDay = sessions.length > 0 ? Math.max(...sessions.map(s => s.day || 0)) + 1 : 0;
  sessions.push({ day: nextDay, title: '', isExam: false, examType: '' });
}

function removeYearLevelDefaultSession(yearLevel, index) {
  if (index >= 2) {
    const sessions = getYearLevelDefaultSessions(yearLevel);
    sessions.splice(index, 1);
  }
}
</script>