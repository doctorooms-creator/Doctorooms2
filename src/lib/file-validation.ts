/**
 * File magic-byte verification.
 *
 * SECURITY (P3.3): MIME types (Content-Type headers) are trivially spoofable.
 * This module reads the first few bytes of a file's buffer and compares them
 * against known "magic byte" signatures for each allowed file type.
 *
 * Usage:
 *   const buffer = Buffer.from(await file.arrayBuffer())
 *   if (!verifyMagicBytes(buffer, file.type)) {
 *     return NextResponse.json({ error: 'File content does not match its type' }, { status: 400 })
 *   }
 */

const MAGIC_BYTES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // .PNG....
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF (WebP container)
}

/**
 * Verify that the file's actual content matches its declared MIME type.
 * Reads the first N bytes and compares against known magic byte signatures.
 *
 * Returns true if:
 *   - The declared type has no known magic bytes (unknown type → allow, less restrictive)
 *   - The file's first bytes match the expected signature
 *
 * Returns false if:
 *   - The declared type HAS known magic bytes AND they don't match
 */
export function verifyMagicBytes(buffer: Buffer, declaredType: string): boolean {
  const expected = MAGIC_BYTES[declaredType]
  if (!expected) {
    // Unknown type — allow (less restrictive; the type allowlist check is the primary defense)
    return true
  }

  // Buffer too short to contain the magic bytes → reject
  if (buffer.length < expected.length) {
    return false
  }

  // Compare byte-by-byte
  for (let i = 0; i < expected.length; i++) {
    if (buffer[i] !== expected[i]) {
      return false
    }
  }

  return true
}

/**
 * Combined validation: checks both the declared MIME type AND the magic bytes.
 * Use this in upload routes for defense-in-depth.
 *
 * Returns { valid: boolean, error?: string }
 */
export function validateUploadedFile(
  buffer: Buffer,
  declaredType: string,
  fileName: string,
  allowedTypes: string[],
  maxBytes: number
): { valid: boolean; error?: string } {
  // 1. Size check
  if (buffer.length > maxBytes) {
    return { valid: false, error: `File too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)` }
  }

  // 2. Type allowlist check
  if (!allowedTypes.includes(declaredType)) {
    // Also check by file extension as a fallback (some browsers send wrong MIME)
    const ext = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]
    const extMap: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      dcm: 'application/dicom',
      dicom: 'application/dicom',
    }
    const mappedType = ext ? extMap[ext] : undefined
    if (!mappedType || !allowedTypes.includes(mappedType)) {
      return { valid: false, error: 'Invalid file type.' }
    }
  }

  // 3. Magic byte verification
  if (!verifyMagicBytes(buffer, declaredType)) {
    return { valid: false, error: 'File content does not match its declared type.' }
  }

  return { valid: true }
}
