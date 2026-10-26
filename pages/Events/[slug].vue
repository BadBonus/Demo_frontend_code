<script setup lang="ts">
import EventDetail from '@/components/features/Event/Detail/index.vue';
import { loadEventDetail } from '@/composables/features/event/loadEventDetail';
import useEventsFlow from '@/composables/use-cases/useEventsFlow';
import useSubscriptionsFlow from '@/composables/use-cases/useSubscriptionsFlow';
import Loader from '#components/globals/Loader.vue';

defineOptions({
  name: 'EventSlug',
});

const route = useRoute();
const router = useRouter();
const { getBySlug } = useEventsFlow();
const { toggleOrganizerSubscription, toggleEventFavorite } = useSubscriptionsFlow();

const slug = computed(() => {
  const value = route.params.slug;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
});

const refreshDetail = {
  current: undefined as undefined | (() => Promise<void>),
};
const { showFavor } = useAuthBoundFavor(() => refreshDetail.current?.() ?? Promise.resolve());

const { data, pending, error, refresh } = await useAsyncData(
  `event-detail-${slug.value}`,
  () => loadEventDetail(slug.value, getBySlug),
  { watch: [slug] },
);

refreshDetail.current = () => refresh().then(() => undefined);

const isSubscribed = ref(false);
const isFavorite = ref(false);

watch(
  () => data.value?.isSubscribed,
  (value) => {
    if (value !== undefined) isSubscribed.value = value;
  },
  { immediate: true },
);

watch(
  () => data.value?.isFavorite,
  (value) => {
    if (value !== undefined) isFavorite.value = value;
  },
  { immediate: true },
);

const isNotFound = computed(() => !pending.value && (!!error.value || data.value === null));

/** Без оркестрационных полей — они не должны утекать в DOM. */
const detailBind = computed(() => {
  if (!data.value) return null;
  const { orgId: _orgId, isSubscribed: _isSubscribed, isFavorite: _isFavorite, ...rest } = data.value;
  return rest;
});

const goBack = () => {
  if (import.meta.client && window.history.length > 1) {
    router.back();
    return;
  }
  navigateTo('/Events');
};

const onMasterFavorClick = async () => {
  const organizerId = data.value?.orgId;
  if (!organizerId) return;

  const nextIsSubscribed = !isSubscribed.value;

  try {
    await toggleOrganizerSubscription(organizerId, isSubscribed.value);
    isSubscribed.value = nextIsSubscribed;
  } catch {
    // ошибка уже обработана в useSubscriptionsFlow (toast)
  }
};

const onEventFavoriteClick = async () => {
  const eventId = data.value?.id;
  if (!eventId) return;

  const prevIsFavorite = isFavorite.value;
  const nextIsFavorite = !prevIsFavorite;
  isFavorite.value = nextIsFavorite;

  try {
    await toggleEventFavorite(eventId, prevIsFavorite);
  } catch {
    isFavorite.value = prevIsFavorite;
  }
};

const onShareClick = async () => {
  if (!import.meta.client) return;
  const url = window.location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title: data.value?.name, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  } catch {
    // пользователь отменил share / clipboard недоступен
  }
};
</script>

<template>
  <ErrorMock v-if="isNotFound" message="Упс, эта игра потерялась в тумане!" action-text="к списку игр" @action="goBack" />

  <section v-else class="w-full">
    <Loader v-if="pending" class="absCenter" />

    <EventDetail
      v-else-if="detailBind"
      v-bind="detailBind"
      :show-favor="showFavor"
      :is-subscribed="isSubscribed"
      :is-favorite="isFavorite"
      @favor-click="onMasterFavorClick"
      @favorite-click="onEventFavoriteClick"
      @share-click="onShareClick"
    />
  </section>
</template>
