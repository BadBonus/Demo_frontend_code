<script setup lang="ts">
import { GAME_SYSTEM_BADGES } from '@/shared/constants/gameSystems';
import { formatUnderscoreToSpace } from '@/utils/transformers/formatUnderscoreToSpace';
import EventCardInfo from './EventCardInfo.vue';
import type { TEventCardProps } from './index.types';
import { useEventSlots } from './useEventSlots';

defineOptions({ name: 'EventCard' });

const props = withDefaults(defineProps<TEventCardProps>(), {
  preview: null,
  addInfo: null,
  costValue: null,
  ageLimit: null,
  currency: 'BYN',
  showFavor: false,
  isFavorite: false,
});

const emit = defineEmits<{
  favorClick: [];
}>();

/** Локальный UI-стейт звезды: сразу реагирует на клик, синхронизируется с props. */
const localFavorite = ref(Boolean(props.isFavorite));
watch(
  () => props.isFavorite,
  (value) => {
    localFavorite.value = Boolean(value);
  },
);

const onFavorClick = () => {
  localFavorite.value = !localFavorite.value;
  emit('favorClick');
};

const pluralRules = new Intl.PluralRules('ru');
const SLOTS_LEFT_FORMS: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: 'МЕСТО',
  few: 'МЕСТА',
  many: 'МЕСТ',
  other: 'МЕСТА',
};

const { slotsLeft } = useEventSlots(
  () => props.maxUsers,
  () => props.currentCountOfPlayers,
);

const slotsLeftLabel = computed(() => {
  const n = slotsLeft.value;
  if (n <= 0) return 'МЕСТ НЕТ';
  return `ЕЩЁ ${n} ${SLOTS_LEFT_FORMS[pluralRules.select(n)]}`;
});

const gameSystemLabel = computed(() => {
  const badge = GAME_SYSTEM_BADGES[props.gameSystem];
  return badge?.fullLabel ?? badge?.shortLabel ?? formatUnderscoreToSpace(props.gameSystem);
});

const priceLabel = computed(() => (!props.costValue ? 'FREE' : `${props.costValue} ${props.currency}`));
const nameInitial = computed(() => props.name.trim().charAt(0).toUpperCase());
</script>

<template>
  <article
    class="EventCard group bg-event-bg-dark text-event-text-main focus-within:outline-event-orange relative flex w-full max-w-80 flex-col overflow-hidden rounded-lg border-2 border-black shadow-[3px_3px_0_0_black] focus-within:outline-2 focus-within:outline-offset-2"
  >
    <header
      class="flex items-center justify-between gap-2 border-b-2 border-black bg-black px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-white uppercase"
    >
      <span class="truncate">{{ gameSystemLabel }}</span>
      <span
        :class="{
          'text-warning': format === 'ONLINE',
          'text-info': format === 'OFFLINE',
        }"
        >{{ format }}</span
      >
    </header>

    <div class="bg-event-accent-red relative overflow-hidden">
      <div class="relative aspect-16/10 w-full">
        <NuxtImg
          v-if="preview"
          :src="preview"
          :alt="name"
          width="320"
          height="200"
          sizes="320px"
          format="webp"
          loading="lazy"
          decoding="async"
          class="size-full object-cover"
        />
        <div v-else class="font-decorate flex size-full items-center justify-center text-6xl text-white/80" aria-hidden="true">
          {{ nameInitial }}
        </div>

        <div class="EventCard__edge bg-card-decorate pointer-events-none absolute inset-x-0 -bottom-px h-3" aria-hidden="true" />

        <span
          v-if="ageLimit != null"
          class="font-decorate bg-event-accent-red absolute top-2 right-2 z-10 inline-flex rotate-2 items-center justify-center border-2 border-black px-1.5 py-0.5 text-sm leading-none font-bold text-white shadow-[2px_2px_0_0_black]"
        >
          {{ ageLimit }}+
        </span>

        <div class="absolute inset-x-2 bottom-5 z-20 flex items-end justify-between gap-2">
          <div class="bg-warning max-w-[70%] -rotate-2 border-2 border-black px-2 py-1 shadow-[2px_2px_0_0_black]">
            <p class="truncate text-xs font-extrabold">{{ slotsLeftLabel }}</p>
          </div>

          <FavorButton
            v-if="showFavor"
            variant="star"
            class="z-30"
            :active="localFavorite"
            :title="localFavorite ? 'Убрать из избранного' : 'В избранное'"
            :random-tilt="true"
            :tilt-seed="name"
            @click="onFavorClick"
          />
        </div>
      </div>
    </div>

    <div class="bg-card-decorate border-b-2 border-black px-3 pt-3 pb-2 text-center">
      <h2 class="font-decorate line-clamp-2 text-2xl leading-none break-words uppercase" :title="name">
        {{ name }}
      </h2>
      <p v-if="addInfo" class="font-secondary line-clamp-2 text-lg/[18px] break-words">
        {{ addInfo }}
      </p>
    </div>

    <EventCardInfo
      :starts-at="startsAt"
      :max-users="maxUsers"
      :current-count-of-players="currentCountOfPlayers"
      :genres="genres"
      :session-type="sessionType"
    />

    <div class="grid grid-cols-[1fr_auto] border-b-2 border-black">
      <div class="bg-card-decorate flex items-center gap-2 p-2.5">
        <UAvatar
          :alt="`Аватар мастера ${org.nickname}`"
          :src="org.avatar ?? undefined"
          class="size-9 shrink-0 border-2 border-black outline-hidden"
        />
        <div class="min-w-0">
          <p class="text-event-accent-red text-[11px] font-bold tracking-wider uppercase">Мастер</p>
          <p class="max-w-34 truncate text-sm font-bold" :title="org.nickname">
            {{ org.nickname }}
          </p>
        </div>
      </div>
      <div
        :class="{ 'bg-event-accent-red': costValue, 'bg-success': !costValue }"
        class="flex min-w-24 flex-col items-center justify-center px-3 py-2 text-center text-white"
      >
        <span v-if="costValue" class="text-[11px] font-bold tracking-wider uppercase">Цена</span>
        <span class="font-decorate text-2xl leading-none" :class="{ 'text-event-cost': costValue }">
          <span class="text-xl">
            {{ priceLabel }}
          </span>
        </span>
      </div>
    </div>

    <div
      class="hover:bg-warning text-event-orange hover:text-event-bg-dark bg-event-bg-dark flex items-center justify-between gap-2 px-3 py-2.5 duration-200"
    >
      <NuxtLink
        :to="link"
        class="text-sm font-bold tracking-wide uppercase outline-hidden after:absolute after:inset-0 after:z-0 after:content-['']"
      >
        Подробнее
      </NuxtLink>
      <span class="text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
    </div>
  </article>
</template>

<style scoped>
.EventCard__edge {
  clip-path: polygon(
    0 100%,
    0 40%,
    4% 100%,
    8% 40%,
    12% 100%,
    16% 40%,
    20% 100%,
    24% 40%,
    28% 100%,
    32% 40%,
    36% 100%,
    40% 40%,
    44% 100%,
    48% 40%,
    52% 100%,
    56% 40%,
    60% 100%,
    64% 40%,
    68% 100%,
    72% 40%,
    76% 100%,
    80% 40%,
    84% 100%,
    88% 40%,
    92% 100%,
    96% 40%,
    100% 100%
  );
}
</style>
