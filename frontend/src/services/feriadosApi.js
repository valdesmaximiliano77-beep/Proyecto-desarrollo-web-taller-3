const URL_BASE = 'https://date.nager.at/api/v3/PublicHolidays'

// Devuelve los feriados de Chile de un año, ya transformados al formato que usa la app.
export async function obtenerFeriados(anio) {
  const respuesta = await fetch(`${URL_BASE}/${anio}/CL`)
  if (!respuesta.ok) throw new Error('No se pudieron consultar los feriados')
  const datos = await respuesta.json()
  return datos.map((f) => ({ fecha: f.date, nombre: f.localName }))
}
