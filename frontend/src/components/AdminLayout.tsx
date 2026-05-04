import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout)
  const rol = useAuthStore((s) => s.rol)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="bg-[#131313] border-b border-[#2A2A2A] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-[#FF6B00] font-black text-xl tracking-wider italic hover:text-[#CC5500] transition-colors"
        >
          MI TORNEO
        </button>
        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex gap-2 text-xs font-bold tracking-wider uppercase">
            {[
              { to: '/admin', label: 'Dashboard' },
              ...(rol === 'superadmin'
                ? [{ to: '/admin/organizaciones' as const, label: 'Orgs' }]
                : []),
              { to: '/admin/torneo', label: 'Torneo' },
              { to: '/admin/equipos', label: 'Equipos' },
              { to: '/admin/fixture', label: 'Fixture' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) =>
                  `px-3 py-1.5 transition-colors ${isActive ? 'text-[#FF6B00]' : 'text-[#888] hover:text-white'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="text-xs font-bold tracking-wider uppercase text-[#888] hover:text-white border border-[#2A2A2A] px-3 py-1.5 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
