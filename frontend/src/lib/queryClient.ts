import { QueryClient } from '@tanstack/react-query'

const staleTimeMs = import.meta.env.PROD ? 30_000 : 5_000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: staleTimeMs,
      retry: 1,
    },
  },
})

/** Prefijo para invalidar todas las variantes (rol / org). */
export const QK_ADMIN_TORNEOS_DIV = ['admin', 'torneos-div'] as const
