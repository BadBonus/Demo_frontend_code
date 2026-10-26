/**
 * Точка входа фичи детальной страницы события.
 *
 * Страница `/Events/[slug]` вызывает эту функцию и рендерит результат.
 */
import type { TEventDetail } from '@/composables/use-cases/useEventsFlow';
import { mapEventDetailToProps } from '@/components/features/Event/Detail/mappers';
import type { TEventDetailView } from '@/components/features/Event/Detail/detail.types';

/**
 * Загружает событие по slug и нормализует данные под props экрана.
 *
 * @returns props деталки или `null`, если slug пустой / событие не найдено (404)
 */
export async function loadEventDetail(
  slug: string,
  getBySlug: (slug: string) => Promise<TEventDetail>,
): Promise<TEventDetailView | null> {
  const normalizedSlug = slug?.trim();
  if (!normalizedSlug) return null;

  try {
    const event = await getBySlug(normalizedSlug);
    return mapEventDetailToProps(event);
  } catch (err: unknown) {
    if (err !== null && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: unknown }).statusCode === 404) {
      return null;
    }
    throw err;
  }
}
