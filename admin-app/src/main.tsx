import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProviders } from './app/providers/AppProviders'

// listener for setting the dynamic height on mobile browsers
function updateVH() {
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  )
}

window.addEventListener('resize', updateVH)
updateVH()

createRoot(document.getElementById('root')!).render(

    <AppProviders>
      <App />
    </AppProviders>
)
