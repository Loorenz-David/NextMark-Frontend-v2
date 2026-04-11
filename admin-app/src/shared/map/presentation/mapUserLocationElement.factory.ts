export function createUserLocationElement() {
  const container = document.createElement('div')
  container.style.width = '14px'
  container.style.height = '14px'
  container.style.borderRadius = '9999px'
  container.style.backgroundColor = '#2563eb'
  container.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.2)'
  return container
}
