from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.seguridad import usuario_actual
from app.models import Asignatura, Evaluacion, Periodo
from app.schemas import EvaluacionIn, EvaluacionOut, EvaluacionUpdate
from app.services import historial
from app.services.reglas import (obtener_o_404, validar_fecha_en_periodo,
                                 validar_ponderacion)

router = APIRouter(prefix="/evaluaciones", tags=["Evaluaciones"])


@router.get("", response_model=list[EvaluacionOut])
def listar(asignatura_id: int | None = None, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    consulta = (db.query(Evaluacion)
                .join(Asignatura, Evaluacion.asignatura_id == Asignatura.id)
                .join(Periodo, Asignatura.periodo_id == Periodo.id)
                .filter(Periodo.usuario_id == usuario.id))
    if asignatura_id is not None:
        consulta = consulta.filter(Evaluacion.asignatura_id == asignatura_id)
    return consulta.order_by(Evaluacion.fecha).all()


@router.post("", response_model=EvaluacionOut, status_code=201)
def crear(datos: EvaluacionIn, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    """Reglas: fecha dentro del período y ponderaciones de la asignatura que no superen 100%."""
    asignatura = obtener_o_404(db, Asignatura, datos.asignatura_id, "Asignatura")
    validar_fecha_en_periodo(asignatura, datos.fecha, "la evaluación")
    validar_ponderacion(db, asignatura.id, datos.ponderacion)
    evaluacion = Evaluacion(**datos.model_dump())
    db.add(evaluacion)
    db.commit()
    db.refresh(evaluacion)
    historial.registrar("actividad", usuario.id, "evaluacion", evaluacion.id, "creada",
                        {"titulo": evaluacion.titulo})
    return evaluacion


@router.patch("/{evaluacion_id}", response_model=EvaluacionOut)
def actualizar(evaluacion_id: int, datos: EvaluacionUpdate, db: Session = Depends(get_db),
               usuario=Depends(usuario_actual)):
    ev = obtener_o_404(db, Evaluacion, evaluacion_id, "Evaluación")
    cambios = datos.model_dump(exclude_unset=True)
    validar_fecha_en_periodo(ev.asignatura, cambios.get("fecha", ev.fecha), "la evaluación")
    validar_ponderacion(db, ev.asignatura_id, cambios.get("ponderacion", float(ev.ponderacion)),
                        excluir_id=ev.id)
    antes_fecha = str(ev.fecha)
    for campo, valor in cambios.items():
        setattr(ev, campo, valor)
    db.commit()
    db.refresh(ev)
    historial.registrar("actividad", usuario.id, "evaluacion", ev.id, "editada", {"titulo": ev.titulo})
    if "fecha" in cambios and str(ev.fecha) != antes_fecha:
        historial.registrar("eventos_planificacion", usuario.id, "evaluacion", ev.id, "reprogramada",
                            {"de": antes_fecha, "a": str(ev.fecha)})
    return ev


@router.delete("/{evaluacion_id}", status_code=204)
def eliminar(evaluacion_id: int, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    ev = obtener_o_404(db, Evaluacion, evaluacion_id, "Evaluación")
    titulo = ev.titulo
    db.delete(ev)
    db.commit()
    historial.registrar("actividad", usuario.id, "evaluacion", evaluacion_id, "eliminada", {"titulo": titulo})