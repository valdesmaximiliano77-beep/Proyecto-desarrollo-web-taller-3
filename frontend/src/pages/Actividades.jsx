import { useState, useEffect } from 'react'
import FormularioActividad from '../components/FormularioActividad'
import BarraFiltros from '../components/BarraFiltros'
import TarjetaActividad from '../components/TarjetaActividad'

function Actividades({ actividades, asignaturas, onAgregar, onActualizar, onEliminar }) {
  const [filtroAsignatura, setFiltroAsignatura] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas')
  const [idEdicion, setIdEdicion] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  // El mensaje de confirmación desaparece solo a los 4 segundos
  useEffect(() => {
    if (!mensaje) return
    const temporizador = setTimeout(() => setMensaje(null), 4000)
    return () => clearTimeout(temporizador)
  }, [mensaje])

  // Se calcula a partir del id: si la actividad se elimina, deja de estar "en edición" sola
  const enEdicion = actividades.find((a) => a.id === idEdicion) || null

  const visibles = actividades.filter(
    (a) =>
      (filtroAsignatura === 'todas' || a.asignaturaId === Number(filtroAsignatura)) &&
      (filtroEstado === 'todos' || a.estado === filtroEstado) &&
      (filtroPrioridad === 'todas' || (a.prioridad || 'media') === filtroPrioridad)
  )

  const guardar = (datos) => {
    if (enEdicion) {
      onActualizar(enEdicion.id, datos)
      setIdEdicion(null)
      setMensaje({ tipo: 'success', texto: 'Cambios guardados.' })
    } else {
      onAgregar(datos)
      setMensaje({ tipo: 'success', texto: 'Actividad agregada.' })
    }
  }

  const eliminar = (id) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return
    onEliminar(id)
    setMensaje({ tipo: 'warning', texto: 'Actividad eliminada.' })
  }

  const editar = (id) => {
    setIdEdicion(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <section aria-labelledby="titulo-form">
        <h2 id="titulo-form" className="h5">{enEdicion ? 'Editar actividad' : 'Nueva actividad'}</h2>
        {mensaje && (
          <div className={`alert alert-${mensaje.tipo}`} role="status">{mensaje.texto}</div>
        )}
        <FormularioActividad
          asignaturas={asignaturas}
          actividadEnEdicion={enEdicion}
          onGuardar={guardar}
          onCancelar={() => setIdEdicion(null)}
        />
      </section>

      <section aria-labelledby="titulo-lista">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
          <h2 id="titulo-lista" className="h5 mb-0">Actividades</h2>
          <BarraFiltros
            asignaturas={asignaturas}
            filtroAsignatura={filtroAsignatura}
            filtroEstado={filtroEstado}
            onAsignatura={setFiltroAsignatura}
            onEstado={setFiltroEstado}
            filtroPrioridad={filtroPrioridad}
            onPrioridad={setFiltroPrioridad}
          />
        </div>

        {visibles.length === 0 && (
          <p className="text-muted">No hay actividades con estos filtros. Agrega una en el formulario.</p>
        )}
        <div className="row g-3">
          {visibles.map((a) => (
            <div className="col-12 col-md-6 col-lg-4" key={a.id}>
              <TarjetaActividad
                actividad={a}
                nombreAsignatura={asignaturas.find((s) => s.id === a.asignaturaId)?.nombre}
                onCambiarEstado={(id, estado) => onActualizar(id, { estado })}
                onEditar={editar}
                onEliminar={eliminar}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Actividades
