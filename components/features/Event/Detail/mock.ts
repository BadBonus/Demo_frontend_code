import type { TEventCard } from '@/components/features/Event/mappers';
import { ERoles } from '#consts/roles';
import { skillItems } from '@/shared/skills';
import type { TEventDetailProps } from './detail.types';

const startsAt = '2026-10-24T16:00:00.000Z';
const endsAt = '2026-10-24T20:00:00.000Z';

const similarBase = {
  gameSystem: 'DUNGEONS_AND_DRAGONS_5E' as const,
  format: 'OFFLINE' as const,
  sessionType: 'ONE_SHOT' as const,
  startsAt,
  maxUsers: 5,
  genres: ['FANTASY', 'HORROR'] as TEventCard['genres'],
  org: { nickname: 'Вран', avatar: null },
  currentCountOfPlayers: 3,
  costValue: 100,
  currency: 'BYN',
  ageLimit: 18,
  preview: '/images/bg_decors/png/gm_background_2.png',
  isFavorite: false,
};

export const eventDetailMock: TEventDetailProps = {
  id: 'mock-event-curse-of-strahd',
  name: 'Проклятие Страда: ночь в Баровии',
  slug: 'curse-of-strahd-barovia-night',
  isFavorite: false,
  preview: '/images/bg_decors/png/gm_background_2.png',
  gameSystem: 'DUNGEONS_AND_DRAGONS_5E',
  format: 'ONLINE',
  sessionType: 'ONE_SHOT',
  ageLimit: 18,
  genres: ['FANTASY', 'HORROR', 'OTHER'],
  description:
    'В ту ночь, когда луна скрылась за тучами Баровии, колокол замка Равенлофт пробил полночь. ' +
    'Путешественники оказываются в туманной деревне, где каждый взгляд сулит беду, а каждый шаг ' +
    'ведёт ближе к графу Страду фон Заровичу. Готовы ли вы бросить вызов тьме — или стать её частью?',
  synopsis:
    'Приключение происходит в фентези-мире, наполненном нечистью. Интриги, заговоры и опасности ' +
    'ждут партию под правилами D&D 2024 с доработками мастера.',
  address: null,
  lat: null,
  lng: null,
  mapUrl: null,
  onlineLinks: [
    { label: 'Discord', url: 'https://discord.gg/example' },
    { label: 'Roll20', url: 'https://app.roll20.net/campaigns/details/example' },
  ],
  materials: [
    {
      id: 'mat-file-chars',
      type: 'FILE',
      title: 'Шаблон персонажа',
      originalName: 'character_school.docx',
      href: '#',
      sizeBytes: 48_128,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
      id: 'mat-file-lore',
      type: 'FILE',
      title: 'Лор Баровии',
      originalName: 'barovia_lore.pdf',
      href: '#',
      sizeBytes: 1_458_176,
      mimeType: 'application/pdf',
    },
    {
      id: 'mat-file-maps',
      type: 'FILE',
      title: 'Пак карт',
      originalName: 'maps_pack.zip',
      href: '#',
      sizeBytes: 3_210_240,
      mimeType: 'application/zip',
    },
    {
      id: 'mat-note-prep',
      type: 'NOTE',
      title: 'Что взять с собой',
      body:
        '<p>Приходите за <strong>10–15 минут</strong> до старта.</p>' +
        '<ul><li>Кубики (или возьмём на месте)</li><li>Блокнот и ручка</li><li>Хорошее настроение</li></ul>',
    },
    {
      id: 'mat-note-rules',
      type: 'NOTE',
      title: 'Хаусрулы стола',
      body:
        '<p>Играем по <strong>D&amp;D 5e</strong> с небольшими правками.</p>' +
        '<ul><li>Critical fail на натуральной 1 — сюжетный фейл</li>' +
        '<li>Рескины и флафф приветствуются</li></ul>' +
        '<p>Вопросы — в <a href="https://t.me/" rel="noopener noreferrer" target="_blank">чат сессии</a>.</p>',
    },
    {
      id: 'mat-note-safety',
      type: 'NOTE',
      title: 'Безопасность и тон',
      body:
        '<p>Тон сессии — <strong>тёмный хоррор</strong>, но без шок-контента ради шока.</p>' +
        '<ul><li>X-card на столе</li><li>Можно выйти из сцены без объяснений</li></ul>',
    },
    {
      id: 'mat-note-char',
      type: 'NOTE',
      title: 'Создание персонажа',
      body:
        '<p>Уровень <strong>3</strong>, стандартный массив характеристик.</p>' +
        '<ul><li>Стартовое снаряжение по классу</li><li>1–2 предложения бэкстори</li></ul>',
    },
    {
      id: 'mat-note-place',
      type: 'NOTE',
      title: 'Как нас найти',
      body:
        '<p>Вход со двора, табличка <strong>«Настолки»</strong>.</p>' + '<p>Если заблудились — напишите мастеру в Telegram.</p>',
    },
  ],
  master: {
    nickname: 'Вран',
    avatar: null,
    slug: 'vran',
    gamesCount: 33,
    discordUrl: '#',
    telegramUrl: '#',
    countryCode: 'by',
    description: 'Веду тёмное фэнтези и ваншоты в духе Баровии. Люблю атмосферу, интриги и честный риск для партии.',
    skills: skillItems[ERoles.gamemaster].map((skill, index) => ({
      ...skill,
      rating: [4, 5, 3, 4][index] ?? 3,
    })),
  },
  startsAt,
  endsAt,
  maxUsers: 5,
  currentCountOfPlayers: 3,
  costValue: 100,
  currency: 'BYN',
  showLocation: true,
  showMaterials: true,
  similar: [
    {
      ...similarBase,
      id: 'mock-event-mist-of-barovia',
      slug: 'mist-of-barovia',
      name: 'Туманы Баровии',
      link: '/Events/mist-of-barovia',
      currentCountOfPlayers: 4,
      maxUsers: 6,
      costValue: 80,
    },
    {
      ...similarBase,
      id: 'mock-event-ravenloft-night',
      slug: 'ravenloft-night',
      name: 'Ночь в Равенлофте',
      link: '/Events/ravenloft-night',
      genres: ['HORROR', 'FANTASY'],
      costValue: 120,
    },
    {
      ...similarBase,
      id: 'mock-event-curse-oneshot',
      slug: 'curse-oneshot',
      name: 'Проклятие: ваншот',
      link: '/Events/curse-oneshot',
      currentCountOfPlayers: 2,
      costValue: null,
    },
  ],
};
