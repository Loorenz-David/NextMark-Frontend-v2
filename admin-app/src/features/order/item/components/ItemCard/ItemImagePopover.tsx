import { useEffect, useMemo, useState } from "react";

import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";
import { RemoteImage } from "@/shared/media/RemoteImage";

const ITEM_CARD_IMAGE_WIDTHS = [56, 112, 168];
const ITEM_CARD_IMAGE_SIZES = "56px";
const ITEM_IMAGE_PREVIEW_WIDTHS = [400, 800];
const ITEM_IMAGE_PREVIEW_SIZES = "400px";

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
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (activeIndex <= images.length - 1) return;
    setActiveIndex(0);
  }, [activeIndex, images.length]);

  if (!activeImage) return null;

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
          className="h-14 w-14 overflow-hidden rounded-md border border-border bg-surface-raised focus:outline-none focus:ring-2 focus:ring-[var(--color-turques)]/60"
          aria-label="Open item images"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((currentOpen) => !currentOpen);
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
          }}
        >
          <RemoteImage
            imageUrl={activeImage}
            alt={itemType ? `${itemType} item` : "Item image"}
            widths={ITEM_CARD_IMAGE_WIDTHS}
            sizes={ITEM_CARD_IMAGE_SIZES}
            className="h-full w-full"
          />
        </button>
      }
    >
      <div
        className="admin-glass-popover w-[min(92vw,440px)] rounded-lg border border-border bg-[rgba(var(--theme-surface-popover-r),0.94)] p-4 shadow-[var(--shadow-panel-image)] backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="relative flex min-h-[400px] w-full items-center justify-center overflow-hidden rounded-md bg-panel-floating"
          onClick={showNextImage}
          aria-label={hasMultipleImages ? "Show next item image" : "Item image"}
        >
          <RemoteImage
            imageUrl={activeImage}
            alt={itemType ? `${itemType} preview` : "Item image preview"}
            widths={ITEM_IMAGE_PREVIEW_WIDTHS}
            sizes={ITEM_IMAGE_PREVIEW_SIZES}
            className="h-[400px] w-full max-w-[400px]"
            imgClassName="object-contain"
            loading="eager"
          />
        </button>

        {hasMultipleImages ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              className="rounded-md border border-border px-3 py-2 text-xs text-[var(--color-text)] transition hover:bg-surface-hover"
              onClick={showPreviousImage}
            >
              Previous
            </button>
            <span className="text-xs text-[var(--color-muted)]">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              className="rounded-md border border-border px-3 py-2 text-xs text-[var(--color-text)] transition hover:bg-surface-hover"
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
