export type CompanionState = 'HEALTHY' | 'DOWNED' | 'STABILIZED' | 'DEAD';

export interface CompanionRuntimeState {
  state: CompanionState;
  currentHp: number;
  maxHp: number;
  downedRounds: number;
  stabilizationAttempts: number;
}

export function resolveCompanionDamage(currentHp: number, maxHp: number, damage: number): CompanionRuntimeState {
  const finalHp = currentHp - Math.max(0, damage);
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
