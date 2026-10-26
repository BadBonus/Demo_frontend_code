export enum ETokenTypes {
  Text = 'text',
  Filter = 'filter',
  NegatedFilter = 'negated_filter',
}
export type TokenType = `${ETokenTypes}`;

export interface Token {
  type: TokenType;
  key?: string;
  value?: string;
  raw: string;
  start: number;
  end: number;
}

export interface SuggestionItem {
  id: string | number;
  label: string;
  value: string;
  /** Ключ/label, который уходит в insertEntity / строку инпута. */
  tagKey?: string;
  /** Человекочитаемое имя тега для бейджа в списке. */
  tagLabel?: string;
  badgeColor?: string;
  type?: 'tag' | 'entity';
}

export interface TagConfig {
  key: string;
  label: string;
  icon?: string;
  badgeColor?: string;
}
