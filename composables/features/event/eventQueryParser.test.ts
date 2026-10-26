import { describe, expect, it } from 'vitest';
import { buildQueryForRoute, isSameQuery, parseQueryFromRoute } from './eventQueryParser';

describe('buildQueryForRoute', () => {
  it('не пишет page в infinite и на первой странице', () => {
    expect(
      buildQueryForRoute({
        page: 1,
        filters: {},
        isInfinite: false,
      }),
    ).toEqual({});

    expect(
      buildQueryForRoute({
        page: 3,
        filters: {},
        isInfinite: true,
      }),
    ).toEqual({});
  });

  it('пишет page вне infinite при page ≠ 1', () => {
    expect(
      buildQueryForRoute({
        page: 2,
        filters: {},
        isInfinite: false,
      }),
    ).toEqual({ page: 2 });
  });

  it('включает только заданные фильтры', () => {
    expect(
      buildQueryForRoute({
        page: 1,
        filters: {
          gameSystem: 'DUNGEONS_AND_DRAGONS_5E',
          format: 'ONLINE',
        },
        isInfinite: false,
      }),
    ).toEqual({
      gameSystem: 'DUNGEONS_AND_DRAGONS_5E',
      format: 'ONLINE',
    });
  });
});

describe('isSameQuery', () => {
  it('считает одинаковыми число и строку', () => {
    expect(isSameQuery({ page: 2 }, { page: '2' })).toBe(true);
  });

  it('игнорирует порядок ключей и limit', () => {
    expect(isSameQuery({ format: 'online', page: 2, limit: 24 }, { page: '2', format: 'online' })).toBe(true);
  });

  it('различает разный набор ключей', () => {
    expect(isSameQuery({ page: 2 }, { page: 2, format: 'online' })).toBe(false);
  });
});

describe('parseQueryFromRoute', () => {
  it('парсит page и whitelist limit', () => {
    const parsed = parseQueryFromRoute({ page: '3', limit: '18' });
    expect(parsed.initialQuery.page).toBe(3);
    expect(parsed.initialQuery.limit).toBe(18);
  });

  it('игнорирует limit вне whitelist', () => {
    const parsed = parseQueryFromRoute({ limit: '7' });
    expect(parsed.initialQuery.limit).toBeUndefined();
  });
});
