<script setup lang="ts">
defineOptions({
  name: 'GlobalsTag',
});

defineProps<{
  value: string;
}>();
</script>

<template>
  <div class="bg-dark-brown flex h-fit w-fit items-center justify-center gap-2 rounded-lg p-1.5 font-medium text-white">
    {{ value }}
  </div>
</template>

<!-- <style lang="scss"></style> -->
