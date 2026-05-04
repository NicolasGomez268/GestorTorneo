import { z } from 'zod'

import { TorneoAltaOrganizadorSchema } from './torneo.schema'

export const TorneoCrearSuperadminSchema = TorneoAltaOrganizadorSchema.extend({
  idOrganizacion: z.string().min(1),
})

export const UsuarioOrganizadorCrearSchema = z.object({
  idOrganizacion: z.string().min(1),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export const IdOrganizacionSchema = z.object({
  idOrganizacion: z.string().min(1),
})

export const IdTorneoSchema = z.object({
  idTorneo: z.string().min(1),
})

export const TorneoYDivisionSchema = z.object({
  idTorneo: z.string().min(1),
  idDivision: z.string().min(1),
})

export const TorneoListarPorClaveSchema = z.object({
  claveCompetencia: z.string().min(1).max(80),
})
