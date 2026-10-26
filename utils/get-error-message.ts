/**
 * Достаёт человекочитаемое сообщение из ошибки $fetch / бэкенда.
 */
export function getErrorMessage(e: unknown, fallback: string): string {
  if (e === null || typeof e !== 'object') {
    return fallback;
  }

  const err = e as {
    data?: { message?: string | string[] };
    statusMessage?: string;
  };

  const message = err.data?.message;

  if (Array.isArray(message)) {
    const joined = message.join(', ');
    return joined || fallback;
  }

  if (typeof message === 'string' && message.length > 0) {
    return message;
  }

  if (typeof err.statusMessage === 'string' && err.statusMessage.length > 0) {
    return err.statusMessage;
  }

  return fallback;
}
