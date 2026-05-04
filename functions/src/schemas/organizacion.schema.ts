import { z } from 'zod'

export const OrganizacionSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1, 'Nombre requerido').max(120),
  estado: z.enum(['activa', 'suspendida']).default('activa'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const OrganizacionCreateSchema = OrganizacionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const OrganizacionUpdateSchema = OrganizacionCreateSchema.partial()
