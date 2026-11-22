import { Link } from 'react-router'
import { DESCRIPCIONES, ESTADOS, NOMBRES } from '../estados.js'

// Una tarjeta por etapa con cuantas ordenes hay. Cada tarjeta lleva a la lista filtrada.
export default function TarjetasResumen({ porEstado }) {
  return (
    <div className="tarjetas">
      {ESTADOS.map((estado) => (
        <Link key={estado} to={`/ordenes?estado=${estado}`} className={`tarjeta tarjeta--${estado}`}>
          <span className="tarjeta__numero">{porEstado[estado] ?? 0}</span>
          <span className="tarjeta__nombre">{NOMBRES[estado]}</span>
          <span className="tarjeta__desc">{DESCRIPCIONES[estado]}</span>
        </Link>
      ))}
    </div>
  )
}
