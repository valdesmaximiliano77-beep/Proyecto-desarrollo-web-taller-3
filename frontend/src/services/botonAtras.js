import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

// En Android, el botón o gesto Atrás vuelve a la página anterior; en la primera, deja la app en segundo plano.
export function activarBotonAtras() {
  if (!Capacitor.isNativePlatform()) return
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back()
    else App.minimizeApp()
  })
}
