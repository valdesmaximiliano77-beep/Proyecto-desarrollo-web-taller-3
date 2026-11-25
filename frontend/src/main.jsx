import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/estilos.css'
import App from './App.jsx'
import { activarBotonAtras } from './services/botonAtras'
import { abrirCalendarioAlTocar } from './services/recordatorios'

activarBotonAtras()
abrirCalendarioAlTocar()

// HashRouter: las rutas funcionan aunque se publique en un hosting estático (GitHub Pages)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)
