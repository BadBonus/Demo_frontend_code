<script setup lang="ts">
import { formatUnderscoreToSpace } from '@/utils/transformers/formatUnderscoreToSpace';
import type { TEventCardProps } from './index.types';
import { useEventDate } from './useEventDate';
import { MAX_SLOT_MARKERS, MAX_VISIBLE_GENRES, useEventSlots } from './useEventSlots';

defineOptions({ name: 'EventCardInfo' });

const props = defineProps<Pick<TEventCardProps, 'startsAt' | 'maxUsers' | 'currentCountOfPlayers' | 'genres' | 'sessionType'>>();

const { dateLabel, timeLabel, timezoneLabel } = useEventDate(() => props.startsAt);
const { totalSlots, occupiedSlots } = useEventSlots(
  () => props.maxUsers,
  () => props.currentCountOfPlayers,
);

const showSlotMarkers = computed(() => totalSlots.value > 0 && totalSlots.value <= MAX_SLOT_MARKERS);
const slotMarkers = computed(() => Array.from({ length: totalSlots.value }, (_, index) => index < occupiedSlots.value));
const slotsA11yLabel = computed(() => `Занято ${occupiedSlots.value} из ${totalSlots.value} мест`);
const visibleGenres = computed(() => props.genres.slice(0, MAX_VISIBLE_GENRES));
const hiddenGenresCount = computed(() => Math.max(props.genres.length - MAX_VISIBLE_GENRES, 0));
const sessionTypeLabel = computed(() => formatUnderscoreToSpace(props.sessionType));
</script>

<template>
  <div class="bg-card-decorate grid grid-cols-2 border-b-2 border-black">
    <EventCardCell label="Старт игры" class="bg-warning border-r-2 border-b-2 border-black">
      <span class="font-decorate text-lg leading-none uppercase">{{ dateLabel }}</span>
      <div class="mt-auto flex items-center justify-center gap-1.5">
        <span class="rounded-full bg-black px-2 py-0.5 text-xs font-bold text-white">{{ timeLabel }}</span>
        <span v-if="timezoneLabel" class="text-[11px] font-semibold">{{ timezoneLabel }}</span>
      </div>
    </EventCardCell>

    <EventCardCell label="Места" class="border-b-2 border-black">
      <span class="text-sm font-extrabold">{{ occupiedSlots }} / {{ totalSlots }} заняты</span>
      <template v-if="showSlotMarkers">
        <span class="sr-only">{{ slotsA11yLabel }}</span>
        <ul class="mt-auto flex flex-wrap justify-center gap-1" aria-hidden="true">
          <li
            v-for="(occupied, index) in slotMarkers"
            :key="index"
            class="flex size-4 items-center justify-center border border-black text-[11px] font-bold"
            :class="occupied ? 'bg-event-accent-red text-white' : 'border-dashed bg-transparent'"
          >
            <span v-if="occupied">×</span>
          </li>
        </ul>
      </template>
    </EventCardCell>

    <EventCardCell label="Жанр" class="border-r-2 border-black">
      <ul class="flex flex-wrap justify-center gap-1">
        <li
          v-for="genre in visibleGenres"
          :key="genre"
          class="bg-event-accent-red -rotate-1 border border-black px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase"
        >
          {{ formatUnderscoreToSpace(genre) }}
        </li>
        <li v-if="hiddenGenresCount" class="border border-black px-1.5 py-0.5 text-[11px] font-bold">+{{ hiddenGenresCount }}</li>
      </ul>
    </EventCardCell>

    <EventCardCell label="Тип сессии">
      <span
        class="bg-event-bg-dark text-event-orange mx-auto w-fit border border-black px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase"
      >
        {{ sessionTypeLabel }}
      </span>
    </EventCardCell>
  </div>
</template>
