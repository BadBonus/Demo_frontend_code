<script setup lang="ts">
import Splide from '@splidejs/splide';
import type { TEventCard } from '@/components/features/Event/mappers';

defineOptions({ name: 'EventDetailSimilarList' });

const props = defineProps<{
  items: TEventCard[];
}>();

const splideRoot = ref<HTMLElement | null>(null);
let splideInstance: Splide | null = null;

function mountSplide(el: HTMLElement) {
  if (splideInstance || !props.items.length) return;

  splideInstance = new Splide(el, {
    type: 'loop',
    perPage: 1,
    gap: '1rem',
    arrows: false,
    pagination: false,
    drag: true,
    focus: 'center',
    autoplay: true,
    interval: 3000,
  }).mount();
}

watch(
  splideRoot,
  (el) => {
    if (el) mountSplide(el);
  },
  { flush: 'post' },
);

onBeforeUnmount(() => {
  splideInstance?.destroy();
  splideInstance = null;
});
</script>

<template>
  <div v-if="items.length" class="EventDetailSimilarList">
    <ul class="hidden justify-center gap-6 lg:flex">
      <li v-for="(event, index) in items" :key="event.slug" class="w-full max-w-80">
        <EventCard class="w-full" v-bind="event" :style="{ '--i': index + 1 }" />
      </li>
    </ul>

    <div class="lg:hidden">
      <ClientOnly>
        <div ref="splideRoot" class="splide w-full">
          <div class="splide__track w-full">
            <ul class="splide__list">
              <li v-for="(event, index) in items" :key="event.slug" class="splide__slide">
                <EventCard class="mx-auto w-full max-w-80" v-bind="event" :style="{ '--i': index + 1 }" />
              </li>
            </ul>
          </div>
        </div>

        <template #fallback>
          <div class="flex justify-center">
            <EventCard v-if="items[0]" class="w-full max-w-80" v-bind="items[0]" :style="{ '--i': 1 }" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
