import type { $Fetch } from 'ofetch';
import type { ApiClient } from '../../utils/api-client';

declare module '#app' {
  interface NuxtApp {
    $api: ApiClient;
    $apiRaw: $Fetch;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: ApiClient;
    $apiRaw: $Fetch;
  }
}

export {};
