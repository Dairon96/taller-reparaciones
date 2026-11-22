import { ETAPAS, NOMBRES } from '../estados.js'

// Barra de progreso con las etapas del proceso. Marca las ya pasadas y la actual.
// Si la orden salio del proceso (rechazada o cancelada) se indica en que etapa se cerro.
export default function LineaEtapas({ estado, eventos }) {
  const salida = estado === 'rechazada' || estado === 'cancelada'
  // Para una salida, la ultima etapa alcanzada es el "de" del evento que la cerro.
  const ultimaEtapa = salida ? eventos.at(-1)?.de || 'solicitada' : estado
  const posicion = ETAPAS.indexOf(ultimaEtapa)

  return (
    <ol className={`etapas ${salida ? 'etapas--cerrada' : ''}`}>
      {ETAPAS.map((etapa, i) => {
        let clase = 'etapas__paso'
        if (i < posicion || (i === posicion && estado === 'entregada')) clase += ' etapas__paso--hecho'
        else if (i === posicion) clase += salida ? ' etapas__paso--salida' : ' etapas__paso--actual'
        return (
          <li key={etapa} className={clase}>
            {NOMBRES[etapa]}
            {i === posicion && salida && <small> → {NOMBRES[estado]}</small>}
          </li>
        )
      })}
    </ol>
  )
}
