<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Student Archive</h1>
            <p class="text-gray-500 font-normal">Manage graduated and irregular student records</p>
          </div>
          <div class="text-sm text-gray-500 font-normal">Total: {{ filteredStudents.length }} students</div>
        </div>
      </div>

      <!-- UnifiedTable -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-0">
        <UnifiedTable
          :data="filteredStudents"
          :columns="tableColumns"
          :sortable-columns="sortableColumns"
          :loading="loading"
          loading-text="Loading archived students..."
          search-placeholder="Name, ID, or Email"
          empty-state-title="No archived students found"
          empty-state-message="No students match the current filters"
          @search="(q) => { filters.search = q }"
          @sort="() => {}"
          @page-change="() => {}"
        >
          <template #filters>
            <select v-model="filters.status" @change="onStatusChange" class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">All</option>
              <option value="graduated">Graduated Students</option>
              <option value="dropped">Irregular Students</option>
            </select>
            <select v-model="filters.yearLevel" @change="applyFilters" class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">All Year Levels</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
            <select v-model="filters.major" @change="applyFilters" class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">All Majors</option>
              <option value="Business Informatics">Business Informatics</option>
              <option value="System Development">System Development</option>
              <option value="Digital Arts">Digital Arts</option>
              <option value="Computer Security">Computer Security</option>
            </select>
          </template>

          <template #row="{ item: student }">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-purple-600">{{ getInitials(student) }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ getFullName(student) }}</div>
                  <div class="text-sm text-gray-500">{{ student.user?.idNumber }}</div>
                  <div class="text-sm text-gray-500">{{ student.user?.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(student.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusLabel(student.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div v-if="student.graduationClass">
                {{ student.graduationClass.yearLevel }} - {{ student.graduationClass.section }}
                <div class="text-xs text-gray-500">{{ student.graduationClass.major }}</div>
              </div>
              <div v-else-if="student.classDetails">
                {{ student.classDetails.yearLevel }} - {{ student.classDetails.section }}
                <div class="text-xs text-gray-500">{{ student.classDetails.major }}</div>
              </div>
              <div v-else class="text-gray-400">N/A</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div v-if="student.status === 'graduated'">
                <div class="font-medium">{{ formatDate(student.graduationDate) }}</div>
                <div class="text-xs text-gray-500">Graduated</div>
              </div>
              <div v-else-if="student.status === 'dropped'">
                <div class="font-medium">{{ formatDate(student.dropDate) }}</div>
                <div class="text-xs text-gray-500">Dropped</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div v-if="student.status === 'graduated'" class="text-green-600 font-medium">School Year: {{ student.graduationSchoolYear }}</div>
              <div v-else-if="student.status === 'dropped'" class="text-red-600 font-medium">{{ student.dropReason }}</div>
              <div v-if="student.dropSemester" class="text-xs text-gray-500">{{ student.dropSemester }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <div class="flex items-center justify-center space-x-2">
                <button @click="viewStudent(student)" class="px-3 py-1.5 text-xs font-normal text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">View</button>
                <button v-if="student.status === 'dropped'" @click="openReactivate(student)" class="px-3 py-1.5 text-xs font-normal text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100">Reactivate</button>
              </div>
            </td>
          </template>
        </UnifiedTable>
      </div>

    </div>

    <!-- View Student Modal -->
    <Teleport to="body">
      <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center" style="z-index: 999999;" @click.self="closeViewModal">
        <div class="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm border border-gray-200 border-opacity-60 rounded-2xl shadow-xl w-full max-w-2xl mx-auto p-6 max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-300" style="z-index: 1000000;">
          <div class="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 class="text-2xl font-semibold text-purple-600">Student Details</h2>
            <button @click="closeViewModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedStudent">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Personal Information -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
                <div class="space-y-2">
                  <div>
                    <span class="text-sm font-medium text-gray-500">Full Name:</span>
                    <p class="text-sm text-gray-900">{{ getFullName(selectedStudent) }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Student ID:</span>
                    <p class="text-sm text-gray-900">{{ selectedStudent.user?.idNumber }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Email:</span>
                    <p class="text-sm text-gray-900">{{ selectedStudent.user?.email }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Gender:</span>
                    <p class="text-sm text-gray-900">{{ selectedStudent.gender }}</p>
                  </div>
                </div>
              </div>

              <!-- Academic Information -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Academic Information</h3>
                <div class="space-y-2">
                  <div>
                    <span class="text-sm font-medium text-gray-500">Status:</span>
                    <span :class="getStatusClass(selectedStudent.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2">
                      {{ getStatusLabel(selectedStudent.status) }}
                    </span>
                  </div>
                  <div v-if="selectedStudent.graduationClass || selectedStudent.classDetails">
                    <span class="text-sm font-medium text-gray-500">Last Class:</span>
                    <p class="text-sm text-gray-900">
                      {{ (selectedStudent.graduationClass || selectedStudent.classDetails).yearLevel }} - 
                      {{ (selectedStudent.graduationClass || selectedStudent.classDetails).section }}
                    </p>
                    <p class="text-sm text-gray-600">{{ (selectedStudent.graduationClass || selectedStudent.classDetails).major }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500">Enrollment Date:</span>
                    <p class="text-sm text-gray-900">{{ formatDate(selectedStudent.enrollmentDate) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status-specific Information -->
            <div class="mt-6 p-4 rounded-lg" :class="selectedStudent.status === 'graduated' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
              <h3 class="text-lg font-semibold mb-3" :class="selectedStudent.status === 'graduated' ? 'text-green-800' : 'text-red-800'">
                {{ selectedStudent.status === 'graduated' ? 'Graduation Details' : 'Drop Details' }}
              </h3>
              
              <div v-if="selectedStudent.status === 'graduated'" class="space-y-2">
                <div>
                  <span class="text-sm font-medium text-green-600">Graduation Date:</span>
                  <p class="text-sm text-green-800">{{ formatDate(selectedStudent.graduationDate) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-green-600">School Year:</span>
                  <p class="text-sm text-green-800">{{ selectedStudent.graduationSchoolYear }}</p>
                </div>
              </div>
              
              <div v-else-if="selectedStudent.status === 'dropped'" class="space-y-2">
                <div>
                  <span class="text-sm font-medium text-red-600">Drop Date:</span>
                  <p class="text-sm text-red-800">{{ formatDate(selectedStudent.dropDate) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-red-600">Reason:</span>
                  <p class="text-sm text-red-800">{{ selectedStudent.dropReason }}</p>
                </div>
                <div v-if="selectedStudent.dropSemester">
                  <span class="text-sm font-medium text-red-600">Semester:</span>
                  <p class="text-sm text-red-800">{{ selectedStudent.dropSemester }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reactivate Modal -->
    <Teleport to="body">
      <div v-if="showReactivateModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999]" @click.self="showReactivateModal=false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Reactivate Student</h3>
            <button @click="showReactivateModal=false" class="text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="space-y-3">
            <div class="text-sm text-gray-700">Select a class to assign after reactivation</div>
            <select v-model="selectedClassId" class="w-full p-2 border rounded-md">
              <option value="">Choose a class</option>
              <option v-for="cls in availableClasses" :key="cls._id" :value="cls._id">
                {{ cls.yearLevel }} - {{ cls.section }} ({{ cls.major }})
              </option>
            </select>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button @click="showReactivateModal=false" class="px-4 py-2 rounded border">Cancel</button>
            <button @click="confirmReactivate" :disabled="!selectedClassId" class="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">Confirm</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, Teleport } from 'vue';
import UnifiedTable from '../../components/ui/UnifiedTable.vue'
import { notificationService } from '../../services/notificationService';
import api from '../../services/api';

// State
const loading = ref(false);
const students = ref([]);
const selectedStudent = ref(null);
const showViewModal = ref(false);

// Filters
const filters = reactive({
  status: 'graduated',
  yearLevel: '',
  major: '',
  search: ''
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(15);

// Search debounce
let searchTimeout = null;

// Computed
const filteredStudents = computed(() => {
  let filtered = students.value;

  // Filter by status
  if (filters.status) {
    filtered = filtered.filter(student => student.status === filters.status);
  }

  // Filter by year level
  if (filters.yearLevel) {
    filtered = filtered.filter(student => {
      const yearLevel = student.graduationClass?.yearLevel || student.classDetails?.yearLevel || '';
      return yearLevel.includes(filters.yearLevel);
    });
  }

  // Filter by major
  if (filters.major) {
    filtered = filtered.filter(student => {
      const major = student.graduationClass?.major || student.classDetails?.major || '';
      return major === filters.major;
    });
  }

  // Filter by search term
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(student => {
      const fullName = getFullName(student).toLowerCase();
      const idNumber = student.user?.idNumber?.toLowerCase() || '';
      const email = student.user?.email?.toLowerCase() || '';
      
      return fullName.includes(searchTerm) || 
             idNumber.includes(searchTerm) || 
             email.includes(searchTerm);
    });
  }

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / itemsPerPage.value));

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredStudents.value.slice(start, end);
});

// UnifiedTable config
const tableColumns = [
  { key: 'student', label: 'Student', class: '' },
  { key: 'status', label: 'Status', class: '' },
  { key: 'lastClass', label: 'Last Class', class: '' },
  { key: 'date', label: 'Date', class: '' },
  { key: 'details', label: 'Details', class: '' },
  { key: 'actions', label: 'Actions', class: 'text-center' }
]

const sortableColumns = [
  { value: 'user.lastName', label: 'Student' },
  { value: 'status', label: 'Status' },
  { value: 'graduationClass.yearLevel', label: 'Year Level' }
]

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredStudents.value.length));

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    }
  }
  
  return pages.filter(page => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page));
});

// Methods
function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
  }, 300);
}

function onStatusChange() {
  currentPage.value = 1;
  fetchArchivedStudents();
}

function applyFilters() {
  currentPage.value = 1;
}

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function getInitials(student) {
  if (!student?.user) return '--';
  const firstName = student.user.firstName || '';
  const lastName = student.user.lastName || '';
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

function getFullName(student) {
  if (!student?.user) return 'Unknown Student';
  
  const firstName = student.user.firstName || '';
  const middleName = student.user.middleName ? ` ${student.user.middleName.charAt(0)}.` : '';
  const lastName = student.user.lastName || '';
  const nameExt = student.user.nameExtension && student.user.nameExtension !== 'N/A' ? ` ${student.user.nameExtension}` : '';
  
  return `${firstName}${middleName} ${lastName}${nameExt}`;
}

function getStatusClass(status) {
  switch (status) {
    case 'graduated':
      return 'bg-green-100 text-green-800';
    case 'dropped':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'graduated':
      return 'Graduated';
    case 'dropped':
      return 'Irregular';
    default:
      return status;
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function viewStudent(student) {
  selectedStudent.value = student;
  showViewModal.value = true;
}

function closeViewModal() {
  showViewModal.value = false;
  selectedStudent.value = null;
}

// Reactivate flow
const showReactivateModal = ref(false);
const studentToReactivate = ref(null);
const selectedClassId = ref('');
const availableClasses = ref([]);

function openReactivate(student){
  studentToReactivate.value = student;
  selectedClassId.value = '';
  showReactivateModal.value = true;
  loadClasses();
}

async function loadClasses(){
  try{
    const res = await api.get('/classes');
    availableClasses.value = res.data || [];
  }catch(e){
    availableClasses.value = [];
  }
}

async function confirmReactivate(){
  if(!studentToReactivate.value || !selectedClassId.value) return;
  try{
    // Reactivate status
    await api.post(`/students/${studentToReactivate.value._id}/reactivate`);
    // Assign class
    await api.post(`/students/${studentToReactivate.value._id}/assign-class`, { classId: selectedClassId.value });
    notificationService.showSuccess('Student reactivated and assigned to class');
    showReactivateModal.value = false;
    studentToReactivate.value = null;
    await fetchArchivedStudents();
  }catch(err){
    notificationService.showError('Failed to reactivate student');
  }
}

async function fetchArchivedStudents() {
  try {
    loading.value = true;
    
    const params = {};
    if (filters.status) params.status = filters.status;
    const response = await api.get('/students/archived', { params });
    
    if (response.data?.success) {
      students.value = response.data.students || [];
      console.log(`Loaded ${students.value.length} archived students`);
    } else {
      throw new Error(response.data?.message || 'Failed to fetch archived students');
    }
  } catch (error) {
    console.error('Error fetching archived students:', error?.response?.data || error);
    notificationService.showError(error?.response?.data?.message || 'Failed to load archived students');
    students.value = [];
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  fetchArchivedStudents();
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

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
