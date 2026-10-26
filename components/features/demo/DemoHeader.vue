<script setup lang="ts">
import useAuthFlow from '@/composables/use-cases/useAuthFlow';

defineOptions({ name: 'DemoHeader' });

const authStore = useAuthStore();
const { logout, isLoading } = useAuthFlow();
const route = useRoute();

const isAuthed = computed(() => Boolean(authStore.userAuthData));

async function onLogout() {
  try {
    await logout();
    if (route.path.startsWith('/auth')) await navigateTo('/');
  } catch {
    // toast уже из useAuthFlow
  }
}
</script>

<template>
  <header class="border-b border-white/15 bg-black/40 backdrop-blur-sm">
    <div class="mx-auto flex w-full max-w-[1886px] items-center gap-4 px-4 py-3">
      <NuxtLink to="/" class="font-decorate-2 text-xl font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2">
        Frontend Demo
      </NuxtLink>

      <nav class="flex flex-1 items-center gap-2 text-sm" aria-label="Основная навигация">
        <NuxtLink
          to="/Events"
          class="rounded-md px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
          active-class="bg-white/15 text-white"
        >
          События
        </NuxtLink>
        <NuxtLink
          to="/auth"
          class="rounded-md px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
          active-class="bg-white/15 text-white"
        >
          Auth
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <span v-if="isAuthed" class="hidden text-sm text-white/80 sm:inline">
          {{ authStore.userAuthData?.nickname }}
        </span>
        <UButton
          v-if="isAuthed"
          size="sm"
          color="error"
          variant="outline"
          class="cursor-pointer"
          :loading="isLoading"
          @click="onLogout"
        >
          Выйти
        </UButton>
        <UButton v-else to="/auth" size="sm" color="primary" class="cursor-pointer">
          Войти
        </UButton>
      </div>
    </div>
  </header>
</template>
