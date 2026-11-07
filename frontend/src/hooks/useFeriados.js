import { useState, useEffect } from 'react'
import { obtenerFeriados } from '../services/feriadosApi'

// Carga los feriados del año actual y del siguiente, con estados de carga y error.
// Lo usan el Panel (alerta) y el Calendario (marcas en los días).
function useFeriados() {
  const [feriados, setFeriados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let activo = true   // evita actualizar el estado si el componente ya se desmontó
    const anio = new Date().getFullYear()

    Promise.all([obtenerFeriados(anio), obtenerFeriados(anio + 1)])
      .then(([actual, siguiente]) => { if (activo) setFeriados([...actual, ...siguiente]) })
      .catch((e) => { if (activo) setError(e.message) })
      .finally(() => { if (activo) setCargando(false) })

    return () => { activo = false }
  }, [])

  return { feriados, cargando, error }
}

export default useFeriados
