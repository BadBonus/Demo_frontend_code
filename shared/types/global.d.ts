import type { ESocLinks } from '@/shared/constants/socLinks';

declare global {
  type Nullable<T> = T | null | undefined;

  export type DeepNullToUndefined<T> = T extends null
    ? undefined
    : T extends Record<string, any>
      ? { [K in keyof T]: DeepNullToUndefined<T[K]> }
      : T;
}

export type TSoclinksObject = Partial<Record<ESocLinks, string | undefined>>;
export type TGameHistory = Array<{ id: string; startTime: string }>;
