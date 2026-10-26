<script setup lang="ts">
import type { TEventDetailMaterialNote } from './detail.types';

defineOptions({ name: 'EventDetailMaterialNote' });

defineProps<{
  material: TEventDetailMaterialNote;
}>();
</script>

<template>
  <article class="MaterialNote bg-card-decorate flex h-full flex-col border-2 border-black text-black shadow-[2px_2px_0_0_black]">
    <header class="flex items-center gap-2 px-3 py-2.5">
      <UIcon name="i-lucide-sticky-note" class="size-4 shrink-0" aria-hidden="true" />
      <h3 class="min-w-0 flex-1 truncate text-sm font-extrabold">
        {{ material.title }}
      </h3>
    </header>

    <div class="material-note-body grow border-t-2 border-black px-3 py-2.5 text-sm leading-relaxed" v-html="material.body" />
  </article>
</template>
