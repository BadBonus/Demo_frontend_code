import type { TUserAuthData } from '@/entities/user/model/types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userAuthData: null as null | TUserAuthData,
    accessToken: null as string | null,
  }),
  getters: {},
  actions: {
    setUser(data: TUserAuthData) {
      this.userAuthData = data;
    },
    setAccessToken(token: string) {
      this.accessToken = token;
    },
    logout() {
      this.userAuthData = null;
      this.accessToken = null;
    },
  },
});
