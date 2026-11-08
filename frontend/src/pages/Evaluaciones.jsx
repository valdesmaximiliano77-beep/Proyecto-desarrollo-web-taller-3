import { useState, useEffect } from 'react'
import { crearEvaluacion, actualizarEvaluacion, eliminarEvaluacion } from '../services/agendaApi'

const VACIO = { asignatura_id: '', titulo: '', fecha: '', ponderacion: '' }

function Evaluaciones({ evaluaciones, asignaturas, onCambio }) {
  const [form, setForm] = useState(VACIO)
  const [mensaje, setMensaje] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!mensaje) return
    const temporizador = setTimeout(() => setMensaje(null), 4000)
    return () => clearTimeout(temporizador)
  }, [mensaje])

  const nombreAsignatura = (id) => asignaturas.find((a) => a.id === id)?.nombre ?? '—'
  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

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

  const guardar = async (e) => {
    e.preventDefault()
    const ok = await ejecutar(
      () => crearEvaluacion({
        asignatura_id: Number(form.asignatura_id),
        titulo: form.titulo.trim(),
        fecha: form.fecha,
        ponderacion: Number(form.ponderacion),
      }),
      'Evaluación creada.',
    )
    if (ok) setForm(VACIO)
  }

  const ponerNota = (ev) => {
    const valor = window.prompt('Nota de 1,0 a 7,0:', ev.nota ?? '')
    if (valor === null || valor.trim() === '') return
    const nota = Number(valor.replace(',', '.'))
    if (Number.isNaN(nota)) {
      setMensaje({ tipo: 'danger', texto: 'La nota debe ser un número.' })
      return
    }
    ejecutar(() => actualizarEvaluacion(ev.id, { nota }), 'Nota guardada.')
  }

  const quitar = (ev) => {
    if (!window.confirm(`¿Eliminar "${ev.titulo}"?`)) return
    ejecutar(() => eliminarEvaluacion(ev.id), 'Evaluación eliminada.')
  }

  return (
    <>
      <h2 className="h5 mb-3">Evaluaciones</h2>
      {mensaje && <div className={`alert alert-${mensaje.tipo}`} role="status">{mensaje.texto}</div>}

      {asignaturas.length === 0 ? (
        <p className="text-muted">Primero crea una asignatura en la página Asignaturas.</p>
      ) : (
        <form className="row g-2 mb-4" onSubmit={guardar}>
          <div className="col-md-3">
            <select className="form-select" name="asignatura_id" value={form.asignatura_id}
              onChange={cambiar} required aria-label="Asignatura">
              <option value="">Asignatura…</option>
              {asignaturas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <input className="form-control" name="titulo" placeholder="Título (ej. Solemne 1)"
              value={form.titulo} onChange={cambiar} required minLength={3} maxLength={120}
              aria-label="Título" />
          </div>
          <div className="col-md-2">
            <input className="form-control" type="date" name="fecha" value={form.fecha}
              onChange={cambiar} required aria-label="Fecha" />
          </div>
          <div className="col-md-2">
            <input className="form-control" type="number" name="ponderacion" placeholder="Pond. %"
              min="1" max="100" step="0.5" value={form.ponderacion} onChange={cambiar} required
              aria-label="Ponderación en porcentaje" />
          </div>
          <div className="col-md-2">
            <button className="btn btn-guardar w-100" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Agregar'}
            </button>
          </div>
        </form>
      )}

      {evaluaciones.length === 0 ? (
        <p className="text-muted">Aún no tienes evaluaciones registradas.</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr><th>Fecha</th><th>Evaluación</th><th>Asignatura</th><th>Pond.</th><th>Nota</th><th /></tr>
            </thead>
            <tbody>
              {evaluaciones.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.fecha}</td>
                  <td>{ev.titulo}</td>
                  <td>{nombreAsignatura(ev.asignatura_id)}</td>
                  <td>{ev.ponderacion}%</td>
                  <td>{ev.nota ?? '—'}</td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => ponerNota(ev)}
                      disabled={guardando}>Nota</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => quitar(ev)}
                      disabled={guardando}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default Evaluaciones