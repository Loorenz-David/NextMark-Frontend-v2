import { useEffect, useMemo, useState } from "react";

import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import {
  buildItemCardImageThumbnail,
  buildItemImagePreview,
} from "../../domain/itemImageThumbnail";

type ItemImagePopoverProps = {
  imageUrls: string[];
  itemType: string;
};

export const ItemImagePopover = ({
  imageUrls,
  itemType,
}: ItemImagePopoverProps) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = useMemo(
    () => imageUrls.map((imageUrl) => imageUrl.trim()).filter(Boolean),
    [imageUrls],
  );
  const activeImage = images[activeIndex] ?? images[0];
  const thumbnail = activeImage
    ? buildItemCardImageThumbnail(activeImage)
    : null;
  const preview = activeImage ? buildItemImagePreview(activeImage) : null;
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (activeIndex <= images.length - 1) return;
    setActiveIndex(0);
  }, [activeIndex, images.length]);

  if (!activeImage || !thumbnail || !preview) return null;

  const showNextImage = () => {
    if (!hasMultipleImages) return;
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
  };

  const showPreviousImage = () => {
    if (!hasMultipleImages) return;
    setActiveIndex(
      (currentIndex) => (currentIndex - 1 + images.length) % images.length,
    );
  };

  return (
    <FloatingPopover
      open={open}
      onOpenChange={setOpen}
      classes="h-14 w-14 shrink-0 !flex-none"
      referenceCLassName="h-14 w-14"
      offSetNum={10}
      placement="right-start"
      renderInPortal={true}
      strategy="fixed"
      floatingClassName="z-[220]"
      reference={
        <button
          type="button"
          className="h-14 w-14 overflow-hidden rounded-md border border-white/10 bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-[var(--color-turques)]/60"
          aria-label="Open item images"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((currentOpen) => !currentOpen);
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
          }}
        >
          <img
            src={thumbnail.src}
            srcSet={thumbnail.srcSet}
            sizes={thumbnail.sizes}
            alt={itemType ? `${itemType} item` : "Item image"}
            className="h-full w-full object-cover"
            width={56}
            height={56}
            loading="lazy"
            decoding="async"
          />
        </button>
      }
    >
      <div
        className="admin-glass-popover w-[min(92vw,440px)] rounded-lg border border-white/14 bg-[rgba(9,16,26,0.94)] p-4 shadow-[0_20px_48px_rgba(0,0,0,0.38)] backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="relative flex min-h-[400px] w-full items-center justify-center overflow-hidden rounded-md bg-black/20"
          onClick={showNextImage}
          aria-label={hasMultipleImages ? "Show next item image" : "Item image"}
        >
          <img
            src={preview.src}
            srcSet={preview.srcSet}
            sizes={preview.sizes}
            alt={itemType ? `${itemType} preview` : "Item image preview"}
            className="h-[400px] w-full max-w-[400px] object-contain"
            width={400}
            height={400}
            decoding="async"
          />
        </button>

        {hasMultipleImages ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              className="rounded-md border border-white/12 px-3 py-2 text-xs text-[var(--color-text)] transition hover:bg-white/10"
              onClick={showPreviousImage}
            >
              Previous
            </button>
            <span className="text-xs text-[var(--color-muted)]">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              className="rounded-md border border-white/12 px-3 py-2 text-xs text-[var(--color-text)] transition hover:bg-white/10"
              onClick={showNextImage}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </FloatingPopover>
  );
};
