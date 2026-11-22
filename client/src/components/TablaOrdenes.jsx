import { Link } from 'react-router'
import EstadoBadge from './EstadoBadge.jsx'
import { formatearFecha } from '../estados.js'

// Lista de ordenes. Recibe las ordenes por props (con el cliente expandido).
export default function TablaOrdenes({ ordenes, vacio = 'No hay órdenes.' }) {
  if (ordenes.length === 0) return <p className="vacio">{vacio}</p>

  return (
    <div className="tabla-scroll">
      <table className="tabla">
        <thead>
          <tr>
            <th>Equipo</th>
            <th>Cliente</th>
            <th>Etapa</th>
            <th>Recibida</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            <FilaOrden key={orden.id} orden={orden} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FilaOrden({ orden }) {
  const cliente = orden.expand?.cliente
  return (
    <tr>
      <td>
        <Link to={`/ordenes/${orden.id}`} className="enlace-fuerte">
          {orden.equipo}
        </Link>
        <div className="sutil recorte">{orden.problema}</div>
      </td>
      <td>
        {cliente?.nombre}
        <div className="sutil">{cliente?.telefono}</div>
      </td>
      <td>
        <EstadoBadge estado={orden.estado} />
      </td>
      <td className="sutil">{formatearFecha(orden.created)}</td>
    </tr>
  )
}
