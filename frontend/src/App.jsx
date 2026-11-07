import { Routes, Route } from 'react-router-dom'
import asignaturas from './data/asignaturas.json'
import actividadesIniciales from './data/actividades.json'
import useAlmacenamiento from './hooks/useAlmacenamiento'
import Navbar from './components/Navbar'
import Panel from './pages/Panel'
import Actividades from './pages/Actividades'
import Asignaturas from './pages/Asignaturas'
import Calendario from './pages/Calendario'

// El estado de las actividades vive aquí porque lo usan las tres páginas.
function App() {
  const [actividades, setActividades] = useAlmacenamiento('plazo-actividades-v2', actividadesIniciales)

  const agregar = (datos) => setActividades([...actividades, { ...datos, id: Date.now() }])
  const actualizar = (id, cambios) =>
    setActividades(actividades.map((a) => (a.id === id ? { ...a, ...cambios } : a)))
  const eliminar = (id) => setActividades(actividades.filter((a) => a.id !== id))

  return (
    <>
      <Navbar />
      <main className="container my-4">
        <Routes>
          <Route path="/" element={<Panel actividades={actividades} />} />
          <Route
            path="/actividades"
            element={
              <Actividades
                actividades={actividades}
                asignaturas={asignaturas}
                onAgregar={agregar}
                onActualizar={actualizar}
                onEliminar={eliminar}
              />
            }
          />
          <Route
            path="/asignaturas"
            element={<Asignaturas actividades={actividades} asignaturas={asignaturas} />}
          />
          <Route
            path="/calendario"
            element={<Calendario actividades={actividades} asignaturas={asignaturas} />}
          />
        </Routes>
      </main>
      <footer className="text-center text-muted py-4">
        <small>Proyecto de Desarrollo web y móvil</small>
      </footer>
    </>
  )
}

export default App
