import { useState } from 'react'
import { Link } from 'react-router'
import { crearCliente, rutas } from '../api.js'
import { useDatos } from '../useDatos.js'
import Aviso from '../components/Aviso.jsx'

// Clientes registrados: busqueda, alta y acceso rapido a sus ordenes.
export default function Clientes() {
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const clientes = useDatos(rutas.clientes(busqueda))

  function buscar(evento) {
    evento.preventDefault()
    setBusqueda(texto.trim())
  }

  return (
    <>
      <div className="titulo-fila">
        <h1>Clientes</h1>
      </div>

      <div className="detalle">
        <div className="detalle__principal">
          <form className="filtros" onSubmit={buscar}>
            <label className="filtros__buscar">
              Buscar
              <input type="search" placeholder="Nombre o teléfono" value={texto} onChange={(e) => setTexto(e.target.value)} />
            </label>
            <button type="submit" className="boton boton--secundario">
              Buscar
            </button>
          </form>

          <Aviso>{clientes.error?.message}</Aviso>
          {clientes.datos && <ListaClientes clientes={clientes.datos.items} />}
        </div>

        <aside className="caja detalle__lado">
          <h2>Nuevo cliente</h2>
          <FormCliente onCreado={clientes.recargar} />
        </aside>
      </div>
    </>
  )
}

function ListaClientes({ clientes }) {
  if (clientes.length === 0) return <p className="vacio">No hay clientes.</p>
  return (
    <div className="tabla-scroll">
      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.telefono}</td>
              <td className="acciones-celda">
                <Link to={`/ordenes?q=${encodeURIComponent(c.telefono)}`}>Ver órdenes</Link>
                <Link to={`/ordenes/nueva?cliente=${c.id}`}>Recibir equipo</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FormCliente({ onCreado }) {
  const [datos, setDatos] = useState({ nombre: '', telefono: '' })
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  async function guardar(evento) {
    evento.preventDefault()
    setError('')
    setOk('')
    try {
      const creado = await crearCliente({ nombre: datos.nombre.trim(), telefono: datos.telefono.trim() })
      setOk(`${creado.nombre} registrado.`)
      setDatos({ nombre: '', telefono: '' })
      onCreado()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={guardar}>
      <label className="campo">
        Nombre
        <input value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} required />
      </label>
      <label className="campo">
        Teléfono
        <input type="tel" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} required />
      </label>
      <Aviso>{error}</Aviso>
      <Aviso tipo="ok">{ok}</Aviso>
      <button type="submit" className="boton">
        Guardar cliente
      </button>
    </form>
  )
}
