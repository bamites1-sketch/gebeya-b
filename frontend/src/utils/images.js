/**
 * Resolves a product image value to a usable src URL.
 *
 * The `images` column can be:
 *   1. JSON array of full URLs:  '["https://source.unsplash.com/...", "..."]'
 *   2. JSON array of filenames:  '["kirar.jpg", "kirar2.jpg"]'
 *   3. A plain filename string:  'kirar.jpg'
 *   4. A full URL string:        'https://...'
 *   5. null / undefined
 *
 * Returns an array of resolved src strings.
 */
export function resolveImages(raw) {
  if (!raw) return [];

  let parsed = raw;

  // Try to parse JSON
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Not JSON — treat as a single value
      parsed = [raw];
    }
  }

  // Ensure array
  if (!Array.isArray(parsed)) parsed = [parsed];

  return parsed
    .filter(Boolean)
    .map((src) => {
      if (!src) return null;
      // Already a full URL
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
        return src;
      }
      // Local filename → prefix with /images/
      return `/images/${src}`;
    })
    .filter(Boolean);
}

/**
 * Returns the first resolved image, or a branded placeholder.
 */
export function getFirstImage(raw, productName = 'Product') {
  const imgs = resolveImages(raw);
  return (
    imgs[0] ||
    `https://placehold.co/600x500/2C1810/F19A0E?text=${encodeURIComponent(productName)}`
  );
}
