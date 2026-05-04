/**
 * Modelo de dominio: División
 * Representa una división dentro de un torneo
 */
export interface Division {
  id: string
  torneoId: string
  nombre: string
  estado: 'activa' | 'finalizada'
  cantidadEquipos: number
  createdAt?: Date
  updatedAt?: Date
}
