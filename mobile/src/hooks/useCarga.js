import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Carga datos al abrir la pantalla y cada vez que vuelve a mostrarse
// (así se ve el cambio hecho en la pantalla de detalle). Entrega los estados
// de carga, error y refresco manual (arrastrar hacia abajo).
export function useCarga(funcion) {
  const ref = useRef(funcion);
  ref.current = funcion;
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setDatos(await ref.current());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const refrescar = useCallback(() => { setRefrescando(true); cargar(); }, [cargar]);
  const reintentar = useCallback(() => { setCargando(true); cargar(); }, [cargar]);

  return { datos, error, cargando, refrescando, refrescar, reintentar, recargar: cargar };
}
