import { nextTick, toValue, type MaybeRefOrGetter, type Ref } from 'vue';
import { insertEntity, insertTag, removeToken, toggleTokenNegation, type CaretContext } from '../searchFilterParser';

/** Опции composable useInputActions. */
export interface UseInputActionsOptions {
  /** Реактивное значение инпута. */
  modelValue: Ref<string>;
  /** Ссылка на нативный input. */
  inputRef: MaybeRefOrGetter<HTMLInputElement | null>;
  /** Текущий контекст каретки. */
  currentContext: Ref<CaretContext>;
  /** Вызывается после того, как каретка восстановлена в DOM. */
  onAfterRestore: () => void;
}

/**
 * Набор действий над строкой поиска (вставка тега/сущности, удаление,
 * смена негации) с последующим восстановлением позиции каретки.
 *
 * @param options Ссылки на модель, инпут, контекст и колбэк восстановления.
 * @returns Объект с действиями над вводом.
 */
export function useInputActions(options: UseInputActionsOptions) {
  const { modelValue, inputRef, currentContext, onAfterRestore } = options;

  /** Возвращает текущую позицию каретки. */
  function getCaretPosition(): number {
    return toValue(inputRef)?.selectionStart ?? modelValue.value.length;
  }

  /**
   * Восстанавливает каретку в DOM после обновления value и вызывает колбэк.
   *
   * @param caretPos Желаемая позиция каретки.
   */
  async function restoreCaretAndSync(caretPos: number) {
    await nextTick();

    const el = toValue(inputRef);
    if (!el) return;

    el.focus();
    const safe = Math.min(Math.max(caretPos, 0), el.value.length);
    el.setSelectionRange(safe, safe);

    onAfterRestore();
  }

  /**
   * Вставляет тег в текущую позицию каретки.
   *
   * @param tagKey Ключ тега (без двоеточия).
   */
  async function selectTag(tagKey: string) {
    const { newString, newCaretPos } = insertTag(modelValue.value, getCaretPosition(), tagKey);
    modelValue.value = newString;
    await restoreCaretAndSync(newCaretPos);
  }

  /**
   * Вставляет сущность с указанным тегом и восстанавливает каретку.
   * Если тег не передан — берётся из текущего контекста.
   *
   * @param entityValue Значение сущности.
   * @param tagKey Необязательный ключ тега.
   */
  async function selectEntity(entityValue: string, tagKey?: string) {
    const context = currentContext.value;
    const resolvedTagKey = tagKey ?? context.tagKey;

    const { newString, newCaretPos } = insertEntity(modelValue.value, getCaretPosition(), entityValue, {
      tagKey: resolvedTagKey,
      isNegated: context.isNegated ?? false,
    });
    modelValue.value = newString;
    await restoreCaretAndSync(newCaretPos);
  }

  /** Переключает негацию активного токена. */
  async function toggleNegation() {
    const context = currentContext.value;
    if (context.type !== 'on_token' || !context.activeToken) return;

    const { newString, newCaretPos } = toggleTokenNegation(modelValue.value, context.activeToken);
    modelValue.value = newString;
    await restoreCaretAndSync(newCaretPos);
  }

  /** Удаляет активный токен из строки поиска. */
  async function removeActiveToken() {
    const context = currentContext.value;
    if (context.type !== 'on_token' || !context.activeToken) return;

    const { newString, newCaretPos } = removeToken(modelValue.value, context.activeToken);
    modelValue.value = newString;
    await restoreCaretAndSync(newCaretPos);
  }

  return {
    getCaretPosition,
    selectTag,
    selectEntity,
    toggleNegation,
    removeActiveToken,
  };
}
