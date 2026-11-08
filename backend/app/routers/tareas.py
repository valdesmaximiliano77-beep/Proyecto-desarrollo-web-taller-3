from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.seguridad import usuario_actual
from app.models import Asignatura, Periodo, Subtarea, Tarea
from app.schemas import (Estado, SubtareaIn, SubtareaOut, SubtareaUpdate,
                         TareaIn, TareaOut, TareaUpdate)
from app.services import historial
from app.services.reglas import (ReglaNegocio, obtener_o_404, validar_completar,
                                 validar_fecha_en_periodo, validar_fecha_subtarea,
                                 validar_fecha_tarea_con_subtareas, validar_no_pasada)  # NUEVO (a)

router = APIRouter(prefix="/tareas", tags=["Tareas y subtareas"])


@router.get("", response_model=list[TareaOut])
def listar(asignatura_id: int | None = None, estado: Estado | None = None,
           db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    consulta = (db.query(Tarea)
                .join(Asignatura, Tarea.asignatura_id == Asignatura.id)
                .join(Periodo, Asignatura.periodo_id == Periodo.id)
                .filter(Periodo.usuario_id == usuario.id))
    if asignatura_id is not None:
        consulta = consulta.filter(Tarea.asignatura_id == asignatura_id)
    if estado is not None:
        consulta = consulta.filter(Tarea.estado == estado)
    return consulta.order_by(Tarea.fecha).all()


@router.post("", response_model=TareaOut, status_code=201)
def crear(datos: TareaIn, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    """Reglas: la fecha debe estar dentro del período de su asignatura y no puede ser anterior a hoy."""
    asignatura = obtener_o_404(db, Asignatura, datos.asignatura_id, "Asignatura")
    validar_fecha_en_periodo(asignatura, datos.fecha, "la tarea")
    validar_no_pasada(datos.fecha, "la tarea")  # NUEVO (b)
    tarea = Tarea(**datos.model_dump())
    db.add(tarea)
    db.commit()
    db.refresh(tarea)
    historial.registrar("actividad", usuario.id, "tarea", tarea.id, "creada", {"titulo": tarea.titulo})
    return tarea


@router.patch("/{tarea_id}", response_model=TareaOut)
def actualizar(tarea_id: int, datos: TareaUpdate, db: Session = Depends(get_db),
               usuario=Depends(usuario_actual)):
    """Reglas: fecha dentro del período (y no pasada si se reprograma), no vencer antes que sus subtareas y no completar con subtareas pendientes."""
    tarea = obtener_o_404(db, Tarea, tarea_id, "Tarea")
    cambios = {k: v for k, v in datos.model_dump(exclude_unset=True).items() if v is not None}
    asignatura = (obtener_o_404(db, Asignatura, cambios["asignatura_id"], "Asignatura")
                  if "asignatura_id" in cambios else tarea.asignatura)
    nueva_fecha = cambios.get("fecha", tarea.fecha)
    validar_fecha_en_periodo(asignatura, nueva_fecha, "la tarea")
    validar_fecha_tarea_con_subtareas(tarea, nueva_fecha)
    if nueva_fecha != tarea.fecha:  # NUEVO (c): solo al reprogramar; una tarea vencida igual se puede completar
        validar_no_pasada(nueva_fecha, "la tarea")  # NUEVO (c)
    if cambios.get("estado") == "completada":
        validar_completar(tarea)

    fecha_antes, estado_antes = str(tarea.fecha), tarea.estado
    for campo, valor in cambios.items():
        setattr(tarea, campo, valor)
    db.commit()
    db.refresh(tarea)

    historial.registrar("actividad", usuario.id, "tarea", tarea.id, "editada", {"titulo": tarea.titulo})
    if str(tarea.fecha) != fecha_antes:
        historial.registrar("eventos_planificacion", usuario.id, "tarea", tarea.id, "reprogramada",
                            {"de": fecha_antes, "a": str(tarea.fecha)})
    if tarea.estado != estado_antes:
        historial.registrar("eventos_planificacion", usuario.id, "tarea", tarea.id, "estado_cambiado",
                            {"de": estado_antes, "a": tarea.estado})
    return tarea


@router.delete("/{tarea_id}", status_code=204)
def eliminar(tarea_id: int, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    tarea = obtener_o_404(db, Tarea, tarea_id, "Tarea")
    titulo = tarea.titulo
    db.delete(tarea)
    db.commit()
    historial.registrar("actividad", usuario.id, "tarea", tarea_id, "eliminada", {"titulo": titulo})


#Subtareas
@router.post("/{tarea_id}/subtareas", response_model=SubtareaOut, status_code=201)
def crear_subtarea(tarea_id: int, datos: SubtareaIn, db: Session = Depends(get_db),
                   usuario=Depends(usuario_actual)):
    """Reglas: la tarea no puede estar completada; la fecha debe caer en el período, no superar la de la tarea y no ser anterior a hoy."""
    tarea = obtener_o_404(db, Tarea, tarea_id, "Tarea")
    if tarea.estado == "completada":
        raise ReglaNegocio("No se pueden agregar subtareas a una tarea completada", 409)
    validar_fecha_subtarea(tarea, datos.fecha)
    validar_no_pasada(datos.fecha, "la subtarea")  # NUEVO (d)
    subtarea = Subtarea(tarea_id=tarea.id, titulo=datos.titulo, fecha=datos.fecha)
    db.add(subtarea)
    db.commit()
    db.refresh(subtarea)
    historial.registrar("actividad", usuario.id, "subtarea", subtarea.id, "creada",
                        {"titulo": subtarea.titulo, "tarea_id": tarea.id})
    return subtarea


@router.patch("/subtareas/{subtarea_id}", response_model=SubtareaOut)
def actualizar_subtarea(subtarea_id: int, datos: SubtareaUpdate, db: Session = Depends(get_db),
                        usuario=Depends(usuario_actual)):
    subtarea = obtener_o_404(db, Subtarea, subtarea_id, "Subtarea")
    cambios = {k: v for k, v in datos.model_dump(exclude_unset=True).items() if v is not None}
    if cambios.get("completada") is False and subtarea.tarea.estado == "completada":
        raise ReglaNegocio("Reabre la tarea antes de marcar una subtarea como pendiente", 409)
    if "fecha" in cambios and cambios["fecha"] != subtarea.fecha:  # NUEVO (e): solo si la fecha cambió
        validar_fecha_subtarea(subtarea.tarea, cambios["fecha"])
        validar_no_pasada(cambios["fecha"], "la subtarea")  # NUEVO (e)
    completada_antes = subtarea.completada
    for campo, valor in cambios.items():
        setattr(subtarea, campo, valor)
    db.commit()
    db.refresh(subtarea)
    if subtarea.completada != completada_antes:
        accion = "subtarea_completada" if subtarea.completada else "subtarea_reabierta"
        historial.registrar("eventos_planificacion", usuario.id, "subtarea", subtarea.id, accion,
                            {"tarea_id": subtarea.tarea_id})
    return subtarea