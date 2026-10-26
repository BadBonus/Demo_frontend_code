# API actions (shared)

Чистые фабрики транспорта: URL, DTO, вызов `$api` / `$apiRaw`.

Без Nuxt, Pinia, Vue `ref`, тостов и use-cases.

Use-cases создают actions сами:

```ts
createXxxActions(useNuxtApp().$api)
```

Алиас: `#api`.
