import {
  validateDivisionCreate,
  validateDivisionUpdate,
} from '../dtos/division.dto'
import {
  NotFoundError,
  ValidationError,
  handleZodError,
} from '../errores'
import { DivisionRepository } from '../repositories/division.repository'
import { TorneoRepository } from '../repositories/torneo.repository'

const ensureUpdatePayload = (payload: Record<string, unknown>): void => {
  if (Object.keys(payload).length === 0) {
    throw new ValidationError('Debe incluir al menos un campo para actualizar')
  }
}

const asegurarTorneoEnOrganizacion = async (
  torneoId: string,
  idOrganizacion: string
): Promise<void> => {
  const torneo = await TorneoRepository.read(torneoId)
  if (!torneo) throw new NotFoundError('Torneo no encontrado', torneoId)
  if (torneo.idOrganizacion !== idOrganizacion) {
    throw new ValidationError('El torneo no pertenece a esta organización')
  }
}

export const DivisionService = {
  async create(idOrganizacion: string, input: unknown) {
    try {
      const dto = validateDivisionCreate(input)
      await asegurarTorneoEnOrganizacion(dto.torneoId, idOrganizacion)
      return await DivisionRepository.create(dto)
    } catch (error) {
      if (error instanceof ValidationError) throw error
      if (error instanceof NotFoundError) throw error
      throw handleZodError(error)
    }
  },

  async listByTorneo(idOrganizacion: string, torneoId: string) {
    await asegurarTorneoEnOrganizacion(torneoId, idOrganizacion)
    return DivisionRepository.listByTorneo(torneoId)
  },

  async update(idOrganizacion: string, torneoId: string, divisionId: string, input: unknown) {
    try {
      await asegurarTorneoEnOrganizacion(torneoId, idOrganizacion)
      const dto = validateDivisionUpdate(input)
      ensureUpdatePayload(dto as Record<string, unknown>)
      const updated = await DivisionRepository.update(torneoId, divisionId, dto)
      if (!updated) throw new NotFoundError('División no encontrada', divisionId)
      return updated
    } catch (error) {
      if (error instanceof ValidationError) throw error
      if (error instanceof NotFoundError) throw error
      throw handleZodError(error)
    }
  },

  async delete(idOrganizacion: string, torneoId: string, divisionId: string) {
    await asegurarTorneoEnOrganizacion(torneoId, idOrganizacion)
    const deleted = await DivisionRepository.delete(torneoId, divisionId)
    if (!deleted) throw new NotFoundError('División no encontrada', divisionId)
    return true
  },
}
