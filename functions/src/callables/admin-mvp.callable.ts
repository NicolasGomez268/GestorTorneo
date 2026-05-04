import { getAuth } from 'firebase-admin/auth'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'

import {
  IdOrganizacionSchema,
  IdTorneoSchema,
  TorneoCrearSuperadminSchema,
  TorneoListarPorClaveSchema,
  TorneoYDivisionSchema,
  UsuarioOrganizadorCrearSchema,
} from '../schemas/admin-mvp.schema'
import {
  exigirRol,
  idOrganizacionDelToken,
  leerClaims,
} from '../helpers/callable-context'
import { mapDominioAHttps } from '../helpers/https-errors'
import { DivisionService } from '../services/division.service'
import { OrganizacionService } from '../services/organizacion.service'
import { TorneoService } from '../services/torneo.service'

const REGION = 'us-east5'

const Acciones = z.enum([
  'organizacionCrear',
  'organizacionListar',
  'organizacionObtener',
  'usuarioOrganizadorCrear',
  'torneoListar',
  'torneoListarConDivisiones',
  'torneoListarPorClaveCompetencia',
  'torneoObtener',
  'torneoCrear',
  'torneoActualizar',
  'torneoActualizarEstado',
  'torneoEliminar',
  'divisionListar',
  'divisionCrear',
  'divisionActualizar',
  'divisionEliminar',
])

const CuerpoRequest = z.object({
  accion: Acciones,
  datos: z.record(z.unknown()).optional().default({}),
})

const scopeOrganizacion = (
  claims: { rol?: string; idOrganizacion?: string },
  datosIdOrganizacion: string | undefined
): string => {
  if (claims.rol === 'superadmin') {
    if (!datosIdOrganizacion) {
      throw new HttpsError('invalid-argument', 'Falta idOrganizacion en datos')
    }
    return datosIdOrganizacion
  }
  return idOrganizacionDelToken(claims)
}

const sinOrganizacionEnDatos = (datos: Record<string, unknown>): Record<string, unknown> => {
  const rest = { ...datos }
  delete rest.idOrganizacion
  return rest
}

export const adminMvp = onCall({ region: REGION }, async (request) => {
  try {
    const claims = leerClaims(request)
    const body = CuerpoRequest.parse(request.data ?? {})
    const { accion, datos } = body
    const d = datos as Record<string, unknown>

    switch (accion) {
    case 'organizacionCrear': {
      exigirRol(claims, ['superadmin'])
      return await OrganizacionService.create(datos)
    }
    case 'organizacionListar': {
      exigirRol(claims, ['superadmin'])
      return await OrganizacionService.list()
    }
    case 'organizacionObtener': {
      const { idOrganizacion } = IdOrganizacionSchema.parse(datos)
      if (claims.rol === 'organizador') {
        if (idOrganizacionDelToken(claims) !== idOrganizacion) {
          throw new HttpsError('permission-denied', 'No podés ver esa organización')
        }
      } else {
        exigirRol(claims, ['superadmin'])
      }
      return await OrganizacionService.get(idOrganizacion)
    }
    case 'usuarioOrganizadorCrear': {
      exigirRol(claims, ['superadmin'])
      const parsed = UsuarioOrganizadorCrearSchema.parse(datos)
      await OrganizacionService.get(parsed.idOrganizacion)
      const auth = getAuth()
      const user = await auth.createUser({
        email: parsed.email,
        password: parsed.password,
      })
      await auth.setCustomUserClaims(user.uid, {
        rol: 'organizador',
        idOrganizacion: parsed.idOrganizacion,
      })
      return { uid: user.uid, email: user.email }
    }
    case 'torneoListar': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const idOrg =
          claims.rol === 'superadmin' ?
            IdOrganizacionSchema.parse(datos).idOrganizacion :
            idOrganizacionDelToken(claims)
      return await TorneoService.listPorOrganizacion(idOrg)
    }
    case 'torneoListarConDivisiones': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const idOrgListDiv =
          claims.rol === 'superadmin' ?
            IdOrganizacionSchema.parse(datos).idOrganizacion :
            idOrganizacionDelToken(claims)
      return await TorneoService.listTorneosWithDivisionesByOrganizacion(idOrgListDiv)
    }
    case 'torneoListarPorClaveCompetencia': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const { claveCompetencia } = TorneoListarPorClaveSchema.parse(datos)
      const idOrg =
          claims.rol === 'superadmin' ?
            IdOrganizacionSchema.parse(datos).idOrganizacion :
            idOrganizacionDelToken(claims)
      return await TorneoService.listTemporadasMismaCompetencia(idOrg, claveCompetencia)
    }
    case 'torneoObtener': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const { idTorneo } = IdTorneoSchema.parse(datos)
      const scope = claims.rol === 'superadmin' ? null : idOrganizacionDelToken(claims)
      return await TorneoService.getEnOrganizacion(idTorneo, scope)
    }
    case 'torneoCrear': {
      exigirRol(claims, ['superadmin', 'organizador'])
      if (claims.rol === 'superadmin') {
        const full = TorneoCrearSuperadminSchema.parse(datos)
        const { idOrganizacion, ...rest } = full
        return await TorneoService.createEnOrganizacion(idOrganizacion, rest)
      }
      return await TorneoService.createEnOrganizacion(
        idOrganizacionDelToken(claims),
        datos
      )
    }
    case 'torneoActualizar': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const { idTorneo } = IdTorneoSchema.parse(datos)
      const idOrg = scopeOrganizacion(
        claims,
        typeof d.idOrganizacion === 'string' ? d.idOrganizacion : undefined
      )
      const patch = sinOrganizacionEnDatos(d)
      delete patch.idTorneo
      return await TorneoService.updateEnOrganizacion(idOrg, idTorneo, patch)
    }
    case 'torneoActualizarEstado': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const { idTorneo } = IdTorneoSchema.parse(datos)
      const idOrg = scopeOrganizacion(
        claims,
        typeof d.idOrganizacion === 'string' ? d.idOrganizacion : undefined
      )
      const estadoRest = { ...d }
      delete estadoRest.idTorneo
      delete estadoRest.idOrganizacion
      return await TorneoService.updateEstadoEnOrganizacion(idOrg, idTorneo, estadoRest)
    }
    case 'torneoEliminar': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const { idTorneo } = IdTorneoSchema.parse(datos)
      const idOrg = scopeOrganizacion(
        claims,
        typeof d.idOrganizacion === 'string' ? d.idOrganizacion : undefined
      )
      return await TorneoService.deleteEnOrganizacion(idOrg, idTorneo)
    }
    case 'divisionListar': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const { idTorneo } = IdTorneoSchema.parse(datos)
      const idOrg = scopeOrganizacion(
        claims,
        typeof d.idOrganizacion === 'string' ? d.idOrganizacion : undefined
      )
      return await DivisionService.listByTorneo(idOrg, idTorneo)
    }
    case 'divisionCrear': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const idOrg = scopeOrganizacion(
        claims,
        typeof d.idOrganizacion === 'string' ? d.idOrganizacion : undefined
      )
      return await DivisionService.create(idOrg, sinOrganizacionEnDatos(d))
    }
    case 'divisionActualizar': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const { idTorneo, idDivision } = TorneoYDivisionSchema.parse(datos)
      const idOrg = scopeOrganizacion(
        claims,
        typeof d.idOrganizacion === 'string' ? d.idOrganizacion : undefined
      )
      const payload = sinOrganizacionEnDatos(d)
      delete payload.idTorneo
      delete payload.idDivision
      return await DivisionService.update(idOrg, idTorneo, idDivision, payload)
    }
    case 'divisionEliminar': {
      exigirRol(claims, ['superadmin', 'organizador'])
      const { idTorneo, idDivision } = TorneoYDivisionSchema.parse(datos)
      const idOrg = scopeOrganizacion(
        claims,
        typeof d.idOrganizacion === 'string' ? d.idOrganizacion : undefined
      )
      return await DivisionService.delete(idOrg, idTorneo, idDivision)
    }
    default: {
      throw new HttpsError('invalid-argument', 'Acción no reconocida')
    }
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new HttpsError('invalid-argument', e.errors.map((x) => x.message).join('; '))
    }
    return mapDominioAHttps(e)
  }
})
