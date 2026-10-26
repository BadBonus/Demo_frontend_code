<script setup lang="ts">
export type TModalFiltersFilterBadge = { name: string; count?: number };

defineOptions({
  name: 'ModalFiltersFilterBadges',
});

const model = defineModel<TModalFiltersFilterBadge[]>();
function removeElementAtIndex(index: number): { name: string; count?: number }[] {
  if (!model.value) return [];

  if (index < 0 || index >= model.value.length) {
    return [...model.value];
  }

  return [...model.value.slice(0, index), ...model.value.slice(index + 1)];
}
</script>

<template>
  <ul class="flex flex-wrap justify-center gap-1.5">
    <li v-for="(el, index) in model" :key="index + el.name">
      <UBadge size="lg" color="secondary">
        <span>{{ el.name }}</span>
        <span v-if="el.count">{{ el.count }}</span>

        <button class="flex items-center justify-center" @click="removeElementAtIndex(index)">
          <Icon name="lucide:octagon-x" />
        </button>
      </UBadge>
    </li>
  </ul>
</template>

<!-- <style lang="scss"></style> -->
