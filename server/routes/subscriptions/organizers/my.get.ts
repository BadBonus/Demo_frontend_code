import { listSubscribedOrganizerIds, requireUser } from '../../../utils/demoStore';

export default defineEventHandler((event) => {
  requireUser(event);
  const ids = listSubscribedOrganizerIds();
  return {
    data: ids.map((id) => ({ id, slug: 'vran-gm', nickname: 'Вран', avatar: null })),
    meta: {
      total: ids.length,
      page: 1,
      limit: ids.length || 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
});
