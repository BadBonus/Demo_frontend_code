<script setup lang="ts">
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from 'reka-ui';
// 	 type TScrollArea = {
//
// 	}

defineOptions({
  name: 'GlobalsScrollArea',
});

const emit = defineEmits(['scrolledToBottom']);
const rootRef = ref<HTMLElement | null>(null);
const isAtBottom = ref(false);
let cleanup: (() => void) | null = null;

function handleScroll(el: HTMLElement) {
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 16;
  isAtBottom.value = nearBottom;
}
onMounted(async () => {
  await nextTick();
  const rootEl = (rootRef.value as any)?.$el ?? rootRef.value;
  if (!rootEl) return;

  const viewport = rootEl.querySelector(
    '[data-radix-scroll-area-viewport], [data-reka-scroll-area-viewport]',
  ) as HTMLElement | null;

  if (!viewport) return;

  const onScroll = () => handleScroll(viewport);
  viewport.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  cleanup = () => viewport.removeEventListener('scroll', onScroll);
});

onBeforeUnmount(() => cleanup?.());

watch(isAtBottom, (newVal) => {
  if (newVal) emit('scrolledToBottom');
});
</script>

<template>
  <ScrollAreaRoot class="relative overflow-hidden rounded-lg shadow-sm" style="--scrollbar-size: 10px" ref="rootRef">
    <ScrollAreaViewport ref="viewportRef" class="h-full w-full rounded">
      <div class="relative">
        <slot />
      </div>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      class="z-20 flex touch-none p-0.5 transition-colors duration-[160ms] ease-out select-none data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2.5"
      orientation="vertical"
    >
      <ScrollAreaThumb
        class="bg-brown relative flex-1 rounded-[10px] before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
      />
    </ScrollAreaScrollbar>
    <ScrollAreaScrollbar
      class="flex touch-none p-0.5 transition-colors duration-[160ms] ease-out select-none data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2.5"
      orientation="horizontal"
    >
      <ScrollAreaThumb
        class="bg-dark-brown relative flex-1 rounded-[10px] before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
      />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
