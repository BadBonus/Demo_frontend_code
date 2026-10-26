<script setup lang="ts">
defineOptions({ name: 'EventCardCell' });

defineProps<{
  label: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-1.5 p-2.5 text-center">
    <span class="text-[11px] font-bold tracking-wider uppercase">{{ label }}</span>
    <slot />
  </div>
</template>
