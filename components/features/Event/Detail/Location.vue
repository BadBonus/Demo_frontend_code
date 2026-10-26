<script setup lang="ts">
import type { EventFormat } from '#openApi/enums';
import type { TEventDetailOnlineLink } from './detail.types';
import LocationMap from '@/components/globals/LocationMap/index.client.vue';
import { buildOsmMapUrl } from '@/utils/geocode/nominatim';

defineOptions({ name: 'EventDetailLocation' });

const props = withDefaults(
  defineProps<{
    format: EventFormat;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
    mapUrl?: string | null;
    onlineLinks?: TEventDetailOnlineLink[];
  }>(),
  {
    address: null,
    lat: null,
    lng: null,
    mapUrl: null,
    onlineLinks: () => [],
  },
);

const isOnline = computed(() => props.format === 'ONLINE');

const osmHref = computed(() => {
  if (props.mapUrl) return props.mapUrl;
  if (props.lat == null || props.lng == null) return null;
  return buildOsmMapUrl(props.lat, props.lng);
});

const hasMap = computed(() => !isOnline.value && props.lat != null && props.lng != null);

const linkClass =
  'text-info inline-block text-lg font-bold underline-offset-2 outline-hidden hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-event-orange';
</script>

<template>
  <section class="EventDetailLocation">
    <h2 class="mb-3 text-2xl font-extrabold tracking-wider">
      {{ isOnline ? 'Онлайн площадки' : 'Место проведения' }}
    </h2>

    <template v-if="isOnline">
      <ul v-if="onlineLinks.length" class="flex gap-1.5">
        <li v-for="link in onlineLinks" :key="`${link.label}-${link.url}`">
          <nuxt-link :href="link.url" target="_blank" rel="noopener noreferrer" :class="linkClass">
            {{ link.label }}
          </nuxt-link>
        </li>
      </ul>
      <p v-else class="mt-1 text-sm opacity-70">Ссылки появяться позже</p>
    </template>

    <template v-else>
      <p v-if="address" class="text-base font-semibold">
        {{ address }}
      </p>
      <a v-if="osmHref" :href="osmHref" target="_blank" rel="noopener noreferrer" :class="[linkClass, 'mt-1']">
        Открыть в OpenStreetMap
      </a>
      <ClientOnly v-if="hasMap">
        <LocationMap class="mt-3" :lat="lat!" :lng="lng!" :zoom="15" :interactive="false" height-class="h-56" />
        <template #fallback>
          <div class="bg-card-decorate mt-3 h-56 w-full border-2 border-black shadow-[2px_2px_0_0_black]" aria-hidden="true" />
        </template>
      </ClientOnly>
    </template>
  </section>
</template>
