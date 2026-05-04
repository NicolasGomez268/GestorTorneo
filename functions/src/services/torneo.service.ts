import {
  validateTorneoAltaOrganizador,
  validateTorneoCreate,
  validateTorneoEstado,
  validateTorneoUpdate,
} from '../dtos/torneo.dto'
import { generarClaveCompetencia } from '../helpers/slug'
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  handleZodError,
} from '../errores'
import type { Division } from '../models/division.model'
import type { Torneo } from '../models/torneo.model'
import { DivisionRepository } from '../repositories/division.repository'
import { OrganizacionRepository } from '../repositories/organizacion.repository'
import { TorneoRepository } from '../repositories/torneo.repository'

const ensureUpdatePayload = (payload: Record<string, unknown>): void => {
  if (Object.keys(payload).length === 0) {
    throw new ValidationError('Debe incluir al menos un campo para actualizar')
  }
}

const asegurarOrganizacionExiste = async (idOrganizacion: string): Promise<void> => {
  const org = await OrganizacionRepository.read(idOrganizacion)
  if (!org) throw new NotFoundError('Organización no encontrada', idOrganizacion)
}

const asegurarTorneoEnOrganizacion = async (
  idTorneo: string,
  idOrganizacion: string
): Promise<void> => {
  const t = await TorneoRepository.read(idTorneo)
  if (!t) throw new NotFoundError('Torneo no encontrado', idTorneo)
  if (t.idOrganizacion !== idOrganizacion) {
    throw new ValidationError('El torneo no pertenece a esta organización')
  }
}

export const TorneoService = {
  /**
   * Alta de temporada: resuelve claveCompetencia (nueva o heredada de torneoIdOrigen).
   */
  async createEnOrganizacion(idOrganizacion: string, input: unknown) {
    try {
      await asegurarOrganizacionExiste(idOrganizacion)
      const dto = validateTorneoAltaOrganizador(input)
      const { torneoIdOrigen, ...campos } = dto

      let claveCompetencia: string
      if (torneoIdOrigen) {
        const prev = await TorneoRepository.read(torneoIdOrigen)
        if (!prev) throw new NotFoundError('Torneo origen no encontrado', torneoIdOrigen)
        if (prev.idOrganizacion !== idOrganizacion) {
          throw new ValidationError('El torneo origen no pertenece a esta organización')
        }
        claveCompetencia = prev.claveCompetencia
      } else {
        claveCompetencia = generarClaveCompetencia(campos.nombre)
      }

      const createDto = validateTorneoCreate({
        ...campos,
        idOrganizacion,
        claveCompetencia,
      })
      return await TorneoRepository.create(createDto)
    } catch (error) {
      if (error instanceof ValidationError) throw error
      if (error instanceof NotFoundError) throw error
      if (error instanceof ConflictError) throw error
      throw handleZodError(error)
    }
  },

  async getEnOrganizacion(idTorneo: string, idOrganizacion: string | null) {
    const torneo = await TorneoRepository.read(idTorneo)
    if (!torneo) throw new NotFoundError('Torneo no encontrado', idTorneo)
    if (idOrganizacion !== null && torneo.idOrganizacion !== idOrganizacion) {
      throw new NotFoundError('Torneo no encontrado', idTorneo)
    }
    return torneo
  },

  async listPorOrganizacion(idOrganizacion: string) {
    await asegurarOrganizacionExiste(idOrganizacion)
    return TorneoRepository.listByOrganizacion(idOrganizacion)
  },

  /**
   * Torneos de la org + divisiones. Los `torneoId` salen de `listByOrganizacion` (misma org);
   * se listan divisiones vía repositorio sin releer cada doc torneo (evita N lecturas redundantes).
   */
  async listTorneosWithDivisionesByOrganizacion(idOrganizacion: string): Promise<{
    torneos: Torneo[]
    divisiones: Division[]
  }> {
    await asegurarOrganizacionExiste(idOrganizacion)
    const torneos = await TorneoRepository.listByOrganizacion(idOrganizacion)
    const divisionesNested = await Promise.all(
      torneos.map(async (t) => {
        const divs = await DivisionRepository.listByTorneo(t.id)
        return divs.map((d) => ({
          ...d,
          torneoId: d.torneoId || t.id,
        }))
      })
    )
    return { torneos, divisiones: divisionesNested.flat() }
  },

  async listTemporadasMismaCompetencia(idOrganizacion: string, claveCompetencia: string) {
    await asegurarOrganizacionExiste(idOrganizacion)
    return TorneoRepository.listByOrganizacionYClave(idOrganizacion, claveCompetencia)
  },

  async updateEnOrganizacion(idOrganizacion: string, idTorneo: string, input: unknown) {
    try {
      await asegurarTorneoEnOrganizacion(idTorneo, idOrganizacion)
      const dto = validateTorneoUpdate(input)
      ensureUpdatePayload(dto as Record<string, unknown>)
      const updated = await TorneoRepository.update(idTorneo, dto)
      if (!updated) throw new NotFoundError('Torneo no encontrado', idTorneo)
      return updated
    } catch (error) {
      if (error instanceof ValidationError) throw error
      if (error instanceof NotFoundError) throw error
      throw handleZodError(error)
    }
  },

  async updateEstadoEnOrganizacion(idOrganizacion: string, idTorneo: string, input: unknown) {
    try {
      await asegurarTorneoEnOrganizacion(idTorneo, idOrganizacion)
      const dto = validateTorneoEstado(input)
      const updated = await TorneoRepository.update(idTorneo, dto)
      if (!updated) throw new NotFoundError('Torneo no encontrado', idTorneo)
      return updated
    } catch (error) {
      if (error instanceof ValidationError) throw error
      if (error instanceof NotFoundError) throw error
      throw handleZodError(error)
    }
  },

  async deleteEnOrganizacion(idOrganizacion: string, idTorneo: string) {
    await asegurarTorneoEnOrganizacion(idTorneo, idOrganizacion)
    const deleted = await TorneoRepository.delete(idTorneo)
    if (!deleted) throw new NotFoundError('Torneo no encontrado', idTorneo)
    return true
  },
}
