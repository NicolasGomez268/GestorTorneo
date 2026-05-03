import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../stores/adminStore'

const ACTIVIDAD = [
  { texto: 'Planilla de juego finalizada: Shadow Titans vs Neon Drifters',  hora: '14:32' },
  { texto: 'Nuevo jugador inscripto: Marcos Vega — Shadow Titans',          hora: '12:15' },
  { texto: 'Fixture Fecha 3 publicado — División A',                        hora: '10:04' },
  { texto: 'División B actualizada: 6 equipos confirmados',                 hora: '09:30' },
]

export default function V6_Dashboard() {
  const navigate = useNavigate()
  const { partidos, equipos, divisiones } = useAdminStore()
  const [showSelector, setShowSelector] = useState(false)

  const pendientes = partidos.filter((p) => p.estado === 'pendiente')
  const totalEq    = equipos.length

  const handleMesaClick = () => {
    if (pendientes.length === 0) { alert('No hay partidos pendientes para controlar.'); return }
    setShowSelector(true)
  }

  const CARDS = [
    { to: '/admin/torneo',  label: 'Gestionar Torneo',  desc: 'Configurá el torneo, divisiones y parámetros generales.', cta: 'ENTRAR',      icon: <TournamentIcon />, mesa: false },
    { to: '/admin/equipos', label: 'Gestionar Equipos', desc: 'Administrá plantillas y jugadores de cada división.',      cta: 'ADMINISTRAR', icon: <TeamsIcon />,      mesa: false },
    { to: '/admin/fixture', label: 'Armar Fixture',     desc: 'Generá el calendario de cruces, fechas y horarios.',       cta: 'ORGANIZAR',   icon: <FixtureIcon />,    mesa: false },
    { to: '',               label: 'Mesa de Control',   desc: 'Cargá estadísticas en vivo y manejá el tanteador.',        cta: 'INICIAR',     icon: <MesaIcon />,       mesa: true  },
  ]

  return (
    <div>
      {/* Banner mobile */}
      <div className="lg:hidden bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] text-xs font-bold px-4 py-3 mb-6 flex items-start gap-2">
        <span className="shrink-0">ℹ</span>
        <span>El panel de administración está optimizado para tablet o computadora.</span>
      </div>

      {/* Bienvenida */}
      <div className="mb-8">
        <p className="text-[#FF6B00] text-[10px] font-black tracking-[0.25em] uppercase mb-1">Panel de control</p>
        <h1 className="text-white font-black text-3xl lg:text-4xl italic uppercase leading-none">
          Bienvenido,<br /><span className="text-[#888]">Director de Torneo</span>
        </h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {CARDS.map((card) => (
          <button
            key={card.label}
            onClick={() => card.mesa ? handleMesaClick() : navigate(card.to)}
            className="w-full text-left bg-[#131313] border border-[#2A2A2A] p-5 hover:border-[#FF6B00]/40 active:bg-[#1A1A1A] transition-colors group"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="text-[#FF6B00]">{card.icon}</div>
              {card.mesa && (
                <span className="text-[10px] font-black tracking-widest text-[#888] border border-[#2A2A2A] px-2 py-0.5">TABLET</span>
              )}
            </div>
            <h2 className="text-white font-black text-xl uppercase tracking-wide mb-2">{card.label}</h2>
            <p className="text-[#555] text-xs leading-relaxed mb-4">{card.desc}</p>
            <span className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
              {card.cta} →
            </span>
          </button>
        ))}
      </div>

      {/* Estado general */}
      <div className="bg-[#FF6B00] p-5 mb-6">
        <p className="text-black/60 text-[10px] font-black tracking-[0.2em] uppercase mb-3">Estado general</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-black font-black text-4xl font-tabular leading-none">{totalEq}</p>
            <p className="text-black/70 text-xs font-black uppercase tracking-wider mt-1">Equipos activos</p>
          </div>
          <div>
            <p className="text-black font-black text-4xl font-tabular leading-none">{pendientes.length}</p>
            <p className="text-black/70 text-xs font-black uppercase tracking-wider mt-1">Partidos pendientes</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="w-full bg-black text-white font-black text-xs tracking-widest uppercase py-3 hover:bg-[#131313] transition-colors"
        >
          GENERAR REPORTE
        </button>
      </div>

      {/* Actividad reciente */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-black text-sm uppercase tracking-wider">Actividad reciente</h2>
          <span className="text-[#333] text-[10px] font-bold tracking-widest uppercase">Actualizado ahora</span>
        </div>
        <div className="flex flex-col gap-0">
          {ACTIVIDAD.map((a, idx) => (
            <div key={idx} className={`flex items-start gap-3 py-3 ${idx < ACTIVIDAD.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0 mt-1.5" />
              <p className="text-[#888] text-xs leading-snug flex-1">{a.texto}</p>
              <span className="text-[#333] text-[10px] font-bold shrink-0">{a.hora}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal selector de partido ── */}
      {showSelector && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A] shrink-0">
              <div>
                <p className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase">Mesa de control</p>
                <p className="text-white font-black text-base uppercase mt-0.5">Seleccioná el partido</p>
              </div>
              <button
                onClick={() => setShowSelector(false)}
                className="text-[#555] hover:text-white font-black text-xl leading-none p-1"
              >✕</button>
            </div>

            <div className="overflow-y-auto flex-1">
              {pendientes.length === 0 ? (
                <p className="text-[#555] text-xs font-bold text-center py-10 tracking-widest uppercase">
                  No hay partidos pendientes
                </p>
              ) : (
                <div className="flex flex-col">
                  {pendientes.map((p, idx) => {
                    const div = divisiones.find((d) => d.id === p.divisionId)
                    const fecha = new Date(p.fechaHora)
                    return (
                      <button
                        key={p.id}
                        onClick={() => { setShowSelector(false); navigate(`/admin/mesa/${p.id}`) }}
                        className={`flex items-center gap-4 px-5 py-4 text-left hover:bg-[#1A1A1A] transition-colors
                          ${idx < pendientes.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}
                      >
                        {/* Equipos */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-black text-sm uppercase truncate">
                            {p.visitante.nombre}
                            <span className="text-[#444] font-bold mx-2">vs</span>
                            {p.local.nombre}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {div && (
                              <span className="text-[#555] text-[10px] font-bold uppercase tracking-wider">
                                {div.nombre}
                              </span>
                            )}
                            {p.fechaNumero && (
                              <span className="text-[#333] text-[10px] font-bold">· Fecha {p.fechaNumero}</span>
                            )}
                          </div>
                          <p className="text-[#444] text-[10px] mt-0.5">
                            {fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                            {' · '}
                            {fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                          </p>
                        </div>
                        {/* Colores de equipo */}
                        <div className="flex gap-1 shrink-0">
                          <div className="w-2 h-8" style={{ backgroundColor: p.visitante.color }} />
                          <div className="w-2 h-8" style={{ backgroundColor: p.local.color }} />
                        </div>
                        <span className="text-[#FF6B00] font-black text-sm shrink-0">→</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Íconos ── */
function TournamentIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12M6 3a4 4 0 004 4h4a4 4 0 004-4M6 3H4a1 1 0 00-1 1v2a4 4 0 003 3.87M18 3h2a1 1 0 011 1v2a4 4 0 01-3 3.87M12 14v4m-3 2h6" />
    </svg>
  )
}
function TeamsIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0zM3 10a3 3 0 116 0 3 3 0 01-6 0z" />
    </svg>
  )
}
function FixtureIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
function MesaIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 19v2M16 19v2M8 21h8" />
    </svg>
  )
}
