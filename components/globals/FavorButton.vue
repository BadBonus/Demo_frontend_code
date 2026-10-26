<script setup lang="ts">
defineOptions({ name: 'FavorButton' });

const props = withDefaults(
  defineProps<{
    active?: boolean;
    variant?: 'star' | 'heart';
    title?: string;
    randomTilt?: boolean;
    tiltSeed?: string;
  }>(),
  {
    active: false,
    variant: 'star',
    title: 'добавить в избранное',
    randomTilt: false,
    tiltSeed: undefined,
  },
);

const emit = defineEmits<{
  click: [];
}>();

const color = computed(() => (props.variant === 'heart' ? 'error' : 'warning'));

const heartIcon = computed(() => (props.active ? 'ci:heart-fill' : 'ci:heart-outline'));

/** Детерминированный угол −30…30 от seed (SSR-safe). Без seed — 0. */
function tiltAngleFromSeed(seed: string | undefined): number {
  if (!seed) return 0;
  const hash = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (hash % 61) - 30;
}

const tiltStyle = computed(() => {
  if (!props.randomTilt) return undefined;
  return { transform: `rotate(${tiltAngleFromSeed(props.tiltSeed)}deg)` };
});

const onClick = () => {
  emit('click');
};
</script>

<template>
  <UButton
    type="button"
    square
    :color="color"
    class="favor-btn sketchy-border focus-visible:outline-event-orange relative size-8 shrink-0 cursor-pointer border-2 border-black p-0 text-white shadow-[2px_2px_0_0_black] outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2"
    :class="{ 'favor-btn--active': active }"
    :style="tiltStyle"
    :ui="{ base: 'justify-center gap-0 p-0', leadingIcon: 'm-0' }"
    :title="title"
    :aria-label="title"
    :aria-pressed="active"
    :icon="variant === 'heart' ? heartIcon : undefined"
    @mousedown.prevent
    @click.stop.prevent="onClick"
  >
    <template v-if="variant === 'star'" #leading>
      <UIcon :key="active ? 'fav' : 'idle'" name="i-lucide-star" mode="svg" class="favor-btn-icon size-5" aria-hidden="true" />
    </template>
  </UButton>
</template>

<style scoped>
.favor-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Lucide star: presentation fill="none" на svg перекрывает utility-классы на обёртке */
.favor-btn-icon :deep(svg),
.favor-btn-icon :deep(path) {
  fill: none;
  stroke: currentColor;
}

.favor-btn--active .favor-btn-icon :deep(svg),
.favor-btn--active .favor-btn-icon :deep(path) {
  fill: currentColor;
}
</style>
