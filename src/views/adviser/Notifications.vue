<template>
  <div class="min-h-screen p-6" style="background-color: #F6FBF9;">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-normal text-gray-800">Notifications</h1>
            <p class="text-gray-500 mt-1 font-normal">Stay updated with consultation schedules and system messages</p>
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
        
        <!-- Filter Options - Always Show -->
        <div v-else class="space-y-4">
          <!-- Filter Options -->
          <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
            <!-- Type Filter -->
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-700">Filter:</span>
              <button @click="activeFilter = 'all'" class="px-3 py-1 rounded-full text-sm" :class="activeFilter === 'all' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'">All</button>
              <button @click="activeFilter = 'consultation'" class="px-3 py-1 rounded-full text-sm" :class="activeFilter === 'consultation' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'">Consultation</button>
              <button @click="activeFilter = 'system'" class="px-3 py-1 rounded-full text-sm" :class="activeFilter === 'system' ? 'bg-primary-light text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'">System</button>
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
          <div v-if="notifications.length" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div 
              v-for="notification in notifications" 
              :key="notification._id"
              :class="[
                'p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors relative cursor-pointer',
                notification.read ? 'bg-white' : 'bg-blue-50'
              ]"
              @click="openNotification(notification)"
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
                    </div>
                  </div>
                  <p class="text-sm text-gray-700 mb-1">{{ notification.message }}</p>
                  <div v-if="notification.link" class="mt-1">
                    <span class="text-primary text-sm hover:underline">View details →</span>
                  </div>
                </div>
              </div>

              <!-- Unread indicator dot -->
              <div v-if="!notification.read" class="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary"></div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else class="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">No Notifications</h3>
            <p class="text-gray-500 max-w-md mx-auto">You don't have any notifications at the moment. Check back later for updates.</p>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div class="flex items-center text-sm text-gray-700">
              <span>
                Showing {{ (pagination.currentPage - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.currentPage * pagination.limit, pagination.totalCount) }} of {{ pagination.totalCount }} notifications
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                @click="goToPage(1)"
                :disabled="pagination.currentPage === 1"
                class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="First Page"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                @click="goToPage(pagination.currentPage - 1)"
                :disabled="!pagination.hasPrevPage"
                class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span class="px-3 py-2 text-sm text-gray-700">
                Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
              </span>
              
              <button
                @click="goToPage(pagination.currentPage + 1)"
                :disabled="!pagination.hasNextPage"
                class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                @click="goToPage(pagination.totalPages)"
                :disabled="pagination.currentPage === pagination.totalPages"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../../services/api'
import { notificationService } from '../../services/notificationService'
import { useRouter } from 'vue-router'

const loading = ref(true)
const notifications = ref([])
const activeFilter = ref('all') // 'all' | 'consultation' | 'system'
const dateFilter = ref('all')
const startDate = ref('')
const endDate = ref('')
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10
})

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'consultation') {
    return notifications.value.filter(n =>
      (n.title || '').toLowerCase().includes('consultation') ||
      (n.message || '').toLowerCase().includes('consultation')
    )
  } else if (activeFilter.value === 'system') {
    return notifications.value.filter(n =>
      (n.title || '').toLowerCase().includes('system') ||
      (n.message || '').toLowerCase().includes('system')
    )
  }
  return notifications.value
})

const formatDate = (d) => {
  const date = new Date(d)
  return isNaN(date.getTime()) ? '' : date.toLocaleString()
}

const fetchNotifications = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: pagination.value.currentPage,
      limit: pagination.value.limit,
      dateFilter: dateFilter.value
    })
    
    if (dateFilter.value === 'custom' && startDate.value && endDate.value) {
      params.append('startDate', startDate.value)
      params.append('endDate', endDate.value)
    }
    
    const res = await api.get(`/notifications?${params}`)
    notifications.value = res.data?.data || []
    pagination.value = res.data?.pagination || pagination.value
  } catch (e) {
    notifications.value = []
  } finally {
    loading.value = false
  }
}

const refreshNotifications = async () => {
  pagination.value.currentPage = 1
  await fetchNotifications()
}

const applyFilters = async () => {
  pagination.value.currentPage = 1
  await fetchNotifications()
}

const goToPage = async (page) => {
  pagination.value.currentPage = page
  await fetchNotifications()
}

const markAsRead = async (id) => {
  try {
    await api.patch(`/notifications/${id}/read`)
    const n = notifications.value.find(x => x._id === id)
    if (n) n.read = true
    // Notify other UI (e.g., sidebar) to refresh unread count immediately
    window.dispatchEvent(new Event('notification:read'))
  } catch (e) {
    notificationService.showError('Failed to update notification')
  }
}

const router = useRouter()
const openNotification = async (n) => {
  // Mark as read first (but don't block navigation)
  if (!n.read && n._id) {
    try { await markAsRead(n._id) } catch {}
  }
  // For consultation-related notifications, always route to adviser's consultations page
  if (n.meta?.consultationId || /(consultation|reschedule)/i.test(`${n.title} ${n.message}`)) {
    try { router.push('/adviser/consultations') } catch {}
    return
  }
  // Else, navigate if link exists (supports absolute URLs to our app)
  if (n.link) {
    try {
      const url = new URL(n.link, window.location.origin)
      const path = url.origin === window.location.origin ? url.pathname + url.search + url.hash : n.link
      router.push(path)
    } catch {
      try { router.push(n.link) } catch {}
    }
  }
}

onMounted(async () => {
  await fetchNotifications()
  const interval = setInterval(fetchNotifications, 60000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
.bg-primary { background-color: #3B82F6; }
.bg-primary-light { background-color: #EFF6FF; }
.text-primary { color: #3B82F6; }
</style>


