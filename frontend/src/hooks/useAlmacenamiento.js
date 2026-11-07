import { useState, useEffect } from 'react'

// Igual que useState, pero guarda el valor en localStorage para que sobreviva a recargar la página.
function useAlmacenamiento(clave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave)
      return guardado ? JSON.parse(guardado) : valorInicial
    } catch {
      return valorInicial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor))
    } catch {
      // si el navegador bloquea el almacenamiento, la app sigue funcionando sin guardar
    }
  }, [clave, valor])

  return [valor, setValor]
}

export default useAlmacenamiento
