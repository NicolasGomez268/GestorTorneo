/**
 * Modelo de dominio: Torneo
 * Representa un torneo dentro del sistema
 */
export interface Torneo {
  id: string
  /** Cliente / club propietario del torneo */
  idOrganizacion: string
  /** Agrupa temporadas de la misma competencia (generada o continuada desde torneo anterior) */
  claveCompetencia: string
  nombre: string
  deporte: string
  temporada: string
  estado: 'activo' | 'finalizado' | 'proximo'
  descripcion: string
  logoUrl?: string
  createdAt?: Date
  updatedAt?: Date
}
