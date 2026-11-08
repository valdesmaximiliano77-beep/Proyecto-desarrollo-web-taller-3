from datetime import date, datetime

from sqlalchemy import (Boolean, CheckConstraint, Date, DateTime, ForeignKey,
                        Numeric, String, Text, UniqueConstraint, func)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(150), unique=True)
    password_hash: Mapped[str] = mapped_column(String(100))
    periodos: Mapped[list["Periodo"]] = relationship(
        back_populates="usuario", cascade="all, delete-orphan")


class Periodo(Base):
    __tablename__ = "periodos"
    __table_args__ = (CheckConstraint("fecha_fin > fecha_inicio", name="ck_periodo_fechas"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"))
    nombre: Mapped[str] = mapped_column(String(50))
    fecha_inicio: Mapped[date] = mapped_column(Date)
    fecha_fin: Mapped[date] = mapped_column(Date)
    usuario: Mapped["Usuario"] = relationship(back_populates="periodos")
    asignaturas: Mapped[list["Asignatura"]] = relationship(
        back_populates="periodo", cascade="all, delete-orphan")


class Asignatura(Base):
    __tablename__ = "asignaturas"
    __table_args__ = (UniqueConstraint("periodo_id", "codigo", name="uq_asignatura_codigo"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    periodo_id: Mapped[int] = mapped_column(ForeignKey("periodos.id"))
    nombre: Mapped[str] = mapped_column(String(100))
    codigo: Mapped[str] = mapped_column(String(20))
    docente: Mapped[str | None] = mapped_column(String(100), nullable=True)
    periodo: Mapped["Periodo"] = relationship(back_populates="asignaturas")
    tareas: Mapped[list["Tarea"]] = relationship(
        back_populates="asignatura", cascade="all, delete-orphan")
    evaluaciones: Mapped[list["Evaluacion"]] = relationship(
        back_populates="asignatura", cascade="all, delete-orphan")


class Evaluacion(Base):
    __tablename__ = "evaluaciones"
    __table_args__ = (CheckConstraint("ponderacion > 0 AND ponderacion <= 100", name="ck_ponderacion"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    asignatura_id: Mapped[int] = mapped_column(ForeignKey("asignaturas.id"))
    titulo: Mapped[str] = mapped_column(String(120))
    fecha: Mapped[date] = mapped_column(Date)
    ponderacion: Mapped[float] = mapped_column(Numeric(5, 2))
    nota: Mapped[float | None] = mapped_column(Numeric(3, 1), nullable=True)
    asignatura: Mapped["Asignatura"] = relationship(back_populates="evaluaciones")


class Tarea(Base):
    __tablename__ = "tareas"
    __table_args__ = (
        CheckConstraint("estado IN ('pendiente', 'en progreso', 'completada')", name="ck_tarea_estado"),
        CheckConstraint("prioridad IN ('alta', 'media', 'baja')", name="ck_tarea_prioridad"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    asignatura_id: Mapped[int] = mapped_column(ForeignKey("asignaturas.id"))
    titulo: Mapped[str] = mapped_column(String(120))
    descripcion: Mapped[str] = mapped_column(Text, default="")
    fecha: Mapped[date] = mapped_column(Date)
    prioridad: Mapped[str] = mapped_column(String(10), default="media")
    estado: Mapped[str] = mapped_column(String(15), default="pendiente")
    creada: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    asignatura: Mapped["Asignatura"] = relationship(back_populates="tareas")
    subtareas: Mapped[list["Subtarea"]] = relationship(
        back_populates="tarea", cascade="all, delete-orphan", order_by="Subtarea.id")


class Subtarea(Base):
    __tablename__ = "subtareas"
    id: Mapped[int] = mapped_column(primary_key=True)
    tarea_id: Mapped[int] = mapped_column(ForeignKey("tareas.id"))
    titulo: Mapped[str] = mapped_column(String(120))
    fecha: Mapped[date] = mapped_column(Date)
    completada: Mapped[bool] = mapped_column(Boolean, default=False)
    tarea: Mapped["Tarea"] = relationship(back_populates="subtareas")