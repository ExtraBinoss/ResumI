/** DOM selection bridge shared by the canvas and inspector content editors. */
export function selectionOffsets(root: HTMLElement) {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (
    !root.contains(range.startContainer) ||
    !root.contains(range.endContainer)
  )
    return null;
  const prefix = document.createRange();
  prefix.selectNodeContents(root);
  prefix.setEnd(range.startContainer, range.startOffset);
  const suffix = document.createRange();
  suffix.selectNodeContents(root);
  suffix.setEnd(range.endContainer, range.endOffset);
  return { start: prefix.toString().length, end: suffix.toString().length };
}
export function restoreSelection(
  root: HTMLElement,
  range: { start: number; end: number },
) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const native = document.createRange();
  let offset = 0,
    startSet = false,
    node = walker.nextNode();
  while (node) {
    const length = node.textContent?.length ?? 0;
    if (!startSet && range.start <= offset + length) {
      native.setStart(node, Math.max(0, range.start - offset));
      startSet = true;
    }
    if (range.end <= offset + length) {
      if (!startSet) native.setStart(node, 0);
      native.setEnd(node, Math.max(0, range.end - offset));
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(native);
      return;
    }
    offset += length;
    node = walker.nextNode();
  }
}
