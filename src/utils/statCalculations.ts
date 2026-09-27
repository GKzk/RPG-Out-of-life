import {
  SpecialAttribute,
  SpecialStats,
  Character,
  DerivedStats,
  SkillName,
  AntiSynergyPenalty,
  SurvivalNeeds,
} from '../types/game';
import { SKILL_DEFINITIONS } from '../data/skills';
import { FEAT_DEFINITIONS } from '../data/feats';
import { ITEM_DATABASE } from '../data/items';
import { getMaxAP } from './characterSystem';

export const TOTAL_SPECIAL_POINTS = 40;
export const MAX_SPECIAL_POINT_POOL = 40;
export const MIN_SPECIAL = 1;
export const MAX_SPECIAL = 10;

/**
 * Calculates how many points a base stat value costs.
 * In the simplified 40-point SPECIAL model, each point in a stat costs exactly 1 point.
 */
export function getStatCost(val: number): number {
  return val;
}

export function getTotalSpecialPoints(special: SpecialStats): number {
  return (
    special.STR +
    special.PER +
    special.END +
    special.CHA +
    special.INT +
    special.AGI +
    special.LCK
  );
}

export function getTotalPointCost(special: SpecialStats): number {
  return getTotalSpecialPoints(special);
}

/**
 * Retained for backward-compatibility.
 * Anti-synergies have been removed as per the simplified Fallout-style SPECIAL design.
 */
export function getActiveAntiSynergies(_special: SpecialStats): AntiSynergyPenalty[] {
  return [];
}

/**
 * Calculates effective SPECIAL stats taking base, feats, and survival needs into account.
 * Automatic hidden anti-synergies are disabled: the player receives exactly their allocated SPECIAL
 * plus explicitly chosen feats and survival states.
 */
export function calculateEffectiveSpecial(
  base: SpecialStats,
  featIds: string[],
  needs: SurvivalNeeds
): SpecialStats {
  const effective: SpecialStats = { ...base };

  // 1. Feats
  featIds.forEach((featId) => {
    const feat = FEAT_DEFINITIONS.find((f) => f.id === featId);
    if (feat && feat.statModifiers) {
      (Object.keys(feat.statModifiers) as SpecialAttribute[]).forEach((attr) => {
        effective[attr] += feat.statModifiers![attr] || 0;
      });
    }
  });

  // 3. Survival Need Penalties
  // Hunger penalties
  if (needs.hunger > 80) {
    effective.STR -= 3;
    effective.END -= 3;
  } else if (needs.hunger > 60) {
    effective.STR -= 2;
    effective.END -= 2;
  } else if (needs.hunger > 30) {
    effective.STR -= 1;
  }

  // Thirst penalties
  if (needs.thirst > 80) {
    effective.PER -= 3;
    effective.AGI -= 3;
  } else if (needs.thirst > 60) {
    effective.PER -= 2;
    effective.AGI -= 2;
  } else if (needs.thirst > 30) {
    effective.PER -= 1;
  }

  // Fatigue penalties
  if (needs.fatigue > 70) {
    effective.AGI -= 2;
    effective.INT -= 2;
    effective.PER -= 2;
  } else if (needs.fatigue > 40) {
    effective.AGI -= 1;
    effective.INT -= 1;
  }

  // Radiation penalties
  if (needs.radiation >= 700) {
    effective.END -= 4;
    effective.STR -= 3;
    effective.AGI -= 2;
  } else if (needs.radiation >= 400) {
    effective.END -= 2;
    effective.STR -= 1;
  } else if (needs.radiation >= 200) {
    effective.END -= 1;
  }

  // Addictions withdrawal penalties
  if (needs.addictions.buffout.withdrawal) {
    effective.STR -= 2;
    effective.END -= 2;
  }
  if (needs.addictions.psycho.withdrawal) {
    effective.PER -= 2;
    effective.AGI -= 2;
  }
  if (needs.addictions.alcohol.withdrawal) {
    effective.CHA -= 2;
    effective.INT -= 2;
  }
  if (needs.addictions.stims.withdrawal) {
    effective.END -= 1;
    effective.AGI -= 1;
  }

  // Active chem bonuses
  if (needs.addictions.buffout.activeDuration > 0) {
    effective.STR += 2;
    effective.END += 2;
  }
  if (needs.addictions.psycho.activeDuration > 0) {
    effective.PER += 2;
    effective.AGI += 2;
  }
  if (needs.addictions.alcohol.activeDuration > 0) {
    effective.CHA += 2;
    effective.STR += 1;
  }

  // Clamp stats to minimum 1, max 10
  (Object.keys(effective) as SpecialAttribute[]).forEach((attr) => {
    effective[attr] = Math.max(1, Math.min(10, effective[attr]));
  });

  return effective;
}

/**
 * Derived Stats Calculation
 */
export function calculateDerivedStats(
  character: Character,
  effectiveSpecial: SpecialStats,
  inventoryItems: { item: any; quantity: number }[]
): DerivedStats {
  const { END, STR, AGI, LCK, PER } = effectiveSpecial;

  // Feat bonuses
  let featApBonus = 0;
  let featEvasionBonus = 0;
  let featCritBonus = 0;
  let featCarryBonus = 0;
  let featRadBonus = 0;
  let featDiseaseBonus = 0;

  character.feats.forEach((featId) => {
    const feat = FEAT_DEFINITIONS.find((f) => f.id === featId);
    if (feat) {
      if (feat.apBonus) featApBonus += feat.apBonus;
      if (feat.evasionBonus) featEvasionBonus += feat.evasionBonus;
      if (feat.critBonus) featCritBonus += feat.critBonus;
      if (feat.carryWeightBonus) featCarryBonus += feat.carryWeightBonus;
      if (feat.radResistBonus) featRadBonus += feat.radResistBonus;
      if (feat.diseaseResistBonus) featDiseaseBonus += feat.diseaseResistBonus;
    }
  });

  // Base Max HP formula
  let maxHp = 25 + END * 4 + STR;
  if (character.feats.includes('glass_cannon')) {
    maxHp = Math.floor(maxHp * 0.75); // -25% HP penalty
  }

  // Action Points AP
  // Canonical Character System AP baseline. Survival conditions do not alter
  // the formula itself; any future AP penalties must be explicitly designed.
  const maxAp = getMaxAP(AGI) + featApBonus;

  // Evasion / AC: 10 + floor(AGI / 2) + explicit ArmorAC.
  // Legacy `defense` is DT and must not silently double as AC.
  let armorDefense = 0;
  if (character.equippedArmorId) {
    const armorItem = ITEM_DATABASE.find((i) => i.id === character.equippedArmorId);
    if (armorItem?.armorData) {
      armorDefense = armorItem.armorData.armorClassBonus ?? 0;
    }
  }

  const evasion = 10 + Math.floor(AGI / 2) + armorDefense + featEvasionBonus;

  // Initiative = d20 + AGI/2 + PER/2
  const initiative = PER * 2 + AGI;

  // Critical Chance
  let critChance = LCK * 1.5 + featCritBonus;
  if (character.feats.includes('eloquent_diplomat')) {
    critChance = 0; // cannot deal crits
  }

  // Max Carry Weight = (STR * 6) + 25 + featCarryBonus
  const carryWeightMax = STR * 6 + 25 + featCarryBonus;

  // Current weight calculation
  let carryWeightCurrent = 0;
  inventoryItems.forEach((inv) => {
    carryWeightCurrent += inv.item.weight * inv.quantity;
  });

  // Radiation Resistance
  const radResist = Math.min(90, END * 5 + featRadBonus);

  // Disease Resistance
  const diseaseResist = Math.min(90, END * 4 + featDiseaseBonus + (character.survival.hunger < 20 ? 10 : 0));

  return {
    maxHp,
    currentHp: Math.min(character.currentHp, maxHp),
    maxAp,
    currentAp: Math.min(character.currentAp, maxAp),
    evasion,
    initiative,
    critChance,
    carryWeightMax,
    carryWeightCurrent,
    radResist,
    diseaseResist,
  };
}

/**
 * Calculate total value for a single skill
 */
export function calculateSkillValue(
  skillId: SkillName,
  character: Character,
  effectiveSpecial: SpecialStats
): number {
  const skillDef = SKILL_DEFINITIONS.find((s) => s.id === skillId);
  if (!skillDef) return 0;

  const primaryVal = effectiveSpecial[skillDef.primaryAttr] || 1;
  const secondaryVal = skillDef.secondaryAttr ? effectiveSpecial[skillDef.secondaryAttr] || 1 : 0;

  let baseVal = primaryVal * 3 + secondaryVal * 2;

  // Tag skill bonus (+20)
  if (character.taggedSkills.includes(skillId)) {
    baseVal += 20;
  }

  // Skill points manually invested
  const invested = character.skillPointsInvested[skillId] || 0;
  baseVal += invested;

  // Feat skill modifiers
  character.feats.forEach((featId) => {
    const feat = FEAT_DEFINITIONS.find((f) => f.id === featId);
    if (feat?.skillModifiers && feat.skillModifiers[skillId] !== undefined) {
      baseVal += feat.skillModifiers[skillId]!;
    }
  });

  // Legacy fallback
  if (character.feats.includes('eloquent_diplomat')) {
    if (skillId === 'persuasion' || skillId === 'barter') baseVal += 25;
    if (skillId === 'melee' || skillId === 'unarmed') baseVal -= 20;
  }

  // Canonical skill scale is 0–100. Attribute-derived skill plus investments
  // can otherwise exceed the progression ceiling once a character is highly specialized.
  return Math.max(1, Math.min(100, baseVal));
}

export type SkillCheckOutcome = 'success' | 'partial' | 'failure' | 'critical_failure' | 'critical_success';

export interface SkillCheckResult {
  baseScore: number;
  rollModifier: number;
  finalScore: number;
  margin: number;
  outcome: SkillCheckOutcome;
}

/**
 * Canonical skill-check score from GAME_DESIGN/SKILL_CHECK_BALANCE.md.
 * Skill is the independent 0–100 proficiency value; attributes contribute separately.
 */
export function calculateSkillCheckBase(attribute: number, skill: number): number {
  const safeAttribute = Math.max(1, Math.min(10, attribute));
  const safeSkill = Math.max(0, Math.min(100, skill));
  return safeAttribute * 4 + safeSkill * 0.6;
}

/**
 * Resolves the canonical 1d20 skill check.
 * Roll modifier is d20 - 10, producing -9..+10.
 */
export function resolveSkillCheck(
  attribute: number,
  skill: number,
  difficulty: number,
  d20: number,
  externalModifier = 0
): SkillCheckResult {
  if (!Number.isInteger(d20) || d20 < 1 || d20 > 20) {
    throw new Error('d20 result must be an integer in [1, 20]');
  }
  if (!Number.isFinite(difficulty)) {
    throw new Error('difficulty must be finite');
  }

  const baseScore = calculateSkillCheckBase(attribute, skill);
  const rollModifier = d20 - 10;
  const finalScore = baseScore + externalModifier + rollModifier;
  const margin = finalScore - difficulty;

  let outcome: SkillCheckOutcome;
  if (d20 === 20 && margin >= 0) outcome = 'critical_success';
  else if (d20 === 1 && margin < 0) outcome = 'critical_failure';
  else if (margin >= 0) outcome = 'success';
  else if (margin >= -9) outcome = 'partial';
  else if (margin >= -19) outcome = 'failure';
  else outcome = 'critical_failure';

  return { baseScore, rollModifier, finalScore, margin, outcome };
}

/**
 * Random d20 roll helper
 */
export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Calculates hit probability percentage in turn-based combat
 */
export function calculateHitChance(
  attackerSkillVal: number,
  attackerPerception: number,
  defenderEvasion: number,
  distance: 'melee' | 'close' | 'medium' | 'long',
  weaponRange: 'melee' | 'close' | 'medium' | 'long',
  hasHeavyStrikerFeat: boolean,
  hasSniperEyeFeat: boolean
): number {
  let baseChance = 50 + (attackerSkillVal / 2) + (attackerPerception * 3) - (defenderEvasion * 3);

  // Distance vs Weapon Range match penalties
  if (weaponRange === 'melee' && distance !== 'melee') {
    return 0; // cannot hit melee from afar
  }

  if (distance === 'long' && weaponRange === 'close') {
    baseChance -= 35;
  }
  if (distance === 'close' && weaponRange === 'long') {
    baseChance -= 20;
  }

  if (hasHeavyStrikerFeat) {
    baseChance -= 15;
  }

  if (hasSniperEyeFeat && (distance === 'medium' || distance === 'long')) {
    baseChance += 25;
  }

  return Math.max(5, Math.min(95, Math.round(baseChance)));
}
