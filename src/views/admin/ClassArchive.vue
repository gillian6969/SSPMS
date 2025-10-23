<template>
  <div class="min-h-screen p-2" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Archived Classes</h1>
            <p class="text-gray-500 mt-1 font-normal">View and restore archived classes</p>
          </div>
        </div>
      </div>

      <!-- Archived Classes using UnifiedTable -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-7xl mx-auto mt-4">
        <UnifiedTable
          :data="filteredClasses"
          :columns="tableColumns"
          :sortable-columns="sortableColumns"
          :loading="loading"
          loading-text="Loading archived classes..."
          search-placeholder="Search by year, section, major, subject"
          empty-state-title="No archived classes found"
          empty-state-message="Try adjusting your search criteria"
          @search="handleSearch"
          @sort="handleSort"
          @page-change="handlePageChange"
        >
          <template #filters>
            <!-- Year Level Filter -->
            <select 
              v-model="yearFilter" 
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Years</option>
              <option v-for="year in yearLevels" :key="year" :value="year">{{ year }} Year</option>
            </select>

            <!-- Section Filter -->
            <select 
              v-model="sectionFilter" 
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Sections</option>
              <option v-for="section in availableSections" :key="section" :value="section">{{ section }}</option>
            </select>

            <!-- Major Filter (hide for 2nd year) -->
            <select 
              v-if="!yearFilter || yearFilter !== '2nd'"
              v-model="majorFilter" 
              class="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Majors</option>
              <option v-for="major in availableMajors" :key="major" :value="major">{{ major }}</option>
            </select>
          </template>

          <template #row="{ item: classItem }">
            <td class="px-6 py-4 text-sm text-gray-800">
              {{ classItem.yearLevel || 'Unknown' }} Year - {{ classItem.section || 'Unknown' }} ({{ classItem.major || '-' }})
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ getSubjectName(classItem) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">
                  {{ getSchedule(classItem) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button 
                    @click="restoreClass(classItem)" 
                    class="px-3 py-1.5 text-xs font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100"
                  >
                    Restore
                  </button>
                </td>
          </template>
        </UnifiedTable>
      </div>
    </div>

    <!-- Restore Confirmation Modal -->
    <div v-if="showRestoreModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeRestoreModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-normal text-gray-800">Restore Class</h3>
          <button @click="closeRestoreModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-6">
          <div class="flex items-start space-x-3">
            <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            <div>
              <h4 class="text-base font-medium text-gray-800 mb-2">Confirm Restoration</h4>
              <p class="text-sm text-gray-600 mb-4">
                Are you sure you want to restore <strong>{{ selectedClass ? getClassName(selectedClass) : '' }}</strong>? 
                This will make the class active and available for use again.
              </p>
              <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <div class="flex">
                  <svg class="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <div class="ml-2">
                    <p class="text-sm text-emerald-700">The class will be moved back to the active classes list and can be used immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
          <button
            @click="closeRestoreModal"
            class="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="confirmRestore"
            :disabled="restoring"
            class="px-4 py-2 text-sm font-normal text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="restoring">Restoring...</span>
            <span v-else>Restore Class</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { classService } from '../../services/classService';
import { notificationService } from '../../services/notificationService';
import api from '../../services/api';
import UnifiedTable from '../../components/ui/UnifiedTable.vue';

// State
const archivedClasses = ref([]);
const filteredClasses = ref([]);
const loading = ref(true);
const search = ref('');
const yearFilter = ref('');
const sectionFilter = ref('');
const majorFilter = ref('');
const yearLevels = ref(['2nd', '3rd', '4th']);

// Replace simple filter with computed that applies filters and search
const availableSections = computed(() => {
  if (!yearFilter.value) return []
  const sectionsMap = {
    '2nd': ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'],
    '3rd': ['South-1', 'South-2', 'South-3'],
    '4th': ['South-1', 'South-2']
  }
  return sectionsMap[yearFilter.value] || []
})

const availableMajors = computed(() => {
  if (!yearFilter.value) return []
  const majorsMap = {
    '2nd': [],
    '3rd': ['Business Informatics', 'System Development', 'Digital Arts'],
    '4th': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security']
  }
  return majorsMap[yearFilter.value] || []
})

// Modal state
const showRestoreModal = ref(false);
const selectedClass = ref(null);
const restoring = ref(false);

onMounted(async () => {
  await fetchArchivedClasses();
});

async function fetchArchivedClasses() {
  try {
    loading.value = true;
    const response = await api.get('/classes/archived/all');
    archivedClasses.value = response.data;
    filteredClasses.value = response.data;
  } catch (error) {
    console.error('Error fetching archived classes:', error);
    notificationService.showError('Failed to load archived classes. Please try again.');
    archivedClasses.value = [];
    filteredClasses.value = [];
  } finally {
    loading.value = false;
  }
}

function filterClasses() {
  const searchTerm = (search.value || '').toLowerCase();
  filteredClasses.value = (archivedClasses.value || []).filter(classItem => {
    if (yearFilter.value && classItem.yearLevel !== yearFilter.value) return false;
    if (sectionFilter.value && classItem.section !== sectionFilter.value) return false;
    if (majorFilter.value && classItem.major !== majorFilter.value) return false;

    if (!searchTerm) return true;
    const className = getClassName(classItem).toLowerCase();
    const subjectName = getSubjectName(classItem).toLowerCase();
    const schedule = getSchedule(classItem).toLowerCase();
    return className.includes(searchTerm) || subjectName.includes(searchTerm) || schedule.includes(searchTerm);
  });
}

// UnifiedTable configuration and handlers
const tableColumns = [
  { key: 'className', label: 'Class', class: '' },
  { key: 'subjectName', label: 'SSP Subject', class: '' },
  { key: 'schedule', label: 'Schedule', class: '' },
  { key: 'actions', label: 'Actions', class: 'text-right' }
]

const sortableColumns = [
  { value: 'yearLevel', label: 'Year Level' },
  { value: 'section', label: 'Section' },
  { value: 'major', label: 'Major' }
]

function handleSearch(q) {
  search.value = q
  filterClasses()
}
function handleSort() {}
function handlePageChange() {}

function getClassName(classItem) {
  return `${classItem.yearLevel} Year - ${classItem.section} (${classItem.major})`;
}

function getSubjectName(classItem) {
  if (!classItem.sspSubject) return 'Not assigned';
  
  const hours = classItem.hours || classItem.sspSubject?.hours || 1;
  return `${classItem.sspSubject.sspCode || ''} - ${classItem.sspSubject.name || ''} (${hours} hr${hours > 1 ? 's' : ''})`;
}

function getSchedule(classItem) {
  return `${classItem.daySchedule || ''} ${classItem.timeSchedule || ''} ${classItem.room ? `- Room ${classItem.room}` : ''}`.trim() || 'No schedule';
}

function restoreClass(classItem) {
  selectedClass.value = classItem;
  showRestoreModal.value = true;
}

function closeRestoreModal() {
  showRestoreModal.value = false;
  selectedClass.value = null;
  restoring.value = false;
}

async function confirmRestore() {
  if (!selectedClass.value) return;
  
  try {
    restoring.value = true;
    
    // Update status to active
    await api.put(`/classes/${selectedClass.value._id}`, {
      ...selectedClass.value,
      status: 'active'
    });
    
    await fetchArchivedClasses();
    notificationService.showSuccess(`${getClassName(selectedClass.value)} has been restored successfully`);
    closeRestoreModal();
  } catch (error) {
    console.error('Error restoring class:', error);
    notificationService.showError('Failed to restore class. Please try again later.');
    restoring.value = false;
  }
}
</script>