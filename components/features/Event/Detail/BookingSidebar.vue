<script setup lang="ts">
import { useEventDate } from '@/components/globals/EventCard/useEventDate';
import { MAX_SLOT_MARKERS, useEventSlots } from '@/components/globals/EventCard/useEventSlots';

defineOptions({ name: 'EventDetailBookingSidebar' });

const props = withDefaults(
  defineProps<{
    startsAt: string;
    endsAt: string;
    maxUsers: number;
    currentCountOfPlayers: number;
    costValue?: number | null;
    currency?: string;
  }>(),
  {
    costValue: null,
    currency: 'BYN',
  },
);

const { dateLabel, timeLabel, timezoneLabel } = useEventDate(() => props.startsAt);
const { totalSlots, occupiedSlots } = useEventSlots(
  () => props.maxUsers,
  () => props.currentCountOfPlayers,
);

const priceLabel = computed(() => (!props.costValue ? 'FREE' : `${props.costValue} ${props.currency}`));

const durationHours = computed(() => {
  const start = new Date(props.startsAt).getTime();
  const end = new Date(props.endsAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  return Math.round((end - start) / (1000 * 60 * 60));
});

const durationLabel = computed(() => (durationHours.value != null ? `${durationHours.value}` : '—'));

// Клиентский тик: на SSR фиксируем нули, чтобы не ломать hydration.
const nowMs = ref<number | null>(null);
let countdownTimer: number | undefined;

onMounted(() => {
  nowMs.value = Date.now();
  countdownTimer = window.setInterval(() => {
    nowMs.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (countdownTimer != null) window.clearInterval(countdownTimer);
});

const countdown = computed(() => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const empty = { days: '00', hours: '00', minutes: '00', expired: false };
  if (nowMs.value == null) return empty;

  const target = new Date(props.startsAt).getTime();
  if (Number.isNaN(target)) {
    return { days: '00', hours: '00', minutes: '00', expired: true };
  }
  const diff = Math.max(target - nowMs.value, 0);
  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    expired: diff === 0,
  };
});

const colonVisible = computed(() => nowMs.value == null || Math.floor(nowMs.value / 1000) % 2 === 0);

const showSlotMarkers = computed(() => totalSlots.value > 0 && totalSlots.value <= MAX_SLOT_MARKERS);
const slotMarkers = computed(() => Array.from({ length: totalSlots.value }, (_, index) => index < occupiedSlots.value));
const slotsA11yLabel = computed(() => `Занято ${occupiedSlots.value} из ${totalSlots.value} мест`);
</script>

<template>
  <aside class="EventDetailBookingSidebar bg-card-decorate overflow-hidden border-2 border-black shadow-[3px_3px_0_0_black]">
    <div class="border-b-2 border-black px-4 py-3 text-center text-black">
      <p class="text-xl font-bold tracking-wider uppercase">До старта</p>
      <p
        class="font-decorate mt-1 text-2xl leading-none tabular-nums"
        :aria-label="
          countdown.expired
            ? 'Событие началось'
            : `Осталось ${countdown.days} дней ${countdown.hours} часов ${countdown.minutes} минут`
        "
      >
        <span>{{ countdown.days }}</span>
        <span
          class="text-event-accent-red mx-1 transition-opacity duration-150 motion-reduce:opacity-100"
          :class="colonVisible ? 'opacity-100' : 'opacity-0'"
          aria-hidden="true"
          >:</span
        >
        <span>{{ countdown.hours }}</span>
        <span
          class="text-event-accent-red mx-1 transition-opacity duration-150 motion-reduce:opacity-100"
          :class="colonVisible ? 'opacity-100' : 'opacity-0'"
          aria-hidden="true"
          >:</span
        >
        <span>{{ countdown.minutes }}</span>
      </p>
      <p class="mt-1 flex justify-center gap-4 text-[10px] font-bold tracking-wider text-neutral-600 uppercase">
        <span>Дни</span>
        <span>Часы</span>
        <span>Мин</span>
      </p>
      <p class="mt-4 flex items-center justify-center text-[10px] font-bold tracking-wider uppercase">
        <Icon class="text-2xl" name="game-icons:sands-of-time" />
        <span class="text-lg leading-none"> {{ durationLabel }}ч сессия </span>
      </p>
    </div>

    <div class="grid grid-cols-2 border-b-2 border-black">
      <div class="bg-warning border-r-2 border-black px-3 py-3 text-center text-black">
        <p class="text-[10px] font-bold tracking-wider uppercase">Старт</p>
        <p class="font-decorate text-base leading-none uppercase">
          {{ dateLabel }}
        </p>
        <p class="mt-1 flex items-center justify-center gap-1">
          <span class="rounded-full bg-black px-2 py-0.5 text-xs font-bold text-white">{{ timeLabel }}</span>
          <span v-if="timezoneLabel" class="text-[11px] font-semibold">{{ timezoneLabel }}</span>
        </p>
      </div>
      <div class="bg-event-accent-red flex items-center justify-center px-3 py-3 text-center">
        <p class="font-decorate text-event-cost text-3xl leading-none sm:text-4xl">
          {{ priceLabel }}
        </p>
      </div>
    </div>

    <div class="border-b-2 border-black px-4 py-3 text-center text-black">
      <p class="text-sm font-extrabold">{{ occupiedSlots }} / {{ totalSlots }} мест занято</p>
      <template v-if="showSlotMarkers">
        <span class="sr-only">{{ slotsA11yLabel }}</span>
        <ul class="mt-2 flex flex-wrap justify-center gap-1" aria-hidden="true">
          <li
            v-for="(occupied, index) in slotMarkers"
            :key="index"
            class="flex size-5 items-center justify-center border border-black text-xs font-bold"
            :class="occupied ? 'bg-event-accent-red text-white' : 'border-dashed bg-transparent'"
          >
            <span v-if="occupied">×</span>
          </li>
        </ul>
      </template>
    </div>

    <button
      type="button"
      class="group bg-warning text-event-bg-dark focus-visible:outline-event-orange flex w-full cursor-pointer items-center justify-center gap-2 px-3 py-2.5 duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span class="text-sm font-bold tracking-wide uppercase">Записаться</span>
    </button>
  </aside>
</template>
