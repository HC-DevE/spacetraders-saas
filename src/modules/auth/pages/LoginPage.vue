<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { useAuthStore } from '../auth.store'
import { useLogin } from '../composables/use-login'

const router = useRouter()
const auth = useAuthStore()

const token = ref('')
const showToken = ref(false)

const { isPending, fieldError, error, login, cancelLogin, clearErrors } = useLogin()

const sessionNotice = computed(() => {
  if (auth.endReason === 'token-rejected') {
    return 'Your previous token is no longer accepted. Connect again with a valid agent token.'
  }

  if (auth.endReason === 'storage-error') {
    return 'You are signed out of this page, but the saved token could not be removed. Clear this site’s stored data before reloading.'
  }

  return ''
})

const tokenIsInvalid = computed(
  () => Boolean(fieldError.value) || error.value?.kind === 'authentication',
)

const tokenDescription = computed(() => {
  const ids = ['token-help']

  if (fieldError.value) {
    ids.push('token-field-error')
  }

  if (error.value?.kind === 'authentication') {
    ids.push('login-error')
  }

  return ids.join(' ')
})

watch(token, clearErrors)

onBeforeRouteLeave(() => {
  cancelLogin()
})

async function submit() {
  const connected = await login(token.value)

  if (!connected) {
    if (fieldError.value) {
      await nextTick()
      document.getElementById('agent-token')?.focus()
    }

    return
  }

  token.value = ''
  showToken.value = false

  await router.replace({ name: 'agent-overview' })
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

        <div
          v-if="sessionNotice"
          role="alert"
          class="rounded-lg border border-warning/30 bg-warning-subtle p-4 text-sm text-warning"
        >
          {{ sessionNotice }}
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
                aria-label="Show agent token"
                @click="showToken = !showToken"
              >
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
            Your token is saved in this tab’s session storage so you can reload the page. Sign out
            to remove it.
          </p>

          <a
            href="https://my.spacetraders.io/login"
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
