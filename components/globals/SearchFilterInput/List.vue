<script setup lang="ts">
import type { SuggestionItem } from './types.ts';

type TSearchFilterInputList = {
  suggestions: SuggestionItem[];
  maxSuggestions: number;
  activeIndex: number;
};

const props = defineProps<TSearchFilterInputList>();

const emit = defineEmits<{
  (e: 'itemClick', item: SuggestionItem): void;
  (e: 'update:activeIndex', index: number): void;
}>();

const DEFAULT_BADGE_COLOR = 'border-2 border-black';

const listContainerRef = ref<HTMLDivElement | null>(null);
const itemEls = ref<(HTMLLIElement | null)[]>([]);

function setLiRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLLIElement) {
    itemEls.value[index] = el;
  }
}

function scrollToActiveItem(index: number) {
  const container = listContainerRef.value;
  const li = itemEls.value[index];

  if (!container || !li) return;

  const containerRect = container.getBoundingClientRect();
  const liRect = li.getBoundingClientRect();

  const deltaTop = liRect.top - containerRect.top;
  const deltaBottom = liRect.bottom - containerRect.bottom;

  if (deltaTop < 0) {
    container.scrollTop += deltaTop;
  } else if (deltaBottom > 0) {
    container.scrollTop += deltaBottom;
  }
}

watch(
  () => props.activeIndex,
  async (index) => {
    if (index < 0) return;
    await nextTick();
    scrollToActiveItem(index);
  },
);
</script>

<template>
  <div class="SearchFilterInputList rounded border-2 border-solid bg-white text-black">
    <div v-if="!suggestions.length" class="p-2 text-sm">Нет совпадений</div>

    <div v-else ref="listContainerRef" class="max-h-60 overflow-y-auto bg-white">
      <ul class="m-0 list-none space-y-1 p-0">
        <li
          v-for="(item, index) in suggestions.slice(0, maxSuggestions)"
          :key="item.id"
          :ref="(el) => setLiRef(el as HTMLLIElement | null, index)"
        >
          <button
            :id="`search-suggestion-${index}`"
            type="button"
            :aria-selected="index === activeIndex"
            class="hover:bg-background focus:bg-background flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left hover:text-white focus:text-white"
            :class="[item.type === 'entity' ? 'text-xs' : 'text-sm', { 'bg-background text-white': index === activeIndex }]"
            @mouseenter="emit('update:activeIndex', index)"
            @click="emit('itemClick', item)"
          >
            <span class="flex items-center gap-2">
              <span v-if="item.type === 'tag'" class="text-xs"> #tag </span>

              {{ item.label }}
            </span>

            <UBadge class="border-2 border-black" v-if="item.tagKey" :class="item.badgeColor || DEFAULT_BADGE_COLOR">
              {{ item.tagLabel || item.tagKey }}
            </UBadge>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
