import { toValue, type MaybeRefOrGetter } from 'vue';
import type { CaretContext, CaretContextType } from '../searchFilterParser';
import type { Token } from '../types';

/** Полезная нагрузка события запроса подсказок. */
export interface FetchSuggestionsPayload {
  /** Тип контекста каретки. */
  contextType: CaretContextType;
  /** Ключ тега (если есть). */
  tagKey?: string;
  /** Поисковый запрос (если есть). */
  queryWord?: string;
  /** Активный токен (если каретка внутри токена). */
  activeToken?: Token;
  /** Признак негации фильтра. */
  isNegated?: boolean;
}

/**
 * Планирует запрос подсказок с дебаунсом и дедупликацией по контексту.
 *
 * @param emitFetch Колбэк, вызываемый с собранной нагрузкой запроса.
 * @param debounceMs Задержка дебаунса в миллисекундах.
 * @returns Объект с методами планирования и отмены запроса.
 */
export function useSuggestionsFetch(emitFetch: (payload: FetchSuggestionsPayload) => void, debounceMs: MaybeRefOrGetter<number>) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastKey = '';

  /**
   * Строит ключ контекста для дедупликации запросов.
   *
   * @param context Контекст каретки.
   */
  function buildKey(context: CaretContext): string {
    return [context.type, context.tagKey ?? '', context.queryWord ?? '', context.isNegated ? 1 : 0].join('|');
  }

  /**
   * Преобразует контекст каретки в нагрузку для события запроса.
   *
   * @param context Контекст каретки.
   */
  function buildPayload(context: CaretContext): FetchSuggestionsPayload {
    return {
      contextType: context.type,
      tagKey: context.tagKey,
      queryWord: context.queryWord,
      activeToken: context.activeToken,
      isNegated: context.isNegated,
    };
  }

  /** Отменяет запланированный запрос. */
  function cancel() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  /**
   * Планирует запрос подсказок с дебаунсом.
   * Повторный вызов с тем же контекстом игнорируется, если `force` не задан.
   *
   * @param context Контекст каретки для запроса.
   * @param force Принудительно выполнить запрос, игнорируя дедупликацию.
   */
  function schedule(context: CaretContext, force = false) {
    const key = buildKey(context);
    if (!force && key === lastKey) return;
    lastKey = key;

    cancel();
    timer = setTimeout(() => {
      timer = null;
      emitFetch(buildPayload(context));
    }, toValue(debounceMs));
  }

  /** Отменяет запрос и сбрасывает сохранённый ключ дедупликации. */
  function reset() {
    cancel();
    lastKey = '';
  }

  return { schedule, cancel, reset };
}
