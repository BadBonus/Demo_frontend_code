import { EventFormat, GameSystem, SessionType } from '#openApi/enums';
import type { TagConfig } from '@/components/globals/SearchFilterInput/types';
import type { EVENTS } from '#openApi/types';

type TEventsSearchFilter = EVENTS['INDEX']['GET']['query'];

interface IEventSearchTagConfig extends TagConfig {
  key: keyof TEventsSearchFilter;
}

const gameSystemBadgeColor = 'border-2 border-black';

export const EVENT_SEARCH_TAGS = [
  { key: 'gameSystem', label: 'Игровая система', badgeColor: gameSystemBadgeColor },
  { key: 'format', label: 'Формат' },
  { key: 'sessionType', label: 'Тип сессии' },
] satisfies IEventSearchTagConfig[];

export const EVENT_SEARCH_VALUES: Record<string, readonly string[]> = {
  gameSystem: GameSystem,
  format: Object.values(EventFormat),
  sessionType: Object.values(SessionType),
};
