/**
 * Funciones auxiliares para manejo de fechas
 * Utilidades puras y reutilizables
 */

/**
 * Retorna la fecha y hora actual
 */
export const getNow = (): Date => {
  return new Date()
}

/**
 * Formatea una fecha al formato ISO 8601
 */
export const formatDateISO = (date: Date): string => {
  return date.toISOString()
}

/**
 * Formatea una fecha en formato local legible
 */
export const formatDateLocal = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Obtiene el nombre del día de la semana en español
 */
export const getDayName = (date: Date): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[date.getDay()]
}

/**
 * Suma días a una fecha
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const getDaysDifference = (startDate: Date, endDate: Date): number => {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay)
}
