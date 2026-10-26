import { AUTH } from "#openApi"
import type { $Fetch } from "ofetch"
import type { ApiClient } from "#utils/api-client"

type TLoginReq = AUTH["LOGIN"]["POST"]["req"]
type TLoginRes = AUTH["LOGIN"]["POST"]["res"]
type TRefreshRes = AUTH["REFRESH"]["POST"]["res"]
type TRegReq = AUTH["REGISTER"]["POST"]["req"]
type TRegRes = AUTH["REGISTER"]["POST"]["res"]
type TMeRes = AUTH["ME"]["GET"]["res"]

/**
 * Фабрика auth-actions: только транспорт, без Nuxt/Pinia/ref.
 */
export function createAuthActions(api: ApiClient, apiRaw: $Fetch) {
  const login = (body: TLoginReq) =>
    api<TLoginRes>(AUTH.LOGIN, {
      method: "POST",
      body,
      auth: false,
    })

  const refresh = () =>
    apiRaw<TRefreshRes>(AUTH.REFRESH, {
      method: "POST",
    })

  const logout = () => api(AUTH.LOGOUT, { method: "POST" })

  const me = () => api<TMeRes>(AUTH.ME, { method: "GET" })

  const register = (body: TRegReq) =>
    api<TRegRes>(AUTH.REGISTER, {
      method: "POST",
      body,
      auth: false,
    })

  return { login, refresh, logout, me, register }
}
