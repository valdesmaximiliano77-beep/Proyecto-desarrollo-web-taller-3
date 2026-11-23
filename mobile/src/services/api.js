// Módulo único de comunicación HTTP con la API del Hito 3.
// La dirección base se configura en mobile/.env (EXPO_PUBLIC_API_URL).
export const URL_BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000').replace(/\/$/, '');

const TIEMPO_MAXIMO_MS = 10000;

// FastAPI devuelve los errores de validación (422) como lista y las reglas de
// negocio (400/409) como texto.
function mensajeDeError(detalle) {
  if (Array.isArray(detalle)) {
    return detalle
      .map((e) => {
        const campo = e.loc?.slice(1).join('.');
        return `${campo ? campo + ': ' : ''}${String(e.msg).replace('Value error, ', '')}`;
      })
      .join('. ');
  }
  return detalle || 'Ocurrió un error inesperado';
}

export async function peticion(ruta, { metodo = 'GET', cuerpo } = {}) {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), TIEMPO_MAXIMO_MS);
  let respuesta;
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      signal: control.signal,
    });
  } catch {
    throw new Error(`No se pudo conectar con el servidor (${URL_BASE}). Revisa que la API esté encendida y la dirección sea correcta.`);
  } finally {
    clearTimeout(reloj);
  }
  if (respuesta.status === 204) return null;
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(mensajeDeError(datos.detail));
  return datos;
}
