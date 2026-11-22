/// <reference path="../pb_data/types.d.ts" />

// Coleccion "clientes": las personas que traen equipos al taller.
// No inician sesion, son solo datos que registra el personal.
migrate((app) => {
  const clientes = new Collection({
    type: "base",
    name: "clientes",
    fields: [
      { name: "nombre", type: "text", required: true, min: 2, max: 100 },
      { name: "telefono", type: "text", required: true, min: 6, max: 30 },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    // No hay autenticacion: "" significa "cualquiera puede".
    // null significa "nadie por la API" (solo superusuario/hooks).
    // Un cliente no se borra para no dejar ordenes huerfanas.
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
  });

  return app.save(clientes);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("clientes"));
});
