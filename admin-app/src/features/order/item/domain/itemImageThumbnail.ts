export type ItemImageThumbnail = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

const ITEM_CARD_IMAGE_WIDTHS = [56, 112, 168];
const ITEM_IMAGE_PREVIEW_WIDTHS = [400, 800];

const isShopifyCdnImage = (url: URL) =>
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

export const buildItemCardImageThumbnail = (
  imageUrl: string,
): ItemImageThumbnail => {
  const thumbnailUrls = ITEM_CARD_IMAGE_WIDTHS.map((width) => ({
    width,
    url: withWidthParam(imageUrl, width),
  }));

  if (thumbnailUrls.some((entry) => entry.url === null)) {
    return { src: imageUrl };
  }

  return {
    src: thumbnailUrls[1].url ?? imageUrl,
    srcSet: thumbnailUrls
      .map((entry) => `${entry.url} ${entry.width}w`)
      .join(", "),
    sizes: "56px",
  };
};

export const buildItemImagePreview = (imageUrl: string): ItemImageThumbnail => {
  const previewUrls = ITEM_IMAGE_PREVIEW_WIDTHS.map((width) => ({
    width,
    url: withWidthParam(imageUrl, width),
  }));

  if (previewUrls.some((entry) => entry.url === null)) {
    return { src: imageUrl };
  }

  return {
    src: previewUrls[0].url ?? imageUrl,
    srcSet: previewUrls.map((entry) => `${entry.url} ${entry.width}w`).join(", "),
    sizes: "400px",
  };
};
