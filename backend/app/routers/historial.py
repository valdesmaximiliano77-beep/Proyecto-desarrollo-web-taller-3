from fastapi import APIRouter, Depends, Query
from pymongo.errors import PyMongoError

from app.core.seguridad import usuario_actual
from app.services import historial
from app.services.reglas import ReglaNegocio

router = APIRouter(tags=["Historial (MongoDB)"])


def _consultar(coleccion, usuario, entidad, limite):
    try:
        return historial.listar(coleccion, usuario.id, entidad, limite)
    except PyMongoError:
        raise ReglaNegocio("El historial no está disponible por ahora", 503)


@router.get("/historial")
def ver_historial(entidad: str | None = None, limite: int = Query(50, ge=1, le=200),
                  usuario=Depends(usuario_actual)):
    """Historial de actividad: creaciones, ediciones y eliminaciones (colección `actividad`)."""
    return _consultar("actividad", usuario, entidad, limite)


@router.get("/eventos-planificacion")
def ver_eventos(entidad: str | None = None, limite: int = Query(50, ge=1, le=200),
                usuario=Depends(usuario_actual)):
    """Eventos de planificación: reprogramaciones y cambios de estado (colección `eventos_planificacion`)."""
    return _consultar("eventos_planificacion", usuario, entidad, limite)