import ResumenAvance from '../components/ResumenAvance'
import AlertaFeriados from '../components/AlertaFeriados'
import TarjetaActividad from '../components/TarjetaActividad'
import asignaturas from '../data/asignaturas.json'
import { esUrgente } from '../utils/fechas'

function Panel({ actividades }) {
  const proximas = actividades
    .filter(esUrgente)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

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
                <TarjetaActividad
                  actividad={a}
                  nombreAsignatura={asignaturas.find((s) => s.id === a.asignaturaId)?.nombre}
                />
              </div>
            ))}
          </div>
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
