import { eventListFixtures, toListDto } from '~/shared/demo/events-api.fixtures';
import { listFavoriteEventIds, requireUser } from '../../../utils/demoStore';

export default defineEventHandler((event) => {
  requireUser(event);
  const ids = new Set(listFavoriteEventIds());
  const data = eventListFixtures.filter((e) => ids.has(e.id)).map((e) => toListDto(e, true));
  return {
    data,
    meta: {
      total: data.length,
      page: 1,
      limit: data.length || 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
});
