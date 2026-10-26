<script setup lang="ts">
import { GAME_SYSTEM_BADGES } from '@/shared/constants/gameSystems';
import { formatUnderscoreToSpace } from '@/utils/transformers/formatUnderscoreToSpace';
import type { EventFormat, GameSystem, SessionType, GameGenres } from '#openApi/enums';

defineOptions({ name: 'EventDetailHero' });

const props = withDefaults(
  defineProps<{
    name: string;
    preview?: string | null;
    gameSystem: GameSystem;
    format: EventFormat;
    sessionType: SessionType;
    ageLimit?: number | null;
    genres: GameGenres[];
    showFavor?: boolean;
    isFavorite?: boolean;
  }>(),
  {
    preview: null,
    ageLimit: null,
    showFavor: false,
    isFavorite: false,
  },
);

const emit = defineEmits<{
  favoriteClick: [];
  shareClick: [];
}>();

const GENRE_ROTATIONS = ['-rotate-2', 'rotate-1', '-rotate-1'] as const;
const GENRE_COLORS = ['bg-event-accent-red text-white', 'bg-warning text-black', 'bg-event-orange text-black'] as const;

const gameSystemLabel = computed(() => {
  const badge = GAME_SYSTEM_BADGES[props.gameSystem];
  return badge?.fullLabel ?? badge?.shortLabel ?? formatUnderscoreToSpace(props.gameSystem);
});

const sessionTypeLabel = computed(() => formatUnderscoreToSpace(props.sessionType));
const nameInitial = computed(() => props.name.trim().charAt(0).toUpperCase());

const CHAR_STAGGER_MS = 100;

const nameChars = computed(() => Array.from(props.name));

const favoriteLabel = computed(() => (props.isFavorite ? 'Убрать из избранного' : 'В избранное'));

type TSecondaryAction = {
  key: 'share' | 'report';
  label: string;
  icon: string;
  color: 'warning' | 'info' | 'error';
};

const secondaryActions: TSecondaryAction[] = [
  {
    key: 'share',
    label: 'Поделиться',
    icon: 'i-lucide-share-2',
    color: 'info',
  },
  {
    key: 'report',
    label: 'Пожаловаться',
    icon: 'i-lucide-flag',
    color: 'error',
  },
];

const onActionClick = (key: TSecondaryAction['key']) => {
  if (key === 'share') emit('shareClick');
  // report пока без обработчика
};
</script>

<template>
  <header class="EventDetailHero bg-event-accent-red relative isolate overflow-hidden">
    <div
      class="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 bg-black px-3 py-1.5 text-[11px] font-bold tracking-wide text-white uppercase"
    >
      <span class="truncate">{{ gameSystemLabel }}</span>
      <span class="flex shrink-0 items-center gap-2">
        <span class="text-event-orange">{{ sessionTypeLabel }}</span>
        <span
          :class="{
            'text-warning': format === 'ONLINE',
            'text-info': format === 'OFFLINE',
          }"
          >{{ format }}</span
        >
      </span>
    </div>

    <div class="relative aspect-21/9 min-h-48 w-full sm:min-h-56">
      <ul v-if="genres?.length" class="absolute top-5 left-1 z-10 mt-3 flex flex-wrap gap-2">
        <li
          v-for="(genre, index) in genres"
          :key="genre"
          class="border-2 border-black px-2 py-1 text-xs font-extrabold tracking-wide uppercase shadow-[2px_2px_0_0_black]"
          :class="[GENRE_ROTATIONS[index % GENRE_ROTATIONS.length], GENRE_COLORS[index % GENRE_COLORS.length]]"
        >
          {{ formatUnderscoreToSpace(genre) }}
        </li>
      </ul>
      <div class="absolute inset-x-1 bottom-4 z-10 flex items-end justify-between gap-3">
        <h1
          class="font-decorate min-w-0 flex-1 px-3 py-2 text-xl leading-none break-words uppercase text-shadow-[2px_2px_0_black] md:text-4xl"
        >
          <span class="sr-only">{{ name }}</span>
          <span class="inline" aria-hidden="true">
            <span
              v-for="(char, index) in nameChars"
              :key="`${index}-${char}`"
              class="EventDetailHero__char inline-block"
              :style="{ animationDelay: `${index * CHAR_STAGGER_MS}ms` }"
              >{{ char === ' ' ? '\u00A0' : char }}</span
            >
          </span>
        </h1>

        <ul class="mb-1 flex shrink-0 items-center gap-1.5 pr-1">
          <li v-if="showFavor">
            <FavorButton
              variant="star"
              class="z-30"
              :active="isFavorite"
              :title="favoriteLabel"
              :random-tilt="true"
              :tilt-seed="name"
              @click="emit('favoriteClick')"
            />
          </li>
          <li v-for="action in secondaryActions" :key="action.key">
            <UButton
              type="button"
              square
              :icon="action.icon"
              :color="action.color"
              :aria-label="action.label"
              class="focus-visible:outline-event-orange cursor-pointer border-2 border-black shadow-[2px_2px_0_0_black] focus-visible:outline-2 focus-visible:outline-offset-2"
              @click="onActionClick(action.key)"
            />
          </li>
        </ul>
      </div>

      <NuxtImg
        v-if="preview"
        :src="preview"
        :alt="name"
        width="1200"
        height="514"
        sizes="100vw sm:1200px"
        format="webp"
        class="size-full object-cover"
      />
      <div
        v-else
        class="font-decorate bg-event-bg-dark flex size-full items-center justify-center text-7xl text-white/80"
        aria-hidden="true"
      >
        {{ nameInitial }}
      </div>

      <span
        v-if="ageLimit != null"
        class="font-decorate bg-event-accent-red absolute top-10 right-3 z-10 inline-flex rotate-2 items-center justify-center border-2 border-black px-2 py-1 text-lg leading-none font-bold text-white shadow-[2px_2px_0_0_black]"
      >
        {{ ageLimit }}+
      </span>

      <div class="EventDetailHero__edge bg-background pointer-events-none absolute inset-x-0 -bottom-px h-4" aria-hidden="true" />
    </div>
  </header>
</template>

<style scoped>
@keyframes EventDetailHeroCharIn {
  from {
    opacity: 0;
    transform: translateX(-0.4em);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.EventDetailHero__char {
  opacity: 0;
  animation: EventDetailHeroCharIn 125ms ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .EventDetailHero__char {
    opacity: 1;
    animation: none;
    transform: none;
  }
}

/* prettier-ignore */
.EventDetailHero__edge {
  clip-path: polygon(
    0 100%, 0 40%, 4% 100%, 8% 40%, 12% 100%, 16% 40%, 20% 100%, 24% 40%, 28% 100%,
    32% 40%, 36% 100%, 40% 40%, 44% 100%, 48% 40%, 52% 100%, 56% 40%, 60% 100%,
    64% 40%, 68% 100%, 72% 40%, 76% 100%, 80% 40%, 84% 100%, 88% 40%, 92% 100%,
    96% 40%, 100% 100%
  );
}
</style>
