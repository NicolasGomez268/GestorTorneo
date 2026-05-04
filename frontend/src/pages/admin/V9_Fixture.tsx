import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../stores/adminStore'
import type { Equipo, Partido, RondaPartido } from '../../data/tipos'
import EquipoLogo from '../../components/EquipoLogo'

const RONDAS: RondaPartido[] = ['octavos', 'cuartos', 'semifinal', 'final']

const LABEL_RONDA: Record<string, string> = {
  octavos:   'Octavos de Final',
  cuartos:   'Cuartos de Final',
  semifinal: 'Semifinales',
  final:     'Final',
}

/* ── Algoritmo round-robin ── */
function generarRoundRobin(equipos: Equipo[]): Array<[Equipo, Equipo][]> {
  const list: (Equipo | null)[] = [...equipos]
  if (list.length % 2 !== 0) list.push(null) // bye

  const rounds: Array<[Equipo, Equipo][]> = []
  const numRounds = list.length - 1

  for (let r = 0; r < numRounds; r++) {
    const games: [Equipo, Equipo][] = []
    for (let i = 0; i < list.length / 2; i++) {
      const home = list[i]
      const away = list[list.length - 1 - i]
      if (home && away) games.push([home, away])
    }
    rounds.push(games)
    list.splice(1, 0, list.pop()!)
  }
  return rounds
}

export default function V9_Fixture() {
  const {
    torneos,
    divisiones,
    equipos: equiposList,
    partidos: partidosList,
    addPartido,
    removePartido,
  } = useAdminStore()
  const mockIdSeq = useRef(0)
  const nextMockId = (prefijo: string) => `${prefijo}-${++mockIdSeq.current}`
  const [formOpen, setFormOpen] = useState(false)

  const navigate = useNavigate()
  const [torneoId, setTorneoId] = useState(torneos[0]?.id ?? '')
  const [divId,    setDivId]    = useState(() => divisiones.find(d => d.torneoId === torneos[0]?.id)?.id ?? '')

  const divsDeTorneo = divisiones.filter((d) => d.torneoId === torneoId)

  /* ── Cambiar torneo ── */
  const handleChangeTorneo = (id: string) => {
    setTorneoId(id)
    const primeraDiv = divisiones.find((d) => d.torneoId === id)?.id ?? ''
    setDivId(primeraDiv)
    setFormOpen(false)
    setGenOpen(false)
  }

  /* ── Form partido manual ── */
  const [formP, setFormP] = useState({
    localId:     '',
    visitanteId: '',
    fechaHora:   '',
    fase:        'regular' as 'regular' | 'playoff',
    fechaNumero: '1',
    ronda:       'semifinal' as RondaPartido,
  })
  const [errP, setErrP] = useState('')

  /* ── Form generador automático ── */
  const [genOpen, setGenOpen] = useState(false)
  const [genConfig, setGenConfig] = useState({
    tipo:            'ida' as 'ida' | 'idavuelta',
    primeraFecha:    '',
    hora:            '20:00',
    diasEntreRondas: '7',
  })
  const [errGen, setErrGen] = useState('')

  const equiposDiv  = equiposList.filter((e) => e.divisionId === divId)
  const partidosDiv = partidosList
    .filter((p) => p.divisionId === divId)
    .sort((a, b) => {
      if (a.fase !== b.fase) return a.fase === 'regular' ? -1 : 1
      return a.fechaNumero - b.fechaNumero
    })

  const regularPartidos = partidosDiv.filter((p) => p.fase === 'regular')
  const playoffPartidos = partidosDiv.filter((p) => p.fase === 'playoff')

  const fechasMap = regularPartidos.reduce<Record<number, Partido[]>>((acc, p) => {
    ;(acc[p.fechaNumero] ??= []).push(p)
    return acc
  }, {})

  const rondasMap = playoffPartidos.reduce<Record<string, Partido[]>>((acc, p) => {
    const key = p.ronda ?? 'otro'
    ;(acc[key] ??= []).push(p)
    return acc
  }, {})

  /* ── Crear partido manual ── */
  const handleCrearPartido = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!formP.localId)     { setErrP('Seleccioná el equipo local'); return }
    if (!formP.visitanteId) { setErrP('Seleccioná el equipo visitante'); return }
    if (formP.localId === formP.visitanteId) { setErrP('Local y visitante no pueden ser el mismo'); return }
    if (!formP.fechaHora)   { setErrP('Seleccioná fecha y hora'); return }

    const local     = equiposDiv.find((eq) => eq.id === formP.localId)!
    const visitante = equiposDiv.find((eq) => eq.id === formP.visitanteId)!
    const fechaNum  = formP.fase === 'regular' ? (parseInt(formP.fechaNumero) || 1) : 99

    const nuevo: Partido = {
      id:          nextMockId('p'),
      divisionId:  divId,
      fechaNumero: fechaNum,
      fechaHora:   formP.fechaHora,
      local:       { equipoId: local.id,     nombre: local.nombre,     color: local.color,     logoUrl: local.logoUrl },
      visitante:   { equipoId: visitante.id, nombre: visitante.nombre, color: visitante.color, logoUrl: visitante.logoUrl },
      estado:      'pendiente',
      fase:        formP.fase,
      ronda:       formP.fase === 'playoff' ? formP.ronda : null,
    }
    addPartido(nuevo)
    setFormP({ localId: '', visitanteId: '', fechaHora: '', fase: 'regular', fechaNumero: '1', ronda: 'semifinal' })
    setErrP('')
    setFormOpen(false)
  }

  /* ── Generar fixture automático ── */
  const handleGenerarFixture = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (equiposDiv.length < 2) { setErrGen('Necesitás al menos 2 equipos en esta división'); return }
    if (!genConfig.primeraFecha) { setErrGen('Ingresá la fecha de la primera jornada'); return }

    const rounds    = generarRoundRobin(equiposDiv)
    const numRounds = rounds.length
    const diasGap   = parseInt(genConfig.diasEntreRondas) || 7
    const baseDate  = new Date(`${genConfig.primeraFecha}T${genConfig.hora}`)
    const nuevos: Partido[] = []

    const buildPartidos = (rds: Array<[Equipo, Equipo][]>, offset: number) => {
      rds.forEach((games, rIdx) => {
        const dt = new Date(baseDate)
        dt.setDate(dt.getDate() + (rIdx + offset) * diasGap)
        const fechaHora = dt.toISOString().slice(0, 16)
        games.forEach(([local, visitante]) => {
          nuevos.push({
            id:          `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            divisionId:  divId,
            fechaNumero: rIdx + 1 + offset * numRounds,
            fechaHora,
            local:       { equipoId: local.id,     nombre: local.nombre,     color: local.color,     logoUrl: local.logoUrl },
            visitante:   { equipoId: visitante.id, nombre: visitante.nombre, color: visitante.color, logoUrl: visitante.logoUrl },
            estado:      'pendiente',
            fase:        'regular',
            ronda:       null,
          })
        })
      })
    }

    buildPartidos(rounds, 0)
    if (genConfig.tipo === 'idavuelta') {
      const vuelta = rounds.map((games) => games.map(([h, a]) => [a, h] as [Equipo, Equipo]))
      buildPartidos(vuelta, numRounds)
    }

    nuevos.forEach(addPartido)
    setGenOpen(false)
    setErrGen('')
    setGenConfig({ tipo: 'ida', primeraFecha: '', hora: '20:00', diasEntreRondas: '7' })
  }

  const localPreview    = equiposDiv.find((eq) => eq.id === formP.localId)
  const visitantePreview = equiposDiv.find((eq) => eq.id === formP.visitanteId)
  const yaHayPartidos   = regularPartidos.length > 0

  return (
    <div>
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-1.5 text-[#555] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors mb-6"
      >
        ← Panel de control
      </button>

      <h1 className="text-white font-black text-2xl lg:text-3xl italic uppercase mb-6">
        Armar Fixture
      </h1>

      {/* Selectores torneo + división */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className={LABEL_CLS}>Torneo</label>
          <select
            value={torneoId}
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
            value={divId}
            onChange={(e) => { setDivId(e.target.value); setFormOpen(false); setGenOpen(false) }}
            className={SELECT_CLS}
            disabled={divsDeTorneo.length === 0}
          >
            {divsDeTorneo.length === 0
              ? <option>Sin divisiones</option>
              : divsDeTorneo.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
          </select>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setGenOpen((v) => !v); setFormOpen(false) }}
          disabled={equiposDiv.length < 2}
          className={`flex-1 py-[11px] px-4 font-black text-xs tracking-widest uppercase border transition-colors
            ${genOpen
              ? 'bg-[#FF6B00] text-black border-[#FF6B00]'
              : 'bg-transparent text-[#888] border-[#2A2A2A] hover:border-[#FF6B00]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'}`}
        >
          {genOpen ? '✕ CERRAR' : '⚡ GENERAR FIXTURE'}
        </button>
        <button
          onClick={() => { setFormOpen((v) => !v); setGenOpen(false) }}
          disabled={equiposDiv.length < 2}
          className="bg-[#FF6B00] text-black font-black py-[11px] px-5 text-xs tracking-widest uppercase hover:bg-[#CC5500] transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {formOpen ? '✕ CERRAR' : '+ PARTIDO'}
        </button>
      </div>

      {equiposDiv.length < 2 && divId && (
        <p className="text-[#444] text-[10px] font-bold tracking-widest uppercase mb-6">
          Necesitás al menos 2 equipos en la división para crear partidos
        </p>
      )}

      {/* ── Panel generador automático ── */}
      {genOpen && (
        <div className="bg-[#131313] border border-[#FF6B00]/20 p-4 mb-6">
          <p className="text-[#FF6B00] font-black text-xs tracking-widest uppercase mb-1">Generador round-robin</p>
          <p className="text-[#555] text-[10px] mb-4">
            {equiposDiv.length} equipos · {equiposDiv.length % 2 === 0 ? equiposDiv.length - 1 : equiposDiv.length} fechas (solo ida)
          </p>

          {yaHayPartidos && (
            <div className="border border-[#F39C12]/30 bg-[#F39C12]/5 px-3 py-2.5 mb-4">
              <p className="text-[#F39C12] text-[10px] font-black tracking-wider uppercase">
                Atención: ya hay {regularPartidos.length} partido{regularPartidos.length !== 1 ? 's' : ''} cargado{regularPartidos.length !== 1 ? 's' : ''} en fase regular
              </p>
              <p className="text-[#888] text-[10px] mt-0.5">Se agregarán los nuevos sin borrar los existentes.</p>
            </div>
          )}

          <form onSubmit={handleGenerarFixture} className="flex flex-col gap-4">
            {/* Tipo */}
            <div>
              <label className={LABEL_CLS}>Tipo de torneo</label>
              <div className="flex gap-2">
                {(['ida', 'idavuelta'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGenConfig((c) => ({ ...c, tipo: t }))}
                    className={`flex-1 py-2.5 font-black text-xs tracking-widest uppercase border transition-colors
                      ${genConfig.tipo === t
                        ? 'bg-[#FF6B00] text-black border-[#FF6B00]'
                        : 'bg-transparent text-[#888] border-[#2A2A2A] hover:border-[#444]'}`}
                  >
                    {t === 'ida' ? 'Solo ida' : 'Ida y vuelta'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Primera fecha</label>
                <input
                  type="date"
                  value={genConfig.primeraFecha}
                  onChange={(e) => { setGenConfig((c) => ({ ...c, primeraFecha: e.target.value })); setErrGen('') }}
                  className={INPUT_CLS + ' [color-scheme:dark]'}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Hora (por defecto)</label>
                <input
                  type="time"
                  value={genConfig.hora}
                  onChange={(e) => setGenConfig((c) => ({ ...c, hora: e.target.value }))}
                  className={INPUT_CLS + ' [color-scheme:dark]'}
                />
              </div>
            </div>

            <div>
              <label className={LABEL_CLS}>Días entre fechas</label>
              <input
                type="number"
                min={1}
                value={genConfig.diasEntreRondas}
                onChange={(e) => setGenConfig((c) => ({ ...c, diasEntreRondas: e.target.value }))}
                className={INPUT_CLS}
              />
            </div>

            {errGen && <p className="text-[#FF4444] text-xs font-bold">{errGen}</p>}

            <button type="submit" className={BTN_PRIMARY}>
              GENERAR {genConfig.tipo === 'idavuelta' ? 'IDA Y VUELTA' : 'SOLO IDA'}
            </button>
          </form>
        </div>
      )}

      {/* ── Formulario nuevo partido manual ── */}
      {formOpen && (
        <div className="bg-[#131313] border border-[#2A2A2A] p-4 mb-6">
          <p className="text-white font-black text-sm uppercase tracking-wider mb-4">Nuevo partido</p>
          <form onSubmit={handleCrearPartido} className="flex flex-col gap-4">

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

            {localPreview && visitantePreview && (
              <div className="flex items-center justify-center gap-4 py-2 border border-[#2A2A2A] bg-[#0A0A0A]">
                <div className="flex items-center gap-2">
                  <EquipoLogo nombre={localPreview.nombre} color={localPreview.color} logoUrl={localPreview.logoUrl} size="sm" />
                  <span className="text-white text-sm font-bold">{localPreview.nombre}</span>
                </div>
                <span className="text-[#FF6B00] font-black text-xs tracking-widest">VS</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-bold">{visitantePreview.nombre}</span>
                  <EquipoLogo nombre={visitantePreview.nombre} color={visitantePreview.color} logoUrl={visitantePreview.logoUrl} size="sm" />
                </div>
              </div>
            )}

            <div>
              <label className={LABEL_CLS}>Fecha y hora</label>
              <input
                type="datetime-local"
                value={formP.fechaHora}
                onChange={(e) => { setFormP((p) => ({ ...p, fechaHora: e.target.value })); setErrP('') }}
                className={INPUT_CLS + ' [color-scheme:dark]'}
              />
            </div>

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
            <span className="text-[#333] text-[10px] font-bold ml-auto">
              {regularPartidos.length} partidos · {Object.keys(fechasMap).length} fechas
            </span>
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
                    <PartidoRow key={p.id} partido={p} onDelete={removePartido} />
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
                  <PartidoRow key={p.id} partido={p} onDelete={removePartido} />
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
          <p className="text-[#222] text-xs mt-1">
            {equiposDiv.length >= 2
              ? 'Usá ⚡ GENERAR FIXTURE para crear el calendario automáticamente'
              : 'Primero agregá equipos desde Gestión de Equipos'}
          </p>
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

  const localGano     = p.resultado?.ganadorId === p.local.equipoId
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
          <EquipoLogo nombre={p.local.nombre} color={p.local.color} logoUrl={p.local.logoUrl} size="xs" />
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
          <EquipoLogo nombre={p.visitante.nombre} color={p.visitante.color} logoUrl={p.visitante.logoUrl} size="xs" />
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
