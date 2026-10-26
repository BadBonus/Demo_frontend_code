<script setup lang="ts">
import type { TEventDetailMaterial, TEventDetailMaterialFile, TEventDetailMaterialNote } from './detail.types';
import MaterialFile from './MaterialFile.vue';
import MaterialNote from './MaterialNote.vue';

defineOptions({ name: 'EventDetailMaterials' });

const props = defineProps<{
  materials: TEventDetailMaterial[];
}>();

const files = computed(() => props.materials.filter((item): item is TEventDetailMaterialFile => item.type === 'FILE'));

const notes = computed(() => props.materials.filter((item): item is TEventDetailMaterialNote => item.type === 'NOTE'));
</script>

<template>
  <section v-if="materials.length" class="EventDetailMaterials flex flex-col gap-3">
    <h2 class="text-2xl font-extrabold tracking-wider">Материалы для игроков</h2>

    <ul v-if="files.length" class="flex flex-wrap items-center gap-2">
      <li v-for="file in files" :key="file.id">
        <MaterialFile :material="file" />
      </li>
    </ul>

    <ul v-if="notes.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="note in notes" :key="note.id" class="h-fit min-w-0">
        <MaterialNote :material="note" />
      </li>
    </ul>
  </section>
</template>
