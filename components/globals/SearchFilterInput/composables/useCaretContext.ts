import { onMounted, onUnmounted, ref, toValue, type MaybeRefOrGetter } from 'vue';
import { getCaretContext, type CaretContext } from '../searchFilterParser';

/**
 * Обработчик изменения контекста каретки.
 *
 * @param context Новый контекст каретки.
 * @param force Признак принудительного пересчёта (игнорировать дедупликацию).
 */
export type ContextChangeHandler = (context: CaretContext, force: boolean) => void;

/**
 * Отслеживает позицию каретки в инпуте и вычисляет для неё контекст поиска.
 *
 * @param inputRef Ссылка на нативный input.
 * @param modelValue Текущее значение модели.
 * @param onContextChange Колбэк, вызываемый при пересчёте контекста.
 * @returns Объект с реактивным контекстом и методами работы с кареткой.
 */
export function useCaretContext(
  inputRef: MaybeRefOrGetter<HTMLInputElement | null>,
  modelValue: MaybeRefOrGetter<string>,
  onContextChange?: ContextChangeHandler,
) {
  const currentContext = ref<CaretContext>({ type: 'empty' });

  /** Проверяет, находится ли инпут в фокусе. */
  function isFocused(): boolean {
    const el = toValue(inputRef);
    return !!el && document.activeElement === el;
  }

  /**
   * Возвращает текущую позицию каретки.
   * Если инпут недоступен — длину значения модели.
   */
  function getCaretPosition(): number {
    const el = toValue(inputRef);
    return el?.selectionStart ?? toValue(modelValue).length;
  }

  /**
   * Пересчитывает контекст по текущей каретке.
   * Возвращает null, если инпут не в фокусе (аналогично старому поведению).
   *
   * @param options Опции пересчёта (`force` — принудительный вызов колбэка).
   * @returns Новый контекст или null, если инпут не в фокусе.
   */
  function sync(options: { force?: boolean } = {}): CaretContext | null {
    const el = toValue(inputRef);
    if (!el || document.activeElement !== el) return null;

    const value = el.value;
    const caretPos = el.selectionStart ?? 0;
    const context = getCaretContext(value, caretPos);

    currentContext.value = context;
    onContextChange?.(context, options.force ?? false);

    return context;
  }

  /** Сбрасывает контекст в пустое состояние. */
  function reset() {
    currentContext.value = { type: 'empty' };
  }

  /** Обработчик события `selectionchange`: пересчитывает контекст. */
  function handleSelectionChange() {
    // Программные setSelectionRange тоже сюда попадут — это ок,
    // schedule() дедуплицирует по ключу.
    sync();
  }

  onMounted(() => document.addEventListener('selectionchange', handleSelectionChange));
  onUnmounted(() => document.removeEventListener('selectionchange', handleSelectionChange));

  return {
    currentContext,
    getCaretPosition,
    sync,
    reset,
  };
}
