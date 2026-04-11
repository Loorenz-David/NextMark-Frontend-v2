import { CurrentLocationIconSrc } from '@shared-icons'

export function createLocateControlButton(onClick: () => void) {
  const button = document.createElement('button')
  button.type = 'button'
  button.title = 'Go to current location'
  button.className = 'map-control-locate'
  button.style.width = '42px'
  button.style.height = '42px'
  button.style.border = '1px solid rgba(255, 255, 255, 0.12)'
  button.style.borderRadius = '9999px'
  button.style.background = 'rgba(14, 22, 23, 0.72)'
  button.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.18)'
  button.style.cursor = 'pointer'
  button.style.display = 'flex'
  button.style.alignItems = 'center'
  button.style.justifyContent = 'center'
  button.style.color = 'rgba(248, 251, 252, 0.92)'
  button.style.transition = 'background-color 160ms ease, border-color 160ms ease'

  const icon = document.createElement('img')
  icon.src = CurrentLocationIconSrc
  icon.alt = 'Current location'
  icon.width = 20
  icon.height = 20
  icon.style.pointerEvents = 'none'
  icon.style.filter = 'brightness(0) saturate(100%) invert(93%) sepia(15%) saturate(530%) hue-rotate(110deg) brightness(101%) contrast(96%)'
  button.appendChild(icon)

  button.onclick = onClick
  return button
}
