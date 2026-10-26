import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

const LOCALE = 'ru-RU';
// Явный часовой пояс => одинаковый результат на сервере и клиенте (нет hydration mismatch).
// При необходимости берите из профиля пользователя / cookie.
const DEFAULT_TIME_ZONE = 'Europe/Minsk';

interface Formatters {
  date: Intl.DateTimeFormat;
  time: Intl.DateTimeFormat;
}

// Intl.DateTimeFormat дорогой в создании, поэтому кэшируем по часовому поясу.
const formattersCache = new Map<string, Formatters>();

function getFormatters(timeZone: string): Formatters {
  let formatters = formattersCache.get(timeZone);
  if (!formatters) {
    formatters = {
      date: new Intl.DateTimeFormat(LOCALE, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone,
      }),
      time: new Intl.DateTimeFormat(LOCALE, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'shortOffset',
        timeZone,
      }),
    };
    formattersCache.set(timeZone, formatters);
  }
  return formatters;
}

const part = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  parts.find((p) => p.type === type)?.value ?? '';

export function useEventDate(startsAt: MaybeRefOrGetter<string>, timeZone: MaybeRefOrGetter<string> = DEFAULT_TIME_ZONE) {
  const parsed = computed(() => {
    const date = new Date(toValue(startsAt));
    return Number.isNaN(date.getTime()) ? null : date;
  });

  const formatted = computed(() => {
    if (!parsed.value) return null;
    const { date, time } = getFormatters(toValue(timeZone));
    const dateParts = date.formatToParts(parsed.value);
    const timeParts = time.formatToParts(parsed.value);

    return {
      date: `${part(dateParts, 'weekday')}, ${part(dateParts, 'day')} ${part(dateParts, 'month')}`
        .replaceAll('.', '')
        .toUpperCase(),
      time: `${part(timeParts, 'hour')}:${part(timeParts, 'minute')}`,
      timezone: part(timeParts, 'timeZoneName'),
    };
  });

  return {
    dateLabel: computed(() => formatted.value?.date ?? '—'),
    timeLabel: computed(() => formatted.value?.time ?? '—'),
    timezoneLabel: computed(() => formatted.value?.timezone ?? ''),
  };
}
