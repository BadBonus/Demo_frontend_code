import type { EventFormat, GameGenres, GameSystem, SessionType } from '#openApi/enums';
import type { TEventsSlugRes } from '#api/events';
import { ESocLinks } from '#consts/socLinks';
import { ERoles } from '#consts/roles';
import { ESkillGameMaster, skillItems, type TSkillItem } from '@/shared/skills';
import type { CountryCodeLower } from '@/shared/types/countryCodes';
import { mapEventListItemToEventCard } from '@/components/features/Event/mappers';
import type { TEventDetailMaterial, TEventDetailOnlineLink, TEventDetailView } from './detail.types';

type TEventDetailDto = DeepNullToUndefined<TEventsSlugRes>;
type TEventDetailOrg = TEventDetailDto['org'];
type TEventRatings = TEventDetailOrg['ratings'];
type TEventVenue = NonNullable<TEventDetailDto['venue']>;

const RATING_BY_SKILL_ID: Record<ESkillGameMaster, keyof TEventRatings> = {
  [ESkillGameMaster.CREATIVITY]: 'CREATIVITY',
  [ESkillGameMaster.STORYTELLING]: 'STORYTELLING',
  [ESkillGameMaster.PLAYER_EDUCATION]: 'PLAYER_EDUCATION',
  [ESkillGameMaster.THEATRICALISE]: 'THEATRICALISE',
};

const mapSkills = (ratings: TEventRatings): TSkillItem[] =>
  skillItems[ERoles.gamemaster].map((item) => ({
    ...item,
    rating: ratings[RATING_BY_SKILL_ID[item.id as ESkillGameMaster]] ?? 0,
  }));

const pickSocUrl = (soclinks: TEventDetailOrg['soclinks'], key: ESocLinks): string | undefined => {
  if (!soclinks || typeof soclinks !== 'object') return undefined;
  const raw = soclinks as Record<string, unknown>;
  const value = raw[key] ?? raw[key.toLowerCase()];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const mapOnlineLinks = (venue: TEventVenue | undefined): TEventDetailOnlineLink[] | undefined => {
  if (!venue || venue.type !== 'ONLINE') return undefined;

  const links = venue.links
    .map((link) => {
      const url = link.url?.trim();
      if (!url) return null;
      return {
        label: link.label?.trim() || link.platform,
        url,
      };
    })
    .filter((link): link is TEventDetailOnlineLink => link !== null);

  return links.length ? links : undefined;
};

const mapMaterials = (materials: TEventDetailDto['materials']): TEventDetailMaterial[] =>
  (materials ?? []).map((material) => {
    if (material.type === 'FILE') {
      return {
        id: material.id,
        type: 'FILE',
        title: material.title,
        originalName: material.originalName,
        href: material.url,
        sizeBytes: material.sizeBytes,
        mimeType: material.mimeType,
      };
    }

    return {
      id: material.id,
      type: 'NOTE',
      title: material.title,
      body: material.body,
    };
  });

export function mapEventDetailToProps(event: TEventDetailDto): TEventDetailView {
  const { org } = event;
  const venue = event.venue;
  const isOffline = venue?.type === 'OFFLINE';

  return {
    orgId: org.id,
    isSubscribed: org.isSubscribed,
    id: event.id,
    isFavorite: Boolean(event.isFavorite),
    name: event.name,
    slug: event.slug,
    preview: event.preview,
    gameSystem: event.gameSystem as GameSystem,
    format: event.format as EventFormat,
    sessionType: event.sessionType as SessionType,
    ageLimit: event.ageLimit,
    genres: (event.genres ?? []) as GameGenres[],
    description: event.description,
    synopsis: event.synopsis,
    address: isOffline ? venue?.address : undefined,
    lat: isOffline ? venue?.lat : undefined,
    lng: isOffline ? venue?.lng : undefined,
    mapUrl: isOffline ? venue?.mapUrl : undefined,
    onlineLinks: mapOnlineLinks(venue),
    materials: mapMaterials(event.materials),
    master: {
      nickname: org.nickname,
      avatar: org.avatar,
      slug: org.slug,
      gamesCount: org.gamesCount,
      description: org.description,
      countryCode: org.country.isoCode.toLowerCase() as CountryCodeLower,
      discordUrl: pickSocUrl(org.soclinks, ESocLinks.DISCORD),
      telegramUrl: pickSocUrl(org.soclinks, ESocLinks.TELEGRAM),
      skills: mapSkills(org.ratings),
    },
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    maxUsers: event.maxUsers ?? event.minUsers,
    currentCountOfPlayers: 0,
    costValue: event.costValue,
    currency: event.costCurrency ?? 'BYN',
    similar: (event.similar ?? []).map((item) => mapEventListItemToEventCard(item)),
    showLocation: event.showLocation,
    showMaterials: event.showMaterials,
  };
}
