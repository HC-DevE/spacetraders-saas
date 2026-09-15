// import { useQueryClient } from '@tanstack/vue-query'

// import { useAuthStore } from '@/modules/auth/auth.store'

// export function useAuth() {
//   const auth = useAuthStore()
//   const queryClient = useQueryClient()

//   function logout() {
//     auth.clearToken()
//     queryClient.getQueryCache().clear()
//   }

//   return {
//     logout,
//   }
// }

import { useQueryClient } from '@tanstack/vue-query'

import { useAuthStore } from '../auth.store'

export function useAuth() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()

  function logout() {
    try {
      auth.clearToken()
    } finally {
      queryClient.clear()
    }
  }

  return { logout }
}
