import { peticion } from './api'

// El backend usa asignatura_id; tus componentes usan asignaturaId. Estos dos adaptadores traducen.
const aTarea = (t) => ({ ...t, asignaturaId: t.asignatura_id })
const deTarea = ({ asignaturaId, ...resto }) =>
  asignaturaId !== undefined ? { ...resto, asignatura_id: Number(asignaturaId) } : resto

const con = (metodo, cuerpo) => ({ metodo, cuerpo })

// Períodos
export const listarPeriodos = () => peticion('/periodos')
export const crearPeriodo = (datos) => peticion('/periodos', con('POST', datos))
export const eliminarPeriodo = (id) => peticion(`/periodos/${id}`, con('DELETE'))

// Asignaturas
export const listarAsignaturas = () => peticion('/asignaturas')
export const crearAsignatura = (datos) => peticion('/asignaturas', con('POST', datos))
export const eliminarAsignatura = (id) => peticion(`/asignaturas/${id}`, con('DELETE'))
export const avanceAsignatura = (id) => peticion(`/asignaturas/${id}/avance`)

// Tareas y subtareas
export const listarTareas = async () => (await peticion('/tareas')).map(aTarea)
export const crearTarea = async (datos) => aTarea(await peticion('/tareas', con('POST', deTarea(datos))))
export const actualizarTarea = async (id, cambios) =>
  aTarea(await peticion(`/tareas/${id}`, con('PATCH', deTarea(cambios))))
export const eliminarTarea = (id) => peticion(`/tareas/${id}`, con('DELETE'))
export const crearSubtarea = (tareaId, datos) =>
  peticion(`/tareas/${tareaId}/subtareas`, con('POST', datos))
export const actualizarSubtarea = (id, cambios) =>
  peticion(`/tareas/subtareas/${id}`, con('PATCH', cambios))
export const eliminarSubtarea = (id) => peticion(`/tareas/subtareas/${id}`, con('DELETE'))

// Evaluaciones
export const listarEvaluaciones = () => peticion('/evaluaciones')
export const crearEvaluacion = (datos) => peticion('/evaluaciones', con('POST', datos))
export const actualizarEvaluacion = (id, cambios) => peticion(`/evaluaciones/${id}`, con('PATCH', cambios))
export const eliminarEvaluacion = (id) => peticion(`/evaluaciones/${id}`, con('DELETE'))

// Historial (MongoDB)
export const obtenerHistorial = () => peticion('/historial')
export const obtenerEventos = () => peticion('/eventos-planificacion')