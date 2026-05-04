import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { JugadorPlanilla } from '../../data/tipos'
import { useAdminStore } from '../../stores/adminStore'
import { useMesaStore, type JugadorEnCancha } from '../../stores/mesaStore'

// x/y como % del área de la cancha, pts = valor del tiro
const DOTS: { x: number; y: number; pts: 2 | 3 }[] = [
  { x: 7,  y: 14, pts: 3 }, { x: 21, y: 8,  pts: 3 }, { x: 37, y: 6,  pts: 3 },
  { x: 50, y: 6,  pts: 3 }, { x: 63, y: 6,  pts: 3 }, { x: 79, y: 8,  pts: 3 },
  { x: 93, y: 14, pts: 3 }, { x: 7,  y: 86, pts: 3 }, { x: 21, y: 92, pts: 3 },
  { x: 37, y: 94, pts: 3 }, { x: 50, y: 94, pts: 3 }, { x: 63, y: 94, pts: 3 },
  { x: 79, y: 92, pts: 3 }, { x: 93, y: 86, pts: 3 },
  { x: 14, y: 37, pts: 2 }, { x: 14, y: 63, pts: 2 }, { x: 24, y: 50, pts: 2 },
  { x: 33, y: 30, pts: 2 }, { x: 33, y: 70, pts: 2 },
  { x: 86, y: 37, pts: 2 }, { x: 86, y: 63, pts: 2 }, { x: 76, y: 50, pts: 2 },
  { x: 67, y: 30, pts: 2 }, { x: 67, y: 70, pts: 2 },
]

// ── Tipos para pre-partido ──
type FaseMesa = 'planilla' | 'partido'

interface EntradaPlanilla {
  jugadorId: string
  nombre: string
  apellido: string
  numeroCamiseta: string  // string para el input, se convierte a number al guardar
}

export default function V10_Mesa() {
  const { partidoId } = useParams<{ partidoId: string }>()
  const navigate      = useNavigate()
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const { partidos, equipos, jugadores, registrarResultadoPartido } = useAdminStore()

  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth >= 900 && window.innerWidth > window.innerHeight
  )
  const [fase, setFase] = useState<FaseMesa>('planilla')
  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false)

  // ── Estado pre-partido: planilla y titulares ──
  const [planillaLocal,     setPlanillaLocal]     = useState<EntradaPlanilla[]>([])
  const [planillaVisitante, setPlanillaVisitante] = useState<EntradaPlanilla[]>([])
  const [titularesLocal,    setTitularesLocal]    = useState<Set<string>>(new Set())
  const [titularesVisitante, setTitularesVisitante] = useState<Set<string>>(new Set())
  const [errPlanilla,       setErrPlanilla]       = useState('')

  // Modal de camisetas para titulares y sustituciones
  const [modalCamisetasEquipo, setModalCamisetasEquipo] = useState<'local' | 'visitante' | null>(null)
  const [modoCambio,           setModoCambio]           = useState(false)  // true = selección de entrante

  const {
    localId, visitanteId,
    localNombre, visitanteNombre,
    localColor, visitanteColor,
    ptsLocal, ptsVisitante,
    faltasLocal, faltasVisitante,
    cuarto, tiempoRestante, corriendo,
    jugadoresLocal, jugadoresVisitante,
    jugadorSeleccionado, finalizado,
    iniciarPartido, toggleReloj, tickReloj,
    siguienteCuarto, seleccionarJugador,
    sumarPuntos, sumarFalta, cambiarJugador, finalizarPartido, reset,
  } = useMesaStore()

  // Detectar tablet landscape
  useEffect(() => {
    const check = () =>
      setIsLandscape(window.innerWidth >= 900 && window.innerWidth > window.innerHeight)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  // Cargar jugadores del partido al inicio (para la planilla)
  useEffect(() => {
    if (!partidoId) return
    const partido  = partidos.find((p) => p.id === partidoId)
    if (!partido) return
    const local     = equipos.find((e) => e.id === partido.local.equipoId)
    const visitante = equipos.find((e) => e.id === partido.visitante.equipoId)
    if (!local || !visitante) return

    const toEntrada = (jId: string, nombre: string, apellido: string): EntradaPlanilla =>
      ({ jugadorId: jId, nombre, apellido, numeroCamiseta: '' })

    const jugsLocal     = jugadores.filter((j) => j.equipoId === local.id)
      .sort((a, b) => a.apellido.localeCompare(b.apellido))
    const jugsVisitante = jugadores.filter((j) => j.equipoId === visitante.id)
      .sort((a, b) => a.apellido.localeCompare(b.apellido))

    setPlanillaLocal(jugsLocal.map((j) => toEntrada(j.id, j.nombre, j.apellido)))
    setPlanillaVisitante(jugsVisitante.map((j) => toEntrada(j.id, j.nombre, j.apellido)))
  }, [partidoId])

  // Reloj
  useEffect(() => {
    if (corriendo) {
      intervalRef.current = setInterval(() => tickReloj(), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [corriendo])

  // Reset al desmontar
  useEffect(() => () => { reset() }, [])

  const mins = String(Math.floor(tiempoRestante / 60)).padStart(2, '0')
  const secs = String(tiempoRestante % 60).padStart(2, '0')

  const selEquipo = jugadorSeleccionado
    ? jugadoresLocal.some((j) => j.id === jugadorSeleccionado) ? 'local' : 'visitante'
    : null

  const handleDotClick = (pts: 2 | 3) => {
    if (!jugadorSeleccionado || !selEquipo) return
    sumarPuntos(selEquipo === 'local' ? localId : visitanteId, pts)
  }

  const handleTiroLibre = () => {
    if (!jugadorSeleccionado || !selEquipo) return
    sumarPuntos(selEquipo === 'local' ? localId : visitanteId, 1)
  }

  const handleFalta = () => {
    if (!jugadorSeleccionado || !selEquipo) return
    sumarFalta(jugadorSeleccionado, selEquipo)
  }

  // Iniciar cambio: requiere un jugador en cancha seleccionado
  const handleIniciarCambio = () => {
    if (!jugadorSeleccionado || !selEquipo) return
    setModalCamisetasEquipo(selEquipo)
    setModoCambio(true)
  }

  const handleSeleccionEntrante = (entranteId: string) => {
    if (!jugadorSeleccionado || !selEquipo) return
    cambiarJugador(jugadorSeleccionado, entranteId, selEquipo)
    setModalCamisetasEquipo(null)
    setModoCambio(false)
  }

  const guardarResultadoEnStore = () => {
    if (!partidoId) return
    const mesa = useMesaStore.getState()
    registrarResultadoPartido({
      partidoId,
      ptsLocal: mesa.ptsLocal,
      ptsVisitante: mesa.ptsVisitante,
      stats: [
        ...mesa.jugadoresLocal.map((j) => ({
          jugadorId: j.id,
          partidoId,
          nombre: j.nombre,
          apellido: j.apellido,
          numeroCamiseta: j.numeroCamiseta,
          equipo: 'local' as const,
          equipoId: mesa.localId,
          puntos: j.puntos,
          faltas: j.faltas,
          segundosJugados: j.segundosJugados,
        })),
        ...mesa.jugadoresVisitante.map((j) => ({
          jugadorId: j.id,
          partidoId,
          nombre: j.nombre,
          apellido: j.apellido,
          numeroCamiseta: j.numeroCamiseta,
          equipo: 'visitante' as const,
          equipoId: mesa.visitanteId,
          puntos: j.puntos,
          faltas: j.faltas,
          segundosJugados: j.segundosJugados,
        })),
      ],
    })
  }

  const handleConfirmarFinalizar = () => {
    setShowConfirmFinalizar(false)
    finalizarPartido()
    guardarResultadoEnStore()
  }

  const handleVolverPanel = () => {
    reset()
    navigate('/admin')
  }

  const enCanchaLocal     = jugadoresLocal.filter((j) => j.enCancha)
  const enCanchaVisitante = jugadoresVisitante.filter((j) => j.enCancha)
  const bancaLocal        = jugadoresLocal.filter((j) => !j.enCancha)
  const bancaVisitante    = jugadoresVisitante.filter((j) => !j.enCancha)

  // ── Validar y confirmar planilla ──
  const handleConfirmarPlanilla = () => {
    setErrPlanilla('')
    const partido = partidos.find((p) => p.id === partidoId)
    if (!partido) return
    const local     = equipos.find((e) => e.id === partido.local.equipoId)
    const visitante = equipos.find((e) => e.id === partido.visitante.equipoId)
    if (!local || !visitante) return

    // Jugadores con número asignado
    const conNumLocal = planillaLocal.filter((p) => p.numeroCamiseta.trim() !== '')
    const conNumVis   = planillaVisitante.filter((p) => p.numeroCamiseta.trim() !== '')

    if (conNumLocal.length < 5) { setErrPlanilla('El equipo local necesita al menos 5 jugadores con número'); return }
    if (conNumVis.length   < 5) { setErrPlanilla('El equipo visitante necesita al menos 5 jugadores con número'); return }

    // Verificar números duplicados dentro de cada equipo
    const numsLocal = conNumLocal.map((p) => parseInt(p.numeroCamiseta))
    const numsVis   = conNumVis.map((p) => parseInt(p.numeroCamiseta))
    if (new Set(numsLocal).size !== numsLocal.length) { setErrPlanilla('Hay números de camiseta repetidos en el equipo local'); return }
    if (new Set(numsVis).size   !== numsVis.length)   { setErrPlanilla('Hay números de camiseta repetidos en el equipo visitante'); return }

    // Si los titulares ya están seleccionados, iniciar partido
    if (titularesLocal.size === 5 && titularesVisitante.size === 5) {
      _lanzarPartido(conNumLocal, conNumVis, local, visitante)
    }
  }

  const _lanzarPartido = (
    conNumLocal: EntradaPlanilla[],
    conNumVis:   EntradaPlanilla[],
    local:     typeof equipos[number],
    visitante: typeof equipos[number],
  ) => {
    const toPlanilla = (entrada: EntradaPlanilla): JugadorPlanilla => {
      const jug = jugadores.find((j) => j.id === entrada.jugadorId)!
      return { ...jug, numeroCamiseta: parseInt(entrada.numeroCamiseta) }
    }

    const jugsLocalPlan = conNumLocal.map(toPlanilla)
      .sort((a, b) => a.numeroCamiseta - b.numeroCamiseta)
    const jugsVisPlan   = conNumVis.map(toPlanilla)
      .sort((a, b) => a.numeroCamiseta - b.numeroCamiseta)

    iniciarPartido({
      partidoId: partidoId!,
      localId: local.id, visitanteId: visitante.id,
      localNombre: local.nombre, visitanteNombre: visitante.nombre,
      localColor: local.color,   visitanteColor: visitante.color,
      jugadoresLocal:     jugsLocalPlan,
      jugadoresVisitante: jugsVisPlan,
      titularesLocalIds:     [...titularesLocal],
      titularesVisitanteIds: [...titularesVisitante],
    })
    setFase('partido')
  }

  // Selección de titular en la planilla
  const toggleTitular = (id: string, equipo: 'local' | 'visitante') => {
    const set    = equipo === 'local' ? titularesLocal     : titularesVisitante
    const setter = equipo === 'local' ? setTitularesLocal  : setTitularesVisitante
    const next   = new Set(set)
    if (next.has(id)) {
      next.delete(id)
    } else if (next.size < 5) {
      next.add(id)
    }
    setter(next)
  }

  // ── Pantalla finalizado ──
  if (finalizado) {
    const ganador = ptsLocal > ptsVisitante ? localNombre : ptsVisitante > ptsLocal ? visitanteNombre : null
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col items-center justify-center gap-6 p-8">
        <p className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase">Partido finalizado</p>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-white font-black text-lg uppercase">{visitanteNombre}</p>
            <p className="text-white font-black text-6xl mt-2">{ptsVisitante}</p>
          </div>
          <div className="text-[#333] font-black text-2xl">—</div>
          <div className="text-center">
            <p className="text-white font-black text-lg uppercase">{localNombre}</p>
            <p className="text-white font-black text-6xl mt-2">{ptsLocal}</p>
          </div>
        </div>
        {ganador && (
          <p className="text-[#FF6B00] font-black text-xl uppercase tracking-widest">¡{ganador} ganó!</p>
        )}
        {!ganador && <p className="text-[#888] font-bold uppercase tracking-widest">Empate</p>}
        <button
          onClick={handleVolverPanel}
          className="mt-4 bg-[#FF6B00] text-black font-black py-3 px-10 tracking-widest uppercase hover:bg-[#CC5500] transition-colors"
        >
          Volver al panel
        </button>
      </div>
    )
  }

  // ── Lock screen (mobile / portrait) ──
  if (!isLandscape) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col items-center justify-center gap-5 p-10">
        <div className="border-2 border-[#FF6B00] p-6 flex flex-col items-center gap-3">
          <svg className="w-12 h-12 text-[#FF6B00]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <p className="text-white font-black text-sm uppercase tracking-widest text-center">Girá el dispositivo</p>
          <p className="text-[#555] text-xs text-center leading-relaxed">
            La mesa de control requiere tablet<br />en modo horizontal
          </p>
        </div>
      </div>
    )
  }

  // ── FASE PRE-PARTIDO: Planilla ──
  if (fase === 'planilla') {
    const partido = partidos.find((p) => p.id === partidoId)
    if (!partido) return null
    const local     = equipos.find((e) => e.id === partido.local.equipoId)
    const visitante = equipos.find((e) => e.id === partido.visitante.equipoId)
    if (!local || !visitante) return null

    const conNumLocal = planillaLocal.filter((p) => p.numeroCamiseta.trim() !== '')
    const conNumVis   = planillaVisitante.filter((p) => p.numeroCamiseta.trim() !== '')
    const planillaOK  = conNumLocal.length >= 5 && conNumVis.length >= 5
    const titularesOK = titularesLocal.size === 5 && titularesVisitante.size === 5

    return (
      <div className="fixed inset-0 bg-[#0A0A0A] z-40 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#080808] border-b border-[#1A1A1A] shrink-0">
          <p className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase">Planilla pre-partido</p>
          <div className="text-center">
            <p className="text-white font-black text-sm uppercase">
              {visitante.nombre} <span className="text-[#444] mx-2">vs</span> {local.nombre}
            </p>
          </div>
          <p className="text-[#444] text-[10px] font-black tracking-widest uppercase">
            {titularesLocal.size}/5 loc · {titularesVisitante.size}/5 vis
          </p>
        </div>

        {/* Cuerpo: dos columnas */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Columna visitante */}
          <div className="flex-1 border-r border-[#1A1A1A] flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 shrink-0 border-b border-[#1A1A1A]">
              <div className="w-3 h-3 shrink-0" style={{ backgroundColor: visitante.color }} />
              <p className="text-white font-black text-xs uppercase tracking-wider truncate">{visitante.nombre}</p>
              <span className="text-[#444] text-[10px] ml-auto">{conNumVis.length} en planilla</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {planillaVisitante.map((entrada) => (
                <PlanillaRow
                  key={entrada.jugadorId}
                  entrada={entrada}
                  esTitular={titularesVisitante.has(entrada.jugadorId)}
                  puedeSerTitular={titularesVisitante.size < 5 || titularesVisitante.has(entrada.jugadorId)}
                  color={visitante.color}
                  onChangeNumero={(v) => {
                    setPlanillaVisitante((prev) =>
                      prev.map((p) => p.jugadorId === entrada.jugadorId ? { ...p, numeroCamiseta: v } : p)
                    )
                  }}
                  onToggleTitular={() => {
                    if (entrada.numeroCamiseta.trim() === '') return
                    toggleTitular(entrada.jugadorId, 'visitante')
                  }}
                />
              ))}
            </div>
          </div>

          {/* Columna local */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 shrink-0 border-b border-[#1A1A1A]">
              <div className="w-3 h-3 shrink-0" style={{ backgroundColor: local.color }} />
              <p className="text-white font-black text-xs uppercase tracking-wider truncate">{local.nombre}</p>
              <span className="text-[#444] text-[10px] ml-auto">{conNumLocal.length} en planilla</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {planillaLocal.map((entrada) => (
                <PlanillaRow
                  key={entrada.jugadorId}
                  entrada={entrada}
                  esTitular={titularesLocal.has(entrada.jugadorId)}
                  puedeSerTitular={titularesLocal.size < 5 || titularesLocal.has(entrada.jugadorId)}
                  color={local.color}
                  onChangeNumero={(v) => {
                    setPlanillaLocal((prev) =>
                      prev.map((p) => p.jugadorId === entrada.jugadorId ? { ...p, numeroCamiseta: v } : p)
                    )
                  }}
                  onToggleTitular={() => {
                    if (entrada.numeroCamiseta.trim() === '') return
                    toggleTitular(entrada.jugadorId, 'local')
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 border-t border-[#1A1A1A] bg-[#080808]">
          {errPlanilla && (
            <p className="text-[#FF4444] text-[10px] font-bold text-center py-1.5 px-4">{errPlanilla}</p>
          )}
          <div className="flex">
            <button
              onClick={() => { reset(); navigate('/admin') }}
              className="flex-1 bg-[#1A1A1A] text-[#555] font-black text-[11px] tracking-widest uppercase py-3 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (!planillaOK) { setErrPlanilla('Ingresá al menos 5 jugadores con número en cada equipo'); return }
                if (!titularesOK) { setErrPlanilla('Seleccioná exactamente 5 titulares en cada equipo'); return }
                handleConfirmarPlanilla()
              }}
              disabled={!planillaOK || !titularesOK}
              className="flex-1 bg-[#FF6B00] disabled:bg-[#2A2A2A] disabled:text-[#444] text-black font-black text-[11px] tracking-widest uppercase py-3 hover:bg-[#CC5500] disabled:cursor-not-allowed transition-colors"
            >
              {!planillaOK
                ? 'Completar planilla'
                : !titularesOK
                  ? `Elegir titulares (${titularesLocal.size + titularesVisitante.size}/10)`
                  : '▶ Iniciar partido'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Modal de camisetas: titulares o sustitución ──
  const modalJugadores = modalCamisetasEquipo === 'local' ? jugadoresLocal : jugadoresVisitante
  const modalColor     = modalCamisetasEquipo === 'local' ? localColor : visitanteColor
  const modalNombre    = modalCamisetasEquipo === 'local' ? localNombre : visitanteNombre

  // ── FASE PARTIDO ──
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] z-40 flex flex-col overflow-hidden">

      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#080808] border-b border-[#1A1A1A] shrink-0">
        <div className="w-28 shrink-0">
          <p className="text-[#888] text-[9px] font-black tracking-widest uppercase">≡ Visitante</p>
          <p className="text-[#FF4444] text-[9px] font-bold">FALTAS: {faltasVisitante}</p>
          <FaltasDots count={faltasVisitante} />
        </div>

        <div className="flex items-center gap-1.5">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-1 max-w-[120px]">
            <p className="text-white font-black text-[11px] uppercase truncate">{visitanteNombre}</p>
          </div>
          <div className="w-12 h-9 flex items-center justify-center" style={{ backgroundColor: '#CC0000' }}>
            <span className="text-white font-black text-2xl tabular-nums">{ptsVisitante}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <button
            onClick={toggleReloj}
            className={`font-black text-3xl tabular-nums tracking-widest transition-colors leading-none
              ${corriendo ? 'text-[#FF4444]' : 'text-[#FF6B00]'}`}
          >
            {mins}:{secs}
          </button>
          <p className="text-[#444] text-[9px] font-black tracking-widest uppercase">
            {corriendo ? '▶ corriendo' : '⏸ pausado'} · Cuarto {cuarto}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-12 h-9 flex items-center justify-center" style={{ backgroundColor: '#CC0000' }}>
            <span className="text-white font-black text-2xl tabular-nums">{ptsLocal}</span>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-1 max-w-[120px]">
            <p className="text-white font-black text-[11px] uppercase truncate">{localNombre}</p>
          </div>
        </div>

        <div className="w-28 shrink-0 text-right">
          <p className="text-[#888] text-[9px] font-black tracking-widest uppercase">Local ≡</p>
          <p className="text-[#FF4444] text-[9px] font-bold">FALTAS: {faltasLocal}</p>
          <div className="flex gap-0.5 justify-end mt-0.5">
            <FaltasDots count={faltasLocal} />
          </div>
        </div>
      </div>

      {/* ── ÁREA PRINCIPAL ── */}
      <div className="flex flex-1 min-h-0">

        {/* Columna visitante */}
        <div className="w-[88px] shrink-0 bg-[#080808] border-r border-[#1A1A1A] flex flex-col items-center py-2 gap-1 overflow-y-auto">
          <p className="text-[#333] text-[8px] font-black tracking-widest uppercase mb-0.5">Cancha</p>
          {enCanchaVisitante.map((j) => (
            <JerseyCard
              key={j.id}
              jugador={j}
              color={visitanteColor}
              selected={jugadorSeleccionado === j.id}
              onSelect={() => seleccionarJugador(jugadorSeleccionado === j.id ? null : j.id)}
            />
          ))}
          {bancaVisitante.length > 0 && (
            <>
              <p className="text-[#222] text-[8px] font-black tracking-widest uppercase mt-auto mb-0.5">Ent.</p>
              {bancaVisitante.map((j) => (
                <div key={j.id} className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#2A2A2A]" title={`${j.apellido} #${j.numeroCamiseta}`} />
              ))}
            </>
          )}
        </div>

        {/* Cancha */}
        <div className="flex-1 flex items-center justify-center bg-[#0F0F0F] p-2">
          <div
            className="relative"
            style={{ aspectRatio: '1.88', height: '100%', maxHeight: '100%', maxWidth: '100%' }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-sm" style={{ backgroundColor: '#C8870A' }}>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 940 500" preserveAspectRatio="none">
                <rect width="940" height="500" fill="#C8870A" />
                {[50,100,150,200,250,300,350,400,450].map((y) => (
                  <line key={y} x1="0" y1={y} x2="940" y2={y} stroke="#B87B00" strokeWidth="1" opacity="0.4" />
                ))}
                <rect x="12" y="12" width="916" height="476" fill="none" stroke="white" strokeWidth="3" opacity="0.7" />
                <line x1="470" y1="12" x2="470" y2="488" stroke="white" strokeWidth="2" opacity="0.6" />
                <circle cx="470" cy="250" r="65" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
                <circle cx="470" cy="250" r="4"  fill="white" opacity="0.6" />
                <rect x="12" y="170" width="175" height="160" fill="rgba(30,80,200,0.25)" stroke="white" strokeWidth="2" opacity="0.6" />
                <rect x="753" y="170" width="175" height="160" fill="rgba(30,80,200,0.25)" stroke="white" strokeWidth="2" opacity="0.6" />
                <line x1="187" y1="170" x2="187" y2="330" stroke="white" strokeWidth="2" opacity="0.5" />
                <line x1="753" y1="170" x2="753" y2="330" stroke="white" strokeWidth="2" opacity="0.5" />
                <path d="M 187 170 A 80 80 0 0 1 187 330" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
                <path d="M 753 170 A 80 80 0 0 0 753 330" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
                <path d="M 12 138 L 80 138 A 220 220 0 0 1 80 362 L 12 362" fill="none" stroke="white" strokeWidth="2" opacity="0.55" />
                <path d="M 928 138 L 860 138 A 220 220 0 0 0 860 362 L 928 362" fill="none" stroke="white" strokeWidth="2" opacity="0.55" />
                <circle cx="62"  cy="250" r="16" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
                <line x1="12"  y1="250" x2="62"  y2="250" stroke="white" strokeWidth="2" opacity="0.7" />
                <circle cx="878" cy="250" r="16" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
                <line x1="928" y1="250" x2="878" y2="250" stroke="white" strokeWidth="2" opacity="0.7" />
              </svg>

              {DOTS.map((dot, i) => (
                <button
                  key={i}
                  onClick={() => handleDotClick(dot.pts)}
                  disabled={!jugadorSeleccionado}
                  style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full z-10 transition-all
                    ${dot.pts === 3
                      ? 'w-4 h-4 bg-[#0A0A0A] border-2 border-[#0A0A0A]'
                      : 'w-3.5 h-3.5 bg-white border-2 border-white'}
                    ${jugadorSeleccionado
                      ? 'cursor-pointer hover:scale-150 active:scale-110 shadow-lg opacity-100'
                      : 'opacity-50 cursor-not-allowed'}`}
                />
              ))}

              {jugadorSeleccionado && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1 rounded-full">
                  <p className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase">
                    Jugador seleccionado — tocá un punto
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna local */}
        <div className="w-[88px] shrink-0 bg-[#080808] border-l border-[#1A1A1A] flex flex-col items-center py-2 gap-1 overflow-y-auto">
          <p className="text-[#333] text-[8px] font-black tracking-widest uppercase mb-0.5">Cancha</p>
          {enCanchaLocal.map((j) => (
            <JerseyCard
              key={j.id}
              jugador={j}
              color={localColor}
              selected={jugadorSeleccionado === j.id}
              onSelect={() => seleccionarJugador(jugadorSeleccionado === j.id ? null : j.id)}
            />
          ))}
          {bancaLocal.length > 0 && (
            <>
              <p className="text-[#222] text-[8px] font-black tracking-widest uppercase mt-auto mb-0.5">Ent.</p>
              {bancaLocal.map((j) => (
                <div key={j.id} className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#2A2A2A]" title={`${j.apellido} #${j.numeroCamiseta}`} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="flex shrink-0 border-t border-[#1A1A1A]">
        <button
          onClick={() => setShowConfirmFinalizar(true)}
          className="flex-1 bg-[#8B0000] hover:bg-[#6B0000] text-white font-black text-[11px] tracking-widest uppercase py-3 transition-colors"
        >
          🏁 Finalizar
        </button>
        <button
          onClick={handleTiroLibre}
          disabled={!jugadorSeleccionado}
          className="flex-1 bg-[#FF6B00] hover:bg-[#CC5500] disabled:bg-[#1A1A1A] disabled:text-[#333] text-black font-black text-[11px] tracking-widest uppercase py-3 transition-colors"
        >
          Tiro Libre +1
        </button>
        <button
          onClick={handleFalta}
          disabled={!jugadorSeleccionado}
          className="flex-1 bg-[#CC5500] hover:bg-[#AA4400] disabled:bg-[#1A1A1A] disabled:text-[#333] text-black font-black text-[11px] tracking-widest uppercase py-3 transition-colors"
        >
          Falta Personal
        </button>
        <button
          onClick={handleIniciarCambio}
          disabled={!jugadorSeleccionado || !selEquipo}
          className="flex-1 bg-[#1A3A6A] hover:bg-[#12285A] disabled:bg-[#1A1A1A] disabled:text-[#333] text-white font-black text-[11px] tracking-widest uppercase py-3 transition-colors"
        >
          ⇄ Cambio
        </button>
        <button
          onClick={() => { if (!corriendo && cuarto < 4) siguienteCuarto(); else toggleReloj() }}
          className="flex-1 bg-[#1A6B1A] hover:bg-[#145214] text-white font-black text-[11px] tracking-widest uppercase py-3 transition-colors"
        >
          {corriendo ? '⏸ Pausar' : cuarto < 4 ? '▶ Continuar' : '⏹ Fin'}
        </button>
      </div>

      {/* ── Modal de camisetas (sustitución) ── */}
      {modalCamisetasEquipo && modoCambio && (
        <ModalCamisetas
          titulo={`Elegir entrante — ${modalNombre}`}
          jugadores={modalJugadores.filter((j) => !j.enCancha)}
          color={modalColor}
          enCanchaIds={new Set(modalJugadores.filter((j) => j.enCancha).map((j) => j.id))}
          onSeleccionar={handleSeleccionEntrante}
          onCerrar={() => { setModalCamisetasEquipo(null); setModoCambio(false) }}
        />
      )}

      {/* ── Confirmación de finalización ── */}
      {showConfirmFinalizar && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] w-full max-w-md p-5">
            <p className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase mb-2">Confirmar acción</p>
            <p className="text-white font-black text-lg uppercase leading-tight mb-5">
              ¿Seguro que querés finalizar el partido?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmFinalizar(false)}
                className="flex-1 bg-[#1A1A1A] text-[#AAA] font-black text-xs tracking-widest uppercase py-3 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarFinalizar}
                className="flex-1 bg-[#8B0000] text-white font-black text-xs tracking-widest uppercase py-3 hover:bg-[#6B0000] transition-colors"
              >
                Sí, finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Fila de planilla pre-partido ── */
function PlanillaRow({
  entrada, esTitular, puedeSerTitular, color,
  onChangeNumero, onToggleTitular,
}: {
  entrada: EntradaPlanilla
  esTitular: boolean
  puedeSerTitular: boolean
  color: string
  onChangeNumero: (v: string) => void
  onToggleTitular: () => void
}) {
  const tieneNumero = entrada.numeroCamiseta.trim() !== ''
  return (
    <div className={`flex items-center gap-2 px-3 py-2 border-b border-[#0F0F0F] ${tieneNumero ? 'bg-[#0F0F0F]' : 'bg-[#080808]'}`}>
      {/* Número de camiseta */}
      <input
        type="number"
        min={0}
        max={99}
        value={entrada.numeroCamiseta}
        onChange={(e) => onChangeNumero(e.target.value)}
        placeholder="—"
        className="w-12 text-center bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#FF6B00] text-white font-black text-sm py-1 outline-none transition-colors tabular-nums"
      />
      {/* Nombre */}
      <p className="flex-1 text-white text-xs font-bold truncate">
        {entrada.apellido}, {entrada.nombre}
      </p>
      {/* Botón titular */}
      <button
        onClick={onToggleTitular}
        disabled={!tieneNumero || (!puedeSerTitular && !esTitular)}
        title={!tieneNumero ? 'Ingresá el número primero' : esTitular ? 'Quitar como titular' : 'Marcar como titular'}
        className={`shrink-0 w-6 h-6 border-2 flex items-center justify-center transition-colors
          ${esTitular
            ? 'border-[#22C55E] bg-[#22C55E]/20'
            : tieneNumero && puedeSerTitular
              ? 'border-[#2A2A2A] hover:border-[#22C55E] cursor-pointer'
              : 'border-[#111] cursor-not-allowed opacity-30'}`}
        style={esTitular ? { borderColor: '#22C55E' } : {}}
      >
        {esTitular && <span className="text-[#22C55E] text-[10px] font-black">✓</span>}
      </button>
    </div>
  )
}

/* ── Modal de camisetas (para sustituciones) ── */
function ModalCamisetas({
  titulo, jugadores, color, enCanchaIds, onSeleccionar, onCerrar,
}: {
  titulo: string
  jugadores: JugadorEnCancha[]
  color: string
  enCanchaIds: Set<string>
  onSeleccionar: (id: string) => void
  onCerrar: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-6">
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <p className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase">{titulo}</p>
          <button onClick={onCerrar} className="text-[#555] hover:text-white font-black text-xl leading-none">✕</button>
        </div>

        {jugadores.length === 0 ? (
          <p className="text-[#555] text-xs font-bold text-center py-8 tracking-widest uppercase">Sin suplentes disponibles</p>
        ) : (
          <div className="p-4 flex flex-wrap gap-3 justify-center">
            {jugadores
              .sort((a, b) => a.numeroCamiseta - b.numeroCamiseta)
              .map((j) => {
                const enCancha = enCanchaIds.has(j.id)
                return (
                  <button
                    key={j.id}
                    onClick={() => !enCancha && onSeleccionar(j.id)}
                    disabled={enCancha}
                    className={`flex flex-col items-center gap-1 transition-all ${enCancha ? 'opacity-50 cursor-default' : 'hover:scale-105 active:scale-95'}`}
                  >
                    <CamisetaShape
                      numero={j.numeroCamiseta}
                      color={color}
                      enCancha={enCancha}
                    />
                    <p className="text-[#888] text-[9px] font-bold truncate max-w-[60px]">
                      {j.apellido}
                    </p>
                    <FaltasDotsSmall count={j.faltas} />
                  </button>
                )
              })}
          </div>
        )}

        <div className="px-4 pb-4">
          <button
            onClick={onCerrar}
            className="w-full bg-[#1A1A1A] text-[#888] font-black text-[11px] tracking-widest uppercase py-3 hover:text-white transition-colors"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Forma de camiseta ── */
function CamisetaShape({ numero, color, enCancha }: { numero: number; color: string; enCancha: boolean }) {
  return (
    <div
      className={`w-14 h-16 flex items-center justify-center relative transition-all
        ${enCancha ? 'ring-2 ring-[#22C55E] shadow-lg shadow-[#22C55E]/30' : 'ring-1 ring-white/20'}`}
      style={{
        backgroundColor: color,
        clipPath: 'polygon(20% 0%, 80% 0%, 100% 18%, 80% 22%, 80% 100%, 20% 100%, 20% 22%, 0% 18%)',
      }}
    >
      <span className="text-white font-black text-xl leading-none" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
        {numero}
      </span>
    </div>
  )
}

/* ── Jersey card de jugador en cancha ── */
function JerseyCard({
  jugador, color, selected, onSelect,
}: {
  jugador: JugadorEnCancha
  color: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col items-center w-16 shrink-0 transition-all
        ${selected ? 'scale-105' : 'opacity-80 hover:opacity-100'}`}
    >
      <div
        className={`w-14 h-16 flex items-center justify-center relative transition-all
          ${selected ? 'ring-2 ring-white shadow-lg shadow-white/20' : ''}`}
        style={{
          backgroundColor: color,
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 18%, 80% 22%, 80% 100%, 20% 100%, 20% 22%, 0% 18%)',
        }}
      >
        <span className="text-white font-black text-xl leading-none" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          {jugador.numeroCamiseta}
        </span>
      </div>

      <p className="text-white text-[9px] font-black mt-0.5 tabular-nums">
        {jugador.puntos > 0 ? `${jugador.puntos}pt` : ''}
      </p>

      <div className="flex gap-0.5 mt-0.5">
        {[...Array(Math.min(jugador.faltas, 5))].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF4444]" />
        ))}
        {[...Array(Math.max(0, 3 - jugador.faltas))].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2A2A2A]" />
        ))}
      </div>

      {selected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6B00] rounded-full" />
      )}
    </button>
  )
}

/* ── Puntos de faltas del equipo ── */
function FaltasDots({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mt-0.5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i < count ? '#FF4444' : '#2A2A2A' }} />
      ))}
    </div>
  )
}

function FaltasDotsSmall({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(Math.min(count, 5))].map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF4444]" />
      ))}
      {[...Array(Math.max(0, 3 - count))].map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2A2A2A]" />
      ))}
    </div>
  )
}
