export type ItemImageSource = {
  src: string
  srcSet?: string
  sizes?: string
}

const ITEM_CARD_IMAGE_WIDTHS = [56, 112, 168]
const ITEM_IMAGE_PREVIEW_WIDTHS = [400, 800, 1200]

const isShopifyCdnImage = (url: URL) =>
  url.hostname === 'cdn.shopify.com' && url.pathname.includes('/files/')

const withWidthParam = (imageUrl: string, width: number): string | null => {
  try {
    const url = new URL(imageUrl)
    if (!isShopifyCdnImage(url)) return null

    url.searchParams.set('width', String(width))
    return url.toString()
  } catch {
    return null
  }
}

const buildResponsiveImageSource = (
  imageUrl: string,
  widths: number[],
  fallbackWidth: number,
  sizes: string,
): ItemImageSource => {
  const responsiveUrls = widths.map((width) => ({
    width,
    url: withWidthParam(imageUrl, width),
  }))

  if (responsiveUrls.some((entry) => entry.url === null)) {
    return { src: imageUrl }
  }

  return {
    src:
      responsiveUrls.find((entry) => entry.width === fallbackWidth)?.url ??
      responsiveUrls[0].url ??
      imageUrl,
    srcSet: responsiveUrls
      .map((entry) => `${entry.url} ${entry.width}w`)
      .join(', '),
    sizes,
  }
}

export const buildItemCardImageThumbnail = (imageUrl: string): ItemImageSource =>
  buildResponsiveImageSource(imageUrl, ITEM_CARD_IMAGE_WIDTHS, 112, '56px')

export const buildItemImagePreview = (imageUrl: string): ItemImageSource =>
  buildResponsiveImageSource(
    imageUrl,
    ITEM_IMAGE_PREVIEW_WIDTHS,
    800,
    '(max-width: 480px) 100vw, 400px',
  )
