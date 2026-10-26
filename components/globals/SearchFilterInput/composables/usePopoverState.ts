import { ref, toValue, type MaybeRefOrGetter } from 'vue';

/**
 * Управляет состоянием попапа с подсказками.
 *
 * @param containerRef Контейнер, выход фокуса за пределы которого закрывает попап.
 * @returns Объект с реактивным состоянием и методами открытия/закрытия.
 */
export function usePopoverState(containerRef: MaybeRefOrGetter<HTMLElement | null>) {
  const isOpen = ref(false);

  /** Открывает попап. */
  function open() {
    isOpen.value = true;
  }

  /** Закрывает попап. */
  function close() {
    isOpen.value = false;
  }

  /**
   * Закрывает попап только если фокус ушёл за пределы контейнера.
   *
   * @param event Событие потери фокуса.
   */
  function handleFocusOut(event: FocusEvent) {
    const related = event.relatedTarget;
    const container = toValue(containerRef);
    if (related instanceof Node && container?.contains(related)) return;
    close();
  }

  return { isOpen, open, close, handleFocusOut };
}
