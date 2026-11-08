import { useState, useEffect } from 'react'
import {
  crearPeriodo, eliminarPeriodo, crearAsignatura, eliminarAsignatura,
} from '../services/agendaApi'

const PERIODO_VACIO = { nombre: '', fecha_inicio: '', fecha_fin: '' }
const ASIGNATURA_VACIA = { periodo_id: '', nombre: '', codigo: '', docente: '' }

function Asignaturas({ actividades, asignaturas, periodos, evaluaciones, onCambio }) {
  const [periodo, setPeriodo] = useState(PERIODO_VACIO)
  const [asignatura, setAsignatura] = useState(ASIGNATURA_VACIA)
  const [mensaje, setMensaje] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // El mensaje desaparece solo a los 4 segundos
  useEffect(() => {
    if (!mensaje) return
    const temporizador = setTimeout(() => setMensaje(null), 4000)
    return () => clearTimeout(temporizador)
  }, [mensaje])

  // Ejecuta una acción contra la API, recarga los datos y avisa el resultado. Devuelve true si salió bien.
  async function ejecutar(accion, textoExito) {
    setGuardando(true)
    try {
      await accion()
      await onCambio()
      setMensaje({ tipo: 'success', texto: textoExito })
      return true
    } catch (e) {
      setMensaje({ tipo: 'danger', texto: e.message })
      return false
    } finally {
      setGuardando(false)
    }
  }

  const cambiarPeriodo = (e) => setPeriodo({ ...periodo, [e.target.name]: e.target.value })
  const cambiarAsignatura = (e) => setAsignatura({ ...asignatura, [e.target.name]: e.target.value })

  const guardarPeriodo = async (e) => {
    e.preventDefault()
    const ok = await ejecutar(
      () => crearPeriodo({ ...periodo, nombre: periodo.nombre.trim() }),
      'Período creado.',
    )
    if (ok) setPeriodo(PERIODO_VACIO)
  }

  const guardarAsignatura = async (e) => {
    e.preventDefault()
    const ok = await ejecutar(
      () => crearAsignatura({
        periodo_id: Number(asignatura.periodo_id),
        nombre: asignatura.nombre.trim(),
        codigo: asignatura.codigo.trim(),
        docente: asignatura.docente.trim() || null,
      }),
      'Asignatura creada.',
    )
    if (ok) setAsignatura({ ...ASIGNATURA_VACIA, periodo_id: asignatura.periodo_id })
  }

  const quitarPeriodo = (p) => {
    if (!window.confirm(`¿Eliminar el período ${p.nombre}? Se borrarán también sus asignaturas, tareas y evaluaciones.`)) return
    ejecutar(() => eliminarPeriodo(p.id), 'Período eliminado.')
  }

  const quitarAsignatura = (a) => {
    if (!window.confirm(`¿Eliminar ${a.nombre}? Se borrarán también sus tareas y evaluaciones.`)) return
    ejecutar(() => eliminarAsignatura(a.id), 'Asignatura eliminada.')
  }

  const nombrePeriodo = (id) => periodos.find((p) => p.id === id)?.nombre

  return (
    <>
      {mensaje && <div className={`alert alert-${mensaje.tipo}`} role="status">{mensaje.texto}</div>}

      <section className="mb-4" aria-labelledby="titulo-periodos">
        <h2 id="titulo-periodos" className="h5 mb-3">Períodos académicos</h2>
        <form className="row g-2 mb-3" onSubmit={guardarPeriodo}>
          <div className="col-md-3">
            <input className="form-control" name="nombre" placeholder="Nombre (ej. 2027-1)"
              value={periodo.nombre} onChange={cambiarPeriodo} required minLength={2} maxLength={50}
              aria-label="Nombre del período" />
          </div>
          <div className="col-md-3">
            <input className="form-control" type="date" name="fecha_inicio" value={periodo.fecha_inicio}
              onChange={cambiarPeriodo} required aria-label="Fecha de inicio" />
          </div>
          <div className="col-md-3">
            <input className="form-control" type="date" name="fecha_fin" value={periodo.fecha_fin}
              onChange={cambiarPeriodo} required aria-label="Fecha de término" />
          </div>
          <div className="col-md-3">
            <button className="btn btn-guardar w-100" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Agregar período'}
            </button>
          </div>
        </form>

        {periodos.length === 0 ? (
          <p className="text-muted">Aún no tienes períodos. Crea uno para poder agregar asignaturas.</p>
        ) : (
          <ul className="list-group">
            {periodos.map((p) => (
              <li key={p.id} className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2">
                <span><strong>{p.nombre}</strong> · {p.fecha_inicio} a {p.fecha_fin}</span>
                <button className="btn btn-sm btn-outline-danger" onClick={() => quitarPeriodo(p)} disabled={guardando}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-asignaturas">
        <h2 id="titulo-asignaturas" className="h5 mb-3">Mis asignaturas</h2>
        <form className="row g-2 mb-3" onSubmit={guardarAsignatura}>
          <div className="col-md-3">
            <select className="form-select" name="periodo_id" value={asignatura.periodo_id}
              onChange={cambiarAsignatura} required aria-label="Período de la asignatura">
              <option value="">Período…</option>
              {periodos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <input className="form-control" name="nombre" placeholder="Nombre de la asignatura"
              value={asignatura.nombre} onChange={cambiarAsignatura} required minLength={2} maxLength={100}
              aria-label="Nombre de la asignatura" />
          </div>
          <div className="col-md-2">
            <input className="form-control" name="codigo" placeholder="Código"
              value={asignatura.codigo} onChange={cambiarAsignatura} required minLength={2} maxLength={20}
              aria-label="Código" />
          </div>
          <div className="col-md-2">
            <input className="form-control" name="docente" placeholder="Docente (opcional)"
              value={asignatura.docente} onChange={cambiarAsignatura} maxLength={100}
              aria-label="Docente" />
          </div>
          <div className="col-md-2">
            <button className="btn btn-guardar w-100" disabled={guardando || periodos.length === 0}>
              Agregar
            </button>
          </div>
        </form>

        {asignaturas.length === 0 ? (
          <p className="text-muted">Aún no tienes asignaturas.</p>
        ) : (
          <div className="row g-3">
            {asignaturas.map((asig) => {
              const propias = actividades.filter((a) => a.asignaturaId === asig.id)
              const listas = propias.filter((a) => a.estado === 'completada').length
              const porcentaje = propias.length === 0 ? 0 : Math.round((listas / propias.length) * 100)
              const susEvaluaciones = evaluaciones.filter((e) => e.asignatura_id === asig.id)
              const ponderacion = susEvaluaciones.reduce((suma, e) => suma + Number(e.ponderacion), 0)

              return (
                <div className="col-12 col-md-6 col-lg-4" key={asig.id}>
                  <article className="card actividad h-100">
                    <div className="card-body">
                      <h3 className="h6 mb-0">{asig.nombre}</h3>
                      <p className="small text-muted mb-2">
                        {asig.codigo} · {nombrePeriodo(asig.periodo_id)}{asig.docente ? ` · ${asig.docente}` : ''}
                      </p>
                      <p className="mb-1">{propias.length} actividad(es) · {listas} completada(s)</p>
                      <p className="mb-2 small">
                        {susEvaluaciones.length} evaluación(es) · {ponderacion}% de la nota asignado
                      </p>
                      <div className="progress mb-3" role="progressbar" aria-label={`Avance en ${asig.nombre}`}
                        aria-valuenow={porcentaje} aria-valuemin="0" aria-valuemax="100">
                        <div className="progress-bar" style={{ width: `${porcentaje}%` }}>{porcentaje}%</div>
                      </div>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => quitarAsignatura(asig)}
                        disabled={guardando}>
                        Eliminar
                      </button>
                    </div>
                  </article>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}

export default Asignaturas