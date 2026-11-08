from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.seguridad import usuario_actual
from app.models import Asignatura, Periodo
from app.schemas import AsignaturaIn, AsignaturaOut, AsignaturaUpdate
from app.services import historial
from app.services.reglas import obtener_o_404

router = APIRouter(prefix="/asignaturas", tags=["Asignaturas"])


@router.get("", response_model=list[AsignaturaOut])
def listar(periodo_id: int | None = None, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    consulta = (db.query(Asignatura)
                .join(Periodo, Asignatura.periodo_id == Periodo.id)
                .filter(Periodo.usuario_id == usuario.id))
    if periodo_id is not None:
        consulta = consulta.filter(Asignatura.periodo_id == periodo_id)
    return consulta.order_by(Asignatura.nombre).all()


@router.post("", response_model=AsignaturaOut, status_code=201)
def crear(datos: AsignaturaIn, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    obtener_o_404(db, Periodo, datos.periodo_id, "Período")
    asignatura = Asignatura(**datos.model_dump())
    db.add(asignatura)
    db.commit()  # si el código se repite en el período, la restricción UNIQUE responde 409
    db.refresh(asignatura)
    historial.registrar("actividad", usuario.id, "asignatura", asignatura.id, "creada",
                        {"nombre": asignatura.nombre})
    return asignatura


@router.patch("/{asignatura_id}", response_model=AsignaturaOut)
def actualizar(asignatura_id: int, datos: AsignaturaUpdate, db: Session = Depends(get_db),
               usuario=Depends(usuario_actual)):
    asignatura = obtener_o_404(db, Asignatura, asignatura_id, "Asignatura")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(asignatura, campo, valor)
    db.commit()
    db.refresh(asignatura)
    historial.registrar("actividad", usuario.id, "asignatura", asignatura.id, "editada",
                        {"nombre": asignatura.nombre})
    return asignatura


@router.delete("/{asignatura_id}", status_code=204)
def eliminar(asignatura_id: int, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    asignatura = obtener_o_404(db, Asignatura, asignatura_id, "Asignatura")
    nombre = asignatura.nombre
    db.delete(asignatura)
    db.commit()
    historial.registrar("actividad", usuario.id, "asignatura", asignatura_id, "eliminada", {"nombre": nombre})


@router.get("/{asignatura_id}/avance")
def avance(asignatura_id: int, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    """Seguimiento de avance: tareas completadas y ponderación evaluada."""
    a = obtener_o_404(db, Asignatura, asignatura_id, "Asignatura")
    total = len(a.tareas)
    hechas = sum(1 for t in a.tareas if t.estado == "completada")
    return {
        "asignatura_id": a.id,
        "tareas_total": total,
        "tareas_completadas": hechas,
        "porcentaje_cumplimiento": round(100 * hechas / total) if total else 0,
        "evaluaciones_total": len(a.evaluaciones),
        "evaluaciones_con_nota": sum(1 for e in a.evaluaciones if e.nota is not None),
        "ponderacion_asignada": float(sum(e.ponderacion for e in a.evaluaciones)),
    }