import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'

import type { Division } from '../models/division.model'

const db = getFirestore()
const torneosCollection = db.collection('torneos')

type DivisionCreateInput = Omit<Division, 'id' | 'createdAt' | 'updatedAt'>
type DivisionUpdateInput = Partial<Omit<Division, 'id' | 'createdAt'>>

const fromTimestamp = (value: Timestamp | Date | undefined): Date | undefined => {
  if (!value) return undefined
  return value instanceof Timestamp ? value.toDate() : value
}

const mapDivision = (id: string, data: FirebaseFirestore.DocumentData): Division => {
  return {
    id,
    torneoId: data.torneoId,
    nombre: data.nombre,
    estado: data.estado,
    cantidadEquipos: data.cantidadEquipos ?? 0,
    createdAt: fromTimestamp(data.createdAt),
    updatedAt: fromTimestamp(data.updatedAt),
  }
}

const divisionsCollection = (torneoId: string) => {
  return torneosCollection.doc(torneoId).collection('divisiones')
}

export const DivisionRepository = {
  async create(data: DivisionCreateInput): Promise<Division> {
    const docRef = divisionsCollection(data.torneoId).doc()
    const payload = {
      ...data,
      id: docRef.id,
      cantidadEquipos: data.cantidadEquipos ?? 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    await docRef.set(payload)
    const created = await docRef.get()
    return mapDivision(created.id, created.data() ?? {})
  },

  async read(torneoId: string, divisionId: string): Promise<Division | null> {
    const doc = await divisionsCollection(torneoId).doc(divisionId).get()
    if (!doc.exists) return null
    return mapDivision(doc.id, doc.data() ?? {})
  },

  async update(
    torneoId: string,
    divisionId: string,
    data: DivisionUpdateInput
  ): Promise<Division | null> {
    const docRef = divisionsCollection(torneoId).doc(divisionId)
    const doc = await docRef.get()
    if (!doc.exists) return null

    const payload = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await docRef.update(payload)
    const updated = await docRef.get()
    return mapDivision(updated.id, updated.data() ?? {})
  },

  async delete(torneoId: string, divisionId: string): Promise<boolean> {
    const docRef = divisionsCollection(torneoId).doc(divisionId)
    const doc = await docRef.get()
    if (!doc.exists) return false

    await docRef.delete()
    return true
  },

  async listByTorneo(torneoId: string): Promise<Division[]> {
    const snapshot = await divisionsCollection(torneoId).get()
    return snapshot.docs.map((doc) => mapDivision(doc.id, doc.data()))
  },
}
