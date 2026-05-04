import { adminMvp } from './admin-mvp'
import { useAuthStore } from '../../stores/authStore'

/** Payload enviado a `torneoListarConDivisiones` (organizador: objeto vacío, token define org). */
export async function fetchTorneosYDivisionesRaw(
  idOrganizacionParam?: string
): Promise<{ torneos: unknown[]; divisiones: unknown[] }> {
  const { rol, idOrganizacion: claimOrg } = useAuthStore.getState()
  const org =
    idOrganizacionParam ?? (rol === 'organizador' ? claimOrg ?? undefined : undefined)
  if (rol === 'superadmin' && !org) {
    return { torneos: [], divisiones: [] }
  }
  const datos = org ? { idOrganizacion: org } : {}
  return adminMvp<{ torneos: unknown[]; divisiones: unknown[] }>(
    'torneoListarConDivisiones',
    datos
  )
}
