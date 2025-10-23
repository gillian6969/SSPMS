<template>
  <!-- Mobile Overlay -->
  <div 
    v-if="!sidebarCollapsed && isMobile" 
    class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
    @click="emit('toggle-sidebar')"
  ></div>
  
  <div 
    class="bg-gradient-to-b from-green-800 to-green-900 fixed h-full overflow-y-auto transition-all duration-500 ease-in-out z-30"
    :class="[
      sidebarCollapsed ? 'w-14 sm:w-16 lg:w-20 xl:w-24' : 'w-60 sm:w-64 lg:w-72 xl:w-80',
      isMobile ? (sidebarCollapsed ? 'w-16' : 'w-72') : '',
      'rounded-r-2xl lg:rounded-r-2xl shadow-2xl'
    ]"
    style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);"
  >
    <!-- Logo and title -->
    <div class="px-2 sm:px-3 lg:px-4 xl:px-6 py-4 sm:py-6 lg:py-8 border-b border-green-700/30">
      <div class="flex items-center transition-all duration-500 ease-in-out" :class="sidebarCollapsed ? 'justify-center' : 'space-x-2 sm:space-x-3 lg:space-x-4 xl:space-x-6'">
        <div class="flex-shrink-0">
          <!-- Clean white background for logo -->
          <div class="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-1.5 sm:p-2 lg:p-3 shadow-lg">
            <img 
              src="/src/assets/18.png" 
              alt="PHINMA Araullo University" 
              :class="[
                sidebarCollapsed ? 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8' : 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12'
              ]"
              class="object-contain rounded-lg"
            />
          </div>
        </div>
        <div v-if="!sidebarCollapsed" class="flex-1 transition-all duration-500 ease-in-out min-w-0">
          <h1 class="text-sm sm:text-base lg:text-lg xl:text-2xl font-bold text-white tracking-wide truncate">SSCMS</h1>
          <p class="text-xs sm:text-sm text-green-200 font-medium truncate">{{ userType }} Portal</p>
        </div>
      </div>
    </div>
    
    <!-- Navigation -->
    <nav class="px-1.5 sm:px-2 lg:px-3 xl:px-4 py-3 sm:py-4 lg:py-6">
      <div class="space-y-0.5 sm:space-y-1 lg:space-y-2">
        <template v-for="item in navigationItems" :key="item.label">
          <!-- Single Link -->
          <router-link 
            v-if="!item.children"
            :to="item.path" 
            class="flex items-center px-1.5 sm:px-2 lg:px-3 xl:px-4 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base font-medium transition-all duration-300 ease-in-out group relative touch-manipulation"
            :class="[
              sidebarCollapsed ? 'rounded-lg sm:rounded-xl lg:rounded-2xl justify-center' : 'rounded-md sm:rounded-lg lg:rounded-xl',
              isActive(item.path) ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50 hover:text-white'
            ]"
            exact-active-class="bg-green-700 text-white"
            :title="sidebarCollapsed ? item.label : ''"
          >
            
            <!-- Icon -->
            <component 
              :is="getIconComponent(item.icon)" 
              class="transition-all duration-300 flex-shrink-0"
              :class="[
                sidebarCollapsed ? 'w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7' : 'w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-6 xl:h-6 mr-1.5 sm:mr-2 lg:mr-3 xl:mr-4'
              ]"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              stroke-width="1.5"
            />

            <!-- Collapsed badge dot -->
            <span 
              v-if="sidebarCollapsed && item.label === 'Notifications' && unreadCount > 0"
              class="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 lg:top-2 lg:right-2 xl:top-2 xl:right-6 h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-red-500"
            ></span>
            
            <span v-if="!sidebarCollapsed" class="font-medium transition-all duration-500 ease-in-out flex items-center w-full min-w-0">
              <span class="truncate">{{ item.label }}</span>
              <span class="ml-auto flex-shrink-0"></span>
              <span 
                v-if="item.label === 'Notifications' && unreadCount > 0"
                class="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs px-1 sm:px-1.5 lg:px-2 py-0.5 min-w-[1rem] sm:min-w-[1.25rem] ml-1 sm:ml-2 flex-shrink-0"
              >
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>
            </span>
          </router-link>
          
          <!-- Dropdown Section -->
          <div v-else class="relative">
            <button 
              @click="toggleSection(item.key)" 
              class="w-full flex items-center justify-between px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-left text-sm sm:text-base font-medium transition-all duration-300 group touch-manipulation"
              :class="[
                sidebarCollapsed ? 'rounded-xl sm:rounded-2xl justify-center' : 'rounded-lg sm:rounded-xl',
                isSectionActive(item.key) ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50 hover:text-white'
              ]"
              :title="sidebarCollapsed ? item.label : ''"
            >
              <div class="flex items-center min-w-0 flex-1">
                
                <!-- Icon -->
                <component 
                  :is="getIconComponent(item.icon)" 
                  class="transition-all duration-300 flex-shrink-0"
                  :class="[
                    sidebarCollapsed ? 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7' : 'w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 mr-2 sm:mr-3 lg:mr-4'
                  ]"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  stroke-width="1.5"
                />
                
                <span v-if="!sidebarCollapsed" class="font-medium transition-all duration-500 ease-in-out truncate">{{ item.label }}</span>
                
                <svg 
                  v-if="!sidebarCollapsed" 
                  class="ml-auto w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 flex-shrink-0" 
                  :class="openSections[item.key] ? 'rotate-180' : ''"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </button>
            
            <div v-if="(openSections[item.key] || sidebarCollapsed) && !sidebarCollapsed" class="ml-4 sm:ml-6 lg:ml-8 mt-1 sm:mt-2 space-y-1 sm:space-y-2 transition-all duration-300">
              <router-link 
                v-for="child in item.children"
                :key="child.label"
                :to="child.path" 
                class="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-normal transition-all duration-300 touch-manipulation"
                :class="isActive(child.path) ? 'bg-green-700 text-white' : 'text-green-200 hover:bg-green-700/50 hover:text-white'"
              >
                {{ child.label }}
              </router-link>
            </div>
          </div>
        </template>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import * as HeroIcons from '@heroicons/vue/24/outline';
import { notificationApiService } from '../../services/notificationApiService'

const props = defineProps({
  userType: {
    type: String,
    required: true,
  },
  navigationItems: {
    type: Array,
    required: true,
  },
  sidebarCollapsed: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['toggle-sidebar']);

const route = useRoute();

const openSections = ref({});

// Mobile detection
const isMobile = ref(false);

// Unread notifications count for sidebar badge
const unreadCount = ref(0)
let unreadIntervalId = null

async function fetchUnreadCount() {
  try {
    const count = await notificationApiService.getUnreadCount()
    unreadCount.value = Number(count) || 0
  } catch (_) {
    // Fallback: try fetching notifications and compute unread locally
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const unread = Array.isArray(data) ? data.filter(n => !n.read).length : 0
        unreadCount.value = unread
      }
    } catch {}
  }
}

// Function to get icon component from string name
function getIconComponent(iconName) {
  return HeroIcons[iconName] || HeroIcons.QuestionMarkCircleIcon;
}

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024; // lg breakpoint
};

// Initialize openSections based on navigationItems
onMounted(() => {
  // Check mobile on mount
  checkMobile();
  
  // Listen for resize events
  window.addEventListener('resize', checkMobile);
  
  props.navigationItems.forEach(item => {
    if (item.children) {
      openSections.value[item.key] = false;
    }
  });
  checkAndExpandSection();
  // Load unread count and poll periodically
  fetchUnreadCount().catch(() => {})
  unreadIntervalId = setInterval(fetchUnreadCount, 60000)
  // Listen for notification read events to update count in real-time
  window.addEventListener('notification:read', fetchUnreadCount)
});

// Watch for route changes to automatically open relevant sections
watch(
  () => route.path,
  () => {
    checkAndExpandSection();
  }
);

function isActive(path) {
  // Special handling for dashboard routes - only match exact dashboard paths
  if (path === '/admin/dashboard' || path === '/adviser/dashboard' || path === '/student/dashboard') {
    return route.path === path;
  }
  return route.path === path || route.path.startsWith(`${path}/`);
}

function isSectionActive(sectionKey) {
  const section = props.navigationItems.find(item => item.key === sectionKey);
  if (!section || !section.children) return false;
  return section.children.some(child => isActive(child.path));
}

function toggleSection(sectionKey) {
  if (props.sidebarCollapsed) {
    // In collapsed mode, emit event to uncollapse sidebar and then open section
    emit('toggle-sidebar');
    // Wait for sidebar to expand, then open the section
    setTimeout(() => {
      const wasOpen = openSections.value[sectionKey];
      // Close all sections first
      Object.keys(openSections.value).forEach(key => {
        openSections.value[key] = false;
      });
      // Open the clicked section
      openSections.value[sectionKey] = !wasOpen;
    }, 300); // Wait for sidebar animation to complete
    return;
  }
  
  const wasOpen = openSections.value[sectionKey];
  
  // Close all sections first
  Object.keys(openSections.value).forEach(key => {
    openSections.value[key] = false;
  });
  
  // Toggle the clicked section (if it was closed, open it; if it was open, keep it closed)
  openSections.value[sectionKey] = !wasOpen;
}

function checkAndExpandSection() {
  props.navigationItems.forEach(item => {
    if (item.children) {
      openSections.value[item.key] = item.children.some(child => isActive(child.path));
    }
  });
}

onUnmounted(() => {
  if (unreadIntervalId) {
    clearInterval(unreadIntervalId)
    unreadIntervalId = null
  }
  window.removeEventListener('notification:read', fetchUnreadCount)
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Custom scrollbar for sidebar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  /* Ensure touch targets are at least 44px */
  .touch-manipulation {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Improve text readability on small screens */
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
}

/* Tablet optimizations */
@media (min-width: 640px) and (max-width: 1024px) {
  .touch-manipulation {
    min-height: 40px;
  }
}

/* Prevent text selection on mobile for better UX */
@media (max-width: 1024px) {
  .touch-manipulation {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
}

/* Smooth transitions for mobile */
@media (max-width: 1024px) {
  .transition-all {
    transition-duration: 200ms;
  }
}
</style>