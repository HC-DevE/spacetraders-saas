import { useAuthStore } from '@/modules/auth/auth.store'
import { useQueryClient } from '@tanstack/vue-query'

export function useAuth() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()

  function logout() {
    auth.endSession('logout')
    queryClient.clear()
  }

  return {
    logout,
  }
}
