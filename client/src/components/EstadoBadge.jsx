import { NOMBRES } from '../estados.js'

// Etiqueta de color con el nombre de la etapa.
export default function EstadoBadge({ estado }) {
  return <span className={`badge badge--${estado}`}>{NOMBRES[estado] || estado}</span>
}
