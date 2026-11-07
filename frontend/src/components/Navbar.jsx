import { NavLink } from 'react-router-dom'

const ENLACES = [
  { ruta: '/', texto: 'Panel', exacto: true },
  { ruta: '/actividades', texto: 'Actividades' },
  { ruta: '/calendario', texto: 'Calendario' },
  { ruta: '/asignaturas', texto: 'Asignaturas' },
]

function Navbar() {
  // NavLink avisa si la ruta está activa para resaltar la pestaña actual
  const clase = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`

  return (
    <header className="app-header">
      <nav className="navbar container" aria-label="Navegación principal">
        <span className="marca">Entregas</span>
        <ul className="navbar-nav flex-row flex-wrap gap-3">
          {ENLACES.map((e) => (
            <li className="nav-item" key={e.ruta}>
              <NavLink to={e.ruta} end={e.exacto} className={clase}>{e.texto}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
