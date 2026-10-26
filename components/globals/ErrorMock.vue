<script setup lang="ts">
defineOptions({
  name: 'ErrorMock',
});

const props = defineProps<{
  message?: string;
  actionText?: string;
}>();

const emit = defineEmits<{
  (e: 'action'): void;
}>();

defineSlots<{
  actions: () => any;
}>();
</script>

<template>
  <div class="error_page mt-8 flex h-[90vh] flex-col items-center justify-center">
    <div class="w-fit">
      <h1 v-if="message" class="text-2xl font-bold">
        {{ message }}
      </h1>

      <div class="bg-card-decorate mx-auto mt-6 w-fit rounded-xl p-1">
        <div
          class="error_imgWrapper border-background flex w-75 flex-col items-center justify-center rounded-lg border-2 border-dashed"
        >
          <NuxtImg src="/images/404.webp" alt="404" class="relative w-full" />

          <slot name="actions">
            <UButton color="neutral" variant="outline" class="my-3" @click="emit('action')" size="xl">
              {{ actionText }}
            </UButton>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
