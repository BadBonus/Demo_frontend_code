import type { GameSystem, EventFormat, SessionType, GameGenres } from '~/shared/open-api';

export type TEventCardOrg = {
  nickname: string;
  avatar?: string | null;
};

export type TEventCardProps = {
  name: string;
  gameSystem: GameSystem;
  format: EventFormat;
  sessionType: SessionType;
  startsAt: string;
  maxUsers: number;
  genres: GameGenres[];
  org: TEventCardOrg;
  addInfo?: string | null;
  currentCountOfPlayers: number;
  costValue?: number | null;
  currency?: string;
  ageLimit?: number | null;
  preview?: string | null;
  link?: string;
  showFavor?: boolean;
  isFavorite?: boolean;
};
