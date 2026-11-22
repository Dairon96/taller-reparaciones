import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { rutas } from '../api.js'
import { useDatos } from '../useDatos.js'
import { ESTADOS, NOMBRES } from '../estados.js'
import TablaOrdenes from '../components/TablaOrdenes.jsx'
import Aviso from '../components/Aviso.jsx'

// Lista de ordenes con filtro por etapa y busqueda (cliente, telefono, equipo).
// Los filtros viven en la URL (?estado=...&q=...), asi se pueden recargar o compartir.
export default function Ordenes() {
  const [params, setParams] = useSearchParams()
  const estado = params.get('estado') || ''
  const q = params.get('q') || ''

  // El campo de busqueda es controlado; se aplica al enviar el formulario.
  const [texto, setTexto] = useState(q)

  const { datos, error, cargando } = useDatos(rutas.ordenes({ estado, texto: q }))

  function cambiarFiltro(nuevos) {
    const siguiente = new URLSearchParams(params)
    for (const [clave, valor] of Object.entries(nuevos)) {
      if (valor) siguiente.set(clave, valor)
      else siguiente.delete(clave)
    }
    setParams(siguiente)
  }

  function buscar(evento) {
    evento.preventDefault()
    cambiarFiltro({ q: texto.trim() })
  }

  return (
    <>
      <div className="titulo-fila">
        <h1>Órdenes</h1>
        <Link to="/ordenes/nueva" className="boton">
          + Recibir equipo
        </Link>
      </div>

      <form className="filtros" onSubmit={buscar}>
        <label>
          Etapa
          <select value={estado} onChange={(e) => cambiarFiltro({ estado: e.target.value })}>
            <option value="">Todas</option>
            {ESTADOS.map((est) => (
              <option key={est} value={est}>
                {NOMBRES[est]}
              </option>
            ))}
          </select>
        </label>
        <label className="filtros__buscar">
          Buscar
          <input
            type="search"
            placeholder="Nombre o teléfono del cliente, equipo…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>
        <button type="submit" className="boton boton--secundario">
          Buscar
        </button>
      </form>

      <Aviso>{error?.message}</Aviso>
      {cargando && !datos && <p className="sutil">Cargando…</p>}
      {datos && (
        <>
          <p className="sutil">{datos.totalItems} resultado(s)</p>
          <TablaOrdenes ordenes={datos.items} vacio="Ninguna orden coincide con el filtro." />
        </>
      )}
    </>
  )
}
