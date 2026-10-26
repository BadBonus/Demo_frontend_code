import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient, type ApiClientDeps } from './api-client';

type FetchMock = ReturnType<typeof vi.fn> & {
  create?: ReturnType<typeof vi.fn>;
};

function createFetchError(statusCode: number, data?: unknown) {
  const err = new Error(`Request failed with status ${statusCode}`) as Error & {
    statusCode: number;
    data?: unknown;
  };
  err.statusCode = statusCode;
  err.data = data;
  return err;
}

function createDeps(overrides: Partial<ApiClientDeps> = {}) {
  const fetcher = vi.fn() as FetchMock;
  const refreshSession = vi.fn().mockResolvedValue(undefined);
  const onSessionExpired = vi.fn();
  let token: string | null = 'access-token';

  const deps: ApiClientDeps = {
    fetcher: fetcher as unknown as ApiClientDeps['fetcher'],
    baseURL: 'https://api.test',
    getToken: () => token,
    refreshSession,
    onSessionExpired,
    canRefresh: () => true,
    ...overrides,
  };

  return {
    deps,
    fetcher,
    refreshSession,
    onSessionExpired,
    setToken: (value: string | null) => {
      token = value;
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createApiClient', () => {
  it('подставляет Bearer-токен и не делает этого при auth: false', async () => {
    const { deps, fetcher } = createDeps();
    fetcher.mockResolvedValue({ ok: true });
    const api = createApiClient(deps);

    await api('/with-auth');
    await api('/public', { auth: false });

    expect(fetcher).toHaveBeenCalledTimes(2);

    const authHeaders = new Headers(fetcher.mock.calls[0]?.[1]?.headers);
    expect(authHeaders.get('Authorization')).toBe('Bearer access-token');

    const publicHeaders = new Headers(fetcher.mock.calls[1]?.[1]?.headers);
    expect(publicHeaders.get('Authorization')).toBeNull();
  });

  it('при 401 делает один refresh, повторяет запрос и возвращает успех', async () => {
    const { deps, fetcher, refreshSession, setToken } = createDeps();
    fetcher
      .mockRejectedValueOnce(createFetchError(401, { statusCode: 401, message: 'expired' }))
      .mockResolvedValueOnce({ data: 'ok' });

    refreshSession.mockImplementation(async () => {
      setToken('new-token');
    });

    const api = createApiClient(deps);
    const result = await api('/secure');

    expect(result).toEqual({ data: 'ok' });
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(2);

    const retryHeaders = new Headers(fetcher.mock.calls[1]?.[1]?.headers);
    expect(retryHeaders.get('Authorization')).toBe('Bearer new-token');
  });

  it('три параллельных 401 вызывают refreshSession ровно один раз', async () => {
    const { deps, fetcher, refreshSession, setToken } = createDeps();

    fetcher.mockImplementation(async (_url, opts) => {
      const headers = new Headers(opts?.headers);
      if (headers.get('Authorization') === 'Bearer access-token') {
        throw createFetchError(401);
      }
      return { ok: true };
    });

    let resolveRefresh!: () => void;
    refreshSession.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = () => {
            setToken('new-token');
            resolve();
          };
        }),
    );

    const api = createApiClient(deps);
    const pending = Promise.all([api('/a'), api('/b'), api('/c')]);

    await Promise.resolve();
    expect(refreshSession).toHaveBeenCalledTimes(1);
    resolveRefresh();

    await expect(pending).resolves.toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  it('при падении refresh вызывает onSessionExpired и пробрасывает ошибку', async () => {
    const { deps, fetcher, refreshSession, onSessionExpired } = createDeps();
    const refreshError = createFetchError(401, { message: 'refresh failed' });

    fetcher.mockRejectedValue(createFetchError(401));
    refreshSession.mockRejectedValue(refreshError);

    const api = createApiClient(deps);

    await expect(api('/secure')).rejects.toBe(refreshError);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('повторный 401 после успешного refresh не уходит в бесконечный цикл', async () => {
    const { deps, fetcher, refreshSession } = createDeps();
    const secondError = createFetchError(401, { message: 'still unauthorized' });

    fetcher.mockRejectedValueOnce(createFetchError(401)).mockRejectedValueOnce(secondError);

    const api = createApiClient(deps);

    await expect(api('/secure')).rejects.toBe(secondError);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('не-401 ошибки пробрасываются без refresh', async () => {
    const { deps, fetcher, refreshSession, onSessionExpired } = createDeps();
    const error = createFetchError(500, { statusCode: 500, message: 'boom' });
    fetcher.mockRejectedValue(error);

    const api = createApiClient(deps);

    await expect(api('/secure')).rejects.toBe(error);
    expect(refreshSession).not.toHaveBeenCalled();
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('401 с телом не в формате бэкенда тоже запускает refresh', async () => {
    const { deps, fetcher, refreshSession } = createDeps();
    fetcher.mockRejectedValueOnce(createFetchError(401, 'gateway unauthorized')).mockResolvedValueOnce({ ok: true });

    const api = createApiClient(deps);
    await expect(api('/secure')).resolves.toEqual({ ok: true });
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  it('при canRefresh: false не вызывает refresh и пробрасывает 401', async () => {
    const { deps, fetcher, refreshSession, onSessionExpired } = createDeps({
      canRefresh: () => false,
    });
    const error = createFetchError(401);
    fetcher.mockRejectedValue(error);

    const api = createApiClient(deps);

    await expect(api('/secure')).rejects.toBe(error);
    expect(refreshSession).not.toHaveBeenCalled();
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});
