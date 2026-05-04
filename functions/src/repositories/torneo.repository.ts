import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'

import type { Torneo } from '../models/torneo.model'

const db = getFirestore()
const torneosCollection = db.collection('torneos')

type TorneoCreateInput = Omit<Torneo, 'id' | 'createdAt' | 'updatedAt'>
type TorneoUpdateInput = Partial<Omit<Torneo, 'id' | 'createdAt'>>

const fromTimestamp = (value: Timestamp | Date | undefined): Date | undefined => {
  if (!value) return undefined
  return value instanceof Timestamp ? value.toDate() : value
}

const mapTorneo = (id: string, data: FirebaseFirestore.DocumentData): Torneo => {
  return {
    id,
    idOrganizacion: data.idOrganizacion ?? '',
    claveCompetencia: data.claveCompetencia ?? '',
    nombre: data.nombre,
    deporte: data.deporte,
    temporada: data.temporada,
    estado: data.estado,
    descripcion: data.descripcion,
    logoUrl: data.logoUrl,
    createdAt: fromTimestamp(data.createdAt),
    updatedAt: fromTimestamp(data.updatedAt),
  }
}

const deleteDivisionDocs = async (torneoId: string): Promise<void> => {
  const divisionsRef = torneosCollection.doc(torneoId).collection('divisiones')
  const snapshot = await divisionsRef.get()

  if (snapshot.empty) return

  let batch = db.batch()
  let operationCount = 0

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref)
    operationCount += 1

    if (operationCount === 450) {
      await batch.commit()
      batch = db.batch()
      operationCount = 0
    }
  }

  if (operationCount > 0) {
    await batch.commit()
  }
}

export const TorneoRepository = {
  async create(data: TorneoCreateInput): Promise<Torneo> {
    const docRef = torneosCollection.doc()
    const payload = {
      ...data,
      id: docRef.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    await docRef.set(payload)
    const created = await docRef.get()
    return mapTorneo(created.id, created.data() ?? {})
  },

  async read(id: string): Promise<Torneo | null> {
    const doc = await torneosCollection.doc(id).get()
    if (!doc.exists) return null
    return mapTorneo(doc.id, doc.data() ?? {})
  },

  async update(id: string, data: TorneoUpdateInput): Promise<Torneo | null> {
    const docRef = torneosCollection.doc(id)
    const doc = await docRef.get()
    if (!doc.exists) return null

    const payload = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await docRef.update(payload)
    const updated = await docRef.get()
    return mapTorneo(updated.id, updated.data() ?? {})
  },

  async delete(id: string): Promise<boolean> {
    const docRef = torneosCollection.doc(id)
    const doc = await docRef.get()
    if (!doc.exists) return false

    await deleteDivisionDocs(id)
    await docRef.delete()
    return true
  },

  async list(): Promise<Torneo[]> {
    const snapshot = await torneosCollection.get()
    return snapshot.docs.map((doc) => mapTorneo(doc.id, doc.data()))
  },

  async listByOrganizacion(idOrganizacion: string): Promise<Torneo[]> {
    const snapshot = await torneosCollection
      .where('idOrganizacion', '==', idOrganizacion)
      .orderBy('temporada', 'desc')
      .get()
    return snapshot.docs.map((doc) => mapTorneo(doc.id, doc.data()))
  },

  async listByOrganizacionYClave(
    idOrganizacion: string,
    claveCompetencia: string
  ): Promise<Torneo[]> {
    const snapshot = await torneosCollection
      .where('idOrganizacion', '==', idOrganizacion)
      .where('claveCompetencia', '==', claveCompetencia)
      .orderBy('temporada', 'desc')
      .get()
    return snapshot.docs.map((doc) => mapTorneo(doc.id, doc.data()))
  },
}
