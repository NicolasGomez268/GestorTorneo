import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAdminStore } from '../../stores/adminStore'
import Container from '../../components/Container'
import type { Torneo, Division } from '../../data/tipos'
import { listarDivisionesPublicas, obtenerTorneoPublico } from '../../lib/torneos-publico'

export default function V2_Divisiones() {
  const { torneoId } = useParams()
  const navigate = useNavigate()
  const { equipos, jugadores } = useAdminStore()

  const [torneo, setTorneo] = useState<Torneo | null>(null)
  const [divisiones, setDivisiones] = useState<Division[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!torneoId) return
    let ok = true
    ;(async () => {
      setCargando(true)
      try {
        const [t, divs] = await Promise.all([
          obtenerTorneoPublico(torneoId),
          listarDivisionesPublicas(torneoId),
        ])
        if (!ok) return
        setTorneo(t)
        setDivisiones(divs)
      } finally {
        if (ok) setCargando(false)
      }
    })()
    return () => {
      ok = false
    }
  }, [torneoId])

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#888] text-xs uppercase tracking-widest">
        Cargando…
      </div>
    )
  }

  if (!torneo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#888]">
        Torneo no encontrado
      </div>
    )
  }

  const divs = divisiones

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Container>
        <div className="pt-8 pb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-10 bg-[#FF6B00]" />
            <h1 className="text-white font-black text-4xl sm:text-5xl lg:text-6xl italic tracking-tight leading-none uppercase">
              {torneo.nombre}
            </h1>
          </div>
          <p className="text-[#888] text-sm lg:text-base mt-3 ml-4">
            Seleccioná una división para ver posiciones, fixture y estadísticas.
          </p>
        </div>

        <div
          className={`pb-10 grid gap-3 ${divs.length >= 2 ? 'sm:grid-cols-2' : ''} ${
            divs.length >= 3 ? 'lg:grid-cols-3' : ''
          }`}
        >
          {divs.length === 0 && (
            <div className="border border-[#2A2A2A] p-14 text-center">
              <p className="text-[#2A2A2A] font-black text-7xl leading-none mb-4">—</p>
              <p className="text-[#555] font-black text-xs uppercase tracking-widest">
                Sin divisiones en este torneo
              </p>
            </div>
          )}
          {divs.map((div) => {
            const eqs = equipos.filter((e) => e.divisionId === div.id)
            const jugs = jugadores.filter((j) => eqs.some((e) => e.id === j.equipoId))

            return (
              <button
                key={div.id}
                onClick={() => navigate(`/torneo/${torneoId}/division/${div.id}`)}
                className="w-full text-left bg-[#131313] border border-[#2A2A2A] p-5 lg:p-7 hover:border-[#FF6B00]/40 active:bg-[#1A1A1A] transition-colors group"
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <h2 className="text-white font-black text-3xl lg:text-4xl italic uppercase leading-none">
                    {div.nombre}
                  </h2>
                  <span
                    className={`text-[10px] font-black tracking-widest px-2 py-1 shrink-0 mt-1
                    ${
                      div.estado === 'activa'
                        ? 'text-green-400 border border-green-400/30 bg-green-400/5'
                        : 'text-[#888] border border-[#2A2A2A]'
                    }`}
                  >
                    {div.estado === 'activa' ? 'ACTIVA' : 'FINALIZADA'}
                  </span>
                </div>

                <div className="flex gap-6 mb-6">
                  <div>
                    <p className="text-[#555] text-[10px] font-black tracking-widest uppercase mb-1">
                      Equipos
                    </p>
                    <p className="text-[#FF6B00] font-black text-2xl font-tabular">{eqs.length}</p>
                  </div>
                  {jugs.length > 0 && (
                    <div>
                      <p className="text-[#555] text-[10px] font-black tracking-widest uppercase mb-1">
                        Jugadores
                      </p>
                      <p className="text-white font-black text-2xl font-tabular">{jugs.length}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#2A2A2A] pt-4 flex justify-end">
                  <span className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase group-hover:gap-3 transition-all flex items-center gap-2">
                    ENTRAR →
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
