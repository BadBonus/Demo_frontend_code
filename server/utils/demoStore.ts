import { AUTH_COOKIE_TOKEN_NAME, AUTH_COOKIE_OPTIONS } from '#consts/auth.constants';
import type { H3Event } from 'h3';
import { getCookie, setCookie, deleteCookie, getHeader, createError } from 'h3';

export type TDemoUser = {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
  password: string;
};

type TSession = {
  refreshToken: string;
  accessToken: string;
  userId: string;
};

const users = new Map<string, TDemoUser>();
const sessions = new Map<string, TSession>();
const favoriteEventIds = new Set<string>();
const subscribedOrganizerIds = new Set<string>();

const DEMO_USER: TDemoUser = {
  id: 'user-demo-1',
  email: 'demo@nastolka.local',
  nickname: 'DemoPlayer',
  avatar: null,
  password: 'demo1234',
};

users.set(DEMO_USER.email.toLowerCase(), DEMO_USER);

function randomToken(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export function getDemoCredentials() {
  return { email: DEMO_USER.email, password: DEMO_USER.password };
}

export function findUserByEmail(email: string) {
  return users.get(email.toLowerCase()) ?? null;
}

export function createUser(input: { email: string; password: string; nickname: string }) {
  const key = input.email.toLowerCase();
  if (users.has(key)) {
    throw createError({ statusCode: 409, statusMessage: 'User already exists', data: { statusCode: 409, message: 'Email уже занят' } });
  }
  const user: TDemoUser = {
    id: randomToken('user'),
    email: input.email,
    nickname: input.nickname,
    avatar: null,
    password: input.password,
  };
  users.set(key, user);
  return user;
}

export function publicUser(user: TDemoUser) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    avatar: user.avatar,
  };
}

export function issueSession(event: H3Event, user: TDemoUser) {
  const accessToken = randomToken('access');
  const refreshToken = randomToken('refresh');
  sessions.set(refreshToken, { refreshToken, accessToken, userId: user.id });
  setCookie(event, AUTH_COOKIE_TOKEN_NAME, refreshToken, AUTH_COOKIE_OPTIONS);
  return { accessToken, user: publicUser(user) };
}

export function clearDemoSession(event: H3Event) {
  const refresh = getCookie(event, AUTH_COOKIE_TOKEN_NAME);
  if (refresh) sessions.delete(refresh);
  deleteCookie(event, AUTH_COOKIE_TOKEN_NAME);
}

export function refreshFromCookie(event: H3Event) {
  const refresh = getCookie(event, AUTH_COOKIE_TOKEN_NAME);
  if (!refresh) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { statusCode: 401, message: 'Нет refresh-токена' } });
  }
  const session = sessions.get(refresh);
  if (!session) {
    deleteCookie(event, AUTH_COOKIE_TOKEN_NAME);
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { statusCode: 401, message: 'Сессия истекла' } });
  }
  const user = [...users.values()].find((u) => u.id === session.userId);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { statusCode: 401, message: 'Пользователь не найден' } });
  }
  sessions.delete(refresh);
  return issueSession(event, user);
}

export function getUserFromAuthHeader(event: H3Event): TDemoUser | null {
  const header = getHeader(event, 'authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  if (!token) return null;
  const session = [...sessions.values()].find((s) => s.accessToken === token);
  if (!session) return null;
  return [...users.values()].find((u) => u.id === session.userId) ?? null;
}

export function requireUser(event: H3Event) {
  const user = getUserFromAuthHeader(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { statusCode: 401, message: 'Требуется авторизация' } });
  }
  return user;
}

export function isEventFavorite(eventId: string) {
  return favoriteEventIds.has(eventId);
}

export function toggleEventFavorite(eventId: string, add: boolean) {
  if (add) favoriteEventIds.add(eventId);
  else favoriteEventIds.delete(eventId);
}

export function listFavoriteEventIds() {
  return [...favoriteEventIds];
}

export function isOrganizerSubscribed(organizerId: string) {
  return subscribedOrganizerIds.has(organizerId);
}

export function toggleOrganizerSubscription(organizerId: string, add: boolean) {
  if (add) subscribedOrganizerIds.add(organizerId);
  else subscribedOrganizerIds.delete(organizerId);
}

export function listSubscribedOrganizerIds() {
  return [...subscribedOrganizerIds];
}
