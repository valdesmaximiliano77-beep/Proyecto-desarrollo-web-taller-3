import useFeriados from '../hooks/useFeriados'

// Avisa si alguna entrega pendiente cae en feriado.
function AlertaFeriados({ actividades }) {
  const { feriados, cargando, error } = useFeriados()

  if (cargando) return <p className="text-muted">Consultando feriados…</p>
  if (error) {
    return <div className="alert alert-warning">{error}. El resto de la agenda sigue funcionando.</div>
  }

  const coincidencias = actividades
    .filter((a) => a.estado !== 'completada')
    .map((a) => ({ actividad: a, feriado: feriados.find((f) => f.fecha === a.fecha) }))
    .filter((c) => c.feriado)

  if (coincidencias.length === 0) {
    return <div className="alert alert-success">Ninguna entrega pendiente cae en feriado.</div>
  }

  return (
    <div className="alert alert-info">
      <strong>Ojo con los feriados:</strong>
      <ul className="mb-0">
        {coincidencias.map(({ actividad, feriado }) => (
          <li key={actividad.id}>
            «{actividad.titulo}» se entrega el {actividad.fecha}, feriado por {feriado.nombre}.
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AlertaFeriados
