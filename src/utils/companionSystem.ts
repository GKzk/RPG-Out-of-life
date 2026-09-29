export type CompanionState = 'HEALTHY' | 'DOWNED' | 'STABILIZED' | 'DEAD';

export interface CompanionRuntimeState {
  state: CompanionState;
  currentHp: number;
  maxHp: number;
  downedRounds: number;
  stabilizationAttempts: number;
}

export function calculateLeadershipDefenseBonus(leadershipSkill: number): number {
  return Math.max(0, Math.min(4, Math.floor(leadershipSkill / 25)));
}

export function calculateCompanionSupportEffectiveness(
  baseDamage: number,
  leadershipSkill: number
): number {
  const clamped = Math.max(0, Math.min(100, leadershipSkill));
  const bonus = Math.floor(baseDamage * (clamped / 100) * 0.3);
  return baseDamage + bonus;
}

export interface PetHandlingBonus {
  searchBonus: number;
  stealthBonus: number;
  combatDamageBonus: number;
  foodPreservationPct: number;
}

export function getPetHandlingBonus(
  petId: string | undefined | null,
  animalHandlingSkill: number
): PetHandlingBonus {
  if (!petId || petId === 'none') {
    return { searchBonus: 0, stealthBonus: 0, combatDamageBonus: 0, foodPreservationPct: 0 };
  }

  const skillFactor = Math.max(0, Math.min(100, animalHandlingSkill));
  const masteryBonus = Math.floor(skillFactor / 25);

  switch (petId) {
    case 'hound':
      return {
        searchBonus: 2 + masteryBonus * 2,
        stealthBonus: 3 + masteryBonus * 2,
        combatDamageBonus: 1 + masteryBonus,
        foodPreservationPct: 0,
      };
    case 'cat':
      return {
        searchBonus: 0,
        stealthBonus: 4 + masteryBonus * 3,
        combatDamageBonus: 0,
        foodPreservationPct: 5 + masteryBonus * 5,
      };
    case 'crow':
      return {
        searchBonus: 5 + masteryBonus * 3,
        stealthBonus: 2 + masteryBonus,
        combatDamageBonus: 0,
        foodPreservationPct: 0,
      };
    case 'ferret':
      return {
        searchBonus: 4 + masteryBonus * 2,
        stealthBonus: 5 + masteryBonus * 3,
        combatDamageBonus: 0,
        foodPreservationPct: 0,
      };
    case 'boar':
      return {
        searchBonus: 2 + masteryBonus,
        stealthBonus: 0,
        combatDamageBonus: 3 + masteryBonus * 2,
        foodPreservationPct: 0,
      };
    default:
      return { searchBonus: 0, stealthBonus: 0, combatDamageBonus: 0, foodPreservationPct: 0 };
  }
}

export function resolveCompanionDamage(
  currentHp: number,
  maxHp: number,
  damage: number,
  leadershipSkill: number = 0
): CompanionRuntimeState {
  const mitigation = calculateLeadershipDefenseBonus(leadershipSkill);
  const effectiveDamage = Math.max(0, damage - mitigation);
  const finalHp = currentHp - effectiveDamage;
  if (finalHp <= -maxHp) {
    return { state: 'DEAD', currentHp: finalHp, maxHp, downedRounds: 0, stabilizationAttempts: 0 };
  }
  if (finalHp <= 0) {
    return { state: 'DOWNED', currentHp: finalHp, maxHp, downedRounds: 0, stabilizationAttempts: 0 };
  }
  return { state: 'HEALTHY', currentHp: finalHp, maxHp, downedRounds: 0, stabilizationAttempts: 0 };
}

export function stabilizeCompanion(
  companion: CompanionRuntimeState,
  hasMedicalItem: boolean
): CompanionRuntimeState {
  if (companion.state !== 'DOWNED' || !hasMedicalItem) return companion;
  return {
    ...companion,
    state: 'STABILIZED',
    currentHp: Math.min(0, companion.currentHp),
    downedRounds: 0,
  };
}

export function advanceCompanionBleedout(
  companion: CompanionRuntimeState
): CompanionRuntimeState {
  if (companion.state !== 'DOWNED') return companion;
  const nextRounds = companion.downedRounds + 1;
  if (nextRounds >= 3) {
    return { ...companion, state: 'DEAD', downedRounds: nextRounds };
  }
  return { ...companion, downedRounds: nextRounds };
}

export function resolveStabilizedMedicalProcedure(
  companion: CompanionRuntimeState,
  medicineCheck: number,
  hasStim: boolean
): CompanionRuntimeState {
  if (companion.state !== 'STABILIZED' || !hasStim) return companion;
  const attempts = companion.stabilizationAttempts + 1;
  if (medicineCheck >= 12) {
    return {
      ...companion,
      state: 'HEALTHY',
      currentHp: 1,
      stabilizationAttempts: attempts,
    };
  }
  return {
    ...companion,
    stabilizationAttempts: attempts,
  };
}

export function canAttemptStabilizedProcedure(companion: CompanionRuntimeState): boolean {
  return companion.state === 'STABILIZED' && companion.stabilizationAttempts < 3;
}
