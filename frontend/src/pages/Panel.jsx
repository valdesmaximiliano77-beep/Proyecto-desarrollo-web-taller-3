import ResumenAvance from '../components/ResumenAvance'
import AlertaFeriados from '../components/AlertaFeriados'
import TarjetaActividad from '../components/TarjetaActividad'
import { esUrgente, diasRestantes, textoPlazo, hoyISO } from '../utils/fechas'

function Panel({ actividades, asignaturas, evaluaciones = [] }) {
  const nombreAsignatura = (id) => asignaturas.find((s) => s.id === id)?.nombre

  const proximas = actividades
    .filter(esUrgente)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const hoy = hoyISO()
  const proximasEvaluaciones = evaluaciones
    .filter((e) => e.fecha >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 5)

  return (
    <>
      <ResumenAvance actividades={actividades} />

      <section className="mb-4" aria-labelledby="titulo-proximas">
        <h2 id="titulo-proximas" className="h5">Próximas a vencer</h2>
        {proximas.length === 0 ? (
          <p className="text-muted">No tienes entregas urgentes. Buen trabajo.</p>
        ) : (
          <div className="row g-3">
            {proximas.map((a) => (
              <div className="col-12 col-md-6 col-lg-4" key={a.id}>
                <TarjetaActividad actividad={a} nombreAsignatura={nombreAsignatura(a.asignaturaId)} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-4" aria-labelledby="titulo-evaluaciones">
        <h2 id="titulo-evaluaciones" className="h5">Próximas evaluaciones</h2>
        {proximasEvaluaciones.length === 0 ? (
          <p className="text-muted">No tienes evaluaciones próximas registradas.</p>
        ) : (
          <ul className="list-group">
            {proximasEvaluaciones.map((e) => (
              <li key={e.id} className="list-group-item d-flex flex-wrap justify-content-between gap-2">
                <span>
                  <strong>{e.titulo}</strong> · {nombreAsignatura(e.asignatura_id)} · {e.ponderacion}%
                </span>
                <span className="text-muted">{e.fecha} — {textoPlazo(diasRestantes(e.fecha))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-feriados">
        <h2 id="titulo-feriados" className="h5">Feriados y entregas</h2>
        <AlertaFeriados actividades={actividades} />
      </section>
    </>
  )
}

export default Panel