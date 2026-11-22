/// <reference path="../pb_data/types.d.ts" />

// Coleccion "eventos": historial de cambios de etapa de cada orden.
// La crea el servidor (hook) en la misma transaccion que el cambio de etapa.
// Por la API solo se puede leer: nadie puede crearlos a mano, editarlos ni borrarlos.
migrate((app) => {
  const ordenes = app.findCollectionByNameOrId("ordenes");

  const eventos = new Collection({
    type: "base",
    name: "eventos",
    fields: [
      { name: "orden", type: "relation", required: true, collectionId: ordenes.id, maxSelect: 1, cascadeDelete: false },
      { name: "de", type: "text", required: true },
      { name: "a", type: "text", required: true },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
    ],
    indexes: ["CREATE INDEX idx_eventos_orden ON eventos (orden)"],
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  return app.save(eventos);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("eventos"));
});
