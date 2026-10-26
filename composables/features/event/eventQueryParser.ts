/**
 * Парсер URL-параметров страницы событий.
 *
 * Назначение: превратить сырые `route.query` в типизированные
 * `initialQuery` / `initialFilters` для useEventsFlow / `#api`.
 * Дефолт `limit` задаёт страница через layout (`getEventPageLimit`), не парсер.
 */
import { EventFormat, GameSystem, SessionType } from '#openApi/enums';
import type { TEventsIndexQuery } from '#api/events';

const GAME_SYSTEM_SET = new Set<string>(GameSystem);
const FORMAT_SET = new Set<string>(EventFormat);
const SESSION_TYPE_SET = new Set<string>(SessionType);

/** Допустимые limit = columns × 6 (1/2/3/4/5 col). */
const ALLOWED_LIMITS = new Set([6, 12, 18, 24, 30]);

function parsePositiveInt(input: unknown): number | undefined {
  if (input === undefined || input === null || input === '') return undefined;
  const n = Number(input);
  if (!Number.isInteger(n) || n < 1) return undefined;
  return n;
}

function parseEnumValue<T extends string>(input: unknown, allowed: Set<string>): T | undefined {
  if (input === undefined || input === null || input === '') return undefined;
  const value = String(input);
  if (!allowed.has(value)) return undefined;
  return value as T;
}

export type TEventUrlFilters = Partial<Pick<TEventsIndexQuery, 'gameSystem' | 'format' | 'sessionType'>>;

export type TParsedEventUrl = {
  initialQuery: {
    page: number;
    /** Из URL, если валиден; иначе undefined — страница подставит layout-limit. */
    limit?: number;
  };
  initialFilters: TEventUrlFilters;
};

export type TBuildEventQueryInput = {
  page: number;
  filters: TEventUrlFilters;
  isInfinite: boolean;
};

/** Нормализованный query для navigateTo (без limit — он от viewport). */
export type TEventRouteQuery = Record<string, string | number>;

/**
 * Разбирает и валидирует query-параметры страницы событий.
 * `page` по умолчанию 1; `limit` только из whitelist (6/12/18/24/30).
 */
export function parseQueryFromRoute(query: Record<string, unknown>): TParsedEventUrl {
  const page = parsePositiveInt(query.page) ?? 1;
  const rawLimit = parsePositiveInt(query.limit);
  const limit = rawLimit !== undefined && ALLOWED_LIMITS.has(rawLimit) ? rawLimit : undefined;

  const gameSystem = parseEnumValue<NonNullable<TEventsIndexQuery['gameSystem']>>(query.gameSystem, GAME_SYSTEM_SET);
  const format = parseEnumValue<NonNullable<TEventsIndexQuery['format']>>(query.format, FORMAT_SET);
  const sessionType = parseEnumValue<NonNullable<TEventsIndexQuery['sessionType']>>(query.sessionType, SESSION_TYPE_SET);

  return {
    initialQuery: {
      page,
      ...(limit !== undefined ? { limit } : {}),
    },
    initialFilters: {
      ...(gameSystem !== undefined && { gameSystem }),
      ...(format !== undefined && { format }),
      ...(sessionType !== undefined && { sessionType }),
    },
  };
}

/**
 * Собирает query для адресной строки.
 * `limit` не пишем (viewport); `page` — только вне infinite и если ≠ 1.
 */
export function buildQueryForRoute(input: TBuildEventQueryInput): TEventRouteQuery {
  const { page, filters, isInfinite } = input;

  return {
    ...(!isInfinite && page !== 1 ? { page } : {}),
    ...(filters.gameSystem ? { gameSystem: filters.gameSystem } : {}),
    ...(filters.format ? { format: filters.format } : {}),
    ...(filters.sessionType ? { sessionType: filters.sessionType } : {}),
  };
}

function normalizeQueryValue(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) {
    const first = value[0];
    if (first === undefined || first === null || first === '') return undefined;
    return String(first);
  }
  return String(value);
}

/**
 * Сравнивает query без учёта порядка ключей и типа (число vs строка).
 * Игнорирует устаревший `limit` в URL.
 */
export function isSameQuery(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)].filter((k) => k !== 'limit'));

  for (const key of keys) {
    if (normalizeQueryValue(a[key]) !== normalizeQueryValue(b[key])) return false;
  }

  return true;
}
