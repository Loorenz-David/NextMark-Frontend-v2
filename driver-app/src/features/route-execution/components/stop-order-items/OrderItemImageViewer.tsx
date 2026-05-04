import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { BoldArrowIcon, CloseIcon } from '@/assets/icons'

import {
  buildItemCardImageThumbnail,
  buildItemImagePreview,
} from '../../domain/itemImageThumbnail'

type OrderItemImageViewerProps = {
  imageUrls: string[]
  itemType: string | null
}

export function OrderItemImageViewer({
  imageUrls,
  itemType,
}: OrderItemImageViewerProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const images = useMemo(
    () => imageUrls.map((imageUrl) => imageUrl.trim()).filter(Boolean),
    [imageUrls],
  )
  const activeImage = images[activeIndex] ?? images[0]
  const thumbnail = activeImage ? buildItemCardImageThumbnail(activeImage) : null
  const preview = activeImage ? buildItemImagePreview(activeImage) : null
  const hasMultipleImages = images.length > 1

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  useEffect(() => {
    if (activeIndex <= images.length - 1) return
    setActiveIndex(0)
  }, [activeIndex, images.length])

  if (!activeImage || !thumbnail || !preview) return null

  const showNextImage = () => {
    if (!hasMultipleImages) return
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length)
  }

  const showPreviousImage = () => {
    if (!hasMultipleImages) return
    setActiveIndex(
      (currentIndex) => (currentIndex - 1 + images.length) % images.length,
    )
  }

  const viewer = open && typeof document !== 'undefined'
    ? createPortal(
      <div
        className="fixed inset-0 z-[240] flex min-h-dvh flex-col bg-black/95 text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Item images"
      >
        <div className="flex shrink-0 items-center justify-between px-4 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {itemType ?? 'Item image'}
            </p>
            {hasMultipleImages ? (
              <p className="mt-1 text-xs text-white/55">
                {activeIndex + 1} / {images.length}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/10"
            aria-label="Close item images"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
          <button
            type="button"
            className="flex min-h-[400px] w-full items-center justify-center"
            aria-label={hasMultipleImages ? 'Show next item image' : 'Item image'}
            onClick={showNextImage}
          >
            <img
              src={preview.src}
              srcSet={preview.srcSet}
              sizes={preview.sizes}
              alt={itemType ? `${itemType} preview` : 'Item image preview'}
              className="max-h-[72dvh] min-h-[400px] w-full max-w-[400px] object-contain"
              width={400}
              height={400}
              decoding="async"
            />
          </button>
        </div>

        {hasMultipleImages ? (
          <div className="flex shrink-0 items-center justify-between gap-4 border-t border-white/10 px-4 py-4">
            <button
              type="button"
              className="flex h-11 min-w-28 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 text-sm"
              onClick={showPreviousImage}
            >
              <BoldArrowIcon
                aria-hidden="true"
                className="h-3.5 w-3.5 rotate-180"
              />
              Previous
            </button>
            <button
              type="button"
              className="flex h-11 min-w-28 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 text-sm"
              onClick={showNextImage}
            >
              Next
              <BoldArrowIcon aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>,
      document.body,
    )
    : null

  return (
    <>
      <button
        type="button"
        className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06]"
        aria-label="Open item images"
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
        onKeyDown={(event) => {
          event.stopPropagation()
        }}
      >
        <img
          src={thumbnail.src}
          srcSet={thumbnail.srcSet}
          sizes={thumbnail.sizes}
          alt={itemType ? `${itemType} item` : 'Item image'}
          className="h-full w-full object-cover"
          width={56}
          height={56}
          loading="lazy"
          decoding="async"
        />
      </button>
      {viewer}
    </>
  )
}
