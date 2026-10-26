<script setup lang="ts">
import { renderSVG } from 'uqr';

defineOptions({ name: 'ShareQr' });

const props = defineProps<{
  url: string;
  title?: string;
}>();

const toast = useToast();

const qrSrc = computed(() => {
  const svg = renderSVG(props.url, {
    ecc: 'M',
    border: 2,
    pixelSize: 4,
  });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(props.url);
    toast.add({
      title: 'Ссылка скопирована',
      color: 'success',
    });
  } catch {
    // clipboard недоступен
  }
};

const shareUrl = async () => {
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({
        title: props.title,
        url: props.url,
      });
      return;
    }
    await copyUrl();
  } catch {
    // пользователь отменил share / clipboard недоступен
  }
};
</script>

<template>
  <div
    class="ShareQr bg-info flex flex-col items-center gap-2 rounded-sm border-2 border-(--color-border-dark) p-2"
    role="group"
    aria-label="Поделиться ссылкой"
  >
    <img :src="qrSrc" alt="" class="size-32 shrink-0" width="128" height="128" draggable="false" />

    <div class="flex w-full flex-col gap-1.5">
      <UButton
        type="button"
        color="primary"
        block
        icon="i-lucide-copy"
        class="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        @click="copyUrl"
      >
        Скопировать ссылку
      </UButton>
      <UButton
        type="button"
        color="primary"
        block
        icon="i-lucide-share-2"
        class="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        @click="shareUrl"
      >
        Поделиться
      </UButton>
    </div>
  </div>
</template>
