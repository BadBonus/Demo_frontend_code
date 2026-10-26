/**
 * Оркестратор страницы Events: layout, каталог, URL-sync, favor, clear filters.
 * Все use* вызываются синхронно до первого await (правило Nuxt composables).
 */
import { useSSRWidth, watchDebounced } from '@vueuse/core';
import useEventsFlow from '@/composables/use-cases/useEventsFlow';
import useSubscriptionsFlow from '@/composables/use-cases/useSubscriptionsFlow';
import useAuthBoundFavor from '@/composables/useAuthBoundFavor';
import { parseQueryFromRoute } from '@/composables/features/event/eventQueryParser';
import { EVENT_SSR_WIDTH_FALLBACK, getEventPageLimit, isEventInfiniteMode } from '@/composables/features/event/eventGridLayout';
import useEventLayout from '@/composables/features/event/useEventLayout';
import useEventQuerySync from '@/composables/features/event/useEventQuerySync';
import useEventFavor from '@/composables/features/event/useEventFavor';

export default async function useEventsCatalogPage() {
  const route = useRoute();
  const nuxtApp = useNuxtApp();
  const ssrWidth = useSSRWidth();
  const { loadCatalog } = useEventsFlow();
  const { toggleEventFavorite } = useSubscriptionsFlow();
  const { isInfinite, pageLimit } = useEventLayout();

  const reloadItems = {
    current: undefined as undefined | (() => Promise<unknown>),
  };
  const { showFavor } = useAuthBoundFavor(async () => {
    await reloadItems.current?.();
  });

  const parsed = parseQueryFromRoute(route.query);

  // useBreakpoints до mounted отдаёт SSR-ширину: при клиентском переходе берём реальную,
  // иначе первый запрос уйдёт с limit по SSR-ширине и после mount повторится.
  const initialWidth = import.meta.client && !nuxtApp.isHydrating ? window.innerWidth : (ssrWidth ?? EVENT_SSR_WIDTH_FALLBACK);

  const { items, getItems, getNextPage, meta, page, limit, filters, applyQuery, canNext, loading } = await loadCatalog({
    initialQuery: {
      page: isEventInfiniteMode(initialWidth) ? 1 : parsed.initialQuery.page,
      limit: getEventPageLimit(initialWidth),
    },
    initialFilters: parsed.initialFilters,
  });

  const { onFavorClick } = useEventFavor({
    items,
    showFavor,
    toggleEventFavorite,
    setReload: (reload) => {
      reloadItems.current = reload;
    },
    reload: () => getItems({ page: page.value, limit: limit.value }),
  });

  useEventQuerySync({
    route,
    page,
    filters,
    isInfinite,
    applyQuery,
  });

  // Debounce: защита от спама API при быстром ресайзе через брейкпоинты.
  watchDebounced(
    pageLimit,
    async (nextLimit, prevLimit) => {
      if (prevLimit === undefined || nextLimit === prevLimit) return;
      if (limit.value === nextLimit) return;
      await getItems({ page: 1, limit: nextLimit });
    },
    { debounce: 400 },
  );

  const hasActiveFilters = computed(() => Boolean(filters.value.gameSystem || filters.value.format || filters.value.sessionType));

  /** Полный сброс фильтров (не resetFilters: тот откатывает к initialFilters со входа). */
  const clearFilters = () => applyQuery({ filters: {}, page: 1 });

  const loadMore = () => {
    if (!isInfinite.value || !canNext.value || loading.value) return;
    return getNextPage();
  };

  const goToPage = (nextPage: number) => getItems({ page: nextPage, limit: limit.value });

  return {
    items,
    filters,
    meta,
    page,
    limit,
    loading,
    isInfinite,
    canNext,
    showFavor,
    hasActiveFilters,
    applyQuery,
    clearFilters,
    getItems,
    goToPage,
    loadMore,
    onFavorClick,
  };
}
