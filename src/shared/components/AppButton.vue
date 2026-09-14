<script setup lang="ts">
import { computed } from 'vue'

import { Button } from '@/shared/components/ui/button'

defineOptions({
  inheritAttrs: false,
})

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type Size = 'default' | 'sm' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    loadingLabel?: string
  }>(),
  {
    variant: 'primary',
    size: 'default',
    type: 'button',
    disabled: false,
    loading: false,
    loadingLabel: 'Loading…',
  },
)

const variants = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  destructive: 'destructive',
} as const

const buttonVariant = computed(() => variants[props.variant])
</script>

<template>
  <Button
    v-bind="$attrs"
    :variant="buttonVariant"
    :size="size"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    class="cursor-pointer disabled:cursor-not-allowed"
  >
    <svg
      v-if="loading"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      class="size-4 shrink-0 animate-spin motion-reduce:animate-none"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" class="opacity-25" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>

    <span v-if="loading">{{ loadingLabel }}</span>
    <slot v-else />
  </Button>
</template>
