import { useState } from 'react'
import { crearSubtarea, actualizarSubtarea, eliminarSubtarea } from '../services/agendaApi'
import { hoyISO } from '../utils/fechas'

// Lista desplegable de subtareas de una tarea. Cada subtarea tiene su propia fecha límite.
function Subtareas({ tarea, onCambio }) {
  const [abierto, setAbierto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [error, setError] = useState('')

  const hechas = tarea.subtareas.filter((s) => s.completada).length

  async function ejecutar(accion) {
    setError('')
    try {
      await accion()
      await onCambio()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="mb-2">
      <button type="button" className="btn btn-sm btn-link p-0" onClick={() => setAbierto(!abierto)}>
        Subtareas ({hechas}/{tarea.subtareas.length}) {abierto ? '▲' : '▼'}
      </button>

      {abierto && (
        <div className="mt-2">
          {error && <div className="alert alert-danger py-1 small">{error}</div>}
          {tarea.subtareas.length === 0 && <p className="text-muted small mb-2">Sin subtareas todavía.</p>}
          <ul className="list-unstyled mb-2">
            {tarea.subtareas.map((s) => (
              <li key={s.id} className="d-flex align-items-center gap-2 small">
                <label className="subtarea">
                  <input
                    type="checkbox"
                    checked={s.completada}
                    onChange={() => ejecutar(() => actualizarSubtarea(s.id, { completada: !s.completada }))}
                    aria-label={`Marcar ${s.titulo}`}
                  />
                  <span className={s.completada ? 'text-decoration-line-through text-muted' : ''}>
                    {s.titulo} · {s.fecha}
                  </span>
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-danger ms-auto p-0"
                  onClick={() => ejecutar(() => eliminarSubtarea(s.id))}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <div className="d-flex flex-wrap align-items-end gap-1">
            <input className="form-control form-control-sm" style={{ flex: '1 1 8rem' }}
              placeholder="Nueva subtarea" aria-label="Nueva subtarea" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <label className="small text-muted" style={{ flex: '0 1 9rem' }}>
              Fecha límite
              <input className="form-control form-control-sm"
                type="date" min={hoyISO()} max={tarea.fecha} value={fecha} onChange={(e) => setFecha(e.target.value)}
                aria-label="Fecha límite de la subtarea" />
            </label>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              disabled={titulo.trim().length < 2 || !fecha}
              onClick={() => ejecutar(async () => {
                await crearSubtarea(tarea.id, { titulo: titulo.trim(), fecha })
                setTitulo('')
                setFecha('')
              })}
            >
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Subtareas