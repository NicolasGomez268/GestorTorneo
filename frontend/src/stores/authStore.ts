import { create } from 'zustand'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthState {
  isAdmin: boolean
  ready: boolean
  userEmail: string | null
  init: () => void
  login: (user: string, pass: string) => Promise<boolean>
  logout: () => Promise<void>
}

let authListenerStarted = false

export const useAuthStore = create<AuthState>()((set) => ({
  isAdmin: false,
  ready: false,
  userEmail: null,
  init: () => {
    if (authListenerStarted) return
    authListenerStarted = true

    onAuthStateChanged(auth, (user) => {
      set({
        isAdmin: Boolean(user),
        ready: true,
        userEmail: user?.email ?? null,
      })
    })
  },
  login: async (user, pass) => {
    try {
      await signInWithEmailAndPassword(auth, user, pass)
      return true
    } catch {
      return false
    }
  },
  logout: async () => {
    await signOut(auth)
    set({ isAdmin: false, userEmail: null })
  },
}))
