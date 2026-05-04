import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { divisiones as divisionesMock } from '../data/divisiones'
import { equipos as equiposMock } from '../data/equipos'
import { jugadores as jugadoresMock } from '../data/jugadores'
import { partidos as partidosMock } from '../data/partidos'
import { statsJugadores as statsJugadoresMock } from '../data/statsJugadores'
import type { Division, Equipo, Jugador, Partido, StatsJugador, Torneo } from '../data/tipos'
import { torneos as torneosMock } from '../data/torneos'

interface AdminState {
  torneos:    Torneo[]
  divisiones: Division[]
  equipos:    Equipo[]
  jugadores:  Jugador[]
  partidos:   Partido[]
  statsJugadores: StatsJugador[]

  addTorneo:          (t: Torneo)  => void
  removeTorneo:       (id: string) => void
  updateTorneo:       (id: string, data: Partial<Torneo>)   => void
  updateTorneoEstado: (id: string, estado: Torneo['estado']) => void

  addDivision:    (d: Division) => void
  removeDivision: (id: string)  => void
  updateDivision: (id: string, data: Partial<Division>) => void

  addEquipo:    (e: Equipo)  => void
  removeEquipo: (id: string) => void
  updateEquipo: (id: string, data: Partial<Equipo>) => void

  addJugador:    (j: Jugador)                      => void
  removeJugador: (id: string)                      => void
  updateJugador: (id: string, data: Partial<Jugador>) => void

  addPartido:    (p: Partido) => void
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
    (set) => ({
      torneos:    [...torneosMock],
      divisiones: [...divisionesMock],
      equipos:    [...equiposMock],
      jugadores:  [...jugadoresMock],
      partidos:   [...partidosMock],
      statsJugadores: [...statsJugadoresMock],

      addTorneo: (t) =>
        set((s) => ({ torneos: [...s.torneos, t] })),

      removeTorneo: (id) =>
        set((s) => ({
          torneos:    s.torneos.filter((t) => t.id !== id),
          divisiones: s.divisiones.filter((d) => d.torneoId !== id),
        })),

      updateTorneo: (id, data) =>
        set((s) => ({ torneos: s.torneos.map((t) => t.id === id ? { ...t, ...data } : t) })),

      updateTorneoEstado: (id, estado) =>
        set((s) => ({ torneos: s.torneos.map((t) => t.id === id ? { ...t, estado } : t) })),

      addDivision: (d) =>
        set((s) => ({ divisiones: [...s.divisiones, d] })),

      removeDivision: (id) =>
        set((s) => ({ divisiones: s.divisiones.filter((d) => d.id !== id) })),

      updateDivision: (id, data) =>
        set((s) => ({ divisiones: s.divisiones.map((d) => d.id === id ? { ...d, ...data } : d) })),

      addEquipo: (e) =>
        set((s) => ({ equipos: [...s.equipos, e] })),

      removeEquipo: (id) =>
        set((s) => ({
          equipos:   s.equipos.filter((e) => e.id !== id),
          jugadores: s.jugadores.filter((j) => j.equipoId !== id),
        })),

      updateEquipo: (id, data) =>
        set((s) => {
          const equipos = s.equipos.map((e) => e.id === id ? { ...e, ...data } : e)
          const partidos = s.partidos.map((p) => {
            const patchLocal     = p.local.equipoId     === id
            const patchVisitante = p.visitante.equipoId === id
            if (!patchLocal && !patchVisitante) return p
            return {
              ...p,
              local:     patchLocal     ? { ...p.local,     ...(data.nombre  !== undefined && { nombre:  data.nombre  }), ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }), ...(data.color   !== undefined && { color:   data.color   }) } : p.local,
              visitante: patchVisitante ? { ...p.visitante, ...(data.nombre  !== undefined && { nombre:  data.nombre  }), ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }), ...(data.color   !== undefined && { color:   data.color   }) } : p.visitante,
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
          const jugadores = s.jugadores.map((j) => j.id === id ? { ...j, ...data } : j)
          const statsJugadores = s.statsJugadores.map((st) =>
            st.jugadorId === id
              ? {
                  ...st,
                  ...(data.nombre !== undefined && { nombre: data.nombre }),
                  ...(data.apellido !== undefined && { apellido: data.apellido }),
                  ...(data.equipoId !== undefined && { equipoId: data.equipoId }),
                }
              : st
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
          const ganadorId = ptsLocal > ptsVisitante
            ? partido.local.equipoId
            : ptsVisitante > ptsLocal
              ? partido.visitante.equipoId
              : (prevResultado?.ganadorId ?? partido.local.equipoId)

          const ajustarTabla = (
            equipos: Equipo[],
            resultado: { ptsLocal: number; ptsVisitante: number; ganadorId: string },
            signo: 1 | -1
          ) =>
            equipos.map((eq) => {
              if (eq.id !== partido.local.equipoId && eq.id !== partido.visitante.equipoId) return eq
              const esGanador = eq.id === resultado.ganadorId
              const esLocal   = eq.id === partido.local.equipoId
              const pf = esLocal ? resultado.ptsLocal      : resultado.ptsVisitante
              const pc = esLocal ? resultado.ptsVisitante  : resultado.ptsLocal
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
            p.id === partidoId
              ? { ...p, estado: 'jugado' as const, resultado: nuevoResultado }
              : p
          )

          const statsJugadores = [
            ...s.statsJugadores.filter((st) => st.partidoId !== partidoId),
            ...stats,
          ]

          return { equipos, partidos, statsJugadores }
        }),
    }),
    { name: 'admin-store' }
  )
)
