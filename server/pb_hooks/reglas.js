// Reglas del taller compartidas por los hooks.
// Los handlers de PocketBase se ejecutan aislados y no ven las variables del archivo
// main.pb.js, por eso la logica comun vive aqui y se carga con require() dentro de cada handler.

// Tabla de cambios permitidos del enunciado, tal cual.
const TRANSICIONES = {
  solicitada: ["en_diagnostico", "cancelada"],
  en_diagnostico: ["presupuestada"],
  presupuestada: ["aprobada", "rechazada"],
  aprobada: ["en_reparacion"],
  en_reparacion: ["lista"],
  lista: ["entregada"],
  // Estados cerrados: no salen hacia ningun lado.
  rechazada: [],
  cancelada: [],
  entregada: [],
};

// Todas las etapas en el orden en que se muestran.
const ESTADOS = [
  "solicitada",
  "en_diagnostico",
  "presupuestada",
  "aprobada",
  "en_reparacion",
  "lista",
  "entregada",
  "rechazada",
  "cancelada",
];

const CERRADOS = ["rechazada", "cancelada", "entregada"];

function esCerrado(estado) {
  return CERRADOS.indexOf(estado) !== -1;
}

function transicionPermitida(de, a) {
  const destinos = TRANSICIONES[de];
  return !!destinos && destinos.indexOf(a) !== -1;
}

// Lee el campo json "piezas" como valor JS (null si esta vacio, undefined si es invalido).
function leerPiezas(record) {
  const crudo = record.getString("piezas");
  if (!crudo || crudo === "null") return null;
  try {
    return JSON.parse(crudo);
  } catch (_) {
    return undefined;
  }
}

// Valida la lista de piezas y la devuelve normalizada.
// Devuelve { piezas } si es valida o { error } con el motivo.
function validarPiezas(valor) {
  if (valor === null) return { piezas: [] };
  if (!Array.isArray(valor)) return { error: "piezas debe ser una lista" };

  const limpias = [];
  for (let i = 0; i < valor.length; i++) {
    const p = valor[i] || {};
    const n = i + 1;
    const descripcion = typeof p.descripcion === "string" ? p.descripcion.trim() : "";

    if (!descripcion) {
      return { error: "La pieza " + n + " necesita una descripcion" };
    }
    if (typeof p.cantidad !== "number" || !Number.isInteger(p.cantidad) || p.cantidad < 1) {
      return { error: "La cantidad de la pieza " + n + " debe ser un entero mayor que 0" };
    }
    if (typeof p.precio !== "number" || !isFinite(p.precio) || p.precio < 0) {
      return { error: "El precio de la pieza " + n + " debe ser un numero mayor o igual que 0" };
    }
    limpias.push({ descripcion: descripcion, cantidad: p.cantidad, precio: p.precio });
  }
  return { piezas: limpias };
}

// Compara dos valores json por su contenido.
function mismoJson(a, b) {
  const x = a === undefined || a === null ? [] : a;
  const y = b === undefined || b === null ? [] : b;
  return JSON.stringify(x) === JSON.stringify(y);
}

function piezasVacias(piezas) {
  return piezas === null || (Array.isArray(piezas) && piezas.length === 0);
}

module.exports = {
  ESTADOS,
  TRANSICIONES,
  CERRADOS,
  esCerrado,
  transicionPermitida,
  leerPiezas,
  validarPiezas,
  mismoJson,
  piezasVacias,
};
