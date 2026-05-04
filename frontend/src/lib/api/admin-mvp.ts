import { httpsCallable } from 'firebase/functions'

import { functions } from '../firebase'

type AdminRequest = {
  accion: string
  datos?: Record<string, unknown>
}

const callable = httpsCallable<AdminRequest, unknown>(functions, 'adminMvp')

export async function adminMvp<T = unknown>(
  accion: string,
  datos: Record<string, unknown> = {}
): Promise<T> {
  const res = await callable({ accion, datos })
  return res.data as T
}
