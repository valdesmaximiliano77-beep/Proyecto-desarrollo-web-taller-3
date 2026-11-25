import { diasRestantes } from './fechas.js'

// Decide qué recordatorios corresponden. No usa nada de Android, así que se puede probar por separado.
const HORA_AVISO = 'T09:00:00'

const entregas = (n) => `${n} ${n === 1 ? 'entrega' : 'entregas'}`

export function describir(item, nombreAsignatura) {
  return [item.titulo, nombreAsignatura, item.ponderacion && `${Number(item.ponderacion)}%`].filter(Boolean).join(' · ')
}

// Junta por fecha las actividades no completadas y las evaluaciones, y arma dos avisos a las 9:00:
// el día anterior y el mismo día. Descarta los que ya pasaron.
export function calcularAvisos(tareas, evaluaciones, asignaturas, ahora = new Date()) {
  const nombre = (id) => asignaturas.find((a) => a.id === id)?.nombre
  const porFecha = {}
  const agregar = (item, asignaturaId) => {
    porFecha[item.fecha] ??= []
    porFecha[item.fecha].push({ titulo: item.titulo, texto: describir(item, nombre(asignaturaId)) })
  }
  tareas.filter((t) => t.estado !== 'completada').forEach((t) => agregar(t, t.asignaturaId))
  evaluaciones.forEach((e) => agregar(e, e.asignatura_id))

  const avisos = []
  for (const [fecha, lista] of Object.entries(porFecha)) {
    const n = lista.length
    const texto = n === 1 ? lista[0].texto : lista.map((x) => x.titulo).join(', ')
    const mismoDia = new Date(fecha + HORA_AVISO)
    const diaAntes = new Date(fecha + HORA_AVISO)
    diaAntes.setDate(diaAntes.getDate() - 1)

    // El id sale de la fecha (2026-12-10 → 202612100 y 202612101): es único y siempre el mismo
    const base = Number(fecha.replaceAll('-', '')) * 10
    avisos.push({ id: base, cuando: diaAntes, titulo: `Mañana tienes ${entregas(n)}`, texto })
    avisos.push({ id: base + 1, cuando: mismoDia, titulo: `Hoy ${n === 1 ? 'vence' : 'vencen'} ${entregas(n)}`, texto })
  }
  return avisos.filter((a) => a.cuando > ahora).sort((a, b) => a.cuando - b.cuando)
}

// Título del aviso inmediato al crear algo que vence hoy o mañana; null si no corresponde avisar
export function tituloInmediato(item) {
  if (item.estado === 'completada') return null
  const dias = diasRestantes(item.fecha)
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  return null
}
