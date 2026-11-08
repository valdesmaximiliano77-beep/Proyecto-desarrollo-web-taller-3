import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app import models  # noqa: F401  (registra las tablas)
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import (asignaturas, evaluaciones, historial, periodos,
                         tareas)
from app.services.reglas import ReglaNegocio

log = logging.getLogger("agenda")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)  # crea las tablas si no existen
    yield


app = FastAPI(
    title="API Agenda Académica",
    version="1.0.0",
    description="Backend del Hito 3: períodos, asignaturas, evaluaciones, tareas y subtareas "
                "(PostgreSQL) e historial de actividad (MongoDB).",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (periodos, asignaturas, evaluaciones, tareas, historial):
    app.include_router(r.router)


@app.get("/health", tags=["Sistema"])
def health():
    return {"estado": "ok"}


@app.exception_handler(ReglaNegocio)
async def regla_negocio(request: Request, exc: ReglaNegocio):
    return JSONResponse(status_code=exc.codigo, content={"detail": exc.mensaje})


@app.exception_handler(IntegrityError)
async def integridad(request: Request, exc: IntegrityError):
    return JSONResponse(status_code=409, content={
        "detail": "El registro ya existe o no cumple una restricción de la base de datos"})


@app.exception_handler(Exception)
async def inesperado(request: Request, exc: Exception):
    log.exception("Error no controlado")  # el detalle queda en el log, no en la respuesta
    return JSONResponse(status_code=500, content={"detail": "Error interno del servidor"})