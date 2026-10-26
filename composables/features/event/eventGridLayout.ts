/** Число строк на одну «страницу» / порцию подгрузки. */
export const EVENT_ROWS_PER_PAGE = 6;

/** Ниже этого viewport — бесконечная лента. */
export const EVENT_INFINITE_MAX_WIDTH = 1024;

/** С этой ширины — 2 колонки (в зоне infinite). */
export const EVENT_TWO_COLUMNS_MIN_WIDTH = 768;

/**
 * Фолбэк для SSR / до client-measure (limit, infinite).
 * Совпадает с фолбэком provideSSRWidth в plugins/SSRWidthShade.ts (без cookie viewport-width).
 * Колонки сетки — CSS media queries в EventCatalogList, не этот фолбэк.
 */
export const EVENT_SSR_WIDTH_FALLBACK = 1024;

export type TEventColumnCount = 1 | 2 | 3 | 4 | 5;

function normalizeWidth(width: number): number {
  if (!Number.isFinite(width) || width <= 0) return EVENT_SSR_WIDTH_FALLBACK;
  return width;
}

/**
 * Колонки сетки Events по ширине viewport.
 * <768 → 1 | 768–1023 → 2 | 1024–1439 → 3 | 1440–1919 → 4 | ≥1920 → 5
 */
export function getEventColumnCount(width: number): TEventColumnCount {
  const w = normalizeWidth(width);
  if (w < EVENT_TWO_COLUMNS_MIN_WIDTH) return 1;
  if (w < EVENT_INFINITE_MAX_WIDTH) return 2;
  if (w < 1440) return 3;
  if (w < 1920) return 4;
  return 5;
}

/** `limit = columns × rowsPerPage` */
export function getEventPageLimit(width: number): number {
  return getEventColumnCount(width) * EVENT_ROWS_PER_PAGE;
}

export function isEventInfiniteMode(width: number): boolean {
  return normalizeWidth(width) < EVENT_INFINITE_MAX_WIDTH;
}
