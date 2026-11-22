import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { cambiarEtapa, rutas, urlFoto } from '../api.js'
import { useDatos } from '../useDatos.js'
import { formatearFecha } from '../estados.js'
import EstadoBadge from '../components/EstadoBadge.jsx'
import LineaEtapas from '../components/LineaEtapas.jsx'
import AccionesOrden from '../components/AccionesOrden.jsx'
import VistaPresupuesto from '../components/VistaPresupuesto.jsx'
import Historial from '../components/Historial.jsx'
import Aviso from '../components/Aviso.jsx'

// Ficha de una orden (/ordenes/:id): datos, fotos, presupuesto, siguiente paso e historial.
export default function DetalleOrden() {
  const { id } = useParams()
  const orden = useDatos(rutas.orden(id))
  const eventos = useDatos(rutas.eventos(id))

  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  // Despues de cada cambio se vuelve a leer del servidor la orden y su historial:
  // lo que se ve es siempre lo guardado, no una copia local.
  async function cambiar(destino, extra) {
    setEnviando(true)
    setError('')
    try {
      await cambiarEtapa(id, destino, extra)
    } catch (err) {
      setError(err.message)
    } finally {
      orden.recargar()
      eventos.recargar()
      setEnviando(false)
    }
  }

  if (orden.error?.status === 404) {
    return (
      <div className="centro">
        <h1>Orden no encontrada</h1>
        <p className="sutil">No existe ninguna orden con el código «{id}».</p>
        <Link to="/ordenes" className="boton">
          Ver todas las órdenes
        </Link>
      </div>
    )
  }
  if (orden.error) return <Aviso>{orden.error.message}</Aviso>
  if (!orden.datos || !eventos.datos) return <p className="sutil">Cargando…</p>

  const o = orden.datos
  const cliente = o.expand?.cliente
  const listaEventos = eventos.datos.items

  return (
    <>
      <Link to="/ordenes" className="sutil">
        ← Órdenes
      </Link>
      <div className="titulo-fila">
        <h1>{o.equipo}</h1>
        <EstadoBadge estado={o.estado} />
      </div>
      <p className="sutil">
        Orden {o.id} · recibida el {formatearFecha(o.created)}
      </p>

      <LineaEtapas estado={o.estado} eventos={listaEventos} />

      <div className="detalle">
        <div className="detalle__principal">
          <section className="caja">
            <h2>Datos</h2>
            <dl className="datos">
              <dt>Cliente</dt>
              <dd>{cliente?.nombre}</dd>
              <dt>Teléfono</dt>
              <dd>
                <a href={`tel:${cliente?.telefono}`}>{cliente?.telefono}</a>
              </dd>
              <dt>Problema</dt>
              <dd className="texto-largo">{o.problema}</dd>
            </dl>
            {o.fotos.length > 0 && (
              <ul className="fotos">
                {o.fotos.map((foto) => (
                  <li key={foto} className="fotos__item">
                    <a href={urlFoto(o, foto)} target="_blank" rel="noreferrer">
                      <img src={urlFoto(o, foto, true)} alt={`Foto de ${o.equipo}`} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {o.diagnostico && (
            <section className="caja">
              <h2>Presupuesto</h2>
              <VistaPresupuesto orden={o} />
            </section>
          )}

          <section className="caja">
            <h2>Siguiente paso</h2>
            <Aviso>{error}</Aviso>
            <AccionesOrden key={o.estado} estado={o.estado} onCambiar={cambiar} enviando={enviando} />
          </section>
        </div>

        <aside className="caja detalle__lado">
          <h2>Historial</h2>
          <Historial orden={o} eventos={listaEventos} />
        </aside>
      </div>
    </>
  )
}
