import { ERoles } from '#consts/roles';

export type TSkillItem = {
  id: ESkillPlayer | ESkillGameMaster;
  rating: number;
  icon: string;
  title: string;
};

export enum ESkillPlayer {
  creativity = 'creativity',
  artistry = 'artistry',
  playerEducation = 'playerEducation',
}

export enum ESkillGameMaster {
  CREATIVITY = 'creativity',
  STORYTELLING = 'storytelling',
  PLAYER_EDUCATION = 'playerEducation',
  THEATRICALISE = 'theatricalise',
}

export const skillItems: Record<ERoles.gamemaster | ERoles.player, TSkillItem[]> = {
  [ERoles.player]: [
    { id: ESkillPlayer.creativity, rating: 0, icon: 'game-icons:light-bulb', title: 'Креативность' },
    { id: ESkillPlayer.artistry, rating: 0, icon: 'game-icons:duality-mask', title: 'Артистизм' },
    { id: ESkillPlayer.playerEducation, rating: 0, icon: 'game-icons:graduate-cap', title: 'Знание правил' },
  ],
  [ERoles.gamemaster]: [
    { id: ESkillGameMaster.CREATIVITY, rating: 0, icon: 'game-icons:light-bulb', title: 'Креативность' },
    { id: ESkillGameMaster.THEATRICALISE, rating: 0, icon: 'game-icons:duality-mask', title: 'Артистизм' },
    { id: ESkillGameMaster.PLAYER_EDUCATION, rating: 0, icon: 'game-icons:graduate-cap', title: 'Знание правил' },
    { id: ESkillGameMaster.STORYTELLING, rating: 0, icon: 'game-icons:teacher', title: 'Сторителлинг' },
  ],
};

// FIXME: для начала я создаю такой массив стринговых наименований для скилла, это костыль-заглушка с учетом в дальнейшем перейти на i18n, что в корне поменяет структуру объектов.
export const titleRussian = {
  [ESkillPlayer.creativity]: 'Креативность',
  [ESkillPlayer.artistry]: 'Артистизм',
  [ESkillPlayer.playerEducation]: 'Знание правил',
  [ESkillGameMaster.STORYTELLING]: 'Сторителлинг',
};

export const skillPlayer = Object.values(ESkillPlayer);
export const skillGameMaster = Object.values(ESkillGameMaster);

export const skillsByRole: Record<ERoles.player | ERoles.gamemaster, string[]> = {
  [ERoles.player]: skillPlayer,
  [ERoles.gamemaster]: skillGameMaster,
};
