import { useNavigate } from 'react-router-dom'

interface Props {
  backTo?: string
  backLabel?: string
}

export default function AppHeader({ backTo, backLabel }: Props) {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#1A1A1A] h-14 flex items-center">
      <div className="w-full max-w-[1200px] mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Logo — siempre visible */}
        <button
          onClick={() => navigate('/')}
          className="text-[#FF6B00] font-black text-lg tracking-widest italic hover:opacity-80 transition-opacity shrink-0"
        >
          MI TORNEO
        </button>

        {/* Back button — solo cuando se pasa backTo */}
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="flex items-center gap-1.5 text-[#888] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors"
          >
            <span>←</span>
            <span>{backLabel ?? 'Volver'}</span>
          </button>
        )}
      </div>
    </header>
  )
}
