export const parseItemImagesInput = (value: string): string[] | null => {
  const imageUrls = value
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  return imageUrls.length ? imageUrls : null;
};

export const formatItemImagesInput = (itemImages?: string[] | null): string =>
  itemImages?.join(",") ?? "";
