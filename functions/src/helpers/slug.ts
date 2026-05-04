/**
 * Normaliza texto a fragmento URL-seguro (minúsculas, guiones).
 */
export const slugify = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'torneo'
}

const randomSuffix = (): string => Math.random().toString(36).slice(2, 8)

export const generarClaveCompetencia = (nombre: string): string => {
  return `${slugify(nombre)}-${randomSuffix()}`
}
