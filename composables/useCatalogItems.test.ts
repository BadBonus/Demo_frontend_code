import { effectScope } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TypePaginationMeta } from '#openApi';
import useCatalogItems, { type TResWithMeta } from './useCatalogItems';

type TItem = { id: string };
type TFilters = { city?: string; page?: number };

const DEBOUNCE_MS = 30;

const makeMeta = (page: number, overrides: Partial<TypePaginationMeta> = {}): TypePaginationMeta => ({
  page,
  limit: 20,
  total: 60,
  totalPages: 3,
  hasNext: page < 3,
  hasPrev: page > 1,
  ...overrides,
});

const pageResult = (page: number, ids: string[], meta?: Partial<TypePaginationMeta>): TResWithMeta<TItem[]> => ({
  data: ids.map((id) => ({ id })),
  meta: makeMeta(page, meta),
});

const stops: Array<() => void> = [];

afterEach(() => {
  for (const stop of stops) stop();
  stops.length = 0;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function createCatalog(
  fetch: (query: Record<string, unknown>) => Promise<TResWithMeta<TItem[]>>,
  options: {
    mode?: 'replace' | 'append';
    initialFilters?: Partial<TFilters>;
    initialQuery?: { page?: number; limit?: number; q?: string };
  } = {},
) {
  const scope = effectScope(true);
  const catalog = await scope.run(() =>
    useCatalogItems<TItem, TFilters>({
      key: 'test-catalog',
      fetch: fetch as never,
      debounceMs: DEBOUNCE_MS,
      mode: options.mode,
      initialFilters: options.initialFilters,
      initialQuery: options.initialQuery,
    }),
  );

  if (!catalog) {
    throw new Error('effectScope.run returned undefined');
  }

  stops.push(() => scope.stop());
  return catalog;
}

async function flushDebounce() {
  await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 5);
}

describe('useCatalogItems', () => {
  it('первый fetch идёт из initialQuery без getItems', async () => {
    const fetch = vi.fn().mockResolvedValue(pageResult(2, ['b'], { limit: 10 }));

    const catalog = await createCatalog(fetch, { initialQuery: { page: 2, limit: 10 } });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 10,
      }),
    );
    expect(catalog.items.value.map((item) => item.id)).toEqual(['b']);
    expect(catalog.page.value).toBe(2);
    expect(catalog.limit.value).toBe(10);
  });

  it('в режиме replace заменяет items при загрузке page > 1', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockResolvedValueOnce(pageResult(2, ['b']));

    const catalog = await createCatalog(fetch);

    await catalog.getItems({ page: 2 });

    expect(catalog.items.value.map((item) => item.id)).toEqual(['b']);
  });

  it('в режиме append добавляет только getNextPage, а refresh заменяет текущую страницу', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockResolvedValueOnce(pageResult(2, ['b']))
      .mockResolvedValueOnce(pageResult(2, ['b-refresh']));

    const catalog = await createCatalog(fetch, { mode: 'append' });

    await catalog.getNextPage();
    expect(catalog.items.value.map((item) => item.id)).toEqual(['a', 'b']);

    await catalog.refresh();
    expect(catalog.items.value.map((item) => item.id)).toEqual(['b-refresh']);
  });

  it('getPrevPage всегда заменяет список, даже в mode: append', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockResolvedValueOnce(pageResult(2, ['b']))
      .mockResolvedValueOnce(pageResult(3, ['c']))
      .mockResolvedValueOnce(pageResult(2, ['b-prev']));

    const catalog = await createCatalog(fetch, { mode: 'append' });

    await catalog.getNextPage();
    await catalog.getNextPage();
    await catalog.getPrevPage();

    expect(catalog.items.value.map((item) => item.id)).toEqual(['b-prev']);
  });

  it('ошибка следующей страницы в append не очищает уже загруженные items', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockResolvedValueOnce(pageResult(2, ['b']))
      .mockRejectedValueOnce(new Error('page 3 failed'));

    const catalog = await createCatalog(fetch, { mode: 'append' });

    await catalog.getNextPage();

    await expect(catalog.getNextPage()).rejects.toThrow('page 3 failed');

    expect(catalog.items.value.map((item) => item.id)).toEqual(['a', 'b']);
    expect(catalog.meta.value.page).toBe(2);
    expect(catalog.page.value).toBe(2);
    expect(catalog.error.value).toBeInstanceOf(Error);
    expect(catalog.loading.value).toBe(false);
  });

  it('applyQuery без смены q делает один fetch и не запускает второй из watch', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockResolvedValueOnce(pageResult(1, ['filtered']));

    const catalog = await createCatalog(fetch);

    await catalog.applyQuery({ filters: { city: 'msk' } });
    await flushDebounce();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(catalog.items.value.map((item) => item.id)).toEqual(['filtered']);
  });

  it('applyQuery со сменой q делает один fetch без повторного запроса из watchDebounced', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockResolvedValueOnce(pageResult(1, ['orc']));

    const catalog = await createCatalog(fetch);

    await catalog.applyQuery({ q: 'orc' });
    await flushDebounce();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(catalog.q.value).toBe('orc');
  });

  it('после applyQuery пользовательское изменение q снова дебаунсится и грузит page 1', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockResolvedValueOnce(pageResult(1, ['orc']))
      .mockResolvedValueOnce(pageResult(2, ['orc-p2']))
      .mockResolvedValueOnce(pageResult(1, ['elf']));

    const catalog = await createCatalog(fetch);

    await catalog.applyQuery({ q: 'orc' });
    await catalog.getItems({ page: 2 });

    catalog.q.value = 'elf';
    await flushDebounce();

    expect(fetch).toHaveBeenCalledTimes(4);
    expect(fetch.mock.calls[3]?.[0]).toMatchObject({ q: 'elf', page: 1 });
    expect(catalog.page.value).toBe(1);
  });

  it('несколько applyQuery подряд не порождают extra fetch из watch', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockResolvedValueOnce(pageResult(1, ['one']))
      .mockResolvedValueOnce(pageResult(1, ['two']));

    const catalog = await createCatalog(fetch);

    const first = catalog.applyQuery({ q: 'one' });
    const second = catalog.applyQuery({ q: 'two' });
    await Promise.allSettled([first, second]);
    await flushDebounce();

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(catalog.q.value).toBe('two');
    expect(catalog.items.value.map((item) => item.id)).toEqual(['two']);
  });

  it('resetFilters сбрасывает состояние и всегда инициирует загрузку', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockResolvedValueOnce(pageResult(1, ['filtered']))
      .mockResolvedValueOnce(pageResult(1, ['reset']));

    const catalog = await createCatalog(fetch, { initialFilters: { city: 'spb' } });

    await catalog.applyQuery({ q: '', filters: { city: 'msk' } });
    expect(catalog.filters.value).toEqual({ city: 'msk' });

    await catalog.resetFilters();

    expect(catalog.q.value).toBe('');
    expect(catalog.sortOrder.value).toBe('desc');
    expect(catalog.filters.value).toEqual({ city: 'spb' });
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(catalog.items.value.map((item) => item.id)).toEqual(['reset']);
  });

  it('watch на q сбрасывает page в 1 и не оставляет unhandled rejection', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockResolvedValueOnce(pageResult(2, ['b']))
      .mockRejectedValueOnce(new Error('search failed'));

    const catalog = await createCatalog(fetch);

    await catalog.getItems({ page: 2 });

    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => {
      unhandled.push(reason);
    };
    process.on('unhandledRejection', onUnhandled);

    catalog.q.value = 'boom';
    await flushDebounce();
    await Promise.resolve();

    process.off('unhandledRejection', onUnhandled);

    expect(catalog.page.value).toBe(1);
    expect(catalog.error.value).toBeInstanceOf(Error);
    expect(unhandled).toEqual([]);
  });

  it('базовые поля query побеждают одноимённые ключи в filters', async () => {
    const fetch = vi.fn().mockResolvedValue(pageResult(1, ['a']));
    await createCatalog(fetch, { initialFilters: { city: 'msk', page: 99 } });

    expect(fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        city: 'msk',
      }),
    );
  });

  it('повторный getNextPage во время in-flight не меняет page и не стартует второй fetch', async () => {
    let resolvePage2: ((value: TResWithMeta<TItem[]>) => void) | undefined;
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockImplementationOnce(
        () =>
          new Promise<TResWithMeta<TItem[]>>((resolve) => {
            resolvePage2 = resolve;
          }),
      );

    const catalog = await createCatalog(fetch);

    const first = catalog.getNextPage();
    const second = catalog.getNextPage();

    expect(catalog.page.value).toBe(2);
    expect(fetch).toHaveBeenCalledTimes(2);

    const ignored = await second;
    expect(ignored.data.map((item) => item.id)).toEqual(['a']);
    expect(catalog.page.value).toBe(2);

    resolvePage2?.(pageResult(2, ['b']));
    await first;

    expect(catalog.items.value.map((item) => item.id)).toEqual(['b']);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('getPrevPage во время in-flight getNextPage игнорируется', async () => {
    let resolvePage2: ((value: TResWithMeta<TItem[]>) => void) | undefined;
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockImplementationOnce(
        () =>
          new Promise<TResWithMeta<TItem[]>>((resolve) => {
            resolvePage2 = resolve;
          }),
      );

    const catalog = await createCatalog(fetch);

    const next = catalog.getNextPage();
    await catalog.getPrevPage();

    expect(catalog.page.value).toBe(2);
    expect(fetch).toHaveBeenCalledTimes(2);

    resolvePage2?.(pageResult(2, ['b']));
    await next;

    expect(catalog.items.value.map((item) => item.id)).toEqual(['b']);
    expect(catalog.page.value).toBe(2);
  });

  it('после ошибки applyQuery watcher может повторно загрузить тот же q', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(pageResult(1, ['a']))
      .mockRejectedValueOnce(new Error('search failed'))
      .mockResolvedValueOnce(pageResult(1, ['orc-retry']));

    const catalog = await createCatalog(fetch);

    await expect(catalog.applyQuery({ q: 'orc' })).rejects.toThrow('search failed');
    await flushDebounce();

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[2]?.[0]).toMatchObject({ q: 'orc', page: 1 });
    expect(catalog.items.value.map((item) => item.id)).toEqual(['orc-retry']);
  });
});
