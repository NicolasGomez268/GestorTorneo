import { create } from 'zustand'

const MOCK_USER = 'admin'
const MOCK_PASS = 'admin123'

interface AuthState {
  isAdmin: boolean
  ready: boolean
  userEmail: string | null
  init: () => void
  login: (user: string, pass: string) => Promise<boolean>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAdmin: false,
  ready: true,
  userEmail: null,
  init: () => {},
  login: async (user, pass) => {
    if (user === MOCK_USER && pass === MOCK_PASS) {
      set({ isAdmin: true, userEmail: MOCK_USER })
      return true
    }
    return false
  },
  logout: async () => {
    set({ isAdmin: false, userEmail: null })
  },
}))
