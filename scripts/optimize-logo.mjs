import sharp from "sharp";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src/public/logo-128.png");
const webpOut = join(root, "src/public/logo.webp");
const pngOut = join(root, "src/public/logo-128.png");

const before = statSync(src).size;

await sharp(src)
	.resize(128, 128, { fit: "cover" })
	.webp({ quality: 85 })
	.toFile(webpOut);

await sharp(src)
	.resize(128, 128, { fit: "cover" })
	.png({ compressionLevel: 9, palette: true })
	.toFile(pngOut);

const webpSize = statSync(webpOut).size;
const pngSize = statSync(pngOut).size;

console.log(`Source: ${(before / 1024).toFixed(1)} KB`);
console.log(`logo.webp: ${(webpSize / 1024).toFixed(1)} KB`);
console.log(`logo-128.png: ${(pngSize / 1024).toFixed(1)} KB`);
