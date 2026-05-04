import { createBrowserRouter, Navigate } from 'react-router-dom'

import PublicLayout   from '../components/PublicLayout'
import LoginPage      from '../pages/LoginPage'
import V1_Torneos     from '../pages/public/V1_Torneos'
import V2_Divisiones  from '../pages/public/V2_Divisiones'
import V3_HubDivision from '../pages/public/V3_HubDivision'
import V4_Equipo      from '../pages/public/V4_Equipo'
import V5_Partido     from '../pages/public/V5_Partido'

import AdminLayout from '../components/AdminLayout'
import V6_Dashboard from '../pages/admin/V6_Dashboard'
import V7_Torneo from '../pages/admin/V7_Torneo'
import V8_Equipos from '../pages/admin/V8_Equipos'
import V9_Fixture from '../pages/admin/V9_Fixture'
import V10_Mesa from '../pages/admin/V10_Mesa'
import V11_Organizaciones from '../pages/admin/V11_Organizaciones'
import { RequireAuth } from './RequireAuth'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true,                                                                      element: <V1_Torneos /> },
      { path: 'torneo/:torneoId',                                                        element: <V2_Divisiones /> },
      { path: 'torneo/:torneoId/division/:divId',                                        element: <V3_HubDivision /> },
      { path: 'torneo/:torneoId/division/:divId/equipo/:equipoId',                       element: <V4_Equipo /> },
      { path: 'torneo/:torneoId/division/:divId/partido/:partidoId',                     element: <V5_Partido /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: <RequireAuth><AdminLayout /></RequireAuth>,
    children: [
      { index: true,              element: <V6_Dashboard /> },
      { path: 'torneo',           element: <V7_Torneo /> },
      { path: 'organizaciones',   element: <V11_Organizaciones /> },
      { path: 'equipos',          element: <V8_Equipos /> },
      { path: 'fixture',          element: <V9_Fixture /> },
      { path: 'mesa/:partidoId',  element: <V10_Mesa /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
