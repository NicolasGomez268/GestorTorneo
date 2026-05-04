import { HttpsError } from 'firebase-functions/v2/https'
import type { CallableRequest } from 'firebase-functions/v2/https'

export type RolMvp = 'superadmin' | 'organizador'

export type TokenClaims = {
  rol?: string
  idOrganizacion?: string
}

export const leerClaims = (request: CallableRequest): TokenClaims => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Tenés que iniciar sesión')
  }
  return request.auth.token as TokenClaims
}

export const exigirRol = (claims: TokenClaims, roles: RolMvp[]): void => {
  const rol = claims.rol as RolMvp | undefined
  if (!rol || !roles.includes(rol)) {
    throw new HttpsError('permission-denied', 'No tenés permiso para esta acción')
  }
}

export const idOrganizacionDelToken = (claims: TokenClaims): string => {
  const id = claims.idOrganizacion
  if (!id) {
    throw new HttpsError('failed-precondition', 'Cuenta organizador sin organización asignada')
  }
  return id
}
