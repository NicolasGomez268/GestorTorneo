import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore'

import type { Division, Torneo } from '../data/tipos'
import { firestore } from './firebase'

const mapTorneo = (id: string, data: DocumentData): Torneo => ({
  id,
  idOrganizacion: String(data.idOrganizacion ?? ''),
  claveCompetencia: String(data.claveCompetencia ?? ''),
  nombre: String(data.nombre ?? ''),
  deporte: String(data.deporte ?? 'Básquet'),
  temporada: String(data.temporada ?? ''),
  estado: data.estado as Torneo['estado'],
  descripcion: String(data.descripcion ?? ''),
  logoUrl: data.logoUrl ? String(data.logoUrl) : undefined,
})

const mapDivision = (id: string, data: DocumentData, torneoId: string): Division => ({
  id,
  torneoId,
  nombre: String(data.nombre ?? ''),
  estado: data.estado as Division['estado'],
  cantidadEquipos: Number(data.cantidadEquipos ?? 0),
})

/** Torneos visibles en la web pública (reglas Firestore: activo o próximo). */
export async function listarTorneosPublicos(): Promise<Torneo[]> {
  const q = query(
    collection(firestore, 'torneos'),
    where('estado', 'in', ['activo', 'proximo'])
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapTorneo(d.id, d.data()))
}

export async function obtenerTorneoPublico(id: string): Promise<Torneo | null> {
  const ref = doc(firestore, 'torneos', id)
  const s = await getDoc(ref)
  if (!s.exists()) return null
  return mapTorneo(s.id, s.data())
}

export async function listarDivisionesPublicas(torneoId: string): Promise<Division[]> {
  const col = collection(firestore, 'torneos', torneoId, 'divisiones')
  const snap = await getDocs(col)
  return snap.docs.map((d) => mapDivision(d.id, d.data(), torneoId))
}

export async function obtenerDivisionPublica(
  torneoId: string,
  divisionId: string
): Promise<Division | null> {
  const ref = doc(firestore, 'torneos', torneoId, 'divisiones', divisionId)
  const s = await getDoc(ref)
  if (!s.exists()) return null
  return mapDivision(s.id, s.data(), torneoId)
}
