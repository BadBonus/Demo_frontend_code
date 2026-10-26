import type { ESkillGameMaster } from '@/shared/skills';
import type { ELang } from '#consts/lang';
import type { GameSystem } from '#openApi/enums';

type TGMFilters = {
  sortBy?: ESkillGameMaster;
  lang?: ELang[];
  timezone?: string;
  cost?: {
    from: number;
    to: number;
  };
  gameType?: string[]; // потом добавить enum отдельный,
  theme?: string[]; // тоже отдельно добавить
  gameSystems?: GameSystem[];
};
