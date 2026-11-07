import { useState, useEffect } from 'react'
import { rangoFechas } from '../utils/fechas'

const VACIO = { titulo: '', descripcion: '', fecha: '', asignaturaId: '', estado: 'pendiente', prioridad: 'media' }

// Sirve para crear y para editar: si llega actividadEnEdicion, carga sus datos.
function FormularioActividad({ asignaturas, actividadEnEdicion, onGuardar, onCancelar }) {
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const { min, max } = rangoFechas()

  // Cuando cambia la actividad en edición, el formulario se rellena (o se vacía)
  useEffect(() => {
    setForm({ ...VACIO, ...actividadEnEdicion })
    setErrores({})
  }, [actividadEnEdicion])

  const manejarCambio = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validar = () => {
    const nuevos = {}
    if (form.titulo.trim().length < 3) nuevos.titulo = 'Escribe un nombre de al menos 3 caracteres.'
    if (!form.fecha) nuevos.fecha = 'Elige una fecha de entrega.'
    else if (form.fecha < min || form.fecha > max) nuevos.fecha = `Elige una fecha entre ${min} y ${max}.`
    if (!form.asignaturaId) nuevos.asignaturaId = 'Elige una asignatura.'
    return nuevos
  }

  const manejarEnvio = (e) => {
    e.preventDefault()
    const nuevos = validar()
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    onGuardar({
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      fecha: form.fecha,
      asignaturaId: Number(form.asignaturaId),
      estado: form.estado,
      prioridad: form.prioridad,
    })
    if (!actividadEnEdicion) setForm(VACIO)
  }

  const clase = (campo) => `form-control ${errores[campo] ? 'is-invalid' : ''}`

  return (
    <form className="row g-3 mb-4" onSubmit={manejarEnvio} noValidate>
      <div className="col-md-6">
        <label htmlFor="titulo" className="form-label">Nombre</label>
        <input id="titulo" name="titulo" type="text" maxLength={60} className={clase('titulo')}
          value={form.titulo} onChange={manejarCambio} />
        <div className="invalid-feedback">{errores.titulo}</div>
      </div>
      <div className="col-md-3">
        <label htmlFor="fecha" className="form-label">Fecha de entrega</label>
        <input id="fecha" name="fecha" type="date" min={min} max={max} className={clase('fecha')}
          value={form.fecha} onChange={manejarCambio} />
        <div className="invalid-feedback">{errores.fecha}</div>
      </div>
      <div className="col-md-3">
        <label htmlFor="asignaturaId" className="form-label">Asignatura</label>
        <select id="asignaturaId" name="asignaturaId"
          className={`form-select ${errores.asignaturaId ? 'is-invalid' : ''}`}
          value={form.asignaturaId} onChange={manejarCambio}>
          <option value="">Elige…</option>
          {asignaturas.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
        <div className="invalid-feedback">{errores.asignaturaId}</div>
      </div>
      <div className="col-md-6">
        <label htmlFor="descripcion" className="form-label">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows={2} maxLength={200} className="form-control"
          value={form.descripcion} onChange={manejarCambio} />
      </div>
      <div className="col-md-3">
        <label htmlFor="estado" className="form-label">Estado</label>
        <select id="estado" name="estado" className="form-select" value={form.estado} onChange={manejarCambio}>
          <option value="pendiente">Pendiente</option>
          <option value="en progreso">En progreso</option>
          <option value="completada">Completada</option>
        </select>
      </div>
      <div className="col-md-3">
        <label htmlFor="prioridad" className="form-label">Prioridad</label>
        <select id="prioridad" name="prioridad" className="form-select" value={form.prioridad} onChange={manejarCambio}>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>
      <div className="col-12 d-flex gap-2">
        <button type="submit" className="btn btn-guardar">
          {actividadEnEdicion ? 'Guardar cambios' : 'Agregar actividad'}
        </button>
        {actividadEnEdicion && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  )
}

export default FormularioActividad
