const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// FastAPI devuelve los errores de validación como lista; las reglas de negocio, como texto.
function mensajeDeError(detalle) {
  if (Array.isArray(detalle)) {
    return detalle
      .map((e) => {
        const campo = e.loc?.slice(1).join('.')
        return `${campo ? campo + ': ' : ''}${e.msg.replace('Value error, ', '')}`
      })
      .join('. ')
  }
  return detalle || 'Ocurrió un error inesperado'
}

export async function peticion(ruta, { metodo = 'GET', cuerpo } = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que la API esté encendida.')
  }
  if (respuesta.status === 204) return null
  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) throw new Error(mensajeDeError(datos.detail))
  return datos
}