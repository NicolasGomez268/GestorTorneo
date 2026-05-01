import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const [user, setUser]   = useState('')
  const [pass, setPass]   = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const login   = useAuthStore((s) => s.login)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const navigate = useNavigate()

  // Si ya está logueado, redirigir directo al admin
  useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true })
  }, [isAdmin, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(user, pass)
    setLoading(false)
    if (ok) navigate('/admin', { replace: true })
    else setError(true)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-[#FF6B00] font-black text-3xl tracking-widest italic text-center mb-10">
          MI TORNEO
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-[#888] text-xs uppercase tracking-widest font-bold block mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => { setUser(e.target.value); setError(false) }}
              className="w-full bg-[#0A0A0A] border-b border-[#2A2A2A] focus:border-[#FF6B00] text-white px-0 py-3 text-base outline-none transition-colors"
              autoComplete="username"
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
              onChange={(e) => { setPass(e.target.value); setError(false) }}
              className="w-full bg-[#0A0A0A] border-b border-[#2A2A2A] focus:border-[#FF6B00] text-white px-0 py-3 text-base outline-none transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-[#FF4444] text-xs font-bold text-center tracking-wider">
              Usuario o contraseña incorrectos
            </p>
          )}

          <button
            type="submit"
            className="mt-2 w-full bg-[#FF6B00] text-black font-black py-4 tracking-widest uppercase text-sm hover:bg-[#CC5500] transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
