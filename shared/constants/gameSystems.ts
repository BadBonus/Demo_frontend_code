import type { GameSystem } from '#openApi/enums';
import type { TBadgeListItem } from '@/components/globals/BadgeList.vue';
import { GAME_SYSTEM_BADGES_GENERATED } from './gameSystems.generated';
import { GAME_SYSTEM_BADGE_OVERRIDES } from './gameSystemOverrides';

export const GAME_SYSTEM_BADGES = Object.fromEntries(
  (Object.keys(GAME_SYSTEM_BADGES_GENERATED) as GameSystem[]).map((key) => [
    key,
    {
      ...GAME_SYSTEM_BADGES_GENERATED[key],
      ...GAME_SYSTEM_BADGE_OVERRIDES[key],
    },
  ]),
) as Record<GameSystem, TBadgeListItem>;
