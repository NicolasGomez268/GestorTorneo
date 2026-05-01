import { useState } from 'react'
import { divisiones as divsMock }    from '../../data/divisiones'
import { equipos as equiposMock }    from '../../data/equipos'
import { jugadores as jugadoresMock } from '../../data/jugadores'
import type { Equipo, Jugador } from '../../data/tipos'
import EquipoLogo from '../../components/EquipoLogo'

const COLORES_PRESET = [
  '#FF6B00','#E74C3C','#9B59B6','#2980B9','#1ABC9C',
  '#F39C12','#27AE60','#C0392B','#8E44AD','#ECF0F1',
]

export default function V8_Equipos() {
  const [divId,         setDivId]         = useState(divsMock[0]?.id ?? '')
  const [equiposList,   setEquiposList]   = useState<Equipo[]>(equiposMock)
  const [jugadoresList, setJugadoresList] = useState<Jugador[]>(jugadoresMock)
  const [equipoSel,     setEquipoSel]     = useState<string | null>(null)

  // Form equipo
  const [formEq,  setFormEq]  = useState({ nombre: '', color: '#FF6B00' })
  const [errEq,   setErrEq]   = useState('')

  // Form jugador (crear)
  const [formJug, setFormJug] = useState({ nombre: '', apellido: '', dorsal: '', posicion: '' })
  const [errJug,  setErrJug]  = useState('')

  // Edición inline de jugador
  const [editJugId,   setEditJugId]   = useState<string | null>(null)
  const [formEditJug, setFormEditJug] = useState({ nombre: '', apellido: '', dorsal: '', posicion: '' })
  const [errEditJug,  setErrEditJug]  = useState('')

  const equiposDiv   = equiposList.filter((e) => e.divisionId === divId)
  const equipoActual = equiposList.find((e) => e.id === equipoSel)
  const jugadoresEq  = jugadoresList
    .filter((j) => j.equipoId === equipoSel)
    .sort((a, b) => a.dorsal - b.dorsal)

  /* ── Crear equipo ── */
  const handleCrearEq = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!formEq.nombre.trim()) { setErrEq('El nombre es obligatorio'); return }
    if (equiposDiv.some((eq) => eq.nombre.toLowerCase() === formEq.nombre.trim().toLowerCase())) {
      setErrEq('Ya existe un equipo con ese nombre en esta división'); return
    }
    const nuevo: Equipo = {
      id:         `eq-${Date.now()}`,
      divisionId: divId,
      nombre:     formEq.nombre.trim(),
      color:      formEq.color,
      logoUrl:    undefined,
      PJ: 0, PG: 0, PP: 0, PT: 0,
    }
    setEquiposList((p) => [...p, nuevo])
    setFormEq({ nombre: '', color: '#FF6B00' })
    setErrEq('')
    // TODO: conectar con backend
  }

  /* ── Eliminar equipo ── */
  const handleEliminarEq = (id: string) => {
    setEquiposList((p) => p.filter((e) => e.id !== id))
    setJugadoresList((p) => p.filter((j) => j.equipoId !== id))
    if (equipoSel === id) setEquipoSel(null)
    // TODO: conectar con backend
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
      id:       `j-${Date.now()}`,
      equipoId: equipoSel!,
      nombre:   formJug.nombre.trim(),
      apellido: formJug.apellido.trim(),
      dorsal,
      posicion: formJug.posicion || undefined,
    }
    setJugadoresList((p) => [...p, nuevo])
    setFormJug({ nombre: '', apellido: '', dorsal: '', posicion: '' })
    setErrJug('')
    // TODO: conectar con backend
  }

  /* ── Eliminar jugador ── */
  const handleEliminarJug = (id: string) => {
    setJugadoresList((p) => p.filter((j) => j.id !== id))
    // TODO: conectar con backend
  }

  /* ── Iniciar edición inline ── */
  const handleIniciarEdit = (j: Jugador) => {
    setEditJugId(j.id)
    setFormEditJug({ nombre: j.nombre, apellido: j.apellido, dorsal: String(j.dorsal), posicion: j.posicion ?? '' })
    setErrEditJug('')
  }

  /* ── Guardar edición inline ── */
  const handleGuardarEdit = (jugadorId: string) => {
    if (!formEditJug.nombre.trim())   { setErrEditJug('El nombre es obligatorio'); return }
    if (!formEditJug.apellido.trim()) { setErrEditJug('El apellido es obligatorio'); return }
    const dorsal = parseInt(formEditJug.dorsal)
    if (isNaN(dorsal) || dorsal < 0 || dorsal > 99) { setErrEditJug('Dorsal inválido (0–99)'); return }
    if (jugadoresEq.some((j) => j.dorsal === dorsal && j.id !== jugadorId)) {
      setErrEditJug('Ese dorsal ya está en uso'); return
    }
    setJugadoresList((p) =>
      p.map((j) =>
        j.id === jugadorId
          ? { ...j, nombre: formEditJug.nombre.trim(), apellido: formEditJug.apellido.trim(), dorsal, posicion: formEditJug.posicion || undefined }
          : j
      )
    )
    setEditJugId(null)
    setErrEditJug('')
    // TODO: conectar con backend
  }

  return (
    <div>
      <h1 className="text-white font-black text-2xl lg:text-3xl italic uppercase mb-6">
        Equipos y Jugadores
      </h1>

      {/* Selector de división */}
      <div className="mb-6">
        <label className={LABEL_CLS}>División</label>
        <select
          value={divId}
          onChange={(e) => { setDivId(e.target.value); setEquipoSel(null); setEditJugId(null) }}
          className={SELECT_CLS}
        >
          {divsMock.map((d) => (
            <option key={d.id} value={d.id}>{d.nombre}</option>
          ))}
        </select>
      </div>

      {/* Layout: 1 col mobile, 2 col desktop cuando hay equipo seleccionado */}
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
                  onClick={() => { setEquipoSel(equipoSel === eq.id ? null : eq.id); setEditJugId(null) }}
                >
                  <div className="w-0.5 h-8 shrink-0" style={{ backgroundColor: eq.color }} />
                  <EquipoLogo nombre={eq.nombre} color={eq.color} size="sm" />
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

          {equiposDiv.length === 0 && (
            <p className="text-[#444] text-xs font-bold tracking-widest uppercase mb-4">
              Sin equipos en esta división
            </p>
          )}

          {/* Form nuevo equipo */}
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

              {/* Preview del logo */}
              {formEq.nombre.trim() && (
                <div className="flex items-center gap-3 py-1">
                  <EquipoLogo nombre={formEq.nombre} color={formEq.color} size="md" />
                  <div>
                    <p className="text-[#555] text-[10px] font-black tracking-widest uppercase">Preview</p>
                    <p className="text-white text-sm font-bold">{formEq.nombre.trim()}</p>
                  </div>
                </div>
              )}

              {/* Selector de color */}
              <div>
                <label className={LABEL_CLS}>Color del equipo</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {COLORES_PRESET.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormEq((p) => ({ ...p, color: c }))}
                      className={`w-7 h-7 transition-transform ${formEq.color === c ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-[#131313]' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formEq.color}
                    onChange={(e) => setFormEq((p) => ({ ...p, color: e.target.value }))}
                    className="w-7 h-7 cursor-pointer bg-transparent border-0 p-0"
                    title="Color personalizado"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5" style={{ backgroundColor: formEq.color }} />
                  <span className="text-[#888] text-xs font-mono">{formEq.color}</span>
                </div>
              </div>

              {errEq && <p className="text-[#FF4444] text-xs font-bold">{errEq}</p>}

              <button type="submit" className={BTN_PRIMARY}>
                AGREGAR EQUIPO
              </button>
            </form>
          </div>
        </div>

        {/* ── Columna derecha: jugadores del equipo seleccionado ── */}
        {equipoSel && equipoActual && (
          <div>
            {/* Header equipo */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-[#131313] border border-[#2A2A2A]">
              <EquipoLogo nombre={equipoActual.nombre} color={equipoActual.color} size="md" />
              <div>
                <p className="text-white font-black text-base">{equipoActual.nombre}</p>
                <p className="text-[#555] text-[10px] font-bold uppercase tracking-wider">
                  {jugadoresEq.length} jugadores
                </p>
              </div>
              <button
                onClick={() => { setEquipoSel(null); setEditJugId(null) }}
                className="ml-auto text-[#555] hover:text-white text-lg font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Lista de jugadores */}
            {jugadoresEq.length > 0 && (
              <div className="flex flex-col mb-4 border border-[#2A2A2A]">
                {jugadoresEq.map((j, idx) =>
                  editJugId === j.id ? (
                    /* ── Fila en modo edición ── */
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
                      <div className="grid grid-cols-2 gap-2 mb-3">
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
                    /* ── Fila en modo display ── */
                    <div
                      key={j.id}
                      className={`flex items-center gap-3 px-3 py-2.5 bg-[#0A0A0A]
                        ${idx < jugadoresEq.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center font-black text-white text-xs shrink-0"
                        style={{ backgroundColor: equipoActual.color }}
                      >
                        {j.dorsal}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{j.apellido}, {j.nombre}</p>
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
