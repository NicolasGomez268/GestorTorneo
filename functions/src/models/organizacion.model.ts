/**
 * Cliente / club (tenant) dentro del SaaS.
 */
export interface Organizacion {
  id: string
  nombre: string
  estado: 'activa' | 'suspendida'
  createdAt?: Date
  updatedAt?: Date
}
