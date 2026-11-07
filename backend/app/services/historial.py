import logging
from datetime import datetime, timezone

from app.core.database import mongo_db

log = logging.getLogger(__name__)

# Colecciones MongoDB:
#   actividad: quién creó, editó o eliminó qué
#  eventos_planificacion:reprogramaciones, cambios de estado y subtareas completadas


def registrar(coleccion: str, usuario_id: int, entidad: str, entidad_id: int,
              accion: str, detalle: dict | None = None) -> None:
    documento = {
        "usuario_id": usuario_id,
        "entidad": entidad,
        "entidad_id": entidad_id,
        "accion": accion,
        "detalle": detalle or {},
        "fecha": datetime.now(timezone.utc),
    }
    try:
        mongo_db[coleccion].insert_one(documento)
    except Exception:
        log.exception("No se pudo escribir en MongoDB")


def listar(coleccion: str, usuario_id: int, entidad: str | None = None, limite: int = 50) -> list[dict]:
    filtro: dict = {"usuario_id": usuario_id}
    if entidad:
        filtro["entidad"] = entidad
    cursor = mongo_db[coleccion].find(filtro).sort("fecha", -1).limit(limite)
    return [{**{k: v for k, v in d.items() if k != "_id"}, "id": str(d["_id"])} for d in cursor]