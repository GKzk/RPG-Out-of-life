import { Character } from '../types/game';

/**
 * Canonical character progression.
 *
 * The curve follows the classic Fallout-style triangular XP model:
 * XP required for level N = 100 * N * (N - 1) / 2.
 *
 * It is intentionally scaled down from the original Fallout values because
 * this project currently awards combat XP in the 45–210 range and is a
 * smaller single-character mobile RPG.
 */
export const MAX_LEVEL = 20;
export const XP_UNIT = 100;

export const PERK_LEVELS = [3, 6, 9, 12, 15, 18] as const;

export function getXpForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  return XP_UNIT * safeLevel * (safeLevel - 1) / 2;
}

export function getXpForNextLevel(level: number): number | null {
  const safeLevel = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  return safeLevel >= MAX_LEVEL ? null : getXpForLevel(safeLevel + 1);
}

export function getXpToNextLevel(level: number, xp: number): number {
  const next = getXpForNextLevel(level);
  if (next === null) return 0;
  return Math.max(0, next - Math.max(0, Math.floor(xp)));
}

export function getLevelForXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;

  while (level < MAX_LEVEL && safeXp >= getXpForLevel(level + 1)) {
    level += 1;
  }

  return level;
}

export function isPerkLevel(level: number): boolean {
  return (PERK_LEVELS as readonly number[]).includes(level);
}

export function getPerksEarnedByLevel(level: number): number {
  const safeLevel = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  return PERK_LEVELS.filter((perkLevel) => perkLevel <= safeLevel).length;
}

/**
 * Number of level-up perk choices still owed to the character.
 * Starting feats are intentionally excluded: this only counts progression perks.
 */
export function getPendingPerkChoices(character: Character): number {
  const expected = getPerksEarnedByLevel(character.level);
  const progressionFeats = Math.max(0, character.feats.length - 1);
  return Math.max(0, expected - progressionFeats);
}
