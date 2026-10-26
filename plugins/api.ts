import { AUTH } from '#openApi';
import type { AUTH as TAuthEndpoints } from '#openApi';
import { createApiClient } from '~/utils/api-client';
import { sanitizeNulls } from '~/utils/transformers/nullToUndefined';

type TRefreshRes = TAuthEndpoints['REFRESH']['POST']['res'];

/**
 * Единственная точка связывания транспорта с Nuxt/Pinia.
 * Provide: $api (с refresh/retry), $apiRaw (без interceptors — для refresh).
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const nuxtApp = useNuxtApp();
  const cookieHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined;
  const baseURL = config.public.apiBase as string;

  const apiRaw = $fetch.create({
    baseURL,
    credentials: 'include',
    headers: cookieHeaders,
  });

  const api = createApiClient({
    // Nitro $Fetch и ofetch $Fetch расходятся по полю native — для демо достаточно cast.
    fetcher: $fetch as unknown as import('ofetch').$Fetch,
    baseURL,
    headers: cookieHeaders,
    getToken: () => authStore.accessToken,
    canRefresh: () => import.meta.client,
    refreshSession: async () => {
      const data = await apiRaw<TRefreshRes>(AUTH.REFRESH, { method: 'POST' });
      authStore.setAccessToken(data.accessToken);
      authStore.setUser(sanitizeNulls(data.user));
    },
    onSessionExpired: () => {
      authStore.logout();
      void nuxtApp.runWithContext(() => navigateTo('/'));
    },
  });

  return {
    provide: {
      api,
      apiRaw,
    },
  };
});
