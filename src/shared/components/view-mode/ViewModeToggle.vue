<script setup lang="ts">
import { LayoutGrid, Table2 } from '@lucide/vue'

import AppButton from '@/shared/components/AppButton.vue'

import { type ViewMode, viewModes } from './view-mode'

const props = defineProps<{
  modelValue: ViewMode
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ViewMode]
}>()

function selectViewMode(viewMode: ViewMode) {
  if (viewMode === props.modelValue) {
    return
  }

  emit('update:modelValue', viewMode)
}
</script>

<template>
  <div
    role="group"
    aria-label="View mode"
    class="inline-flex items-center border border-border bg-card p-1"
  >
    <AppButton
      variant="ghost"
      size="sm"
      :aria-pressed="modelValue === viewModes.table"
      aria-label="Show table view"
      :class="
        modelValue === viewModes.table
          ? 'bg-warning-subtle text-signal hover:bg-warning-subtle hover:text-signal'
          : 'text-muted-foreground'
      "
      @click="selectViewMode(viewModes.table)"
    >
      <Table2 class="size-4" aria-hidden="true" />

      <span>Table</span>
    </AppButton>

    <AppButton
      variant="ghost"
      size="sm"
      :aria-pressed="modelValue === viewModes.cards"
      aria-label="Show cards view"
      :class="
        modelValue === viewModes.cards
          ? 'bg-warning-subtle text-signal hover:bg-warning-subtle hover:text-signal'
          : 'text-muted-foreground'
      "
      @click="selectViewMode(viewModes.cards)"
    >
      <LayoutGrid class="size-4" aria-hidden="true" />

      <span>Cards</span>
    </AppButton>
  </div>
</template>
