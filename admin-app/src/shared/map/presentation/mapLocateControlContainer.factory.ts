export function createLocateControlContainer(buttons: HTMLElement[]) {
  const container = document.createElement('div')
  container.style.padding = '8px'
  container.style.display = 'flex'
  container.style.alignItems = 'center'
  container.style.gap = '8px'
  buttons.forEach((button) => {
    container.appendChild(button)
  })
  return container
}
