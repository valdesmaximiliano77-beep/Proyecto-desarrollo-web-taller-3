# Entregas · Agenda académica (React)

**Integrantes:** Maximiliano Valdés

## Descripción de la problemática
Los estudiantes universitarios pierden el control de tareas, controles y proyectos de varias asignaturas. La aplicación permite registrarlos, filtrarlos, cambiar su estado, ver el avance y detectar entregas que caen en feriado.

## Usuarios objetivo
Estudiantes universitarios.

## Funcionalidades principales
- Panel con indicadores de avance y entregas por vencer.
- Crear, editar y eliminar actividades, con validación del formulario.
- Estados (pendiente, en progreso, completada) y prioridades (alta, media, baja).
- Filtros por asignatura, estado y prioridad.
- Calendario mensual con entregas y feriados.
- Avance por asignatura.
- Datos guardados en el navegador (localStorage).

## Tecnologías utilizadas
React 18, Vite, React Router, Bootstrap 5, CSS3, Fetch API, Git, GitHub y Git Flow.

## Cómo ejecutarlo
Requiere Node.js instalado.

```bash
npm install
npm run dev
```

## Estructura general
- `src/pages`: Panel, Actividades, Calendario, Asignaturas.
- `src/components`: Navbar, ResumenAvance, TarjetaActividad, FormularioActividad, BarraFiltros, AlertaFeriados.
- `src/data`: JSON con asignaturas y actividades iniciales.
- `src/services`: llamada a la API pública.
- `src/hooks`: `useAlmacenamiento` (estado + localStorage) y `useFeriados` (API con carga y error).
- `src/utils`: cálculo de fechas y plazos.
- `docs/diseno-previo.md`: mapa de navegación, wireframes, jerarquía visual, paleta y flujos.

## API pública: Nager.Date (feriados)
- **Documentación oficial:** https://nagerholidays.com/api
- **Endpoint:** `https://date.nager.at/api/v3/PublicHolidays/{año}/CL`
- **Método HTTP:** GET
- **Parámetros:** año (el actual y el siguiente) y código de país `CL`.
- **Datos usados:** `date` y `localName`, transformados a `{ fecha, nombre }` en `src/services/feriadosApi.js`.
- **Dónde se muestran:** `AlertaFeriados` en el Panel y marcas en el Calendario (hook `useFeriados`).
- **Si falla:** se muestra un aviso y el resto de la app sigue funcionando; mientras carga, un mensaje de espera.
- **Restricciones y autenticación:** no requiere clave; la documentación oficial no declara límite de solicitudes y el servicio no garantiza disponibilidad.
- **Licencia y condiciones de uso:** Nager.Date es de código abierto. Según sus [términos de servicio](https://nagerholidays.com/legal/termsofservice), es gratuita para proyectos privados o sin fines de lucro, como este, y no puede usarse para operar un portal propio de feriados. No exige atribución, pero se cita la fuente: Nager.Date.
- **Justificación funcional:** avisa cuando una entrega pendiente coincide con un feriado.

## Uso de Inteligencia Artificial
**Herramienta:** Claude (Anthropic).

**1. Elección de la API**
- **Propósito:** encontrar una API pública pertinente para una agenda académica.
- **Prompt (resumido):** "Necesito una API pública para una agenda académica hecha con React, que sea relevante para este caso."
- **Resultado:** propuso Nager.Date y su integración con `useEffect`.
- **Modificación humana:** adopté la API y probé en el navegador que funcionara.

**2. Migración a componentes JSX**
- **Propósito:** pasar elementos de mi proyecto inicial (formulario, tarjetas, filtros e indicadores) a componentes React.
- **Prompt (resumido):** "Ayúdame a pasar algunos elementos de mi proyecto inicial (HTML, CSS y JavaScript) a componentes React con JSX."
- **Resultado:** convirtió esos elementos en componentes JSX, que usé como ejemplo.
- **Modificación humana:** convertí por mi cuenta el resto de los componentes y probé la aplicación en el navegador, donde funcionó correctamente.

**3. Jerarquía visual y colores**
- **Propósito:** mejorar la jerarquía visual usando el verde lima como color base.
- **Prompt (resumido):** "Quiero mejorar la jerarquía visual de la web usando el verde lima como color base. ¿Qué cambios de color en el CSS y qué reubicación de elementos recomiendas?"
- **Resultado:** sugirió ajustes de color y cambios de ubicación de algunos bloques.
- **Modificación humana:** decidí el color base y pedí su opinión antes de aplicar los cambios.

**4. README y comandos de Git**
- **Propósito:** redactar el README y recordar los comandos de Git Flow.
- **Prompt (resumido):** "Con base en este proyecto, redacta un README que cumpla los siguientes requerimientos: [requisitos del enunciado]. Te entrego la información relevante del proyecto."
- **Resultado:** estructura del README y comandos de Git para ramas y Pull Requests.
- **Modificación humana:** completé yo la información de integrantes, API y este reporte.

**Aprendizaje:** aprendí a convertir elementos de mi proyecto inicial en componentes JSX y, a partir de ese ejemplo, hice por mi cuenta el resto. También aprendí a integrar una API con `fetch` y a conocerla de verdad (endpoint, parámetros, datos y condiciones de uso), ya que al comienzo solo me la mostró la IA. Además, comprendí mejor conceptos de jerarquía visual que no tenía del todo claros.

## Git Flow
Ramas `main` y `develop`; una rama `feature/` por funcionalidad, integrada con Pull Request.

## Limitaciones conocidas
- Los datos viven en el navegador (localStorage): no hay backend, cuentas ni sincronización entre dispositivos.
- La API de feriados depende de la conexión a internet y solo consulta los feriados de Chile.