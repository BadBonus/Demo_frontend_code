import type { EventFormat, GameGenres, GameSystem, SessionType } from '#openApi/enums';
import type { TEventCardProps } from '@/components/globals/EventCard/index.types';
import type { TEventsIndexRes } from '#api/events';

type TEventListItem = DeepNullToUndefined<TEventsIndexRes['data'][number]>;

export type TEventCard = TEventCardProps & { id: string; slug: string };

export function mapEventListItemToEventCard(event: TEventListItem): TEventCard {
  // OpenAPI schema помечает enum-поля как Record<string, never> — сужаем через unknown.
  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    gameSystem: event.gameSystem as unknown as GameSystem,
    format: event.format as unknown as EventFormat,
    sessionType: event.sessionType as unknown as SessionType,
    startsAt: event.startsAt,
    maxUsers: event.maxUsers,
    genres: (event.genres ?? []) as unknown as GameGenres[],
    org: {
      nickname: event.org.nickname,
      avatar: event.org.avatar,
    },
    addInfo: event.addInfo,
    currentCountOfPlayers: event.currentCountOfPlayers,
    costValue: event.costValue,
    ageLimit: event.ageLimit,
    preview: event.preview,
    link: `/Events/${event.slug}`,
    isFavorite: Boolean(event.isFavorite),
  };
}
