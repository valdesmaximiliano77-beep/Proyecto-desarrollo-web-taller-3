function Asignaturas({ actividades, asignaturas }) {
  return (
    <section aria-labelledby="titulo-asignaturas">
      <h2 id="titulo-asignaturas" className="h5 mb-3">Mis asignaturas</h2>
      <div className="row g-3">
        {asignaturas.map((asig) => {
          const propias = actividades.filter((a) => a.asignaturaId === asig.id)
          const listas = propias.filter((a) => a.estado === 'completada').length
          const porcentaje = propias.length === 0 ? 0 : Math.round((listas / propias.length) * 100)

          return (
            <div className="col-12 col-md-6 col-lg-4" key={asig.id}>
              <article className="card actividad h-100">
                <div className="card-body">
                  <h3 className="h6">{asig.nombre}</h3>
                  <p className="mb-2">{propias.length} actividad(es) · {listas} completada(s)</p>
                  <div className="progress" role="progressbar" aria-label={`Avance en ${asig.nombre}`}
                    aria-valuenow={porcentaje} aria-valuemin="0" aria-valuemax="100">
                    <div className="progress-bar" style={{ width: `${porcentaje}%` }}>{porcentaje}%</div>
                  </div>
                </div>
              </article>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Asignaturas
