import { z } from 'zod'
import {
  TorneoAltaOrganizadorSchema,
  TorneoCreateSchema,
  TorneoUpdateSchema,
  TorneoEstadoSchema,
} from '../schemas/torneo.schema'

/**
 * DTO para crear un torneo
 * Tipos inferidos directamente del schema Zod
 */
export type TorneoCreateDTO = z.infer<typeof TorneoCreateSchema>

/**
 * DTO para actualizar un torneo
 */
export type TorneoUpdateDTO = z.infer<typeof TorneoUpdateSchema>

/**
 * DTO para cambiar estado del torneo
 */
export type TorneoEstadoDTO = z.infer<typeof TorneoEstadoSchema>

export type TorneoAltaOrganizadorDTO = z.infer<typeof TorneoAltaOrganizadorSchema>

/**
 * Valida y parsea datos de creación de torneo
 * Lanza ZodError si la validación falla
 */
export const validateTorneoCreate = (data: unknown): TorneoCreateDTO => {
  return TorneoCreateSchema.parse(data)
}

/**
 * Valida y parsea datos de actualización de torneo
 * Lanza ZodError si la validación falla
 */
export const validateTorneoUpdate = (data: unknown): TorneoUpdateDTO => {
  return TorneoUpdateSchema.parse(data)
}

/**
 * Valida y parsea datos de cambio de estado
 * Lanza ZodError si la validación falla
 */
export const validateTorneoEstado = (data: unknown): TorneoEstadoDTO => {
  return TorneoEstadoSchema.parse(data)
}

export const validateTorneoAltaOrganizador = (data: unknown): TorneoAltaOrganizadorDTO => {
  return TorneoAltaOrganizadorSchema.parse(data)
}
