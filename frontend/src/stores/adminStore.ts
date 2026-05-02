import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { torneos as torneosMock }       from '../data/torneos'
import { divisiones as divisionesMock } from '../data/divisiones'
import { equipos as equiposMock }       from '../data/equipos'
import { jugadores as jugadoresMock }   from '../data/jugadores'
import { partidos as partidosMock }     from '../data/partidos'
import type { Torneo, Division, Equipo, Jugador, Partido } from '../data/tipos'

interface AdminState {
  torneos:    Torneo[]
  divisiones: Division[]
  equipos:    Equipo[]
  jugadores:  Jugador[]
  partidos:   Partido[]

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
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      torneos:    [...torneosMock],
      divisiones: [...divisionesMock],
      equipos:    [...equiposMock],
      jugadores:  [...jugadoresMock],
      partidos:   [...partidosMock],

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
        set((s) => ({ equipos: s.equipos.map((e) => e.id === id ? { ...e, ...data } : e) })),

      addJugador: (j) =>
        set((s) => ({ jugadores: [...s.jugadores, j] })),

      removeJugador: (id) =>
        set((s) => ({ jugadores: s.jugadores.filter((j) => j.id !== id) })),

      updateJugador: (id, data) =>
        set((s) => ({
          jugadores: s.jugadores.map((j) => j.id === id ? { ...j, ...data } : j),
        })),

      addPartido: (p) =>
        set((s) => ({ partidos: [...s.partidos, p] })),

      removePartido: (id) =>
        set((s) => ({ partidos: s.partidos.filter((p) => p.id !== id) })),
    }),
    { name: 'admin-store' }
  )
)
