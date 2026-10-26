/**
 * Parser and mutator utilities for the search-filter input string.
 *
 * The input string follows a small DSL:
 *
 *   - `key:value`
 *   - `"key with spaces":value` — quoted keys (human-readable labels)
 *   - `key:"quoted value"` — quoted values may contain spaces
 *   - `-key:value` — leading `-` marks a negated filter
 *   - any other non-whitespace chunk is treated as free-text
 *
 * This module turns that string into tokens ({@link parseSearchString}),
 * derives the "caret context" (what the user is currently editing —
 * {@link getCaretContext}), and performs insert / replace / remove
 * operations that preserve caret position.
 *
 * All exported functions are **pure**: they take an input string (plus
 * optional token / caret) and return a new string together with the new
 * caret offset. No DOM, no reactive state, no side effects — safe to unit
 * test and reuse across components.
 *
 * @module searchFilterParser
 */

import type { Token } from './types';
import { ETokenTypes } from './types';

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

/**
 * Discriminator describing what the user is editing at the caret.
 *
 * - `empty` — input is empty / only whitespace.
 * - `after_tag_key` — caret sits right after `key:`, no value yet (`gameSystem:`).
 * - `inside_entity_value` — caret is inside the unquoted value of a filter (`gameSystem:wo|`).
 * - `inside_word` — caret is inside a free-text word, not part of any filter.
 * - `on_token` — caret is inside a fully-formed filter with a quoted value
 *   (used to offer "toggle negation" / "remove token" actions).
 */
export type CaretContextType = 'empty' | 'after_tag_key' | 'inside_entity_value' | 'inside_word' | 'on_token';

/**
 * A snapshot of what the user is editing at a given caret position.
 *
 * Not every field is populated for every `type`; see the comments on
 * {@link CaretContextType} for the mapping.
 */
export interface CaretContext {
  /** Kind of context, see {@link CaretContextType}. */
  type: CaretContextType;

  /**
   * The fully-parsed token the caret is currently sitting on.
   * Only present when `type === 'on_token'`.
   */
  activeToken?: Token;

  /**
   * The word (or filter value prefix) currently being typed.
   * For `inside_word` this is the whole word; for `inside_entity_value`
   * this is the value with the leading quote stripped, if any.
   */
  queryWord?: string;

  /**
   * Tag key as it appears in the input string (label or legacy API key),
   * without surrounding quotes (e.g. `Игровая система`, `gameSystem`).
   */
  tagKey?: string;

  /** Whether the filter the caret is inside is prefixed with `-`. */
  isNegated?: boolean;

  /**
   * Inclusive start offset of the current prefix in the input string.
   * Used by the caller to know what to replace.
   */
  prefixStart?: number;

  /** Exclusive end offset of the current prefix in the input string. */
  prefixEnd?: number;
}

/**
 * Extra options for {@link insertEntity} when the caller already knows
 * which tag the value belongs to (e.g. from a suggestion item).
 */
export interface InsertEntityOptions {
  /** Tag key to attach to the inserted entity (label or API key). */
  tagKey?: string;
  /** Whether the resulting filter should be negated (`-key:"value"`). */
  isNegated?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                             Regex & constants                              */
/* -------------------------------------------------------------------------- */

/**
 * Bare tag key — no spaces, no quotes, no colon.
 * Allows Unicode (e.g. `Формат`, `мин.Цена`) and legacy ASCII keys.
 */
const BARE_TAG_KEY = '[^\\s:"]+';

/** Quoted tag key: `"Игровая система"`. */
const QUOTED_TAG_KEY = '"([^"]+)"';

/** Optional `-` + quoted or bare key + `:`. */
const TAG_KEY_PREFIX = `(-?)(?:${QUOTED_TAG_KEY}|(${BARE_TAG_KEY})):`;

/**
 * Matches an incomplete filter at the **end** of a substring:
 * optional `-`, tag key, `:`, and any trailing non-whitespace value.
 *
 * Groups: [neg, quotedKey, bareKey, value]
 */
const INCOMPLETE_FILTER_AT_END = new RegExp(`${TAG_KEY_PREFIX}([^\\s]*)$`);

/**
 * Matches the **prefix** of an incomplete filter at the end of a substring.
 * Group 1 is the full `-?key:` prefix (quotes included when present).
 */
const INCOMPLETE_FILTER_PREFIX = new RegExp(`(-?(?:${QUOTED_TAG_KEY}|${BARE_TAG_KEY}):)[^\\s]*$`);

/** Fully-formed filter ends with a quoted value (`:"…"`). */
const HAS_QUOTED_VALUE = /:"[^"]*"$/;

/** Matches the trailing non-whitespace word of a string. */
const WORD_AT_END = /([^\s]+)$/;

/** Matches the leading non-whitespace word of a string. */
const WORD_AT_START = /^([^\s]+)/;

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

/**
 * Formats a tag name for the input DSL: wraps in quotes when the name
 * contains whitespace or a double-quote.
 */
export function formatTagKey(name: string): string {
  if (/[\s"]/.test(name)) {
    return `"${name.replace(/"/g, '')}"`;
  }
  return name;
}

/** Builds `-?key:` prefix for mutators. */
function formatTagPrefix(name: string, isNegated = false): string {
  return `${isNegated ? '-' : ''}${formatTagKey(name)}:`;
}

/**
 * Strips optional leading `-`, trailing `:`, and surrounding quotes from a
 * raw filter prefix (e.g. `-"Игровая система":` → `Игровая система`).
 */
function unwrapTagKeyFromPrefix(rawPrefix: string): string {
  const stripped = rawPrefix.replace(/^-/, '').replace(/:$/, '');
  if (stripped.startsWith('"') && stripped.endsWith('"') && stripped.length >= 2) {
    return stripped.slice(1, -1);
  }
  return stripped;
}

/** Clamps `value` into the inclusive `[min, max]` range. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/** Bounds of the word surrounding a caret position. */
interface WordBounds {
  /** Word to the left of the caret (may be empty). */
  left: string;
  /** Word to the right of the caret (may be empty). */
  right: string;
  /** Inclusive start offset of the full word. */
  start: number;
  /** Exclusive end offset of the full word. */
  end: number;
}

/**
 * Computes the contiguous non-whitespace word around `caretPos`, taking
 * the part to the left and to the right of the caret into account.
 *
 * @example
 *   // caret between 'he' and 'llo'
 *   getWordBounds('hello world', 2);
 *   // → { left: 'he', right: 'llo', start: 0, end: 5 }
 */
function getWordBounds(input: string, caretPos: number): WordBounds {
  const safeCaretPos = clamp(caretPos, 0, input.length);
  const leftPart = input.slice(0, safeCaretPos);
  const rightPart = input.slice(safeCaretPos);

  const left = leftPart.match(WORD_AT_END)?.[1] ?? '';
  const right = rightPart.match(WORD_AT_START)?.[1] ?? '';

  return {
    left,
    right,
    start: safeCaretPos - left.length,
    end: safeCaretPos + right.length,
  };
}

/* -------------------------------------------------------------------------- */
/*                              Parsing & context                             */
/* -------------------------------------------------------------------------- */

/**
 * Splits the input string into a flat list of tokens.
 *
 * Recognised token shapes (in priority order):
 *
 *   - `-?"quoted key":"quoted value"` / `-?bareKey:value`
 *   - `anything-else` — free text
 *
 * @param input - The full search string.
 * @returns Array of tokens with `start` / `end` offsets into `input`.
 *
 * @example
 *   parseSearchString('-gameSystem:"world of darkness" hello');
 *   // → [
 *   //   { type: NegatedFilter, key: 'gameSystem',
 *   //     value: 'world of darkness', raw: '-gameSystem:"world of darkness"',
 *   //     start: 0, end: 35 },
 *   //   { type: Text, raw: 'hello', start: 36, end: 41 },
 *   // ]
 */
export function parseSearchString(input: string): Token[] {
  const tokens: Token[] = [];

  if (!input) {
    return tokens;
  }

  // Fresh instance per call — `g` flag keeps `lastIndex` state on the regex,
  // which must not leak between invocations.
  const tokenRegex = /(?<neg>-?)(?:"(?<qkey>[^"]+)"|(?<key>[^\s:"]+)):(?:"(?<quoted>[^"]*)"|(?<bare>[^\s]*))|(?<text>[^\s]+)/g;

  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(input)) !== null) {
    const raw = match[0];
    const start = match.index;
    const end = start + raw.length;
    const groups = match.groups ?? {};

    const key = groups.qkey ?? groups.key;

    if (key !== undefined) {
      const isNegated = groups.neg === '-';
      const value = groups.quoted !== undefined ? groups.quoted : (groups.bare ?? '');

      tokens.push({
        type: isNegated ? ETokenTypes.NegatedFilter : ETokenTypes.Filter,
        key,
        value,
        raw,
        start,
        end,
      });
    } else {
      tokens.push({
        type: ETokenTypes.Text,
        raw,
        start,
        end,
      });
    }
  }

  return tokens;
}

/**
 * Determines what the user is editing at `caretPos`.
 *
 * The result is used by the input component to decide which suggestion
 * list to show and what prefix to replace when a suggestion is picked.
 *
 * @param input - The full search string.
 * @param caretPos - Caret offset inside `input` (0 = before the first char).
 * @returns A {@link CaretContext} describing the current editing position.
 *
 * @example
 *   getCaretContext('gameSystem:world', 12);
 *   // → { type: 'inside_entity_value', tagKey: 'gameSystem',
 *   //     queryWord: 'world', isNegated: false,
 *   //     prefixStart: 0, prefixEnd: 17 }
 */
export function getCaretContext(input: string, caretPos: number): CaretContext {
  if (!input || input.trim() === '') {
    return { type: 'empty' };
  }

  const safeCaretPos = clamp(caretPos, 0, input.length);
  const tokens = parseSearchString(input);

  /*
   * 1. Caret inside a fully-formed filter with a quoted value →
   *    offer "toggle negation" / "remove token" actions.
   *    (Quoted keys alone do not count — `"Label":` is incomplete.)
   */
  for (const token of tokens) {
    const isFilter = token.type === ETokenTypes.Filter || token.type === ETokenTypes.NegatedFilter;

    if (isFilter && HAS_QUOTED_VALUE.test(token.raw) && safeCaretPos >= token.start && safeCaretPos <= token.end) {
      return {
        type: 'on_token',
        activeToken: token,
      };
    }
  }

  const leftPart = input.slice(0, safeCaretPos);

  /*
   * 2. Caret inside an incomplete filter at the end of the left side,
   *    e.g. `gameSystem:|`, `"Игровая система":|`, or `gameSystem:wo|`.
   */
  const incomplete = leftPart.match(INCOMPLETE_FILTER_AT_END);

  if (incomplete) {
    const isNegated = incomplete[1] === '-';
    const tagKey = incomplete[2] ?? incomplete[3] ?? '';
    const currentVal = incomplete[4] ?? '';

    const prefixStart = safeCaretPos - incomplete[0].length;
    const prefixEnd = safeCaretPos;

    if (!currentVal) {
      return {
        type: 'after_tag_key',
        tagKey,
        isNegated,
        prefixStart,
        prefixEnd,
      };
    }

    return {
      type: 'inside_entity_value',
      tagKey,
      queryWord: currentVal.replace(/^"/, ''),
      isNegated,
      prefixStart,
      prefixEnd,
    };
  }

  /*
   * 3. Caret inside a free-text word.
   */
  const word = getWordBounds(input, safeCaretPos);

  if (word.left) {
    return {
      type: 'inside_word',
      queryWord: word.left + word.right,
      prefixStart: word.start,
      prefixEnd: word.end,
    };
  }

  return { type: 'empty' };
}

/* -------------------------------------------------------------------------- */
/*                                   Mutators                                 */
/* -------------------------------------------------------------------------- */

/**
 * Inserts `tagKey:` at the caret, replacing the current word if any.
 *
 * Used when the user selects a tag suggestion (e.g. "gameSystem").
 * A colon is appended so the user lands in {@link CaretContextType}
 * `after_tag_key` and can immediately pick a value.
 *
 * @param input - Current search string.
 * @param caretPos - Caret offset inside `input`.
 * @param tagKey - Tag key to insert (without the trailing colon).
 * @returns New string and new caret offset (right after the inserted `:`).
 */
export function insertTag(input: string, caretPos: number, tagKey: string): { newString: string; newCaretPos: number } {
  const safeCaretPos = clamp(caretPos, 0, input.length);

  const leftPart = input.slice(0, safeCaretPos);
  const rightPart = input.slice(safeCaretPos);

  const wordMatch = leftPart.match(WORD_AT_END);
  const startPos = wordMatch ? safeCaretPos - (wordMatch[1]?.length ?? 0) : safeCaretPos;

  const insertion = formatTagPrefix(tagKey);

  // Deliberately drop any non-whitespace tail to the right of the caret:
  // the user is completing the current word into a tag, not appending after it.
  const newString = input.slice(0, startPos) + insertion + rightPart.replace(/^[^\s]*/, '');

  const newCaretPos = startPos + insertion.length;

  return { newString, newCaretPos };
}

/**
 * Inserts a fully-quoted entity at the caret, replacing whatever filter
 * or word was under the cursor.
 *
 * Three cases are handled, in order:
 *
 *  1. There is an incomplete filter on the left (`gameSystem:wo|`)
 *     → replace the whole filter with `gameSystem:"value" `.
 *  2. There is a bare word under the caret
 *     → replace the word with `tagKey:"value" ` (or just `"value" ` when
 *     no `tagKey` is provided).
 *  3. Otherwise
 *     → insert the quoted entity at the caret as-is.
 *
 * A trailing space is always appended and the caret is placed **after**
 * that space, so the user can keep typing a new token immediately.
 *
 * @param input - Current search string.
 * @param caretPos - Caret offset inside `input`.
 * @param entityValue - The value to insert (will be wrapped in double quotes).
 * @param options - Optional tag key and negation flag.
 * @returns New string and new caret offset.
 *
 * @example
 *   insertEntity('gameSystem:wo', 14, 'world_of_darkness');
 *   // → {
 *   //   newString: 'gameSystem:"world_of_darkness" ',
 *   //   newCaretPos: 34,
 *   // }
 */
export function insertEntity(
  input: string,
  caretPos: number,
  entityValue: string,
  options: InsertEntityOptions = {},
): { newString: string; newCaretPos: number } {
  const safeCaretPos = clamp(caretPos, 0, input.length);

  const { tagKey, isNegated = false } = options;

  const leftPart = input.slice(0, safeCaretPos);
  const rightPart = input.slice(safeCaretPos);

  /*
   * Case 1. Incomplete filter on the left:
   *
   *   gameSystem:w|
   *        ↓
   *   gameSystem:"world_of_darkness" |
   */
  const incompleteFilterMatch = leftPart.match(INCOMPLETE_FILTER_PREFIX);

  if (incompleteFilterMatch) {
    const filterPrefix = incompleteFilterMatch[1] ?? '';

    const prefixStart = safeCaretPos - incompleteFilterMatch[0].length;

    // Prefer an explicit tagKey from the caller; fall back to the one
    // already typed by the user (quotes stripped).
    const resolvedTagKey = tagKey ?? unwrapTagKeyFromPrefix(filterPrefix);

    // Explicit flag and inline `-` prefix are both respected.
    const negation = isNegated || filterPrefix.startsWith('-');

    const replacement = `${formatTagPrefix(resolvedTagKey, negation)}"${entityValue}" `;

    /*
     * Drop the remainder of the incomplete filter to the right of the
     * caret. Two passes on purpose: first an optional quoted tail, then
     * any bare-word tail (see "foo\"bar\"baz" edge case — both must go).
     */
    const cleanRight = rightPart.replace(/^"[^"]*"?/, '').replace(/^[^\s]*/, '');

    const newString = input.slice(0, prefixStart) + replacement + cleanRight;

    return {
      newString,
      newCaretPos: prefixStart + replacement.length,
    };
  }

  /*
   * Case 2. Bare word under the caret:
   *
   *   w|
   *     ↓
   *   gameSystem:"world_of_darkness" |
   *
   * Replace the word instead of appending after it.
   */
  const word = getWordBounds(input, safeCaretPos);

  if (word.left) {
    if (tagKey) {
      const replacement = `${formatTagPrefix(tagKey, isNegated)}"${entityValue}" `;

      const newString = input.slice(0, word.start) + replacement + input.slice(word.end);

      return {
        newString,
        newCaretPos: word.start + replacement.length,
      };
    }

    /*
     * Fallback when the suggestion carries no tagKey: just substitute
     * the current word with the quoted entity.
     */
    const replacement = `"${entityValue}" `;
    const newString = input.slice(0, word.start) + replacement + input.slice(word.end);

    return {
      newString,
      newCaretPos: word.start + replacement.length,
    };
  }

  /*
   * Case 3. No word / filter — insert at the caret.
   */
  const prefix = tagKey ? formatTagPrefix(tagKey, isNegated) : '';
  const replacement = `${prefix}"${entityValue}" `;

  const newString = input.slice(0, safeCaretPos) + replacement + rightPart;

  return {
    newString,
    newCaretPos: safeCaretPos + replacement.length,
  };
}

/**
 * Toggles the `-` negation prefix of an already-formed filter token.
 *
 * The token is normalised to the quoted form `-?key:"value"` regardless
 * of how it was originally typed, so the result is always unambiguous.
 *
 * @param input - Current search string.
 * @param token - The filter token to toggle (must be `Filter` or `NegatedFilter`).
 * @param caretPos - Current caret offset, used to restore position if
 *                   the token cannot be negated (defensive branch).
 *                   Defaults to `token.end` for backwards compatibility.
 * @returns New string and new caret offset (right after the rewritten token).
 */
export function toggleTokenNegation(input: string, token: Token, caretPos?: number): { newString: string; newCaretPos: number } {
  if (!token.key) {
    /*
     * Defensive: text tokens have no key and cannot be negated.
     * Return the input untouched and restore the caret to its previous
     * position if the caller provided it.
     */
    return {
      newString: input,
      newCaretPos: caretPos ?? token.end,
    };
  }

  const updatedTokenRaw =
    token.type === ETokenTypes.NegatedFilter
      ? `${formatTagPrefix(token.key)}"${token.value}"`
      : `${formatTagPrefix(token.key, true)}"${token.value}"`;

  const newString = input.slice(0, token.start) + updatedTokenRaw + input.slice(token.end);

  const newCaretPos = token.start + updatedTokenRaw.length;

  return { newString, newCaretPos };
}

/**
 * Removes a filter token from the input, collapsing the whitespace seam
 * left behind.
 *
 * Whitespace **inside** the rest of the string (including inside other
 * quoted values) is preserved — only the boundary between the segments
 * before and after the removed token is normalised.
 *
 * @param input - Current search string.
 * @param token - The token to remove.
 * @returns New string and new caret offset, clamped to the new length.
 *
 * @example
 *   removeToken('tag:"hello  world" other value', otherToken);
 *   // → 'tag:"hello  world" value' — inner double-space kept intact.
 */
export function removeToken(input: string, token: Token): { newString: string; newCaretPos: number } {
  const before = input.slice(0, token.start).replace(/\s+$/, '');
  const after = input.slice(token.end).replace(/^\s+/, '');

  const separator = before && after ? ' ' : '';
  const newString = before + separator + after;

  const newCaretPos = Math.min(token.start, newString.length);

  return { newString, newCaretPos };
}
