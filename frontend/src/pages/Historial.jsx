import { useCallback, useState } from 'react'
import useCarga from '../hooks/useCarga'
import { obtenerHistorial, obtenerEventos } from '../services/agendaApi'

const VISTAS = { actividad: obtenerHistorial, eventos: obtenerEventos }

// MongoDB entrega la fecha en UTC sin la "Z"; se agrega para que el navegador la muestre en hora local
const aFecha = (iso) => new Date(iso.endsWith('Z') ? iso : `${iso}Z`)

function resumen(detalle = {}) {
  if (detalle.de !== undefined && detalle.a !== undefined) return `${detalle.de} → ${detalle.a}`
  if (detalle.tarea_id) return `de la tarea #${detalle.tarea_id}`
  return detalle.titulo || detalle.nombre || ''
}

function Historial() {
  const [vista, setVista] = useState('actividad')
  const cargar = useCallback(() => VISTAS[vista](), [vista])
  const { datos, cargando, error, recargar } = useCarga(cargar)

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h5 mb-0">Historial</h2>
        <div className="d-flex gap-2">
          <div className="btn-group" role="group" aria-label="Tipo de historial">
            <button className={`btn btn-sm btn-${vista === 'actividad' ? 'primary' : 'outline-primary'}`}
              onClick={() => setVista('actividad')}>Actividad</button>
            <button className={`btn btn-sm btn-${vista === 'eventos' ? 'primary' : 'outline-primary'}`}
              onClick={() => setVista('eventos')}>Planificación</button>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={recargar}>Actualizar</button>
        </div>
      </div>

      <p className="text-muted small">
        {vista === 'actividad'
          ? 'Altas, ediciones y eliminaciones registradas en MongoDB.'
          : 'Reprogramaciones de fechas, cambios de estado y subtareas completadas, registrados en MongoDB.'}
      </p>

      {cargando && (
        <div className="text-center my-4"><div className="spinner-border" role="status" /></div>
      )}
      {error && (
        <div className="alert alert-danger">
          {error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={recargar}>Reintentar</button>
        </div>
      )}
      {!cargando && !error && datos?.length === 0 && (
        <p className="text-muted">Todavía no hay movimientos registrados.</p>
      )}
      {!cargando && !error && datos?.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead><tr><th>Fecha</th><th>Elemento</th><th>Acción</th><th>Detalle</th></tr></thead>
            <tbody>
              {datos.map((d) => (
                <tr key={d.id}>
                  <td className="text-nowrap">{aFecha(d.fecha).toLocaleString('es-CL')}</td>
                  <td>{d.entidad} #{d.entidad_id}</td>
                  <td>{d.accion.replaceAll('_', ' ')}</td>
                  <td className="small text-muted">{resumen(d.detalle)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default Historial