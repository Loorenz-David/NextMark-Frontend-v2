export type RemoteImageSource = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

const isShopifyCdnImage = (url: URL): boolean =>
  url.hostname === "cdn.shopify.com" && url.pathname.includes("/files/");

const withWidthParam = (imageUrl: string, width: number): string | null => {
  try {
    const url = new URL(imageUrl);
    if (!isShopifyCdnImage(url)) return null;

    url.searchParams.set("width", String(width));
    return url.toString();
  } catch {
    return null;
  }
};

/**
 * Builds the img source set for a remote image. Shopify CDN images are
 * downscaled to the given candidate widths so the browser never fetches the
 * full-resolution original; other hosts fall back to the raw URL.
 */
export const buildRemoteImageSource = (
  imageUrl: string,
  widths?: number[],
  sizes?: string,
): RemoteImageSource => {
  if (!widths || widths.length === 0) return { src: imageUrl };

  const entries = widths.map((width) => ({
    width,
    url: withWidthParam(imageUrl, width),
  }));

  if (entries.some((entry) => entry.url === null)) {
    return { src: imageUrl };
  }

  const fallback = entries[Math.min(1, entries.length - 1)];

  return {
    src: fallback.url ?? imageUrl,
    srcSet: entries.map((entry) => `${entry.url} ${entry.width}w`).join(", "),
    sizes,
  };
};
