import type { Partido } from './tipos'

export const partidos: Partido[] = [
  // División A — Fecha 1
  {
    id: 'p-001', divisionId: 'div-a', fechaNumero: 1,
    fechaHora: '2024-08-02T21:00:00',
    local:     { equipoId: 'eq-1', nombre: 'Shadow Titans', color: '#FF6B00' },
    visitante: { equipoId: 'eq-2', nombre: 'Neon Drifters',  color: '#00BFFF' },
    estado: 'jugado',
    resultado: { ptsLocal: 88, ptsVisitante: 72, ganadorId: 'eq-1' },
    fase: 'regular', ronda: null,
  },
  {
    id: 'p-002', divisionId: 'div-a', fechaNumero: 1,
    fechaHora: '2024-08-02T22:30:00',
    local:     { equipoId: 'eq-3', nombre: 'Apex Raptors', color: '#9B59B6' },
    visitante: { equipoId: 'eq-4', nombre: 'Iron Hawks',   color: '#E74C3C' },
    estado: 'jugado',
    resultado: { ptsLocal: 65, ptsVisitante: 70, ganadorId: 'eq-4' },
    fase: 'regular', ronda: null,
  },
  {
    id: 'p-003', divisionId: 'div-a', fechaNumero: 1,
    fechaHora: '2024-08-03T20:00:00',
    local:     { equipoId: 'eq-5', nombre: 'Cobalt Kings', color: '#1ABC9C' },
    visitante: { equipoId: 'eq-6', nombre: 'Storm Wolves', color: '#F39C12' },
    estado: 'jugado',
    resultado: { ptsLocal: 55, ptsVisitante: 48, ganadorId: 'eq-5' },
    fase: 'regular', ronda: null,
  },

  // División A — Fecha 2
  {
    id: 'p-004', divisionId: 'div-a', fechaNumero: 2,
    fechaHora: '2024-08-09T21:00:00',
    local:     { equipoId: 'eq-2', nombre: 'Neon Drifters',  color: '#00BFFF' },
    visitante: { equipoId: 'eq-3', nombre: 'Apex Raptors',   color: '#9B59B6' },
    estado: 'jugado',
    resultado: { ptsLocal: 78, ptsVisitante: 62, ganadorId: 'eq-2' },
    fase: 'regular', ronda: null,
  },
  {
    id: 'p-005', divisionId: 'div-a', fechaNumero: 2,
    fechaHora: '2024-08-09T22:30:00',
    local:     { equipoId: 'eq-1', nombre: 'Shadow Titans', color: '#FF6B00' },
    visitante: { equipoId: 'eq-5', nombre: 'Cobalt Kings',  color: '#1ABC9C' },
    estado: 'jugado',
    resultado: { ptsLocal: 92, ptsVisitante: 60, ganadorId: 'eq-1' },
    fase: 'regular', ronda: null,
  },
  {
    id: 'p-006', divisionId: 'div-a', fechaNumero: 2,
    fechaHora: '2024-08-10T20:00:00',
    local:     { equipoId: 'eq-4', nombre: 'Iron Hawks',   color: '#E74C3C' },
    visitante: { equipoId: 'eq-6', nombre: 'Storm Wolves', color: '#F39C12' },
    estado: 'jugado',
    resultado: { ptsLocal: 74, ptsVisitante: 58, ganadorId: 'eq-4' },
    fase: 'regular', ronda: null,
  },

  // División A — Fecha 3 (pendientes)
  {
    id: 'p-007', divisionId: 'div-a', fechaNumero: 3,
    fechaHora: '2024-08-16T21:00:00',
    local:     { equipoId: 'eq-1', nombre: 'Shadow Titans', color: '#FF6B00' },
    visitante: { equipoId: 'eq-4', nombre: 'Iron Hawks',    color: '#E74C3C' },
    estado: 'pendiente', fase: 'regular', ronda: null,
  },
  {
    id: 'p-008', divisionId: 'div-a', fechaNumero: 3,
    fechaHora: '2024-08-16T22:30:00',
    local:     { equipoId: 'eq-2', nombre: 'Neon Drifters', color: '#00BFFF' },
    visitante: { equipoId: 'eq-5', nombre: 'Cobalt Kings',  color: '#1ABC9C' },
    estado: 'pendiente', fase: 'regular', ronda: null,
  },
  {
    id: 'p-009', divisionId: 'div-a', fechaNumero: 3,
    fechaHora: '2024-08-17T20:00:00',
    local:     { equipoId: 'eq-3', nombre: 'Apex Raptors', color: '#9B59B6' },
    visitante: { equipoId: 'eq-6', nombre: 'Storm Wolves', color: '#F39C12' },
    estado: 'pendiente', fase: 'regular', ronda: null,
  },

  // División A — Play-off
  {
    id: 'p-sf1', divisionId: 'div-a', fechaNumero: 99,
    fechaHora: '2024-09-06T21:00:00',
    local:     { equipoId: 'eq-1', nombre: 'Shadow Titans', color: '#FF6B00' },
    visitante: { equipoId: 'eq-3', nombre: 'Apex Raptors',  color: '#9B59B6' },
    estado: 'jugado',
    resultado: { ptsLocal: 80, ptsVisitante: 65, ganadorId: 'eq-1' },
    fase: 'playoff', ronda: 'semifinal',
  },
  {
    id: 'p-sf2', divisionId: 'div-a', fechaNumero: 99,
    fechaHora: '2024-09-06T22:30:00',
    local:     { equipoId: 'eq-2', nombre: 'Neon Drifters', color: '#00BFFF' },
    visitante: { equipoId: 'eq-4', nombre: 'Iron Hawks',    color: '#E74C3C' },
    estado: 'jugado',
    resultado: { ptsLocal: 73, ptsVisitante: 69, ganadorId: 'eq-2' },
    fase: 'playoff', ronda: 'semifinal',
  },
  {
    id: 'p-final', divisionId: 'div-a', fechaNumero: 99,
    fechaHora: '2024-09-13T21:00:00',
    local:     { equipoId: 'eq-1', nombre: 'Shadow Titans', color: '#FF6B00' },
    visitante: { equipoId: 'eq-2', nombre: 'Neon Drifters', color: '#00BFFF' },
    estado: 'pendiente', fase: 'playoff', ronda: 'final',
  },
]
