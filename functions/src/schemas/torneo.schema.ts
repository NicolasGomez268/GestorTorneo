import { z } from 'zod'

/**
 * Schema base para Torneo (incluye todos los campos)
 */
export const TorneoSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  idOrganizacion: z.string().min(1, 'Organización requerida'),
  claveCompetencia: z
    .string()
    .min(1, 'Clave competencia requerida')
    .max(80, 'Clave competencia demasiado larga'),
  nombre: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  deporte: z.string().default('Básquet'),
  temporada: z.string().min(4, 'Temporada inválida').max(10),
  estado: z.enum(['activo', 'finalizado', 'proximo']).default('activo'),
  descripcion: z.string().min(1, 'Descripción requerida').max(500),
  logoUrl: z.string().url().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

/**
 * Schema para crear un nuevo torneo
 * Excluye campos generados por el servidor (id, timestamps)
 */
export const TorneoCreateSchema = TorneoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * Schema para actualizar un torneo (no se mueve de organización ni se cambia clave de familia por aquí).
 */
export const TorneoUpdateSchema = TorneoCreateSchema.omit({
  idOrganizacion: true,
  claveCompetencia: true,
}).partial()

/**
 * Schema para cambiar únicamente el estado de un torneo
 */
export const TorneoEstadoSchema = z.object({
  estado: z.enum(['activo', 'finalizado', 'proximo']),
})

/** Cuerpo de alta desde panel organizador (sin idOrganización ni clave; el backend las resuelve). */
export const TorneoAltaOrganizadorSchema = z.object({
  nombre: z.string().min(1).max(100),
  deporte: z.string().default('Básquet'),
  temporada: z.string().min(4).max(10),
  estado: z.enum(['activo', 'finalizado', 'proximo']).default('activo'),
  descripcion: z.string().min(1).max(500),
  logoUrl: z.string().url().optional(),
  /** Si viene, se reutiliza la misma claveCompetencia del torneo origen (misma competencia, nueva temporada). */
  torneoIdOrigen: z.string().min(1).optional(),
})
