import { getQuery } from 'h3';
import { eventListFixtures, toListDto } from '~/shared/demo/events-api.fixtures';
import { getUserFromAuthHeader, isEventFavorite } from '../../utils/demoStore';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(query.limit) || 12));
  const gameSystem = typeof query.gameSystem === 'string' ? query.gameSystem : undefined;
  const format = typeof query.format === 'string' ? query.format : undefined;
  const sessionType = typeof query.sessionType === 'string' ? query.sessionType : undefined;

  const authed = Boolean(getUserFromAuthHeader(event));

  let filtered = [...eventListFixtures];
  if (gameSystem) filtered = filtered.filter((e) => e.gameSystem === gameSystem);
  if (format) filtered = filtered.filter((e) => e.format === format);
  if (sessionType) filtered = filtered.filter((e) => e.sessionType === sessionType);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);

  return {
    data: slice.map((item) => toListDto(item, authed && isEventFavorite(item.id))),
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
});
