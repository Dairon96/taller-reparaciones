import { formatearDinero, totalPresupuesto } from '../estados.js'

// Presupuesto ya registrado (solo lectura). El total se calcula, no viene del servidor.
export default function VistaPresupuesto({ orden }) {
  const piezas = orden.piezas || []

  return (
    <div className="presupuesto">
      <p>
        <strong>Diagnóstico:</strong> {orden.diagnostico}
      </p>
      <div className="tabla-scroll">
        <table className="tabla tabla--compacta">
          <thead>
            <tr>
              <th>Concepto</th>
              <th className="num">Cant.</th>
              <th className="num">Precio</th>
              <th className="num">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mano de obra</td>
              <td className="num">—</td>
              <td className="num">—</td>
              <td className="num">{formatearDinero(orden.manoObra)}</td>
            </tr>
            {piezas.map((p, i) => (
              // Las piezas guardadas no cambian nunca, asi que el indice sirve como key.
              <tr key={i}>
                <td>{p.descripcion}</td>
                <td className="num">{p.cantidad}</td>
                <td className="num">{formatearDinero(p.precio)}</td>
                <td className="num">{formatearDinero(p.cantidad * p.precio)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total</td>
              <td className="num">
                <strong>{formatearDinero(totalPresupuesto(orden.manoObra, piezas))}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
