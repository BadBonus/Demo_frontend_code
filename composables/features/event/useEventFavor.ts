/**
 * Избранное событий на каталоге: showFavor после персонализации + optimistic toggle.
 * useAuthBoundFavor / useSubscriptionsFlow вызываются снаружи до первого await.
 */
import type { ComputedRef, Ref } from 'vue';
import type { TEventCard } from '@/components/features/Event/mappers';

type TUseEventFavorOptions = {
  items: Ref<TEventCard[]>;
  showFavor: Ref<boolean> | ComputedRef<boolean>;
  toggleEventFavorite: (eventId: string, isFavorite: boolean) => Promise<void>;
  setReload: (reload: () => Promise<unknown>) => void;
  reload: () => Promise<unknown>;
};

export default function useEventFavor(options: TUseEventFavorOptions) {
  const { items, showFavor, toggleEventFavorite, setReload, reload } = options;

  setReload(reload);

  const onFavorClick = async (eventId: string) => {
    if (!eventId) return;

    const card = items.value.find((item) => item.id === eventId);
    if (!card) return;

    const prevIsFavorite = Boolean(card.isFavorite);
    const nextIsFavorite = !prevIsFavorite;

    items.value = items.value.map((item) => (item.id === eventId ? { ...item, isFavorite: nextIsFavorite } : item));

    try {
      await toggleEventFavorite(eventId, prevIsFavorite);
    } catch {
      items.value = items.value.map((item) => (item.id === eventId ? { ...item, isFavorite: prevIsFavorite } : item));
    }
  };

  return {
    showFavor,
    onFavorClick,
  };
}
