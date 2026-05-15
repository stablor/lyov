/**
 * Converts PNG frames → WebP
 * - Source: ../ressources/animation/png/
 * - Crops CROP_BOTTOM pixels from the bottom (removes Veo watermark)
 * - Output: public/assets/frames/frame_N.webp (0-indexed)
 */

import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import { join } from "path";

const SRC_DIR = join(process.cwd(), "..", "ressources", "animation", "png");
const DST_DIR = join(process.cwd(), "public", "assets", "frames");
const QUALITY = 85;
const CROP_BOTTOM = 40; // removes the Veo watermark (bottom 40px on 720px source)

await mkdir(DST_DIR, { recursive: true });

const files = (await readdir(SRC_DIR))
  .filter((f) => /\.png$/i.test(f))
  .sort();

console.log(`Converting ${files.length} PNG frames → WebP q${QUALITY}, crop bottom ${CROP_BOTTOM}px`);

let done = 0;
await Promise.all(
  files.map(async (file, i) => {
    const src = join(SRC_DIR, file);
    const dst = join(DST_DIR, `frame_${i}.webp`);

    const { width, height } = await sharp(src).metadata();
    await sharp(src)
      .extract({ left: 0, top: 0, width: width, height: height - CROP_BOTTOM })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(dst);

    done++;
    if (done % 20 === 0 || done === files.length) {
      process.stdout.write(`\r  ${done}/${files.length}`);
    }
  })
);

console.log(`\n✓ ${files.length} frames saved to ${DST_DIR}`);
console.log(`  Final size: 1280×${720 - CROP_BOTTOM} px`);
