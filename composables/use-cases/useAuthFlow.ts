import type { AUTH } from '#openApi';
import { createAuthActions } from '#api/auth';
import useNotifyError from '@/composables/useNotifyError';

import { sanitizeNulls } from '~/utils/transformers/nullToUndefined';
import type { TRegisterUserSchema } from '~/components/features/AuthForm/schemas/registration-form.schema';

type TAuthActions = ReturnType<typeof createAuthActions>;

function resolveAuthActions() {
  const { $api, $apiRaw } = useNuxtApp();
  return createAuthActions($api, $apiRaw);
}

export default function useAuthFlow(actions: TAuthActions = resolveAuthActions()) {
  const { login: loginRequest, refresh, logout: logoutRequest, me, register } = actions;
  const store = useAuthStore();
  const { notifyError, notifySuccess } = useNotifyError();
  const isLoading = ref(false);

  const login = async (credentials: AUTH['LOGIN']['POST']['req']) => {
    isLoading.value = true;
    try {
      const data = await loginRequest(credentials);
      store.setUser(sanitizeNulls(data.user));
      store.setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      notifyError(error, 'Ошибка входа');
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const refreshToken = async () => {
    isLoading.value = true;
    try {
      const data = await refresh();
      if (data) {
        store.setAccessToken(data.accessToken);
        store.setUser(sanitizeNulls(data.user));
      }
    } catch (err) {
      console.error(err);
      notifyError(err, 'Ошибка обновления токена');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    try {
      await logoutRequest();
      store.logout();
    } catch (error) {
      notifyError(error, 'Ошибка выхода');
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const getUserMe = async () => {
    isLoading.value = true;
    try {
      const data = await me();
      store.setUser(sanitizeNulls(data));
      return data;
    } catch (error) {
      notifyError(error, 'Ошибка получения данных пользователя');
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const registerUser = async (credentials: TRegisterUserSchema) => {
    isLoading.value = true;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      await register({ timezone, ...credentials });
      notifySuccess('Вы зарегистрированы', 'Письмо для подтверждения отправлено на почту');
    } catch (error) {
      notifyError(error, 'Ошибка регистрации');
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return { login, logout, refreshToken, getUserMe, registerUser, isLoading };
}
