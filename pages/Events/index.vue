<script setup lang="ts">
import useEventsCatalogPage from '@/composables/features/event/useEventsCatalogPage';

defineOptions({
  name: 'EventsPage',
});

const {
  items,
  filters,
  meta,
  page,
  limit,
  loading,
  isInfinite,
  canNext,
  showFavor,
  hasActiveFilters,
  applyQuery,
  clearFilters,
  goToPage,
  loadMore,
  onFavorClick,
} = await useEventsCatalogPage();
</script>

<template>
  <section class="EventsPage mx-auto w-full max-w-[1886px] px-4 py-8">
    <EventSearchFilter
      class="mx-auto w-full max-w-4xl"
      :apply-query="applyQuery"
      :current-game-system="filters.gameSystem"
      :current-format="filters.format"
      :current-session-type="filters.sessionType"
    />

    <div class="mb-8 text-center">
      <h1 class="mt-4 text-2xl font-bold">События</h1>
      <p class="text-muted-foreground mt-2 text-sm">Предстоящие игры и сессии</p>
    </div>

    <EventCatalogList
      :items="items"
      :show-favor="showFavor"
      :loading="loading"
      :infinite="isInfinite"
      :can-load-more="canNext"
      :show-clear-filters="hasActiveFilters"
      @favor-click="onFavorClick"
      @load-more="loadMore"
      @clear-filters="clearFilters"
    />

    <UPagination
      v-if="!isInfinite && meta.total > limit"
      class="mt-8 flex justify-center"
      :page="page"
      :items-per-page="limit"
      :total="meta.total"
      @update:page="goToPage"
    />
  </section>
</template>
