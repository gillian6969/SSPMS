<template>
  <component
    :is="as"
    class="bg-white rounded-xl border border-gray-300 shadow-sm transition-all"
    :class="computedClasses"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
  >
    <!-- Header -->
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-300">
      <slot name="header" />
    </div>

    <!-- Body -->
    <div class="p-7">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-300 bg-gray-50">
      <slot name="footer" />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  as: { type: String, default: 'div' },
  hover: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false },
  center: { type: Boolean, default: false },
})

const computedClasses = computed(() => {
  return [
    props.hover ? 'hover:shadow-sm' : '',
    props.clickable ? 'cursor-pointer' : '',
    props.center ? 'text-center' : '',
  ].filter(Boolean).join(' ')
})
</script>

<style scoped>
/* Keep shadows minimal; hover adds slight elevation */
</style>

