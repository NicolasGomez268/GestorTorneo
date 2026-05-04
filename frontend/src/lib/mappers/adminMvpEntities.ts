import type { Division, Torneo } from '../../data/tipos'

export const mapTorneo = (raw: unknown): Torneo => {
  const r = raw as Record<string, unknown>
  return {
    id: String(r.id),
    idOrganizacion: String(r.idOrganizacion ?? ''),
    claveCompetencia: String(r.claveCompetencia ?? ''),
    nombre: String(r.nombre ?? ''),
    deporte: String(r.deporte ?? 'Básquet'),
    temporada: String(r.temporada ?? ''),
    estado: r.estado as Torneo['estado'],
    descripcion: String(r.descripcion ?? ''),
    logoUrl: r.logoUrl ? String(r.logoUrl) : undefined,
  }
}

export const mapDivision = (raw: unknown): Division => {
  const r = raw as Record<string, unknown>
  return {
    id: String(r.id),
    torneoId: String(r.torneoId ?? ''),
    nombre: String(r.nombre ?? ''),
    estado: r.estado as Division['estado'],
    cantidadEquipos: Number(r.cantidadEquipos ?? 0),
  }
}
