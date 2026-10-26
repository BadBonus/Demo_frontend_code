import { createEventsActions } from '#api/events';
import type { TEventsIndexQuery, TEventsSlugRes } from '#api/events';
import useCatalogItems, { type TCatalogFiltersOf } from '@/composables/useCatalogItems';
import useNotifyError from '@/composables/useNotifyError';
import { mapEventListItemToEventCard, type TEventCard } from '@/components/features/Event/mappers';
import { sanitizeNulls } from '~/utils/transformers/nullToUndefined';
import { getErrorMessage } from '~/utils/get-error-message';

type TEventsActions = ReturnType<typeof createEventsActions>;
type TEventFilters = Pick<TCatalogFiltersOf<TEventsIndexQuery>, 'gameSystem' | 'format' | 'sessionType'>;

type TLoadCatalogOptions = {
  initialQuery?: Partial<{ page: number; limit: number }>;
  initialFilters?: Partial<TEventFilters>;
};

export type TEventDetail = DeepNullToUndefined<TEventsSlugRes>;

function toEventsApiQuery(query: { page?: number; limit?: number } & Partial<TEventFilters>): TEventsIndexQuery {
  return {
    ...(query.page !== undefined ? { page: query.page } : {}),
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
    ...(query.gameSystem !== undefined ? { gameSystem: query.gameSystem } : {}),
    ...(query.format !== undefined ? { format: query.format } : {}),
    ...(query.sessionType !== undefined ? { sessionType: query.sessionType } : {}),
  };
}

export default function useEventsFlow(actions: TEventsActions = createEventsActions(useNuxtApp().$api)) {
  const { getEventsAction, getEventBySlugAction } = actions;
  const { notifyError } = useNotifyError();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const loadCatalog = (options?: TLoadCatalogOptions) =>
    useCatalogItems<TEventCard, TEventFilters>({
      key: 'events-catalog',
      // append: getNextPage копит ленту; getItems/applyQuery по-прежнему replace
      mode: 'append',
      initialQuery: options?.initialQuery,
      initialFilters: options?.initialFilters,
      fetch: async (query) => {
        const data = await getEventsAction(toEventsApiQuery(query));
        const sanitized = sanitizeNulls(data);

        return {
          ...sanitized,
          data: sanitized.data.map(mapEventListItemToEventCard),
        };
      },
    });

  const getBySlug = async (slug: string): Promise<TEventDetail> => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await getEventBySlugAction(slug);
      return sanitizeNulls(data);
    } catch (err) {
      error.value = getErrorMessage(err, 'Ошибка получения события');
      notifyError(err, 'Ошибка получения события');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    loadCatalog,
    getBySlug,
    isLoading,
    error,
  };
}
