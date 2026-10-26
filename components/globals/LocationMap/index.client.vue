<script setup lang="ts">
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png?url';
import markerIcon from 'leaflet/dist/images/marker-icon.png?url';
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url';
import type { TLocationMapProps, TLocationMapSelectPayload } from './index.types';

defineOptions({ name: 'LocationMap' });

const props = withDefaults(defineProps<TLocationMapProps>(), {
  lat: null,
  lng: null,
  zoom: 13,
  interactive: false,
  navigable: true,
  // Минск — дефолтный центр, пока нет маркера
  centerLat: 53.9023,
  centerLng: 27.5619,
  heightClass: 'h-56',
});

const emit = defineEmits<{
  select: [payload: TLocationMapSelectPayload];
}>();

const rootEl = ref<HTMLElement | null>(null);

let map: L.Map | null = null;
let marker: L.Marker | null = null;
let tileLayer: L.TileLayer | null = null;
let zoomControl: L.Control.Zoom | null = null;

// Vite ломает дефолтные пути иконок Leaflet — задаём явно.
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const hasPoint = computed(() => props.lat != null && props.lng != null && !Number.isNaN(props.lat) && !Number.isNaN(props.lng));

function mapCenter(): L.LatLngExpression {
  if (hasPoint.value) return [props.lat as number, props.lng as number];
  return [props.centerLat, props.centerLng];
}

function applyNavigation() {
  if (!map) return;
  const on = props.navigable;

  if (on) {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    map.touchZoom.enable();
    if (!zoomControl) {
      zoomControl = L.control.zoom({ position: 'topright' });
      zoomControl.addTo(map);
    }
  } else {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.touchZoom.disable();
    if (zoomControl) {
      zoomControl.remove();
      zoomControl = null;
    }
  }
}

function applySelection() {
  if (!map) return;
  map.off('click', onMapClick);
  if (props.interactive) map.on('click', onMapClick);
  syncMarker();
}

function onMapClick(e: L.LeafletMouseEvent) {
  if (!props.interactive) return;
  emit('select', { lat: e.latlng.lat, lng: e.latlng.lng });
}

function onMarkerDragEnd() {
  if (!marker || !props.interactive) return;
  const { lat, lng } = marker.getLatLng();
  emit('select', { lat, lng });
}

function syncMarker() {
  if (!map) return;

  if (!hasPoint.value) {
    if (marker) {
      marker.remove();
      marker = null;
    }
    return;
  }

  const latLng: L.LatLngExpression = [props.lat!, props.lng!];

  if (!marker) {
    marker = L.marker(latLng, {
      draggable: props.interactive,
      keyboard: props.interactive,
    }).addTo(map);
    marker.on('dragend', onMarkerDragEnd);
  } else {
    marker.setLatLng(latLng);
    marker.dragging?.[props.interactive ? 'enable' : 'disable']();
  }
}

function initMap() {
  if (!rootEl.value || map) return;

  map = L.map(rootEl.value, {
    center: mapCenter(),
    zoom: props.zoom,
    zoomControl: false,
    // Attribution вынесен под карту (политика OSM всё равно требует кредит).
    attributionControl: false,
    dragging: props.navigable,
    scrollWheelZoom: props.navigable,
    doubleClickZoom: props.navigable,
    boxZoom: props.navigable,
    keyboard: props.navigable,
    touchZoom: props.navigable,
  });

  tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '',
    maxZoom: 19,
  }).addTo(map);

  applyNavigation();
  applySelection();
  // Leaflet иногда считает размер контейнера до layout — инвалидируем.
  requestAnimationFrame(() => map?.invalidateSize());
}

function destroyMap() {
  map?.off('click', onMapClick);
  marker?.off('dragend', onMarkerDragEnd);
  marker?.remove();
  marker = null;
  if (zoomControl) {
    zoomControl.remove();
    zoomControl = null;
  }
  tileLayer?.remove();
  tileLayer = null;
  map?.remove();
  map = null;
}

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  destroyMap();
});

watch(
  () => [props.interactive, props.navigable] as const,
  () => {
    applyNavigation();
    applySelection();
  },
);

watch(
  () => [props.lat, props.lng, props.zoom, props.centerLat, props.centerLng] as const,
  () => {
    if (!map) return;
    syncMarker();
    if (hasPoint.value) {
      map.setView([props.lat!, props.lng!], props.zoom);
    } else {
      map.setView([props.centerLat, props.centerLng], props.zoom);
    }
    requestAnimationFrame(() => map?.invalidateSize());
  },
);
</script>

<template>
  <div class="LocationMap flex w-full flex-col gap-1">
    <div
      ref="rootEl"
      class="LocationMap__canvas z-0 w-full border-2 border-black shadow-[2px_2px_0_0_black]"
      :class="heightClass"
      role="application"
      :aria-label="hasPoint ? `Карта: точка ${lat}, ${lng}` : 'Карта без выбранной точки'"
    />
    <p class="text-muted-foreground text-[10px] leading-tight">
      <a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer" class="underline-offset-2 hover:underline"
        >Leaflet</a
      >
      · ©
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        class="underline-offset-2 hover:underline"
        >OpenStreetMap</a
      >
    </p>
  </div>
</template>

<style scoped>
.LocationMap__canvas :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  font: inherit;
}
</style>
