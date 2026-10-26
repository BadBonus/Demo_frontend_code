import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export const MAX_SLOT_MARKERS = 12;
export const MAX_VISIBLE_GENRES = 3;

/** Нормализованные слоты карточки: total / occupied / left. */
export function useEventSlots(maxUsers: MaybeRefOrGetter<number | string>, currentCountOfPlayers: MaybeRefOrGetter<number>) {
  const totalSlots = computed(() => Math.max(Number(toValue(maxUsers)) || 0, 0));
  const occupiedSlots = computed(() => Math.min(Math.max(toValue(currentCountOfPlayers), 0), totalSlots.value));
  const slotsLeft = computed(() => totalSlots.value - occupiedSlots.value);

  return { totalSlots, occupiedSlots, slotsLeft };
}
