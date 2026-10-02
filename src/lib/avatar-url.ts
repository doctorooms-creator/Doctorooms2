/**
 * Normalize an avatar image reference to a displayable URL.
 * 
 * Handles four cases:
 * 1. Cloudinary URL (res.cloudinary.com) — returned as-is
 * 2. Full URL (Supabase Storage / other) — returned as-is
 * 3. Relative path starting with '/' — returned as-is (local dev fallback)
 * 4. Bare filename (e.g. 'default.png', 'abc_123.jpg') — returns local fallback
 * 
 * For the 'default.png' fallback, returns empty string so the UI can show initials.
 */
export function resolveAvatarUrl(img: string | null | undefined): string {
  if (!img || img === 'default.png') return ''
  if (img.startsWith('http://') || img.startsWith('https://')) return img
  if (img.startsWith('/')) return img

  // Bare filename — local fallback
  return `/uploads/profile/${img}`
}

/**
 * Normalize an avatar reference for direct use in <AvatarImage src={...}>.
 *
 * Unlike resolveAvatarUrl, this NEVER returns a bare/relative filename:
 * 'default.png' / empty → '/default.png' (real placeholder in public/),
 * bare filenames → '/uploads/profile/<name>', so the browser never resolves
 * the image against the current page path (which caused 404s like
 * /dashboard/default.png on nested routes).
 */
export function getAvatarDisplayUrl(img: string | null | undefined): string {
  if (!img || img === 'default.png') return '/default.png'
  if (img.startsWith('http://') || img.startsWith('https://')) return img
  if (img.startsWith('/')) return img
  return `/uploads/profile/${img}`
}
