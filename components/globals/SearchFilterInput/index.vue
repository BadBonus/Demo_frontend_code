<script setup lang="ts">
import type { SuggestionItem, TagConfig } from './types';
import SuggestionActions from './SuggestionActions.vue';
import List from './List.vue';
import { useCaretContext } from './composables/useCaretContext';
import { useSuggestionsFetch, type FetchSuggestionsPayload } from './composables/useSuggestionsFetch';
import { usePopoverState } from './composables/usePopoverState';
import { useInputActions } from './composables/useInputActions';
import { useActiveSuggestion } from './composables/useActiveSuggestion';

interface Props {
  modelValue?: string;
  placeholder?: string;
  tags?: TagConfig[];
  suggestions?: SuggestionItem[];
  maxSuggestions?: number;
  debounceMs?: number;
  sortOrder?: 'asc' | 'desc';
}

interface UInputInstance {
  inputRef?: HTMLInputElement | null;
  $el?: HTMLElement;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  tags: () => [],
  suggestions: () => [],
  maxSuggestions: 10,
  debounceMs: 200,
});

const emit = defineEmits<{
  (e: 'update:modelValue' | 'search', value: string): void;
  (e: 'update:sortOrder', value: 'asc' | 'desc'): void;
  (e: 'fetch-suggestions', payload: FetchSuggestionsPayload): void;
}>();

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});

const containerRef = useTemplateRef<HTMLElement>('containerRef');
const uInputRef = useTemplateRef<UInputInstance>('uInputRef');

const nativeInput = computed<HTMLInputElement | null>(() => {
  const instance = uInputRef.value;
  if (!instance) return null;
  if (instance.inputRef instanceof HTMLInputElement) return instance.inputRef;
  return instance.$el?.querySelector('input') ?? null;
});

const { isOpen: isPopoverOpen, open: openPopover, close: closePopover, handleFocusOut } = usePopoverState(containerRef);

const fetch = useSuggestionsFetch(
  (payload) => emit('fetch-suggestions', payload),
  () => props.debounceMs,
);

const {
  currentContext,
  sync: syncCaret,
  reset: resetCaret,
} = useCaretContext(
  nativeInput,
  () => props.modelValue,
  (context, force) => fetch.schedule(context, force),
);

const { selectTag, selectEntity, toggleNegation, removeActiveToken } = useInputActions({
  modelValue: model,
  inputRef: nativeInput,
  currentContext,
  onAfterRestore: () => syncCaret({ force: true }),
});

const isListVisible = computed(() => currentContext.value.type !== 'on_token');

const {
  activeIndex,
  setActive,
  moveNext,
  movePrev,
  reset: resetActive,
} = useActiveSuggestion(
  () => props.suggestions,
  () => props.maxSuggestions,
  isListVisible,
);

function handleInput() {
  openPopover();
  resetActive();
  syncCaret();
}

function handleFocus() {
  openPopover();
  syncCaret({ force: true });
}

function handleItemClick(item: SuggestionItem) {
  resetActive();

  if (item.type === 'tag') {
    selectTag(item.value);
    return;
  }
  selectEntity(item.value, item.tagKey);
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      openPopover();
      moveNext();
      return;
    }
    case 'ArrowUp': {
      event.preventDefault();
      openPopover();
      movePrev();
      return;
    }
    case 'Escape': {
      if (!isPopoverOpen.value) return;
      event.preventDefault();
      resetActive();
      closePopover();
      return;
    }
    case 'Tab':
    case 'Enter': {
      const index = activeIndex.value;
      const item = index >= 0 ? props.suggestions[index] : undefined;

      if (item) {
        event.preventDefault();
        handleItemClick(item);
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearchSubmit();
      }
      return;
    }
  }
}

function handleInputClear() {
  fetch.reset();
  resetCaret();
  resetActive();
  model.value = '';

  nextTick(() => {
    nativeInput.value?.focus();
    syncCaret({ force: true });
  });
}

function handleSearchSubmit() {
  fetch.cancel();
  resetActive();
  emit('search', props.modelValue);
  closePopover();
}

defineExpose({
  nativeInput,
  isPopoverOpen,
  currentContext,
  updateCaretAndContext: () => syncCaret({ force: true }),
});

const isSortButtonVisible = computed(() => props.sortOrder !== undefined);

const sortOrderModel = computed<'asc' | 'desc'>(() => props.sortOrder ?? 'desc');

function handleSortToggle() {
  const next: 'asc' | 'desc' = sortOrderModel.value === 'desc' ? 'asc' : 'desc';
  emit('update:sortOrder', next);
}
</script>

<template>
  <div ref="containerRef" class="relative w-full" @focusout="handleFocusOut">
    <div class="flex">
      <UInput
        ref="uInputRef"
        v-model="model"
        clearable
        class="w-full"
        :placeholder="placeholder"
        @clear="handleInputClear"
        @focus="handleFocus"
        @input="handleInput"
        @keydown="handleKeydown"
        :ui="{ trailing: 'pe-1', base: 'bg-white text-black' }"
      >
        <template v-if="model.length" #trailing>
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            aria-label="Clear input"
            @mousedown.prevent
            @click="handleInputClear"
            class="text-black hover:text-white"
          >
            X
          </UButton>
        </template>
      </UInput>

      <UButton
        v-if="isSortButtonVisible"
        @click="handleSortToggle"
        @mousedown.prevent
        :icon="sortOrderModel === 'desc' ? 'lucide:list-sort-descending' : 'lucide:list-sort-ascending'"
        color="primary"
        :class="sortOrderModel === 'desc' ? 'sketchy-border-5' : 'sketchy-border'"
        class="ml-3"
      />
    </div>

    <div v-show="isPopoverOpen" class="absolute top-full left-0 z-50 mt-1 w-full min-w-7 rounded-md shadow-lg" @mousedown.prevent>
      <SuggestionActions
        v-if="currentContext.type === 'on_token' && currentContext.activeToken"
        :active-token="currentContext.activeToken"
        @toggle-token-negation="toggleNegation"
        @remove-token="removeActiveToken"
        class="bg-secondary space-y-1 p-1"
      />

      <List
        v-else
        :suggestions="props.suggestions"
        :max-suggestions="props.maxSuggestions"
        :active-index="activeIndex"
        @update:active-index="setActive"
        @item-click="handleItemClick"
      />
    </div>
  </div>
</template>
