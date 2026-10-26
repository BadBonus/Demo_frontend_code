<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { registerUserSchema, type TRegisterUserSchema } from './schemas/registration-form.schema';

defineProps<{ isLoading: boolean }>();
const emit = defineEmits<{
  (e: 'submit', data: TRegisterUserSchema): void;
}>();

const state = defineModel<TRegisterUserSchema>({ required: true });

async function onSubmit(event: FormSubmitEvent<TRegisterUserSchema>) {
  emit('submit', event.data);
}
</script>

<template>
  <UForm :disabled="isLoading" :schema="registerUserSchema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Nickname" name="nickname">
      <UInput class="w-full" v-model="state.nickname" />
    </UFormField>

    <UFormField label="Email" name="email">
      <UInput class="w-full" v-model="state.email" />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput class="w-full" v-model="state.password" type="password" />
    </UFormField>

    <UFormField label="Repeat Password" name="confirmPassword">
      <UInput class="w-full" v-model="state.confirmPassword" type="password" />
    </UFormField>

    <UButton class="w-full justify-center font-semibold" type="submit"> Зарегистрироваться </UButton>
  </UForm>
</template>
