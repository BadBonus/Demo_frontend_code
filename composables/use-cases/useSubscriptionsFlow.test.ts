import { describe, expect, it, vi } from 'vitest';
import useSubscriptionsFlow from './useSubscriptionsFlow';

vi.mock('@/composables/useNotifyError', () => ({
  default: () => ({
    notifyError: vi.fn(),
    notifySuccess: vi.fn(),
  }),
}));

describe('useSubscriptionsFlow', () => {
  it('toggleOrganizerSubscription вызывает subscribe при отсутствии подписки', async () => {
    const subscribeOrganizerAction = vi.fn().mockResolvedValue(undefined);
    const unsubscribeOrganizerAction = vi.fn().mockResolvedValue(undefined);
    const actions = {
      getMySubscriptionsAction: vi.fn(),
      getOrganizerSubscribersAction: vi.fn(),
      subscribeOrganizerAction,
      unsubscribeOrganizerAction,
    };

    const { toggleOrganizerSubscription } = useSubscriptionsFlow(actions as never);
    await toggleOrganizerSubscription('org-1', false);

    expect(subscribeOrganizerAction).toHaveBeenCalledWith('org-1');
    expect(unsubscribeOrganizerAction).not.toHaveBeenCalled();
  });
});
