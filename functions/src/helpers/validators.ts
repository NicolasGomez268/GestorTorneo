/**
 * Validadores genéricos reutilizables
 * Funciones puras para validaciones comunes
 */

/**
 * Valida que un UUID sea válido (formato v4)
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Valida que una string sea un email válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida que una string no esté vacía tras trimming
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0
}

/**
 * Valida que un número esté dentro de un rango
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * Valida que una string tenga una longitud mínima
 */
export const hasMinLength = (value: string, min: number): boolean => {
  return value.length >= min
}

/**
 * Valida que una string tenga una longitud máxima
 */
export const hasMaxLength = (value: string, max: number): boolean => {
  return value.length <= max
}
