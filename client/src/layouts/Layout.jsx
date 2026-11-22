import { NavLink, Outlet } from 'react-router'

// Diseño comun: cabecera con navegacion y, debajo, la pagina de la ruta actual (Outlet).
export default function Layout() {
  return (
    <>
      <header className="cabecera">
        <div className="contenedor cabecera__fila">
          <NavLink to="/" className="marca">
            🔧 Taller de Reparaciones
          </NavLink>
          <nav className="nav">
            <NavLink to="/" end>
              Panel
            </NavLink>
            <NavLink to="/ordenes" end>
              Órdenes
            </NavLink>
            <NavLink to="/clientes">Clientes</NavLink>
            <NavLink to="/ordenes/nueva" className="nav__accion">
              + Recibir equipo
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="contenedor contenido">
        <Outlet />
      </main>
    </>
  )
}
