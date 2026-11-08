import { useState, useEffect, useCallback } from 'react'

// Ejecuta una función que pide datos a la API y entrega { datos, cargando, error, recargar }.
// `funcion` debe ser estable (las de agendaApi.js lo son).
function useCarga(funcion) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setDatos(await funcion())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [funcion])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { datos, cargando, error, recargar }
}

export default useCarga