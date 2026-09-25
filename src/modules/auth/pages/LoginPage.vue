<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'

import { ApiError } from '@/shared/api/api-error'
import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { useLogin } from '../composables/use-login'
import { routeNames } from '@/app/router/route-names'
import { SPACE_TRADERS_PORTAL_URL } from '@/config/space-traders'

const router = useRouter()

const tokenSchema = z.string().trim().min(1, 'Enter your agent token.')

const token = ref('')
const showToken = ref(false)
const fieldError = ref('')

const { isPending, error, login, reset } = useLogin()

const isAuthenticationError = computed(
  () => error.value instanceof ApiError && error.value.kind === 'authentication',
)

const tokenIsInvalid = computed(() => Boolean(fieldError.value) || isAuthenticationError.value)

const tokenDescription = computed(() => {
  const ids = ['token-help']

  if (fieldError.value) {
    ids.push('token-field-error')
  }

  if (isAuthenticationError.value) {
    ids.push('login-error')
  }

  return ids.join(' ')
})

watch(token, () => {
  fieldError.value = ''

  if (!isPending.value) reset()
})

async function submit() {
  if (isPending.value) return

  fieldError.value = ''
  reset()

  const result = tokenSchema.safeParse(token.value)

  if (!result.success) {
    fieldError.value = result.error.issues[0]?.message ?? 'Enter a valid token.'
    await nextTick()
    document.getElementById('agent-token')?.focus()
    return
  }

  try {
    await login(result.data)
  } catch {
    // The mutation exposes the error to the template.
    return
  }

  token.value = ''
  showToken.value = false

  await router.replace({ name: routeNames.agentOverview })
}
</script>

<template>
  <main class="grid min-h-screen lg:grid-cols-2">
    <section
      class="flex flex-col justify-between bg-primary px-6 py-10 text-primary-foreground sm:px-10 lg:p-14"
      aria-labelledby="product-title"
    >
      <p class="text-lg font-semibold tracking-tight">SpaceTraders</p>

      <div class="max-w-lg py-10 lg:py-20">
        <p class="mb-4 text-sm font-medium text-primary-foreground/80">
          Your space operations, in one place
        </p>

        <h1
          id="product-title"
          class="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
        >
          Take command of your next expedition.
        </h1>

        <p class="mt-6 text-base leading-7 text-primary-foreground/85">
          Connect your agent to access your operations across the SpaceTraders universe.
        </p>
      </div>

      <p class="text-sm text-primary-foreground/75">Powered by the SpaceTraders API</p>
    </section>

    <section
      class="flex items-center justify-center px-6 py-12 sm:px-10"
      aria-labelledby="login-title"
    >
      <div class="w-full max-w-md space-y-7">
        <div>
          <h2 id="login-title" class="text-2xl font-semibold tracking-tight">Connect your agent</h2>

          <p class="mt-2 leading-6 text-muted-foreground">
            Use an agent token from your SpaceTraders account.
          </p>
        </div>

        <form class="space-y-5" novalidate :aria-busy="isPending" @submit.prevent="submit">
          <div class="space-y-2">
            <Label for="agent-token">Agent token</Label>

            <div class="flex items-center gap-2">
              <Input
                id="agent-token"
                v-model="token"
                name="agent-token"
                :type="showToken ? 'text' : 'password'"
                autocomplete="off"
                autocapitalize="none"
                :spellcheck="false"
                :readonly="isPending"
                :aria-invalid="tokenIsInvalid"
                :aria-describedby="tokenDescription"
                required
                placeholder="Paste your agent token"
                class="min-w-0 flex-1"
              />

              <AppButton
                variant="outline"
                :aria-pressed="showToken"
                aria-controls="agent-token"
                :aria-label="showToken ? 'Hide agent token' : 'Show agent token'"
                @click="showToken = !showToken"
              >
                <EyeOff v-if="showToken" class="size-4" aria-hidden="true" />
                <Eye v-else class="size-4" aria-hidden="true" />
                {{ showToken ? 'Hide' : 'Show' }}
              </AppButton>
            </div>

            <p id="token-help" class="text-sm text-muted-foreground">
              Paste the token itself, without the Bearer prefix.
            </p>

            <p
              v-if="fieldError"
              id="token-field-error"
              role="alert"
              class="text-sm text-destructive"
            >
              {{ fieldError }}
            </p>
          </div>

          <FeedbackState
            v-if="error"
            id="login-error"
            kind="error"
            title="Unable to connect"
            :description="error.message"
          />

          <AppButton
            type="submit"
            :loading="isPending"
            loading-label="Verifying your token…"
            class="w-full"
          >
            Connect
          </AppButton>

          <p v-if="isPending" role="status" class="sr-only">Verifying your agent token.</p>
        </form>

        <div class="space-y-3 border-t pt-5 text-sm text-muted-foreground">
          <p>
            Your token is saved in this browser so you can return without signing in again. Sign out
            to remove it.
          </p>

          <a
            :href="SPACE_TRADERS_PORTAL_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block font-medium text-primary underline underline-offset-4"
          >
            Open your SpaceTraders account
            <span class="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  </main>
</template>
