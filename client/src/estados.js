// Datos del proceso que la interfaz necesita para mostrar las etapas.
// OJO: esto es solo para pintar botones y textos. La regla real la aplica el servidor
// (pb_hooks), que rechaza cualquier cambio no permitido aunque llegue por la API.

export const ETAPAS = ['solicitada', 'en_diagnostico', 'presupuestada', 'aprobada', 'en_reparacion', 'lista', 'entregada']

export const SALIDAS = ['rechazada', 'cancelada']

export const ESTADOS = [...ETAPAS, ...SALIDAS]

export const CERRADOS = ['entregada', 'rechazada', 'cancelada']

export const NOMBRES = {
  solicitada: 'Solicitada',
  en_diagnostico: 'En diagnóstico',
  presupuestada: 'Presupuestada',
  aprobada: 'Aprobada',
  en_reparacion: 'En reparación',
  lista: 'Lista',
  entregada: 'Entregada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
}

// Que significa cada etapa para el personal (se muestra en el panel).
export const DESCRIPCIONES = {
  solicitada: 'Recibidas, esperando revisión',
  en_diagnostico: 'Revisando el equipo',
  presupuestada: 'Esperando decisión del cliente',
  aprobada: 'Aprobadas, por reparar',
  en_reparacion: 'En el banco de trabajo',
  lista: 'Reparadas, por entregar',
  entregada: 'Devueltas al cliente',
  rechazada: 'Presupuesto rechazado',
  cancelada: 'Canceladas por el cliente',
}

export function estaCerrada(estado) {
  return CERRADOS.includes(estado)
}

// El total no se guarda: mano de obra + cantidad x precio de cada pieza.
export function totalPresupuesto(manoObra, piezas) {
  const totalPiezas = (piezas || []).reduce((suma, p) => suma + Number(p.cantidad) * Number(p.precio), 0)
  return Number(manoObra || 0) + totalPiezas
}

const numero = new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatearDinero(valor) {
  return '$' + numero.format(Number(valor) || 0)
}

// PocketBase devuelve fechas como "2026-11-22 20:43:05.946Z".
export function formatearFecha(texto) {
  if (!texto) return ''
  const fecha = new Date(texto.replace(' ', 'T'))
  return fecha.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
}
