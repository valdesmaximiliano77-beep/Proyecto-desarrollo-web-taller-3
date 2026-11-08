from fastapi import Depends
from sqlalchemy.orm import Session

from app import models
from app.core.database import get_db

EMAIL_DEMO = "demo@agenda.cl"


def usuario_actual(db: Session = Depends(get_db)) -> models.Usuario:
    usuario = db.query(models.Usuario).filter_by(email=EMAIL_DEMO).first()
    if usuario is None:
        usuario = models.Usuario(nombre="Usuario Demo", email=EMAIL_DEMO, password_hash="sin-login")
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
    return usuario