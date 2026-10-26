import type { settingsDetailsFormSchema } from '~/components/features/Profile/Settings/schemas/details-form.schema';
import type { z } from 'zod';

/**
 * Контракт данных профиля пользователя
 *
 * Назначение
 * Централизованное хранение Zod-схем, DTO и типов для модуля профиля
 *
 * Зона ответственности
 * - Валидация формы профиля (DetailsForm.vue)
 * - Составной стейт и эмиты (SettingsMain.vue)
 * - Параметры методов в composables (useProfileFlow.ts)
 * - Полезная нагрузка запросов к бэкенду (patchMeAction)
 *
 * Размещение типов в этом файле исключает импорт из Vue SFC и циклические зависимости
 */

export type TSettingsDetailsProps = z.infer<typeof settingsDetailsFormSchema>;

export type TPatchProfilePayload = TSettingsDetailsProps & {
  avatar?: string;
};
