import type { GameSystem } from '#openApi/enums';
import type { TBadgeListItem } from '@/components/globals/BadgeList.vue';

export const GAME_SYSTEM_BADGE_OVERRIDES: Partial<Record<GameSystem, Partial<TBadgeListItem>>> = {
  DUNGEONS_AND_DRAGONS_5E: {
    shortLabel: 'dnd 5e',
    fullLabel: 'dungeons and dragons 5e',
  },
  PATHFINDER_2E: {
    shortLabel: 'pf 2e',
    fullLabel: 'pathfinder 2e',
  },
  CALL_OF_CTHULHU: {
    shortLabel: 'coc',
    fullLabel: 'call of cthulhu',
  },
  VAMPIRE_THE_MASQUERADE_5TH_EDITION: {
    shortLabel: 'vtm 5e',
    fullLabel: 'vampire the masquerade 5th edition',
  },
};
