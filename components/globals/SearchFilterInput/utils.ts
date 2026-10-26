import { formatUnderscoreToSpace } from '@/utils/transformers/formatUnderscoreToSpace';
import type { SuggestionItem, TagConfig } from './types';

/** Резолвит конфиг тега по label (канон) или по API-ключу (legacy). */
export function resolveTagConfig(tokenKey: string, tags: readonly TagConfig[]): TagConfig | undefined {
  return tags.find((t) => t.label === tokenKey) ?? tags.find((t) => t.key === tokenKey);
}

export function tagsToSuggestions(tags: TagConfig[]): SuggestionItem[] {
  return tags.map((tag) => ({
    id: tag.key,
    label: tag.label,
    value: tag.label,
    type: 'tag',
    badgeColor: tag.badgeColor,
  }));
}

export interface ValuesToEntitySuggestionsOptions {
  tagLabel?: string;
  badgeColor?: string;
}

/**
 * @param tagKey — то, что пишется в инпут (обычно label, не API-ключ).
 */
export function valuesToEntitySuggestions(
  values: readonly string[],
  tagKey: string,
  opts?: ValuesToEntitySuggestionsOptions | string,
): SuggestionItem[] {
  // Back-compat: третий аргумент раньше был badgeColor: string
  const options: ValuesToEntitySuggestionsOptions = typeof opts === 'string' ? { badgeColor: opts } : (opts ?? {});

  const tagLabel = options.tagLabel ?? tagKey;

  return values.map((value) => ({
    id: `${tagKey}-${value}`,
    label: formatUnderscoreToSpace(value),
    value,
    tagKey,
    tagLabel,
    type: 'entity',
    badgeColor: options.badgeColor,
  }));
}

export function filterSuggestionsByQuery(items: SuggestionItem[], queryWord?: string): SuggestionItem[] {
  const search = (queryWord ?? '').trim().toLowerCase();
  if (!search) return items;
  return items.filter((item) => item.label.toLowerCase().includes(search) || item.value.toLowerCase().includes(search));
}
