export function formatUnderscoreToSpace(key: string): string {
  return key.replaceAll('_', ' ').toLowerCase();
}
