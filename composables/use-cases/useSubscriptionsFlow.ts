import { createSubscriptionsActions } from '#api/subscriptions';
import useNotifyError from '@/composables/useNotifyError';
import { sanitizeNulls } from '~/utils/transformers/nullToUndefined';
import { getErrorMessage } from '~/utils/get-error-message';

type TSubscriptionsActions = ReturnType<typeof createSubscriptionsActions>;

export default function useSubscriptionsFlow(actions: TSubscriptionsActions = createSubscriptionsActions(useNuxtApp().$api)) {
  const {
    getMySubscriptionsAction,
    getOrganizerSubscribersAction,
    subscribeOrganizerAction,
    unsubscribeOrganizerAction,
    getMyEventFavoritesAction,
    addEventFavoriteAction,
    removeEventFavoriteAction,
  } = actions;
  const { notifyError } = useNotifyError();

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const getMySubscriptions = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      return sanitizeNulls(await getMySubscriptionsAction());
    } catch (err) {
      error.value = getErrorMessage(err, 'Ошибка получения подписок');
      notifyError(err, 'Ошибка получения подписок');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getOrganizerSubscribers = async (organizerId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      return sanitizeNulls(await getOrganizerSubscribersAction(organizerId));
    } catch (err) {
      error.value = getErrorMessage(err, 'Ошибка получения подписчиков организатора');
      notifyError(err, 'Ошибка получения подписчиков организатора');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const subscribeOrganizer = async (organizerId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await subscribeOrganizerAction(organizerId);
    } catch (err) {
      error.value = getErrorMessage(err, 'Ошибка подписки на организатора');
      notifyError(err, 'Ошибка подписки на организатора');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const unsubscribeOrganizer = async (organizerId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await unsubscribeOrganizerAction(organizerId);
    } catch (err) {
      error.value = getErrorMessage(err, 'Ошибка отписки от организатора');
      notifyError(err, 'Ошибка отписки от организатора');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleOrganizerSubscription = async (organizerId: string, isSubscribed: boolean) => {
    if (isSubscribed) {
      await unsubscribeOrganizer(organizerId);
      return;
    }

    await subscribeOrganizer(organizerId);
  };

  const getMyEventFavorites = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      return sanitizeNulls(await getMyEventFavoritesAction());
    } catch (err) {
      error.value = getErrorMessage(err, 'Ошибка получения избранных событий');
      notifyError(err, 'Ошибка получения избранных событий');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getFetchStatus = (err: unknown): number | undefined => {
    if (err !== null && typeof err === 'object' && 'statusCode' in err) {
      const code = (err as { statusCode: unknown }).statusCode;
      return typeof code === 'number' ? code : undefined;
    }
    return undefined;
  };

  const addEventFavorite = async (eventId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await addEventFavoriteAction(eventId);
    } catch (err) {
      // Уже в избранном — считаем успехом для toggle
      if (getFetchStatus(err) === 409) return;
      error.value = getErrorMessage(err, 'Ошибка добавления в избранное');
      notifyError(err, 'Ошибка добавления в избранное');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const removeEventFavorite = async (eventId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      await removeEventFavoriteAction(eventId);
    } catch (err) {
      // Уже снято — считаем успехом для toggle
      if (getFetchStatus(err) === 404) return;
      error.value = getErrorMessage(err, 'Ошибка удаления из избранного');
      notifyError(err, 'Ошибка удаления из избранного');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleEventFavorite = async (eventId: string, isFavorite: boolean) => {
    if (isFavorite) {
      await removeEventFavorite(eventId);
      return;
    }

    await addEventFavorite(eventId);
  };

  return {
    getMySubscriptions,
    getOrganizerSubscribers,
    subscribeOrganizer,
    unsubscribeOrganizer,
    toggleOrganizerSubscription,
    getMyEventFavorites,
    addEventFavorite,
    removeEventFavorite,
    toggleEventFavorite,
    isLoading,
    error,
  };
}
