import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  Torneo,
  Division,
  Equipo,
  Jugador,
  Partido,
  Organizacion,
  StatsJugador,
} from '../data/tipos'
import { adminMvp } from '../lib/api/admin-mvp'
import { fetchTorneosYDivisionesRaw } from '../lib/api/fetchTorneosDivisionesAdmin'
import { mapDivision, mapTorneo } from '../lib/mappers/adminMvpEntities'
import { QK_ADMIN_TORNEOS_DIV, queryClient } from '../lib/queryClient'
import { useAuthStore } from './authStore'

import { equipos as equiposMock } from '../data/equipos'
import { jugadores as jugadoresMock } from '../data/jugadores'
import { partidos as partidosMock } from '../data/partidos'
import { statsJugadores as statsJugadoresMock } from '../data/statsJugadores'

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
  statsJugadores: StatsJugador[]

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
  registrarResultadoPartido: (data: {
    partidoId: string
    ptsLocal: number
    ptsVisitante: number
    stats: StatsJugador[]
  }) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      torneos: [],
      divisiones: [],
      equipos: [...equiposMock],
      jugadores: [...jugadoresMock],
      partidos: [...partidosMock],
      statsJugadores: [...statsJugadoresMock],

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
        set((s) => {
          const equipos = s.equipos.map((e) => (e.id === id ? { ...e, ...data } : e))
          const partidos = s.partidos.map((p) => {
            const patchLocal = p.local.equipoId === id
            const patchVisitante = p.visitante.equipoId === id
            if (!patchLocal && !patchVisitante) return p
            return {
              ...p,
              local: patchLocal ?
                {
                  ...p.local,
                  ...(data.nombre !== undefined && { nombre: data.nombre }),
                  ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
                  ...(data.color !== undefined && { color: data.color }),
                } :
                p.local,
              visitante: patchVisitante ?
                {
                  ...p.visitante,
                  ...(data.nombre !== undefined && { nombre: data.nombre }),
                  ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
                  ...(data.color !== undefined && { color: data.color }),
                } :
                p.visitante,
            }
          })
          return { equipos, partidos }
        }),

      addJugador: (j) =>
        set((s) => ({ jugadores: [...s.jugadores, j] })),

      removeJugador: (id) =>
        set((s) => ({
          jugadores: s.jugadores.filter((j) => j.id !== id),
          statsJugadores: s.statsJugadores.filter((st) => st.jugadorId !== id),
        })),

      updateJugador: (id, data) =>
        set((s) => {
          const jugadores = s.jugadores.map((j) => (j.id === id ? { ...j, ...data } : j))
          const statsJugadores = s.statsJugadores.map((st) =>
            st.jugadorId === id ?
              {
                ...st,
                ...(data.nombre !== undefined && { nombre: data.nombre }),
                ...(data.apellido !== undefined && { apellido: data.apellido }),
                ...(data.equipoId !== undefined && { equipoId: data.equipoId }),
              } :
              st
          )
          return { jugadores, statsJugadores }
        }),

      addPartido: (p) =>
        set((s) => ({ partidos: [...s.partidos, p] })),

      removePartido: (id) =>
        set((s) => ({
          partidos: s.partidos.filter((p) => p.id !== id),
          statsJugadores: s.statsJugadores.filter((st) => st.partidoId !== id),
        })),

      registrarResultadoPartido: ({ partidoId, ptsLocal, ptsVisitante, stats }) =>
        set((s) => {
          const partido = s.partidos.find((p) => p.id === partidoId)
          if (!partido) return s

          const prevResultado = partido.estado === 'jugado' ? partido.resultado : undefined
          const ganadorId =
            ptsLocal > ptsVisitante ?
              partido.local.equipoId :
              ptsVisitante > ptsLocal ?
                partido.visitante.equipoId :
                (prevResultado?.ganadorId ?? partido.local.equipoId)

          const ajustarTabla = (
            equipos: Equipo[],
            resultado: { ptsLocal: number; ptsVisitante: number; ganadorId: string },
            signo: 1 | -1
          ) =>
            equipos.map((eq) => {
              if (eq.id !== partido.local.equipoId && eq.id !== partido.visitante.equipoId) return eq
              const esGanador = eq.id === resultado.ganadorId
              const esLocal = eq.id === partido.local.equipoId
              const pf = esLocal ? resultado.ptsLocal : resultado.ptsVisitante
              const pc = esLocal ? resultado.ptsVisitante : resultado.ptsLocal
              return {
                ...eq,
                PJ: eq.PJ + signo,
                PG: eq.PG + (esGanador ? signo : 0),
                PP: eq.PP + (!esGanador ? signo : 0),
                PF: (eq.PF ?? 0) + pf * signo,
                PC: (eq.PC ?? 0) + pc * signo,
                PT: eq.PT + (esGanador ? 3 * signo : 0),
              }
            })

          let equipos = s.equipos
          if (prevResultado) {
            equipos = ajustarTabla(equipos, prevResultado, -1)
          }

          const nuevoResultado = { ptsLocal, ptsVisitante, ganadorId }
          equipos = ajustarTabla(equipos, nuevoResultado, 1)

          const partidos = s.partidos.map((p) =>
            p.id === partidoId ?
              { ...p, estado: 'jugado' as const, resultado: nuevoResultado } :
              p
          )

          const statsJugadores = [
            ...s.statsJugadores.filter((st) => st.partidoId !== partidoId),
            ...stats,
          ]

          return { equipos, partidos, statsJugadores }
        }),
    }),
    {
      name: 'admin-store',
      partialize: (s) => ({
        equipos: s.equipos,
        jugadores: s.jugadores,
        partidos: s.partidos,
        statsJugadores: s.statsJugadores,
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
