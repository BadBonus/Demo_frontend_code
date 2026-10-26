<script setup lang="ts">
import type { SuggestionItem } from '@/components/globals/SearchFilterInput/types';
import type { FetchSuggestionsPayload } from '@/components/globals/SearchFilterInput/composables/useSuggestionsFetch';
import {
  tagsToSuggestions,
  valuesToEntitySuggestions,
  filterSuggestionsByQuery,
  resolveTagConfig,
} from '@/components/globals/SearchFilterInput/utils';
import { EVENT_SEARCH_TAGS, EVENT_SEARCH_VALUES } from './config';
import { parseEventSearchString, formatEventSearchString, type TEventFiltersForFormat, type TEventSearchParsed } from './mappers';
import type { TCatalogApplyQuery, TCatalogFiltersOf } from '@/composables/useCatalogItems';
import type { TEventsIndexQuery } from '#api/events';

defineOptions({
  name: 'EventSearchFilter',
});

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Фильтрация событий',
});

type TEventFilters = Pick<TCatalogFiltersOf<TEventsIndexQuery>, 'gameSystem' | 'format' | 'sessionType'>;

interface Props {
  placeholder?: string;
  currentGameSystem?: TEventsIndexQuery['gameSystem'];
  currentFormat?: TEventsIndexQuery['format'];
  currentSessionType?: TEventsIndexQuery['sessionType'];
  applyQuery: (next: TCatalogApplyQuery<TEventFilters>) => Promise<unknown>;
}

const searchRaw = ref('');
const suggestionsList = ref<SuggestionItem[]>([]);

function currentFiltersFromProps(): TEventFiltersForFormat {
  return {
    gameSystem: props.currentGameSystem,
    format: props.currentFormat,
    sessionType: props.currentSessionType,
  };
}

function filtersMatch(parsed: TEventSearchParsed, filters: TEventFiltersForFormat): boolean {
  return (
    parsed.gameSystem === filters.gameSystem && parsed.format === filters.format && parsed.sessionType === filters.sessionType
  );
}

watch(
  () => [props.currentGameSystem, props.currentFormat, props.currentSessionType] as const,
  ([gameSystem, format, sessionType], prev) => {
    if (prev) {
      const [prevGameSystem, prevFormat, prevSessionType] = prev;
      if (gameSystem === prevGameSystem && format === prevFormat && sessionType === prevSessionType) {
        return;
      }
    }

    const filters = currentFiltersFromProps();
    const parsedInput = parseEventSearchString(searchRaw.value ?? '');
    if (filtersMatch(parsedInput, filters)) return;

    searchRaw.value = formatEventSearchString({ filters });
  },
  { immediate: true, flush: 'post' },
);

async function handleFetchSuggestions(payload: FetchSuggestionsPayload) {
  const { contextType, tagKey, queryWord } = payload;

  if (contextType === 'empty') {
    suggestionsList.value = tagsToSuggestions(EVENT_SEARCH_TAGS);
    return;
  }

  if ((contextType === 'after_tag_key' || contextType === 'inside_entity_value') && tagKey) {
    const tag = resolveTagConfig(tagKey, EVENT_SEARCH_TAGS);
    const apiKey = tag?.key;
    const displayLabel = tag?.label ?? tagKey;
    const badgeColor = tag?.badgeColor;

    if (!apiKey) {
      suggestionsList.value = [];
      return;
    }

    const values = EVENT_SEARCH_VALUES[apiKey] ?? [];
    const entities = valuesToEntitySuggestions(values, displayLabel, { tagLabel: displayLabel, badgeColor });
    suggestionsList.value = filterSuggestionsByQuery(entities, queryWord);
    return;
  }

  if (contextType === 'inside_word' && queryWord) {
    const matches: SuggestionItem[] = [];

    for (const tag of EVENT_SEARCH_TAGS) {
      const values = EVENT_SEARCH_VALUES[tag.key];
      if (!values) continue;
      const entities = valuesToEntitySuggestions(values, tag.label, {
        tagLabel: tag.label,
        badgeColor: tag.badgeColor,
      });
      matches.push(...filterSuggestionsByQuery(entities, queryWord));
    }

    suggestionsList.value = matches;
    return;
  }

  suggestionsList.value = [];
}

function handleSearch(query: string) {
  const parsed = parseEventSearchString(query);
  void props.applyQuery({
    filters: {
      ...(parsed.gameSystem !== undefined ? { gameSystem: parsed.gameSystem } : {}),
      ...(parsed.format !== undefined ? { format: parsed.format } : {}),
      ...(parsed.sessionType !== undefined ? { sessionType: parsed.sessionType } : {}),
    },
    page: 1,
  });
}
</script>

<template>
  <SearchFilterInput
    v-model="searchRaw"
    :placeholder="placeholder"
    :tags="EVENT_SEARCH_TAGS"
    :suggestions="suggestionsList"
    @fetch-suggestions="handleFetchSuggestions"
    @search="handleSearch"
  />
</template>
