/** Print copies only: preserve source assets and alpha; never enlarge an image. */
export async function optimizePrintImages(root: ParentNode) {
  const measurements: {
    before: number;
    after: number;
    width: number;
    height: number;
  }[] = [];
  for (const image of root.querySelectorAll<HTMLImageElement>("img")) {
    if (!/^data:image\/(png|jpe?g|webp);/i.test(image.src)) continue;
    await image.decode();
    const bounds = image.getBoundingClientRect();
    if (!bounds.width || !bounds.height) continue;
    // 3 source pixels per CSS px is 288 dpi. Cover images retain the necessary crop area.
    const fit =
      getComputedStyle(image).objectFit === "contain" ? Math.min : Math.max;
    const scale = Math.min(
      1,
      fit(
        (bounds.width * 3) / image.naturalWidth,
        (bounds.height * 3) / image.naturalHeight,
      ),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) continue;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const before = image.src.length;
    // PNG stays lossless/transparent; photographic sources use a high-quality JPEG copy.
    const alpha = /^data:image\/(png|webp);/i.test(image.src);
    const result = canvas.toDataURL(alpha ? "image/png" : "image/jpeg", 0.9);
    if (result.length < before) {
      image.src = result;
      await image.decode();
    }
    measurements.push({
      before,
      after: image.src.length,
      width: canvas.width,
      height: canvas.height,
    });
  }
  return measurements;
}
