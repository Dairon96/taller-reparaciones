import { rutas } from '../api.js'
import { useDatos } from '../useDatos.js'
import TarjetasResumen from '../components/TarjetasResumen.jsx'
import TablaOrdenes from '../components/TablaOrdenes.jsx'
import Aviso from '../components/Aviso.jsx'

// Vision de conjunto: cuantas ordenes hay en cada etapa y el trabajo pendiente.
export default function Panel() {
  const resumen = useDatos(rutas.resumen())
  const abiertas = useDatos(rutas.ordenes({ abiertas: true }))

  return (
    <>
      <div className="titulo-fila">
        <h1>Panel del taller</h1>
        {resumen.datos && (
          <p className="sutil">
            {resumen.datos.abiertas} órdenes abiertas · {resumen.datos.total} en total
          </p>
        )}
      </div>

      <Aviso>{resumen.error?.message}</Aviso>
      {resumen.datos && <TarjetasResumen porEstado={resumen.datos.porEstado} />}

      <section className="seccion">
        <h2>Trabajo pendiente</h2>
        <p className="sutil">Órdenes abiertas, de la más antigua a la más reciente.</p>
        <Aviso>{abiertas.error?.message}</Aviso>
        {abiertas.cargando && !abiertas.datos && <p className="sutil">Cargando…</p>}
        {abiertas.datos && <TablaOrdenes ordenes={abiertas.datos.items} vacio="No hay trabajo pendiente." />}
      </section>
    </>
  )
}
