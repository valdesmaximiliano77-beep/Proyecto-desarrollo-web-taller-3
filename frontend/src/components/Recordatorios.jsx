// Bloque del Panel, solo en la app Android. Recibe lo que entrega useRecordatorios.
function Recordatorios({ disponible, permiso, programados, error, activar }) {
  if (!disponible || !permiso) return null

  return (
    <section className="mb-4" aria-labelledby="titulo-recordatorios">
      <h2 id="titulo-recordatorios" className="h5">Recordatorios</h2>
      {permiso === 'granted' ? (
        <p className="mb-1">Activos: {programados ?? '…'} aviso(s) programado(s).</p>
      ) : permiso === 'denied' ? (
        <div className="alert alert-warning mb-1">
          Las notificaciones están bloqueadas. Actívalas en Ajustes › Aplicaciones › Entregas.
        </div>
      ) : (
        <button type="button" className="btn btn-guardar mb-1" onClick={activar}>Activar recordatorios</button>
      )}
      {error && <div className="alert alert-danger mb-1">{error}</div>}
      <p className="text-muted small mb-0">
        Te avisamos en la mañana, desde las 9:00, el día anterior y el mismo día. Si agregas algo que vence hoy o mañana, al instante.
      </p>
    </section>
  )
}

export default Recordatorios
