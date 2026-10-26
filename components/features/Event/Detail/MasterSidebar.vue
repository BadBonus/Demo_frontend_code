<script setup lang="ts">
import { NuxtLink } from '#components';
import { ESocLinks } from '@/shared/constants/socLinks';
import type { TSocLinkItem } from '@/components/globals/SocLinks.vue';
import type { TEventDetailMaster } from './detail.types';

defineOptions({ name: 'EventDetailMasterSidebar' });

const props = withDefaults(
  defineProps<{
    master: TEventDetailMaster;
    showFavor?: boolean;
    isSubscribed?: boolean;
  }>(),
  {
    showFavor: true,
    isSubscribed: false,
  },
);

const emit = defineEmits<{
  favorClick: [];
}>();

/** До порога счётчик скрыт (новичок), как на GmCard. */
const NEWBIE_GAMES_THRESHOLD = 5;
const NEWBIE_PLACEHOLDER = '????';

const favorLabel = computed(() => (props.isSubscribed ? 'Убрать из избранного' : 'В избранное'));

const isGamesCountHidden = computed(() => props.master.gamesCount < NEWBIE_GAMES_THRESHOLD);
const gamesCountLabel = computed(() => (isGamesCountHidden.value ? NEWBIE_PLACEHOLDER : props.master.gamesCount));

const profileTo = computed(() => (props.master.slug ? `/org/${props.master.slug}` : undefined));

const soclinks = computed((): TSocLinkItem[] => {
  const links: TSocLinkItem[] = [];
  if (props.master.discordUrl) {
    links.push({ name: ESocLinks.DISCORD, link: props.master.discordUrl });
  }
  if (props.master.telegramUrl) {
    links.push({ name: ESocLinks.TELEGRAM, link: props.master.telegramUrl });
  }
  return links;
});

const skills = computed(() => props.master.skills ?? []);
</script>

<template>
  <aside class="EventDetailMasterSidebar bg-card-decorate block w-full overflow-visible rounded-lg p-1.5">
    <article
      class="EventDetailMasterSidebar__card shadow-element relative flex flex-col gap-1 overflow-visible rounded-lg border-2 border-solid border-black p-2 text-black"
    >
      <component
        :is="profileTo ? NuxtLink : 'div'"
        :to="profileTo"
        class="mb-4 flex w-full justify-between gap-2 outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <UAvatar
          :alt="`Аватар мастера ${master.nickname}`"
          class="size-24.5 shrink-0 rounded-sm border-2 outline-hidden"
          :src="master.avatar ?? undefined"
        />

        <div class="flex w-[55%] min-w-0 flex-col items-start gap-1">
          <div class="relative w-full border-b border-dashed border-neutral-400">
            <p class="truncate text-center text-lg" :title="master.nickname">
              {{ master.nickname }}
            </p>
            <span class="absolute -bottom-5 left-0 text-xs text-neutral-500">Имя</span>
          </div>

          <div
            class="relative mt-2 w-full border-b border-dashed border-neutral-400 text-center"
            :class="{ 'opacity-50': isGamesCountHidden }"
          >
            <span class="text-2xl">{{ gamesCountLabel }}</span>
            <span class="absolute -bottom-5 left-0 text-xs text-neutral-500">Сессий</span>
          </div>
        </div>
      </component>

      <div v-if="master.description" class="-mt-2 flex w-full gap-1.5">
        <div class="w-full">
          <div class="flex w-full items-center justify-between font-extrabold">
            <h5>Обо мне</h5>
            <div class="flex items-center gap-1 text-xs font-normal">
              <ClientOnly>
                <UIcon
                  v-if="master.countryCode"
                  :name="`i-flagpack-${master.countryCode}`"
                  class="border border-black text-[17px]"
                />
              </ClientOnly>
            </div>
          </div>

          <p class="mt-1 max-h-24 overflow-hidden text-xs">
            {{ master.description }}
          </p>
        </div>
      </div>

      <SocLinks v-if="soclinks.length" :links="soclinks" class="my-1 gap-1.5" />

      <USeparator class="mt-1" decorative :ui="{ border: 'border-neutral-400' }" />

      <AttrStats v-if="skills.length" class="mt-1" :skills="skills" />

      <FavorButton
        v-if="showFavor"
        variant="star"
        class="absolute -top-5 -right-3.5 shadow-[1px_1px_0_0_black]"
        :active="isSubscribed"
        :title="favorLabel"
        :random-tilt="true"
        :tilt-seed="master.nickname"
        @click="emit('favorClick')"
      />
    </article>
  </aside>
</template>
