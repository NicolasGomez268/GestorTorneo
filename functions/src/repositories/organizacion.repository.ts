import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'

import type { Organizacion } from '../models/organizacion.model'

const db = getFirestore()
const col = db.collection('organizaciones')

type CreateInput = Omit<Organizacion, 'id' | 'createdAt' | 'updatedAt'>
type UpdateInput = Partial<Omit<Organizacion, 'id' | 'createdAt'>>

const fromTs = (v: Timestamp | Date | undefined): Date | undefined => {
  if (!v) return undefined
  return v instanceof Timestamp ? v.toDate() : v
}

const map = (id: string, data: FirebaseFirestore.DocumentData): Organizacion => ({
  id,
  nombre: data.nombre,
  estado: data.estado ?? 'activa',
  createdAt: fromTs(data.createdAt),
  updatedAt: fromTs(data.updatedAt),
})

export const OrganizacionRepository = {
  async create(data: CreateInput): Promise<Organizacion> {
    const ref = col.doc()
    await ref.set({
      ...data,
      id: ref.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    const snap = await ref.get()
    return map(snap.id, snap.data() ?? {})
  },

  async read(id: string): Promise<Organizacion | null> {
    const snap = await col.doc(id).get()
    if (!snap.exists) return null
    return map(snap.id, snap.data() ?? {})
  },

  async update(id: string, data: UpdateInput): Promise<Organizacion | null> {
    const ref = col.doc(id)
    const snap = await ref.get()
    if (!snap.exists) return null
    await ref.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    })
    const next = await ref.get()
    return map(next.id, next.data() ?? {})
  },

  async list(): Promise<Organizacion[]> {
    const snap = await col.orderBy('nombre').get()
    return snap.docs.map((d) => map(d.id, d.data()))
  },
}
