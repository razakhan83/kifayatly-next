export function normalizeProductImage(image) {
  if (!image) return null;

  if (typeof image === "string") {
    return {
      url: image,
      blurDataURL: "",
      publicId: "",
    };
  }

  if (typeof image === "object" && typeof image.url === "string") {
    return {
      url: image.url,
      blurDataURL: image.blurDataURL || "",
      publicId: image.publicId || image.public_id || "",
    };
  }

  return null;
}

export function normalizeProductImages(images, fallbackImage = "") {
  const normalizedImages = Array.isArray(images)
    ? images.map(normalizeProductImage).filter(Boolean)
    : [];

  if (normalizedImages.length > 0) {
    return normalizedImages;
  }

  const fallback = normalizeProductImage(fallbackImage);
  return fallback ? [fallback] : [];
}

export function getPrimaryProductImage(product) {
  const normalizedImages = normalizeProductImages(
    product?.Images,
    product?.ImageURL || product?.Image || product?.image || "",
  );

  return normalizedImages[0] || null;
}
