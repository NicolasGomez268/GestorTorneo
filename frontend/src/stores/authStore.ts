import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'admin123'

interface AuthState {
  isAdmin: boolean
  login: (user: string, pass: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAdmin: false,
      login: (user, pass) => {
        if (user === ADMIN_USER && pass === ADMIN_PASS) {
          set({ isAdmin: true })
          return true
        }
        return false
      },
      logout: () => set({ isAdmin: false }),
    }),
    { name: 'auth-storage' }
  )
)
