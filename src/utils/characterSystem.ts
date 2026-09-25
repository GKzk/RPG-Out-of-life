import { SpecialAttribute, SpecialStats } from '../types/game';

export const POINT_BUY_BUDGET = 28;
export const MIN_SPECIAL = 1;
export const MAX_SPECIAL = 10;

export function getAttributeMod(value: number): number {
  return value - 5;
}

export function getPointBuyCost(value: number): number {
  if (value < MIN_SPECIAL || value > MAX_SPECIAL) {
    throw new Error(`SPECIAL must be in [${MIN_SPECIAL}, ${MAX_SPECIAL}]`);
  }
  if (value === 1) return 0;
  if (value <= 6) return value - 1;
  if (value === 7) return 7;
  if (value === 8) return 10;
  if (value === 9) return 14;
  return 19;
}

export function getTotalPointBuyCost(special: SpecialStats): number {
  return (Object.keys(special) as SpecialAttribute[])
    .reduce((sum, attr) => sum + getPointBuyCost(special[attr]), 0);
}

export function isValidPointBuy(special: SpecialStats): boolean {
  return getTotalPointBuyCost(special) <= POINT_BUY_BUDGET;
}

export function calculateMeleeDamage(rollWeaponDice: number, str: number): number {
  return Math.max(1, rollWeaponDice + (str - 5));
}

export function calculateCritMeleeDamage(maxWeaponDice: number, rollWeaponDice: number, str: number): number {
  return Math.max(1, maxWeaponDice + rollWeaponDice + (str - 5));
}

export function applyRareAmmoLuck(baseProbability: number): number {
  return Math.min(1, baseProbability * 1.2);
}

export function getMaxAP(agi: number): number {
  return 7 + Math.floor(agi / 2);
}

export function getCompanionSlots(cha: number): number {
  return Math.max(0, Math.floor((cha - 2) / 3));
}

export function getFoodPerDay(activeCompanions: number): number {
  return 1 + Math.max(0, activeCompanions);
}

export function getWaterPerDay(activeCompanions: number): number {
  return 1 + Math.max(0, activeCompanions);
}

export function getCompanionCarryBonusKg(activeCompanions: number): number {
  return Math.max(0, activeCompanions) * 30;
}

export function getCompanionSupportFireAmmoCost(companionActions: number): number {
  return Math.max(0, companionActions);
}

export interface BurstAttackInput {
  baseShotAP: number;
  attackMod: number;
  skillBonus: number;
  weaponAccuracy: number;
  weaponDieRoll: number;
  maxWeaponDie: number;
  weaponFlat: number;
  attributeMod: number;
  d20: number;
}

export interface BurstAttackResult {
  apCost: number;
  ammoCost: 3;
  attackTotal: number;
  hit: boolean;
  critical: boolean;
  misfire: boolean;
  damage: number;
}

export function getBurstAP(baseShotAP: number): number {
  return baseShotAP + 2;
}

export function getBurstAttackTotal(
  d20: number,
  attackMod: number,
  skillBonus: number,
  weaponAccuracy: number
): number {
  return d20 + attackMod + skillBonus + weaponAccuracy - 4;
}

export function getLckThreatMin(lck: number): number {
  if (lck <= 4) return 20;
  if (lck <= 7) return 19;
  if (lck <= 9) return 18;
  return 17;
}

export function isNatural20(d20: number): boolean {
  return d20 === 20;
}

export function isNatural1(d20: number): boolean {
  return d20 === 1;
}

export function isBurstCritical(d20: number, lck: number, attackTotal: number, targetAC: number): boolean {
  if (d20 === 20) return true;
  const threat = d20 >= getLckThreatMin(lck);
  return threat && attackTotal >= targetAC;
}

export function calculateBurstDamage(
  weaponDieRoll: number,
  weaponFlat: number,
  attributeMod: number
): number {
  return Math.max(1, 2 * weaponDieRoll + weaponFlat + attributeMod);
}

export function calculateCritBurstDamage(
  maxWeaponDie: number,
  weaponDieRoll: number,
  weaponFlat: number,
  attributeMod: number
): number {
  return 2 * maxWeaponDie + 2 * weaponDieRoll + weaponFlat + attributeMod;
}

export function applyBurstDefense(
  damage: number,
  damageThreshold: number,
  damageResistancePercent: number
): number {
  const postDT = Math.max(0, damage - damageThreshold);
  return Math.max(0, Math.floor(postDT * (1 - damageResistancePercent / 100)));
}

export function resolveBurst(input: BurstAttackInput, targetAC: number, lck: number): BurstAttackResult {
  const attackTotal = getBurstAttackTotal(
    input.d20,
    input.attackMod,
    input.skillBonus,
    input.weaponAccuracy
  );
  const misfire = isNatural1(input.d20);
  const hit = !misfire && (isNatural20(input.d20) || attackTotal >= targetAC);
  const critical = hit && isBurstCritical(input.d20, lck, attackTotal, targetAC);

  return {
    apCost: getBurstAP(input.baseShotAP),
    ammoCost: 3,
    attackTotal,
    hit,
    critical,
    misfire,
    damage: hit
      ? critical
        ? calculateCritBurstDamage(
            input.maxWeaponDie,
            input.weaponDieRoll,
            input.weaponFlat,
            input.attributeMod
          )
        : calculateBurstDamage(input.weaponDieRoll, input.weaponFlat, input.attributeMod)
      : 0,
  };
}
