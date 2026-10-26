import type { $Fetch } from 'ofetch';

type TFetchRequest = Parameters<$Fetch>[0];
type TFetchOptions = NonNullable<Parameters<$Fetch>[1]>;

export type ApiOptions = Omit<TFetchOptions, 'baseURL'> & {
  /** По умолчанию true. false — без Bearer и без refresh по 401 (логин/регистрация). */
  auth?: boolean;
};

export interface ApiClientDeps {
  fetcher: $Fetch;
  baseURL: string;
  getToken: () => string | null;
  refreshSession: () => Promise<void>;
  onSessionExpired?: () => void;
  /** Cookie и прочие заголовки SSR, захваченные при создании клиента. */
  headers?: HeadersInit;
  /** Если false — 401 не запускает refresh (на SSR). По умолчанию true. */
  canRefresh?: () => boolean;
}

export type ApiClient = <T = unknown>(request: TFetchRequest, opts?: ApiOptions) => Promise<T>;

function getStatusCode(err: unknown): number | undefined {
  if (err !== null && typeof err === 'object' && 'statusCode' in err) {
    const code = (err as { statusCode: unknown }).statusCode;
    if (typeof code === 'number') {
      return code;
    }
  }
  return undefined;
}

/**
 * Чистый HTTP-клиент: Bearer, single-flight refresh, один retry.
 * Без Nuxt, Pinia, тостов и use-cases.
 */
export function createApiClient(deps: ApiClientDeps): ApiClient {
  let refreshPromise: Promise<void> | null = null;

  const refreshOnce = (): Promise<void> => {
    if (!refreshPromise) {
      refreshPromise = deps.refreshSession().finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise;
  };

  const request = async <T>(url: TFetchRequest, opts?: ApiOptions, isRetry = false): Promise<T> => {
    const { auth = true, headers: optHeaders, ...fetchOpts } = opts ?? {};

    const headers = new Headers(deps.headers);
    if (optHeaders) {
      new Headers(optHeaders).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    if (auth) {
      const token = deps.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const callOpts = {
      ...fetchOpts,
      baseURL: deps.baseURL,
      credentials: 'include' as const,
      headers,
      retry: 0,
    } as TFetchOptions;

    try {
      // ofetch сужает FetchOptions до ResponseType="json" на вызове; после spread тип шире.
      return await deps.fetcher<T>(url, callOpts as never);
    } catch (err) {
      const statusCode = getStatusCode(err);
      const allowRefresh = deps.canRefresh?.() ?? true;

      if (statusCode === 401 && auth && !isRetry && allowRefresh) {
        try {
          await refreshOnce();
          return await request<T>(url, opts, true);
        } catch (refreshError) {
          deps.onSessionExpired?.();
          throw refreshError;
        }
      }

      throw err;
    }
  };

  return <T = unknown>(url: TFetchRequest, opts?: ApiOptions) => request<T>(url, opts);
}
