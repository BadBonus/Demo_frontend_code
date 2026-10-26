<script setup lang="ts">
import AuthForm from '@/components/features/AuthForm/index.vue';

defineOptions({ name: 'AuthPage' });

const authStore = useAuthStore();

watch(
  () => authStore.userAuthData,
  (user) => {
    if (user) void navigateTo('/Events');
  },
);
</script>

<template>
  <section class="mx-auto flex w-full max-w-md flex-col px-4 py-10">
    <p class="text-muted mb-6 text-center text-sm">
      Демо: <code>demo@nastolka.local</code> / <code>demo1234</code>
    </p>
    <div class="rounded-lg border border-white/15 bg-black/30 p-6">
      <AuthForm />
    </div>
  </section>
</template>
