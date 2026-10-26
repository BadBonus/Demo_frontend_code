/**
 * DTO-фикстуры под OpenAPI (EventResponseDto / EventDetailResponseDto).
 * Используются Nitro mock handlers — не view-props из Detail/mock.ts.
 */

const PREVIEW = '/images/bg_decors/png/gm_background_2.png';
const startsAt = '2026-10-24T16:00:00.000Z';
const endsAt = '2026-10-24T20:00:00.000Z';

const orgList = {
  nickname: 'Вран',
  slug: 'vran-gm',
  avatar: null as string | null,
};

export type TEventListFixture = {
  id: string;
  name: string;
  slug: string;
  preview: string | null;
  gameSystem: string;
  format: 'ONLINE' | 'OFFLINE';
  sessionType: 'ONE_SHOT' | 'CAMPAIGN';
  isBeginnerFriendly: boolean;
  addInfo?: string;
  costValue?: number;
  startsAt: string;
  maxUsers: number;
  ageLimit?: number;
  endsAt: string;
  genres: string[];
  minUsers: number;
  isFavorite: boolean;
  org: typeof orgList;
  currentCountOfPlayers: number;
  orgId: string;
};

export const DEMO_ORG_ID = 'org-vran';

export const eventListFixtures: TEventListFixture[] = [
  {
    id: 'mock-event-curse-of-strahd',
    name: 'Проклятие Страда: ночь в Баровии',
    slug: 'curse-of-strahd-barovia-night',
    preview: PREVIEW,
    gameSystem: 'DUNGEONS_AND_DRAGONS_5E',
    format: 'ONLINE',
    sessionType: 'ONE_SHOT',
    isBeginnerFriendly: true,
    costValue: 100,
    startsAt,
    maxUsers: 5,
    ageLimit: 18,
    endsAt,
    genres: ['FANTASY', 'HORROR'],
    minUsers: 3,
    isFavorite: false,
    org: orgList,
    currentCountOfPlayers: 3,
    orgId: DEMO_ORG_ID,
  },
  {
    id: 'mock-event-cyber-run',
    name: 'Ночной пробег по Night City',
    slug: 'cyber-night-city-run',
    preview: PREVIEW,
    gameSystem: 'CYBERPUNK_RED',
    format: 'ONLINE',
    sessionType: 'ONE_SHOT',
    isBeginnerFriendly: false,
    costValue: 80,
    startsAt: '2026-11-02T18:00:00.000Z',
    maxUsers: 4,
    ageLimit: 16,
    endsAt: '2026-11-02T22:00:00.000Z',
    genres: ['CYBERPUNK', 'SCIFI'],
    minUsers: 2,
    isFavorite: false,
    org: orgList,
    currentCountOfPlayers: 1,
    orgId: DEMO_ORG_ID,
  },
  {
    id: 'mock-event-pathfinder-tavern',
    name: 'Таверна на перекрёстке',
    slug: 'pathfinder-crossroads-tavern',
    preview: PREVIEW,
    gameSystem: 'PATHFINDER_2E',
    format: 'OFFLINE',
    sessionType: 'CAMPAIGN',
    isBeginnerFriendly: true,
    costValue: 50,
    startsAt: '2026-11-08T14:00:00.000Z',
    maxUsers: 6,
    ageLimit: 14,
    endsAt: '2026-11-08T18:00:00.000Z',
    genres: ['FANTASY'],
    minUsers: 3,
    isFavorite: false,
    org: orgList,
    currentCountOfPlayers: 4,
    orgId: DEMO_ORG_ID,
  },
  {
    id: 'mock-event-cthulhu',
    name: 'Шёпот из Архива',
    slug: 'cthulhu-archive-whisper',
    preview: PREVIEW,
    gameSystem: 'CALL_OF_CTHULHU',
    format: 'ONLINE',
    sessionType: 'ONE_SHOT',
    isBeginnerFriendly: true,
    costValue: 0,
    startsAt: '2026-11-15T17:00:00.000Z',
    maxUsers: 5,
    ageLimit: 18,
    endsAt: '2026-11-15T21:00:00.000Z',
    genres: ['HORROR', 'HISTORICAL'],
    minUsers: 2,
    isFavorite: false,
    org: orgList,
    currentCountOfPlayers: 2,
    orgId: DEMO_ORG_ID,
  },
  {
    id: 'mock-event-blades',
    name: 'Экипаж: тень Досакки',
    slug: 'blades-doskvol-shadow',
    preview: PREVIEW,
    gameSystem: 'BLADES_IN_THE_DARK',
    format: 'ONLINE',
    sessionType: 'CAMPAIGN',
    isBeginnerFriendly: false,
    costValue: 120,
    startsAt: '2026-11-20T19:00:00.000Z',
    maxUsers: 4,
    ageLimit: 18,
    endsAt: '2026-11-20T23:00:00.000Z',
    genres: ['FANTASY', 'OTHER'],
    minUsers: 3,
    isFavorite: false,
    org: orgList,
    currentCountOfPlayers: 3,
    orgId: DEMO_ORG_ID,
  },
  {
    id: 'mock-event-seminar',
    name: 'Мастерская: как вести one-shot',
    slug: 'gm-workshop-oneshot',
    preview: PREVIEW,
    gameSystem: 'GAME_MASTER_WORKSHOP',
    format: 'ONLINE',
    sessionType: 'ONE_SHOT',
    isBeginnerFriendly: true,
    costValue: 0,
    startsAt: '2026-11-25T16:00:00.000Z',
    maxUsers: 20,
    ageLimit: 16,
    endsAt: '2026-11-25T18:00:00.000Z',
    genres: ['OTHER'],
    minUsers: 1,
    isFavorite: false,
    org: orgList,
    currentCountOfPlayers: 8,
    orgId: DEMO_ORG_ID,
  },
];

export function buildEventDetailDto(listItem: TEventListFixture, isFavorite: boolean, isSubscribed: boolean) {
  const similar = eventListFixtures
    .filter((e) => e.id !== listItem.id)
    .slice(0, 3)
    .map((e) => toListDto(e, false));

  const isOffline = listItem.format === 'OFFLINE';

  return {
    id: listItem.id,
    slug: listItem.slug,
    orgId: listItem.orgId,
    name: listItem.name,
    description:
      'В ту ночь, когда луна скрылась за тучами, колокол пробил полночь. ' +
      'Путешественники оказываются там, где каждый шаг ведёт ближе к развязке.',
    synopsis: 'Короткий синопсис для демо-карточки события. Правила и сеттинг — на усмотрение мастера.',
    addInfo: listItem.addInfo ?? null,
    preview: listItem.preview,
    minUsers: listItem.minUsers,
    maxUsers: listItem.maxUsers,
    isBeginnerFriendly: listItem.isBeginnerFriendly,
    ageLimit: listItem.ageLimit ?? null,
    costValue: listItem.costValue ?? null,
    costCurrency: 'BYN' as const,
    format: listItem.format,
    sessionType: listItem.sessionType,
    venue: isOffline
      ? {
          type: 'OFFLINE' as const,
          address: 'Минск, ул. Примерная 1',
          lat: 53.9,
          lng: 27.5667,
          mapUrl: 'https://www.openstreetmap.org/#map=15/53.9000/27.5667',
        }
      : {
          type: 'ONLINE' as const,
          links: [
            { platform: 'DISCORD', label: 'Discord', url: 'https://discord.gg/example' },
            { platform: 'ROLL20', label: 'Roll20', url: 'https://app.roll20.net/campaigns/details/example' },
          ],
        },
    showLocation: true,
    showMaterials: true,
    status: 'ACTIVE' as const,
    startsAt: listItem.startsAt,
    endsAt: listItem.endsAt,
    genres: listItem.genres,
    platforms: ['DISCORD', 'ROLL20'],
    gameSystem: listItem.gameSystem,
    org: {
      id: listItem.orgId,
      nickname: listItem.org.nickname,
      slug: listItem.org.slug,
      avatar: listItem.org.avatar,
      description: 'Мастер демо-проекта. Ведёт атмосферные one-shot и короткие кампании.',
      soclinks: {
        DISCORD: 'https://discord.gg/example',
        TELEGRAM: 'https://t.me/example',
      },
      country: { geonameId: 630336, isoCode: 'BY', name: 'Беларусь' },
      preferredSystems: [listItem.gameSystem],
      preferredGenres: listItem.genres,
      gamesCount: 42,
      ratings: {
        CREATIVITY: 4.5,
        STORYTELLING: 4.8,
        PLAYER_EDUCATION: 4.2,
        THEATRICALISE: 4.0,
      },
      isSubscribed,
    },
    isFavorite,
    materials: [
      {
        id: 'mat-file-chars',
        type: 'FILE' as const,
        title: 'Шаблон персонажа',
        sortOrder: 0,
        isPublic: true,
        originalName: 'character_school.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: 48_128,
        url: '#',
      },
      {
        id: 'mat-note-prep',
        type: 'NOTE' as const,
        title: 'Что взять с собой',
        sortOrder: 1,
        isPublic: true,
        body: 'Куб, карандаш, настроение. Для онлайна — гарнитура и стабильный интернет.',
      },
    ],
    similar,
  };
}

export function toListDto(item: TEventListFixture, isFavorite: boolean) {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    preview: item.preview,
    gameSystem: item.gameSystem,
    format: item.format,
    sessionType: item.sessionType,
    isBeginnerFriendly: item.isBeginnerFriendly,
    addInfo: item.addInfo,
    costValue: item.costValue,
    startsAt: item.startsAt,
    maxUsers: item.maxUsers,
    ageLimit: item.ageLimit,
    endsAt: item.endsAt,
    genres: item.genres,
    minUsers: item.minUsers,
    isFavorite,
    org: item.org,
    currentCountOfPlayers: item.currentCountOfPlayers,
  };
}
