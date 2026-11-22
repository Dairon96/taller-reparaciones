import { NOMBRES, formatearFecha } from '../estados.js'

// Historial de la orden: la recepcion (fecha de creacion de la orden) y cada evento
// de cambio de etapa que guardo el servidor, en orden cronologico.
export default function Historial({ orden, eventos }) {
  return (
    <ol className="historial">
      <li>
        <span className="historial__fecha">{formatearFecha(orden.created)}</span>
        <span>Equipo recibido · {NOMBRES.solicitada}</span>
      </li>
      {eventos.map((ev) => (
        <li key={ev.id}>
          <span className="historial__fecha">{formatearFecha(ev.created)}</span>
          <span>
            {NOMBRES[ev.de] || ev.de} → <strong>{NOMBRES[ev.a] || ev.a}</strong>
          </span>
        </li>
      ))}
    </ol>
  )
}
