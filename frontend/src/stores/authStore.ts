import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { create } from 'zustand'

import { auth } from '../lib/firebase'

export type RolMvp = 'superadmin' | 'organizador'

interface AuthState {
  user: User | null
  ready: boolean
  rol: RolMvp | null
  idOrganizacion: string | null
  error: string | null
  init: () => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshClaims: () => Promise<void>
}

let unsub: (() => void) | null = null

const claimsFromUser = async (user: User | null) => {
  if (!user) {
    return { rol: null as RolMvp | null, idOrganizacion: null as string | null }
  }
  const token = await user.getIdTokenResult(true)
  const rol = token.claims.rol as RolMvp | undefined
  const idOrganizacion = token.claims.idOrganizacion as string | undefined
  return {
    rol: rol === 'superadmin' || rol === 'organizador' ? rol : null,
    idOrganizacion: idOrganizacion ?? null,
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  ready: false,
  rol: null,
  idOrganizacion: null,
  error: null,

  init: () => {
    if (unsub) return
    unsub = onAuthStateChanged(auth, async (user) => {
      const c = await claimsFromUser(user)
      set({
        user,
        ...c,
        ready: true,
        error: null,
      })
    })
  },

  refreshClaims: async () => {
    const { user } = get()
    if (!user) return
    const c = await claimsFromUser(user)
    set(c)
  },

  login: async (email, password) => {
    set({ error: null })
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      await get().refreshClaims()
      return true
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al iniciar sesión'
      set({ error: msg })
      return false
    }
  },

  logout: async () => {
    await signOut(auth)
    set({ user: null, rol: null, idOrganizacion: null })
  },
}))

export const puedeAccederAdmin = (rol: RolMvp | null): boolean =>
  rol === 'superadmin' || rol === 'organizador'
