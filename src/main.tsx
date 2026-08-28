import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import '@xyflow/react/dist/style.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/glass.css'
import './styles/motion.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Somnora Workbench root element is missing')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
