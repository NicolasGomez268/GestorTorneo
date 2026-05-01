import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMesaStore, type JugadorEnCancha } from '../../stores/mesaStore'
import { partidos } from '../../data/partidos'
import { equipos }  from '../../data/equipos'
import { jugadores } from '../../data/jugadores'

// x/y como % del área de la cancha, pts = valor del tiro
const DOTS: { x: number; y: number; pts: 2 | 3 }[] = [
  // ── 3 puntos – fila superior ──
  { x: 7,  y: 14, pts: 3 },
  { x: 21, y: 8,  pts: 3 },
  { x: 37, y: 6,  pts: 3 },
  { x: 50, y: 6,  pts: 3 },
  { x: 63, y: 6,  pts: 3 },
  { x: 79, y: 8,  pts: 3 },
  { x: 93, y: 14, pts: 3 },
  // ── 3 puntos – fila inferior ──
  { x: 7,  y: 86, pts: 3 },
  { x: 21, y: 92, pts: 3 },
  { x: 37, y: 94, pts: 3 },
  { x: 50, y: 94, pts: 3 },
  { x: 63, y: 94, pts: 3 },
  { x: 79, y: 92, pts: 3 },
  { x: 93, y: 86, pts: 3 },
  // ── 2 puntos – lado izquierdo (cerca del aro visitante) ──
  { x: 14, y: 37, pts: 2 },
  { x: 14, y: 63, pts: 2 },
  { x: 24, y: 50, pts: 2 },
  { x: 33, y: 30, pts: 2 },
  { x: 33, y: 70, pts: 2 },
  // ── 2 puntos – lado derecho (cerca del aro local) ──
  { x: 86, y: 37, pts: 2 },
  { x: 86, y: 63, pts: 2 },
  { x: 76, y: 50, pts: 2 },
  { x: 67, y: 30, pts: 2 },
  { x: 67, y: 70, pts: 2 },
]

export default function V10_Mesa() {
  const { partidoId } = useParams<{ partidoId: string }>()
  const navigate      = useNavigate()
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth >= 900 && window.innerWidth > window.innerHeight
  )

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
    sumarPuntos, sumarFalta, finalizarPartido, reset,
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

  // Inicializar partido desde params
  useEffect(() => {
    if (!partidoId) return
    const partido  = partidos.find((p) => p.id === partidoId)
    if (!partido) return
    const local     = equipos.find((e) => e.id === partido.local.equipoId)
    const visitante = equipos.find((e) => e.id === partido.visitante.equipoId)
    if (!local || !visitante) return
    iniciarPartido({
      partidoId,
      localId: local.id, visitanteId: visitante.id,
      localNombre: local.nombre, visitanteNombre: visitante.nombre,
      localColor: local.color,   visitanteColor: visitante.color,
      jugadoresLocal:     jugadores.filter((j) => j.equipoId === local.id),
      jugadoresVisitante: jugadores.filter((j) => j.equipoId === visitante.id),
    })
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

  const enCanchaLocal     = jugadoresLocal.filter((j) => j.enCancha)
  const enCanchaVisitante = jugadoresVisitante.filter((j) => j.enCancha)
  const bancaLocal        = jugadoresLocal.filter((j) => !j.enCancha)
  const bancaVisitante    = jugadoresVisitante.filter((j) => !j.enCancha)

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
          <p className="text-[#FF6B00] font-black text-xl uppercase tracking-widest">
            ¡{ganador} ganó!
          </p>
        )}
        {!ganador && <p className="text-[#888] font-bold uppercase tracking-widest">Empate</p>}
        <button
          onClick={() => { reset(); navigate('/admin') }}
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
          <p className="text-white font-black text-sm uppercase tracking-widest text-center">
            Girá el dispositivo
          </p>
          <p className="text-[#555] text-xs text-center leading-relaxed">
            La mesa de control requiere tablet<br />en modo horizontal
          </p>
        </div>
      </div>
    )
  }

  // ── Mesa principal ──
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] z-40 flex flex-col overflow-hidden">

      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#080808] border-b border-[#1A1A1A] shrink-0">

        {/* Visitante info */}
        <div className="w-28 shrink-0">
          <p className="text-[#888] text-[9px] font-black tracking-widest uppercase">≡ Visitante</p>
          <p className="text-[#FF4444] text-[9px] font-bold">FALTAS: {faltasVisitante}</p>
          <FaltasDots count={faltasVisitante} />
        </div>

        {/* Visitante nombre + score */}
        <div className="flex items-center gap-1.5">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-1 max-w-[120px]">
            <p className="text-white font-black text-[11px] uppercase truncate">{visitanteNombre}</p>
          </div>
          <div className="w-12 h-9 flex items-center justify-center" style={{ backgroundColor: '#CC0000' }}>
            <span className="text-white font-black text-2xl tabular-nums">{ptsVisitante}</span>
          </div>
        </div>

        {/* Reloj central */}
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

        {/* Local score + nombre */}
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-9 flex items-center justify-center" style={{ backgroundColor: '#CC0000' }}>
            <span className="text-white font-black text-2xl tabular-nums">{ptsLocal}</span>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-1 max-w-[120px]">
            <p className="text-white font-black text-[11px] uppercase truncate">{localNombre}</p>
          </div>
        </div>

        {/* Local info */}
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
                <div key={j.id} className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#2A2A2A]" />
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
            {/* Piso de madera */}
            <div className="absolute inset-0 overflow-hidden rounded-sm" style={{ backgroundColor: '#C8870A' }}>

              {/* Líneas de cancha en SVG */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 940 500"
                preserveAspectRatio="none"
              >
                {/* Fondo tablones */}
                <rect width="940" height="500" fill="#C8870A" />
                {/* Tablones simulados */}
                {[50,100,150,200,250,300,350,400,450].map((y) => (
                  <line key={y} x1="0" y1={y} x2="940" y2={y} stroke="#B87B00" strokeWidth="1" opacity="0.4" />
                ))}
                {/* Borde cancha */}
                <rect x="12" y="12" width="916" height="476" fill="none" stroke="white" strokeWidth="3" opacity="0.7" />
                {/* Línea central */}
                <line x1="470" y1="12" x2="470" y2="488" stroke="white" strokeWidth="2" opacity="0.6" />
                {/* Círculo central */}
                <circle cx="470" cy="250" r="65" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
                <circle cx="470" cy="250" r="4"  fill="white" opacity="0.6" />
                {/* Zona izquierda (pintada) */}
                <rect x="12" y="170" width="175" height="160" fill="rgba(30,80,200,0.25)" stroke="white" strokeWidth="2" opacity="0.6" />
                {/* Zona derecha */}
                <rect x="753" y="170" width="175" height="160" fill="rgba(30,80,200,0.25)" stroke="white" strokeWidth="2" opacity="0.6" />
                {/* Línea de tiro libre izquierda */}
                <line x1="187" y1="170" x2="187" y2="330" stroke="white" strokeWidth="2" opacity="0.5" />
                {/* Línea de tiro libre derecha */}
                <line x1="753" y1="170" x2="753" y2="330" stroke="white" strokeWidth="2" opacity="0.5" />
                {/* Semicírculo tiro libre izquierdo */}
                <path d="M 187 170 A 80 80 0 0 1 187 330" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
                {/* Semicírculo tiro libre derecho */}
                <path d="M 753 170 A 80 80 0 0 0 753 330" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
                {/* Arco 3 puntos izquierdo */}
                <path d="M 12 138 L 80 138 A 220 220 0 0 1 80 362 L 12 362" fill="none" stroke="white" strokeWidth="2" opacity="0.55" />
                {/* Arco 3 puntos derecho */}
                <path d="M 928 138 L 860 138 A 220 220 0 0 0 860 362 L 928 362" fill="none" stroke="white" strokeWidth="2" opacity="0.55" />
                {/* Aro izquierdo */}
                <circle cx="62" cy="250" r="16" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
                <line x1="12" y1="250" x2="62" y2="250" stroke="white" strokeWidth="2" opacity="0.7" />
                {/* Aro derecho */}
                <circle cx="878" cy="250" r="16" fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
                <line x1="928" y1="250" x2="878" y2="250" stroke="white" strokeWidth="2" opacity="0.7" />
              </svg>

              {/* Dots clicables */}
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

              {/* Indicador de jugador seleccionado */}
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
                <div key={j.id} className="w-3 h-3 rounded-full bg-[#1A1A1A] border border-[#2A2A2A]" />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="flex shrink-0 border-t border-[#1A1A1A]">
        <button
          onClick={finalizarPartido}
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
          onClick={() => { if (!corriendo && cuarto < 4) siguienteCuarto(); else toggleReloj() }}
          className="flex-1 bg-[#1A6B1A] hover:bg-[#145214] text-white font-black text-[11px] tracking-widest uppercase py-3 transition-colors"
        >
          {corriendo ? '⏸ Pausar' : cuarto < 4 ? '▶ Continuar' : '⏹ Fin'}
        </button>
      </div>
    </div>
  )
}

/* ── Jersey card de jugador ── */
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
      {/* Cuerpo de la camiseta */}
      <div
        className={`w-14 h-16 flex items-center justify-center relative transition-all
          ${selected ? 'ring-2 ring-white shadow-lg shadow-white/20' : ''}`}
        style={{
          backgroundColor: color,
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 18%, 80% 22%, 80% 100%, 20% 100%, 20% 22%, 0% 18%)',
        }}
      >
        <span className="text-white font-black text-xl leading-none" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          {jugador.dorsal}
        </span>
      </div>

      {/* Puntos del jugador */}
      <p className="text-white text-[9px] font-black mt-0.5 tabular-nums">
        {jugador.puntos > 0 ? `${jugador.puntos}pt` : ''}
      </p>

      {/* Faltas como puntos rojos */}
      <div className="flex gap-0.5 mt-0.5">
        {[...Array(Math.min(jugador.faltas, 5))].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF4444]" />
        ))}
        {[...Array(Math.max(0, 3 - jugador.faltas))].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2A2A2A]" />
        ))}
      </div>

      {/* Indicador seleccionado */}
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
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: i < count ? '#FF4444' : '#2A2A2A' }}
        />
      ))}
    </div>
  )
}
