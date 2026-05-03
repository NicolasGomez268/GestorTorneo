import { useParams, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { useAdminStore }  from '../../stores/adminStore'
import { statsJugadores } from '../../data/statsJugadores'
import Container          from '../../components/Container'
import EquipoLogo         from '../../components/EquipoLogo'

export default function V5_Partido() {
  const { torneoId, divId, partidoId } = useParams()
  const navigate = useNavigate()
  const { partidos, equipos, divisiones } = useAdminStore()

  const [boxTab, setBoxTab]         = useState<'local' | 'visitante'>('local')
  const [modalGol, setModalGol]     = useState(false)
  const [modalCamp, setModalCamp]   = useState(false)
  const [descargando, setDescargando] = useState(false)

  const refGoleador  = useRef<HTMLDivElement>(null)
  const refCampeon   = useRef<HTMLDivElement>(null)

  const partido  = partidos.find((p) => p.id === partidoId)
  const division = divisiones.find((d) => d.id === divId)

  if (!partido || !division) {
    return <div className="min-h-screen flex items-center justify-center text-[#888]">Partido no encontrado</div>
  }

  // Resolver info actual del equipo desde el store (por si fue editado después de crear el partido)
  const eqLocal     = equipos.find((e) => e.id === partido.local.equipoId)
  const eqVisitante = equipos.find((e) => e.id === partido.visitante.equipoId)
  const localInfo = {
    nombre:  eqLocal?.nombre  ?? partido.local.nombre,
    color:   eqLocal?.color   ?? partido.local.color,
    logoUrl: eqLocal?.logoUrl ?? partido.local.logoUrl,
  }
  const visitanteInfo = {
    nombre:  eqVisitante?.nombre  ?? partido.visitante.nombre,
    color:   eqVisitante?.color   ?? partido.visitante.color,
    logoUrl: eqVisitante?.logoUrl ?? partido.visitante.logoUrl,
  }

  const statsLocal     = statsJugadores.filter((s) => s.partidoId === partidoId && s.equipo === 'local')
    .sort((a, b) => b.puntos - a.puntos)
  const statsVisitante = statsJugadores.filter((s) => s.partidoId === partidoId && s.equipo === 'visitante')
    .sort((a, b) => b.puntos - a.puntos)
  const todosStats     = [...statsLocal, ...statsVisitante]

  const goleador = todosStats.reduce<typeof todosStats[number] | null>(
    (top, s) => (!top || s.puntos > top.puntos ? s : top), null
  )

  const eqGoleador = goleador ? equipos.find((e) => e.id === goleador.equipoId) : null

  const esFinal       = partido.ronda === 'final' && partido.estado === 'jugado'
  const equipoCampeon = esFinal && partido.resultado
    ? equipos.find((e) => e.id === partido.resultado!.ganadorId)
    : null

  const descargarImagen = async (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return
    setDescargando(true)
    try {
      const canvas = await html2canvas(ref.current, { useCORS: true, scale: 2, backgroundColor: null })
      const link   = document.createElement('a')
      link.download = 'mi-torneo-share.png'
      link.href     = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDescargando(false)
    }
  }

  const fmtMin = (m: number) => `${String(Math.floor(m)).padStart(2, '0')}:00`

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Container className="py-5">
        {/* Back */}
        <button
          onClick={() => navigate(`/torneo/${torneoId}/division/${divId}`)}
          className="flex items-center gap-1.5 text-[#555] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors mb-6"
        >
          ← {division.nombre}
        </button>

        {/* Header marcador */}
        <div className="bg-[#131313] border border-[#2A2A2A] p-5 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Local */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <EquipoLogo nombre={localInfo.nombre} color={localInfo.color} logoUrl={localInfo.logoUrl} size="lg" />
              <p className="text-white font-bold text-sm text-center leading-tight">{localInfo.nombre}</p>
              <p className="text-[#555] text-[10px] font-black uppercase tracking-widest">Local</p>
            </div>

            {/* Marcador */}
            <div className="text-center shrink-0">
              {partido.estado === 'jugado' && partido.resultado ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-5xl lg:text-6xl font-tabular ${partido.resultado.ganadorId === partido.local.equipoId ? 'text-white' : 'text-[#444]'}`}>
                      {partido.resultado.ptsLocal}
                    </span>
                    <span className="text-[#333] font-black text-2xl">—</span>
                    <span className={`font-black text-5xl lg:text-6xl font-tabular ${partido.resultado.ganadorId === partido.visitante.equipoId ? 'text-white' : 'text-[#444]'}`}>
                      {partido.resultado.ptsVisitante}
                    </span>
                  </div>
                  <span className="inline-block mt-2 bg-[#2A2A2A] text-[#888] text-[10px] font-black tracking-widest uppercase px-3 py-1">
                    FINALIZADO
                  </span>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-[#FF6B00] font-black text-xl">VS</p>
                  <p className="text-[#888] text-xs mt-1">
                    {new Date(partido.fechaHora).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-[#888] text-xs">
                    {new Date(partido.fechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                  </p>
                </div>
              )}
            </div>

            {/* Visitante */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <EquipoLogo nombre={visitanteInfo.nombre} color={visitanteInfo.color} logoUrl={visitanteInfo.logoUrl} size="lg" />
              <p className="text-white font-bold text-sm text-center leading-tight">{visitanteInfo.nombre}</p>
              <p className="text-[#555] text-[10px] font-black uppercase tracking-widest">Visitante</p>
            </div>
          </div>
        </div>

        {/* Goleador del partido */}
        {goleador && eqGoleador && (
          <div className="bg-[#131313] border border-[#2A2A2A] p-4 mb-4">
            <p className="text-[#FF6B00] text-[10px] font-black tracking-[0.2em] uppercase mb-3">
              Goleador del partido
            </p>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 flex items-center justify-center font-black text-white text-xl shrink-0 font-tabular"
                style={{ backgroundColor: eqGoleador.color }}
              >
                {goleador.dorsal}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-xl leading-none truncate">
                  {goleador.apellido.toUpperCase()}
                </p>
                <p className="text-[#888] text-xs mt-0.5">{goleador.nombre} · {eqGoleador.nombre}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#FF6B00] font-black text-3xl font-tabular leading-none">{goleador.puntos}</p>
                <p className="text-[#555] text-[10px] font-black uppercase tracking-wider">puntos</p>
              </div>
            </div>
            {(goleador.rebotes > 0 || goleador.asistencias > 0) && (
              <div className="flex gap-6 mt-3 pt-3 border-t border-[#1A1A1A]">
                {goleador.rebotes > 0 && (
                  <div>
                    <p className="text-[#555] text-[9px] font-black uppercase tracking-widest">Rebotes</p>
                    <p className="text-white font-black text-lg font-tabular">{goleador.rebotes}</p>
                  </div>
                )}
                {goleador.asistencias > 0 && (
                  <div>
                    <p className="text-[#555] text-[9px] font-black uppercase tracking-widest">Asistencias</p>
                    <p className="text-white font-black text-lg font-tabular">{goleador.asistencias}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botones Instagram */}
        {partido.estado === 'jugado' && (
          <div className="flex flex-col gap-2 mb-6">
            {goleador && (
              <button
                onClick={() => setModalGol(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] text-black font-black py-4 tracking-widest uppercase text-sm hover:bg-[#CC5500] transition-colors"
              >
                <ShareIcon /> Compartir goleador en Instagram
              </button>
            )}
            {equipoCampeon && (
              <button
                onClick={() => setModalCamp(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#131313] border border-[#FF6B00] text-[#FF6B00] font-black py-4 tracking-widest uppercase text-sm hover:bg-[#1A1A1A] transition-colors"
              >
                <TrophyIcon /> Compartir campeón en Instagram
              </button>
            )}
          </div>
        )}

        {/* Box score */}
        {todosStats.length > 0 && (
          <div>
            <div className="flex items-center gap-0 mb-0 border-b border-[#2A2A2A]">
              <h2 className="text-white font-black text-lg uppercase tracking-wider mr-4">Box Score</h2>
              {[
                { key: 'local' as const,     label: localInfo.nombre     },
                { key: 'visitante' as const, label: visitanteInfo.nombre },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setBoxTab(key)}
                  className={`px-4 py-3 text-[10px] font-black tracking-widest uppercase border-b-2 transition-colors
                    ${boxTab === key ? 'text-[#FF6B00] border-[#FF6B00]' : 'text-[#555] border-transparent hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <BoxScoreTable stats={boxTab === 'local' ? statsLocal : statsVisitante} fmtMin={fmtMin} />
          </div>
        )}
      </Container>

      {/* ── Modal Goleador ── */}
      {modalGol && goleador && eqGoleador && (
        <ModalOverlay onClose={() => setModalGol(false)}>
          <div
            ref={refGoleador}
            className="w-full max-w-[360px] mx-auto"
            style={{
              aspectRatio: '9/16',
              background: `linear-gradient(160deg, ${eqGoleador.color}dd 0%, #0A0A0A 60%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 24px',
              position: 'relative',
            }}
          >
            {/* Dorsal enorme */}
            <div
              className="font-black text-white leading-none font-tabular"
              style={{ fontSize: 'clamp(120px, 40vw, 200px)', opacity: 0.15, position: 'absolute', userSelect: 'none' }}
            >
              {goleador.dorsal}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4 text-center">
              <p className="text-white/60 text-[11px] font-black tracking-[0.3em] uppercase">
                Goleador del partido
              </p>

              {/* Dorsal visible */}
              <div
                className="w-24 h-24 flex items-center justify-center font-black text-white text-4xl font-tabular"
                style={{ backgroundColor: eqGoleador.color }}
              >
                {goleador.dorsal}
              </div>

              <div>
                <p className="text-white font-black text-4xl italic uppercase leading-none">
                  {goleador.apellido}
                </p>
                <p className="text-white/70 font-bold text-lg">{goleador.nombre}</p>
              </div>

              <div
                className="px-8 py-3 font-black text-5xl font-tabular"
                style={{ backgroundColor: eqGoleador.color, color: '#000' }}
              >
                {goleador.puntos} PTS
              </div>

              <p className="text-white/50 text-xs font-bold tracking-widest uppercase mt-2">
                {eqGoleador.nombre}
              </p>
            </div>

            {/* Branding */}
            <div className="absolute bottom-6 flex items-center gap-2">
              <span className="text-white/40 text-[10px] font-black tracking-widest uppercase">MI TORNEO</span>
              <span className="text-white/20 text-[10px]">·</span>
              <span className="text-white/40 text-[10px] font-bold">TICHB 2024</span>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <button
              onClick={() => descargarImagen(refGoleador)}
              disabled={descargando}
              className="w-full bg-[#FF6B00] text-black font-black py-4 tracking-widest uppercase text-sm disabled:opacity-60 hover:bg-[#CC5500] transition-colors flex items-center justify-center gap-2"
            >
              <DownloadIcon /> {descargando ? 'Generando...' : 'Descargar imagen PNG'}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* ── Modal Campeón ── */}
      {modalCamp && equipoCampeon && (
        <ModalOverlay onClose={() => setModalCamp(false)}>
          <div
            ref={refCampeon}
            className="w-full max-w-[360px] mx-auto"
            style={{
              aspectRatio: '9/16',
              background: 'linear-gradient(160deg, #1a0a00 0%, #0A0A0A 50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Fondo color equipo */}
            <div
              style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at 50% 40%, ${equipoCampeon.color}30 0%, transparent 70%)`,
              }}
            />

            <div className="relative z-10 flex flex-col items-center gap-5 text-center">
              <p className="text-[#FF6B00] text-[11px] font-black tracking-[0.3em] uppercase">
                Temporada 2024
              </p>

              <p className="text-white font-black text-5xl italic uppercase leading-none">
                CAMPEONES
              </p>

              <EquipoLogo nombre={equipoCampeon.nombre} color={equipoCampeon.color} size="xl" />

              <TrophyBig />

              <p className="text-white font-black text-3xl italic uppercase">
                {equipoCampeon.nombre}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <div className="h-px w-12 bg-white/20" />
                <span className="text-white/50 text-[10px] font-black tracking-widest uppercase">MI TORNEO</span>
                <div className="h-px w-12 bg-white/20" />
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <button
              onClick={() => descargarImagen(refCampeon)}
              disabled={descargando}
              className="w-full bg-[#FF6B00] text-black font-black py-4 tracking-widest uppercase text-sm disabled:opacity-60 hover:bg-[#CC5500] transition-colors flex items-center justify-center gap-2"
            >
              <DownloadIcon /> {descargando ? 'Generando...' : 'Descargar imagen PNG'}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}

/* ── Sub-componentes ── */

function BoxScoreTable({ stats, fmtMin }: { stats: typeof statsJugadores; fmtMin: (m: number) => string }) {
  if (stats.length === 0) {
    return <p className="py-8 text-center text-[#444] text-sm font-bold tracking-widest uppercase">Sin datos</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[280px]">
        <thead>
          <tr className="border-b border-[#2A2A2A]">
            <th className="py-3 px-2 text-left text-[10px] font-black tracking-widest text-[#555]">JUGADOR</th>
            <th className="py-3 px-1 text-center text-[10px] font-black tracking-widest text-[#555] w-12">MIN</th>
            <th className="py-3 px-1 text-center text-[10px] font-black tracking-widest text-[#555] w-10">FAL</th>
            <th className="py-3 px-1 text-center text-[10px] font-black tracking-widest text-[#555] w-10">REB</th>
            <th className="py-3 px-1 text-center text-[10px] font-black tracking-widest text-[#555] w-10">PTS</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.jugadorId} className="border-b border-[#1A1A1A]">
              <td className="py-3 px-2">
                <p className="text-white font-bold text-xs truncate max-w-[120px] lg:max-w-none">
                  {s.apellido}, {s.nombre}
                </p>
              </td>
              <td className="py-2 px-1 text-center text-[#888] text-xs font-tabular">{fmtMin(s.minutosJugados)}</td>
              <td className="py-2 px-1 text-center text-[#888] text-xs font-tabular">{s.faltas}</td>
              <td className="py-2 px-1 text-center text-[#888] text-xs font-tabular">{s.rebotes}</td>
              <td className="py-2 px-1 text-center text-[#FF6B00] font-black text-sm font-tabular">{s.puntos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col overflow-y-auto">
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          className="text-[#888] hover:text-white font-black text-2xl w-10 h-10 flex items-center justify-center"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-start pb-8 px-4">
        {children}
      </div>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12M6 3a4 4 0 004 4h4a4 4 0 004-4M6 3H4a1 1 0 00-1 1v2a4 4 0 003 3.87M18 3h2a1 1 0 011 1v2a4 4 0 01-3 3.87M12 14v4m-3 2h6" />
    </svg>
  )
}

function TrophyBig() {
  return (
    <svg className="w-16 h-16" viewBox="0 0 24 24" fill="#FFD700">
      <path d="M6 3h12M6 3a4 4 0 004 4h4a4 4 0 004-4M6 3H4a1 1 0 00-1 1v2a4 4 0 003 3.87M18 3h2a1 1 0 011 1v2a4 4 0 01-3 3.87M12 14v4m-3 2h6" stroke="#FFD700" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="11" r="3" fill="#FFD700" opacity={0.3} />
    </svg>
  )
}
