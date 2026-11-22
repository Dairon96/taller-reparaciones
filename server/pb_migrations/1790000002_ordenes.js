/// <reference path="../pb_data/types.d.ts" />

// Coleccion "ordenes": un equipo que entra al taller y todo su recorrido.
// Las reglas de negocio (etapas, presupuesto inmutable, etc.) se validan en pb_hooks.
migrate((app) => {
  const clientes = app.findCollectionByNameOrId("clientes");

  const ordenes = new Collection({
    type: "base",
    name: "ordenes",
    fields: [
      { name: "cliente", type: "relation", required: true, collectionId: clientes.id, maxSelect: 1, cascadeDelete: false },
      { name: "equipo", type: "text", required: true, max: 150 },
      { name: "problema", type: "text", required: true, max: 2000 },
      {
        name: "estado",
        type: "select",
        required: true,
        maxSelect: 1,
        values: [
          "solicitada",
          "en_diagnostico",
          "presupuestada",
          "aprobada",
          "rechazada",
          "en_reparacion",
          "lista",
          "entregada",
          "cancelada",
        ],
      },
      { name: "diagnostico", type: "text", max: 2000 },
      { name: "manoObra", type: "number", min: 0 },
      // Lista de piezas: [{ descripcion, cantidad, precio }]
      { name: "piezas", type: "json", maxSize: 20000 },
      {
        name: "fotos",
        type: "file",
        maxSelect: 3,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        thumbs: ["300x200"],
      },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE INDEX idx_ordenes_cliente ON ordenes (cliente)",
      "CREATE INDEX idx_ordenes_estado ON ordenes (estado)",
    ],
    // Se puede leer, crear y actualizar (los hooks deciden que cambios son validos).
    // Una orden nunca se borra: queda como historial del taller.
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null,
  });

  return app.save(ordenes);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("ordenes"));
});
