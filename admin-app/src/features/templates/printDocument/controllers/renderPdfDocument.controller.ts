import type { jsPDF as JsPDF } from 'jspdf'
import type { availableOrientations } from '../types'

export type PdfDrawFn = (
  pdf: JsPDF,
  data: unknown,
  widthCm: number,
  heightCm: number,
) => void

export const renderPdfDocument = async (
  drawFn: PdfDrawFn,
  data: unknown,
  widthCm: number,
  heightCm: number,
  orientation: availableOrientations = 'vertical',
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  const { jsPDF } = await import('jspdf')

  const shouldRotate = orientation === 'horizontal' && widthCm < heightCm
  const w = shouldRotate ? heightCm : widthCm
  const h = shouldRotate ? widthCm : heightCm
  const pdfOrient: 'landscape' | 'portrait' = w >= h ? 'landscape' : 'portrait'

  onProgress?.(0.05)

  const pdf = new jsPDF({ orientation: pdfOrient, unit: 'cm', format: [w, h] })
  const dataList: unknown[] = Array.isArray(data) ? data : [data]

  for (let i = 0; i < dataList.length; i++) {
    if (i > 0) pdf.addPage([w, h], pdfOrient)
    drawFn(pdf, dataList[i], w, h)
    onProgress?.(0.1 + ((i + 1) / dataList.length) * 0.85)
  }

  onProgress?.(1)
  return pdf.output('blob')
}
