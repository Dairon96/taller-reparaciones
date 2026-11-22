import { useRef, useState } from 'react'
import { formatearDinero, totalPresupuesto } from '../estados.js'

// Formulario controlado del presupuesto: diagnostico, mano de obra y lista de piezas.
// Al enviarlo llama a onPresupuestar con los datos ya convertidos a numeros.
export default function FormPresupuesto({ onPresupuestar, enviando }) {
  // useRef como contador: da a cada fila de pieza una key estable que no cambia al
  // borrar otras filas (usar el indice como key mezclaria los inputs).
  // No es estado porque cambiarlo no tiene que volver a pintar nada.
  const siguienteId = useRef(1)
  const nuevaPieza = () => ({ id: siguienteId.current++, descripcion: '', cantidad: '1', precio: '' })

  const [diagnostico, setDiagnostico] = useState('')
  const [manoObra, setManoObra] = useState('')
  const [piezas, setPiezas] = useState([])
  const [error, setError] = useState('')

  function cambiarPieza(id, campo, valor) {
    setPiezas(piezas.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)))
  }

  function quitarPieza(id) {
    setPiezas(piezas.filter((p) => p.id !== id))
  }

  function enviar(evento) {
    evento.preventDefault()
    setError('')

    if (!diagnostico.trim()) return setError('Escribe el diagnóstico.')
    const mano = Number(manoObra)
    if (manoObra === '' || !(mano >= 0)) return setError('La mano de obra debe ser un número mayor o igual que 0.')

    const limpias = piezas.map((p) => ({
      descripcion: p.descripcion.trim(),
      cantidad: Number(p.cantidad),
      precio: Number(p.precio),
    }))
    const mala = limpias.findIndex(
      (p) => !p.descripcion || !Number.isInteger(p.cantidad) || p.cantidad < 1 || !(p.precio >= 0),
    )
    if (mala !== -1) return setError(`Revisa la pieza ${mala + 1}: descripción, cantidad entera ≥ 1 y precio ≥ 0.`)

    onPresupuestar({ diagnostico: diagnostico.trim(), manoObra: mano, piezas: limpias })
  }

  const total = totalPresupuesto(manoObra, piezas.map((p) => ({ cantidad: p.cantidad || 0, precio: p.precio || 0 })))

  return (
    <form className="presupuesto-form" onSubmit={enviar}>
      <label className="campo">
        Diagnóstico
        <textarea rows={3} value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
      </label>

      <label className="campo campo--corto">
        Mano de obra ($)
        <input type="number" min="0" step="0.01" value={manoObra} onChange={(e) => setManoObra(e.target.value)} />
      </label>

      <div className="campo">
        <span>Piezas</span>
        {piezas.length === 0 && <p className="sutil">Sin piezas. Agrega las que hagan falta.</p>}
        {piezas.map((p, i) => (
          <div key={p.id} className="pieza-fila">
            <input
              aria-label={`Descripción de la pieza ${i + 1}`}
              placeholder="Descripción"
              value={p.descripcion}
              onChange={(e) => cambiarPieza(p.id, 'descripcion', e.target.value)}
            />
            <input
              aria-label={`Cantidad de la pieza ${i + 1}`}
              type="number"
              min="1"
              step="1"
              value={p.cantidad}
              onChange={(e) => cambiarPieza(p.id, 'cantidad', e.target.value)}
            />
            <input
              aria-label={`Precio de la pieza ${i + 1}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio"
              value={p.precio}
              onChange={(e) => cambiarPieza(p.id, 'precio', e.target.value)}
            />
            <button type="button" className="boton boton--mini boton--peligro" onClick={() => quitarPieza(p.id)}>
              Quitar
            </button>
          </div>
        ))}
        <button type="button" className="boton boton--secundario boton--mini" onClick={() => setPiezas([...piezas, nuevaPieza()])}>
          + Agregar pieza
        </button>
      </div>

      <p className="total">
        Total: <strong>{formatearDinero(total)}</strong>
      </p>
      {error && <p className="aviso aviso--error">{error}</p>}
      <p className="sutil">El presupuesto no se puede modificar después de registrarlo.</p>
      <button type="submit" className="boton" disabled={enviando}>
        Registrar presupuesto
      </button>
    </form>
  )
}
