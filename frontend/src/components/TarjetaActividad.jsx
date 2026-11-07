import { diasRestantes, textoPlazo, esUrgente } from '../utils/fechas'

const COLOR_ESTADO = {
  'pendiente': 'e-pendiente',
  'en progreso': 'e-progreso',
  'completada': 'e-completada',
}

// Si no se pasan las funciones (onCambiarEstado, onEditar, onEliminar), la tarjeta es de solo lectura.
function TarjetaActividad({ actividad, nombreAsignatura, onCambiarEstado, onEditar, onEliminar }) {
  const completada = actividad.estado === 'completada'
  const urgente = esUrgente(actividad)
  const prioridad = actividad.prioridad || 'media'   // datos antiguos pueden no traerla

  return (
    <article className={`card actividad h-100 ${urgente ? 'urgente' : ''} ${completada ? 'completada' : ''}`}>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between mb-2">
          <div className="d-flex flex-wrap gap-1">
            <span className="badge etiqueta">{nombreAsignatura}</span>
            <span className={`badge prio prio-${prioridad}`}>prioridad {prioridad}</span>
          </div>
          <span className={`badge ${COLOR_ESTADO[actividad.estado]}`}>{actividad.estado}</span>
        </div>
        <h3 className="h6">{actividad.titulo}</h3>
        {actividad.descripcion && <p className="mb-2">{actividad.descripcion}</p>}
        <p className="plazo mb-3">
          Entrega: {actividad.fecha} · {completada ? 'Lista' : textoPlazo(diasRestantes(actividad.fecha))}
        </p>

        {onCambiarEstado && (
          <select
            className="form-select form-select-sm mb-2"
            value={actividad.estado}
            onChange={(e) => onCambiarEstado(actividad.id, e.target.value)}
            aria-label="Cambiar estado"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
        )}

        {(onEditar || onEliminar) && (
          <div className="d-flex gap-2 mt-auto">
            {onEditar && (
              <button className="btn btn-sm btn-outline-primary" onClick={() => onEditar(actividad.id)}>
                Editar
              </button>
            )}
            {onEliminar && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(actividad.id)}>
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default TarjetaActividad
