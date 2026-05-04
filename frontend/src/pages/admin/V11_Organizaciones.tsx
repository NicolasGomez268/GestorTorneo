import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Organizacion } from '../../data/tipos'
import {
  crearOrganizacion,
  crearUsuarioOrganizador,
  listarOrganizaciones,
} from '../../stores/adminStore'

export default function V11_Organizaciones() {
  const navigate = useNavigate()
  const [lista, setLista] = useState<Organizacion[]>([])
  const [nombreNueva, setNombreNueva] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const [idOrgUsuario, setIdOrgUsuario] = useState('')
  const [emailUsuario, setEmailUsuario] = useState('')
  const [passUsuario, setPassUsuario] = useState('')

  const recargar = useCallback(async () => {
    try {
      const l = await listarOrganizaciones()
      setLista(l)
      setIdOrgUsuario((prev) => prev || (l[0]?.id ?? ''))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error al listar')
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void recargar()
    }, 0)
    return () => clearTimeout(t)
  }, [recargar])

  const handleCrearOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    if (!nombreNueva.trim()) {
      setErr('Nombre obligatorio')
      return
    }
    try {
      await crearOrganizacion({ nombre: nombreNueva.trim() })
      setNombreNueva('')
      setMsg('Organización creada')
      await recargar()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error al crear')
    }
  }

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    if (!idOrgUsuario || !emailUsuario.trim() || !passUsuario) {
      setErr('Completá organización, email y contraseña')
      return
    }
    try {
      await crearUsuarioOrganizador({
        idOrganizacion: idOrgUsuario,
        email: emailUsuario.trim(),
        password: passUsuario,
      })
      setEmailUsuario('')
      setPassUsuario('')
      setMsg('Usuario organizador creado. Ya puede iniciar sesión con ese email.')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error al crear usuario')
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/admin')}
        className="flex items-center gap-1.5 text-[#555] hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors mb-6"
      >
        ← Panel de control
      </button>

      <h1 className="text-white font-black text-2xl italic uppercase mb-2">Organizaciones</h1>
      <p className="text-[#555] text-xs mb-6 uppercase tracking-wider">
        Alta de cliente / club y usuario organizador (solo superadmin).
      </p>

      {msg && <p className="text-green-400 text-xs font-bold mb-3">{msg}</p>}
      {err && <p className="text-[#FF4444] text-xs font-bold mb-3">{err}</p>}

      <section className="mb-10 border border-[#2A2A2A] p-4 bg-[#131313]">
        <h2 className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase mb-4">
          Nueva organización
        </h2>
        <form onSubmit={(e) => void handleCrearOrg(e)} className="flex flex-col gap-3 max-w-md">
          <label className="text-[#888] text-[10px] font-black uppercase">Nombre del club</label>
          <input
            value={nombreNueva}
            onChange={(e) => setNombreNueva(e.target.value)}
            className="bg-[#0A0A0A] border border-[#2A2A2A] text-white px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-[#FF6B00] text-black font-black py-2 text-xs uppercase tracking-widest">
            Crear organización
          </button>
        </form>
      </section>

      <section className="mb-10 border border-[#2A2A2A] p-4 bg-[#131313]">
        <h2 className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase mb-4">
          Usuario organizador
        </h2>
        <form onSubmit={(e) => void handleCrearUsuario(e)} className="flex flex-col gap-3 max-w-md">
          <label className="text-[#888] text-[10px] font-black uppercase">Organización</label>
          <select
            value={idOrgUsuario}
            onChange={(e) => setIdOrgUsuario(e.target.value)}
            className="bg-[#0A0A0A] border border-[#2A2A2A] text-white px-3 py-2 text-sm"
          >
            <option value="">Elegí…</option>
            {lista.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
          <label className="text-[#888] text-[10px] font-black uppercase">Email</label>
          <input
            type="email"
            autoComplete="off"
            value={emailUsuario}
            onChange={(e) => setEmailUsuario(e.target.value)}
            className="bg-[#0A0A0A] border border-[#2A2A2A] text-white px-3 py-2 text-sm"
          />
          <label className="text-[#888] text-[10px] font-black uppercase">Contraseña inicial</label>
          <input
            type="password"
            value={passUsuario}
            onChange={(e) => setPassUsuario(e.target.value)}
            className="bg-[#0A0A0A] border border-[#2A2A2A] text-white px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-[#FF6B00] text-black font-black py-2 text-xs uppercase tracking-widest">
            Crear usuario organizador
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-[#FF6B00] text-[10px] font-black tracking-widest uppercase mb-3">Listado</h2>
        <ul className="text-[#888] text-sm space-y-2">
          {lista.map((o) => (
            <li key={o.id} className="border-b border-[#2A2A2A] pb-2">
              <span className="text-white font-bold">{o.nombre}</span>
              <span className="text-[#555] text-xs ml-2">id: {o.id}</span>
              <span className="text-[#555] text-xs ml-2">{o.estado}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
