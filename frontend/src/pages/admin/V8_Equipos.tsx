import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../stores/adminStore'
import type { Equipo, Jugador } from '../../data/tipos'
import EquipoLogo from '../../components/EquipoLogo'

export default function V8_Equipos() {
  const {
    torneos, divisiones,
    equipos:   equiposList,
    jugadores: jugadoresList,
    addEquipo, removeEquipo, updateEquipo,
    addJugador, removeJugador, updateJugador,
  } = useAdminStore()

  const navigate = useNavigate()
  const [torneoId, setTorneoId] = useState('')
  const [divId, setDivId] = useState('')
  const mockIdSeq = useRef(0)
  const nextMockId = (prefijo: string) => `${prefijo}-${++mockIdSeq.current}`

  const resolvedTorneoId = useMemo(() => {
    if (torneoId && torneos.some((t) => t.id === torneoId)) return torneoId
    return torneos[0]?.id ?? ''
  }, [torneoId, torneos])

  const divsDeTorneo = useMemo(
    () => divisiones.filter((d) => d.torneoId === resolvedTorneoId),
    [divisiones, resolvedTorneoId]
  )

  const resolvedDivId = useMemo(() => {
    if (divId && divsDeTorneo.some((d) => d.id === divId)) return divId
    return divsDeTorneo[0]?.id ?? ''
  }, [divId, divsDeTorneo])

  const [equipoSel, setEquipoSel] = useState<string | null>(null)

  /* ── Form crear equipo ── */
  const [formEq,     setFormEq]     = useState({ nombre: '', logoUrl: '' })
  const [errEq,      setErrEq]      = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)

  /* ── Edición inline equipo ── */
  const [editEquipo,  setEditEquipo]  = useState(false)
  const [formEditEq,  setFormEditEq]  = useState({ nombre: '', logoUrl: '' })
  const [errEditEq,   setErrEditEq]   = useState('')
  const editEqLogoRef = useRef<HTMLInputElement>(null)

  /* ── Form crear jugador ── */
  const [formJug,    setFormJug]    = useState({ nombre: '', apellido: '', dorsal: '', posicion: '', fotoUrl: '' })
  const [errJug,     setErrJug]     = useState('')
  const fotoJugRef = useRef<HTMLInputElement>(null)

  /* ── Edición inline jugador ── */
  const [editJugId,   setEditJugId]   = useState<string | null>(null)
  const [formEditJug, setFormEditJug] = useState({ nombre: '', apellido: '', dorsal: '', posicion: '', fotoUrl: '' })
  const [errEditJug,  setErrEditJug]  = useState('')
  const editFotoJugRef = useRef<HTMLInputElement>(null)

  const equiposDiv   = equiposList.filter((e) => e.divisionId === resolvedDivId)
  const equipoActual = equiposList.find((e) => e.id === equipoSel)
  const jugadoresEq  = jugadoresList
    .filter((j) => j.equipoId === equipoSel)
    .sort((a, b) => a.dorsal - b.dorsal)

  /* ── Cambiar torneo ── */
  const handleChangeTorneo = (id: string) => {
    setTorneoId(id)
    const primeraDiv = divisiones.find((d) => d.torneoId === id)?.id ?? ''
    setDivId(primeraDiv || '')
    setEquipoSel(null)
    setEditEquipo(false)
    setEditJugId(null)
  }

  /* ── Cambiar división ── */
  const handleChangeDiv = (id: string) => {
    setDivId(id)
    setEquipoSel(null)
    setEditEquipo(false)
    setEditJugId(null)
  }

  /* ── Logo equipo (crear) ── */
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setFormEq((p) => ({ ...p, logoUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  /* ── Logo equipo (editar) ── */
  const handleEditEqLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setFormEditEq((p) => ({ ...p, logoUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  /* ── Foto jugador (crear) ── */
  const handleFotoJugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setFormJug((p) => ({ ...p, fotoUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  /* ── Foto jugador (editar) ── */
  const handleEditFotoJugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setFormEditJug((p) => ({ ...p, fotoUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  /* ── Crear equipo ── */
  const handleCrearEq = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!formEq.nombre.trim()) { setErrEq('El nombre es obligatorio'); return }
    if (!formEq.logoUrl)       { setErrEq('Cargá una imagen de logo'); return }
    if (!resolvedDivId)       { setErrEq('Seleccioná una división'); return }
    if (equiposDiv.some((eq) => eq.nombre.toLowerCase() === formEq.nombre.trim().toLowerCase())) {
      setErrEq('Ya existe un equipo con ese nombre en esta división'); return
    }
    const nuevo: Equipo = {
      id:         nextMockId('eq'),
      divisionId: resolvedDivId,
      nombre:     formEq.nombre.trim(),
      color:      '#1A1A1A',
      logoUrl:    formEq.logoUrl,
      PJ: 0, PG: 0, PP: 0, PT: 0,
    }
    addEquipo(nuevo)
    setFormEq({ nombre: '', logoUrl: '' })
    setErrEq('')
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  /* ── Eliminar equipo ── */
  const handleEliminarEq = (id: string) => {
    removeEquipo(id)
    if (equipoSel === id) { setEquipoSel(null); setEditEquipo(false) }
  }

  /* ── Iniciar edición equipo ── */
  const handleIniciarEditEq = () => {
    if (!equipoActual) return
    setFormEditEq({ nombre: equipoActual.nombre, logoUrl: equipoActual.logoUrl ?? '' })
    setErrEditEq('')
    setEditEquipo(true)
    setEditJugId(null)
  }

  /* ── Guardar edición equipo ── */
  const handleGuardarEditEq = () => {
    if (!equipoActual) return
    if (!formEditEq.nombre.trim()) { setErrEditEq('El nombre es obligatorio'); return }
    if (!formEditEq.logoUrl)       { setErrEditEq('El logo es obligatorio'); return }
    updateEquipo(equipoActual.id, {
      nombre:  formEditEq.nombre.trim(),
      logoUrl: formEditEq.logoUrl,
    })
    setEditEquipo(false)
    setErrEditEq('')
    if (editEqLogoRef.current) editEqLogoRef.current.value = ''
  }

  /* ── Crear jugador ── */
  const handleCrearJug = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!formJug.nombre.trim())   { setErrJug('El nombre es obligatorio'); return }
    if (!formJug.apellido.trim()) { setErrJug('El apellido es obligatorio'); return }
    const dorsal = parseInt(formJug.dorsal)
    if (isNaN(dorsal) || dorsal < 0 || dorsal > 99) { setErrJug('Dorsal inválido (0–99)'); return }
    if (jugadoresEq.some((j) => j.dorsal === dorsal)) { setErrJug('Ese dorsal ya está en uso'); return }
    const nuevo: Jugador = {
      id:       nextMockId('j'),
      equipoId: equipoSel!,
      nombre:   formJug.nombre.trim(),
      apellido: formJug.apellido.trim(),
      dorsal,
      posicion: formJug.posicion || undefined,
      fotoUrl:  formJug.fotoUrl  || undefined,
    }
    addJugador(nuevo)
    setFormJug({ nombre: '', apellido: '', dorsal: '', posicion: '', fotoUrl: '' })
    setErrJug('')
    if (fotoJugRef.current) fotoJugRef.current.value = ''
  }

  /* ── Eliminar jugador ── */
  const handleEliminarJug = (id: string) => removeJugador(id)

  /* ── Iniciar edición jugador ── */
  const handleIniciarEdit = (j: Jugador) => {
    setEditJugId(j.id)
    setFormEditJug({
      nombre:   j.nombre,
      apellido: j.apellido,
      dorsal:   String(j.dorsal),
      posicion: j.posicion ?? '',
      fotoUrl:  j.fotoUrl  ?? '',
    })
    setErrEditJug('')
    setEditEquipo(false)
  }

  /* ── Guardar edición jugador ── */
  const handleGuardarEdit = (jugadorId: string) => {
    if (!formEditJug.nombre.trim())   { setErrEditJug('El nombre es obligatorio'); return }
    if (!formEditJug.apellido.trim()) { setErrEditJug('El apellido es obligatorio'); return }
    const dorsal = parseInt(formEditJug.dorsal)
    if (isNaN(dorsal) || dorsal < 0 || dorsal > 99) { setErrEditJug('Dorsal inválido (0–99)'); return }
    if (jugadoresEq.some((j) => j.dorsal === dorsal && j.id !== jugadorId)) {
      setErrEditJug('Ese dorsal ya está en uso'); return
    }
    updateJugador(jugadorId, {
      nombre:   formEditJug.nombre.trim(),
      apellido: formEditJug.apellido.trim(),
      dorsal,
      posicion: formEditJug.posicion || undefined,
      fotoUrl:  formEditJug.fotoUrl  || undefined,
    })
    setEditJugId(null)
    setErrEditJug('')
    if (editFotoJugRef.current) editFotoJugRef.current.value = ''
  }

  return (
    <div>
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-1.5 text-[#555] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors mb-6"
      >
        ← Panel de control
      </button>

      <h1 className="text-white font-black text-2xl lg:text-3xl italic uppercase mb-6">
        Equipos y Jugadores
      </h1>

      {/* Selectores torneo + división */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div>
          <label className={LABEL_CLS}>Torneo</label>
          <select
            value={resolvedTorneoId}
            onChange={(e) => handleChangeTorneo(e.target.value)}
            className={SELECT_CLS}
          >
            {torneos.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre} — {t.temporada}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>División</label>
          <select
            value={resolvedDivId}
            onChange={(e) => handleChangeDiv(e.target.value)}
            className={SELECT_CLS}
            disabled={divsDeTorneo.length === 0}
          >
            {divsDeTorneo.length === 0
              ? <option>Sin divisiones</option>
              : divsDeTorneo.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))
            }
          </select>
        </div>
      </div>

      <div className={`grid gap-4 ${equipoSel ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>

        {/* ── Columna izquierda: lista de equipos ── */}
        <div>
          {equiposDiv.length > 0 && (
            <div className="flex flex-col gap-1 mb-4">
              {equiposDiv.map((eq) => (
                <div
                  key={eq.id}
                  className={`flex items-center gap-3 px-3 py-3 border cursor-pointer transition-colors
                    ${equipoSel === eq.id
                      ? 'bg-[#1A1A1A] border-[#FF6B00]/40'
                      : 'bg-[#131313] border-[#2A2A2A] hover:border-[#444]'}`}
                  onClick={() => {
                    setEquipoSel(equipoSel === eq.id ? null : eq.id)
                    setEditEquipo(false)
                    setEditJugId(null)
                  }}
                >
                  <EquipoLogo nombre={eq.nombre} color={eq.color} logoUrl={eq.logoUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{eq.nombre}</p>
                    <p className="text-[#555] text-[10px] font-bold uppercase tracking-wider">
                      {jugadoresList.filter((j) => j.equipoId === eq.id).length} jugadores
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEliminarEq(eq.id) }}
                    className="text-[#333] hover:text-[#FF4444] transition-colors p-1 shrink-0"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          {equiposDiv.length === 0 && resolvedDivId && (
            <p className="text-[#444] text-xs font-bold tracking-widest uppercase mb-4">
              Sin equipos en esta división
            </p>
          )}

          {/* Form nuevo equipo */}
          {resolvedDivId && (
            <div className="bg-[#131313] border border-[#2A2A2A] p-4">
              <p className="text-white font-black text-sm uppercase tracking-wider mb-4">+ Agregar equipo</p>
              <form onSubmit={handleCrearEq} className="flex flex-col gap-4">
                <div>
                  <label className={LABEL_CLS}>Nombre del equipo</label>
                  <input
                    type="text"
                    value={formEq.nombre}
                    onChange={(e) => { setFormEq((p) => ({ ...p, nombre: e.target.value })); setErrEq('') }}
                    placeholder="Ej: Shadow Titans"
                    className={INPUT_CLS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLS}>Logo del equipo</label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="border border-dashed border-[#2A2A2A] group-hover:border-[#FF6B00]/50 transition-colors px-4 py-3 flex-1 text-center">
                      <p className="text-[#555] text-xs font-bold tracking-wider">
                        {formEq.logoUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
                      </p>
                      <p className="text-[#333] text-[10px] mt-0.5">PNG, JPG, SVG</p>
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    {formEq.logoUrl && (
                      <div className="w-14 h-14 shrink-0 bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
                        <img src={formEq.logoUrl} alt="preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </label>
                </div>

                {formEq.nombre.trim() && formEq.logoUrl && (
                  <div className="flex items-center gap-3 py-1">
                    <EquipoLogo nombre={formEq.nombre} color="#1A1A1A" logoUrl={formEq.logoUrl} size="md" />
                    <div>
                      <p className="text-[#555] text-[10px] font-black tracking-widest uppercase">Preview</p>
                      <p className="text-white text-sm font-bold">{formEq.nombre.trim()}</p>
                    </div>
                  </div>
                )}

                {errEq && <p className="text-[#FF4444] text-xs font-bold">{errEq}</p>}

                <button type="submit" className={BTN_PRIMARY}>
                  AGREGAR EQUIPO
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── Columna derecha: jugadores ── */}
        {equipoSel && equipoActual && (
          <div>

            {/* Header del equipo */}
            {editEquipo ? (
              <div className="bg-[#1A1A1A] border border-[#FF6B00]/30 p-4 mb-4">
                <p className="text-[#FF6B00] font-black text-xs tracking-widest uppercase mb-3">Editar equipo</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={LABEL_CLS}>Nombre del equipo</label>
                    <input
                      type="text"
                      value={formEditEq.nombre}
                      onChange={(e) => { setFormEditEq((p) => ({ ...p, nombre: e.target.value })); setErrEditEq('') }}
                      className={INPUT_CLS}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Logo del equipo</label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="border border-dashed border-[#2A2A2A] group-hover:border-[#FF6B00]/50 transition-colors px-4 py-3 flex-1 text-center">
                        <p className="text-[#555] text-xs font-bold tracking-wider">
                          {formEditEq.logoUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
                        </p>
                        <p className="text-[#333] text-[10px] mt-0.5">PNG, JPG, SVG</p>
                      </div>
                      <input
                        ref={editEqLogoRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditEqLogoChange}
                        className="hidden"
                      />
                      {formEditEq.logoUrl && (
                        <div className="w-14 h-14 shrink-0 bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden">
                          <img src={formEditEq.logoUrl} alt="preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </label>
                  </div>
                  {errEditEq && <p className="text-[#FF4444] text-xs font-bold">{errEditEq}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleGuardarEditEq}
                      className="flex-1 bg-[#FF6B00] text-black font-black py-2 text-xs tracking-widest uppercase hover:bg-[#CC5500] transition-colors"
                    >
                      GUARDAR
                    </button>
                    <button
                      onClick={() => { setEditEquipo(false); setErrEditEq('') }}
                      className="flex-1 bg-[#2A2A2A] text-white font-black py-2 text-xs tracking-widest uppercase hover:bg-[#3A3A3A] transition-colors"
                    >
                      CANCELAR
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#131313] border border-[#2A2A2A]">
                <EquipoLogo nombre={equipoActual.nombre} color={equipoActual.color} logoUrl={equipoActual.logoUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-base truncate">{equipoActual.nombre}</p>
                  <p className="text-[#555] text-[10px] font-bold uppercase tracking-wider">
                    {jugadoresEq.length} jugadores
                  </p>
                </div>
                <button
                  onClick={handleIniciarEditEq}
                  className="text-[#333] hover:text-[#FF6B00] transition-colors p-1 shrink-0"
                  title="Editar equipo"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => { setEquipoSel(null); setEditJugId(null) }}
                  className="text-[#555] hover:text-white text-lg font-bold leading-none p-1 shrink-0"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Botón Google Form */}
            {import.meta.env.VITE_GOOGLE_FORM_JUGADORES && (
              <a
                href={import.meta.env.VITE_GOOGLE_FORM_JUGADORES}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-[#2A2A2A] hover:border-[#FF6B00]/40 text-[#888] hover:text-white text-[10px] font-black tracking-widest uppercase py-3 transition-colors mb-4"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                </svg>
                Formulario de inscripción
              </a>
            )}

            {/* Lista jugadores */}
            {jugadoresEq.length > 0 && (
              <div className="flex flex-col mb-4 border border-[#2A2A2A]">
                {jugadoresEq.map((j, idx) =>
                  editJugId === j.id ? (
                    <div key={j.id} className="bg-[#1A1A1A] p-3 border-b border-[#2A2A2A]">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className={LABEL_CLS}>Nombre</label>
                          <input
                            type="text"
                            value={formEditJug.nombre}
                            onChange={(e) => { setFormEditJug((p) => ({ ...p, nombre: e.target.value })); setErrEditJug('') }}
                            className={INPUT_CLS}
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Apellido</label>
                          <input
                            type="text"
                            value={formEditJug.apellido}
                            onChange={(e) => { setFormEditJug((p) => ({ ...p, apellido: e.target.value })); setErrEditJug('') }}
                            className={INPUT_CLS}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className={LABEL_CLS}>Dorsal (0–99)</label>
                          <input
                            type="number"
                            min={0} max={99}
                            value={formEditJug.dorsal}
                            onChange={(e) => { setFormEditJug((p) => ({ ...p, dorsal: e.target.value })); setErrEditJug('') }}
                            className={INPUT_CLS}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Posición</label>
                          <select
                            value={formEditJug.posicion}
                            onChange={(e) => setFormEditJug((p) => ({ ...p, posicion: e.target.value }))}
                            className={SELECT_CLS}
                          >
                            <option value="">Sin especificar</option>
                            <option>Base</option>
                            <option>Escolta</option>
                            <option>Alero</option>
                            <option>Ala-Pívot</option>
                            <option>Pívot</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className={LABEL_CLS}>Foto del jugador</label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="border border-dashed border-[#2A2A2A] group-hover:border-[#FF6B00]/50 transition-colors px-4 py-2.5 flex-1 text-center">
                            <p className="text-[#555] text-xs font-bold tracking-wider">
                              {formEditJug.fotoUrl ? 'Cambiar foto' : 'Seleccionar foto'}
                            </p>
                            <p className="text-[#333] text-[10px] mt-0.5">PNG, JPG</p>
                          </div>
                          <input
                            ref={editFotoJugRef}
                            type="file"
                            accept="image/*"
                            onChange={handleEditFotoJugChange}
                            className="hidden"
                          />
                          {formEditJug.fotoUrl && (
                            <div className="w-12 h-12 shrink-0 bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden rounded-full">
                              <img src={formEditJug.fotoUrl} alt="preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </label>
                      </div>
                      {errEditJug && <p className="text-[#FF4444] text-xs font-bold mb-2">{errEditJug}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGuardarEdit(j.id)}
                          className="flex-1 bg-[#FF6B00] text-black font-black py-2 text-xs tracking-widest uppercase hover:bg-[#CC5500] transition-colors"
                        >
                          GUARDAR
                        </button>
                        <button
                          onClick={() => { setEditJugId(null); setErrEditJug('') }}
                          className="flex-1 bg-[#2A2A2A] text-white font-black py-2 text-xs tracking-widest uppercase hover:bg-[#3A3A3A] transition-colors"
                        >
                          CANCELAR
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={j.id}
                      className={`flex items-center gap-3 px-3 py-2.5 bg-[#0A0A0A]
                        ${idx < jugadoresEq.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}
                    >
                      {j.fotoUrl ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#2A2A2A]">
                          <img src={j.fotoUrl} alt={j.nombre} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="w-9 h-9 flex items-center justify-center font-black text-white text-xs shrink-0"
                          style={{ backgroundColor: equipoActual.color }}
                        >
                          {j.dorsal}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">
                          {j.apellido}, {j.nombre}
                          {j.fotoUrl && (
                            <span className="ml-2 text-[#555] text-[10px] font-bold align-middle">#{j.dorsal}</span>
                          )}
                        </p>
                        {j.posicion && (
                          <p className="text-[#555] text-[10px] font-bold uppercase tracking-wider">{j.posicion}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleIniciarEdit(j)}
                        className="text-[#333] hover:text-[#FF6B00] transition-colors p-1 shrink-0"
                        title="Editar jugador"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleEliminarJug(j.id)}
                        className="text-[#333] hover:text-[#FF4444] transition-colors p-1 shrink-0"
                        title="Eliminar jugador"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {jugadoresEq.length === 0 && (
              <p className="text-[#444] text-xs font-bold tracking-widest uppercase mb-4">
                Sin jugadores — agregá el primero
              </p>
            )}

            {/* Form nuevo jugador */}
            <div className="bg-[#131313] border border-[#2A2A2A] p-4">
              <p className="text-white font-black text-sm uppercase tracking-wider mb-4">+ Agregar jugador</p>
              <form onSubmit={handleCrearJug} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLS}>Nombre</label>
                    <input
                      type="text"
                      value={formJug.nombre}
                      onChange={(e) => { setFormJug((p) => ({ ...p, nombre: e.target.value })); setErrJug('') }}
                      placeholder="Ej: Marcos"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Apellido</label>
                    <input
                      type="text"
                      value={formJug.apellido}
                      onChange={(e) => { setFormJug((p) => ({ ...p, apellido: e.target.value })); setErrJug('') }}
                      placeholder="Ej: Vega"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLS}>Dorsal (0–99)</label>
                    <input
                      type="number"
                      min={0} max={99}
                      value={formJug.dorsal}
                      onChange={(e) => { setFormJug((p) => ({ ...p, dorsal: e.target.value })); setErrJug('') }}
                      placeholder="Ej: 10"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Posición</label>
                    <select
                      value={formJug.posicion}
                      onChange={(e) => setFormJug((p) => ({ ...p, posicion: e.target.value }))}
                      className={SELECT_CLS}
                    >
                      <option value="">Sin especificar</option>
                      <option>Base</option>
                      <option>Escolta</option>
                      <option>Alero</option>
                      <option>Ala-Pívot</option>
                      <option>Pívot</option>
                    </select>
                  </div>
                </div>

                {/* Foto jugador */}
                <div>
                  <label className={LABEL_CLS}>Foto del jugador (opcional)</label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="border border-dashed border-[#2A2A2A] group-hover:border-[#FF6B00]/50 transition-colors px-4 py-2.5 flex-1 text-center">
                      <p className="text-[#555] text-xs font-bold tracking-wider">
                        {formJug.fotoUrl ? 'Cambiar foto' : 'Seleccionar foto'}
                      </p>
                      <p className="text-[#333] text-[10px] mt-0.5">PNG, JPG</p>
                    </div>
                    <input
                      ref={fotoJugRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFotoJugChange}
                      className="hidden"
                    />
                    {formJug.fotoUrl && (
                      <div className="w-12 h-12 shrink-0 bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden rounded-full">
                        <img src={formJug.fotoUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </label>
                </div>

                {errJug && <p className="text-[#FF4444] text-xs font-bold">{errJug}</p>}

                <button type="submit" className={BTN_PRIMARY}>
                  AGREGAR JUGADOR
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Helpers ── */
const INPUT_CLS   = 'w-full bg-[#0A0A0A] border-b border-[#2A2A2A] focus:border-[#FF6B00] text-white px-0 py-2.5 text-sm outline-none transition-colors placeholder:text-[#333]'
const SELECT_CLS  = 'w-full bg-[#131313] border border-[#2A2A2A] text-white text-sm px-3 py-2.5 outline-none focus:border-[#FF6B00] transition-colors'
const LABEL_CLS   = 'text-[#888] text-[10px] font-black tracking-widest uppercase block mb-2'
const BTN_PRIMARY = 'w-full bg-[#FF6B00] text-black font-black py-3 tracking-widest uppercase text-sm hover:bg-[#CC5500] transition-colors'

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}
