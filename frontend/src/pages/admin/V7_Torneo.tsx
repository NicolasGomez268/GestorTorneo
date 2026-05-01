import { useState } from 'react'
import { torneos as torneosMock }       from '../../data/torneos'
import { divisiones as divisionesMock } from '../../data/divisiones'
import type { Torneo, Division } from '../../data/tipos'

type EstadoTorneo = Torneo['estado']

export default function V7_Torneo() {
  const [torneosList, setTorneosList] = useState<Torneo[]>(torneosMock)
  const [divsList,    setDivsList]    = useState<Division[]>(divisionesMock)

  const [torneoActivo, setTorneoActivo] = useState<string>(torneosMock[0]?.id ?? '')

  // Form nuevo torneo
  const [formTorneo, setFormTorneo] = useState({ nombre: '', deporte: 'Básquet', temporada: '', descripcion: '' })
  const [errTorneo,  setErrTorneo]  = useState('')
  const [okTorneo,   setOkTorneo]   = useState(false)

  // Form nueva división
  const [formDiv, setFormDiv] = useState({ nombre: '' })
  const [errDiv,  setErrDiv]  = useState('')

  const divsDeTorneo = divsList.filter((d) => d.torneoId === torneoActivo)

  /* ── Crear torneo ── */
  const handleCrearTorneo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTorneo.nombre.trim()) { setErrTorneo('El nombre es obligatorio'); return }
    if (!formTorneo.temporada.trim()) { setErrTorneo('La temporada es obligatoria'); return }
    const nuevo: Torneo = {
      id:          `torneo-${Date.now()}`,
      nombre:      formTorneo.nombre.trim(),
      deporte:     formTorneo.deporte,
      temporada:   formTorneo.temporada.trim(),
      estado:      'activo',
      descripcion: formTorneo.descripcion.trim(),
    }
    setTorneosList((prev) => [...prev, nuevo])
    setFormTorneo({ nombre: '', deporte: 'Básquet', temporada: '', descripcion: '' })
    setErrTorneo('')
    setOkTorneo(true)
    setTimeout(() => setOkTorneo(false), 2000)
  }

  /* ── Eliminar torneo ── */
  const handleEliminarTorneo = (id: string) => {
    setTorneosList((prev) => prev.filter((t) => t.id !== id))
    setDivsList((prev) => prev.filter((d) => d.torneoId !== id))
    if (torneoActivo === id) setTorneoActivo(torneosList.find((t) => t.id !== id)?.id ?? '')
  }

  /* ── Cambiar estado torneo ── */
  const handleEstado = (id: string, estado: EstadoTorneo) =>
    setTorneosList((prev) => prev.map((t) => t.id === id ? { ...t, estado } : t))

  /* ── Crear división ── */
  const handleCrearDiv = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formDiv.nombre.trim()) { setErrDiv('El nombre es obligatorio'); return }
    if (!torneoActivo) { setErrDiv('Seleccioná un torneo primero'); return }
    const nueva: Division = {
      id:            `div-${Date.now()}`,
      torneoId:      torneoActivo,
      nombre:        formDiv.nombre.trim(),
      estado:        'activa',
      cantidadEquipos: 0,
    }
    setDivsList((prev) => [...prev, nueva])
    setFormDiv({ nombre: '' })
    setErrDiv('')
  }

  /* ── Eliminar división ── */
  const handleEliminarDiv = (id: string) =>
    setDivsList((prev) => prev.filter((d) => d.id !== id))

  return (
    <div>
      <h1 className="text-white font-black text-2xl lg:text-3xl italic uppercase mb-6">
        Gestión de Torneo
      </h1>

      {/* ── Sección: Torneos ── */}
      <section className="mb-8">
        <h2 className="text-[#FF6B00] text-[10px] font-black tracking-[0.25em] uppercase mb-4">
          Torneos
        </h2>

        {/* Lista de torneos */}
        {torneosList.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {torneosList.map((t) => (
              <div
                key={t.id}
                className={`bg-[#131313] border p-4 flex items-center gap-3
                  ${torneoActivo === t.id ? 'border-[#FF6B00]/40' : 'border-[#2A2A2A]'}`}
              >
                <button
                  onClick={() => setTorneoActivo(t.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-black text-base truncate">{t.nombre}</p>
                    <EstadoBadge estado={t.estado} />
                  </div>
                  <p className="text-[#555] text-xs">{t.deporte} · {t.temporada}</p>
                </button>

                {/* Cambiar estado */}
                <select
                  value={t.estado}
                  onChange={(e) => handleEstado(t.id, e.target.value as EstadoTorneo)}
                  className="bg-[#0A0A0A] border border-[#2A2A2A] text-[#888] text-[10px] font-bold uppercase px-2 py-1.5 outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="proximo">Próximo</option>
                </select>

                <button
                  onClick={() => handleEliminarTorneo(t.id)}
                  className="text-[#444] hover:text-[#FF4444] transition-colors p-1 shrink-0"
                  title="Eliminar torneo"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Form nuevo torneo */}
        <div className="bg-[#131313] border border-[#2A2A2A] p-4">
          <p className="text-white font-black text-sm uppercase tracking-wider mb-4">
            + Nuevo torneo
          </p>
          <form onSubmit={handleCrearTorneo} className="flex flex-col gap-4">
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
            <Field label="Descripción">
              <textarea
                value={formTorneo.descripcion}
                onChange={(e) => setFormTorneo((p) => ({ ...p, descripcion: e.target.value }))}
                rows={2}
                placeholder="Descripción breve del torneo"
                className={INPUT_CLS + ' resize-none'}
              />
            </Field>

            {errTorneo && <p className="text-[#FF4444] text-xs font-bold">{errTorneo}</p>}
            {okTorneo  && <p className="text-green-400 text-xs font-bold">Torneo creado correctamente</p>}

            <button type="submit" className={BTN_PRIMARY}>
              CREAR TORNEO
            </button>
          </form>
        </div>
      </section>

      {/* ── Sección: Divisiones ── */}
      <section>
        <h2 className="text-[#FF6B00] text-[10px] font-black tracking-[0.25em] uppercase mb-4">
          Divisiones
        </h2>

        {/* Selector de torneo */}
        <div className="mb-4">
          <label className={LABEL_CLS}>Torneo activo</label>
          <select
            value={torneoActivo}
            onChange={(e) => setTorneoActivo(e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">Seleccioná un torneo</option>
            {torneosList.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre} — {t.temporada}</option>
            ))}
          </select>
        </div>

        {/* Lista de divisiones */}
        {divsDeTorneo.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {divsDeTorneo.map((d) => (
              <div key={d.id} className="bg-[#131313] border border-[#2A2A2A] px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-white font-bold text-sm">{d.nombre}</p>
                  <p className="text-[#555] text-[10px] font-bold uppercase tracking-wider">
                    {d.estado === 'activa' ? 'Activa' : 'Finalizada'}
                  </p>
                </div>
                <button
                  onClick={() => handleEliminarDiv(d.id)}
                  className="text-[#444] hover:text-[#FF4444] transition-colors p-1 shrink-0"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        {divsDeTorneo.length === 0 && torneoActivo && (
          <p className="text-[#444] text-xs font-bold tracking-widest uppercase mb-4">
            Sin divisiones — agregá la primera
          </p>
        )}

        {/* Form nueva división */}
        {torneoActivo && (
          <div className="bg-[#131313] border border-[#2A2A2A] p-4">
            <p className="text-white font-black text-sm uppercase tracking-wider mb-4">
              + Nueva división
            </p>
            <form onSubmit={handleCrearDiv} className="flex flex-col gap-4">
              <Field label="Nombre de la división">
                <input
                  type="text"
                  value={formDiv.nombre}
                  onChange={(e) => { setFormDiv({ nombre: e.target.value }); setErrDiv('') }}
                  placeholder="Ej: División A"
                  className={INPUT_CLS}
                />
              </Field>

              {errDiv && <p className="text-[#FF4444] text-xs font-bold">{errDiv}</p>}

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

/* ── Helpers ── */
const INPUT_CLS  = 'w-full bg-[#0A0A0A] border-b border-[#2A2A2A] focus:border-[#FF6B00] text-white px-0 py-2.5 text-sm outline-none transition-colors placeholder:text-[#333]'
const SELECT_CLS = 'w-full bg-[#131313] border border-[#2A2A2A] text-white text-sm px-3 py-2.5 outline-none focus:border-[#FF6B00] transition-colors'
const LABEL_CLS  = 'text-[#888] text-[10px] font-black tracking-widest uppercase block mb-2'
const BTN_PRIMARY = 'w-full bg-[#FF6B00] text-black font-black py-3 tracking-widest uppercase text-sm hover:bg-[#CC5500] transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: EstadoTorneo }) {
  const cls = estado === 'activo'
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

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}
