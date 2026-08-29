<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

/**
 * Lightweight Select2-style searchable dropdown.
 * Usage:
 *   <SearchableSelect
 *     v-model="selectedUserId"
 *     :options="memberOptions"      // [{ value, label }]
 *     placeholder="Select member"
 *   />
 */
const props = defineProps({
    modelValue: { type: [String, Number, null], default: null },
    options: { type: Array, default: () => [] }, // [{ value, label }]
    placeholder: { type: String, default: 'Select...' },
    disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const search = ref('')
const wrapperRef = ref(null)
const searchInput = ref(null)

const selectedOption = computed(() =>
    props.options.find(o => o.value === props.modelValue) || null
)

const filteredOptions = computed(() => {
    if (!search.value.trim()) return props.options
    const q = search.value.toLowerCase()
    return props.options.filter(o => String(o.label).toLowerCase().includes(q))
})

const toggleOpen = async () => {
    if (props.disabled) return
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        search.value = ''
        await nextTick()
        searchInput.value?.focus()
    }
}

const selectOption = (opt) => {
    emit('update:modelValue', opt.value)
    emit('change', opt)
    isOpen.value = false
}

const clearSelection = (e) => {
    e.stopPropagation()
    emit('update:modelValue', null)
    emit('change', null)
}

const handleClickOutside = (e) => {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
        isOpen.value = false
    }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
    <div class="relative w-full max-w-sm" ref="wrapperRef">
        <div
            @click="toggleOpen"
            :class="[
                'border rounded px-3 py-2 w-full flex items-center justify-between bg-white select-none',
                disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'cursor-pointer',
                isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
            ]"
        >
            <span :class="selectedOption ? 'text-gray-800' : 'text-gray-400'" class="truncate">
                {{ selectedOption ? selectedOption.label : placeholder }}
            </span>
            <div class="flex items-center gap-1 shrink-0">
                <button
                    v-if="selectedOption && !disabled"
                    @click="clearSelection"
                    type="button"
                    class="text-gray-400 hover:text-gray-600 px-1"
                    title="Clear"
                >×</button>
                <svg class="w-4 h-4 text-gray-400" :class="{ 'rotate-180': isOpen }" style="transition: transform .15s"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>

        <div v-if="isOpen"
            class="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg overflow-hidden">
            <div class="p-2 border-b bg-gray-50">
                <input
                    ref="searchInput"
                    v-model="search"
                    type="text"
                    placeholder="Type to search..."
                    class="w-full px-2 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    @click.stop
                />
            </div>
            <ul class="max-h-56 overflow-y-auto text-sm">
                <li
                    v-for="opt in filteredOptions"
                    :key="opt.value"
                    @click="selectOption(opt)"
                    :class="[
                        'px-3 py-2 cursor-pointer hover:bg-blue-50',
                        opt.value === modelValue ? 'bg-blue-100 font-medium text-blue-700' : 'text-gray-700'
                    ]"
                >
                    {{ opt.label }}
                </li>
                <li v-if="filteredOptions.length === 0" class="px-3 py-2 text-gray-400 text-sm">
                    No results found
                </li>
            </ul>
        </div>
    </div>
</template>