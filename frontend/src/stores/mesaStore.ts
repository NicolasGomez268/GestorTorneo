import { create } from 'zustand'
import type { JugadorPlanilla } from '../data/tipos'

export interface JugadorEnCancha extends JugadorPlanilla {
  puntos: number
  faltas: number
  segundosJugados: number
  enCancha: boolean
  tiempoEntrada: number | null  // segundos de juego absolutos al momento de entrada
}

interface MesaState {
  partidoId: string | null
  localId: string
  visitanteId: string
  localNombre: string
  visitanteNombre: string
  localColor: string
  visitanteColor: string
  ptsLocal: number
  ptsVisitante: number
  faltasLocal: number
  faltasVisitante: number
  cuarto: number
  tiempoRestante: number
  corriendo: boolean
  jugadoresLocal: JugadorEnCancha[]
  jugadoresVisitante: JugadorEnCancha[]
  jugadorSeleccionado: string | null
  finalizado: boolean

  iniciarPartido: (config: {
    partidoId: string
    localId: string; visitanteId: string
    localNombre: string; visitanteNombre: string
    localColor: string; visitanteColor: string
    jugadoresLocal: JugadorPlanilla[]; jugadoresVisitante: JugadorPlanilla[]
    titularesLocalIds: string[]; titularesVisitanteIds: string[]
  }) => void
  toggleReloj: () => void
  tickReloj: () => void
  siguienteCuarto: () => void
  seleccionarJugador: (jugadorId: string | null) => void
  sumarPuntos: (equipoId: string, pts: number) => void
  sumarFalta: (jugadorId: string, equipo: 'local' | 'visitante') => void
  cambiarJugador: (salienteId: string, entranteId: string, equipo: 'local' | 'visitante') => void
  finalizarPartido: () => void
  reset: () => void
}

const gameSecondsElapsed = (cuarto: number, tiempoRestante: number) =>
  (cuarto - 1) * DURACION_CUARTO + (DURACION_CUARTO - tiempoRestante)

const DURACION_CUARTO = 10 * 60

export const useMesaStore = create<MesaState>((set, get) => ({
  partidoId: null,
  localId: '', visitanteId: '',
  localNombre: '', visitanteNombre: '',
  localColor: '#FF6B00', visitanteColor: '#00BFFF',
  ptsLocal: 0, ptsVisitante: 0,
  faltasLocal: 0, faltasVisitante: 0,
  cuarto: 1,
  tiempoRestante: DURACION_CUARTO,
  corriendo: false,
  jugadoresLocal: [], jugadoresVisitante: [],
  jugadorSeleccionado: null,
  finalizado: false,

  iniciarPartido: (config) => {
    const toJugadorEnCancha = (j: JugadorPlanilla, titularIds: string[]): JugadorEnCancha => ({
      ...j, puntos: 0, faltas: 0, segundosJugados: 0,
      enCancha: titularIds.includes(j.id),
      tiempoEntrada: titularIds.includes(j.id) ? 0 : null,
    })
    set({
      ...config,
      ptsLocal: 0, ptsVisitante: 0,
      faltasLocal: 0, faltasVisitante: 0,
      cuarto: 1, tiempoRestante: DURACION_CUARTO,
      corriendo: false, finalizado: false,
      jugadoresLocal: config.jugadoresLocal.map((j) => toJugadorEnCancha(j, config.titularesLocalIds)),
      jugadoresVisitante: config.jugadoresVisitante.map((j) => toJugadorEnCancha(j, config.titularesVisitanteIds)),
      jugadorSeleccionado: null,
    })
  },

  toggleReloj: () => set((s) => ({ corriendo: !s.corriendo })),

  tickReloj: () => {
    const { tiempoRestante, corriendo, cuarto } = get()
    if (!corriendo) return
    if (tiempoRestante <= 0) {
      set({ corriendo: false })
      if (cuarto < 4) set({ cuarto: cuarto + 1, tiempoRestante: DURACION_CUARTO })
      return
    }
    set({ tiempoRestante: tiempoRestante - 1 })
  },

  siguienteCuarto: () => {
    const { cuarto } = get()
    if (cuarto < 4) set({ cuarto: cuarto + 1, tiempoRestante: DURACION_CUARTO, corriendo: false })
  },

  seleccionarJugador: (jugadorId) => set({ jugadorSeleccionado: jugadorId }),

  sumarPuntos: (equipoId, pts) => {
    const { jugadorSeleccionado, jugadoresLocal, jugadoresVisitante, localId } = get()
    const esLocal = equipoId === localId

    if (jugadorSeleccionado) {
      const actualizar = (lista: JugadorEnCancha[]) =>
        lista.map((j) => j.id === jugadorSeleccionado ? { ...j, puntos: j.puntos + pts } : j)
      if (esLocal) set({ jugadoresLocal: actualizar(jugadoresLocal) })
      else set({ jugadoresVisitante: actualizar(jugadoresVisitante) })
    }

    if (esLocal) set((s) => ({ ptsLocal: s.ptsLocal + pts, jugadorSeleccionado: null }))
    else set((s) => ({ ptsVisitante: s.ptsVisitante + pts, jugadorSeleccionado: null }))
  },

  sumarFalta: (jugadorId, equipo) => {
    const actualizar = (lista: JugadorEnCancha[]) =>
      lista.map((j) => j.id === jugadorId ? { ...j, faltas: j.faltas + 1 } : j)
    if (equipo === 'local') {
      set((s) => ({ jugadoresLocal: actualizar(s.jugadoresLocal), faltasLocal: s.faltasLocal + 1, jugadorSeleccionado: null }))
    } else {
      set((s) => ({ jugadoresVisitante: actualizar(s.jugadoresVisitante), faltasVisitante: s.faltasVisitante + 1, jugadorSeleccionado: null }))
    }
  },

  cambiarJugador: (salienteId, entranteId, equipo) => {
    const { cuarto, tiempoRestante } = get()
    const ahora = gameSecondsElapsed(cuarto, tiempoRestante)
    const actualizar = (lista: JugadorEnCancha[]) =>
      lista.map((j) => {
        if (j.id === salienteId) return {
          ...j, enCancha: false,
          segundosJugados: j.segundosJugados + (j.tiempoEntrada != null ? ahora - j.tiempoEntrada : 0),
          tiempoEntrada: null,
        }
        if (j.id === entranteId) return { ...j, enCancha: true, tiempoEntrada: ahora }
        return j
      })
    if (equipo === 'local') set((s) => ({ jugadoresLocal: actualizar(s.jugadoresLocal), jugadorSeleccionado: null }))
    else set((s) => ({ jugadoresVisitante: actualizar(s.jugadoresVisitante), jugadorSeleccionado: null }))
  },

  finalizarPartido: () => {
    const { cuarto, tiempoRestante, jugadoresLocal, jugadoresVisitante } = get()
    const ahora = gameSecondsElapsed(cuarto, tiempoRestante)
    const cerrarTiempo = (lista: JugadorEnCancha[]) =>
      lista.map((j) => j.enCancha && j.tiempoEntrada != null
        ? { ...j, segundosJugados: j.segundosJugados + (ahora - j.tiempoEntrada), tiempoEntrada: null }
        : j
      )
    set({
      finalizado: true, corriendo: false,
      jugadoresLocal:     cerrarTiempo(jugadoresLocal),
      jugadoresVisitante: cerrarTiempo(jugadoresVisitante),
    })
  },

  reset: () => set({
    partidoId: null, ptsLocal: 0, ptsVisitante: 0,
    faltasLocal: 0, faltasVisitante: 0,
    cuarto: 1, tiempoRestante: DURACION_CUARTO,
    corriendo: false, finalizado: false,
    jugadoresLocal: [], jugadoresVisitante: [],
    jugadorSeleccionado: null,
  }),
}))
