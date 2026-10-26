<script setup lang="ts">
defineOptions({ name: 'EventDetailDescription' });

defineProps<{
  description?: string;
  synopsis?: string;
}>();
</script>

<template>
  <section v-if="description || synopsis" class="EventDetailDescription">
    <p v-if="description" class="EventDetailDescription__body font-script text-lg leading-[23px]">
      {{ description }}
    </p>

    <template v-if="synopsis">
      <h2 class="mt-4 text-2xl font-bold">О приключении</h2>
      <p>{{ synopsis }}</p>
    </template>
  </section>
</template>

<style scoped>
.EventDetailDescription__body::first-letter {
  float: left;
  margin-right: 0.35rem;
  font-family: var(--font-decorate);
  font-size: 3.25rem;
  line-height: 0.85;
  font-weight: 700;
  color: var(--color-event-accent-red);
}
</style>
