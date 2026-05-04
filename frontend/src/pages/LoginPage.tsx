import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { puedeAccederAdmin, useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  const login = useAuthStore((s) => s.login)
  const user = useAuthStore((s) => s.user)
  const rol = useAuthStore((s) => s.rol)
  const error = useAuthStore((s) => s.error)
  const navigate = useNavigate()

  useEffect(() => {
    if (user && puedeAccederAdmin(rol)) navigate('/admin', { replace: true })
  }, [user, rol, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(email, pass)
    setLoading(false)
    if (ok) navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-[#FF6B00] font-black text-3xl tracking-widest italic text-center mb-10">
          MI TORNEO
        </h1>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
          <div>
            <label className="text-[#888] text-xs uppercase tracking-widest font-bold block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0A0A] border-b border-[#2A2A2A] focus:border-[#FF6B00] text-white px-0 py-3 text-base outline-none transition-colors"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[#888] text-xs uppercase tracking-widest font-bold block mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-[#0A0A0A] border-b border-[#2A2A2A] focus:border-[#FF6B00] text-white px-0 py-3 text-base outline-none transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-[#FF4444] text-xs font-bold text-center tracking-wider">{error}</p>
          )}

          <button
            type="submit"
            className="mt-2 w-full bg-[#FF6B00] text-black font-black py-4 tracking-widest uppercase text-sm hover:bg-[#CC5500] transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 w-full text-[#555] hover:text-white text-xs font-bold tracking-widest uppercase transition-colors"
        >
          ← Ver torneos
        </button>
      </div>
    </div>
  )
}
