<script setup lang="ts">
import { ESocLinks } from '@/shared/constants/socLinks';

export interface TSocLinkItem {
  name: ESocLinks;
  link: string;
}

defineOptions({
  name: 'GlobalsSocLinks',
});

const props = defineProps<{
  links: TSocLinkItem[];
}>();

const SOC_ICONS: Record<ESocLinks, string> = {
  [ESocLinks.DISCORD]: 'simple-icons:discord',
  [ESocLinks.TELEGRAM]: 'simple-icons:telegram',
  [ESocLinks.VK]: 'simple-icons:vk',
  [ESocLinks.INSTAGRAM]: 'simple-icons:instagram',
  [ESocLinks.REDDIT]: 'simple-icons:reddit',
  [ESocLinks.YOUTUBE]: 'simple-icons:youtube',
  [ESocLinks.THREADS]: 'simple-icons:threads',
};
</script>

<template>
  <ul v-if="props.links.length" class="list-random-rotate flex flex-wrap gap-4">
    <li v-for="(link, index) in props.links" :key="link.name">
      <UButton
        :href="link.link"
        target="_blank"
        rel="noopener noreferrer"
        :class="index % 2 === 0 ? 'rotate-6' : '-rotate-6'"
        class="cursor-pointer rounded-none! border-2 border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        :icon="SOC_ICONS[link.name]"
        :aria-label="link.name"
      />
    </li>
  </ul>
</template>
