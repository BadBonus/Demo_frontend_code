<script setup lang="ts">
defineOptions({
  name: 'CardCost',
});

defineProps<{
  cost?: number;
  costCurrency?: string;
}>();
</script>

<template>
  <div class="Cost">
    <span v-if="cost" class="font-secondary sketchy-border p-1.5"> {{ cost }}/{{ costCurrency }}/за сессию </span>
    <span v-else class="font-secondary text-sucborder-success sketchy-border-2 border-2 p-1.5 text-sm font-extrabold">
      FREE DONATION
    </span>
  </div>
</template>
