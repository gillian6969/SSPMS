<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Notifications -->
      <div v-if="notification" class="fixed top-4 right-4 z-50 transform transition-all duration-500 max-w-sm">
        <div :class="{
          'bg-emerald-50 border-emerald-200 text-emerald-800': notification.type === 'success',
          'bg-blue-50 border-blue-200 text-blue-800': notification.type === 'info',
          'bg-amber-50 border-amber-200 text-amber-800': notification.type === 'warning',
          'bg-red-50 border-red-200 text-red-800': notification.type === 'error'
        }" class="border rounded-lg p-4 shadow-lg flex items-start">
          <div class="flex-shrink-0 mr-3">
            <svg v-if="notification.type === 'success'" class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-normal">{{ notification.message }}</p>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-normal text-gray-800">Pending Registrations</h1>
              <p class="text-gray-500 font-normal">Review and manage student registration requests</p>
            </div>
          <div class="flex items-center space-x-3">
            <button 
              @click="approveSelected" 
              :disabled="selectedStudents.length === 0"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Approve Selected ({{ selectedStudents.length }})
            </button>
            <button 
              @click="rejectSelected" 
              :disabled="selectedStudents.length === 0"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject Selected ({{ selectedStudents.length }})
            </button>
          <button 
            @click="fetchPendingRegistrations" 
            class="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-normal text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>
          </div>
        </div>
        
      <!-- UnifiedTable for Pending Registrations -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 mt-4">
        <UnifiedTable
          :data="filteredPendingStudents"
          :columns="tableColumns"
          :sortable-columns="sortableColumns"
          :loading="loading"
          loading-text="Loading pending registrations..."
          search-placeholder="Search by name, ID, or email"
          empty-state-title="No pending registrations found"
          empty-state-message="There are currently no student registration requests waiting for approval"
          @search="handleUnifiedSearch"
          @sort="handleUnifiedSort"
          @page-change="handleUnifiedPageChange"
        >
          <template #filters>
            <!-- Gender Filter -->
    

            <!-- Major Filter -->
            <select
              v-model="filters.major"
              @change="applyFilters"
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Majors</option>
              <option value="Business Informatics">Business Informatics</option>
              <option value="System Development">System Development</option>
              <option value="Digital Arts">Digital Arts</option>
              <option value="Computer Security">Computer Security</option>
            </select>

            <!-- Registration Date Filter -->
            <select
              v-model="filters.registrationDate"
              @change="applyFilters"
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </template>

          <template #row="{ item: student }">
            <td class="px-6 py-4 whitespace-nowrap">
              <input 
                type="checkbox" 
                :value="student._id"
                v-model="selectedStudents"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-sm font-medium text-blue-600">{{ getInitials(student.user) }}</span>
                    </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                        {{ student.user.firstName }} {{ student.user.middleName ? student.user.middleName + ' ' : '' }}{{ student.user.lastName }} {{ student.user.nameExtension !== 'N/A' ? student.user.nameExtension : '' }}
                      </div>
                  <div class="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                    <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{{ student.gender }}</span>
                    <span class="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{{ student.major }}</span>
                      </div>
                    </div>
                  </div>
                </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
              {{ student.user.idNumber }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ student.user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ student.classInfo ? student.classInfo.yearLevel : '-' }}
                </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ student.classInfo ? student.classInfo.section : '-' }}
                </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ student.classInfo ? student.classInfo.major : '-' }}
                </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(student.createdAt) }}
                </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <div class="flex items-center justify-center space-x-2">
                    <button 
                      @click="viewStudent(student)"
                  class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      View
                    </button>
                  </div>
                </td>
          </template>
        </UnifiedTable>
      </div>
    </div>
  </div>

  <!-- Confirmation Modal -->
  <UnifiedModal v-model="confirmModal.show" :title="confirmModal.title" @close="confirmModal.show = false">
    <template #default>
      <div class="flex items-start space-x-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                :class="confirmModal.type === 'approve' ? 'bg-green-100' : 'bg-red-100'">
          <svg class="w-5 h-5" 
                  :class="confirmModal.type === 'approve' ? 'text-green-600' : 'text-red-600'"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="confirmModal.type === 'approve'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
        <div class="flex-1">
          <p class="text-sm text-gray-600">{{ confirmModal.message }}</p>
                </div>
              </div>
    </template>
    <template #footer>
            <button 
              @click="confirmModal.onConfirm"
              type="button" 
              :class="[
          'px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
          confirmModal.type === 'approve' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              ]"
              :disabled="isProcessing"
            >
              <svg v-if="isProcessing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
        {{ isProcessing ? 'Processing...' : confirmModal.confirmText }}
            </button>
    </template>
  </UnifiedModal>

    <!-- View Student Modal (Registration Application) -->
    <div v-if="viewModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeViewModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Registration Application</h3>
          <button @click="closeViewModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="viewModal.student" class="p-6 space-y-4">
          <div class="flex items-center">
            <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">
              {{ getInitials(viewModal.student.user) }}
            </div>
            <div>
              <div class="text-sm text-gray-500">Submitted</div>
              <div class="text-sm text-gray-800">{{ formatDate(viewModal.student.createdAt) }}</div>
            </div>
          </div>
          <div class="bg-gray-50 rounded-md p-4 border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Personal Information</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-500">Full Name</div>
                <div class="text-gray-800">{{ viewModal.student.user.firstName }} {{ viewModal.student.user.middleName ? viewModal.student.user.middleName + ' ' : '' }}{{ viewModal.student.user.lastName }} {{ viewModal.student.user.nameExtension !== 'N/A' ? viewModal.student.user.nameExtension : '' }}</div>
              </div>
              <div>
                <div class="text-gray-500">ID Number</div>
                <div class="text-gray-800 font-mono">{{ viewModal.student.user.idNumber }}</div>
              </div>
              <div>
                <div class="text-gray-500">Gender</div>
                <div class="text-gray-800">{{ viewModal.student.gender }}</div>
              </div>
              <div>
                <div class="text-gray-500">Major</div>
                <div class="text-gray-800">{{ viewModal.student.major }}</div>
              </div>
              <div>
                <div class="text-gray-500">Email</div>
                <div class="text-indigo-700">{{ viewModal.student.user.email }}</div>
              </div>
              <div>
                <div class="text-gray-500">Contact Number</div>
                <div class="text-gray-800">{{ viewModal.student.contactNumber || 'Not provided' }}</div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 rounded-md p-4 border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Address</h4>
            <div class="text-sm text-gray-800" v-if="formatAddress(viewModal.student.address)">{{ formatAddress(viewModal.student.address) }}</div>
            <div class="text-sm text-gray-500 italic" v-else>No address provided</div>
          </div>
          <div class="bg-gray-50 rounded-md p-4 border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Class Assignment</h4>
            <div class="inline-block text-sm bg-indigo-50 text-indigo-800 px-3 py-2 rounded">{{ getStudentClassInfo(viewModal.student) }}</div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end gap-2">
          <button 
            @click="confirmAction('approve', viewModal.student?._id); closeViewModal();"
            class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Approve
          </button>
          <button 
            @click="confirmAction('reject', viewModal.student?._id); closeViewModal();"
            class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { studentService } from '../../services/studentService';
import UnifiedTable from '../../components/ui/UnifiedTable.vue';
import UnifiedModal from '../../components/ui/UnifiedModal.vue';

// State
const loading = ref(false);
const error = ref('');
const pendingStudents = ref([]);
const notification = ref(null);
const isProcessing = ref(false);
const selectedStudents = ref([]);

// Filters
const filters = reactive({
  major: '',
  registrationDate: '',
  search: ''
});

// UnifiedTable config
const tableColumns = [
  { key: 'select', label: '', class: 'w-12' },
  { key: 'student', label: 'Student', class: '' },
  { key: 'idNumber', label: 'ID No.', class: '' },
  { key: 'email', label: 'Email', class: '' },
  { key: 'yearLevel', label: 'Year Level', class: '' },
  { key: 'section', label: 'Section', class: '' },
  { key: 'major', label: 'Major', class: '' },
  { key: 'registered', label: 'Registered', class: '' },
  { key: 'actions', label: 'Actions', class: 'text-center' }
];

const sortableColumns = [
  { value: 'user.lastName', label: 'Student' },
  { value: 'user.idNumber', label: 'ID Number' },
  { value: 'user.email', label: 'Email' },
  { value: 'classInfo.yearLevel', label: 'Year Level' },
  { value: 'classInfo.section', label: 'Section' },
  { value: 'classInfo.major', label: 'Major' },
  { value: 'createdAt', label: 'Registration Date' }
];

const viewModal = reactive({
  show: false,
  student: null
});

const confirmModal = reactive({
  show: false,
  title: '',
  message: '',
  type: '',
  studentId: null,
  onConfirm: null
});

// Computed
const filteredPendingStudents = computed(() => {
  let filtered = pendingStudents.value;

  // Filter by major
  if (filters.major) {
    filtered = filtered.filter(student => student.major === filters.major);
  }

  // Filter by registration date
  if (filters.registrationDate) {
    const now = new Date();
    filtered = filtered.filter(student => {
      const registrationDate = new Date(student.createdAt);
      switch (filters.registrationDate) {
        case 'today':
          return registrationDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return registrationDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return registrationDate >= monthAgo;
        default:
          return true;
      }
    });
  }

  // Filter by search
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(student => {
      const fullName = `${student.user.firstName} ${student.user.middleName || ''} ${student.user.lastName}`.toLowerCase();
      return fullName.includes(searchTerm) ||
             student.user.idNumber.toLowerCase().includes(searchTerm) ||
             student.user.email.toLowerCase().includes(searchTerm);
    });
  }

  return filtered;
});

// UnifiedTable handlers
const handleUnifiedSearch = (searchTerm) => {
  filters.search = searchTerm;
};

const handleUnifiedSort = (sortConfig) => {
  // Handle sorting if needed
  console.log('Sort:', sortConfig);
};

const handleUnifiedPageChange = (page) => {
  // Handle pagination if needed
  console.log('Page change:', page);
};

const applyFilters = () => {
  // Trigger reactive update
};

onMounted(() => {
  fetchPendingRegistrations();
});

// Function to fetch pending registrations
const fetchPendingRegistrations = async () => {
  loading.value = true;
  error.value = '';
  notification.value = null;
  
  try {
    console.log('Fetching pending registrations...');
    const data = await studentService.getPendingRegistrations();
    
    if (!data) {
      console.warn('No data returned from getPendingRegistrations');
      pendingStudents.value = [];
      showNotification('info', 'No pending registrations found');
      return;
    }
    
    // Simple validation - we expect an array
    if (Array.isArray(data)) {
      console.log(`Received ${data.length} pending registrations`);
      console.log('First student data structure:', data[0]);
      pendingStudents.value = data;
      
      if (data.length === 0) {
        showNotification('info', 'No pending registrations found');
      }
    } else {
      console.error('Unexpected data format:', data);
      pendingStudents.value = [];
      showNotification('error', 'Received invalid data format from server');
    }
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    pendingStudents.value = [];
    
    // Display user-friendly error message
    if (error.response) {
      const message = error.response.data?.message || `Server error (${error.response.status})`;
      showNotification('error', message);
    } else {
      showNotification('error', 'Failed to connect to server');
    }
  } finally {
    loading.value = false;
  }
};

// Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Get student initials for avatar
function getInitials(user) {
  if (!user) return '??';
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

// Format address
function formatAddress(address) {
  if (!address) return '';
  
  const parts = [];
  if (address.block) parts.push(address.block);
  if (address.street) parts.push(address.street);
  if (address.barangay) parts.push(address.barangay);
  if (address.municipality) parts.push(address.municipality);
  if (address.province) parts.push(address.province);
  if (address.region) parts.push(address.region);
  
  return parts.join(', ');
}

// Format class info when from a class object
function getClassString(classObj) {
  if (!classObj) return 'Not assigned';
  
  let info = '';
  
  if (classObj.yearLevel) {
    info += `${classObj.yearLevel}`;
    
    // Add suffix to year level
    if (classObj.yearLevel === '1') info += 'st';
    else if (classObj.yearLevel === '2') info += 'nd';
    else if (classObj.yearLevel === '3') info += 'rd';
    else info += 'th';
    
    info += ' Year';
  }
  
  if (classObj.section) {
    info += ` - ${classObj.section}`;
  }
  
  if (classObj.major) {
    info += ` (${classObj.major})`;
  }
  
  return info || 'Not assigned';
}

// Helper function to format class info consistently
function formatClassInfo(classInfo) {
  if (!classInfo) return 'Not assigned';
  
  let info = '';
  
  if (classInfo.yearLevel) {
    // Normalize yearLevel to add suffix if not present
    let yearLevel = classInfo.yearLevel;
    
    // Strip any existing suffix first (2nd → 2, 3rd → 3)
    if (typeof yearLevel === 'string' && 
        (yearLevel.endsWith('nd') || yearLevel.endsWith('rd') || yearLevel.endsWith('th'))) {
      yearLevel = yearLevel.replace(/[^0-9]/g, '');
    }
    
    info += yearLevel;
    
    // Add suffix to year level
    if (yearLevel === '1' || yearLevel === 1) info += 'st';
    else if (yearLevel === '2' || yearLevel === 2) info += 'nd';
    else if (yearLevel === '3' || yearLevel === 3) info += 'rd';
    else info += 'th';
    
    info += ' Year';
  }
  
  if (classInfo.section) {
    info += ` - ${classInfo.section}`;
  }
  
  if (classInfo.major) {
    info += ` (${classInfo.major})`;
  }
  
  return info || 'Not assigned';
}

// Get class info from student object
function getStudentClassInfo(student) {
  if (!student) return 'Not assigned';
  
  // First try class object
  if (student.class && typeof student.class === 'object') {
    return formatClassInfo(student.class);
  }
  
  // Then try classInfo property
  if (student.classInfo) {
    return formatClassInfo(student.classInfo);
  }
  
  // Then try classDetails property
  if (student.classDetails) {
    return formatClassInfo(student.classDetails);
  }
  
  return 'Not assigned';
}

async function approveRegistration(studentId) {
  if (isProcessing.value) return;
  
  try {
    isProcessing.value = true;
    confirmModal.show = false;
    
    await studentService.approveRegistration(studentId);
    
    // Remove approved student from list
    pendingStudents.value = pendingStudents.value.filter(student => student._id !== studentId);
    
    showNotification('success', 'Registration approved successfully. Student has been notified via email.');
  } catch (error) {
    showNotification('error', 'Failed to approve registration');
    console.error('Error approving registration:', error);
  } finally {
    isProcessing.value = false;
  }
}

async function rejectRegistration(studentId) {
  if (isProcessing.value) return;
  
  try {
    isProcessing.value = true;
    confirmModal.show = false;
    
    await studentService.rejectRegistration(studentId);
    
    // Remove rejected student from list
    pendingStudents.value = pendingStudents.value.filter(student => student._id !== studentId);
    
    showNotification('success', 'Registration rejected. Student has been notified via email.');
  } catch (error) {
    showNotification('error', 'Failed to reject registration');
    console.error('Error rejecting registration:', error);
  } finally {
    isProcessing.value = false;
  }
}

function viewStudent(student) {
  viewModal.student = student;
  viewModal.show = true;
}

function closeViewModal() {
  viewModal.show = false;
}

function confirmAction(type, studentId) {
  confirmModal.type = type;
  confirmModal.studentId = studentId;
  confirmModal.title = type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection';
  confirmModal.message = type === 'approve' 
    ? 'Are you sure you want to approve this student registration?' 
    : 'Are you sure you want to reject this student registration?';
  confirmModal.confirmText = type === 'approve' ? 'Approve' : 'Reject';
  
  confirmModal.onConfirm = () => {
    if (type === 'approve') {
      approveRegistration(studentId);
    } else {
      rejectRegistration(studentId);
    }
  };
  
  confirmModal.show = true;
}

// Bulk actions
function approveSelected() {
  if (selectedStudents.value.length === 0) return;
  
  confirmModal.type = 'approve';
  confirmModal.title = 'Approve Selected Registrations';
  confirmModal.message = `Are you sure you want to approve ${selectedStudents.value.length} student registration(s)?`;
  confirmModal.confirmText = 'Approve All';
  
  confirmModal.onConfirm = async () => {
    try {
      isProcessing.value = true;
      confirmModal.show = false;
      
      for (const studentId of selectedStudents.value) {
        await studentService.approveRegistration(studentId);
      }
      
      // Remove approved students from list
      pendingStudents.value = pendingStudents.value.filter(student => !selectedStudents.value.includes(student._id));
      selectedStudents.value = [];
      
      showNotification('success', `${selectedStudents.value.length} registration(s) approved successfully.`);
    } catch (error) {
      showNotification('error', 'Failed to approve some registrations');
      console.error('Error approving registrations:', error);
    } finally {
      isProcessing.value = false;
    }
  };
  
  confirmModal.show = true;
}

function rejectSelected() {
  if (selectedStudents.value.length === 0) return;
  
  confirmModal.type = 'reject';
  confirmModal.title = 'Reject Selected Registrations';
  confirmModal.message = `Are you sure you want to reject ${selectedStudents.value.length} student registration(s)?`;
  confirmModal.confirmText = 'Reject All';
  
  confirmModal.onConfirm = async () => {
    try {
      isProcessing.value = true;
      confirmModal.show = false;
      
      for (const studentId of selectedStudents.value) {
        await studentService.rejectRegistration(studentId);
      }
      
      // Remove rejected students from list
      pendingStudents.value = pendingStudents.value.filter(student => !selectedStudents.value.includes(student._id));
      selectedStudents.value = [];
      
      showNotification('success', `${selectedStudents.value.length} registration(s) rejected successfully.`);
    } catch (error) {
      showNotification('error', 'Failed to reject some registrations');
      console.error('Error rejecting registrations:', error);
    } finally {
      isProcessing.value = false;
    }
  };
  
  confirmModal.show = true;
}

// Show notification
const showNotification = (type, message) => {
  notification.value = { type, message };
  setTimeout(() => {
    notification.value = null;
  }, 5000);
};
</script> 