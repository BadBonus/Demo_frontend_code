import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

/**
 * Управляет индексом активной подсказки в списке.
 * Индекс всегда ограничен `min(items.length, maxSuggestions) - 1`.
 * `-1` означает «ничего не активно».
 *
 * @param items Список подсказок (может быть ref, getter или значением).
 * @param maxSuggestions Максимальное число отображаемых подсказок.
 * @param isEnabled Включён ли режим навигации по подсказкам.
 * @returns Объект с реактивным индексом и методами навигации/сброса.
 */
export function useActiveSuggestion(
  items: MaybeRefOrGetter<readonly unknown[]>,
  maxSuggestions: MaybeRefOrGetter<number>,
  isEnabled: MaybeRefOrGetter<boolean>,
) {
  const activeIndex = ref(-1);

  const visibleCount = computed(() => Math.min(toValue(items).length, toValue(maxSuggestions)));

  /** Сбрасывает активный индекс в -1 (ничего не выбрано). */
  function reset() {
    activeIndex.value = -1;
  }

  /**
   * Устанавливает активный индекс, если он попадает в видимый диапазон.
   *
   * @param index Новый индекс подсказки.
   */
  function setActive(index: number) {
    if (index < 0 || index >= visibleCount.value) return;
    activeIndex.value = index;
  }

  /**
   * Циклически смещает активный индекс на заданное значение.
   * При выключенном режиме или пустом списке сбрасывает выбор.
   *
   * @param delta Смещение (+1 — вперёд, -1 — назад).
   */
  function move(delta: number) {
    const count = visibleCount.value;

    if (!toValue(isEnabled) || count === 0) {
      reset();
      return;
    }

    if (activeIndex.value === -1) {
      activeIndex.value = delta > 0 ? 0 : count - 1;
      return;
    }

    // Циклим по кругу
    activeIndex.value = (activeIndex.value + delta + count) % count;
  }

  /** Переходит к следующей подсказке (с цикличностью). */
  const moveNext = () => move(1);

  /** Переходит к предыдущей подсказке (с цикличностью). */
  const movePrev = () => move(-1);

  // Меняются подсказки или контекст → сбрасываем выбор
  watch([() => toValue(items), () => toValue(isEnabled)], reset);

  // Список сузился → активный индекс может выпасть за границы
  watch(visibleCount, (count) => {
    if (activeIndex.value >= count) reset();
  });

  return {
    activeIndex,
    visibleCount,
    setActive,
    moveNext,
    movePrev,
    reset,
  };
}
