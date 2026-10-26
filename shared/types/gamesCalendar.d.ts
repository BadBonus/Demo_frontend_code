import type { PROFILE } from '#openApi';

type TProfileRes = PROFILE['ID']['GET']['res'];

export enum ECurrency {
  EUR = 'EUR',
  USD = 'USD',
  RUB = 'RUB',
  BYN = 'BYN',
}

export enum EStatusOfEvent {
  PREPARE = 'PREPARE',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export enum EStatusOfRequest {
  PENDING = 'PENDING',
  DECLINED = 'DECLINED',
  CONFIRM = 'CONFIRM',
  CANCELED = 'CANCELED',
}

export enum EKindOfRate {
  CREATIVITY = 'CREATIVITY',
  STORYTELLING = 'STORYTELLING',
  WIKIPEDIA_RULES = 'WIKIPEDIA_RULES',
  THEATRICALISE = 'THEATRICALISE',
}

export type TOrgRating = {
  name: EKindOfRate;
  value: number;
};

export type TOrg = {
  id: string;
  name: string;
  avatar: string;
  slug: string;
  rating: TOrgRating[];
};

export type TEventPlayer = Pick<TProfileRes, 'avatar' | 'nickname' | 'slug'>;

export type TEvent = {
  id: string;
  name: string;
  addInfo?: string;
  description?: string;
  maxUsers?: number;
  cost?: {
    value: number;
    currency: TGamesCalendarCurrency;
  };
  time: string;
  org: TGamesCalendarOrg;
  state: EStatesOfEvent;
  rates: TEventCommentRate[];
  timeStart: number;
  timeFinish: number;
  createdAt: Date;
  players: TEventPlayer[];
  comments: EventReview[];
};

export type EventReview = {
  id: string;
  userId: string;
  eventId: string;
  avatar: string;
  name: string;
  comment: string;
  uprate: EKindOfRate[];
  createdAt: Date;
};

export type TEventRequest = {
  id: string;
  idEvent: string;
  idUser: string;
  status: EStatusOfRequest;
  createdAt: Date;
  message?: string;
};
// interfaces
