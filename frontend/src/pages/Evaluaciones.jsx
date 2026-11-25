import { useState, useEffect } from 'react'
import { crearEvaluacion, actualizarEvaluacion, eliminarEvaluacion } from '../services/agendaApi'
import { avisarSiEsProxima } from '../services/recordatorios'

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
      async () => {
        const nueva = await crearEvaluacion({
          asignatura_id: Number(form.asignatura_id),
          titulo: form.titulo.trim(),
          fecha: form.fecha,
          ponderacion: Number(form.ponderacion),
        })
        avisarSiEsProxima(nueva, nombreAsignatura(nueva.asignatura_id))
      },
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
      {mensaje && <div className={`alert alert-${mensaje.tipo} aviso`} role="status">{mensaje.texto}</div>}

      {asignaturas.length === 0 ? (
        <p className="text-muted">Primero crea una asignatura en la página Asignaturas.</p>
      ) : (
        <form className="row g-2 mb-4 align-items-end" onSubmit={guardar}>
          <div className="col-md-3">
            <label className="form-label" htmlFor="eval-asignatura">Asignatura</label>
            <select id="eval-asignatura" className="form-select" name="asignatura_id" value={form.asignatura_id}
              onChange={cambiar} required>
              <option value="">Elige…</option>
              {asignaturas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="eval-titulo">Título</label>
            <input id="eval-titulo" className="form-control" name="titulo" placeholder="Ej. Solemne 1"
              value={form.titulo} onChange={cambiar} required minLength={3} maxLength={120} />
          </div>
          <div className="col-md-2">
            <label className="form-label" htmlFor="eval-fecha">Fecha</label>
            <input id="eval-fecha" className="form-control" type="date" name="fecha" value={form.fecha}
              onChange={cambiar} required />
          </div>
          <div className="col-md-2">
            <label className="form-label" htmlFor="eval-ponderacion">Ponderación (%)</label>
            <input id="eval-ponderacion" className="form-control" type="number" inputMode="decimal" name="ponderacion"
              min="1" max="100" step="0.5" value={form.ponderacion} onChange={cambiar} required />
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
          <table className="table align-middle tabla-tarjetas">
            <thead>
              <tr><th>Fecha</th><th>Evaluación</th><th>Asignatura</th><th>Pond.</th><th>Nota</th><th /></tr>
            </thead>
            <tbody>
              {evaluaciones.map((ev) => (
                <tr key={ev.id}>
                  <td data-label="Fecha">{ev.fecha}</td>
                  <td data-label="Evaluación">{ev.titulo}</td>
                  <td data-label="Asignatura">{nombreAsignatura(ev.asignatura_id)}</td>
                  <td data-label="Ponderación">{ev.ponderacion}%</td>
                  <td data-label="Nota">{ev.nota ?? '—'}</td>
                  <td className="text-end text-nowrap acciones">
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