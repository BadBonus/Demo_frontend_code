import { provideSSRWidth, useDebounceFn } from '@vueuse/core';

const VIEWPORT_WIDTH_COOKIE = 'viewport-width';
const SSR_WIDTH_FALLBACK = 1024;

/**
 * SSR-ширина для useBreakpoints/useMediaQuery: последняя известная ширина viewport из cookie.
 * Без cookie (первый визит) — фолбэк 1024.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const widthCookie = useCookie<number | undefined>(VIEWPORT_WIDTH_COOKIE, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  const cookieWidth = Number(widthCookie.value);
  provideSSRWidth(cookieWidth > 0 ? cookieWidth : SSR_WIDTH_FALLBACK, nuxtApp.vueApp);

  if (import.meta.server) return;

  const syncWidth = () => {
    if (widthCookie.value !== window.innerWidth) widthCookie.value = window.innerWidth;
  };

  syncWidth();
  window.addEventListener('resize', useDebounceFn(syncWidth, 300), { passive: true });
});
