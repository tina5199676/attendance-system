<script setup lang="ts">
import { computed } from 'vue'
import SegmentedControl, { type SegmentedOption } from '@/components/SegmentedControl.vue'
import { useThemeStore, type ThemePreference } from '@/stores/theme'

const theme = useThemeStore()

const options: SegmentedOption[] = [
  { value: 'light', label: '淺色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '系統' },
]

// SegmentedControl 的值是 string，這裡在型別上把它收窄回 ThemePreference
const preference = computed<string>({
  get: () => theme.preference,
  set: (value) => theme.setPreference(value as ThemePreference),
})
</script>

<template>
  <SegmentedControl v-model="preference" :options="options" label="主題" class="theme-toggle" />
</template>

<style scoped>
.theme-toggle {
  width: 100%;
}

.theme-toggle :deep(.segmented-control__option) {
  flex: 1;
  padding-inline: 6px;
}
</style>
