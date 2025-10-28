<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div>
              <h1 class="text-2xl font-normal text-gray-800">M&M and Permit History</h1>
              <p class="text-gray-500 font-normal">View all your submitted M&M response forms and exam permits</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div class="flex justify-center mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <p class="text-gray-500">Loading your submission history...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="history.length === 0" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">No submissions found</h3>
        <p class="text-gray-500 mb-4">You haven't submitted any M&M response forms or exam permits yet.</p>
        <router-link to="/student/surveys" class="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Submit Your First M&M
        </router-link>
      </div>

      <!-- History List -->
      <div v-else class="space-y-6">
        <div v-for="yearSemester in history" :key="`${yearSemester.yearLevel}-${yearSemester.semester}`" class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <!-- Year Level Header -->
          <div class="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-6">
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <div>
                  <h2 class="text-2xl font-bold">{{ yearSemester.yearLevel }} Year - {{ yearSemester.semester }} Semester</h2>
                  <p class="text-green-100 mt-1">
                    M&M and Permit Submissions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-8">
            <!-- M&M Submissions -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">M&M Response Forms</h3>
              <div v-if="(yearSemester.mmSubmissions?.length || 0) > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="submission in yearSemester.mmSubmissions" :key="submission._id" class="bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                  <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                      <h3 class="text-lg font-semibold text-gray-800">{{ submission.examType }} Response</h3>
                      <span class="px-2 py-1 text-xs rounded-full font-medium" :class="getStatusClass(submission.status)">
                        {{ submission.status }}
                      </span>
                    </div>
                    
                    <!-- Image Preview -->
                    <div class="w-full h-48 rounded-lg border overflow-hidden flex items-center justify-center bg-gray-50 mb-4">
                      <img 
                        :src="submission.imageUrl" 
                        :alt="`${submission.examType} Response Submission`"
                        class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        @click="openImageModal(submission)"
                      />
                    </div>
                    
                    <div class="text-sm text-gray-500 mb-3">
                      Submitted {{ formatDate(submission.submissionDate) }}
                    </div>
                    
                    <button 
                      @click="openImageModal(submission)"
                      class="w-full py-2 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      View Full Image
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500">No M&M submissions for this term.</div>
            </div>

            <!-- Exam Permits -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Exam Permits</h3>
              <div v-if="(yearSemester.permits?.length || 0) > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="permit in yearSemester.permits" :key="permit._id" class="bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                  <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                      <h3 class="text-lg font-semibold text-gray-800">{{ permit.examType }} Permit</h3>
                      <span class="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">validated</span>
                    </div>
                    
                    <!-- Image Preview -->
                    <div class="w-full h-48 rounded-lg border overflow-hidden flex items-center justify-center bg-gray-50 mb-4">
                      <template v-if="permit.mimetype === 'application/pdf'">
                        <a :href="permit.imageUrl" target="_blank" rel="noopener" class="px-3 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700">
                          Open PDF
                        </a>
                      </template>
                      <img v-else
                        :src="permit.imageUrl" 
                        :alt="`${permit.examType} Permit`"
                        class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        @click="openImageModal(permit)"
                      />
                    </div>
                    
                    <div class="text-sm text-gray-500 mb-3">
                      Submitted {{ formatDate(permit.submissionDate) }}
                    </div>
                    
                    <button v-if="permit.mimetype !== 'application/pdf'"
                      @click="openImageModal(permit)"
                      class="w-full py-2 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      View Full Image
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500">No validated permits for this term.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="selectedSubmission" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" @click="closeImageModal">
      <div class="relative max-w-2xl max-h-[80vh] bg-white rounded-lg overflow-hidden" @click.stop>
        <div class="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
          <h3 class="text-lg font-medium">
            {{ selectedSubmission.examType }} - {{ selectedSubmission.yearLevel }} Year, {{ selectedSubmission.semester }} Semester
          </h3>
          <button @click="closeImageModal" class="text-gray-300 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-4">
          <div class="text-center p-4">
            <img 
              :src="selectedSubmission.imageUrl" 
              :alt="`${selectedSubmission.examType} Submission`"
              class="max-w-full max-h-[60vh] mx-auto object-contain rounded"
            />
          </div>
          
          <!-- Submission Details -->
          <div class="mt-4 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Status:</span>
              <span class="px-2 py-1 text-xs rounded-full font-medium" :class="getStatusClass(selectedSubmission.status)">
                {{ selectedSubmission.status }}
              </span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700">Submitted:</span>
              <span class="text-sm text-gray-600">{{ formatDate(selectedSubmission.submissionDate) }}</span>
            </div>
            
            <div v-if="selectedSubmission.feedback" class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <h4 class="text-sm font-medium text-yellow-800 mb-1">Feedback:</h4>
              <p class="text-sm text-yellow-700">{{ selectedSubmission.feedback }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { mmService } from '../../services/midtermFinalsService';
import { notificationService } from '../../services/notificationService';

// State
const history = ref([]);
const loading = ref(true);
const selectedSubmission = ref(null);

// Methods
function getYearNumber(yearLevel) {
  const yearMap = {
    '1st Year': '1',
    '2nd Year': '2', 
    '3rd Year': '3',
    '4th Year': '4'
  };
  return yearMap[yearLevel] || '?';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusClass(status) {
  switch(status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

function openImageModal(submission) {
  selectedSubmission.value = submission;
}

function closeImageModal() {
  selectedSubmission.value = null;
}

// Load data
async function fetchHistory() {
  try {
    loading.value = true;
    console.log('Loading M&M history...');
    const response = await mmService.getHistory();
    
    if (response.success) {
      history.value = response.data || [];
      console.log('Loaded M&M history:', history.value);
      
      // Debug image URLs for both M&M and permits
      history.value.forEach(yearSemester => {
        const mmCount = (yearSemester.mmSubmissions?.length || 0);
        const permitCount = (yearSemester.permits?.length || 0);
        console.log(`Year ${yearSemester.yearLevel} - ${yearSemester.semester} Semester: MMs=${mmCount}, Permits=${permitCount}`);
        (yearSemester.mmSubmissions || []).forEach(submission => {
          console.log(`  MM ${submission.examType} image URL:`, submission.imageUrl);
        });
        (yearSemester.permits || []).forEach(permit => {
          console.log(`  Permit ${permit.examType} image URL:`, permit.imageUrl);
        });
      });
    } else {
      console.error('Failed to load M&M history:', response.message);
      history.value = [];
    }
  } catch (error) {
    console.error('Error fetching M&M history:', error);
    history.value = [];
    notificationService.showError('Failed to load M&M history');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchHistory();
});
</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.text-primary {
  color: #3B82F6;
}
.border-primary {
  border-color: #3B82F6;
}
.bg-primary-light {
  background-color: #EFF6FF;
}
</style> 