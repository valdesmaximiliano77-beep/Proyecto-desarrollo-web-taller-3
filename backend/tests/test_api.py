import os

os.environ.setdefault("DATABASE_URL", "sqlite://")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.services import historial


@pytest.fixture()
def client(monkeypatch):
    # Base SQLite en memoria y MongoDB simulado: las pruebas no necesitan Docker.
    motor = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(motor)
    Sesion = sessionmaker(bind=motor, autoflush=False)

    def get_db_pruebas():
        db = Sesion()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = get_db_pruebas
    eventos = []
    monkeypatch.setattr(historial, "registrar", lambda *args, **kw: eventos.append(args))

    c = TestClient(app)
    c.eventos = eventos
    yield c
    app.dependency_overrides.clear()


def preparar(c):
    p = c.post("/periodos", json={"nombre": "2026-2", "fecha_inicio": "2026-08-03",
                                  "fecha_fin": "2026-12-18"}).json()
    a = c.post("/asignaturas", json={"periodo_id": p["id"], "nombre": "Programación",
                                     "codigo": "PROG101"}).json()
    return a


def nueva_tarea(c, asignatura_id, **extra):
    datos = {"asignatura_id": asignatura_id, "titulo": "Taller 1", "fecha": "2026-11-10", **extra}
    return c.post("/tareas", json=datos)


def nueva_subtarea(c, tarea_id, fecha="2026-11-05"):
    return c.post(f"/tareas/{tarea_id}/subtareas", json={"titulo": "Parte 1", "fecha": fecha})


def test_crear_y_listar_tarea(client):
    a = preparar(client)
    r = nueva_tarea(client, a["id"])
    assert r.status_code == 201
    assert r.json()["estado"] == "pendiente"
    assert len(client.get("/tareas").json()) == 1
    assert any(e[0] == "actividad" and e[4] == "creada" for e in client.eventos)  # se registró historial


def test_tarea_fuera_del_periodo_es_rechazada(client):
    a = preparar(client)
    r = nueva_tarea(client, a["id"], fecha="2027-03-01")
    assert r.status_code == 400
    assert "período" in r.json()["detail"]


def test_no_se_completa_con_subtareas_pendientes(client):
    a = preparar(client)
    t = nueva_tarea(client, a["id"]).json()
    s = nueva_subtarea(client, t["id"]).json()
    assert client.patch(f"/tareas/{t['id']}", json={"estado": "completada"}).status_code == 409
    client.patch(f"/tareas/subtareas/{s['id']}", json={"completada": True})
    assert client.patch(f"/tareas/{t['id']}", json={"estado": "completada"}).status_code == 200


def test_subtarea_no_puede_vencer_despues_de_su_tarea(client):
    a = preparar(client)
    t = nueva_tarea(client, a["id"]).json()  # vence el 10-nov
    assert nueva_subtarea(client, t["id"], fecha="2026-11-20").status_code == 400
    assert nueva_subtarea(client, t["id"], fecha="2026-11-05").status_code == 201


def test_tarea_no_puede_vencer_antes_que_sus_subtareas(client):
    a = preparar(client)
    t = nueva_tarea(client, a["id"]).json()
    nueva_subtarea(client, t["id"], fecha="2026-11-08")
    r = client.patch(f"/tareas/{t['id']}", json={"fecha": "2026-11-06"})
    assert r.status_code == 409


def test_ponderaciones_no_superan_100(client):
    a = preparar(client)
    base = {"asignatura_id": a["id"], "fecha": "2026-11-20"}
    assert client.post("/evaluaciones", json={**base, "titulo": "Control 1", "ponderacion": 70}).status_code == 201
    r = client.post("/evaluaciones", json={**base, "titulo": "Control 2", "ponderacion": 40})
    assert r.status_code == 400


def test_codigo_de_asignatura_duplicado(client):
    a = preparar(client)
    r = client.post("/asignaturas", json={"periodo_id": a["periodo_id"], "nombre": "Otra", "codigo": "PROG101"})
    assert r.status_code == 409


def test_recurso_inexistente(client):
    assert client.get("/tareas").status_code == 200
    assert client.patch("/tareas/999", json={"estado": "completada"}).status_code == 404