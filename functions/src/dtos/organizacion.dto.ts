import { z } from 'zod'
import {
  OrganizacionCreateSchema,
  OrganizacionUpdateSchema,
} from '../schemas/organizacion.schema'

export type OrganizacionCreateDTO = z.infer<typeof OrganizacionCreateSchema>
export type OrganizacionUpdateDTO = z.infer<typeof OrganizacionUpdateSchema>

export const validateOrganizacionCreate = (data: unknown): OrganizacionCreateDTO => {
  return OrganizacionCreateSchema.parse(data)
}

export const validateOrganizacionUpdate = (data: unknown): OrganizacionUpdateDTO => {
  return OrganizacionUpdateSchema.parse(data)
}
