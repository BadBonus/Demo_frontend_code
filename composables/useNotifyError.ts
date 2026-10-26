import { getErrorMessage } from '~/utils/get-error-message';

function isBackendError(data: unknown): data is TBackendError {
  return data !== null && typeof data === 'object' && 'statusCode' in data && 'message' in data;
}

/**
 * Тосты об ошибках/успехе для use-cases. Только клиент.
 */
export default function useNotifyError() {
  const toast = useToast();

  const notifyError = (e: unknown, fallback: string) => {
    if (!import.meta.client) {
      return;
    }

    const err = e as { statusCode?: number; data?: unknown };

    if (!isBackendError(err.data)) {
      toast.add({
        title: 'Системная ошибка',
        description: 'Не удалось связаться с сервером',
        color: 'error',
      });
      console.error('Non-backend error:', e);
      return;
    }

    if (err.statusCode === 401) {
      toast.add({
        title: 'Ошибка авторизации',
        color: 'error',
        duration: 1000,
        description: getErrorMessage(e, fallback),
      });
      return;
    }

    toast.add({
      title: `Ошибка ${err.statusCode || err.data.statusCode}`,
      description: getErrorMessage(e, fallback) || 'Произошла ошибка запроса',
      color: 'error',
      duration: 2000,
    });
  };

  const notifySuccess = (title: string, descr?: string) => {
    if (!import.meta.client) {
      return;
    }

    toast.add({
      title,
      description: descr,
      color: 'success',
    });
  };

  return { notifyError, notifySuccess };
}
