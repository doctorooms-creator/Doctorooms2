/**
 * PWA icon generator — renders brand-consistent PNG icons from pure-vector SVG
 * (no fontconfig dependency, deterministic output).
 *
 * Design: teal gradient tile (#14b8a6 → #0f766e), white "D" glyph ring,
 * ECG heartbeat line underneath (regular variant only).
 *
 * Outputs:
 *   public/icon-192.png            — 192x192 (purpose: any)
 *   public/icon-512.png            — 512x512 (purpose: any)
 *   public/icon-maskable-192.png   — full-bleed, glyph in 80% safe zone
 *   public/icon-maskable-512.png   — full-bleed, glyph in 80% safe zone
 *   public/apple-touch-icon.png    — 180x180 full-bleed (iOS rounds corners)
 *   src/app/icon.svg               — Next.js favicon (app router convention)
 *
 * Usage: bun scripts/generate-pwa-icons.ts
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";

const OUT_PUBLIC = "public";
const OUT_APP = "src/app";

// ---------- shared vector pieces (viewBox 0 0 512 512) ----------

const DEFS = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#14b8a6"/>
      <stop offset="1" stop-color="#0f766e"/>
    </linearGradient>
  </defs>`;

/** White "D" ring glyph — outer bowl + inner cutout (evenodd). */
const D_PATH =
  "M150 136 H236 C328 136 394 175 394 256 C394 337 328 376 236 376 H150 Z " +
  "M212 198 H258 C306 198 338 222 338 256 C338 290 306 314 258 314 H212 Z";

const D_GLYPH = `<path fill="#ffffff" fill-rule="evenodd" d="${D_PATH}"/>`;

/** ECG heartbeat signature line (below the D, inside flat bottom edge). */
const PULSE =
  '<path d="M110 436 h70 l18 -32 24 60 22 -54 8 26 h160" ' +
  'stroke="#ffffff" stroke-width="16" fill="none" ' +
  'stroke-linecap="round" stroke-linejoin="round"/>';

// ---------- variant builders ----------

/** Regular icon: rounded gradient tile + D + heartbeat. */
function svgAny(size: number): string {
  const rx = Math.round(size * 0.203); // 104/512
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
${DEFS}
  <rect width="512" height="512" rx="${rx}" fill="url(#g)"/>
  ${D_GLYPH}
  ${PULSE}
</svg>`;
}

/** Maskable icon: full-bleed (OS applies shape), glyph only, ~55% of canvas. */
function svgMaskable(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
${DEFS}
  <rect width="512" height="512" fill="url(#g)"/>
  <g transform="translate(-56.8 -38.4) scale(1.15)">${D_GLYPH}</g>
</svg>`;
}

/** Apple touch icon: full-bleed square (iOS masks it), glyph ~64%. */
function svgApple(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
${DEFS}
  <rect width="512" height="512" fill="url(#g)"/>
  <g transform="translate(-111.2 -89.6) scale(1.35)">${D_GLYPH}</g>
</svg>`;
}

/** Apple touch icon: full square, glyph 63% (iOS rounds corners itself). */
function svgAppleTouch(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
${DEFS}
  <rect width="512" height="512" fill="url(#g)"/>
  <g transform="translate(-111.2 -89.6) scale(1.35)">${D_GLYPH}</g>
</svg>`;
}

// ---------- render ----------

async function render(svg: string, file: string, size: number) {
  const buf = await sharp(Buffer.from(svg)).png().toFile(file);
  const meta = await sharp(file).metadata();
  console.log(
    `✓ ${file} — ${meta.width}x${meta.height} (${(buf as unknown as { size?: number }).size ?? "?"} bytes)`
  );
}

async function main() {
  mkdirSync(OUT_PUBLIC, { recursive: true });

  await render(svgAny(512), `${OUT_PUBLIC}/icon-512.png`, 512);
  await render(svgAny(192), `${OUT_PUBLIC}/icon-192.png`, 192);
  await render(svgMaskable(512), `${OUT_PUBLIC}/icon-maskable-512.png`, 512);
  await render(svgMaskable(192), `${OUT_PUBLIC}/icon-maskable-192.png`, 192);
  await render(svgAppleTouch(180), `${OUT_PUBLIC}/apple-touch-icon.png`, 180);

  // Next.js app-router favicon (served at /icon.svg)
  writeFileSync(`${OUT_APP}/icon.svg`, svgAny(512));
  console.log(`✓ ${OUT_APP}/icon.svg`);
}

main();
