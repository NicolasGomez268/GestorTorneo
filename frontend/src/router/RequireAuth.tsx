import { Navigate } from 'react-router-dom'
import { puedeAccederAdmin, useAuthStore } from '../stores/authStore'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const ready = useAuthStore((s) => s.ready)
  const user = useAuthStore((s) => s.user)
  const rol = useAuthStore((s) => s.rol)

  if (!ready) {
    return <div className="p-4 text-xs text-[#888]">Cargando...</div>
  }

  return user && puedeAccederAdmin(rol) ? <>{children}</> : <Navigate to="/login" replace />
}
