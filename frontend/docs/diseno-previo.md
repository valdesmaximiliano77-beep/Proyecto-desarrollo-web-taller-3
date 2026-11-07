# Diseño previo · Plazo

## Mapa de navegación
```
Panel (/) ── Actividades (/actividades) ── Calendario (/calendario) ── Asignaturas (/asignaturas)
```

## Wireframes

**Panel**
```
┌────────────────────────────────────────────────────┐
│ Plazo        Panel  Actividades  Calendario  Asig. │
├────────────────────────────────────────────────────┤
│ Mi avance                                          │
│ [Total][Pend.][En prog.][Completadas][Por vencer]  │
│ ████████░░░░░░ 50%                                 │
│ Próximas a vencer                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │ tarjeta  │ │ tarjeta  │ │ tarjeta  │             │
│ Feriados y entregas  (API pública)                 │
└────────────────────────────────────────────────────┘
```

**Actividades**
```
┌────────────────────────────────────────────────────┐
│ Nueva actividad                                    │
│ Nombre [_____] Fecha [____] Asignatura [▼]         │
│ Descripción [______] Estado [▼] Prioridad [▼]      │
│ [Agregar actividad]                                │
│ Actividades      [Asig ▼] [Estado ▼] [Prioridad ▼] │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │ tarjeta  │ │ tarjeta  │ │ tarjeta  │             │
└────────────────────────────────────────────────────┘
```

**Calendario**
```
┌────────────────────────────────────────────────────┐
│ octubre 2026                         [‹] [Hoy] [›] │
│ Lun Mar Mié Jue Vie Sáb Dom                        │
│  .   .   1   2   3   4   5     (puntos = entregas) │
│  ...                                                │
│ Leyenda: pendiente · vence pronto · completada     │
│ Entregas del día seleccionado: tarjetas            │
└────────────────────────────────────────────────────┘
```

**Asignaturas**: una tarjeta por asignatura con cantidad de actividades y barra de avance propia.

## Jerarquía visual
1. Encabezado oscuro con franja lima: ancla la página y la navegación.
2. Indicadores y barra de avance: lo primero que se lee en el Panel.
3. Tarjetas: el borde izquierdo codifica el estado (gris, verde azulado, rojo).
4. La prioridad se comunica por peso visual: alta (relleno oscuro), media (contorno), baja (tenue).

## Paleta (regla 60-30-10)
| Rol | Color | Uso |
|---|---|---|
| 60% superficie | `#f5f8ee` / `#ffffff` | Fondo de página, tarjetas, formularios |
| 30% tinta bosque | `#14231a` | Encabezado, texto, elementos fuertes |
| 10% lima | `#b4e61d` | Botón principal, pestaña activa, barra de avance |
| Semánticos | `#d62839` urgente · `#0f766e` listo | Solo significado, nunca decoración |

Tipografía: Georgia para títulos y cifras; tipografía del sistema para el cuerpo.

## Componentes repetibles
`Navbar`, `ResumenAvance`, `TarjetaActividad`, `FormularioActividad`, `BarraFiltros`, `AlertaFeriados`; hooks `useAlmacenamiento` y `useFeriados`.

## Flujos de usuario
- **Registrar:** Actividades → llenar formulario → validación → confirmación → se actualizan tarjetas, indicadores y calendario.
- **Planificar:** Calendario → elegir día → ver entregas y feriado → editar o cambiar estado en Actividades.
- **Priorizar:** Actividades → filtrar por prioridad alta → completar → el Panel baja las alertas.
