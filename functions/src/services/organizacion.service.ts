import {
  validateOrganizacionCreate,
  validateOrganizacionUpdate,
} from '../dtos/organizacion.dto'
import {
  NotFoundError,
  ValidationError,
  handleZodError,
} from '../errores'
import { OrganizacionRepository } from '../repositories/organizacion.repository'

const ensureUpdatePayload = (payload: Record<string, unknown>): void => {
  if (Object.keys(payload).length === 0) {
    throw new ValidationError('Debe incluir al menos un campo para actualizar')
  }
}

export const OrganizacionService = {
  async create(input: unknown) {
    try {
      const dto = validateOrganizacionCreate(input)
      return await OrganizacionRepository.create(dto)
    } catch (e) {
      if (e instanceof ValidationError) throw e
      throw handleZodError(e)
    }
  },

  async get(id: string) {
    const o = await OrganizacionRepository.read(id)
    if (!o) throw new NotFoundError('Organización no encontrada', id)
    return o
  },

  async list() {
    return OrganizacionRepository.list()
  },

  async update(id: string, input: unknown) {
    try {
      const dto = validateOrganizacionUpdate(input)
      ensureUpdatePayload(dto as Record<string, unknown>)
      const u = await OrganizacionRepository.update(id, dto)
      if (!u) throw new NotFoundError('Organización no encontrada', id)
      return u
    } catch (e) {
      if (e instanceof ValidationError) throw e
      if (e instanceof NotFoundError) throw e
      throw handleZodError(e)
    }
  },
}
