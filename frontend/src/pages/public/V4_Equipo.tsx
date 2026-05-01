import { useParams, useNavigate } from 'react-router-dom'
import { equipos }   from '../../data/equipos'
import { jugadores } from '../../data/jugadores'
import { partidos }  from '../../data/partidos'
import { divisiones } from '../../data/divisiones'
import Container     from '../../components/Container'
import EquipoLogo    from '../../components/EquipoLogo'

export default function V4_Equipo() {
  const { torneoId, divId, equipoId } = useParams()
  const navigate = useNavigate()

  const equipo   = equipos.find((e) => e.id === equipoId)
  const division = divisiones.find((d) => d.id === divId)

  if (!equipo || !division) {
    return <div className="min-h-screen flex items-center justify-center text-[#888]">Equipo no encontrado</div>
  }

  const roster = jugadores
    .filter((j) => j.equipoId === equipoId)
    .sort((a, b) => a.dorsal - b.dorsal)

  const proximosPartidos = partidos
    .filter((p) =>
      p.divisionId === divId &&
      p.estado === 'pendiente' &&
      (p.local.equipoId === equipoId || p.visitante.equipoId === equipoId)
    )
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
    .slice(0, 2)

  const ultimoResultado = partidos
    .filter((p) =>
      p.divisionId === divId &&
      p.estado === 'jugado' &&
      (p.local.equipoId === equipoId || p.visitante.equipoId === equipoId)
    )
    .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())[0]

  const stats = [
    { label: 'Jugados',  value: equipo.PJ, orange: false },
    { label: 'Ganados',  value: equipo.PG, orange: true  },
    { label: 'Perdidos', value: equipo.PP, orange: false },
    { label: 'Puntos',   value: equipo.PT, orange: true  },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero del equipo */}
      <div
        className="relative pt-14 pb-8 px-4 lg:px-0 border-b border-[#2A2A2A]"
        style={{ background: `linear-gradient(180deg, ${equipo.color}18 0%, transparent 100%)` }}
      >
        <Container>
          {/* Back */}
          <button
            onClick={() => navigate(`/torneo/${torneoId}/division/${divId}`)}
            className="flex items-center gap-1.5 text-[#555] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors mb-5"
          >
            ← {division.nombre}
          </button>

          <div className="flex items-center gap-5">
            {/* Logo grande */}
            <EquipoLogo nombre={equipo.nombre} color={equipo.color} size="xl" />

            <div>
              <p className="text-[#888] text-[10px] font-black tracking-widest uppercase mb-1">
                {division.nombre}
              </p>
              <h1 className="text-white font-black text-3xl sm:text-4xl lg:text-5xl italic uppercase leading-none">
                {equipo.nombre}
              </h1>
              <p className="text-[#555] text-xs mt-2">
                {roster.length} jugadores
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {stats.map(({ label, value, orange }) => (
            <div key={label} className="bg-[#131313] border border-[#2A2A2A] p-3 lg:p-4 text-center">
              <p className="text-[#555] text-[9px] font-black tracking-widest uppercase mb-2">
                {label}
              </p>
              <p className={`font-black text-2xl lg:text-3xl font-tabular ${orange ? 'text-[#FF6B00]' : 'text-white'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Roster */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-black text-lg uppercase tracking-wider">
              Roster
            </h2>
            <span className="text-[#555] text-[10px] font-black tracking-widest uppercase">
              {roster.length} jugadores
            </span>
          </div>

          <div className="border border-[#2A2A2A]">
            {roster.map((j, idx) => (
              <div
                key={j.id}
                className={`flex items-center gap-4 px-4 py-3 ${idx < roster.length - 1 ? 'border-b border-[#1A1A1A]' : ''}`}
              >
                {/* Dorsal */}
                <div
                  className="w-9 h-9 flex items-center justify-center font-black text-white text-sm shrink-0 font-tabular"
                  style={{ backgroundColor: equipo.color }}
                >
                  {j.dorsal}
                </div>

                {/* Nombre */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {j.apellido}, {j.nombre}
                  </p>
                  {j.posicion && (
                    <p className="text-[#555] text-[10px] font-bold tracking-wider uppercase">
                      {j.posicion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos partidos */}
        {proximosPartidos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white font-black text-lg uppercase tracking-wider mb-3">
              Próximos partidos
            </h2>
            <div className="flex flex-col gap-2">
              {proximosPartidos.map((p) => {
                const dt      = new Date(p.fechaHora)
                const esLocal = p.local.equipoId === equipoId
                const rival   = esLocal ? p.visitante : p.local
                return (
                  <div key={p.id} className="bg-[#131313] border border-[#2A2A2A] p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <EquipoLogo nombre={rival.nombre} color={rival.color} size="sm" />
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{rival.nombre}</p>
                        <p className="text-[#555] text-[10px] font-bold uppercase tracking-wider">
                          {esLocal ? 'Local' : 'Visitante'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[#FF6B00] text-xs font-black tracking-wider">
                        {dt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).toUpperCase()}
                      </p>
                      <p className="text-[#888] text-xs font-bold">
                        {dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Último resultado */}
        {ultimoResultado && (() => {
          const esLocal    = ultimoResultado.local.equipoId === equipoId
          const rival      = esLocal ? ultimoResultado.visitante : ultimoResultado.local
          const ptsPropio  = esLocal ? ultimoResultado.resultado!.ptsLocal : ultimoResultado.resultado!.ptsVisitante
          const ptsRival   = esLocal ? ultimoResultado.resultado!.ptsVisitante : ultimoResultado.resultado!.ptsLocal
          const gano       = ultimoResultado.resultado!.ganadorId === equipoId
          return (
            <div>
              <h2 className="text-white font-black text-lg uppercase tracking-wider mb-3">
                Último resultado
              </h2>
              <button
                onClick={() => navigate(`/torneo/${torneoId}/division/${divId}/partido/${ultimoResultado.id}`)}
                className="w-full bg-[#131313] border border-[#2A2A2A] p-4 hover:border-[#FF6B00]/30 transition-colors text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <EquipoLogo nombre={rival.nombre} color={rival.color} size="sm" />
                    <p className="text-white font-bold text-sm truncate">vs {rival.nombre}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-black text-2xl font-tabular ${gano ? 'text-[#FF6B00]' : 'text-white'}`}>
                      {ptsPropio}
                    </span>
                    <span className="text-[#333] font-black">—</span>
                    <span className={`font-black text-2xl font-tabular ${!gano ? 'text-[#FF6B00]' : 'text-[#555]'}`}>
                      {ptsRival}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-black tracking-widest uppercase ${gano ? 'text-green-400' : 'text-[#FF4444]'}`}>
                    {gano ? 'Victoria' : 'Derrota'}
                  </span>
                  <span className="text-[#333] text-[10px] font-bold tracking-wider">VER DETALLE →</span>
                </div>
              </button>
            </div>
          )
        })()}
      </Container>
    </div>
  )
}
