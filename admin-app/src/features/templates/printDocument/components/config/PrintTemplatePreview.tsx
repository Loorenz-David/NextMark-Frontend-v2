import { useEffect, useRef, useState } from 'react'

import type { TemplateVariantDefinition } from '../../domain/templateVariants.map'
import { buildTemplatePreviewModel } from '../../domain/templatePreview.utils'
import { renderPdfDocument } from '../../controllers/renderPdfDocument.controller'
import type { availableOrientations } from '../../types'

type PrintTemplatePreviewProps = {
  orientation: availableOrientations
  selectedVariantDefinition: TemplateVariantDefinition
}

export const PrintTemplatePreview = ({
  orientation,
  selectedVariantDefinition,
}: PrintTemplatePreviewProps) => {
  const previewModel = buildTemplatePreviewModel(selectedVariantDefinition, orientation)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const activeBlobUrl = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    renderPdfDocument(
      selectedVariantDefinition.drawFn,
      selectedVariantDefinition.previewData,
      selectedVariantDefinition.widthCm,
      selectedVariantDefinition.heightCm,
      orientation,
    ).then((blob) => {
      if (cancelled) return
      if (activeBlobUrl.current) URL.revokeObjectURL(activeBlobUrl.current)
      const url = URL.createObjectURL(blob)
      activeBlobUrl.current = url
      setPdfUrl(url)
      setIsLoading(false)
    }).catch(() => {
      if (!cancelled) setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [
    selectedVariantDefinition.drawFn,
    selectedVariantDefinition.previewData,
    selectedVariantDefinition.widthCm,
    selectedVariantDefinition.heightCm,
    orientation,
  ])

  useEffect(() => {
    return () => {
      if (activeBlobUrl.current) URL.revokeObjectURL(activeBlobUrl.current)
    }
  }, [])

  return (
    <div className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
        {selectedVariantDefinition.previewTitle}
      </p>
      <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
        {selectedVariantDefinition.previewBody}
      </p>

      <div className="flex justify-center items-start overflow-auto scroll-thin py-6">
        <div className="relative inline-block" style={{ paddingLeft: '2.4rem', paddingTop: '1.8rem' }}>

          <div
            className="pointer-events-none absolute border-t border-[var(--color-muted)]/70"
            style={{ left: '2.4rem', top: '1rem', width: `${previewModel.previewWidthCm}cm` }}
          />
          <span
            className="pointer-events-none absolute -translate-x-1/2 text-[11px] font-medium text-[var(--color-muted)]"
            style={{ left: `calc(2.4rem + ${previewModel.previewWidthCm / 2}cm)`, top: '0' }}
          >
            {previewModel.widthLabel}
          </span>

          <div
            className="pointer-events-none absolute border-l border-[var(--color-muted)]/70"
            style={{ left: '1rem', top: '1.8rem', height: `${previewModel.previewHeightCm}cm` }}
          />
          <span
            className="pointer-events-none absolute -translate-y-1/2 -rotate-90 text-[11px] font-medium text-[var(--color-muted)]"
            style={{ left: '0', top: `calc(1.8rem + ${previewModel.previewHeightCm / 2}cm)` }}
          >
            {previewModel.heightLabel}
          </span>

          <div style={{ width: `${previewModel.previewWidthCm}cm`, height: `${previewModel.previewHeightCm}cm` }}>
            {isLoading ? (
              <div className="flex h-full w-full items-center justify-center rounded bg-white/[0.03]">
                <span className="text-xs text-[var(--color-muted)]">Generating preview…</span>
              </div>
            ) : pdfUrl ? (
              <iframe
                key={pdfUrl}
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                title="Template preview"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
