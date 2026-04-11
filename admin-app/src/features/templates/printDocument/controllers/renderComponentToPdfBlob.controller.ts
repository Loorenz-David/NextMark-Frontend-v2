import { createElement } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import type { availableOrientations } from '../types'

const waitForRenderTick = async () => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

const toPropsRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

const normalizePageProps = (props: unknown): Record<string, unknown>[] => {
  if (Array.isArray(props)) {
    if (props.length === 0) return [{}]
    return props.map((entry) => toPropsRecord(entry))
  }
  return [toPropsRecord(props)]
}

export const renderComponentToPdfBlob = async (
  Component: ComponentType<{ orientation: availableOrientations }>,
  props: unknown,
  widthCm: number,
  heightCm: number,
  orientation: availableOrientations = 'vertical',
): Promise<Blob> => {
  if (typeof document === 'undefined') {
    throw new Error('PDF rendering is only available in browser environments.')
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const orientedWidthCm = orientation === 'horizontal' ? heightCm : widthCm
  const orientedHeightCm = orientation === 'horizontal' ? widthCm : heightCm

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = `${orientedWidthCm}cm`
  container.style.height = `${orientedHeightCm}cm`
  container.style.background = '#fff'
  container.style.zIndex = '-1'
  container.style.pointerEvents = 'none'
  container.style.boxSizing = 'border-box'
  container.setAttribute('data-print-render-container', 'true')

  document.body.appendChild(container)

  const root = createRoot(container)
  const pagePropsList = normalizePageProps(props)

  try {
    const pdf = new jsPDF({
      orientation: orientedWidthCm >= orientedHeightCm ? 'landscape' : 'portrait',
      unit: 'cm',
      format: [orientedWidthCm, orientedHeightCm],
    })

    for (let index = 0; index < pagePropsList.length; index += 1) {
      const pageProps = pagePropsList[index]
      const componentElement = createElement(Component, {
        ...pageProps,
        orientation,
      })

      const renderElement = orientation === 'horizontal'
        ? createElement(
            'div',
            {
              style: {
                width: `${widthCm}cm`,
                height: `${heightCm}cm`,
                transform: 'rotate(90deg) translateY(-100%)',
                transformOrigin: 'top left',
              },
            },
            componentElement,
          )
        : componentElement

      root.render(renderElement)
      await waitForRenderTick()

      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })

      const imageData = canvas.toDataURL('image/png')
      if (index > 0) {
        pdf.addPage(
          [orientedWidthCm, orientedHeightCm],
          orientedWidthCm >= orientedHeightCm ? 'landscape' : 'portrait',
        )
      }
      pdf.addImage(imageData, 'PNG', 0, 0, orientedWidthCm, orientedHeightCm)
    }

    return pdf.output('blob')
  } finally {
    root.unmount()
    container.remove()
  }
}
