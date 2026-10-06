import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const directory = path.resolve("public/images");

function jpegSize(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset);
    if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 5), height: buffer.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  return null;
}

const files = (await readdir(directory)).filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file)).sort();
const rows = await Promise.all(files.map(async (file) => {
  const bytes = await readFile(path.join(directory, file));
  const size = jpegSize(bytes);
  return { file, ...(size ?? { width: 0, height: 0 }), sha256: createHash("sha256").update(bytes).digest("hex") };
}));
for (const row of rows) process.stdout.write(`${row.file}\t${row.width}x${row.height}\t${row.sha256}\n`);
