import { useEffect, useRef, useState } from "react";

import { ImageIcon } from "@/assets/icons";
import { cn } from "@/lib/utils/cn";

import { buildRemoteImageSource } from "./imageSource";
import "@/shared/loadingCards/loadingCards.css";

type RemoteImageProps = {
  imageUrl?: string | null;
  alt: string;
  /** Candidate widths for CDN downscaling (Shopify); rendered as srcSet. */
  widths?: number[];
  /** The `sizes` attribute matching the container's rendered width. */
  sizes?: string;
  /** Wrapper classes: dimensions, rounding, borders. */
  className?: string;
  /** Img element overrides, e.g. object-contain. */
  imgClassName?: string;
  loading?: "lazy" | "eager";
};

type RemoteImageStatus = "loading" | "loaded" | "error";

/**
 * Centralized remote image renderer: shows a shimmer skeleton while the
 * image loads, downscales Shopify CDN images to the container's needs, and
 * falls back to a missing-image icon when there is no URL or loading fails.
 */
export const RemoteImage = ({
  imageUrl,
  alt,
  widths,
  sizes,
  className,
  imgClassName,
  loading = "lazy",
}: RemoteImageProps) => {
  const [status, setStatus] = useState<RemoteImageStatus>("loading");
  const imageRef = useRef<HTMLImageElement | null>(null);

  const trimmedUrl = imageUrl?.trim() || null;
  const source = trimmedUrl
    ? buildRemoteImageSource(trimmedUrl, widths, sizes)
    : null;
  const sourceSrc = source?.src ?? null;

  useEffect(() => {
    if (!sourceSrc) return;

    const image = imageRef.current;
    if (image?.complete) {
      setStatus(image.naturalWidth > 0 ? "loaded" : "error");
      return;
    }
    setStatus("loading");
  }, [sourceSrc]);

  const missingContent = (
    <span
      role="img"
      aria-label={alt}
      className="flex h-full w-full items-center justify-center"
    >
      <ImageIcon className="h-2/5 w-2/5 text-[var(--color-muted)]/50" />
    </span>
  );

  return (
    <span
      className={cn(
        "relative block overflow-hidden bg-surface-raised",
        className,
      )}
    >
      {!source || status === "error" ? (
        missingContent
      ) : (
        <>
          {status === "loading" && (
            <span
              className="shared-loading-card absolute inset-0 bg-surface-raised"
              aria-hidden="true"
            />
          )}
          <img
            key={source.src}
            ref={imageRef}
            src={source.src}
            srcSet={source.srcSet}
            sizes={source.sizes}
            alt={alt}
            loading={loading}
            decoding="async"
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-200",
              status === "loaded" ? "opacity-100" : "opacity-0",
              imgClassName,
            )}
          />
        </>
      )}
    </span>
  );
};
