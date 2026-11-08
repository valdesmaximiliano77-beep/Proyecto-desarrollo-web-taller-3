import { Routes, Route } from 'react-router-dom'
import useCarga from './hooks/useCarga'
import {
  listarTareas, crearTarea, actualizarTarea, eliminarTarea, listarAsignaturas,
} from './services/agendaApi'
import Navbar from './components/Navbar'
import Panel from './pages/Panel'
import Actividades from './pages/Actividades'
import Asignaturas from './pages/Asignaturas'
import Calendario from './pages/Calendario'

// Los datos ahora vienen de la API. Las acciones esperan al servidor y, si este rechaza algo
// (por ejemplo, una regla de negocio), el error llega a quien las llamó para mostrarlo.
function App() {
  const tareas = useCarga(listarTareas)
  const asignaturas = useCarga(listarAsignaturas)

  const recargarTodo = () => Promise.all([tareas.recargar(), asignaturas.recargar()])
  const error = tareas.error || asignaturas.error
  const primeraCarga = tareas.datos === null || asignaturas.datos === null

  const agregar = async (datos) => { await crearTarea(datos); await tareas.recargar() }
  const actualizar = async (id, cambios) => { await actualizarTarea(id, cambios); await tareas.recargar() }
  const eliminar = async (id) => { await eliminarTarea(id); await tareas.recargar() }

  let contenido
  if (error) {
    contenido = (
      <div className="alert alert-danger" role="alert">
        {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={recargarTodo}>Reintentar</button>
      </div>
    )
  } else if (primeraCarga) {
    contenido = (
      <div className="text-center my-5">
        <div className="spinner-border" role="status" />
        <p className="mt-2 text-muted">Cargando tu agenda…</p>
      </div>
    )
  } else {
    contenido = (
      <Routes>
        <Route path="/" element={<Panel actividades={tareas.datos} asignaturas={asignaturas.datos} />} />
        <Route
          path="/actividades"
          element={
            <Actividades
              actividades={tareas.datos}
              asignaturas={asignaturas.datos}
              onAgregar={agregar}
              onActualizar={actualizar}
              onEliminar={eliminar}
              onCambio={tareas.recargar}
            />
          }
        />
        <Route
          path="/asignaturas"
          element={<Asignaturas actividades={tareas.datos} asignaturas={asignaturas.datos} />}
        />
        <Route
          path="/calendario"
          element={<Calendario actividades={tareas.datos} asignaturas={asignaturas.datos} />}
        />
      </Routes>
    )
  }

  return (
    <>
      <Navbar />
      <main className="container my-4">{contenido}</main>
      <footer className="text-center text-muted py-4">
        <small>Proyecto de Desarrollo web y móvil</small>
      </footer>
    </>
  )
}

export default App