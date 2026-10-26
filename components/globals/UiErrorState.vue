<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    retryLabel?: string;
    isRetrying?: boolean;
  }>(),
  {
    title: 'Не удалось загрузить данные',
    description: 'Произошла ошибка при получении информации. Попробуйте повторить попытку.',
    retryLabel: 'Повторить',
    isRetrying: false,
  },
);

const emit = defineEmits<{
  (e: 'retry'): void;
}>();
</script>

<template>
  <div
    class="border-error bg-inverted-primary flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center"
  >
    <h3 class="text-error text-base font-semibold">
      {{ title }}
    </h3>
    <p class="text-inverted-primary mt-1 max-w-sm text-sm">
      {{ description }}
    </p>
    <div class="mt-4">
      <UButton type="button" :disabled="isRetrying" @click="emit('retry')" color="error">
        <span v-if="isRetrying">Загрузка...</span>
        <span v-else>{{ retryLabel }}</span>
      </UButton>
    </div>
  </div>
</template>
