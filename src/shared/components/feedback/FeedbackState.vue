<script setup lang="ts">
import { Skeleton } from '@/shared/components/ui/skeleton'

withDefaults(
  defineProps<{
    kind: 'loading' | 'error' | 'empty'
    title: string
    description?: string
  }>(),
  {
    description: '',
  },
)
</script>

<template>
  <div
    :role="kind === 'error' ? 'alert' : 'status'"
    class="rounded-xl border p-6"
    :class="kind === 'error' ? 'border-destructive/30 bg-danger-subtle' : 'bg-card'"
  >
    <p class="font-semibold" :class="kind === 'error' ? 'text-destructive' : 'text-foreground'">
      {{ title }}
    </p>

    <p v-if="description" class="mt-2 text-sm text-muted-foreground">
      {{ description }}
    </p>

    <div v-if="kind === 'loading'" aria-hidden="true" class="mt-5 space-y-3">
      <Skeleton class="h-4 w-2/3 motion-reduce:animate-none" />
      <Skeleton class="h-4 w-1/2 motion-reduce:animate-none" />
      <Skeleton class="h-20 w-full motion-reduce:animate-none" />
    </div>

    <div v-if="$slots.default" class="mt-4 flex flex-wrap gap-3">
      <slot />
    </div>
  </div>
</template>
