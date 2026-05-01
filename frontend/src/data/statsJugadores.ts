import type { StatsJugador } from './tipos'

export const statsJugadores: StatsJugador[] = [
  // Partido p-001: Shadow Titans (local) vs Neon Drifters (visitante) — 88-72
  { jugadorId: 'j-01', partidoId: 'p-001', nombre: 'Marcos',    apellido: 'Vega',      dorsal: 5,  equipo: 'local',     equipoId: 'eq-1', puntos: 22, faltas: 2, rebotes: 4,  asistencias: 8,  minutosJugados: 34 },
  { jugadorId: 'j-02', partidoId: 'p-001', nombre: 'Lucas',     apellido: 'Romero',    dorsal: 7,  equipo: 'local',     equipoId: 'eq-1', puntos: 18, faltas: 3, rebotes: 3,  asistencias: 2,  minutosJugados: 30 },
  { jugadorId: 'j-03', partidoId: 'p-001', nombre: 'Nicolás',   apellido: 'Torres',    dorsal: 10, equipo: 'local',     equipoId: 'eq-1', puntos: 28, faltas: 1, rebotes: 7,  asistencias: 3,  minutosJugados: 36 },
  { jugadorId: 'j-04', partidoId: 'p-001', nombre: 'Rodrigo',   apellido: 'Sosa',      dorsal: 14, equipo: 'local',     equipoId: 'eq-1', puntos: 12, faltas: 4, rebotes: 11, asistencias: 1,  minutosJugados: 28 },
  { jugadorId: 'j-05', partidoId: 'p-001', nombre: 'Diego',     apellido: 'Herrera',   dorsal: 21, equipo: 'local',     equipoId: 'eq-1', puntos: 8,  faltas: 2, rebotes: 9,  asistencias: 2,  minutosJugados: 25 },
  { jugadorId: 'j-06', partidoId: 'p-001', nombre: 'Agustín',   apellido: 'López',     dorsal: 3,  equipo: 'local',     equipoId: 'eq-1', puntos: 0,  faltas: 1, rebotes: 0,  asistencias: 1,  minutosJugados: 8  },

  { jugadorId: 'j-09', partidoId: 'p-001', nombre: 'Tomás',     apellido: 'Ruiz',      dorsal: 4,  equipo: 'visitante', equipoId: 'eq-2', puntos: 14, faltas: 3, rebotes: 3,  asistencias: 6,  minutosJugados: 32 },
  { jugadorId: 'j-10', partidoId: 'p-001', nombre: 'Facundo',   apellido: 'Acosta',    dorsal: 11, equipo: 'visitante', equipoId: 'eq-2', puntos: 20, faltas: 2, rebotes: 2,  asistencias: 4,  minutosJugados: 33 },
  { jugadorId: 'j-11', partidoId: 'p-001', nombre: 'Matías',    apellido: 'Peralta',   dorsal: 15, equipo: 'visitante', equipoId: 'eq-2', puntos: 16, faltas: 4, rebotes: 5,  asistencias: 1,  minutosJugados: 29 },
  { jugadorId: 'j-12', partidoId: 'p-001', nombre: 'Emilio',    apellido: 'Gómez',     dorsal: 20, equipo: 'visitante', equipoId: 'eq-2', puntos: 10, faltas: 3, rebotes: 8,  asistencias: 0,  minutosJugados: 26 },
  { jugadorId: 'j-13', partidoId: 'p-001', nombre: 'Pablo',     apellido: 'Fernández', dorsal: 32, equipo: 'visitante', equipoId: 'eq-2', puntos: 12, faltas: 2, rebotes: 10, asistencias: 1,  minutosJugados: 27 },

  // Partido p-002: Apex Raptors vs Iron Hawks — 65-70
  { jugadorId: 'j-16', partidoId: 'p-002', nombre: 'Ezequiel',  apellido: 'Ríos',      dorsal: 1,  equipo: 'local',     equipoId: 'eq-3', puntos: 18, faltas: 2, rebotes: 3,  asistencias: 7,  minutosJugados: 35 },
  { jugadorId: 'j-17', partidoId: 'p-002', nombre: 'Leandro',   apellido: 'Medina',    dorsal: 13, equipo: 'local',     equipoId: 'eq-3', puntos: 15, faltas: 3, rebotes: 2,  asistencias: 2,  minutosJugados: 30 },
  { jugadorId: 'j-18', partidoId: 'p-002', nombre: 'Germán',    apellido: 'Suárez',    dorsal: 17, equipo: 'local',     equipoId: 'eq-3', puntos: 20, faltas: 1, rebotes: 6,  asistencias: 2,  minutosJugados: 34 },
  { jugadorId: 'j-19', partidoId: 'p-002', nombre: 'Cristian',  apellido: 'Vargas',    dorsal: 22, equipo: 'local',     equipoId: 'eq-3', puntos: 8,  faltas: 4, rebotes: 9,  asistencias: 0,  minutosJugados: 24 },
  { jugadorId: 'j-20', partidoId: 'p-002', nombre: 'Andrés',    apellido: 'Delgado',   dorsal: 30, equipo: 'local',     equipoId: 'eq-3', puntos: 4,  faltas: 5, rebotes: 7,  asistencias: 1,  minutosJugados: 18 },

  { jugadorId: 'j-21', partidoId: 'p-002', nombre: 'Fernando',  apellido: 'Navarro',   dorsal: 2,  equipo: 'visitante', equipoId: 'eq-4', puntos: 16, faltas: 1, rebotes: 2,  asistencias: 9,  minutosJugados: 36 },
  { jugadorId: 'j-22', partidoId: 'p-002', nombre: 'Maximiliano',apellido: 'Cruz',     dorsal: 12, equipo: 'visitante', equipoId: 'eq-4', puntos: 22, faltas: 2, rebotes: 4,  asistencias: 3,  minutosJugados: 33 },
  { jugadorId: 'j-23', partidoId: 'p-002', nombre: 'Ramiro',    apellido: 'Ortega',    dorsal: 18, equipo: 'visitante', equipoId: 'eq-4', puntos: 18, faltas: 3, rebotes: 7,  asistencias: 1,  minutosJugados: 30 },
  { jugadorId: 'j-24', partidoId: 'p-002', nombre: 'Santiago',  apellido: 'Reyes',     dorsal: 25, equipo: 'visitante', equipoId: 'eq-4', puntos: 10, faltas: 4, rebotes: 12, asistencias: 0,  minutosJugados: 28 },
  { jugadorId: 'j-25', partidoId: 'p-002', nombre: 'Héctor',    apellido: 'Campos',    dorsal: 33, equipo: 'visitante', equipoId: 'eq-4', puntos: 4,  faltas: 2, rebotes: 8,  asistencias: 0,  minutosJugados: 20 },
]
