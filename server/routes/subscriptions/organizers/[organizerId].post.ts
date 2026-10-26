import { requireUser, toggleOrganizerSubscription } from '../../../utils/demoStore';

export default defineEventHandler((event) => {
  requireUser(event);
  const organizerId = getRouterParam(event, 'organizerId') ?? '';
  toggleOrganizerSubscription(organizerId, true);
  return { ok: true };
});
