import { Link, useLocation } from 'react-router'

// Pagina para cualquier ruta que no existe (path="*").
export default function NoEncontrada() {
  const { pathname } = useLocation()
  return (
    <div className="centro">
      <h1>404 · Página no encontrada</h1>
      <p className="sutil">La dirección «{pathname}» no existe en la aplicación.</p>
      <Link to="/" className="boton">
        Ir al panel
      </Link>
    </div>
  )
}
