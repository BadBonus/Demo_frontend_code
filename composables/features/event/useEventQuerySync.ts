/**
 * Двусторонняя синхронизация state каталога Events ↔ route.query.
 * `limit` в URL не пишется (viewport); устаревший `?limit=` срезается без fetch.
 * `useRoute` вызывается снаружи до первого await и передаётся сюда.
 *
 * В infinite `page` в URL не участвует: watch не должен сбрасывать append-ленту
 * через applyQuery({ page: 1 }) при navigateTo / хвостах ?page=.
 */
import type { ComputedRef, Ref } from 'vue';
import type { LocationQuery, RouteLocationNormalizedLoaded } from 'vue-router';
import type { TCatalogApplyQuery } from '@/composables/useCatalogItems';
import {
  buildQueryForRoute,
  isSameQuery,
  parseQueryFromRoute,
  type TEventUrlFilters,
} from '@/composables/features/event/eventQueryParser';

type TUseEventQuerySyncOptions = {
  route: RouteLocationNormalizedLoaded;
  page: Ref<number>;
  filters: Ref<TEventUrlFilters>;
  isInfinite: ComputedRef<boolean> | Ref<boolean>;
  applyQuery: (next: TCatalogApplyQuery<TEventUrlFilters>) => Promise<unknown>;
};

function filtersKeyOf(filters: TEventUrlFilters): string {
  return JSON.stringify({
    gameSystem: filters.gameSystem ?? null,
    format: filters.format ?? null,
    sessionType: filters.sessionType ?? null,
  });
}

export default function useEventQuerySync(options: TUseEventQuerySyncOptions) {
  const { route, page, filters, isInfinite, applyQuery } = options;

  let isNavigating = false;

  // Срезаем устаревший ?limit= из адресной строки без повторного fetch.
  if (import.meta.client && route.query.limit !== undefined) {
    const { limit: _unusedLimit, ...restQuery } = route.query;
    isNavigating = true;
    void Promise.resolve(navigateTo({ query: restQuery }, { replace: true })).finally(() => {
      isNavigating = false;
    });
  }

  const filtersKey = computed(() => filtersKeyOf(filters.value));

  // state → URL. В infinite page в query не пишется — не слушаем page, иначе лишние navigateTo.
  watch(
    () => [isInfinite.value, isInfinite.value ? 0 : page.value, filtersKey.value] as const,
    async () => {
      if (isNavigating) return;

      const nextQuery = buildQueryForRoute({
        page: page.value,
        filters: filters.value,
        isInfinite: isInfinite.value,
      });

      if (isSameQuery(nextQuery, route.query as Record<string, unknown>)) return;

      isNavigating = true;
      try {
        await navigateTo({ query: nextQuery }, { replace: true });
      } finally {
        isNavigating = false;
      }
    },
    { flush: 'post' },
  );

  // URL → state
  watch(
    () => route.query,
    async (nextQuery: LocationQuery) => {
      if (isNavigating) return;

      const nextParsed = parseQueryFromRoute(nextQuery);
      const nextFilters = nextParsed.initialFilters;
      const nextFiltersKey = filtersKeyOf(nextFilters);

      if (isInfinite.value) {
        // Лента: из URL только фильтры. Игнор page — иначе applyQuery сбрасывает append.
        if (nextFiltersKey === filtersKey.value) return;

        isNavigating = true;
        try {
          await applyQuery({ filters: nextFilters, page: 1 });
        } finally {
          isNavigating = false;
        }
        return;
      }

      const nextPage = nextParsed.initialQuery.page;
      if (nextFiltersKey === filtersKey.value && nextPage === page.value) return;

      isNavigating = true;
      try {
        await applyQuery({
          filters: nextFilters,
          page: nextPage,
        });
      } finally {
        isNavigating = false;
      }
    },
    { flush: 'post' },
  );
}
