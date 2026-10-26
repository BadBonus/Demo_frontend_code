import { EVENTS } from "#openApi"
import type { ApiClient } from "#utils/api-client"

export type TEventsIndexQuery = EVENTS["INDEX"]["GET"]["query"]
export type TEventsIndexRes = EVENTS["INDEX"]["GET"]["res"]
export type TEventsSlugRes = EVENTS["SLUG"]["GET"]["res"]

/**
 * Фабрика events-actions: только транспорт, без Nuxt/Pinia/ref.
 */
export function createEventsActions(api: ApiClient) {
  const getEventsAction = (query?: TEventsIndexQuery) =>
    api<TEventsIndexRes>(EVENTS.INDEX, {
      method: "GET",
      query,
    })

  const getEventBySlugAction = (slug: string) =>
    api<TEventsSlugRes>(`${EVENTS.SLUG}${slug}`, {
      method: "GET",
    })

  return {
    getEventsAction,
    getEventBySlugAction,
  }
}
