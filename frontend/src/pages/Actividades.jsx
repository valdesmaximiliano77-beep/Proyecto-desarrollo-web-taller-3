import { useState, useEffect } from 'react'
import FormularioActividad from '../components/FormularioActividad'
import BarraFiltros from '../components/BarraFiltros'
import TarjetaActividad from '../components/TarjetaActividad'

function Actividades({ actividades, asignaturas, onAgregar, onActualizar, onEliminar, onCambio }) {
  const [filtroAsignatura, setFiltroAsignatura] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas')
  const [idEdicion, setIdEdicion] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [guardando, setGuardando] = useState(false)

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

  const mostrarError = (e) => setMensaje({ tipo: 'danger', texto: e.message })

  // Devuelve true si se guardó, para que el formulario sepa si debe limpiarse
  const guardar = async (datos) => {
    setGuardando(true)
    try {
      if (enEdicion) {
        await onActualizar(enEdicion.id, datos)
        setIdEdicion(null)
        setMensaje({ tipo: 'success', texto: 'Cambios guardados.' })
      } else {
        await onAgregar(datos)
        setMensaje({ tipo: 'success', texto: 'Actividad agregada.' })
      }
      return true
    } catch (e) {
      mostrarError(e)
      return false
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return
    try {
      await onEliminar(id)
      setMensaje({ tipo: 'warning', texto: 'Actividad eliminada.' })
    } catch (e) {
      mostrarError(e)
    }
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await onActualizar(id, { estado })
    } catch (e) {
      mostrarError(e)
    }
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
          guardando={guardando}
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
                onCambiarEstado={cambiarEstado}
                onEditar={editar}
                onEliminar={eliminar}
                onCambio={onCambio}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Actividades