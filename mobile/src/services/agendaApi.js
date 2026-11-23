import { peticion } from './api';

// Endpoints de la API del Hito 3 que usa la app móvil.
export const listarAsignaturas = () => peticion('/asignaturas');
export const avanceAsignatura = (id) => peticion(`/asignaturas/${id}/avance`);

export const listarTareas = (asignaturaId) =>
  peticion(asignaturaId ? `/tareas?asignatura_id=${asignaturaId}` : '/tareas');
export const actualizarTarea = (id, cambios) =>
  peticion(`/tareas/${id}`, { metodo: 'PATCH', cuerpo: cambios });
export const actualizarSubtarea = (id, cambios) =>
  peticion(`/tareas/subtareas/${id}`, { metodo: 'PATCH', cuerpo: cambios });

export const listarEvaluaciones = (asignaturaId) =>
  peticion(asignaturaId ? `/evaluaciones?asignatura_id=${asignaturaId}` : '/evaluaciones');
