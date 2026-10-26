<script setup lang="ts">
import { ref } from 'vue';
import type { SuggestionItem, TagConfig } from './types.ts';
import type { FetchSuggestionsPayload } from './composables/useSuggestionsFetch.ts';
import { resolveTagConfig, tagsToSuggestions, valuesToEntitySuggestions } from './utils.ts';
import SearchFilterInput from './index.vue';

const searchQuery = ref('image category:"manga"');
const isLoading = ref(false);
const suggestionsList = ref<SuggestionItem[]>([]);

const availableTags: TagConfig[] = [
  { key: 'gameSystem', label: 'Игровая система', badgeColor: 'blue' },
  { key: 'category', label: 'Категория', badgeColor: 'green' },
  { key: 'language', label: 'Язык', badgeColor: 'purple' },
  { key: 'parody', label: 'Пародия', badgeColor: 'amber' },
];

const mockEntitiesDatabase: Record<string, string[]> = {
  gameSystem: ['dnd', 'pathfinder', 'cyberpunk', 'world_of_darkness', 'savage_worlds'],
  category: ['manga', 'anime', 'artbook', 'doujinshi', 'comics'],
  language: ['chinese', 'english', 'japanese', 'russian', 'korean'],
  parody: ['the idolmaster', 'fate stay night', 'touhou project', 'kantai collection'],
};

function handleFetchSuggestions(payload: FetchSuggestionsPayload) {
  isLoading.value = true;

  setTimeout(() => {
    const { contextType, tagKey, queryWord } = payload;

    if (contextType === 'empty') {
      suggestionsList.value = tagsToSuggestions(availableTags);
    } else if ((contextType === 'after_tag_key' || contextType === 'inside_entity_value') && tagKey) {
      const tag = resolveTagConfig(tagKey, availableTags);
      const apiKey = tag?.key;
      const displayLabel = tag?.label ?? tagKey;
      const entities = apiKey ? mockEntitiesDatabase[apiKey] || [] : [];
      const search = (queryWord || '').toLowerCase();
      const filtered = search ? entities.filter((e) => e.toLowerCase().includes(search)) : entities;

      suggestionsList.value = valuesToEntitySuggestions(filtered, displayLabel, {
        tagLabel: displayLabel,
        badgeColor: tag?.badgeColor,
      });
    } else if (contextType === 'inside_word' && queryWord) {
      const search = queryWord.toLowerCase();
      const matches: SuggestionItem[] = [];

      availableTags.forEach((tag) => {
        const items = mockEntitiesDatabase[tag.key] || [];
        items.forEach((item) => {
          if (item.toLowerCase().includes(search)) {
            matches.push({
              id: `${tag.key}-${item}`,
              label: item,
              value: item,
              tagKey: tag.label,
              tagLabel: tag.label,
              type: 'entity',
              badgeColor: tag.badgeColor,
            });
          }
        });
      });

      suggestionsList.value = matches;
    } else {
      suggestionsList.value = [];
    }

    isLoading.value = false;
  }, 50);
}

function handleSearch(query: string) {
  const encodedQuery = encodeURIComponent(query);
  console.log('Выполнен поиск с URL query:', `/search?q=${encodedQuery}`);
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-4 p-8">
    <div class="font-mono text-sm text-gray-500">Текущее значение v-model: {{ searchQuery }}</div>

    <SearchFilterInput
      v-model="searchQuery"
      :tags="availableTags"
      :suggestions="suggestionsList"
      :loading="isLoading"
      @fetch-suggestions="handleFetchSuggestions"
      @search="handleSearch"
    />
  </div>
</template>
