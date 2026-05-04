import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Torneo, Division, Organizacion } from '../../data/tipos'
import { fetchTorneosYDivisionesRaw } from '../../lib/api/fetchTorneosDivisionesAdmin'
import { mapDivision, mapTorneo } from '../../lib/mappers/adminMvpEntities'
import { QK_ADMIN_TORNEOS_DIV } from '../../lib/queryClient'
import { listarOrganizaciones, useAdminStore } from '../../stores/adminStore'
import { useAuthStore } from '../../stores/authStore'

type EstadoTorneo = Torneo['estado']

export default function V7_Torneo() {
  const navigate = useNavigate()
  const rol = useAuthStore((s) => s.rol)
  const {
    torneos: torneosList,
    divisiones: divsList,
    addTorneo,
    removeTorneo,
    updateTorneo,
    updateTorneoEstado,
    addDivision,
    removeDivision,
    updateDivision,
  } = useAdminStore()

  const [orgSuperadmin, setOrgSuperadmin] = useState<string>('')
  const [orgsOpciones, setOrgsOpciones] = useState<Organizacion[]>([])

  const idOrgActiva = rol === 'superadmin' ? orgSuperadmin : undefined
  const orgListadoKey =
    rol === 'superadmin' ? (orgSuperadmin || '__pending__') : '__organizador__'

  useEffect(() => {
    if (rol !== 'superadmin') return
    let ok = true
    ;(async () => {
      try {
        const list = await listarOrganizaciones()
        if (!ok) return
        setOrgsOpciones(list)
        setOrgSuperadmin((prev) => prev || (list[0]?.id ?? ''))
      } catch {
        setOrgsOpciones([])
      }
    })()
    return () => {
      ok = false
    }
  }, [rol])

  useEffect(() => {
    if (rol === 'superadmin' && !orgSuperadmin) {
      useAdminStore.setState({ torneos: [], divisiones: [] })
    }
  }, [rol, orgSuperadmin])

  const {
    data: torneosDivData,
    isFetching: cargando,
    isError: torneosQueryErrorFlag,
    error: torneosQueryError,
  } = useQuery({
    queryKey: [...QK_ADMIN_TORNEOS_DIV, rol, orgListadoKey],
    queryFn: async () => {
      const raw = await fetchTorneosYDivisionesRaw(
        rol === 'superadmin' ? orgSuperadmin || undefined : undefined
      )
      return {
        torneos: raw.torneos.map(mapTorneo),
        divisiones: raw.divisiones.map(mapDivision),
      }
    },
    enabled: rol === 'organizador' || (rol === 'superadmin' && !!orgSuperadmin),
  })

  useEffect(() => {
    if (torneosDivData) {
      useAdminStore.setState({
        torneos: torneosDivData.torneos,
        divisiones: torneosDivData.divisiones,
      })
    }
  }, [torneosDivData])

  const errorApi = torneosQueryErrorFlag ?
    (torneosQueryError instanceof Error ? torneosQueryError.message : 'Error al cargar datos') :
    null

  const [torneoActivo, setTorneoActivo] = useState<string>('')

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!torneosList.length) {
        setTorneoActivo('')
        return
      }
      setTorneoActivo((prev) =>
        prev && torneosList.some((t) => t.id === prev) ? prev : torneosList[0].id
      )
    }, 0)
    return () => clearTimeout(t)
  }, [torneosList])

  const [formTorneo, setFormTorneo] = useState({
    nombre: '',
    deporte: 'Básquet',
    temporada: '',
    descripcion: '',
    torneoIdOrigen: '',
  })
  const [errTorneo, setErrTorneo] = useState('')
  const [okTorneo, setOkTorneo] = useState(false)

  const [editTorneoId, setEditTorneoId] = useState<string | null>(null)
  const [formEditTorneo, setFormEditTorneo] = useState({
    nombre: '',
    deporte: '',
    temporada: '',
    descripcion: '',
  })

  const [formDiv, setFormDiv] = useState({ nombre: '' })
  const [errDiv, setErrDiv] = useState('')
  const [okDiv, setOkDiv] = useState(false)

  const [editDivId, setEditDivId] = useState<string | null>(null)
  const [formEditDiv, setFormEditDiv] = useState({ nombre: '' })

  const divsDeTorneo = divsList.filter((d) => d.torneoId === torneoActivo)

  const handleCrearTorneo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTorneo.nombre.trim()) {
      setErrTorneo('El nombre es obligatorio')
      return
    }
    if (!formTorneo.temporada.trim()) {
      setErrTorneo('La temporada es obligatoria')
      return
    }
    if (!formTorneo.descripcion.trim()) {
      setErrTorneo('La descripción es obligatoria (mínimo 1 carácter)')
      return
    }
    if (rol === 'superadmin' && !orgSuperadmin) {
      setErrTorneo('Seleccioná una organización')
      return
    }
    setErrTorneo('')
    try {
      const payload: Parameters<typeof addTorneo>[0] = {
        nombre: formTorneo.nombre.trim(),
        deporte: formTorneo.deporte,
        temporada: formTorneo.temporada.trim(),
        descripcion: formTorneo.descripcion.trim(),
      }
      if (formTorneo.torneoIdOrigen.trim()) {
        payload.torneoIdOrigen = formTorneo.torneoIdOrigen.trim()
      }
      const nuevo = await addTorneo(payload, idOrgActiva)
      setTorneoActivo(nuevo.id)
      setFormTorneo({
        nombre: '',
        deporte: 'Básquet',
        temporada: '',
        descripcion: '',
        torneoIdOrigen: '',
      })
      setOkTorneo(true)
      setTimeout(() => setOkTorneo(false), 2000)
    } catch (err) {
      setErrTorneo(err instanceof Error ? err.message : 'No se pudo crear el torneo')
    }
  }

  const handleIniciarEditTorneo = (t: Torneo) => {
    setEditTorneoId(t.id)
    setFormEditTorneo({
      nombre: t.nombre,
      deporte: t.deporte,
      temporada: t.temporada,
      descripcion: t.descripcion,
    })
  }

  const handleGuardarEditTorneo = async (id: string) => {
    if (!formEditTorneo.nombre.trim()) return
    if (!formEditTorneo.temporada.trim()) return
    if (!formEditTorneo.descripcion.trim()) return
    try {
      await updateTorneo(
        id,
        {
          nombre: formEditTorneo.nombre.trim(),
          deporte: formEditTorneo.deporte.trim(),
          temporada: formEditTorneo.temporada.trim(),
          descripcion: formEditTorneo.descripcion.trim(),
        },
        idOrgActiva
      )
      setEditTorneoId(null)
    } catch {
      /* noop */
    }
  }

  const handleEliminarTorneo = async (id: string) => {
    try {
      await removeTorneo(id, idOrgActiva)
      if (torneoActivo === id) {
        const rest = useAdminStore.getState().torneos.filter((t) => t.id !== id)
        setTorneoActivo(rest[0]?.id ?? '')
      }
    } catch {
      /* noop */
    }
  }

  const handleCrearDiv = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formDiv.nombre.trim()) {
      setErrDiv('El nombre es obligatorio')
      return
    }
    if (!torneoActivo) {
      setErrDiv('Seleccioná un torneo primero')
      return
    }
    setErrDiv('')
    try {
      await addDivision(
        {
          torneoId: torneoActivo,
          nombre: formDiv.nombre.trim(),
          estado: 'activa',
        },
        idOrgActiva
      )
      setFormDiv({ nombre: '' })
      setOkDiv(true)
      setTimeout(() => setOkDiv(false), 2000)
    } catch (err) {
      setErrDiv(err instanceof Error ? err.message : 'Error al crear división')
    }
  }

  const handleIniciarEditDiv = (d: Division) => {
    setEditDivId(d.id)
    setFormEditDiv({ nombre: d.nombre })
  }

  const handleGuardarEditDiv = async (id: string) => {
    if (!formEditDiv.nombre.trim()) return
    try {
      await updateDivision(id, { nombre: formEditDiv.nombre.trim() }, idOrgActiva)
      setEditDivId(null)
    } catch {
      /* noop */
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/admin')}
        className="flex items-center gap-1.5 text-[#555] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors mb-6"
      >
        ← Panel de control
      </button>

      <h1 className="text-white font-black text-2xl lg:text-3xl italic uppercase mb-6">
        Gestión de Torneo
      </h1>

      {rol === 'superadmin' && (
        <div className="mb-6">
          <label className={LABEL_CLS}>Organización (superadmin)</label>
          <select
            value={orgSuperadmin}
            onChange={(e) => setOrgSuperadmin(e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">Seleccioná organización</option>
            {orgsOpciones.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
          <p className="text-[#555] text-[10px] mt-2 uppercase tracking-wider">
            Las altas y listados usan la organización elegida.
          </p>
        </div>
      )}

      {errorApi && <p className="text-[#FF4444] text-xs font-bold mb-4">{errorApi}</p>}
      {cargando && <p className="text-[#555] text-xs mb-4 uppercase tracking-widest">Cargando…</p>}

      <section className="mb-8">
        <h2 className="text-[#FF6B00] text-[10px] font-black tracking-[0.25em] uppercase mb-4">Torneos</h2>

        {torneosList.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {torneosList.map((t) =>
              editTorneoId === t.id ? (
                <div key={t.id} className="bg-[#1A1A1A] border border-[#FF6B00]/40 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={LABEL_CLS}>Nombre</label>
                      <input
                        type="text"
                        value={formEditTorneo.nombre}
                        onChange={(e) => setFormEditTorneo((p) => ({ ...p, nombre: e.target.value }))}
                        className={INPUT_CLS}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Temporada</label>
                      <input
                        type="text"
                        value={formEditTorneo.temporada}
                        onChange={(e) => setFormEditTorneo((p) => ({ ...p, temporada: e.target.value }))}
                        className={INPUT_CLS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Deporte</label>
                      <input
                        type="text"
                        value={formEditTorneo.deporte}
                        onChange={(e) => setFormEditTorneo((p) => ({ ...p, deporte: e.target.value }))}
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className={LABEL_CLS}>Descripción</label>
                    <textarea
                      value={formEditTorneo.descripcion}
                      onChange={(e) => setFormEditTorneo((p) => ({ ...p, descripcion: e.target.value }))}
                      rows={2}
                      className={INPUT_CLS + ' resize-none'}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleGuardarEditTorneo(t.id)} className={BTN_SAVE}>
                      GUARDAR
                    </button>
                    <button type="button" onClick={() => setEditTorneoId(null)} className={BTN_CANCEL}>
                      CANCELAR
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={t.id}
                  className={`bg-[#131313] border p-4 flex items-center gap-3
                    ${torneoActivo === t.id ? 'border-[#FF6B00]/40' : 'border-[#2A2A2A]'}`}
                >
                  <button type="button" onClick={() => setTorneoActivo(t.id)} className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-black text-base truncate">{t.nombre}</p>
                      <EstadoBadge estado={t.estado} />
                    </div>
                    <p className="text-[#555] text-xs">
                      {t.deporte} · {t.temporada}
                    </p>
                    <p className="text-[#444] text-[10px] mt-1 truncate">Clave competencia: {t.claveCompetencia}</p>
                  </button>

                  <select
                    value={t.estado}
                    onChange={(e) =>
                      void updateTorneoEstado(t.id, e.target.value as EstadoTorneo, idOrgActiva)
                    }
                    className="bg-[#0A0A0A] border border-[#2A2A2A] text-[#888] text-[10px] font-bold uppercase px-2 py-1.5 outline-none"
                  >
                    <option value="activo">Activo</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="proximo">Próximo</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleIniciarEditTorneo(t)}
                    className="text-[#444] hover:text-[#FF6B00] transition-colors p-1 shrink-0"
                    title="Editar"
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleEliminarTorneo(t.id)}
                    className="text-[#444] hover:text-[#FF4444] transition-colors p-1 shrink-0"
                    title="Eliminar"
                  >
                    <TrashIcon />
                  </button>
                </div>
              )
            )}
          </div>
        )}

        <div className="bg-[#131313] border border-[#2A2A2A] p-4">
          <p className="text-white font-black text-sm uppercase tracking-wider mb-4">+ Nuevo torneo</p>
          <form onSubmit={(e) => void handleCrearTorneo(e)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre del torneo">
                <input
                  type="text"
                  value={formTorneo.nombre}
                  onChange={(e) => setFormTorneo((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: TICHB"
                  className={INPUT_CLS}
                />
              </Field>
              <Field label="Temporada">
                <input
                  type="text"
                  value={formTorneo.temporada}
                  onChange={(e) => setFormTorneo((p) => ({ ...p, temporada: e.target.value }))}
                  placeholder="Ej: 2024"
                  className={INPUT_CLS}
                />
              </Field>
              <Field label="Deporte">
                <input
                  type="text"
                  value={formTorneo.deporte}
                  onChange={(e) => setFormTorneo((p) => ({ ...p, deporte: e.target.value }))}
                  className={INPUT_CLS}
                />
              </Field>
            </div>
            <Field label="Descripción (obligatoria)">
              <textarea
                value={formTorneo.descripcion}
                onChange={(e) => setFormTorneo((p) => ({ ...p, descripcion: e.target.value }))}
                rows={2}
                placeholder="Descripción breve"
                className={INPUT_CLS + ' resize-none'}
              />
            </Field>
            <Field label="Continuar desde torneo (opcional — misma clave competencia)">
              <select
                value={formTorneo.torneoIdOrigen}
                onChange={(e) => setFormTorneo((p) => ({ ...p, torneoIdOrigen: e.target.value }))}
                className={SELECT_CLS}
              >
                <option value="">Nuevo — generar clave automática</option>
                {torneosList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} — {t.temporada}
                  </option>
                ))}
              </select>
            </Field>
            {errTorneo && <p className="text-[#FF4444] text-xs font-bold">{errTorneo}</p>}
            {okTorneo && <p className="text-green-400 text-xs font-bold">Torneo creado correctamente</p>}
            <button type="submit" className={BTN_PRIMARY} disabled={cargando}>
              CREAR TORNEO
            </button>
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-[#FF6B00] text-[10px] font-black tracking-[0.25em] uppercase mb-4">Divisiones</h2>

        <div className="mb-4">
          <label className={LABEL_CLS}>Torneo activo</label>
          <select value={torneoActivo} onChange={(e) => setTorneoActivo(e.target.value)} className={SELECT_CLS}>
            <option value="">Seleccioná un torneo</option>
            {torneosList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} — {t.temporada}
              </option>
            ))}
          </select>
        </div>

        {divsDeTorneo.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {divsDeTorneo.map((d) =>
              editDivId === d.id ? (
                <div key={d.id} className="bg-[#1A1A1A] border border-[#FF6B00]/40 p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={formEditDiv.nombre}
                    onChange={(e) => setFormEditDiv({ nombre: e.target.value })}
                    className={INPUT_CLS + ' flex-1'}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => void handleGuardarEditDiv(d.id)}
                    className={BTN_SAVE + ' px-4 py-2 text-xs'}
                  >
                    GUARDAR
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDivId(null)}
                    className={BTN_CANCEL + ' px-4 py-2 text-xs'}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  key={d.id}
                  className="bg-[#131313] border border-[#2A2A2A] px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-white font-bold text-sm">{d.nombre}</p>
                    <p className="text-[#555] text-[10px] font-bold uppercase tracking-wider">
                      {d.estado === 'activa' ? 'Activa' : 'Finalizada'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleIniciarEditDiv(d)}
                      className="text-[#444] hover:text-[#FF6B00] transition-colors p-1"
                      title="Editar"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeDivision(d.id, idOrgActiva)}
                      className="text-[#444] hover:text-[#FF4444] transition-colors p-1"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {divsDeTorneo.length === 0 && torneoActivo && (
          <p className="text-[#444] text-xs font-bold tracking-widest uppercase mb-4">
            Sin divisiones — agregá la primera
          </p>
        )}

        {torneoActivo && (
          <div className="bg-[#131313] border border-[#2A2A2A] p-4">
            <p className="text-white font-black text-sm uppercase tracking-wider mb-4">+ Nueva división</p>
            <form onSubmit={(e) => void handleCrearDiv(e)} className="flex flex-col gap-4">
              <Field label="Nombre de la división">
                <input
                  type="text"
                  value={formDiv.nombre}
                  onChange={(e) => {
                    setFormDiv({ nombre: e.target.value })
                    setErrDiv('')
                  }}
                  placeholder="Ej: División A"
                  className={INPUT_CLS}
                />
              </Field>
              {errDiv && <p className="text-[#FF4444] text-xs font-bold">{errDiv}</p>}
              {okDiv && <p className="text-green-400 text-xs font-bold">División creada correctamente</p>}
              <button type="submit" className={BTN_PRIMARY}>
                AGREGAR DIVISIÓN
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}

const INPUT_CLS =
  'w-full bg-[#0A0A0A] border-b border-[#2A2A2A] focus:border-[#FF6B00] text-white px-0 py-2.5 text-sm outline-none transition-colors placeholder:text-[#333]'
const SELECT_CLS =
  'w-full bg-[#131313] border border-[#2A2A2A] text-white text-sm px-3 py-2.5 outline-none focus:border-[#FF6B00] transition-colors'
const LABEL_CLS = 'text-[#888] text-[10px] font-black tracking-widest uppercase block mb-2'
const BTN_PRIMARY =
  'w-full bg-[#FF6B00] text-black font-black py-3 tracking-widest uppercase text-sm hover:bg-[#CC5500] transition-colors'
const BTN_SAVE =
  'bg-[#FF6B00] text-black font-black py-2 tracking-widest uppercase text-xs hover:bg-[#CC5500] transition-colors px-4'
const BTN_CANCEL =
  'bg-[#2A2A2A] text-white font-black py-2 tracking-widest uppercase text-xs hover:bg-[#3A3A3A] transition-colors px-4'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: EstadoTorneo }) {
  const cls =
    estado === 'activo'
      ? 'text-green-400 border-green-400/30 bg-green-400/5'
      : estado === 'finalizado'
        ? 'text-[#888] border-[#2A2A2A]'
        : 'text-[#FF6B00] border-[#FF6B00]/30'
  return (
    <span className={`text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 border shrink-0 ${cls}`}>
      {estado.toUpperCase()}
    </span>
  )
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}
