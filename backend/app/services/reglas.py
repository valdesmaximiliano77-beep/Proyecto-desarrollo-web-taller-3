from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Asignatura, Evaluacion, Tarea


class ReglaNegocio(Exception):
    """Error esperado del dominio. main.py lo convierte en una respuesta HTTP."""

    def __init__(self, mensaje: str, codigo: int = 400):
        self.mensaje = mensaje
        self.codigo = codigo


def obtener_o_404(db: Session, modelo, id_: int, nombre: str):
    objeto = db.get(modelo, id_)
    if objeto is None:
        raise ReglaNegocio(f"{nombre} no encontrado", 404)
    return objeto


def validar_fecha_en_periodo(asignatura: Asignatura, fecha: date, que: str) -> None:
    p = asignatura.periodo
    if not (p.fecha_inicio <= fecha <= p.fecha_fin):
        raise ReglaNegocio(
            f"La fecha de {que} debe estar dentro del período {p.nombre} "
            f"({p.fecha_inicio} a {p.fecha_fin})")


def validar_ponderacion(db: Session, asignatura_id: int, nueva: float, excluir_id: int | None = None) -> None:
    consulta = db.query(func.coalesce(func.sum(Evaluacion.ponderacion), 0)).filter(
        Evaluacion.asignatura_id == asignatura_id)
    if excluir_id is not None:
        consulta = consulta.filter(Evaluacion.id != excluir_id)
    actual = float(consulta.scalar())
    if actual + nueva > 100:
        raise ReglaNegocio(
            f"Las ponderaciones de la asignatura superarían el 100% (ya hay {actual:g}% asignado)")


def validar_completar(tarea: Tarea) -> None:
    pendientes = [s for s in tarea.subtareas if not s.completada]
    if pendientes:
        raise ReglaNegocio(
            f"No se puede completar la tarea: tiene {len(pendientes)} subtarea(s) pendiente(s)", 409)


def validar_fecha_subtarea(tarea: Tarea, fecha: date) -> None:
    validar_fecha_en_periodo(tarea.asignatura, fecha, "la subtarea")
    if fecha > tarea.fecha:
        raise ReglaNegocio(f"La subtarea no puede vencer después de su tarea ({tarea.fecha})")


def validar_fecha_tarea_con_subtareas(tarea: Tarea, nueva_fecha: date) -> None:
    if any(s.fecha > nueva_fecha for s in tarea.subtareas):
        raise ReglaNegocio(
            "La tarea no puede vencer antes que sus subtareas; ajusta primero las fechas de las subtareas", 409)