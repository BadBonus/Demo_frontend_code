<script setup lang="ts">
import { type Token, ETokenTypes } from './types';

defineProps<{
  activeToken: Token;
}>();

defineEmits<{
  (e: 'toggleTokenNegation' | 'removeToken', token: Token): void;
}>();
</script>

<template>
  <div class="SuggestionActions bg-secondary space-y-1 p-1">
    <div class="border-b border-gray-100 px-2 py-1 text-xs text-gray-300">
      {{ activeToken.raw }}
    </div>

    <button
      type="button"
      class="flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-white/10"
      @click="$emit('toggleTokenNegation', activeToken)"
    >
      <span class="text-warning">
        {{ activeToken.type === ETokenTypes.NegatedFilter ? 'Включить тег' : 'Исключить тег' }}
      </span>

      <UBadge color="warning">
        {{ activeToken.type === ETokenTypes.NegatedFilter ? '+include' : '-exclude' }}
      </UBadge>
    </button>

    <button
      type="button"
      class="flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-sm text-red-600 hover:bg-white/10"
      @click="$emit('removeToken', activeToken)"
    >
      <span class="text-error">Удалить тег</span>

      <UBadge color="error"> delete </UBadge>
    </button>
  </div>
</template>
