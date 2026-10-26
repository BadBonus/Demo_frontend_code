import type { EventFormat, GameGenres, GameSystem, SessionType } from '#openApi/enums';
import type { TEventCard } from '@/components/features/Event/mappers';
import type { TSkillItem } from '@/shared/skills';
import type { CountryCodeLower } from '@/shared/types/countryCodes';

export interface TEventDetailOnlineLink {
  label: string;
  url: string;
}

export interface TEventDetailMaterialFile {
  id: string;
  type: 'FILE';
  title: string;
  originalName: string;
  href: string;
  sizeBytes: number;
  mimeType: string;
}

export interface TEventDetailMaterialNote {
  id: string;
  type: 'NOTE';
  title: string;
  body: string;
}

export type TEventDetailMaterial = TEventDetailMaterialFile | TEventDetailMaterialNote;

export interface TEventDetailMaster {
  nickname: string;
  avatar?: string | null;
  slug?: string;
  gamesCount: number;
  discordUrl?: string;
  telegramUrl?: string;
  description?: string;
  countryCode?: CountryCodeLower;
  skills?: TSkillItem[];
}

export interface TEventDetailProps {
  id: string;
  name: string;
  slug: string;
  isFavorite: boolean;
  preview?: string | null;
  gameSystem: GameSystem;
  format: EventFormat;
  sessionType: SessionType;
  ageLimit?: number | null;
  genres: GameGenres[];
  /** Общее ожидание сессии (буквица). */
  description?: string;
  /** Лора-затравка («О приключении»). */
  synopsis?: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  mapUrl?: string | null;
  onlineLinks?: TEventDetailOnlineLink[];
  materials: TEventDetailMaterial[];
  master: TEventDetailMaster;
  startsAt: string;
  endsAt: string;
  maxUsers: number;
  currentCountOfPlayers: number;
  costValue?: number | null;
  currency: string;
  similar: TEventCard[];
  /** Показ блока места незаписанным (пока UI игнорирует — блок всегда виден). */
  showLocation: boolean;
  /** Показ блока материалов (пока UI игнорирует — блок всегда виден). */
  showMaterials: boolean;
}

/** Props экрана + поля оркестрации подписки. */
export interface TEventDetailView extends TEventDetailProps {
  orgId: string;
  isSubscribed: boolean;
}
