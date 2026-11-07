import { useState } from 'react'
import useFeriados from '../hooks/useFeriados'
import TarjetaActividad from '../components/TarjetaActividad'
import { esUrgente } from '../utils/fechas'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const dos = (n) => String(n).padStart(2, '0')
const aISO = (anio, mes, dia) => `${anio}-${dos(mes + 1)}-${dos(dia)}`   // mes: 0 a 11

// Color del punto según la situación de la actividad
const claseDePunto = (a) => (a.estado === 'completada' ? 'listo' : esUrgente(a) ? 'urgente' : 'normal')

function Calendario({ actividades, asignaturas }) {
  const hoy = new Date()
  const hoyISO = aISO(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

  const [mostrado, setMostrado] = useState({ anio: hoy.getFullYear(), mes: hoy.getMonth() })
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoyISO)
  const { feriados, cargando, error } = useFeriados()

  const { anio, mes } = mostrado
  const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7   // la semana parte en lunes (0)
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()        // día 0 del mes siguiente = último de este
  const celdas = [...Array(primerDia).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)]

  const cambiarMes = (delta) => {
    const nuevo = new Date(anio, mes + delta, 1)
    setMostrado({ anio: nuevo.getFullYear(), mes: nuevo.getMonth() })
  }
  const irAHoy = () => {
    setMostrado({ anio: hoy.getFullYear(), mes: hoy.getMonth() })
    setDiaSeleccionado(hoyISO)
  }

  const delDia = (iso) => actividades.filter((a) => a.fecha === iso)
  const feriadoDe = (iso) => feriados.find((f) => f.fecha === iso)

  const tituloMes = new Date(anio, mes, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
  const tituloDia = new Date(diaSeleccionado + 'T00:00:00').toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const delDiaSeleccionado = delDia(diaSeleccionado)
  const feriadoSeleccionado = feriadoDe(diaSeleccionado)

  return (
    <>
      <section aria-labelledby="titulo-calendario">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 id="titulo-calendario" className="h5 mb-0 text-capitalize">{tituloMes}</h2>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-primary" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">‹</button>
            <button className="btn btn-sm btn-outline-primary" onClick={irAHoy}>Hoy</button>
            <button className="btn btn-sm btn-outline-primary" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">›</button>
          </div>
        </div>

        {cargando && <p className="text-muted small">Consultando feriados…</p>}
        {error && (
          <div className="alert alert-warning py-2">{error}. El calendario sigue mostrando tus actividades.</div>
        )}

        <div className="calendario">
          {DIAS_SEMANA.map((d) => <div className="cab" key={d}>{d}</div>)}
          {celdas.map((dia, i) => {
            if (dia === null) return <div key={`vacio-${i}`} />
            const iso = aISO(anio, mes, dia)
            const lista = delDia(iso)
            const feriado = feriadoDe(iso)
            return (
              <button
                type="button"
                key={iso}
                className={`dia ${iso === hoyISO ? 'hoy' : ''} ${iso === diaSeleccionado ? 'seleccionado' : ''} ${feriado ? 'feriado' : ''}`}
                onClick={() => setDiaSeleccionado(iso)}
                aria-pressed={iso === diaSeleccionado}
                aria-label={`${dia}: ${lista.length} entrega(s)${feriado ? `, feriado ${feriado.nombre}` : ''}`}
              >
                <span className="numero">{dia}</span>
                <span className="puntos">
                  {lista.slice(0, 4).map((a) => <span key={a.id} className={`punto ${claseDePunto(a)}`} />)}
                </span>
              </button>
            )
          })}
        </div>

        <p className="leyenda mt-2 mb-0">
          <span className="punto normal" /> pendiente
          <span className="punto urgente" /> vence pronto
          <span className="punto listo" /> completada
          <span className="muestra-feriado" /> feriado
        </p>
      </section>

      <section className="mt-4" aria-labelledby="titulo-dia">
        <h3 id="titulo-dia" className="h6 text-capitalize">{tituloDia}</h3>
        {feriadoSeleccionado && (
          <div className="alert alert-info py-2">Feriado: {feriadoSeleccionado.nombre}</div>
        )}
        {delDiaSeleccionado.length === 0 ? (
          <p className="text-muted">No hay entregas este día.</p>
        ) : (
          <div className="row g-3">
            {delDiaSeleccionado.map((a) => (
              <div className="col-12 col-md-6 col-lg-4" key={a.id}>
                <TarjetaActividad
                  actividad={a}
                  nombreAsignatura={asignaturas.find((s) => s.id === a.asignaturaId)?.nombre}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default Calendario
