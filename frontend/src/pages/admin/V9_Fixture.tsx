import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../stores/adminStore'
import type { Partido, RondaPartido } from '../../data/tipos'
import EquipoLogo from '../../components/EquipoLogo'

const RONDAS: RondaPartido[] = ['octavos', 'cuartos', 'semifinal', 'final']

const LABEL_RONDA: Record<string, string> = {
  octavos:  'Octavos de Final',
  cuartos:  'Cuartos de Final',
  semifinal: 'Semifinales',
  final:    'Final',
}

export default function V9_Fixture() {
  const { divisiones, equipos: equiposMock, partidos: partidosMock, addPartido, removePartido } = useAdminStore()
  const [divId,    setDivId]    = useState(divisiones[0]?.id ?? '')
  const [formOpen, setFormOpen] = useState(false)

  const [formP, setFormP] = useState({
    localId:     '',
    visitanteId: '',
    fechaHora:   '',
    fase:        'regular' as 'regular' | 'playoff',
    fechaNumero: '1',
    ronda:       'semifinal' as RondaPartido,
  })
  const [errP, setErrP] = useState('')

  const equiposDiv  = equiposMock.filter((e) => e.divisionId === divId)
  const partidosDiv = partidosMock
    .filter((p) => p.divisionId === divId)
    .sort((a, b) => {
      if (a.fase !== b.fase) return a.fase === 'regular' ? -1 : 1
      return a.fechaNumero - b.fechaNumero
    })

  const regularPartidos = partidosDiv.filter((p) => p.fase === 'regular')
  const playoffPartidos = partidosDiv.filter((p) => p.fase === 'playoff')

  // Agrupar fase regular por fechaNumero
  const fechasMap = regularPartidos.reduce<Record<number, Partido[]>>((acc, p) => {
    ;(acc[p.fechaNumero] ??= []).push(p)
    return acc
  }, {})

  // Agrupar playoff por ronda
  const rondasMap = playoffPartidos.reduce<Record<string, Partido[]>>((acc, p) => {
    const key = p.ronda ?? 'otro'
    ;(acc[key] ??= []).push(p)
    return acc
  }, {})

  /* ── Crear partido ── */
  const handleCrearPartido = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!formP.localId)     { setErrP('Seleccioná el equipo local'); return }
    if (!formP.visitanteId) { setErrP('Seleccioná el equipo visitante'); return }
    if (formP.localId === formP.visitanteId) { setErrP('Local y visitante no pueden ser el mismo equipo'); return }
    if (!formP.fechaHora)   { setErrP('Seleccioná fecha y hora'); return }

    const local     = equiposDiv.find((eq) => eq.id === formP.localId)!
    const visitante = equiposDiv.find((eq) => eq.id === formP.visitanteId)!
    const fechaNum  = formP.fase === 'regular' ? (parseInt(formP.fechaNumero) || 1) : 99

    const nuevo: Partido = {
      id:          `p-${Date.now()}`,
      divisionId:  divId,
      fechaNumero: fechaNum,
      fechaHora:   formP.fechaHora,
      local:       { equipoId: local.id,     nombre: local.nombre,     color: local.color },
      visitante:   { equipoId: visitante.id, nombre: visitante.nombre, color: visitante.color },
      estado:      'pendiente',
      fase:        formP.fase,
      ronda:       formP.fase === 'playoff' ? formP.ronda : null,
    }
    addPartido(nuevo)
    setFormP({ localId: '', visitanteId: '', fechaHora: '', fase: 'regular', fechaNumero: '1', ronda: 'semifinal' })
    setErrP('')
    setFormOpen(false)
  }

  /* ── Eliminar partido pendiente ── */
  const handleEliminarPartido = (id: string) => removePartido(id)

  const localPreview    = equiposDiv.find((eq) => eq.id === formP.localId)
  const visitantePreview = equiposDiv.find((eq) => eq.id === formP.visitanteId)

  return (
    <div>
      <h1 className="text-white font-black text-2xl lg:text-3xl italic uppercase mb-6">
        Armar Fixture
      </h1>

      {/* Barra superior: selector + botón */}
      <div className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <label className={LABEL_CLS}>División</label>
          <select
            value={divId}
            onChange={(e) => { setDivId(e.target.value); setFormOpen(false) }}
            className={SELECT_CLS}
          >
            {divisiones.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="bg-[#FF6B00] text-black font-black py-[11px] px-5 text-sm tracking-widest uppercase hover:bg-[#CC5500] transition-colors shrink-0"
        >
          {formOpen ? '✕ CERRAR' : '+ PARTIDO'}
        </button>
      </div>

      {/* ── Formulario nuevo partido ── */}
      {formOpen && (
        <div className="bg-[#131313] border border-[#2A2A2A] p-4 mb-6">
          <p className="text-white font-black text-sm uppercase tracking-wider mb-4">Nuevo partido</p>
          <form onSubmit={handleCrearPartido} className="flex flex-col gap-4">

            {/* Equipos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Equipo local</label>
                <select
                  value={formP.localId}
                  onChange={(e) => { setFormP((p) => ({ ...p, localId: e.target.value })); setErrP('') }}
                  className={SELECT_CLS}
                >
                  <option value="">— Seleccioná —</option>
                  {equiposDiv.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Equipo visitante</label>
                <select
                  value={formP.visitanteId}
                  onChange={(e) => { setFormP((p) => ({ ...p, visitanteId: e.target.value })); setErrP('') }}
                  className={SELECT_CLS}
                >
                  <option value="">— Seleccioná —</option>
                  {equiposDiv
                    .filter((eq) => eq.id !== formP.localId)
                    .map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Preview VS */}
            {localPreview && visitantePreview && (
              <div className="flex items-center justify-center gap-4 py-2 border border-[#2A2A2A] bg-[#0A0A0A]">
                <div className="flex items-center gap-2">
                  <EquipoLogo nombre={localPreview.nombre} color={localPreview.color} size="sm" />
                  <span className="text-white text-sm font-bold">{localPreview.nombre}</span>
                </div>
                <span className="text-[#FF6B00] font-black text-xs tracking-widest">VS</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-bold">{visitantePreview.nombre}</span>
                  <EquipoLogo nombre={visitantePreview.nombre} color={visitantePreview.color} size="sm" />
                </div>
              </div>
            )}

            {/* Fecha y hora */}
            <div>
              <label className={LABEL_CLS}>Fecha y hora</label>
              <input
                type="datetime-local"
                value={formP.fechaHora}
                onChange={(e) => { setFormP((p) => ({ ...p, fechaHora: e.target.value })); setErrP('') }}
                className={INPUT_CLS + ' [color-scheme:dark]'}
              />
            </div>

            {/* Fase */}
            <div>
              <label className={LABEL_CLS}>Fase</label>
              <div className="flex gap-2">
                {(['regular', 'playoff'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormP((p) => ({ ...p, fase: f }))}
                    className={`flex-1 py-2.5 font-black text-xs tracking-widest uppercase border transition-colors
                      ${formP.fase === f
                        ? 'bg-[#FF6B00] text-black border-[#FF6B00]'
                        : 'bg-transparent text-[#888] border-[#2A2A2A] hover:border-[#444]'}`}
                  >
                    {f === 'regular' ? 'Fase Regular' : 'Play-off'}
                  </button>
                ))}
              </div>
            </div>

            {/* Condicional: número de fecha o ronda de playoff */}
            {formP.fase === 'regular' ? (
              <div>
                <label className={LABEL_CLS}>Número de fecha</label>
                <input
                  type="number"
                  min={1}
                  value={formP.fechaNumero}
                  onChange={(e) => setFormP((p) => ({ ...p, fechaNumero: e.target.value }))}
                  className={INPUT_CLS}
                />
              </div>
            ) : (
              <div>
                <label className={LABEL_CLS}>Ronda</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {RONDAS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormP((p) => ({ ...p, ronda: r }))}
                      className={`py-2.5 font-black text-xs tracking-widest uppercase border transition-colors
                        ${formP.ronda === r
                          ? 'bg-[#FF6B00] text-black border-[#FF6B00]'
                          : 'bg-transparent text-[#888] border-[#2A2A2A] hover:border-[#444]'}`}
                    >
                      {r === 'octavos' ? 'Octavos' : r === 'cuartos' ? 'Cuartos' : r === 'semifinal' ? 'Semis' : 'Final'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errP && <p className="text-[#FF4444] text-xs font-bold">{errP}</p>}

            <button type="submit" className={BTN_PRIMARY}>
              AGREGAR AL FIXTURE
            </button>
          </form>
        </div>
      )}

      {/* ── Fixture: Fase Regular ── */}
      {Object.keys(fechasMap).length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 bg-[#FF6B00]" />
            <p className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase">Fase Regular</p>
          </div>
          {Object.entries(fechasMap)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([fecha, games]) => (
              <div key={fecha} className="mb-5">
                <p className="text-[#444] text-[10px] font-black tracking-widest uppercase mb-2 pl-1">
                  Fecha {fecha}
                  <span className="ml-2 text-[#333]">· {games.length} {games.length === 1 ? 'partido' : 'partidos'}</span>
                </p>
                <div className="flex flex-col gap-1">
                  {games.map((p) => (
                    <PartidoRow key={p.id} partido={p} onDelete={handleEliminarPartido} />
                  ))}
                </div>
              </div>
            ))}
        </section>
      )}

      {/* ── Fixture: Play-off ── */}
      {Object.keys(rondasMap).length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 bg-[#FF6B00]" />
            <p className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase">Play-off</p>
          </div>
          {RONDAS.filter((r) => r && rondasMap[r]).map((r) => (
            <div key={r} className="mb-5">
              <p className="text-[#444] text-[10px] font-black tracking-widest uppercase mb-2 pl-1">
                {LABEL_RONDA[r!]}
              </p>
              <div className="flex flex-col gap-1">
                {rondasMap[r!].map((p) => (
                  <PartidoRow key={p.id} partido={p} onDelete={handleEliminarPartido} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Estado vacío */}
      {partidosDiv.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[#2A2A2A]">
          <p className="text-[#333] text-xs font-black tracking-widest uppercase">
            Sin partidos en esta división
          </p>
          <p className="text-[#222] text-xs mt-1">Usá el botón + PARTIDO para agregar</p>
        </div>
      )}
    </div>
  )
}

/* ── Componente fila de partido ── */
function PartidoRow({ partido: p, onDelete }: { partido: Partido; onDelete: (id: string) => void }) {
  const navigate = useNavigate()
  const fecha = new Date(p.fechaHora)
  const fechaStr = fecha.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' })
  const horaStr  = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const localGano    = p.resultado?.ganadorId === p.local.equipoId
  const visitanteGano = p.resultado?.ganadorId === p.visitante.equipoId

  return (
    <div className={`flex items-center gap-3 px-3 py-3 border
      ${p.estado === 'jugado'
        ? 'bg-[#131313] border-[#2A2A2A]'
        : 'bg-[#0A0A0A] border-[#1A1A1A]'}`}
    >
      {/* Dot de estado */}
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5
        ${p.estado === 'jugado' ? 'bg-[#27AE60]' : 'bg-[#F39C12]'}`}
      />

      {/* Equipos y marcador */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <EquipoLogo nombre={p.local.nombre} color={p.local.color} size="xs" />
          <span className={`text-sm font-bold truncate ${localGano ? 'text-white' : 'text-[#888]'}`}>
            {p.local.nombre}
          </span>
          {p.resultado && (
            <span className={`text-sm font-black ml-auto shrink-0 ${localGano ? 'text-white' : 'text-[#555]'}`}>
              {p.resultado.ptsLocal}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <EquipoLogo nombre={p.visitante.nombre} color={p.visitante.color} size="xs" />
          <span className={`text-sm font-bold truncate ${visitanteGano ? 'text-white' : 'text-[#888]'}`}>
            {p.visitante.nombre}
          </span>
          {p.resultado && (
            <span className={`text-sm font-black ml-auto shrink-0 ${visitanteGano ? 'text-white' : 'text-[#555]'}`}>
              {p.resultado.ptsVisitante}
            </span>
          )}
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="text-right shrink-0 pl-2">
        <p className="text-[#666] text-[10px] font-bold uppercase">{fechaStr}</p>
        <p className="text-[#444] text-[10px]">{horaStr}</p>
      </div>

      {/* Botón mesa de control (solo pendientes) */}
      {p.estado === 'pendiente' && (
        <button
          onClick={() => navigate(`/admin/mesa/${p.id}`)}
          className="shrink-0 bg-[#FF6B00] text-black font-black text-[10px] tracking-widest uppercase px-2 py-1 hover:bg-[#CC5500] transition-colors"
          title="Abrir mesa de control"
        >
          MESA
        </button>
      )}

      {/* Botón eliminar (solo pendientes) */}
      {p.estado === 'pendiente' && (
        <button
          onClick={() => onDelete(p.id)}
          className="text-[#2A2A2A] hover:text-[#FF4444] transition-colors p-1 shrink-0"
          title="Eliminar partido"
        >
          <TrashIcon />
        </button>
      )}
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
