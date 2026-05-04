/**
 * Error personalizado para validación
 * Se lanza cuando los datos no cumplen con los esquemas Zod
 */
export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, unknown>) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Error personalizado para recursos no encontrados
 * Se lanza cuando se intenta acceder a un recurso que no existe
 */
export class NotFoundError extends Error {
  constructor(message: string, public resource?: string) {
    super(message)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Error personalizado para autorización fallida
 * Se lanza cuando el usuario no tiene permisos para ejecutar una acción
 */
export class UnauthorizedError extends Error {
  constructor(message = 'Usuario no autorizado') {
    super(message)
    this.name = 'UnauthorizedError'
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

/**
 * Error personalizado para conflictos
 * Se lanza cuando hay duplicados u otros conflictos de integridad
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

type ZodIssue = {
  path: Array<string | number>
  message: string
}

type ZodErrorLike = {
  name: 'ZodError'
  errors: ZodIssue[]
}

const isZodError = (error: unknown): error is ZodErrorLike => {
  if (!error || typeof error !== 'object') return false
  const maybe = error as { name?: unknown; errors?: unknown }
  if (maybe.name !== 'ZodError') return false
  return Array.isArray(maybe.errors)
}

/**
 * Función helper para convertir errores de Zod a ValidationError
 * Extrae los detalles del error y los estructura de forma legible
 */
export const handleZodError = (error: unknown): ValidationError => {
  if (isZodError(error)) {
    const details = error.errors.reduce((acc: Record<string, unknown>, err) => {
      const path = err.path.join('.')
      acc[path] = err.message
      return acc
    }, {})
    return new ValidationError('Validación fallida', details)
  }
  return new ValidationError('Error desconocido')
}
