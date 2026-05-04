export interface Torneo {
  id: string
  idOrganizacion: string
  claveCompetencia: string
  nombre: string
  deporte: string
  temporada: string
  estado: 'activo' | 'finalizado' | 'proximo'
  descripcion: string
  logoUrl?: string
}

export interface Organizacion {
  id: string
  nombre: string
  estado: 'activa' | 'suspendida'
}

export interface Division {
  id: string
  torneoId: string
  nombre: string
  estado: 'activa' | 'finalizada'
  cantidadEquipos: number
}

export interface Equipo {
  id: string
  divisionId: string
  nombre: string
  logoUrl?: string
  color: string
  PJ: number
  PG: number
  PP: number
  PF: number
  PC: number
  PT: number
}

export interface Jugador {
  id: string
  equipoId: string
  nombre: string
  apellido: string
  posicion?: string
  fotoUrl?: string
  dni?: string
  fechaNacimiento?: string
  altura?: number
}

export interface JugadorPlanilla extends Jugador {
  numeroCamiseta: number
}

export type EstadoPartido = 'pendiente' | 'jugado'
export type FasePartido = 'regular' | 'playoff'
export type RondaPartido = null | 'octavos' | 'cuartos' | 'semifinal' | 'final'

export interface Partido {
  id: string
  divisionId: string
  fechaNumero: number
  fechaHora: string
  local: { equipoId: string; nombre: string; logoUrl?: string; color: string }
  visitante: { equipoId: string; nombre: string; logoUrl?: string; color: string }
  estado: EstadoPartido
  resultado?: { ptsLocal: number; ptsVisitante: number; ganadorId: string }
  fase: FasePartido
  ronda: RondaPartido
}

export interface StatsJugador {
  jugadorId: string
  partidoId: string
  nombre: string
  apellido: string
  numeroCamiseta: number
  equipo: 'local' | 'visitante'
  equipoId: string
  puntos: number
  faltas: number
  segundosJugados: number
}
