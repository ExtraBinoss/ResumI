// Adapted from cv-creator-private/src/engine; original checkout kept read-only.
export interface TextMarkStyle {
  href?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
  underline?: boolean;
  strike?: boolean;
}

export interface TextMark extends TextMarkStyle {
  id: string;
  start: number;
  end: number;
}

export interface RichTextSegment {
  start: number;
  end: number;
  text: string;
  style: TextMarkStyle;
  markIds: string[];
}

export type TextStyleProperty = keyof TextMarkStyle;

export interface TextSelectionStyle {
  style: TextMarkStyle;
  mixed: TextStyleProperty[];
}

const TEXT_STYLE_PROPERTIES: TextStyleProperty[] = [
  "href",
  "color",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "underline",
  "strike",
];

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function normalizeTextMarks(
  marks: TextMark[] | undefined,
  length: number,
) {
  if (!Array.isArray(marks)) return [];
  return marks.flatMap((mark) => {
    const start = clamp(Math.floor(Number(mark.start)), 0, length);
    const end = clamp(Math.floor(Number(mark.end)), start, length);
    return mark.id && end > start ? [{ ...mark, start, end }] : [];
  });
}

export function richTextSegments(
  text: string,
  marks?: TextMark[],
): RichTextSegment[] {
  if (!text) return [];
  const normalized = normalizeTextMarks(marks, text.length);
  const boundaries = [
    ...new Set([
      0,
      text.length,
      ...normalized.flatMap((mark) => [mark.start, mark.end]),
    ]),
  ].sort((left, right) => left - right);
  return boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1];
    const active = normalized.filter(
      (mark) => mark.start <= start && mark.end >= end,
    );
    const style = active.reduce<TextMarkStyle>(
      (merged, mark) => ({
        ...merged,
        ...(mark.href !== undefined ? { href: mark.href } : {}),
        ...(mark.color !== undefined ? { color: mark.color } : {}),
        ...(mark.fontFamily !== undefined
          ? { fontFamily: mark.fontFamily }
          : {}),
        ...(mark.fontSize !== undefined ? { fontSize: mark.fontSize } : {}),
        ...(mark.fontWeight !== undefined
          ? { fontWeight: mark.fontWeight }
          : {}),
        ...(mark.fontStyle !== undefined ? { fontStyle: mark.fontStyle } : {}),
        ...(mark.underline !== undefined ? { underline: mark.underline } : {}),
        ...(mark.strike !== undefined ? { strike: mark.strike } : {}),
      }),
      {},
    );
    return {
      start,
      end,
      text: text.slice(start, end),
      style,
      markIds: active.map((mark) => mark.id),
    };
  });
}

export function textStyleAt(
  text: string,
  marks: TextMark[] | undefined,
  position: number,
) {
  const point = clamp(
    position === text.length && position > 0 ? position - 1 : position,
    0,
    Math.max(0, text.length - 1),
  );
  return (
    richTextSegments(text, marks).find(
      (segment) => point >= segment.start && point < segment.end,
    )?.style ?? {}
  );
}

export function textStyleAcrossRange(
  text: string,
  marks: TextMark[] | undefined,
  start: number,
  end: number,
  base: TextMarkStyle = {},
): TextSelectionStyle {
  const from = clamp(Math.floor(Math.min(start, end)), 0, text.length);
  const to = clamp(Math.floor(Math.max(start, end)), from, text.length);
  if (from === to)
    return { style: { ...base, ...textStyleAt(text, marks, from) }, mixed: [] };

  const segments = richTextSegments(text, marks)
    .filter((segment) => segment.start < to && segment.end > from)
    .map((segment) => ({ ...base, ...segment.style }));
  if (!segments.length) return { style: { ...base }, mixed: [] };

  const style: TextMarkStyle = {};
  const mixed: TextStyleProperty[] = [];
  for (const property of TEXT_STYLE_PROPERTIES) {
    const first = segments[0][property];
    if (segments.every((segment) => Object.is(segment[property], first))) {
      if (first !== undefined) Object.assign(style, { [property]: first });
    } else {
      mixed.push(property);
    }
  }
  return { style, mixed };
}

export function replaceTextRange(
  text: string,
  marks: TextMark[] | undefined,
  start: number,
  end: number,
  replacement: string,
) {
  const from = clamp(Math.floor(start), 0, text.length);
  const to = clamp(Math.floor(end), from, text.length);
  const delta = replacement.length - (to - from);
  const normalized = normalizeTextMarks(marks, text.length);
  const usedIds = new Set(normalized.map((mark) => mark.id));
  const rightId = (id: string) => {
    const prefix = `${id.slice(0, 80)}-right`;
    let candidate = prefix;
    let suffix = 1;
    while (usedIds.has(candidate)) candidate = `${prefix}-${suffix++}`;
    usedIds.add(candidate);
    return candidate;
  };
  const nextMarks = normalized.flatMap((mark) => {
    if (mark.end <= from) return [mark];
    if (mark.start >= to)
      return [{ ...mark, start: mark.start + delta, end: mark.end + delta }];
    if (mark.start <= from && mark.end >= to) {
      const nextEnd = mark.end + delta;
      return nextEnd > mark.start ? [{ ...mark, end: nextEnd }] : [];
    }
    const pieces: TextMark[] = [];
    if (mark.start < from) pieces.push({ ...mark, end: from });
    if (mark.end > to)
      pieces.push({
        ...mark,
        id: rightId(mark.id),
        start: from + replacement.length,
        end: mark.end + delta,
      });
    return pieces;
  });
  return {
    text: `${text.slice(0, from)}${replacement}${text.slice(to)}`,
    marks: nextMarks,
    start: from,
    end: from + replacement.length,
  };
}

export function updateTextPreservingMarks(
  previous: string,
  next: string,
  marks?: TextMark[],
) {
  if (previous === next) return normalizeTextMarks(marks, next.length);
  let start = 0;
  while (
    start < previous.length &&
    start < next.length &&
    previous[start] === next[start]
  )
    start += 1;
  let previousEnd = previous.length;
  let nextEnd = next.length;
  while (
    previousEnd > start &&
    nextEnd > start &&
    previous[previousEnd - 1] === next[nextEnd - 1]
  ) {
    previousEnd -= 1;
    nextEnd -= 1;
  }
  return replaceTextRange(
    previous,
    marks,
    start,
    previousEnd,
    next.slice(start, nextEnd),
  ).marks;
}

export function safeTextHref(value?: string) {
  const href = value?.trim() ?? "";
  return /^(https?:|mailto:|tel:)/i.test(href) ? href : "";
}
