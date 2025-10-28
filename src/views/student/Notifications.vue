<template>
  <div class="student-notifications min-h-screen p-6" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Notifications</h1>
            <p class="text-gray-500 mt-1 font-normal">Stay updated with important messages and announcements</p>
          </div>
          <button 
            @click="refreshNotifications"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            :disabled="loading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" :class="{'animate-spin': loading}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ loading ? 'Refreshing...' : 'Refresh' }}</span>
          </button>
        </div>
      </div>

      <!-- Notifications Content -->
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span class="text-sm text-gray-600">Loading notifications...</span>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!notifications.length" class="text-center py-12">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-800 mb-2">No Notifications</h3>
          <p class="text-gray-500 max-w-md mx-auto">You don't have any notifications at the moment. Check back later for updates from your advisers.</p>
        </div>
      
      <div v-else class="space-y-4">
        <!-- Filter Options -->
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <!-- Type Filter -->
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-700">Filter:</span>
            <button 
              @click="activeFilter = 'all'" 
              class="px-3 py-1 rounded-full text-sm" 
              :class="activeFilter === 'all' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'"
            >
              All
            </button>
            <button 
              @click="activeFilter = 'class'" 
              class="px-3 py-1 rounded-full text-sm" 
              :class="activeFilter === 'class' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'"
            >
              Class
            </button>
            <button 
              @click="activeFilter = 'mm'" 
              class="px-3 py-1 rounded-full text-sm" 
              :class="activeFilter === 'mm' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'"
            >
              M&M
            </button>
            <button 
              @click="activeFilter = 'odyssey'" 
              class="px-3 py-1 rounded-full text-sm" 
              :class="activeFilter === 'odyssey' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'"
            >
              Odyssey Plan
            </button>
            <button 
              @click="activeFilter = 'consultation'" 
              class="px-3 py-1 rounded-full text-sm" 
              :class="activeFilter === 'consultation' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'"
            >
              Consultation
            </button>
          </div>
          
          <!-- Date Filter -->
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-700">Date:</span>
            <select v-model="dateFilter" @change="applyFilters" class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
        
        <!-- Custom Date Range (shown when custom is selected) -->
        <div v-if="dateFilter === 'custom'" class="flex items-center space-x-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">From:</label>
            <input v-model="startDate" type="date" class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">To:</label>
            <input v-model="endDate" type="date" class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <button @click="applyFilters" class="px-4 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Apply
          </button>
        </div>
        
        <!-- Notifications List -->
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div 
            v-for="notification in filteredNotifications" 
            :key="notification._id"
            :class="[
              'p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors relative',
              notification.read ? 'bg-white' : 'bg-blue-50'
            ]"
          >
            <div class="flex">
              <!-- Icon based on notification type -->
              <div class="mr-4">
                <div 
                  :class="[
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    notification.type === 'warning' ? 'bg-amber-100 text-amber-500' :
                    notification.type === 'success' ? 'bg-green-100 text-green-500' :
                    notification.type === 'error' ? 'bg-red-100 text-red-500' :
                    'bg-blue-100 text-blue-500'
                  ]"
                >
                  <svg v-if="notification.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <svg v-else-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else-if="notification.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <!-- Notification Content -->
              <div class="flex-1">
                <div class="flex justify-between items-start mb-1">
                  <h3 class="font-medium text-gray-900">{{ notification.title }}</h3>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">{{ formatDate(notification.createdAt) }}</span>
                    <button 
                      v-if="!notification.read" 
                      @click="markAsRead(notification._id)"
                      class="p-1 text-gray-400 hover:text-gray-600"
                      title="Mark as read"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p class="text-sm text-gray-700 mb-1">{{ notification.message }}</p>
                <div v-if="notification.link" class="mt-1">
                  <router-link :to="notification.link" class="text-primary text-sm hover:underline">View details →</router-link>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  <span v-if="notification.sender">From: {{ notification.senderName || 'Adviser' }}</span>
                </div>
              </div>
            </div>
            
            <!-- Unread indicator dot -->
            <div v-if="!notification.read" class="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary"></div>
          </div>
        </div>
        
        <!-- Pagination Footer -->
        <div v-if="totalPages > 1" class="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="First Page"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M20 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span class="px-3 py-1 text-sm text-gray-600">
              {{ currentPage }}
            </span>
            
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
              class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Last Page"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { notificationService } from '../../services/notificationService';
import { useAuthStore } from '../../stores/authStore';
import { notificationApiService } from '../../services/notificationApiService';
import api from '../../services/api';

// State variables
const loading = ref(true);
const notifications = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const activeFilter = ref('all'); // 'all', 'class', 'mm', 'odyssey', 'consultation'
const dateFilter = ref('all'); // 'all', 'today', 'thisWeek', 'lastWeek', 'custom'
const startDate = ref('');
const endDate = ref('');
const authStore = useAuthStore();
const pageSize = 10; // Number of notifications per page

// Computed properties
const filteredNotifications = computed(() => {
  let filtered = [];
  
  if (activeFilter.value === 'class') {
    // Filter for class-related notifications (session completions, promotions, etc.)
    filtered = notifications.value.filter(notification => 
      notification.title?.toLowerCase().includes('session') ||
      notification.title?.toLowerCase().includes('promotion') ||
      notification.title?.toLowerCase().includes('semester') ||
      notification.title?.toLowerCase().includes('year level') ||
      notification.message?.toLowerCase().includes('session') ||
      notification.message?.toLowerCase().includes('class')
    );
  } else if (activeFilter.value === 'mm') {
    // Filter for M&M related notifications  
    filtered = notifications.value.filter(notification =>
      notification.title?.toLowerCase().includes('m&m') ||
      notification.title?.toLowerCase().includes('exam') ||
      notification.title?.toLowerCase().includes('p1') ||
      notification.title?.toLowerCase().includes('p2') ||
      notification.title?.toLowerCase().includes('p3') ||
      notification.message?.toLowerCase().includes('exam') ||
      notification.message?.toLowerCase().includes('submission')
    );
  } else if (activeFilter.value === 'odyssey') {
    // Filter for Odyssey Plan related notifications
    filtered = notifications.value.filter(notification =>
      notification.title?.toLowerCase().includes('odyssey') ||
      notification.title?.toLowerCase().includes('plan') ||
      notification.message?.toLowerCase().includes('odyssey') ||
      notification.link?.includes('odyssey')
    );
  } else if (activeFilter.value === 'consultation') {
    // Filter for consultation related notifications
    filtered = notifications.value.filter(notification =>
      notification.title?.toLowerCase().includes('consultation') ||
      notification.title?.toLowerCase().includes('appointment') ||
      notification.title?.toLowerCase().includes('booking') ||
      notification.message?.toLowerCase().includes('consultation') ||
      notification.link?.includes('consultation')
    );
  } else {
    // Show all notifications
    filtered = notifications.value;
  }
  
  return filtered;
});

const hasUnread = computed(() => {
  return notifications.value.some(notification => !notification.read);
});

// Lifecycle hooks
onMounted(async () => {
  // Only fetch notifications and set up polling if user is authenticated
  if (authStore.isAuthenticated && authStore.user) {
    await fetchNotifications();
    
    // Set up polling for new notifications every minute
    const pollingInterval = setInterval(async () => {
      await fetchNotifications();
    }, 60000); // 60 seconds
    
    // Clean up interval on component unmount
    onUnmounted(() => {
      clearInterval(pollingInterval);
    });
  } else {
    console.log('User not authenticated, skipping notification setup');
    loading.value = false;
  }
});

// Functions
async function fetchNotifications() {
  try {
    // Check if user is authenticated before making API calls
    if (!authStore.isAuthenticated || !authStore.user) {
      console.log('User not authenticated, skipping notification fetch');
      notifications.value = [];
      loading.value = false;
      return;
    }
    
    loading.value = true;
    
    // Build query parameters for backend pagination and date filtering
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: pageSize,
      dateFilter: dateFilter.value
    });
    
    if (dateFilter.value === 'custom' && startDate.value && endDate.value) {
      params.append('startDate', startDate.value);
      params.append('endDate', endDate.value);
    }
    
    // Call API directly with parameters
    const response = await api.get(`/notifications?${params}`);
    
    if (response.data) {
      notifications.value = (response.data.data || []).map(notification => ({
        ...notification,
        // Format dates if needed
        createdAt: new Date(notification.createdAt),
      }));
      
      // Update pagination from backend response
      if (response.data.pagination) {
        totalPages.value = response.data.pagination.totalPages || 1;
        currentPage.value = response.data.pagination.currentPage || 1;
      }
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    // Only show error toast if user is authenticated (to avoid showing on login/register pages)
    if (authStore.isAuthenticated) {
      notificationService.showError('Failed to load notifications');
    }
    notifications.value = [];
  } finally {
    loading.value = false;
  }
}

async function markAsRead(notificationId) {
  try {
    // Call API to mark as read
    await notificationApiService.markAsRead(notificationId);
    
    // Update local state
    const notification = notifications.value.find(n => n._id === notificationId);
    if (notification) {
      notification.read = true;
    }
    
    notificationService.showSuccess('Notification marked as read');
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    notificationService.showError('Failed to update notification status');
  }
}

// markAllAsRead function removed

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchNotifications();
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchNotifications();
  }
}

function goToPage(page) {
  currentPage.value = page;
  fetchNotifications();
}

async function applyFilters() {
  currentPage.value = 1;
  await fetchNotifications();
}

async function refreshNotifications() {
  currentPage.value = 1;
  await fetchNotifications();
}

function formatDate(date) {
  if (!date) return '';
  
  const now = new Date();
  const diff = now - date;
  const day = 24 * 60 * 60 * 1000;
  
  // Format based on how recent the notification is
  if (diff < 60 * 1000) {
    return 'Just now';
  } else if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < day) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    // Otherwise, return an actual date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
</script>

<style scoped>
.bg-primary {
  background-color: #3B82F6;
}
.bg-primary-light {
  background-color: #EFF6FF;
}
.text-primary {
  color: #3B82F6;
}
.hover\:bg-primary-dark:hover {
  background-color: #2563EB;
}

/* Animation for unread indicator */
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

.student-notifications {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
}

/* Responsive breakpoints */
@media (max-width: 1280px) {
  .student-notifications {
    max-width: 100%;
    padding: 0 0.75rem;
  }
}

@media (max-width: 768px) {
  .student-notifications {
    padding: 0 0.5rem;
  }
  
  .student-notifications .space-y-8 > * + * {
    margin-top: 1rem;
  }
  
  .student-notifications .p-6 {
    padding: 1rem;
  }
  
  .student-notifications .text-2xl {
    font-size: 1.5rem;
  }
  
  .student-notifications .flex.items-center.justify-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .student-notifications {
    padding: 0 0.25rem;
  }
  
  .student-notifications .p-6 {
    padding: 0.75rem;
  }
  
  .student-notifications .text-2xl {
    font-size: 1.25rem;
  }
  
  .student-notifications .space-x-2 {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .student-notifications .px-3 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style> 