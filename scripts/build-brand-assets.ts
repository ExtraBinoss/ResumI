import { chromium } from "@playwright/test";

// Asset conversion only: keep the supplied artwork/alpha and generate small browser sizes.
const root = "apps/web/public";
const data = Buffer.from(
  await Bun.file(`${root}/brand/resumi-icon-source.png`).arrayBuffer(),
).toString("base64");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const images = await page.evaluate(async (source) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    return [16, 32, 48, 64, 180, 192].map((size) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const context = canvas.getContext("2d")!;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, size, size);
      return { size, base64: canvas.toDataURL("image/png").split(",")[1] };
    });
  }, `data:image/png;base64,${data}`);
  const buffers = new Map(
    images.map(({ size, base64 }) => [size, Buffer.from(base64, "base64")]),
  );
  for (const [size, name] of [
    [32, "favicon-32.png"],
    [64, "favicon-64.png"],
    [180, "apple-touch-icon.png"],
    [192, "brand/resumi-icon-192.png"],
  ] as const) {
    await Bun.write(`${root}/${name}`, buffers.get(size)!);
  }
  const sizes = [16, 32, 48];
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  for (const [index, size] of sizes.entries()) {
    const start = 6 + index * 16,
      png = buffers.get(size)!;
    header[start] = header[start + 1] = size;
    header.writeUInt16LE(1, start + 4);
    header.writeUInt16LE(32, start + 6);
    header.writeUInt32LE(png.length, start + 8);
    header.writeUInt32LE(offset, start + 12);
    offset += png.length;
  }
  await Bun.write(
    `${root}/favicon.ico`,
    Buffer.concat([header, ...sizes.map((size) => buffers.get(size)!)]),
  );
  console.log("Generated PNG/ICO browser icons from the supplied artwork.");
} finally {
  await browser.close();
}
