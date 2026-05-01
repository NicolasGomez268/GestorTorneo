import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface Props {
  torneoId: string
  divId: string
}

const TABS = [
  { key: 'posiciones', label: 'Posiciones' },
  { key: 'goleadores', label: 'Goleadores' },
  { key: 'fixture',    label: 'Fixture'    },
  { key: 'proximos',   label: 'Próximos'   },
  { key: 'playoff',    label: 'Play-off'   },
]

export default function BottomNav({ torneoId, divId }: Props) {
  const [open, setOpen] = useState(false)
  const navigate        = useNavigate()
  const { search }      = useLocation()

  const base = `/torneo/${torneoId}/division/${divId}`

  const activeKey = search.includes('tab=goleadores') ? 'goleadores'
    : search.includes('tab=fixture')  ? 'fixture'
    : search.includes('tab=proximos') ? 'proximos'
    : search.includes('tab=playoff')  ? 'playoff'
    : 'posiciones'

  const activeLabel = TABS.find((t) => t.key === activeKey)?.label ?? ''

  const goTo = (key: string) => {
    const url = key === 'posiciones' ? base : `${base}?tab=${key}`
    navigate(url)
    setOpen(false)
  }

  return (
    <>
      {/* Barra inferior fija — solo mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#131313] border-t border-[#2A2A2A] flex items-center justify-between px-5 h-14">
        <span className="text-[#FF6B00] font-black text-sm tracking-widest uppercase">
          {activeLabel}
        </span>
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col gap-1.5 p-2 -mr-2"
          aria-label="Abrir menú de secciones"
        >
          <span className="block w-5 h-0.5 bg-white" />
          <span className="block w-5 h-0.5 bg-white" />
          <span className="block w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/70"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#131313] border-t border-[#2A2A2A] transition-transform duration-300
          ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#2A2A2A] rounded-full" />
        </div>

        <div className="pb-safe">
          {TABS.map((tab) => {
            const isActive = tab.key === activeKey
            return (
              <button
                key={tab.key}
                onClick={() => goTo(tab.key)}
                className={`w-full flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A] transition-colors
                  ${isActive ? 'text-[#FF6B00]' : 'text-white hover:bg-[#1A1A1A]'}`}
              >
                <span className="font-black text-base tracking-widest uppercase">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                )}
              </button>
            )
          })}

          <button
            onClick={() => setOpen(false)}
            className="w-full py-4 text-[#555] text-xs font-black tracking-widest uppercase"
          >
            CERRAR
          </button>
        </div>
      </div>
    </>
  )
}
