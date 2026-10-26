/**
 * Гейт отображения сердечек подписки: показывать только после персонализированных данных
 * (SSR уже с токеном или refetch после логина на клиенте).
 */
export default function useAuthBoundFavor(refetch: () => Promise<void>) {
  const authStore = useAuthStore();

  const favorReady = ref(Boolean(authStore.accessToken));
  const showFavor = computed(() => Boolean(authStore.accessToken) && favorReady.value);

  watch(
    () => authStore.accessToken,
    async (token, prev) => {
      if (!token) {
        favorReady.value = false;
        return;
      }

      if (prev) return;

      favorReady.value = false;
      try {
        await refetch();
        favorReady.value = true;
      } catch {
        // сердца скрыты, пока нет актуального isSubscribed
      }
    },
  );

  return {
    favorReady,
    showFavor,
  };
}
