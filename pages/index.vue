<script setup lang="ts">
defineOptions({ name: 'DemoHomePage' });

const layers = [
  'pages / features — UI без прямого HTTP',
  'composables/use-cases — сценарии, Pinia, loading/error',
  'shared/api (#api) — фабрики транспорта',
  'plugins/api → $api — Bearer + refresh',
  'server/routes — Nitro mock с теми же OpenAPI-путями',
];

const demoUser = {
  email: 'demo@nastolka.local',
  password: 'demo1234',
};
</script>

<template>
  <section class="mx-auto w-full max-w-3xl px-4 py-10">
    <h1 class="font-decorate-2 text-3xl font-bold sm:text-4xl">Демо под собеседование</h1>
    <p class="text-muted mt-3 text-sm leading-relaxed sm:text-base">
      Вертикали Event + Auth из продакшен-архитектуры одного из моих проектов. Бэкенд заменён Nitro mock — use-cases и
      <code class="text-xs">#api</code> те же, что в основном проекте.
    </p>

    <div class="mt-8 flex flex-wrap gap-3">
      <UButton to="/Events" color="primary" class="cursor-pointer">Каталог событий</UButton>
      <UButton to="/auth" color="neutral"  class="cursor-pointer">Auth (login/reg)</UButton>
      <UButton to="/Events/curse-of-strahd-barovia-night" color="neutral" variant="ghost" class="cursor-pointer">
        Пример деталки
      </UButton>
    </div>

    <h2 class="mt-10 text-lg font-semibold">Слои</h2>
    <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
      <li v-for="item in layers" :key="item">{{ item }}</li>
    </ol>

    <h2 class="mt-10 text-lg font-semibold">Демо-пользователь</h2>
    <p class="text-muted mt-2 text-sm">
      Email: <code>{{ demoUser.email }}</code> · пароль: <code>{{ demoUser.password }}</code>
    </p>
    <p class="text-muted mt-2 text-sm">
      После входа на каталоге появятся кнопки избранного; toggle ходит в mock
      <code class="text-xs">/subscriptions/events/:id</code>.
    </p>
  </section>
</template>
