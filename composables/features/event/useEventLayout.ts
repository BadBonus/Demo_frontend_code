/**
 * Viewport-режим каталога Events: колонки, limit порции, infinite vs pagination.
 *
 * Ширина:
 * - SSR / hydrate — provideSSRWidth (cookie viewport-width, фолбэк 1024)
 * - client navigation и после mount — window.innerWidth
 *
 * Без useBreakpoints: SSR-ветка MQ + cookie от DevTools mobile давали залипание infinite.
 */
import { useDebounceFn, useEventListener, useSSRWidth } from '@vueuse/core';
import {
  EVENT_SSR_WIDTH_FALLBACK,
  getEventColumnCount,
  getEventPageLimit,
  isEventInfiniteMode,
  type TEventColumnCount,
} from '@/composables/features/event/eventGridLayout';

export default function useEventLayout() {
  const nuxtApp = useNuxtApp();
  const ssrWidth = useSSRWidth() ?? EVENT_SSR_WIDTH_FALLBACK;

  const width = ref(import.meta.client && !nuxtApp.isHydrating ? window.innerWidth : ssrWidth);

  if (import.meta.client) {
    const sync = () => {
      width.value = window.innerWidth;
    };
    onMounted(sync);
    useEventListener('resize', useDebounceFn(sync, 100), { passive: true });
  }

  const columnCount = computed<TEventColumnCount>(() => getEventColumnCount(width.value));
  const isInfinite = computed(() => isEventInfiniteMode(width.value));
  const pageLimit = computed(() => getEventPageLimit(width.value));

  return {
    columnCount,
    isInfinite,
    pageLimit,
  };
}
