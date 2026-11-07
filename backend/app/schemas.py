from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator
Prioridad = Literal["alta", "media", "baja"]
Estado = Literal["pendiente", "en progreso", "completada"]


class Salida(BaseModel):
    model_config = ConfigDict(from_attributes=True)



#Períodos
class PeriodoIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=50)
    fecha_inicio: date
    fecha_fin: date

    @model_validator(mode="after")
    def fechas_validas(self):
        if self.fecha_fin <= self.fecha_inicio:
            raise ValueError("La fecha de fin debe ser posterior a la de inicio")
        return self


class PeriodoOut(Salida):
    id: int
    nombre: str
    fecha_inicio: date
    fecha_fin: date


#Asignaturas
class AsignaturaIn(BaseModel):
    periodo_id: int
    nombre: str = Field(min_length=2, max_length=100)
    codigo: str = Field(min_length=2, max_length=20)
    docente: str | None = Field(None, max_length=100)


class AsignaturaUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=2, max_length=100)
    codigo: str | None = Field(None, min_length=2, max_length=20)
    docente: str | None = Field(None, max_length=100)


class AsignaturaOut(Salida):
    id: int
    periodo_id: int
    nombre: str
    codigo: str
    docente: str | None


#Evaluaciones
class EvaluacionIn(BaseModel):
    asignatura_id: int
    titulo: str = Field(min_length=3, max_length=120)
    fecha: date
    ponderacion: float = Field(gt=0, le=100)
    nota: float | None = Field(None, ge=1, le=7)


class EvaluacionUpdate(BaseModel):
    titulo: str | None = Field(None, min_length=3, max_length=120)
    fecha: date | None = None
    ponderacion: float | None = Field(None, gt=0, le=100)
    nota: float | None = Field(None, ge=1, le=7)


class EvaluacionOut(Salida):
    id: int
    asignatura_id: int
    titulo: str
    fecha: date
    ponderacion: float
    nota: float | None


#Subtareas y tareas
class SubtareaIn(BaseModel):
    titulo: str = Field(min_length=2, max_length=120)
    fecha: date


class SubtareaUpdate(BaseModel):
    titulo: str | None = Field(None, min_length=2, max_length=120)
    fecha: date | None = None
    completada: bool | None = None


class SubtareaOut(Salida):
    id: int
    tarea_id: int
    titulo: str
    fecha: date
    completada: bool


class TareaIn(BaseModel):
    asignatura_id: int
    titulo: str = Field(min_length=3, max_length=120)
    descripcion: str = Field("", max_length=500)
    fecha: date
    prioridad: Prioridad = "media"
    estado: Estado = "pendiente"


class TareaUpdate(BaseModel):
    asignatura_id: int | None = None
    titulo: str | None = Field(None, min_length=3, max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    fecha: date | None = None
    prioridad: Prioridad | None = None
    estado: Estado | None = None


class TareaOut(Salida):
    id: int
    asignatura_id: int
    titulo: str
    descripcion: str
    fecha: date
    prioridad: Prioridad
    estado: Estado
    subtareas: list[SubtareaOut]