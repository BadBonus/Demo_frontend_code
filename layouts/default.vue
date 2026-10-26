<script setup lang="ts">
import DemoHeader from '@/components/features/demo/DemoHeader.vue';
</script>

<template>
  <div class="bg-default text-default min-h-screen">
    <DemoHeader />
    <main>
      <slot />
    </main>
  </div>
</template>
