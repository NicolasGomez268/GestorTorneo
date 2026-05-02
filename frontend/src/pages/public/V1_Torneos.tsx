import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../stores/adminStore'
import Container from '../../components/Container'
import type { Torneo } from '../../data/tipos'

const estadoBadge: Record<Torneo['estado'], { label: string; cls: string }> = {
  activo:     { label: 'ACTIVO',     cls: 'bg-[#FF6B00] text-black' },
  finalizado: { label: 'FINALIZADO', cls: 'bg-[#2A2A2A] text-[#888]' },
  proximo:    { label: 'PRÓXIMO',    cls: 'bg-[#1A1A1A] text-[#888] border border-[#2A2A2A]' },
}

export default function V1_Torneos() {
  const navigate = useNavigate()
  const { torneos, divisiones, equipos } = useAdminStore()

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Container>
        {/* Título */}
        <div className="pt-8 pb-8">
          <p className="text-[#FF6B00] text-[10px] font-black tracking-[0.25em] uppercase mb-3">
            Torneos disponibles
          </p>
          <h1 className="text-white font-black text-3xl sm:text-4xl lg:text-6xl leading-none tracking-tight uppercase italic">
            SELECCIÓN DE TORNEO
          </h1>
        </div>

        {/* Cards — centradas en desktop con max-width */}
        <div className="max-w-[640px] lg:mx-auto pb-10 flex flex-col gap-4">
          {torneos.length === 0 && (
            <div className="border border-[#2A2A2A] p-14 text-center">
              <p className="text-[#2A2A2A] font-black text-7xl leading-none mb-4">—</p>
              <p className="text-[#555] font-black text-xs uppercase tracking-widest">
                No hay torneos disponibles
              </p>
            </div>
          )}
          {torneos.map((torneo) => {
            const badge   = estadoBadge[torneo.estado]
            const divs    = divisiones.filter((d) => d.torneoId === torneo.id)
            const totalEq = equipos.filter((e) => divs.some((d) => d.id === e.divisionId)).length

            return (
              <button
                key={torneo.id}
                onClick={() => navigate(`/torneo/${torneo.id}`)}
                className="w-full text-left bg-[#131313] border border-[#2A2A2A] p-5 lg:p-7 transition-colors hover:border-[#FF6B00]/50 active:bg-[#1A1A1A] group"
              >
                {/* Nombre + badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-white font-black text-4xl lg:text-5xl italic tracking-tight leading-none">
                    {torneo.nombre}
                  </h2>
                  <span className={`text-[10px] font-black tracking-widest px-2.5 py-1.5 shrink-0 mt-1 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-[#888] text-sm lg:text-base leading-relaxed mb-6">
                  {torneo.descripcion}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Deporte',    value: torneo.deporte,      orange: false },
                    { label: 'Temporada',  value: torneo.temporada,    orange: false },
                    { label: 'Equipos',    value: String(totalEq),     orange: true  },
                    { label: 'Divisiones', value: String(divs.length), orange: true  },
                  ].map(({ label, value, orange }) => (
                    <div key={label}>
                      <p className="text-[#555] text-[9px] font-black tracking-widest uppercase mb-1">
                        {label}
                      </p>
                      <p className={`font-black text-xl lg:text-2xl font-tabular ${orange ? 'text-[#FF6B00]' : 'text-white'}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Separador */}
                <div className="border-t border-[#2A2A2A] pt-4 flex items-center justify-between">
                  <span className="text-[#555] text-[10px] font-bold tracking-widest uppercase">
                    {divs.map((d) => d.nombre).join(' · ')}
                  </span>
                  <span className="flex items-center gap-2 text-[#FF6B00] text-[10px] font-black tracking-widest uppercase group-hover:gap-3 transition-all">
                    VER TORNEO →
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </Container>
    </div>
  )
}
