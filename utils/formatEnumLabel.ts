/**
 * Преобразует enum-код в читаемый лейбл: подчёркивания → пробелы.
 *
 * @example
 * formatUnderscoreToSpace('DUNGEONS_AND_DRAGONS_5E') // → 'DUNGEONS AND DRAGONS 5E'
 */
export function formatUnderscoreToSpace(value: string): string {
  return value.replaceAll('_', ' ');
}
