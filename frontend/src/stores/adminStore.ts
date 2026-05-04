import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Torneo, Division, Equipo, Jugador, Partido, Organizacion } from '../data/tipos'
import { adminMvp } from '../lib/api/admin-mvp'
import { fetchTorneosYDivisionesRaw } from '../lib/api/fetchTorneosDivisionesAdmin'
import { mapDivision, mapTorneo } from '../lib/mappers/adminMvpEntities'
import { QK_ADMIN_TORNEOS_DIV, queryClient } from '../lib/queryClient'
import { useAuthStore } from './authStore'

import { equipos as equiposMock } from '../data/equipos'
import { jugadores as jugadoresMock } from '../data/jugadores'
import { partidos as partidosMock } from '../data/partidos'

const orgPayload = (idOrganizacion: string | undefined): Record<string, unknown> =>
  idOrganizacion ? { idOrganizacion } : {}

const invalidateTorneosDivisionesQuery = () => {
  void queryClient.invalidateQueries({ queryKey: [...QK_ADMIN_TORNEOS_DIV] })
}

interface AdminState {
  torneos: Torneo[]
  divisiones: Division[]

  equipos: Equipo[]
  jugadores: Jugador[]
  partidos: Partido[]

  cargarTorneosYDivisiones: (idOrganizacion?: string) => Promise<void>

  addTorneo: (payload: {
    nombre: string
    deporte: string
    temporada: string
    descripcion: string
    logoUrl?: string
    torneoIdOrigen?: string
  }, idOrganizacion?: string) => Promise<Torneo>

  removeTorneo: (id: string, idOrganizacion?: string) => Promise<void>
  updateTorneo: (id: string, data: Partial<Torneo>, idOrganizacion?: string) => Promise<void>
  updateTorneoEstado: (id: string, estado: Torneo['estado'], idOrganizacion?: string) => Promise<void>

  addDivision: (d: Omit<Division, 'id' | 'cantidadEquipos'>, idOrganizacion?: string) => Promise<Division>
  removeDivision: (id: string, idOrganizacion?: string) => Promise<void>
  updateDivision: (id: string, data: Partial<Division>, idOrganizacion?: string) => Promise<void>

  addEquipo: (e: Equipo) => void
  removeEquipo: (id: string) => void
  updateEquipo: (id: string, data: Partial<Equipo>) => void

  addJugador: (j: Jugador) => void
  removeJugador: (id: string) => void
  updateJugador: (id: string, data: Partial<Jugador>) => void

  addPartido: (p: Partido) => void
  removePartido: (id: string) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      torneos: [],
      divisiones: [],
      equipos: [...equiposMock],
      jugadores: [...jugadoresMock],
      partidos: [...partidosMock],

      cargarTorneosYDivisiones: async (idOrganizacion?: string) => {
        const { rol, idOrganizacion: claimOrg } = useAuthStore.getState()
        const org =
          idOrganizacion ?? (rol === 'organizador' ? claimOrg ?? undefined : undefined)
        if (rol === 'superadmin' && !org) {
          set({ torneos: [], divisiones: [] })
          return
        }
        const raw = await fetchTorneosYDivisionesRaw(idOrganizacion)
        const torneos = raw.torneos.map(mapTorneo)
        const divisiones = raw.divisiones.map(mapDivision)
        set({ torneos, divisiones })
      },

      addTorneo: async (payload, idOrganizacion) => {
        const raw = await adminMvp<unknown>('torneoCrear', {
          ...orgPayload(idOrganizacion),
          ...payload,
        })
        const t = mapTorneo(raw)
        set((s) => ({ torneos: [...s.torneos, t] }))
        invalidateTorneosDivisionesQuery()
        return t
      },

      removeTorneo: async (id, idOrganizacion) => {
        await adminMvp('torneoEliminar', { ...orgPayload(idOrganizacion), idTorneo: id })
        set((s) => ({
          torneos: s.torneos.filter((t) => t.id !== id),
          divisiones: s.divisiones.filter((d) => d.torneoId !== id),
        }))
        invalidateTorneosDivisionesQuery()
      },

      updateTorneo: async (id, data, idOrganizacion) => {
        const raw = await adminMvp<unknown>('torneoActualizar', {
          ...orgPayload(idOrganizacion),
          idTorneo: id,
          ...data,
        })
        const t = mapTorneo(raw)
        set((s) => ({
          torneos: s.torneos.map((x) => (x.id === id ? t : x)),
        }))
        invalidateTorneosDivisionesQuery()
      },

      updateTorneoEstado: async (id, estado, idOrganizacion) => {
        const raw = await adminMvp<unknown>('torneoActualizarEstado', {
          ...orgPayload(idOrganizacion),
          idTorneo: id,
          estado,
        })
        const t = mapTorneo(raw)
        set((s) => ({
          torneos: s.torneos.map((x) => (x.id === id ? t : x)),
        }))
        invalidateTorneosDivisionesQuery()
      },

      addDivision: async (d, idOrganizacion) => {
        const raw = await adminMvp<unknown>('divisionCrear', {
          ...orgPayload(idOrganizacion),
          torneoId: d.torneoId,
          nombre: d.nombre,
          estado: d.estado,
        })
        const div = mapDivision(raw)
        set((s) => ({ divisiones: [...s.divisiones, div] }))
        invalidateTorneosDivisionesQuery()
        return div
      },

      removeDivision: async (id, idOrganizacion) => {
        const div = get().divisiones.find((x) => x.id === id)
        if (!div) return
        await adminMvp('divisionEliminar', {
          ...orgPayload(idOrganizacion),
          idTorneo: div.torneoId,
          idDivision: id,
        })
        set((s) => ({
          divisiones: s.divisiones.filter((x) => x.id !== id),
        }))
        invalidateTorneosDivisionesQuery()
      },

      updateDivision: async (id, data, idOrganizacion) => {
        const div = get().divisiones.find((x) => x.id === id)
        if (!div) return
        const raw = await adminMvp<unknown>('divisionActualizar', {
          ...orgPayload(idOrganizacion),
          idTorneo: div.torneoId,
          idDivision: id,
          ...data,
        })
        const next = mapDivision(raw)
        set((s) => ({
          divisiones: s.divisiones.map((x) => (x.id === id ? next : x)),
        }))
        invalidateTorneosDivisionesQuery()
      },

      addEquipo: (e) =>
        set((s) => ({ equipos: [...s.equipos, e] })),

      removeEquipo: (id) =>
        set((s) => ({
          equipos: s.equipos.filter((e) => e.id !== id),
          jugadores: s.jugadores.filter((j) => j.equipoId !== id),
        })),

      updateEquipo: (id, data) =>
        set((s) => ({
          equipos: s.equipos.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),

      addJugador: (j) =>
        set((s) => ({ jugadores: [...s.jugadores, j] })),

      removeJugador: (id) =>
        set((s) => ({ jugadores: s.jugadores.filter((j) => j.id !== id) })),

      updateJugador: (id, data) =>
        set((s) => ({
          jugadores: s.jugadores.map((j) => (j.id === id ? { ...j, ...data } : j)),
        })),

      addPartido: (p) =>
        set((s) => ({ partidos: [...s.partidos, p] })),

      removePartido: (id) =>
        set((s) => ({ partidos: s.partidos.filter((p) => p.id !== id) })),
    }),
    {
      name: 'admin-store',
      partialize: (s) => ({
        equipos: s.equipos,
        jugadores: s.jugadores,
        partidos: s.partidos,
      }),
    }
  )
)

export async function listarOrganizaciones(): Promise<Organizacion[]> {
  return adminMvp<Organizacion[]>('organizacionListar', {})
}

export async function crearOrganizacion(datos: { nombre: string }): Promise<Organizacion> {
  return adminMvp<Organizacion>('organizacionCrear', datos)
}

export async function crearUsuarioOrganizador(datos: {
  idOrganizacion: string
  email: string
  password: string
}): Promise<{ uid: string; email: string | null }> {
  return adminMvp('usuarioOrganizadorCrear', datos)
}
