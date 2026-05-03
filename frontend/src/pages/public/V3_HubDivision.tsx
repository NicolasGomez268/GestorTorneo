import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAdminStore }  from '../../stores/adminStore'
import { statsJugadores } from '../../data/statsJugadores'
import type { Partido }   from '../../data/tipos'
import Container          from '../../components/Container'
import EquipoLogo         from '../../components/EquipoLogo'

type Tab = 'posiciones' | 'goleadores' | 'fixture' | 'proximos' | 'playoff'

function getTab(search: string): Tab {
  if (search.includes('tab=goleadores')) return 'goleadores'
  if (search.includes('tab=fixture'))    return 'fixture'
  if (search.includes('tab=proximos'))   return 'proximos'
  if (search.includes('tab=playoff'))    return 'playoff'
  return 'posiciones'
}

const DESKTOP_TABS: { key: Tab; label: string }[] = [
  { key: 'posiciones', label: 'Posiciones' },
  { key: 'goleadores', label: 'Goleadores' },
  { key: 'fixture',    label: 'Fixture'    },
  { key: 'proximos',   label: 'Próximos'   },
  { key: 'playoff',    label: 'Play-off'   },
]

export default function V3_HubDivision() {
  const { torneoId, divId } = useParams()
  const { search }  = useLocation()
  const navigate    = useNavigate()
  const activeTab   = getTab(search)
  const { torneos, divisiones, equipos, partidos, jugadores } = useAdminStore()

  const torneo   = torneos.find((t) => t.id === torneoId)
  const division = divisiones.find((d) => d.id === divId)

  if (!torneo || !division) {
    return <div className="min-h-screen flex items-center justify-center text-[#888]">División no encontrada</div>
  }

  const tabUrl = (key: Tab) =>
    key === 'posiciones'
      ? `/torneo/${torneoId}/division/${divId}`
      : `/torneo/${torneoId}/division/${divId}?tab=${key}`

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Back link */}
      <Container className="pt-5">
        <button
          onClick={() => navigate(`/torneo/${torneoId}`)}
          className="flex items-center gap-1.5 text-[#555] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors mb-4"
        >
          ← {torneo.nombre}
        </button>

        {/* Título */}
        <h1 className="text-white font-black text-3xl sm:text-4xl lg:text-5xl italic uppercase leading-none mb-1">
          {division.nombre}
        </h1>
        <p className="text-[#555] text-xs font-bold tracking-widest uppercase mb-5">
          {torneo.nombre} · Temporada {torneo.temporada}
        </p>
      </Container>

      {/* Tab nav — solo desktop */}
      <div className="hidden lg:block border-b border-[#2A2A2A] mb-0">
        <Container>
          <nav className="flex gap-0">
            {DESKTOP_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => navigate(tabUrl(key))}
                className={`px-5 py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-colors
                  ${activeTab === key
                    ? 'text-[#FF6B00] border-[#FF6B00]'
                    : 'text-[#555] border-transparent hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </nav>
        </Container>
      </div>

      {/* Contenido del tab activo */}
      <Container className="py-4">
        {activeTab === 'posiciones' && <TabPosiciones divId={divId!} torneoId={torneoId!} />}
        {activeTab === 'goleadores' && <TabGoleadores divId={divId!} />}
        {activeTab === 'fixture'    && <TabFixture    divId={divId!} torneoId={torneoId!} />}
        {activeTab === 'proximos'   && <TabProximos   divId={divId!} torneoId={torneoId!} />}
        {activeTab === 'playoff'    && <TabPlayoff    divId={divId!} torneoId={torneoId!} />}
      </Container>
    </div>
  )
}

/* ══════════════════════════════════════
   TAB 1 — POSICIONES
══════════════════════════════════════ */
function TabPosiciones({ divId, torneoId }: { divId: string; torneoId: string }) {
  const navigate = useNavigate()
  const { equipos } = useAdminStore()
  const eqs = [...equipos.filter((e) => e.divisionId === divId)]
    .sort((a, b) => b.PT - a.PT || b.PG - a.PG)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px]">
          <thead>
            <tr className="border-b-2 border-[#2A2A2A]">
              {['#', 'EQUIPO', 'PJ', 'PG', 'PP', 'PT'].map((h) => (
                <th
                  key={h}
                  className={`py-3 text-[10px] font-black tracking-widest text-[#555]
                    ${h === 'EQUIPO' ? 'text-left px-2' : 'text-center px-1 w-9'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eqs.map((eq, idx) => (
              <tr
                key={eq.id}
                onClick={() => navigate(`/torneo/${torneoId}/division/${divId}/equipo/${eq.id}`)}
                className="border-b border-[#1A1A1A] hover:bg-[#1A1A1A] cursor-pointer transition-colors group"
              >
                {/* Indicador naranja en hover */}
                <td className="py-3 px-1 text-center relative">
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[#555] font-black text-xs font-tabular">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <EquipoLogo nombre={eq.nombre} color={eq.color} logoUrl={eq.logoUrl} size="xs" />
                    <span className="text-white font-bold text-xs lg:text-sm truncate max-w-[110px] lg:max-w-none">
                      {eq.nombre}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-1 text-center text-[#888] text-xs font-tabular">{eq.PJ}</td>
                <td className="py-3 px-1 text-center text-[#888] text-xs font-tabular">{eq.PG}</td>
                <td className="py-3 px-1 text-center text-[#888] text-xs font-tabular">{eq.PP}</td>
                <td className="py-3 px-1 text-center text-[#FF6B00] font-black text-sm font-tabular">{eq.PT}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[#333] text-[10px] font-bold tracking-widest uppercase text-right mt-3">
        PJ: Jugados · PG: Ganados · PP: Perdidos · PT: Puntos
      </p>
    </div>
  )
}

/* ══════════════════════════════════════
   TAB 2 — GOLEADORES
══════════════════════════════════════ */
function TabGoleadores({ divId }: { divId: string }) {
  const { partidos, equipos, jugadores } = useAdminStore()
  const divPartidos = partidos.filter((p) => p.divisionId === divId && p.estado === 'jugado')
  const partidoIds  = new Set(divPartidos.map((p) => p.id))

  // Sumar puntos por jugador
  const totales: Record<string, { nombre: string; apellido: string; numeroCamiseta: number; equipoId: string; puntos: number }> = {}
  statsJugadores
    .filter((s) => partidoIds.has(s.partidoId))
    .forEach((s) => {
      if (!totales[s.jugadorId]) {
        totales[s.jugadorId] = { nombre: s.nombre, apellido: s.apellido, numeroCamiseta: s.numeroCamiseta, equipoId: s.equipoId, puntos: 0 }
      }
      totales[s.jugadorId].puntos += s.puntos
    })

  const ranking = Object.entries(totales)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 10)

  if (ranking.length === 0) {
    return (
      <div className="py-16 text-center text-[#444] text-sm font-bold tracking-widest uppercase">
        Sin estadísticas disponibles
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[300px]">
        <thead>
          <tr className="border-b-2 border-[#2A2A2A]">
            {['#', 'JUGADOR', 'EQUIPO', 'PTS'].map((h) => (
              <th
                key={h}
                className={`py-3 text-[10px] font-black tracking-widest text-[#555]
                  ${h === 'JUGADOR' || h === 'EQUIPO' ? 'text-left px-2' : 'text-center px-1 w-10'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ranking.map((j, idx) => {
            const eq  = equipos.find((e) => e.id === j.equipoId)
            const jug = jugadores.find((ju) => ju.id === j.id)
            return (
              <tr key={j.id} className="border-b border-[#1A1A1A]">
                <td className="py-3 px-1 text-center text-[#555] font-black text-xs font-tabular">
                  {idx === 0 ? '🏆' : String(idx + 1).padStart(2, '0')}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {jug?.fotoUrl ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#2A2A2A]">
                        <img src={jug.fotoUrl} alt={j.nombre} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 flex items-center justify-center font-black text-white text-xs shrink-0"
                        style={{ backgroundColor: eq?.color ?? '#333' }}
                      >
                        {j.apellido[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-bold text-xs lg:text-sm leading-none">
                        {j.apellido.toUpperCase()}
                      </p>
                      <p className="text-[#555] text-[10px]">{j.nombre}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-[#888] text-xs truncate max-w-[80px] lg:max-w-none">
                  {eq?.nombre ?? '—'}
                </td>
                <td className="py-3 px-1 text-center text-[#FF6B00] font-black text-base font-tabular">
                  {j.puntos}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ══════════════════════════════════════
   TAB 3 — FIXTURE
══════════════════════════════════════ */
function TabFixture({ divId, torneoId }: { divId: string; torneoId: string }) {
  const navigate  = useNavigate()
  const { partidos, equipos: eqsStore } = useAdminStore()
  const resolveEq = (ref: { equipoId: string; nombre: string; color: string; logoUrl?: string }) => {
    const eq = eqsStore.find(e => e.id === ref.equipoId)
    return { nombre: eq?.nombre ?? ref.nombre, color: eq?.color ?? ref.color, logoUrl: eq?.logoUrl ?? ref.logoUrl }
  }
  const regulares = partidos
    .filter((p) => p.divisionId === divId && p.fase === 'regular')
    .sort((a, b) => a.fechaNumero - b.fechaNumero || new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())

  const porFecha = regulares.reduce<Record<number, typeof regulares>>((acc, p) => {
    ;(acc[p.fechaNumero] ??= []).push(p)
    return acc
  }, {})

  if (regulares.length === 0) {
    return (
      <div className="py-16 text-center text-[#444] text-sm font-bold tracking-widest uppercase">
        Sin partidos programados
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(porFecha).map(([fecha, ps]) => (
        <div key={fecha}>
          <p className="text-[#FF6B00] text-[10px] font-black tracking-[0.2em] uppercase mb-3">
            Fecha {fecha}
          </p>
          <div className="flex flex-col gap-2">
            {ps.map((p) => {
              const dt    = new Date(p.fechaHora)
              const local = resolveEq(p.local)
              const visit = resolveEq(p.visitante)
              return (
                <button
                  key={p.id}
                  onClick={() => p.estado === 'jugado'
                    ? navigate(`/torneo/${torneoId}/division/${divId}/partido/${p.id}`)
                    : undefined}
                  className={`w-full text-left bg-[#131313] border p-3 lg:p-4 transition-colors
                    ${p.estado === 'jugado'
                      ? 'border-[#2A2A2A] hover:border-[#FF6B00]/30 cursor-pointer'
                      : 'border-[#1A1A1A] cursor-default opacity-80'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Local */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <EquipoLogo nombre={local.nombre} color={local.color} logoUrl={local.logoUrl} size="xs" />
                      <span className="text-white font-bold text-xs lg:text-sm truncate">{local.nombre}</span>
                    </div>

                    {/* Resultado o fecha */}
                    <div className="shrink-0 text-center px-2">
                      {p.estado === 'jugado' && p.resultado ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-lg font-tabular ${p.resultado.ganadorId === p.local.equipoId ? 'text-white' : 'text-[#555]'}`}>
                            {p.resultado.ptsLocal}
                          </span>
                          <span className="text-[#333] font-black text-sm">—</span>
                          <span className={`font-black text-lg font-tabular ${p.resultado.ganadorId === p.visitante.equipoId ? 'text-white' : 'text-[#555]'}`}>
                            {p.resultado.ptsVisitante}
                          </span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-[#FF6B00] text-[10px] font-black tracking-wider">
                            {dt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).toUpperCase()}
                          </p>
                          <p className="text-[#888] text-[10px] font-bold">
                            {dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Visitante */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-white font-bold text-xs lg:text-sm truncate text-right">{visit.nombre}</span>
                      <EquipoLogo nombre={visit.nombre} color={visit.color} logoUrl={visit.logoUrl} size="xs" />
                    </div>
                  </div>

                  {p.estado === 'jugado' && (
                    <p className="text-[#333] text-[10px] font-bold tracking-wider text-right mt-1">
                      VER DETALLE →
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   TAB 4 — PRÓXIMOS
══════════════════════════════════════ */
function TabProximos({ divId, torneoId }: { divId: string; torneoId: string }) {
  const { partidos } = useAdminStore()
  const proximos = partidos
    .filter((p) => p.divisionId === divId && p.estado === 'pendiente' && p.fase === 'regular')
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
    .slice(0, 2)

  if (proximos.length === 0) {
    return (
      <div className="py-16 text-center text-[#444] text-sm font-bold tracking-widest uppercase">
        No hay próximos partidos
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {proximos.map((p) => (
        <ProximoCard key={p.id} partido={p} torneoId={torneoId} divId={divId} />
      ))}
    </div>
  )
}

function ProximoCard({ partido: p, torneoId, divId }: { partido: Partido; torneoId: string; divId: string }) {
  const [countdown, setCountdown] = useState('')
  const { equipos: eqs } = useAdminStore()
  const resolveEq = (ref: { equipoId: string; nombre: string; color: string; logoUrl?: string }) => {
    const eq = eqs.find(e => e.id === ref.equipoId)
    return { nombre: eq?.nombre ?? ref.nombre, color: eq?.color ?? ref.color, logoUrl: eq?.logoUrl ?? ref.logoUrl }
  }
  const local = resolveEq(p.local)
  const visit = resolveEq(p.visitante)

  useEffect(() => {
    const target = new Date(p.fechaHora).getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) { setCountdown('¡EN CURSO!'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [p.fechaHora])

  const dt = new Date(p.fechaHora)

  return (
    <div className="bg-[#131313] border border-[#2A2A2A] p-5 lg:p-6">
      <p className="text-[#FF6B00] text-[10px] font-black tracking-[0.2em] uppercase mb-4">
        Fecha {p.fechaNumero} · {dt.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}
      </p>

      {/* Enfrentamiento */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex flex-col items-center gap-2 flex-1">
          <EquipoLogo nombre={local.nombre} color={local.color} logoUrl={local.logoUrl} size="lg" />
          <span className="text-white font-black text-sm lg:text-base text-center leading-tight">{local.nombre}</span>
          <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest">Local</span>
        </div>

        <div className="text-center">
          <span className="text-[#333] font-black text-3xl">VS</span>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <EquipoLogo nombre={visit.nombre} color={visit.color} logoUrl={visit.logoUrl} size="lg" />
          <span className="text-white font-black text-sm lg:text-base text-center leading-tight">{visit.nombre}</span>
          <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest">Visitante</span>
        </div>
      </div>

      {/* Countdown */}
      <div className="border-t border-[#2A2A2A] pt-4 flex items-center justify-between">
        <div>
          <p className="text-[#555] text-[10px] font-black tracking-widest uppercase mb-0.5">Hora</p>
          <p className="text-white font-black text-lg">
            {dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
          </p>
        </div>
        <div className="text-right">
          <p className="text-[#555] text-[10px] font-black tracking-widest uppercase mb-0.5">Faltan</p>
          <p className="text-[#FF6B00] font-black text-xl font-tabular">{countdown}</p>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   TAB 5 — PLAY-OFF
══════════════════════════════════════ */
function TabPlayoff({ divId, torneoId }: { divId: string; torneoId: string }) {
  const navigate  = useNavigate()
  const { partidos } = useAdminStore()
  const playoffs  = partidos.filter((p) => p.divisionId === divId && p.fase === 'playoff')
  const semis     = playoffs.filter((p) => p.ronda === 'semifinal')
  const final     = playoffs.find((p) => p.ronda === 'final')

  if (playoffs.length === 0) {
    return (
      <div className="py-16 text-center text-[#444] text-sm font-bold tracking-widest uppercase">
        Sin datos de play-off
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[320px] flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-0">

        {/* Semifinales */}
        <div className="flex flex-col gap-3 lg:flex-1">
          <p className="text-[#555] text-[10px] font-black tracking-widest uppercase text-center mb-1">
            Semifinales
          </p>
          {semis.map((p) => (
            <LlaveCard key={p.id} partido={p} torneoId={torneoId} divId={divId} navigate={navigate} />
          ))}
        </div>

        {/* Conector */}
        <div className="hidden lg:flex flex-col items-center justify-center px-4">
          <div className="w-8 h-px bg-[#2A2A2A]" />
        </div>

        {/* Final */}
        <div className="lg:flex-1">
          <p className="text-[#555] text-[10px] font-black tracking-widest uppercase text-center mb-1">
            Final
          </p>
          {final && (
            <LlaveCard partido={final} torneoId={torneoId} divId={divId} navigate={navigate} highlight />
          )}
        </div>
      </div>
    </div>
  )
}

function LlaveCard({
  partido: p, torneoId, divId, navigate, highlight = false,
}: {
  partido: Partido
  torneoId: string; divId: string
  navigate: ReturnType<typeof useNavigate>
  highlight?: boolean
}) {
  const { equipos: eqs } = useAdminStore()
  const resolveEq = (ref: { equipoId: string; nombre: string; color: string; logoUrl?: string }) => {
    const eq = eqs.find(e => e.id === ref.equipoId)
    return { nombre: eq?.nombre ?? ref.nombre, color: eq?.color ?? ref.color, logoUrl: eq?.logoUrl ?? ref.logoUrl }
  }
  const localInfo = resolveEq(p.local)
  const visitInfo = resolveEq(p.visitante)

  return (
    <button
      onClick={() => p.estado === 'jugado'
        ? navigate(`/torneo/${torneoId}/division/${divId}/partido/${p.id}`)
        : undefined}
      className={`w-full text-left border p-3 transition-colors
        ${highlight ? 'bg-[#1A1A1A] border-[#FF6B00]/30' : 'bg-[#131313] border-[#2A2A2A]'}
        ${p.estado === 'jugado' ? 'hover:border-[#FF6B00]/50 cursor-pointer' : 'cursor-default'}`}
    >
      {[
        { info: localInfo,  pts: p.resultado?.ptsLocal,     ganador: p.resultado?.ganadorId === p.local.equipoId },
        { info: visitInfo,  pts: p.resultado?.ptsVisitante, ganador: p.resultado?.ganadorId === p.visitante.equipoId },
      ].map(({ info, pts, ganador }, i) => (
        <div key={i} className={`flex items-center justify-between py-1.5 ${i === 0 ? 'border-b border-[#2A2A2A]' : ''}`}>
          <div className="flex items-center gap-2">
            <EquipoLogo nombre={info.nombre} color={info.color} logoUrl={info.logoUrl} size="xs" />
            <span className={`text-xs font-bold truncate max-w-[120px] ${ganador ? 'text-white' : 'text-[#666]'}`}>
              {info.nombre}
            </span>
          </div>
          {pts !== undefined && (
            <span className={`font-black text-base font-tabular ml-2 ${ganador ? 'text-[#FF6B00]' : 'text-[#444]'}`}>
              {pts}
            </span>
          )}
          {pts === undefined && (
            <span className="text-[#333] text-xs font-bold">TBD</span>
          )}
        </div>
      ))}

      {p.estado === 'pendiente' && (
        <p className="text-[#333] text-[10px] font-bold tracking-wider text-center mt-2 uppercase">
          {new Date(p.fechaHora).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
        </p>
      )}
    </button>
  )
}
