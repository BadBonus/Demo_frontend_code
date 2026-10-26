import { requireUser, toggleEventFavorite } from '../../../utils/demoStore';

export default defineEventHandler((event) => {
  requireUser(event);
  const eventId = getRouterParam(event, 'eventId') ?? '';
  toggleEventFavorite(eventId, true);
  return { ok: true };
});
