import { Route, Routes } from 'react-router'
import Layout from './layouts/Layout.jsx'
import Panel from './pages/Panel.jsx'
import Ordenes from './pages/Ordenes.jsx'
import NuevaOrden from './pages/NuevaOrden.jsx'
import DetalleOrden from './pages/DetalleOrden.jsx'
import Clientes from './pages/Clientes.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

// Rutas de la aplicacion. Todas comparten el diseño de Layout, que pinta
// la cabecera y deja el contenido de cada pagina en su <Outlet />.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Panel />} />
        <Route path="ordenes">
          <Route index element={<Ordenes />} />
          <Route path="nueva" element={<NuevaOrden />} />
          <Route path=":id" element={<DetalleOrden />} />
        </Route>
        <Route path="clientes" element={<Clientes />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
