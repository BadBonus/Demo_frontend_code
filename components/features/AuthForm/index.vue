<script setup lang="ts">
import useAuthFlow from '~/composables/use-cases/useAuthFlow';
import AuthForm from './Auth.vue';
import RegForm from './Reg.vue';
import type { TRegisterUserSchema } from './schemas/registration-form.schema.ts';
import type { TLoginUserSchema } from './schemas/login-form.schema.ts';

// NOTE: Возможно 1 стейт на 2 формы - не очень хорошая идея, в будущем надо подумать как лучше организовать сохранение состояния у форм по отдельности, а так же при регистрации очистить состояние и передать login/password в форму авторизации

const { registerUser, login, isLoading } = useAuthFlow();
const isReg = ref<boolean>(false);
const createInitialState = (): TRegisterUserSchema => ({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
});
const state = ref<TRegisterUserSchema>(createInitialState());

const clearState = () => {
  const email = state.value.email;
  state.value = createInitialState();
  state.value.email = email;
};

const toggleAuthForm = () => {
  isReg.value = !isReg.value;
};

const regSubmit = async (data: TRegisterUserSchema) => {
  try {
    await registerUser(data);
    clearState();
    toggleAuthForm();
  } catch (error) {
    console.error(error);
  }
};

const loginSubmit = async (data: TLoginUserSchema) => {
  await login(data);
};
</script>

<template>
  <h2 class="font-decorate-2 text-default mb-5 text-3xl font-bold">
    {{ isReg ? 'Регистрация' : 'Авторизация' }}
  </h2>
  <KeepAlive>
    <RegForm v-model="state" :is-loading="isLoading" v-if="isReg" @submit="regSubmit" />
    <AuthForm v-model="state" :is-loading="isLoading" v-else @submit="loginSubmit" />
  </KeepAlive>
  <UButton
    :disabled="isLoading"
    @click="toggleAuthForm"
    type="button"
    size="sm"
    variant="ghost"
    class="mt-3 w-full justify-center text-xs!"
  >
    {{ isReg ? 'Авторизоваться' : 'Зарегистрироваться' }}
  </UButton>
</template>

<!-- <style lang="scss"></style> -->
