import { z } from 'zod'

/**
 * Schema base para División (incluye todos los campos)
 */
export const DivisionSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  torneoId: z.string().min(1, 'TorneoID requerido'),
  nombre: z.string().min(1, 'Nombre requerido').max(100),
  estado: z.enum(['activa', 'finalizada']).default('activa'),
  cantidadEquipos: z.number().int().min(0, 'No puede ser negativo').default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

/**
 * Schema para crear una nueva división
 * Excluye campos generados por el servidor (id, timestamps)
 */
export const DivisionCreateSchema = DivisionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * Schema para actualizar una división
 * Todos los campos son opcionales
 */
export const DivisionUpdateSchema = DivisionCreateSchema.partial()
