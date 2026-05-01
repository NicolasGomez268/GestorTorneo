import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AppHeader from './AppHeader'
import BottomNav from './BottomNav'

export default function PublicLayout() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  const match    = pathname.match(/\/torneo\/([^/]+)\/division\/([^/]+)/)
  const torneoId = match?.[1]
  const divId    = match?.[2]
  const enHub    = !!torneoId && !!divId

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <AppHeader />

      <main className={`flex-1 pt-14 ${enHub ? 'pb-16 lg:pb-0' : ''}`}>
        <Outlet />
      </main>

      {/* Footer con acceso admin casi invisible */}
      <footer className={`flex justify-center py-6 ${enHub ? 'pb-20 lg:pb-6' : ''}`}>
        <button
          onClick={() => navigate('/login')}
          className="text-xs text-[#555] hover:text-[#999] transition-colors tracking-wider"
        >
          Acceso administrativo
        </button>
      </footer>

      {enHub && <BottomNav torneoId={torneoId!} divId={divId!} />}
    </div>
  )
}
