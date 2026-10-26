import { createError } from 'h3';
import { buildEventDetailDto, eventListFixtures } from '~/shared/demo/events-api.fixtures';
import { getUserFromAuthHeader, isEventFavorite, isOrganizerSubscribed } from '../../utils/demoStore';

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug') ?? '';
  const item = eventListFixtures.find((e) => e.slug === slug);
  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      data: { statusCode: 404, message: 'Событие не найдено' },
    });
  }

  const authed = Boolean(getUserFromAuthHeader(event));
  return buildEventDetailDto(
    item,
    authed && isEventFavorite(item.id),
    authed && isOrganizerSubscribed(item.orgId),
  );
});
