import { esUrgente } from '../utils/fechas'

function ResumenAvance({ actividades }) {
  const total = actividades.length
  const contar = (estado) => actividades.filter((a) => a.estado === estado).length
  const completadas = contar('completada')
  const porVencer = actividades.filter(esUrgente).length
  const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100)

  const indicadores = [
    ['Total', total, false],
    ['Pendientes', contar('pendiente'), false],
    ['En progreso', contar('en progreso'), false],
    ['Completadas', completadas, false],
    ['Por vencer', porVencer, porVencer > 0],
  ]

  return (
    <section className="mb-4" aria-labelledby="titulo-avance">
      <h2 id="titulo-avance" className="h5">Mi avance</h2>
      <div className="row g-3">
        {indicadores.map(([nombre, valor, alerta]) => (
          <div className="col-6 col-md" key={nombre}>
            <div className={`indicador ${alerta ? 'alerta' : ''}`}>
              <strong>{valor}</strong>
              {nombre}
            </div>
          </div>
        ))}
      </div>
      <div
        className="progress mt-3"
        role="progressbar"
        aria-label="Porcentaje de actividades completadas"
        aria-valuenow={porcentaje}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div className="progress-bar" style={{ width: `${porcentaje}%` }}>{porcentaje}%</div>
      </div>
    </section>
  )
}

export default ResumenAvance
