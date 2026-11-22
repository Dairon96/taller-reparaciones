import FormPresupuesto from './FormPresupuesto.jsx'
import { NOMBRES } from '../estados.js'

// Botones del siguiente paso segun la etapa actual.
// La interfaz solo ofrece los cambios de la tabla, pero quien manda es el servidor:
// si alguien intenta otro cambio por la API, el hook lo rechaza.
export default function AccionesOrden({ estado, onCambiar, enviando }) {
  function confirmarYCambiar(destino, pregunta) {
    if (window.confirm(pregunta)) onCambiar(destino)
  }

  switch (estado) {
    case 'solicitada':
      return (
        <div className="acciones">
          <button className="boton" disabled={enviando} onClick={() => onCambiar('en_diagnostico')}>
            Empezar revisión
          </button>
          <button
            className="boton boton--peligro"
            disabled={enviando}
            onClick={() => confirmarYCambiar('cancelada', '¿Cancelar la orden a petición del cliente? No se podrá reabrir.')}
          >
            Cancelar orden
          </button>
        </div>
      )

    case 'en_diagnostico':
      return <FormPresupuesto enviando={enviando} onPresupuestar={(datos) => onCambiar('presupuestada', datos)} />

    case 'presupuestada':
      return (
        <div className="acciones">
          <p className="sutil">Anota la respuesta del cliente:</p>
          <button className="boton" disabled={enviando} onClick={() => onCambiar('aprobada')}>
            El cliente aprueba
          </button>
          <button
            className="boton boton--peligro"
            disabled={enviando}
            onClick={() => confirmarYCambiar('rechazada', '¿El cliente rechaza el presupuesto? La orden se cerrará sin reparar.')}
          >
            El cliente rechaza
          </button>
        </div>
      )

    case 'aprobada':
      return <BotonSimple texto="Empezar reparación" destino="en_reparacion" onCambiar={onCambiar} enviando={enviando} />

    case 'en_reparacion':
      return <BotonSimple texto="Terminar reparación" destino="lista" onCambiar={onCambiar} enviando={enviando} />

    case 'lista':
      return <BotonSimple texto="Entregar al cliente" destino="entregada" onCambiar={onCambiar} enviando={enviando} />

    default:
      return <p className="sutil">La orden está {NOMBRES[estado]?.toLowerCase()} y ya no cambia.</p>
  }
}

function BotonSimple({ texto, destino, onCambiar, enviando }) {
  return (
    <div className="acciones">
      <button className="boton" disabled={enviando} onClick={() => onCambiar(destino)}>
        {texto}
      </button>
    </div>
  )
}
