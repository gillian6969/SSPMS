<template>
    <div class="fixed inset-0 z-40 flex justify-center items-center pointer-events-none">
        <!-- Backdrop -->
        <transition name="backdrop">
            <div
                v-if="modelValue"
                class="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                @click="onClose"
            />
        </transition>

        <!-- Panel -->
        <transition name="panel">
            <div
                v-if="modelValue"
                class="relative bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-3xl mx-auto px-8 py-6 z-50 max-h-[90vh] overflow-y-auto pointer-events-auto"
                role="dialog"
            >
			<!-- Header -->
            <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-3 -mx-8 -mt-6 px-8 pt-4">
                <h2 class="text-xl font-semibold text-gray-900 tracking-tight">{{ title }}</h2>
                <button @click="onClose" class="text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors duration-150 shadow-sm" aria-label="Close dialog">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="space-y-4">
				<slot />
			</div>

			<!-- Footer -->
			<div v-if="$slots.footer" class="flex justify-end mt-6 pt-4 border-t border-gray-200">
				<slot name="footer" />
			</div>
            </div>
        </transition>
	</div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
	modelValue: { type: Boolean, required: true },
	title: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'close'])

function onClose() {
	emit('update:modelValue', false)
	emit('close')
}
</script>

<style scoped>
/* Backdrop fade */
.backdrop-enter-from { opacity: 0; }
.backdrop-enter-active { transition: opacity 220ms ease-out; }
.backdrop-leave-to { opacity: 0; }
.backdrop-leave-active { transition: opacity 260ms ease-in; }

/* Panel scale/slide */
.panel-enter-from { opacity: 0; transform: translateY(8px) scale(0.98); }
.panel-enter-active { transition: opacity 240ms cubic-bezier(.2,.8,.2,1), transform 240ms cubic-bezier(.2,.8,.2,1); }
.panel-leave-to { opacity: 0; transform: translateY(8px) scale(0.98); }
.panel-leave-active { transition: opacity 260ms cubic-bezier(.4,0,.2,1), transform 260ms cubic-bezier(.4,0,.2,1); }
</style>


