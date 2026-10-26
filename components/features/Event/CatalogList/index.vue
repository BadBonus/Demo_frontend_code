<script setup lang="ts">
import type { TEventCard } from '@/components/features/Event/mappers';

defineOptions({
  name: 'EventCatalogList',
});

const props = withDefaults(
  defineProps<{
    items: TEventCard[];
    showFavor?: boolean;
    loading?: boolean;
    infinite?: boolean;
    canLoadMore?: boolean;
    showClearFilters?: boolean;
  }>(),
  {
    showFavor: false,
    loading: false,
    infinite: false,
    canLoadMore: false,
    showClearFilters: false,
  },
);

const emit = defineEmits<{
  favorClick: [eventId: string];
  loadMore: [];
  clearFilters: [];
}>();

const sentinelRef = ref<HTMLElement | null>(null);
const isIntersecting = ref(false);

useIntersectionObserver(
  sentinelRef,
  ([entry]) => {
    // #region agent log
    fetch('http://127.0.0.1:7574/ingest/bca4b5da-5477-43d2-8cf6-08066925cce8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f01bbd' },
      body: JSON.stringify({
        sessionId: 'f01bbd',
        runId: 'run1',
        hypothesisId: 'B',
        location: 'CatalogList/index.vue:IO',
        message: 'IO entry',
        data: {
          isIntersecting: entry?.isIntersecting,
          top: entry?.boundingClientRect.top,
          infinite: props.infinite,
          loading: props.loading,
          canLoadMore: props.canLoadMore,
          itemsLen: props.items.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    isIntersecting.value = Boolean(entry?.isIntersecting);
  },
  { rootMargin: '200px' },
);

watch([isIntersecting, () => props.infinite, () => props.loading, () => props.canLoadMore], () => {
  // #region agent log
  fetch('http://127.0.0.1:7574/ingest/bca4b5da-5477-43d2-8cf6-08066925cce8', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f01bbd' },
    body: JSON.stringify({
      sessionId: 'f01bbd',
      runId: 'run1',
      hypothesisId: 'B',
      location: 'CatalogList/index.vue:watch',
      message: 'emit decision',
      data: {
        isIntersecting: isIntersecting.value,
        infinite: props.infinite,
        loading: props.loading,
        canLoadMore: props.canLoadMore,
        willEmit: isIntersecting.value && props.infinite && !props.loading && props.canLoadMore,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!isIntersecting.value || !props.infinite || props.loading || !props.canLoadMore) return;
  emit('loadMore');
});
</script>

<template>
  <!--
    CSS multi-column masonry (без JS).
    Брейкпоинты = eventGridLayout: 768 / 1024 / 1440 / 1920.
    Порядок заполнения — сверху вниз по колонкам (ограничение CSS columns).
  -->
  <div class="EventCatalogList">
    <ul
      class="-hover-straighten mx-auto w-full columns-1 gap-6 min-[768px]:columns-2 min-[1024px]:columns-3 min-[1440px]:columns-4 min-[1920px]:columns-5"
    >
      <li v-for="(event, index) in items" :key="event.slug" class="mb-6 break-inside-avoid">
        <EventCard
          class="mx-auto w-full max-w-80"
          v-bind="event"
          :style="{ '--i': index + 1 }"
          :show-favor="showFavor"
          :is-favorite="Boolean(event.isFavorite)"
          @favor-click="emit('favorClick', event.id)"
        />
      </li>
    </ul>

    <UiEmptyState
      v-if="!items.length && !loading"
      class="mx-auto"
      title="Ничего не найдено"
      :action-label="showClearFilters ? 'Очистить фильтры' : undefined"
      @action="emit('clearFilters')"
    />

    <div v-if="infinite" ref="sentinelRef" class="flex h-10 items-center justify-center" aria-hidden="true">
      <span v-if="loading" class="text-muted-foreground text-sm">Загрузка…</span>
    </div>
  </div>
</template>
