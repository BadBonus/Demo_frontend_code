import { SUBSCRIPTIONS } from "#openApi"
import type { ApiClient } from "#utils/api-client"

type TMySubscriptionsRes = SUBSCRIPTIONS["ORGANIZERS_MY"]["GET"]["res"]
type TOrganizerSubscribersRes = SUBSCRIPTIONS["ORGANIZERS_ORGANIZERID_SUBSCRIBERS"]["GET"]["res"]
type TMyEventFavoritesRes = SUBSCRIPTIONS["EVENTS_MY"]["GET"]["res"]

function organizerSubscriptionUrl(organizerId: string) {
  return `${SUBSCRIPTIONS.ORGANIZERS_ORGANIZERID}${organizerId}`
}

function organizerSubscribersUrl(organizerId: string) {
  return `${SUBSCRIPTIONS.ORGANIZERS_ORGANIZERID}${organizerId}/subscribers`
}

function eventFavoriteUrl(eventId: string) {
  return `${SUBSCRIPTIONS.EVENTS_EVENTID}${eventId}`
}

/**
 * Фабрика subscriptions-actions: только транспорт, без Nuxt/Pinia/ref.
 */
export function createSubscriptionsActions(api: ApiClient) {
  const getMySubscriptionsAction = () =>
    api<TMySubscriptionsRes>(SUBSCRIPTIONS.ORGANIZERS_MY, {
      method: "GET",
    })

  const getOrganizerSubscribersAction = (organizerId: string) =>
    api<TOrganizerSubscribersRes>(organizerSubscribersUrl(organizerId), {
      method: "GET",
    })

  const subscribeOrganizerAction = (organizerId: string) =>
    api(organizerSubscriptionUrl(organizerId), {
      method: "POST",
    })

  const unsubscribeOrganizerAction = (organizerId: string) =>
    api(organizerSubscriptionUrl(organizerId), {
      method: "DELETE",
    })

  const getMyEventFavoritesAction = () =>
    api<TMyEventFavoritesRes>(SUBSCRIPTIONS.EVENTS_MY, {
      method: "GET",
    })

  const addEventFavoriteAction = (eventId: string) =>
    api(eventFavoriteUrl(eventId), {
      method: "POST",
    })

  const removeEventFavoriteAction = (eventId: string) =>
    api(eventFavoriteUrl(eventId), {
      method: "DELETE",
    })

  return {
    getMySubscriptionsAction,
    getOrganizerSubscribersAction,
    subscribeOrganizerAction,
    unsubscribeOrganizerAction,
    getMyEventFavoritesAction,
    addEventFavoriteAction,
    removeEventFavoriteAction,
  }
}
