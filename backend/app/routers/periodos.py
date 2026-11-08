from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.seguridad import usuario_actual
from app.models import Periodo
from app.schemas import PeriodoIn, PeriodoOut
from app.services import historial
from app.services.reglas import obtener_o_404

router = APIRouter(prefix="/periodos", tags=["Períodos académicos"])


@router.get("", response_model=list[PeriodoOut])
def listar(db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    return db.query(Periodo).filter_by(usuario_id=usuario.id).order_by(Periodo.fecha_inicio.desc()).all()


@router.post("", response_model=PeriodoOut, status_code=201)
def crear(datos: PeriodoIn, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    periodo = Periodo(usuario_id=usuario.id, **datos.model_dump())
    db.add(periodo)
    db.commit()
    db.refresh(periodo)
    historial.registrar("actividad", usuario.id, "periodo", periodo.id, "creado", {"nombre": periodo.nombre})
    return periodo


@router.put("/{periodo_id}", response_model=PeriodoOut)
def actualizar(periodo_id: int, datos: PeriodoIn, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    periodo = obtener_o_404(db, Periodo, periodo_id, "Período")
    for campo, valor in datos.model_dump().items():
        setattr(periodo, campo, valor)
    db.commit()
    db.refresh(periodo)
    historial.registrar("actividad", usuario.id, "periodo", periodo.id, "editado", {"nombre": periodo.nombre})
    return periodo


@router.delete("/{periodo_id}", status_code=204)
def eliminar(periodo_id: int, db: Session = Depends(get_db), usuario=Depends(usuario_actual)):
    """Elimina el período y, en cascada, sus asignaturas, tareas y evaluaciones."""
    periodo = obtener_o_404(db, Periodo, periodo_id, "Período")
    nombre = periodo.nombre
    db.delete(periodo)
    db.commit()
    historial.registrar("actividad", usuario.id, "periodo", periodo_id, "eliminado", {"nombre": nombre})