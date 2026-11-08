export const DIAS_ALERTA = 3

// Días entre hoy y la fecha de entrega (negativo = ya venció)
export function diasRestantes(fechaISO) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const entrega = new Date(fechaISO + 'T00:00:00')
  return Math.round((entrega - hoy) / 86400000)
}

export function textoPlazo(dias) {
  if (dias < 0) return `Venció hace ${Math.abs(dias)} día(s)`
  if (dias === 0) return 'Vence hoy'
  return `Faltan ${dias} día(s)`
}

// Una actividad es urgente si no está completada y vence en DIAS_ALERTA días o menos
export function esUrgente(actividad) {
  return actividad.estado !== 'completada' && diasRestantes(actividad.fecha) <= DIAS_ALERTA
}

// Rango de fechas permitido para el formulario
export function rangoFechas() {
  const anio = new Date().getFullYear()
  return { min: `${anio - 1}-01-01`, max: `${anio + 2}-12-31` }
}

// Fecha de hoy (AAAA-MM-DD) según el reloj del navegador. No usa toISOString porque esa devuelve la fecha en UTC.
export function hoyISO() {
  const d = new Date()
  const dos = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}