declare module 'html2canvas' {
  type Html2CanvasOptions = {
    backgroundColor?: string | null
    scale?: number
    useCORS?: boolean
  }

  export default function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions,
  ): Promise<HTMLCanvasElement>
}

declare module 'jspdf' {
  type PdfOrientation = 'portrait' | 'landscape'
  type PdfUnit = 'cm' | 'mm' | 'pt' | 'px' | 'in'

  type JsPdfConstructorOptions = {
    orientation?: PdfOrientation
    unit?: PdfUnit
    format?: [number, number] | string
  }

  export class jsPDF {
    constructor(options?: JsPdfConstructorOptions)
    addImage(
      imageData: string,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number,
    ): void
    output(type: 'blob'): Blob
  }
}
