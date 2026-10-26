import { describe, expect, it, vi } from 'vitest';
import useAuthFlow from './useAuthFlow';

const setUser = vi.fn();
const setAccessToken = vi.fn();
const logoutStore = vi.fn();

vi.stubGlobal('useAuthStore', () => ({
  setUser,
  setAccessToken,
  logout: logoutStore,
}));

vi.mock('@/composables/useNotifyError', () => ({
  default: () => ({
    notifyError: vi.fn(),
    notifySuccess: vi.fn(),
  }),
}));

describe('useAuthFlow', () => {
  it('login вызывает переданный action и пишет user/token в store', async () => {
    setUser.mockClear();
    setAccessToken.mockClear();

    const login = vi.fn().mockResolvedValue({
      accessToken: 'token',
      user: { id: '1', email: 'a@b.c', fullName: null },
    });
    const actions = {
      login,
      refresh: vi.fn(),
      logout: vi.fn(),
      me: vi.fn(),
      register: vi.fn(),
    };

    const flow = useAuthFlow(actions as never);
    await flow.login({ email: 'a@b.c', password: 'x' });

    expect(login).toHaveBeenCalledWith({ email: 'a@b.c', password: 'x' });
    expect(setAccessToken).toHaveBeenCalledWith('token');
    expect(setUser).toHaveBeenCalled();
  });
});
