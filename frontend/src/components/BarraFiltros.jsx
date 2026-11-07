function BarraFiltros({
  asignaturas, filtroAsignatura, filtroEstado, filtroPrioridad,
  onAsignatura, onEstado, onPrioridad,
}) {
  return (
    <div className="filtros">
      <select className="form-select" value={filtroAsignatura} onChange={(e) => onAsignatura(e.target.value)}
        aria-label="Filtrar por asignatura">
        <option value="todas">Todas las asignaturas</option>
        {asignaturas.map((a) => (
          <option key={a.id} value={a.id}>{a.nombre}</option>
        ))}
      </select>
      <select className="form-select" value={filtroEstado} onChange={(e) => onEstado(e.target.value)}
        aria-label="Filtrar por estado">
        <option value="todos">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="en progreso">En progreso</option>
        <option value="completada">Completada</option>
      </select>
      <select className="form-select" value={filtroPrioridad} onChange={(e) => onPrioridad(e.target.value)}
        aria-label="Filtrar por prioridad">
        <option value="todas">Todas las prioridades</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>
    </div>
  )
}

export default BarraFiltros
