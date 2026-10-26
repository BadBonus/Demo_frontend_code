<script setup lang="ts">
import { loginUserSchema, type TLoginUserSchema } from './schemas/login-form.schema';
import type { FormSubmitEvent } from '@nuxt/ui';

defineOptions({
  name: 'AuthForm',
});

defineProps<TAuthProps>();

const emit = defineEmits<{
  (e: 'submit', data: TLoginUserSchema): void;
}>();

export type TAuthProps = { isLoading: boolean };

const state = defineModel<TLoginUserSchema>({ required: true });
const isFormValid = computed(() => loginUserSchema.safeParse(state).success);

async function onSubmit(event: FormSubmitEvent<TLoginUserSchema>) {
  try {
    await emit('submit', event.data);
  } catch (error) {
    return;
  }
}
</script>

<template>
  <UForm :schema="loginUserSchema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput class="w-full" v-model="state.email as string" />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput class="w-full" v-model="state.password as string" type="password" />
    </UFormField>

    <UButton :loading="isLoading" class="w-full justify-center font-semibold" type="submit"> Авторизоваться </UButton>
  </UForm>
</template>
