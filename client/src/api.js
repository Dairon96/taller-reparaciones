// Todas las peticiones al servidor PocketBase, con fetch (sin SDK).
// Las rutas son relativas: en desarrollo Vite las reenvia a http://127.0.0.1:8090 (ver vite.config.js).

const BASE = '/api'

// Convierte la respuesta de error de PocketBase en un texto legible.
// PocketBase responde { message, data: { campo: { message } } }.
function mensajeDeError(cuerpo, status) {
  if (!cuerpo) return `Error ${status} al hablar con el servidor`
  const campos = Object.entries(cuerpo.data || {})
    .map(([campo, err]) => `${campo}: ${err.message}`)
    .join('. ')
  return campos ? `${cuerpo.message} ${campos}` : cuerpo.message
}

// Peticion generica: devuelve el JSON o lanza un Error con el mensaje del servidor.
export async function pedir(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(BASE + ruta, opciones)
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error('No se pudo conectar con el servidor. ¿Esta PocketBase en marcha?')
  }

  const cuerpo = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    const error = new Error(mensajeDeError(cuerpo, respuesta.status))
    error.status = respuesta.status
    throw error
  }
  return cuerpo
}

function enviarJson(metodo, ruta, datos) {
  return pedir(ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
}

// Escapa un texto para usarlo dentro de un filtro de PocketBase: campo ~ "texto"
function textoFiltro(texto) {
  return '"' + texto.replaceAll('\\', '\\\\').replaceAll('"', '\\"') + '"'
}

// ---------- Rutas de lectura (las usa el hook useDatos) ----------

export const rutas = {
  resumen: () => '/resumen',

  ordenes({ estado = '', texto = '', abiertas = false } = {}) {
    const filtros = []
    if (estado) filtros.push(`estado = ${textoFiltro(estado)}`)
    if (abiertas) filtros.push('estado != "entregada" && estado != "rechazada" && estado != "cancelada"')
    if (texto) {
      const t = textoFiltro(texto)
      filtros.push(`(equipo ~ ${t} || problema ~ ${t} || cliente.nombre ~ ${t} || cliente.telefono ~ ${t})`)
    }
    const params = new URLSearchParams({ expand: 'cliente', perPage: '200', sort: abiertas ? 'created' : '-created' })
    if (filtros.length) params.set('filter', filtros.join(' && '))
    return `/collections/ordenes/records?${params}`
  },

  orden: (id) => `/collections/ordenes/records/${encodeURIComponent(id)}?expand=cliente`,

  eventos(ordenId) {
    const params = new URLSearchParams({
      filter: `orden = ${textoFiltro(ordenId)}`,
      sort: 'created',
      perPage: '200',
    })
    return `/collections/eventos/records?${params}`
  },

  clientes(texto = '') {
    const params = new URLSearchParams({ sort: 'nombre', perPage: '500' })
    if (texto) {
      const t = textoFiltro(texto)
      params.set('filter', `(nombre ~ ${t} || telefono ~ ${t})`)
    }
    return `/collections/clientes/records?${params}`
  },
}

// ---------- Escrituras ----------

export function crearCliente({ nombre, telefono }) {
  return enviarJson('POST', '/collections/clientes/records', { nombre, telefono })
}

// Se envia como FormData para poder adjuntar las fotos.
export function crearOrden({ cliente, equipo, problema, fotos }) {
  const datos = new FormData()
  datos.append('cliente', cliente)
  datos.append('equipo', equipo)
  datos.append('problema', problema)
  for (const foto of fotos) datos.append('fotos', foto)
  return pedir('/collections/ordenes/records', { method: 'POST', body: datos })
}

// Cambia la etapa. "extra" lleva el presupuesto cuando se pasa a "presupuestada".
// El servidor (hook) decide si el cambio es valido y registra el evento.
export function cambiarEtapa(id, estado, extra = {}) {
  return enviarJson('PATCH', `/collections/ordenes/records/${encodeURIComponent(id)}?expand=cliente`, {
    ...extra,
    estado,
  })
}

export function urlFoto(orden, archivo, miniatura = false) {
  const url = `${BASE}/files/ordenes/${orden.id}/${encodeURIComponent(archivo)}`
  return miniatura ? `${url}?thumb=300x200` : url
}
