<script setup lang="ts">
import type { TEventDetailMaterialFile } from './detail.types';
import { formatFileSize } from '@/utils/formatFileSize';

defineOptions({ name: 'EventDetailMaterialFile' });

const props = defineProps<{
  material: TEventDetailMaterialFile;
}>();

const SKETCHY_BORDERS = [
  'sketchy-border',
  'sketchy-border-2',
  'sketchy-border-3',
  'sketchy-border-4',
  'sketchy-border-5',
  'sketchy-border-6',
] as const;

const TILTS = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-[1.5deg]', '-rotate-[2.5deg]'] as const;

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const sketchyClass = computed(() => SKETCHY_BORDERS[hashId(props.material.id) % SKETCHY_BORDERS.length]);

const tiltClass = computed(() => TILTS[hashId(`${props.material.id}:tilt`) % TILTS.length]);

function extensionIcon(originalName: string, mimeType: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf' || mimeType === 'application/pdf') return 'i-lucide-file-text';
  if (ext === 'zip' || ext === 'rar' || mimeType.includes('zip') || mimeType.includes('rar')) {
    return 'i-lucide-archive';
  }
  if (ext === 'doc' || ext === 'docx' || mimeType.includes('word')) return 'i-lucide-file-type';
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || mimeType.startsWith('image/')) {
    return 'i-lucide-image';
  }
  return 'i-lucide-paperclip';
}

const isPdf = computed(
  () => props.material.mimeType === 'application/pdf' || props.material.originalName.toLowerCase().endsWith('.pdf'),
);
</script>

<template>
  <a
    :href="material.href"
    :download="isPdf ? undefined : material.originalName"
    :target="isPdf ? '_blank' : undefined"
    :rel="isPdf ? 'noopener noreferrer' : undefined"
    class="MaterialFile bg-card-decorate focus-visible:outline-event-orange inline-flex max-w-full cursor-pointer items-center gap-2 border-2 border-black px-2.5 py-1.5 text-sm font-semibold text-black shadow-[2px_2px_0_0_black] outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2"
    :class="[sketchyClass, tiltClass]"
    :title="material.originalName"
  >
    <UIcon :name="extensionIcon(material.originalName, material.mimeType)" class="size-4 shrink-0" aria-hidden="true" />
    <span class="min-w-0 truncate">{{ material.title }}</span>
    <span class="shrink-0 text-xs font-medium opacity-60">
      {{ formatFileSize(material.sizeBytes) }}
    </span>
  </a>
</template>
