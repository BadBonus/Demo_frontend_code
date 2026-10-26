import type { EVENTS } from '#openApi';
import { EventFormat, GameSystem, SessionType } from '#openApi/enums';
import { ETokenTypes } from '@/components/globals/SearchFilterInput/types';
import { formatTagKey, parseSearchString } from '@/components/globals/SearchFilterInput/searchFilterParser';
import { resolveTagConfig } from '@/components/globals/SearchFilterInput/utils';
import { EVENT_SEARCH_TAGS } from './config';

type TEventsIndexQuery = EVENTS['INDEX']['GET']['query'];

export type TEventSearchParsed = {
  gameSystem?: TEventsIndexQuery['gameSystem'];
  format?: TEventsIndexQuery['format'];
  sessionType?: TEventsIndexQuery['sessionType'];
};

export type TEventFiltersForFormat = TEventSearchParsed;

const GAME_SYSTEM_SET = new Set<string>(GameSystem);
const FORMAT_SET = new Set<string>(EventFormat);
const SESSION_TYPE_SET = new Set<string>(SessionType);

const LABEL_BY_API_KEY = Object.fromEntries(EVENT_SEARCH_TAGS.map((t) => [t.key, t.label])) as Record<string, string>;

function resolveApiKey(tokenKey: string | undefined): string | undefined {
  if (!tokenKey) return undefined;
  return resolveTagConfig(tokenKey, EVENT_SEARCH_TAGS)?.key ?? tokenKey;
}

function formatFilterToken(apiKey: string, value: string): string {
  const label = LABEL_BY_API_KEY[apiKey] ?? apiKey;
  return `${formatTagKey(label)}:${escapeFilterValue(value)}`;
}

function escapeFilterValue(value: string): string {
  if (/[\s":,\\]/.test(value)) {
    return `"${value.replace(/(["\\])/g, '\\$1')}"`;
  }
  return value;
}

/**
 * Парсит строку SearchFilterInput в фильтры GET /events.
 * Text и невалидные значения игнорируются (API не поддерживает q).
 */
export function parseEventSearchString(input: string): TEventSearchParsed {
  const tokens = parseSearchString(input);
  let gameSystem: TEventsIndexQuery['gameSystem'] | undefined;
  let format: TEventsIndexQuery['format'] | undefined;
  let sessionType: TEventsIndexQuery['sessionType'] | undefined;

  for (const token of tokens) {
    if (token.type !== ETokenTypes.Filter) continue;

    const apiKey = resolveApiKey(token.key);
    const value = token.value ?? '';

    if (apiKey === 'gameSystem' && GAME_SYSTEM_SET.has(value)) {
      gameSystem = value as TEventsIndexQuery['gameSystem'];
      continue;
    }

    if (apiKey === 'format' && FORMAT_SET.has(value)) {
      format = value as TEventsIndexQuery['format'];
      continue;
    }

    if (apiKey === 'sessionType' && SESSION_TYPE_SET.has(value)) {
      sessionType = value as TEventsIndexQuery['sessionType'];
    }
  }

  return {
    ...(gameSystem !== undefined ? { gameSystem } : {}),
    ...(format !== undefined ? { format } : {}),
    ...(sessionType !== undefined ? { sessionType } : {}),
  };
}

/** Форматирует фильтры обратно в строку SearchFilterInput. */
export function formatEventSearchString(params: { filters?: TEventFiltersForFormat }): string {
  const parts: string[] = [];
  const filters = params.filters ?? {};

  if (filters.gameSystem) {
    parts.push(formatFilterToken('gameSystem', filters.gameSystem));
  }
  if (filters.format) {
    parts.push(formatFilterToken('format', filters.format));
  }
  if (filters.sessionType) {
    parts.push(formatFilterToken('sessionType', filters.sessionType));
  }

  return parts.join(' ');
}
