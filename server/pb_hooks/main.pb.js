/// <reference path="../pb_data/types.d.ts" />

// =====================================================================
// Hooks del taller de reparaciones.
//
// Se usan hooks de MODELO (onRecordCreate / onRecordUpdate / onRecordDelete):
// se ejecutan en cada guardado, venga de la API, del panel de administracion
// o de otro hook. Asi las garantias no dependen de por donde llegue la peticion.
// =====================================================================

// ---------------------------------------------------------------------
// ORDENES: al crear
// Toda orden nace "solicitada" y sin presupuesto.
// ---------------------------------------------------------------------
onRecordCreate((e) => {
  const r = require(`${__hooks}/reglas.js`);
  const orden = e.record;

  if (!orden.getString("estado")) {
    orden.set("estado", "solicitada");
  }
  if (orden.getString("estado") !== "solicitada") {
    throw new BadRequestError("Una orden nueva debe empezar en la etapa 'solicitada'");
  }

  // El presupuesto solo se registra al pasar a "presupuestada".
  const piezas = r.leerPiezas(orden);
  if (orden.getString("diagnostico").trim() !== "" || orden.getFloat("manoObra") !== 0 || !r.piezasVacias(piezas)) {
    throw new BadRequestError("El diagnostico, la mano de obra y las piezas se registran al presupuestar, no al crear la orden");
  }
  orden.set("piezas", []);

  e.next();
}, "ordenes");

// ---------------------------------------------------------------------
// ORDENES: al actualizar
// 1. Una orden cerrada (rechazada, cancelada, entregada) no cambia mas.
// 2. El estado solo cambia segun la tabla de transiciones (no se saltan etapas).
// 3. El presupuesto se registra solo en en_diagnostico -> presupuestada y despues es inmutable.
// 4. Cada cambio de etapa crea un evento en la MISMA transaccion.
// ---------------------------------------------------------------------
onRecordUpdate((e) => {
  const r = require(`${__hooks}/reglas.js`);
  const orden = e.record;
  const original = orden.original();

  const de = original.getString("estado");
  const a = orden.getString("estado");

  if (r.esCerrado(de)) {
    throw new BadRequestError("La orden esta '" + de + "' y ya no se puede modificar");
  }

  // Coherencia ante peticiones simultaneas: dentro de la transaccion se vuelve a leer
  // la orden. Si otra peticion ya la cambio de etapa, esta se rechaza.
  const enBase = e.app.findRecordById("ordenes", orden.id);
  if (enBase.getString("estado") !== de) {
    throw new BadRequestError("La orden cambio de etapa mientras tanto. Recarga y vuelve a intentarlo");
  }

  if (de !== a && !r.transicionPermitida(de, a)) {
    throw new BadRequestError("Cambio de etapa no permitido: " + de + " -> " + a);
  }

  const presupuestando = de === "en_diagnostico" && a === "presupuestada";

  const piezasAntes = r.leerPiezas(original);
  const piezasAhora = r.leerPiezas(orden);
  const cambioPresupuesto =
    orden.getString("diagnostico") !== original.getString("diagnostico") ||
    orden.getFloat("manoObra") !== original.getFloat("manoObra") ||
    !r.mismoJson(piezasAhora, piezasAntes);

  if (presupuestando) {
    if (orden.getString("diagnostico").trim() === "") {
      throw new BadRequestError("Para presupuestar hay que escribir el diagnostico");
    }
    if (piezasAhora === undefined) {
      throw new BadRequestError("piezas no es un json valido");
    }
    const resultado = r.validarPiezas(piezasAhora);
    if (resultado.error) {
      throw new BadRequestError(resultado.error);
    }
    orden.set("diagnostico", orden.getString("diagnostico").trim());
    orden.set("piezas", resultado.piezas);
  } else if (cambioPresupuesto) {
    throw new BadRequestError(
      "El presupuesto (diagnostico, mano de obra y piezas) solo se registra al pasar de en_diagnostico a presupuestada y no se modifica despues"
    );
  }

  // Guarda la orden. Si falla, no se llega a crear el evento.
  e.next();

  // Ya guardada, y dentro de la misma transaccion (e.app), registra el cambio de etapa.
  // Si guardar el evento falla, tambien se deshace el cambio de la orden.
  if (de !== a) {
    const evento = new Record(e.app.findCollectionByNameOrId("eventos"));
    evento.set("orden", orden.id);
    evento.set("de", de);
    evento.set("a", a);
    e.app.save(evento);
  }
}, "ordenes");

// Una orden nunca se borra (deleteRule = null ya lo impide por la API; esto frena tambien al superusuario).
onRecordDelete((e) => {
  throw new BadRequestError("Las ordenes no se borran");
}, "ordenes");

// ---------------------------------------------------------------------
// EVENTOS: historial que solo escribe el servidor.
// ---------------------------------------------------------------------

// Nadie crea eventos por la API (ni el superusuario): solo el hook de ordenes.
onRecordCreateRequest((e) => {
  throw new ForbiddenError("Los eventos los registra el servidor al cambiar de etapa");
}, "eventos");

onRecordUpdate((e) => {
  throw new BadRequestError("El historial no se puede editar");
}, "eventos");

onRecordDelete((e) => {
  throw new BadRequestError("El historial no se puede borrar");
}, "eventos");

// ---------------------------------------------------------------------
// RUTA PROPIA: resumen de ordenes por etapa (para el panel de inicio).
// GET /api/resumen -> { total, abiertas, porEstado: { solicitada: 2, ... } }
// ---------------------------------------------------------------------
routerAdd("GET", "/api/resumen", (e) => {
  const r = require(`${__hooks}/reglas.js`);

  const porEstado = {};
  let total = 0;
  let abiertas = 0;
  for (let i = 0; i < r.ESTADOS.length; i++) {
    const estado = r.ESTADOS[i];
    const n = $app.countRecords("ordenes", $dbx.hashExp({ estado: estado }));
    porEstado[estado] = n;
    total += n;
    if (!r.esCerrado(estado)) abiertas += n;
  }

  return e.json(200, { total: total, abiertas: abiertas, porEstado: porEstado });
});
