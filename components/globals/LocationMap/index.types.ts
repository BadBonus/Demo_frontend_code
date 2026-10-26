export interface TLocationMapSelectPayload {
  lat: number;
  lng: number;
}

export interface TLocationMapProps {
  /** Широта маркера; без пары lat/lng маркер не рисуется. */
  lat?: number | null;
  lng?: number | null;
  zoom?: number;
  /** Клик и drag маркера → emit `select`. */
  interactive?: boolean;
  /**
   * Перемещение области (мышь / пальцы) и zoom (+/−, колесо, pinch).
   * Независимо от `interactive`.
   */
  navigable?: boolean;
  /** Центр карты, если маркера ещё нет. */
  centerLat?: number;
  centerLng?: number;
  /** Высота контейнера (Tailwind-класс или произвольная). */
  heightClass?: string;
}
