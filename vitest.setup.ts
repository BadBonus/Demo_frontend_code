import { computed, ref, shallowRef } from 'vue';

async function useAsyncData<T>(
  _key: string,
  handler: () => Promise<T>,
  options?: { immediate?: boolean; dedupe?: 'cancel' | 'defer' },
) {
  const data = ref<T | null>(null);
  const error = ref<unknown>(null);
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle');

  const execute = async () => {
    status.value = 'pending';
    error.value = null;

    try {
      data.value = await handler();
      status.value = 'success';
      return data.value;
    } catch (err) {
      error.value = err;
      status.value = 'error';
      throw err;
    }
  };

  if (options?.immediate !== false) {
    try {
      await execute();
    } catch {
      // Nuxt: the initial useAsyncData promise does not reject
    }
  }

  return {
    data,
    error,
    status,
    pending: computed(() => status.value === 'pending'),
    refresh: execute,
    execute,
  };
}

Object.assign(globalThis, { ref, computed, shallowRef, useAsyncData });
