import { z } from 'zod'
import {
  DivisionCreateSchema,
  DivisionUpdateSchema,
} from '../schemas/division.schema'

/**
 * DTO para crear una división
 * Tipos inferidos directamente del schema Zod
 */
export type DivisionCreateDTO = z.infer<typeof DivisionCreateSchema>

/**
 * DTO para actualizar una división
 */
export type DivisionUpdateDTO = z.infer<typeof DivisionUpdateSchema>

/**
 * Valida y parsea datos de creación de división
 * Lanza ZodError si la validación falla
 */
export const validateDivisionCreate = (data: unknown): DivisionCreateDTO => {
  return DivisionCreateSchema.parse(data)
}

/**
 * Valida y parsea datos de actualización de división
 * Lanza ZodError si la validación falla
 */
export const validateDivisionUpdate = (data: unknown): DivisionUpdateDTO => {
  return DivisionUpdateSchema.parse(data)
}
