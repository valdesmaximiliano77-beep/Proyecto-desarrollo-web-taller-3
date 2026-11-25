import { Capacitor } from '@capacitor/core'

// El mismo código corre en el navegador y dentro de la app Android, pero "localhost" no es el mismo
// equipo en ambos: en el emulador, 10.0.2.2 apunta al computador. En un teléfono se usa la IP del PC.
const esAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
const URL_BASE = esAndroid
  ? import.meta.env.VITE_API_ANDROID || 'http://10.0.2.2:8000'
  : import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Sin este límite, una IP equivocada o una red caída dejaría la pantalla cargando sin avisar.
const ESPERA_MAXIMA_MS = 10000

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
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), ESPERA_MAXIMA_MS)
  let respuesta
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      signal: control.signal,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que la API esté encendida.')
  } finally {
    clearTimeout(temporizador)
  }
  if (respuesta.status === 204) return null
  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) throw new Error(mensajeDeError(datos.detail))
  return datos
}