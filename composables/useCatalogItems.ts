import type { TypePaginationMeta, TypeBaseQueryDto } from '#openApi';
import { watchDebounced } from '@vueuse/core';
import { computed, ref, shallowRef, type Ref, type ComputedRef } from 'vue';

export type TResWithMeta<TData> = {
  data: TData;
  meta: TypePaginationMeta;
};

export type TCatalogQuery<TFilters extends object = Record<string, never>> = TypeBaseQueryDto & {
  sortBy?: TSortByField;
} & TFilters;

export type TCatalogFiltersOf<TQuery> = Omit<NonNullable<TQuery>, keyof TypeBaseQueryDto | 'sortBy'>;

export type TUseCatalogItemsOptions<TItem, TFilters extends object = Record<string, never>> = {
  key: string;
  fetch: (query: TCatalogQuery<TFilters>) => Promise<TResWithMeta<TItem[]>>;
  initialQuery?: Partial<TypeBaseQueryDto & { sortBy: TSortByField }>;
  initialFilters?: Partial<TFilters>;
  debounceMs?: number;
  mode?: 'replace' | 'append';
};

export type TSortByField = 'createdAt' | 'eventsCount' | 'reviewsCount';

export type TCatalogApplyQuery<TFilters extends object = Record<string, never>> = {
  q?: string;
  sortOrder?: TypeBaseQueryDto['sortOrder'];
  sortBy?: TSortByField;
  /** Полная замена filters (не merge). */
  filters?: Partial<TFilters>;
  page?: number;
};

export type TCatalogItemsReturn<TItem, TFilters extends object = Record<string, never>> = {
  items: Ref<TItem[]>;
  meta: Ref<TypePaginationMeta>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  q: Ref<string>;
  page: Ref<number>;
  limit: Ref<number>;
  sortOrder: Ref<TypeBaseQueryDto['sortOrder']>;
  sortBy: Ref<TSortByField | undefined>;
  filters: Ref<Partial<TFilters>>;
  canNext: ComputedRef<boolean>;
  canPrev: ComputedRef<boolean>;
  getItems: (params?: Partial<TypeBaseQueryDto>) => Promise<TResWithMeta<TItem[]>>;
  getNextPage: () => Promise<TResWithMeta<TItem[]>>;
  getPrevPage: () => Promise<TResWithMeta<TItem[]>>;
  setFilters: (next: Partial<TFilters>) => Promise<TResWithMeta<TItem[]>>;
  applyQuery: (next: TCatalogApplyQuery<TFilters>) => Promise<TResWithMeta<TItem[]>>;
  resetMeta: () => void;
  resetFilters: () => Promise<TResWithMeta<TItem[]>>;
  refresh: () => Promise<TResWithMeta<TItem[]>>;
};

type TItemsMerge = 'replace' | 'append';

const createDefaultMeta = (): TypePaginationMeta => ({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
});

/**
 * Универсальный state-компосабл каталога: пагинация, поиск, фильтры.
 * HTTP не вызывает — принимает `fetch` (его передаёт use-case через actions).
 * Первая загрузка идёт через `useAsyncData` (SSR + payload); повторные — через `refresh`.
 */
export default async function useCatalogItems<TItem, TFilters extends object = Record<string, never>>(
  options: TUseCatalogItemsOptions<TItem, TFilters>,
): Promise<TCatalogItemsReturn<TItem, TFilters>> {
  const mode = options.mode ?? 'replace';
  const debounceMs = options.debounceMs ?? 500;

  const items = shallowRef<TItem[]>([]);
  const meta = ref<TypePaginationMeta>(createDefaultMeta());
  const loading = ref(false);
  const error = ref<unknown>(null);

  const q = ref(options.initialQuery?.q ?? '');
  const page = ref(options.initialQuery?.page ?? 1);
  const limit = ref(options.initialQuery?.limit ?? 20);
  const sortOrder = ref<TypeBaseQueryDto['sortOrder']>(options.initialQuery?.sortOrder ?? 'desc');
  const sortBy = ref<TSortByField | undefined>(options.initialQuery?.sortBy as TSortByField | undefined);
  const filters = ref<Partial<TFilters>>({ ...(options.initialFilters ?? {}) }) as Ref<Partial<TFilters>>;

  const canNext = computed(() => meta.value.hasNext);
  const canPrev = computed(() => meta.value.hasPrev);

  let requestId = 0;
  let lastLoadedQ: string | undefined;
  let paginationInFlight = false;

  const buildQuery = (): TCatalogQuery<TFilters> => {
    const nextQ = q.value;

    return {
      ...filters.value,
      page: page.value,
      limit: limit.value,
      sortOrder: sortOrder.value,
      ...(sortBy.value ? { sortBy: sortBy.value } : {}),
      ...(nextQ ? { q: nextQ } : {}),
    } as TCatalogQuery<TFilters>;
  };

  const applyBaseParams = (params?: Partial<TypeBaseQueryDto>) => {
    if (!params) return;
    if (params.page !== undefined) page.value = params.page;
    if (params.limit !== undefined) limit.value = params.limit;
    if (params.sortOrder !== undefined) sortOrder.value = params.sortOrder;
    if ((params as any).sortBy !== undefined) sortBy.value = (params as any).sortBy;
    if (params.q !== undefined) q.value = params.q;
  };

  const applyResult = (result: TResWithMeta<TItem[]>, merge: TItemsMerge) => {
    // #region agent log
    if (import.meta.client)
      fetch('http://127.0.0.1:7574/ingest/bca4b5da-5477-43d2-8cf6-08066925cce8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f01bbd' },
        body: JSON.stringify({
          sessionId: 'f01bbd',
          runId: 'run1',
          hypothesisId: 'D,E',
          location: 'useCatalogItems.ts:applyResult',
          message: 'applyResult',
          data: {
            key: options.key,
            merge,
            prevLen: items.value.length,
            dataLen: result.data.length,
            meta: result.meta,
            reqPage: page.value,
            reqLimit: limit.value,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    // #endregion
    items.value = merge === 'append' ? [...items.value, ...result.data] : result.data;
    meta.value = { ...result.meta };
    page.value = result.meta.page;
    limit.value = result.meta.limit;
    lastLoadedQ = q.value;
  };

  const {
    data,
    refresh: refreshAsyncData,
    error: asyncError,
    status,
  } = await useAsyncData(options.key, () => options.fetch(buildQuery()), {
    dedupe: 'cancel',
  });

  if (data.value) {
    applyResult(data.value, 'replace');
  } else if (asyncError.value) {
    error.value = asyncError.value;
  }

  loading.value = status.value === 'pending';

  const load = async (merge: TItemsMerge): Promise<TResWithMeta<TItem[]>> => {
    // #region agent log
    if (import.meta.client)
      fetch('http://127.0.0.1:7574/ingest/bca4b5da-5477-43d2-8cf6-08066925cce8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f01bbd' },
        body: JSON.stringify({
          sessionId: 'f01bbd',
          runId: 'run1',
          hypothesisId: 'E',
          location: 'useCatalogItems.ts:load',
          message: 'load start',
          data: {
            key: options.key,
            merge,
            page: page.value,
            limit: limit.value,
            filters: filters.value,
            stack: new Error().stack?.split('\n').slice(2, 6).join(' | '),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    // #endregion
    const currentId = ++requestId;
    loading.value = true;
    error.value = null;

    try {
      try {
        await refreshAsyncData();
      } catch (err) {
        if (!asyncError.value) {
          throw err;
        }
      }

      if (asyncError.value) {
        throw asyncError.value;
      }

      const result = data.value;
      if (!result) {
        throw new Error('Catalog fetch returned empty data');
      }

      if (currentId !== requestId) {
        return result;
      }

      applyResult(result, merge);
      return result;
    } catch (err) {
      if (currentId !== requestId) {
        throw err;
      }

      error.value = err;
      if (merge === 'replace') {
        items.value = [];
        meta.value = createDefaultMeta();
      } else {
        page.value = meta.value.page;
      }
      throw err;
    } finally {
      if (currentId === requestId) {
        loading.value = false;
      }
    }
  };

  const getItems = async (params?: Partial<TypeBaseQueryDto>): Promise<TResWithMeta<TItem[]>> => {
    applyBaseParams(params);
    return load('replace');
  };

  const getNextPage = async (): Promise<TResWithMeta<TItem[]>> => {
    // #region agent log
    if (import.meta.client)
      fetch('http://127.0.0.1:7574/ingest/bca4b5da-5477-43d2-8cf6-08066925cce8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f01bbd' },
        body: JSON.stringify({
          sessionId: 'f01bbd',
          runId: 'run1',
          hypothesisId: 'D',
          location: 'useCatalogItems.ts:getNextPage',
          message: 'getNextPage',
          data: { hasNext: meta.value.hasNext, paginationInFlight, page: page.value, itemsLen: items.value.length },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    // #endregion
    if (!meta.value.hasNext || paginationInFlight) {
      return { data: items.value, meta: meta.value };
    }
    paginationInFlight = true;
    page.value += 1;
    try {
      return await load(mode === 'append' ? 'append' : 'replace');
    } finally {
      paginationInFlight = false;
    }
  };

  const getPrevPage = async (): Promise<TResWithMeta<TItem[]>> => {
    if (!meta.value.hasPrev || paginationInFlight) {
      return { data: items.value, meta: meta.value };
    }
    paginationInFlight = true;
    page.value -= 1;
    try {
      return await load('replace');
    } finally {
      paginationInFlight = false;
    }
  };

  const setFilters = async (next: Partial<TFilters>): Promise<TResWithMeta<TItem[]>> => {
    filters.value = { ...filters.value, ...next };
    page.value = 1;
    return load('replace');
  };

  const applyQuery = async (next: TCatalogApplyQuery<TFilters>): Promise<TResWithMeta<TItem[]>> => {
    if (next.filters !== undefined) {
      filters.value = { ...next.filters };
    }
    if (next.q !== undefined) {
      q.value = next.q;
    }
    if (next.sortOrder !== undefined) {
      sortOrder.value = next.sortOrder;
    }
    if (next.sortBy !== undefined) {
      sortBy.value = next.sortBy;
    }
    page.value = next.page ?? 1;

    return load('replace');
  };

  const resetMeta = () => {
    meta.value = createDefaultMeta();
    page.value = 1;
  };

  const resetFilters = () => {
    q.value = '';
    sortOrder.value = 'desc';
    sortBy.value = undefined;
    filters.value = { ...(options.initialFilters ?? {}) };
    page.value = 1;
    return load('replace');
  };

  const refresh = () => load('replace');

  watchDebounced(
    q,
    () => {
      if (q.value === lastLoadedQ) return;
      page.value = 1;
      void load('replace').catch(() => {});
    },
    { debounce: debounceMs },
  );

  return {
    items,
    meta,
    loading,
    error,
    q,
    page,
    limit,
    sortOrder,
    sortBy,
    filters,
    canNext,
    canPrev,
    getItems,
    getNextPage,
    getPrevPage,
    setFilters,
    applyQuery,
    resetMeta,
    resetFilters,
    refresh,
  };
}
