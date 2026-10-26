<script setup lang="ts">
import BookingSidebar from './BookingSidebar.vue';
import Description from './Description.vue';
import Hero from './Hero.vue';
import Location from './Location.vue';
import MasterSidebar from './MasterSidebar.vue';
import Materials from './Materials.vue';
import SimilarList from './SimilarList.vue';
import type { TEventDetailProps } from './detail.types';

defineOptions({ name: 'EventDetail' });

const props = withDefaults(
  defineProps<
    TEventDetailProps & {
      showFavor?: boolean;
      isSubscribed?: boolean;
    }
  >(),
  {
    showFavor: false,
    isSubscribed: false,
  },
);

const emit = defineEmits<{
  /** Подписка на мастера */
  favorClick: [];
  /** Избранное ивента */
  favoriteClick: [];
  shareClick: [];
}>();

const route = useRoute();
const requestURL = useRequestURL();
const shareUrl = computed(() => `${requestURL.origin}${route.fullPath}`);
</script>

<template>
  <article class="EventDetail mx-auto w-full max-w-screen-2xl sm:px-4">
    <Hero
      :name="props.name"
      :preview="props.preview"
      :game-system="props.gameSystem"
      :format="props.format"
      :session-type="props.sessionType"
      :age-limit="props.ageLimit"
      :genres="props.genres"
      :show-favor="props.showFavor"
      :is-favorite="props.isFavorite"
      @favorite-click="emit('favoriteClick')"
      @share-click="emit('shareClick')"
    />

    <div class="@container mt-5 flex flex-col items-center justify-center gap-5 lg:flex-row lg:items-start">
      <div class="flex min-w-0 flex-1 flex-col gap-4">
        <Description :description="props.description" :synopsis="props.synopsis" />
        <!-- TODO: showLocation / showMaterials — после auth-логики для записанных; пока блоки всегда -->
        <Location
          :format="props.format"
          :address="props.address"
          :lat="props.lat"
          :lng="props.lng"
          :map-url="props.mapUrl"
          :online-links="props.onlineLinks"
        />
        <Materials :materials="props.materials" />
      </div>

      <aside class="flex w-full shrink-0 flex-wrap gap-3 overflow-visible lg:sticky lg:top-4 lg:w-80 lg:flex-col lg:flex-nowrap">
        <ShareQr :url="shareUrl" :title="props.name" class="h-min w-full shrink-0" />

        <BookingSidebar
          :starts-at="props.startsAt"
          :ends-at="props.endsAt"
          :max-users="props.maxUsers"
          :current-count-of-players="props.currentCountOfPlayers"
          :cost-value="props.costValue"
          :currency="props.currency"
          class="h-min max-lg:basis-[calc((100%-0.75rem)/2)]"
        />

        <div class="my-auto h-fit min-w-0 overflow-visible max-lg:basis-[calc((100%-0.75rem)/2)]">
          <span class="relative bottom-2 hidden text-center text-lg font-bold lg:block">Мастер сессии</span>
          <MasterSidebar
            :master="props.master"
            :show-favor="props.showFavor"
            :is-subscribed="props.isSubscribed"
            @favor-click="emit('favorClick')"
          />
        </div>
      </aside>
    </div>

    <section v-if="props.similar.length" class="mt-8">
      <h2 class="mb-4 text-center text-2xl font-bold">Похожие игры</h2>
      <SimilarList :items="props.similar" />
    </section>
  </article>
</template>
