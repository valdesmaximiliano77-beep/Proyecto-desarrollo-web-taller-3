import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { calcularAvisos, describir, tituloInmediato } from '../utils/avisos'

// Notificaciones locales: las programa el propio teléfono, sin servidor. En el navegador no se usan.
export const hayRecordatorios = Capacitor.isNativePlatform()

const CANAL = 'entregas'
const crearCanal = () => LocalNotifications.createChannel({
  id: CANAL, name: 'Recordatorios de entregas', importance: 4,   // 4: el aviso aparece sobre la pantalla
})

const aNotificacion = ({ id, titulo, texto, cuando }) => ({
  id,
  title: titulo,
  body: texto,
  largeBody: texto,
  channelId: CANAL,
  isExactNotification: false,   // no necesita el minuto exacto: evita pedir el permiso de alarmas exactas
  ...(cuando && { schedule: { at: cuando, allowWhileIdle: true } }),
})

export const estadoPermiso = async () => (await LocalNotifications.checkPermissions()).display
export const pedirPermiso = async () => (await LocalNotifications.requestPermissions()).display

// Borra lo programado y lo vuelve a armar con los datos actuales. Devuelve cuántos avisos quedaron.
async function reprogramar(tareas, evaluaciones, asignaturas) {
  await crearCanal()
  const { notifications: pendientes } = await LocalNotifications.getPending()
  if (pendientes.length > 0) {
    await LocalNotifications.cancel({ notifications: pendientes.map(({ id }) => ({ id })) })
  }
  const avisos = calcularAvisos(tareas, evaluaciones, asignaturas)
  if (avisos.length > 0) await LocalNotifications.schedule({ notifications: avisos.map(aNotificacion) })
  return avisos.length
}

// Los datos pueden cambiar varias veces seguidas; la cola evita que dos reprogramaciones se crucen.
let cola = Promise.resolve()
export function programarRecordatorios(...datos) {
  cola = cola.catch(() => {}).then(() => reprogramar(...datos))
  return cola
}

// Al crear algo que vence hoy o mañana se avisa en el momento. Si falla, no debe impedir guardar.
export async function avisarSiEsProxima(item, nombreAsignatura) {
  const titulo = tituloInmediato(item)
  if (!hayRecordatorios || !titulo) return
  try {
    if (await estadoPermiso() !== 'granted') return
    await crearCanal()
    const id = Date.now() % 100000000   // menor que los ids por fecha: no se pisan
    await LocalNotifications.schedule({
      notifications: [aNotificacion({ id, titulo, texto: describir(item, nombreAsignatura) })],
    })
  } catch (e) {
    console.warn('No se pudo mostrar el recordatorio', e)
  }
}

// Tocar una notificación abre el Calendario
export function abrirCalendarioAlTocar() {
  if (!hayRecordatorios) return
  LocalNotifications.addListener('localNotificationActionPerformed', () => {
    window.location.hash = '#/calendario'
  })
}
