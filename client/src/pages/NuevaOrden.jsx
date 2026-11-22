import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { crearCliente, crearOrden, rutas } from '../api.js'
import { useDatos } from '../useDatos.js'
import SelectorFotos from '../components/SelectorFotos.jsx'
import Aviso from '../components/Aviso.jsx'

// Recibir un equipo: datos del cliente (existente o nuevo), equipo, problema y fotos.
// Todos los campos son controlados (su valor vive en el estado de React).
export default function NuevaOrden() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const clientes = useDatos(rutas.clientes())

  const [modo, setModo] = useState(params.get('cliente') ? 'existente' : 'nuevo')
  const [clienteId, setClienteId] = useState(params.get('cliente') || '')
  const [nuevo, setNuevo] = useState({ nombre: '', telefono: '' })
  const [equipo, setEquipo] = useState('')
  const [problema, setProblema] = useState('')
  const [fotos, setFotos] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  // useRef para llevar el foco al primer campo al abrir la pagina.
  const primerCampo = useRef(null)
  useEffect(() => {
    primerCampo.current?.focus()
  }, [modo])

  async function guardar(evento) {
    evento.preventDefault()
    setError('')

    if (modo === 'existente' && !clienteId) return setError('Elige un cliente.')
    if (modo === 'nuevo' && (!nuevo.nombre.trim() || !nuevo.telefono.trim())) {
      return setError('Escribe el nombre y el teléfono del cliente.')
    }
    if (!equipo.trim() || !problema.trim()) return setError('Describe el equipo y el problema.')

    setEnviando(true)
    try {
      let cliente = clienteId
      if (modo === 'nuevo') {
        const creado = await crearCliente({ nombre: nuevo.nombre.trim(), telefono: nuevo.telefono.trim() })
        cliente = creado.id
        // Si falla la orden, el cliente ya existe: se pasa a "existente" para no duplicarlo.
        setModo('existente')
        setClienteId(creado.id)
        clientes.recargar()
      }
      const orden = await crearOrden({
        cliente,
        equipo: equipo.trim(),
        problema: problema.trim(),
        fotos: fotos.map((f) => f.archivo),
      })
      navigate(`/ordenes/${orden.id}`)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  const lista = clientes.datos?.items || []

  return (
    <>
      <div className="titulo-fila">
        <h1>Recibir equipo</h1>
        <Link to="/ordenes" className="sutil">
          ← Volver a órdenes
        </Link>
      </div>

      <form className="tarjeta-form" onSubmit={guardar}>
        <fieldset>
          <legend>Cliente</legend>
          <div className="pestanas">
            <label>
              <input type="radio" name="modo" checked={modo === 'nuevo'} onChange={() => setModo('nuevo')} /> Cliente nuevo
            </label>
            <label>
              <input type="radio" name="modo" checked={modo === 'existente'} onChange={() => setModo('existente')} /> Ya registrado
            </label>
          </div>

          {modo === 'nuevo' ? (
            <div className="rejilla-2">
              <label className="campo">
                Nombre
                <input
                  ref={primerCampo}
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                  placeholder="Nombre y apellidos"
                />
              </label>
              <label className="campo">
                Teléfono
                <input
                  type="tel"
                  value={nuevo.telefono}
                  onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
                  placeholder="5355 0000"
                />
              </label>
            </div>
          ) : (
            <label className="campo">
              Cliente
              <select ref={primerCampo} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">— Elegir cliente —</option>
                {lista.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} · {c.telefono}
                  </option>
                ))}
              </select>
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend>Equipo</legend>
          <label className="campo">
            Equipo
            <input value={equipo} onChange={(e) => setEquipo(e.target.value)} placeholder="Ej.: Laptop HP 15, Televisor Samsung 50…" />
          </label>
          <label className="campo">
            Problema que describe el cliente
            <textarea rows={4} value={problema} onChange={(e) => setProblema(e.target.value)} />
          </label>
          <SelectorFotos fotos={fotos} onCambio={setFotos} />
        </fieldset>

        <Aviso>{error}</Aviso>
        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Registrar orden'}
        </button>
      </form>
    </>
  )
}
