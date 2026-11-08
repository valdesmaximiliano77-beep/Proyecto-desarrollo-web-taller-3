"""Datos de prueba. Es idempotente: si ya existen, no hace nada.  Uso: python -m app.seed"""
from datetime import date

from app import models
from app.core.database import Base, SessionLocal, engine
from app.core.seguridad import EMAIL_DEMO


def ejecutar() -> None:
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        if db.query(models.Periodo).first():
            print("Seed ya aplicado")
            return
        usuario = (db.query(models.Usuario).filter_by(email=EMAIL_DEMO).first()
                   or models.Usuario(nombre="Usuario Demo", email=EMAIL_DEMO, password_hash="sin-login"))
        periodo = models.Periodo(usuario=usuario, nombre="2026-2",
                                 fecha_inicio=date(2026, 8, 3), fecha_fin=date(2026, 12, 18))
        prog = models.Asignatura(periodo=periodo, nombre="Programación", codigo="PROG101", docente="Docente A")
        bd = models.Asignatura(periodo=periodo, nombre="Bases de datos", codigo="BD201", docente="Docente B")
        mat = models.Asignatura(periodo=periodo, nombre="Matemáticas", codigo="MAT101", docente="Docente C")
        taller = models.Tarea(asignatura=prog, titulo="Taller de listas", descripcion="Ejercicios 1 al 5",
                              fecha=date(2026, 11, 2), prioridad="alta", estado="pendiente")
        taller.subtareas = [
            models.Subtarea(titulo="Ejercicios 1 y 2", fecha=date(2026, 10, 30), completada=True),
            models.Subtarea(titulo="Ejercicios 3 al 5", fecha=date(2026, 11, 1)),
        ]
        db.add_all([
            usuario, periodo, prog, bd, mat, taller,
            models.Tarea(asignatura=bd, titulo="Informe ER", descripcion="Modelo entidad-relación",
                         fecha=date(2026, 11, 5), prioridad="media", estado="completada"),
            models.Tarea(asignatura=prog, titulo="Presentación de proyecto", descripcion="Defensa de 10 minutos",
                         fecha=date(2026, 11, 12), prioridad="media"),
            models.Tarea(asignatura=mat, titulo="Guía de ecuaciones", fecha=date(2026, 11, 16),
                         prioridad="baja", estado="en progreso"),
            models.Evaluacion(asignatura=mat, titulo="Control 2", fecha=date(2026, 11, 10), ponderacion=30),
            models.Evaluacion(asignatura=bd, titulo="Solemne 2", fecha=date(2026, 11, 24), ponderacion=40),
            models.Evaluacion(asignatura=prog, titulo="Examen final", fecha=date(2026, 12, 10), ponderacion=35),
        ])
        db.commit()
        print("Seed aplicado")
    finally:
        db.close()


if __name__ == "__main__":
    ejecutar()