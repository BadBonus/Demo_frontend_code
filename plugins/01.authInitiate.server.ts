import type { AUTH } from '#openApi';
import { appendResponseHeader, deleteCookie } from 'h3';
import { AUTH_COOKIE_TOKEN_NAME } from '#consts/auth.constants';
import { sanitizeNulls } from '~/utils/transformers/nullToUndefined';

type TRefreshRes = AUTH['REFRESH']['POST']['res'];

export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp();
  const event = useRequestEvent();
  if (!event || event?.path.includes('.')) return;

  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const cookieHeaders = useRequestHeaders(['cookie']);

  if (!authStore.userAuthData) {
    const cookie = cookieHeaders.cookie ?? '';

    if (!cookie.includes(AUTH_COOKIE_TOKEN_NAME)) return;

    try {
      const response = await $fetch.raw('/auth/refresh', {
        method: 'POST',
        baseURL: config.public.apiBase,
        headers: cookieHeaders,
      });

      const rawSetCookie = response.headers.getSetCookie?.() ?? [response.headers.get('set-cookie')].filter(Boolean);

      for (const cookieStr of rawSetCookie) {
        appendResponseHeader(event, 'set-cookie', cookieStr);
      }

      const data = response._data as unknown as TRefreshRes;

      if (data) {
        authStore.setAccessToken(data.accessToken);
        authStore.setUser(sanitizeNulls(data.user));
      }
    } catch (error) {
      console.error(error);
      deleteCookie(event, AUTH_COOKIE_TOKEN_NAME);
      authStore.logout();
      await nuxtApp.runWithContext(() => navigateTo('/'));
      return;
    }
  }
});
