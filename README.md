# Frontend Demo Code

Демо: вертикали **Event** (каталог + деталка) и **Auth** (login/reg + избранное) из архитектуры Nastolka.

Бэкенд заменён **Nitro mock** (`server/routes`) с теми же OpenAPI-путями (`/auth/*`, `/events/*`, `/subscriptions/*`). Слой `use-cases` → `#api` → `$api` не менялся по смыслу.

## Стек

Nuxt 4 · Vue 3 · TypeScript · Pinia · Nuxt UI · Tailwind CSS v4 · Zod · Vitest

## Запуск

```bash
pnpm install
pnpm dev
```

Откроется `http://localhost:3010`.

```bash
pnpm test
pnpm typecheck
```

## Демо-пользователь

| | |
|---|---|
| Email | `demo@nastolka.local` |
| Пароль | `demo1234` |

## Маршруты

| URL | Что смотреть |
|-----|----------------|
| `/` | Слои и сценарий демо |
| `/Events` | Каталог, URL-фильтры, пагинация/infinite, favor после login |
| `/Events/curse-of-strahd-barovia-night` | Деталка: mappers DTO→UI, материалы, мастер |
| `/auth` | Zod-формы login/reg → `useAuthFlow` → Pinia |

## Архитектура

```text
pages / features  →  composables/use-cases  →  shared/api (#api)  →  $api  →  Nitro mock
```

- **globals** — глупые UI (props/slots/emits)
- **features** — оркестрация экрана, вызов use-cases
- **use-cases** — сценарии, стор, тосты; HTTP только через `#api`
- **#api** — фабрики без Nuxt/Pinia
- **#openApi** — контракт URL и DTO

## Что сознательно вырезано

Chat, Profile, Org, GameCalendar, LocationPicker, полный Header/Footer, generate:api, прод-бэкенд.
