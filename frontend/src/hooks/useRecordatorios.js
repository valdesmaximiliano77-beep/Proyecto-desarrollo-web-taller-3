import { useState, useEffect } from 'react'
import { hayRecordatorios, estadoPermiso, pedirPermiso, programarRecordatorios } from '../services/recordatorios'

// Mantiene los recordatorios al día: se reprograman cada vez que cambian los datos.
function useRecordatorios(tareas, evaluaciones, asignaturas) {
  const [permiso, setPermiso] = useState('')
  const [programados, setProgramados] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hayRecordatorios) return
    const revisar = () => estadoPermiso().then(setPermiso).catch(() => {})
    revisar()
    // Al volver desde los Ajustes de Android, el permiso puede haber cambiado
    document.addEventListener('visibilitychange', revisar)
    return () => document.removeEventListener('visibilitychange', revisar)
  }, [])

  useEffect(() => {
    if (permiso !== 'granted' || !tareas || !evaluaciones || !asignaturas) return
    programarRecordatorios(tareas, evaluaciones, asignaturas)
      .then((n) => { setProgramados(n); setError('') })
      .catch(() => setError('No se pudieron programar los recordatorios.'))
  }, [permiso, tareas, evaluaciones, asignaturas])

  const activar = async () => {
    try {
      setPermiso(await pedirPermiso())
    } catch {
      setError('No se pudo pedir el permiso de notificaciones.')
    }
  }

  return { disponible: hayRecordatorios, permiso, programados, error, activar }
}

export default useRecordatorios
