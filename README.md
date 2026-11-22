# Taller de Reparaciones

Segundo parcial de Programación Web. Aplicación para un taller que repara equipos electrónicos
(teléfonos, laptops, televisores): reemplaza la libreta donde se anotaban los equipos, los
presupuestos y en qué punto va cada reparación.

- **Interfaz:** React (Vite, JavaScript) + React Router (`react-router`). Peticiones con `fetch`.
- **Servidor:** PocketBase 0.41.1. Esquema en `server/pb_migrations`, lógica en `server/pb_hooks`.

## Estructura

```
Taller Reparaciones/
├── client/                    Aplicación React (Vite)
│   ├── vite.config.js         Proxy /api -> http://127.0.0.1:8090
│   └── src/
│       ├── main.jsx           BrowserRouter
│       ├── App.jsx            Rutas
│       ├── api.js             Todas las peticiones (fetch) a PocketBase
│       ├── useDatos.js        Hook propio para leer datos (useEffect + AbortController)
│       ├── estados.js         Nombres de etapas, total del presupuesto, formatos
│       ├── layouts/Layout.jsx Cabecera + <Outlet />
│       ├── pages/             Panel, Ordenes, NuevaOrden, DetalleOrden, Clientes, NoEncontrada
│       └── components/        Piezas pequeñas (tabla, badge, presupuesto, historial, ...)
└── server/
    ├── pb_migrations/         Colecciones y datos de prueba
    └── pb_hooks/              Reglas del taller (main.pb.js + reglas.js)
```

## Cómo levantarlo desde cero

Requisitos: **Node.js 20 o superior** y el ejecutable de **PocketBase 0.41.1**
(el binario no se sube al repositorio).

### 1. Servidor (PocketBase)

1. Descargar PocketBase 0.41.1 para tu sistema desde
   <https://github.com/pocketbase/pocketbase/releases/tag/v0.41.1>
   (`pocketbase_0.41.1_windows_amd64.zip` o `pocketbase_0.41.1_linux_amd64.zip`).
2. Descomprimir el ejecutable dentro de la carpeta `server/`.
3. Arrancarlo desde `server/`:

   Windows:
   ```bat
   cd server
   pocketbase.exe serve
   ```

   Linux / macOS:
   ```bash
   cd server
   chmod +x pocketbase   # solo la primera vez
   ./pocketbase serve
   ```

Al arrancar por primera vez se aplican solas las migraciones: se crean las colecciones
`clientes`, `ordenes` y `eventos` y se cargan los datos de prueba.

- API: <http://127.0.0.1:8090/api/>
- Panel de administración (opcional): <http://127.0.0.1:8090/_/>. Para entrar hay que crear
  un superusuario: `pocketbase.exe superuser upsert admin@taller.cu 1234567890`.
  La aplicación **no** lo necesita: no hay autenticación.

### 2. Cliente (React)

En otra terminal:

```bash
cd client
npm install
npm run dev
```

Abrir <http://localhost:5173>. Vite reenvía todo lo que empiece por `/api` a PocketBase
(ver `client/vite.config.js`), así que el servidor tiene que estar corriendo en el puerto 8090.

### Reiniciar los datos

Detener PocketBase y borrar la carpeta `server/pb_data`. Al arrancar otra vez se vuelven
a crear las colecciones y los datos de prueba.

## Datos de prueba

Los crea la migración `server/pb_migrations/1790000004_datos_semilla.js`. Las órdenes se
crean como `solicitada` y se avanzan paso a paso con `app.save()`, así que pasan por los
mismos hooks que la API y el historial (`eventos`) queda completo.

| Cliente | Teléfono |
|---|---|
| Maria Rodriguez | 5355 1001 |
| Carlos Perez | 5355 2002 |

| Equipo | Cliente | Etapa |
|---|---|---|
| Telefono Samsung Galaxy A52 | Maria | solicitada |
| Laptop Lenovo IdeaPad 3 | Carlos | en_diagnostico |
| Televisor LG 43 pulgadas | Maria | presupuestada |
| Tablet iPad 9na generacion | Carlos | en_reparacion |
| Consola PlayStation 4 | Maria | rechazada |

## Modelo de datos

| Colección | Campos | Reglas de acceso (list / view / create / update / delete) |
|---|---|---|
| `clientes` | `nombre`, `telefono` | todos / todos / todos / todos / **nadie** |
| `ordenes` | `cliente` (relación requerida), `equipo`, `problema`, `estado` (select), `diagnostico`, `manoObra` (número), `piezas` (json), `fotos` (hasta 3 imágenes) | todos / todos / todos / todos / **nadie** |
| `eventos` | `orden` (relación), `de`, `a`, `created` (automática) | todos / todos / **nadie** / **nadie** / **nadie** |

En PocketBase, una regla vacía (`""`) deja pasar a cualquiera y una regla `null` solo deja
pasar al superusuario. Como no hay usuarios, las reglas bloquean lo que nunca debe ocurrir
(borrar órdenes o clientes, crear, editar o borrar eventos) y los hooks validan el resto.

## Cómo se cumplen las garantías

Todo está en `server/pb_hooks/main.pb.js` (y la tabla de transiciones en `reglas.js`).
Se usan **hooks de modelo** (`onRecordCreate`, `onRecordUpdate`, `onRecordDelete`), que se
ejecutan en cada guardado, venga de la API, del panel de administración o de otro código.
La interfaz no es una medida de seguridad: solo muestra los botones que tienen sentido.

**Orden del proceso**
- Una orden nueva siempre nace `solicitada` y sin presupuesto.
- Al actualizar, el hook compara el estado guardado (`original()`) con el nuevo y solo deja
  pasar los cambios de la tabla:

  | De | A |
  |---|---|
  | solicitada | en_diagnostico o cancelada |
  | en_diagnostico | presupuestada |
  | presupuestada | aprobada o rechazada |
  | aprobada | en_reparacion |
  | en_reparacion | lista |
  | lista | entregada |

- Una orden `rechazada`, `cancelada` o `entregada` no acepta ningún cambio más.
- Dentro de la transacción se vuelve a leer la orden: si dos peticiones intentan cambiarla
  a la vez, la segunda se rechaza en lugar de dejar dos eventos.

**Presupuesto**
- `diagnostico`, `manoObra` y `piezas` solo se pueden escribir en el paso
  `en_diagnostico -> presupuestada` (con diagnóstico obligatorio y cada pieza con
  descripción, cantidad entera ≥ 1 y precio ≥ 0). Después no se pueden modificar.
- El total **no se guarda**: se calcula en la interfaz (`totalPresupuesto` en
  `client/src/estados.js`) como mano de obra + cantidad × precio de cada pieza.

**Historial**
- Cuando cambia la etapa, el mismo hook crea el evento (`de`, `a`, fecha automática)
  con `e.app`, dentro de la misma transacción que el cambio de la orden: si uno falla, no
  se guarda ninguno. La aplicación nunca tiene que acordarse de escribirlo.
- Nadie puede crear eventos a mano (`createRule = null` y además un hook que lo rechaza
  incluso al superusuario), ni editarlos ni borrarlos.

**Coherencia**
- La interfaz nunca guarda una copia propia: después de cada acción vuelve a pedir la
  orden y su historial al servidor, y si el servidor rechaza algo muestra su mensaje.
- El hook `useDatos` recarga los datos cuando la pestaña vuelve a estar visible, así que si
  otro navegador cambió algo se ve al volver. Recargar la página muestra lo guardado porque
  todo viene del servidor (los filtros de la lista viven en la URL).

### Probar las garantías saltándose la interfaz

Con el servidor corriendo (cambiar `ID` por el id de una orden, por ejemplo la del teléfono
Samsung, que está `solicitada`):

```bash
# Saltarse etapas -> 400 "Cambio de etapa no permitido: solicitada -> lista"
curl -X PATCH -H "Content-Type: application/json" -d '{"estado":"lista"}' \
  http://127.0.0.1:8090/api/collections/ordenes/records/ID

# Crear una orden directamente en otra etapa -> 400
curl -X POST -H "Content-Type: application/json" \
  -d '{"cliente":"ID_CLIENTE","equipo":"X","problema":"Y","estado":"aprobada"}' \
  http://127.0.0.1:8090/api/collections/ordenes/records

# Borrar una orden -> 403/404 (deleteRule = null)
curl -X DELETE http://127.0.0.1:8090/api/collections/ordenes/records/ID

# Crear, editar o borrar eventos -> rechazado
curl -X POST -H "Content-Type: application/json" -d '{"orden":"ID","de":"a","a":"b"}' \
  http://127.0.0.1:8090/api/collections/eventos/records
```

## Ruta propia

`GET /api/resumen` devuelve cuántas órdenes hay en cada etapa:

```json
{ "total": 5, "abiertas": 4, "porEstado": { "solicitada": 1, "en_diagnostico": 1, "...": 0 } }
```

La usa el panel de inicio.

## La interfaz

| Ruta | Página |
|---|---|
| `/` | Panel: órdenes por etapa (tarjetas) y trabajo pendiente |
| `/ordenes` | Lista con filtro por etapa y búsqueda por cliente, teléfono o equipo (`?estado=&q=`) |
| `/ordenes/nueva` | Recibir un equipo: cliente nuevo o registrado, equipo, problema y hasta 3 fotos |
| `/ordenes/:id` | Ficha: datos, fotos, presupuesto, siguiente paso e historial |
| `/clientes` | Clientes: búsqueda, alta y acceso a sus órdenes |
| `*` | Página 404 |

Todas las rutas están anidadas dentro de `Layout`, que pinta la cabecera y el `<Outlet />`.

Decisiones de React:
- **useEffect** solo para sincronizar con el exterior: pedir datos al servidor (con
  `AbortController` como limpieza), escuchar `visibilitychange` (se quita el listener al
  desmontar) y liberar las URL de vista previa de las fotos.
- **useRef**: contador de ids para las filas de piezas del presupuesto (key estable sin
  provocar renders), foco en el primer campo del formulario de recepción y la lista actual
  de fotos para la limpieza al desmontar.
- **No se usan useMemo ni useCallback**: los cálculos (por ejemplo el total del
  presupuesto) son sumas de pocas filas y ningún componente depende de la identidad de una
  función, así que no aportarían nada.
- Formularios controlados (el valor de cada campo vive en el estado), listas con `key` y
  datos hacia abajo por props.
