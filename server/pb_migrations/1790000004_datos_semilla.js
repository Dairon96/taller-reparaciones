/// <reference path="../pb_data/types.d.ts" />

// Datos de prueba: 2 clientes y 5 ordenes en etapas distintas, con su historial.
// Las ordenes se crean "solicitadas" y se avanzan paso a paso, igual que en el taller,
// para que el historial (eventos) quede completo y con las fechas de cada cambio.
// Es idempotente: si el cliente ya existe (por telefono) no se vuelve a sembrar.
migrate((app) => {
  const clientesCol = app.findCollectionByNameOrId("clientes");
  const ordenesCol = app.findCollectionByNameOrId("ordenes");

  try {
    app.findFirstRecordByData("clientes", "telefono", "5355 1001");
    return; // ya sembrado
  } catch (_) {}

  const cliente = (nombre, telefono) => {
    const c = new Record(clientesCol, { nombre: nombre, telefono: telefono });
    app.save(c);
    return c;
  };

  const nuevaOrden = (cliente, equipo, problema) => {
    const o = new Record(ordenesCol, {
      cliente: cliente.id,
      equipo: equipo,
      problema: problema,
      estado: "solicitada",
      manoObra: 0,
      piezas: [],
    });
    app.save(o);
    return o;
  };

  // Cambia la etapa con app.save(). Los hooks de pb_hooks tambien se ejecutan durante
  // las migraciones, asi que la semilla pasa por las mismas validaciones que la API
  // y es el hook quien crea cada evento del historial.
  // Se vuelve a leer la orden de la base antes de cada cambio para partir del estado guardado.
  const avanzar = (orden, a, extra) => {
    const o = app.findRecordById("ordenes", orden.id);
    if (extra) {
      for (const campo in extra) o.set(campo, extra[campo]);
    }
    o.set("estado", a);
    app.save(o);
  };

  const maria = cliente("Maria Rodriguez", "5355 1001");
  const carlos = cliente("Carlos Perez", "5355 2002");

  // 1. Recien llegada: solicitada.
  nuevaOrden(maria, "Telefono Samsung Galaxy A52", "La pantalla se quedo en negro despues de una caida");

  // 2. En revision: en_diagnostico.
  const laptop = nuevaOrden(carlos, "Laptop Lenovo IdeaPad 3", "No carga la bateria y se apaga sola");
  avanzar(laptop, "en_diagnostico");

  // 3. Con presupuesto esperando la decision del cliente: presupuestada.
  const tv = nuevaOrden(maria, "Televisor LG 43 pulgadas", "Hay sonido pero no hay imagen");
  avanzar(tv, "en_diagnostico");
  avanzar(tv, "presupuestada", {
    diagnostico: "Tira de retroiluminacion LED fundida",
    manoObra: 25,
    piezas: [{ descripcion: "Kit de tiras LED 43\"", cantidad: 1, precio: 40 }],
  });

  // 4. Aprobada y en el banco de trabajo: en_reparacion.
  const tablet = nuevaOrden(carlos, "Tablet iPad 9na generacion", "El puerto de carga esta flojo");
  avanzar(tablet, "en_diagnostico");
  avanzar(tablet, "presupuestada", {
    diagnostico: "Conector Lightning desgastado",
    manoObra: 30,
    piezas: [
      { descripcion: "Conector de carga Lightning", cantidad: 1, precio: 18 },
      { descripcion: "Adhesivo de pantalla", cantidad: 1, precio: 5 },
    ],
  });
  avanzar(tablet, "aprobada");
  avanzar(tablet, "en_reparacion");

  // 5. Presupuesto rechazado: rechazada (cerrada).
  const consola = nuevaOrden(maria, "Consola PlayStation 4", "Hace mucho ruido y se calienta");
  avanzar(consola, "en_diagnostico");
  avanzar(consola, "presupuestada", {
    diagnostico: "Ventilador danado y pasta termica seca",
    manoObra: 20,
    piezas: [
      { descripcion: "Ventilador PS4", cantidad: 1, precio: 22 },
      { descripcion: "Pasta termica", cantidad: 1, precio: 6 },
    ],
  });
  avanzar(consola, "rechazada");
}, (app) => {
  // Al revertir no se borran ordenes ni eventos: el historial es permanente.
});
