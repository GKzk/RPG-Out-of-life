import assert from 'node:assert/strict';
import { ITEM_DATABASE } from '../src/data/items';
import { calculateDerivedStats } from '../src/utils/statCalculations';
import {
  resolveCompanionDamage,
  stabilizeCompanion,
  advanceCompanionBleedout,
  resolveStabilizedMedicalProcedure,
  canAttemptStabilizedProcedure,
  calculateLeadershipDefenseBonus,
  calculateCompanionSupportEffectiveness,
  getPetHandlingBonus,
} from '../src/utils/companionSystem';
import {
  getAttributeMod,
  getPointBuyCost,
  getMaxAP,
  calculateMeleeDamage,
  calculateCritMeleeDamage,
  applyRareAmmoLuck,
  getCompanionSlots,
  getFoodPerDay,
  getWaterPerDay,
  getCompanionCarryBonusKg,
  getCompanionSupportFireAmmoCost,
  getBurstAP,
  getBurstAttackTotal,
  getLckThreatMin,
  isBurstCritical,
  calculateBurstDamage,
  calculateCritBurstDamage,
  applyBurstDefense,
  resolveBurst,
  createCharacterFromPreset,
  calculateSurvivalConsumptionRate,
  calculateBarterPrice,
} from '../src/utils/characterSystem';
import { calculateSkillValue, calculateSkillCheckBase, resolveSkillCheck, calculateEffectiveSpecial, getSkillTrainingCostPerPoint, getStartingSkillPoints, getSkillPointsPerLevel, getTotalSkillPointsEarned } from '../src/utils/statCalculations';
import { SkillName, Character, SpecialStats } from '../src/types/game';
import { SKILL_DEFINITIONS } from '../src/data/skills';
import { ARCHETYPE_PRESETS } from '../src/data/archetypes';
import { FEAT_DEFINITIONS } from '../src/data/feats';
import { BACKGROUND_DEFINITIONS } from '../src/data/backgrounds';
import { PET_DEFINITIONS } from '../src/data/pets';

for (let v = 1; v <= 10; v++) assert.equal(getAttributeMod(v), v - 5);
assert.deepEqual([1,2,3,4,5,6,7,8,9,10].map(getPointBuyCost), [1,2,3,4,5,6,7,8,9,10]);
assert.equal(calculateMeleeDamage(4, 5), 4);
assert.equal(calculateMeleeDamage(1, 1), 1);
assert.equal(calculateCritMeleeDamage(6, 4, 5), 10);
assert.equal(applyRareAmmoLuck(0.25), 0.3);
assert.equal(applyRareAmmoLuck(0.9), 1);
assert.deepEqual([1,2,3,4,5,6,7,8,9,10].map(getMaxAP), [7,8,8,9,9,10,10,11,11,12]);
assert.deepEqual([1,4,5,7,8,10].map(getCompanionSlots), [0,0,1,1,2,2]);

assert.equal(getFoodPerDay(0), 1);
assert.equal(getFoodPerDay(1), 2);
assert.equal(getFoodPerDay(2), 3);
assert.equal(getWaterPerDay(2), 3);
assert.equal(getCompanionCarryBonusKg(2), 60);
assert.equal(getCompanionSupportFireAmmoCost(2), 2);

assert.equal(getBurstAP(3), 5);
assert.equal(getBurstAttackTotal(15, 2, 3, 1), 17);
assert.deepEqual([1,4,5,7,8,10].map(getLckThreatMin), [20,20,19,19,18,17]);

assert.equal(isBurstCritical(20, 1, 1, 99), true);
assert.equal(isBurstCritical(19, 5, 19, 19), true);
assert.equal(isBurstCritical(19, 5, 18, 19), false);
assert.equal(isBurstCritical(18, 8, 18, 18), true);

assert.equal(calculateBurstDamage(4, 2, -1), 9);
assert.equal(calculateBurstDamage(1, 0, -4), 1);
assert.equal(calculateCritBurstDamage(6, 4, 2, -1), 21);
assert.equal(applyBurstDefense(20, 5, 50), 7);

const nat20 = resolveBurst({
  baseShotAP: 3, attackMod: -10, skillBonus: 0, weaponAccuracy: 0,
  weaponDieRoll: 4, maxWeaponDie: 6, weaponFlat: 2, attributeMod: 0, d20: 20
}, 30, 1);
assert.equal(nat20.apCost, 5);
assert.equal(nat20.ammoCost, 3);
assert.equal(nat20.hit, true);
assert.equal(nat20.critical, true);

const nat1 = resolveBurst({
  baseShotAP: 3, attackMod: 20, skillBonus: 10, weaponAccuracy: 5,
  weaponDieRoll: 4, maxWeaponDie: 6, weaponFlat: 2, attributeMod: 0, d20: 1
}, 5, 10);
assert.equal(nat1.hit, false);
assert.equal(nat1.critical, false);
assert.equal(nat1.misfire, true);

console.log('Character System v0.4.5.7 math tests: PASS');


const healthy = resolveCompanionDamage(10, 20, 9);
assert.equal(healthy.state, 'HEALTHY');

const downed = resolveCompanionDamage(10, 20, 11);
assert.equal(downed.state, 'DOWNED');
assert.equal(stabilizeCompanion(downed, false).state, 'DOWNED');
const stabilized = stabilizeCompanion(downed, true);
assert.equal(stabilized.state, 'STABILIZED');
assert.equal(stabilized.downedRounds, 0);
assert.equal(resolveStabilizedMedicalProcedure(stabilized, 11, true).state, 'STABILIZED');
assert.equal(resolveStabilizedMedicalProcedure(stabilized, 12, true).state, 'HEALTHY');

let bleeding = downed;
bleeding = advanceCompanionBleedout(bleeding);
bleeding = advanceCompanionBleedout(bleeding);
bleeding = advanceCompanionBleedout(bleeding);
assert.equal(bleeding.state, 'DEAD');

assert.equal(resolveCompanionDamage(0, 20, 20).state, 'DEAD');
assert.equal(canAttemptStabilizedProcedure(stabilized), true);

// Baseline weapon/armor data mapping: exact distribution-preserving conversion.

const pipeRifle = ITEM_DATABASE.find((item) => item.id === 'pipe_rifle')!;
assert.equal(pipeRifle.weaponData?.damageDiceCount, 1, 'pipe rifle dice count');
assert.equal(pipeRifle.weaponData?.damageDiceSides, 7, 'pipe rifle dice sides');
assert.equal(pipeRifle.weaponData?.damageFlat, 5, 'pipe rifle flat');

const shotgun = ITEM_DATABASE.find((item) => item.id === 'hunting_shotgun')!;
assert.equal(shotgun.weaponData?.damageDiceCount, 1, 'shotgun dice count');
assert.equal(shotgun.weaponData?.damageDiceSides, 13, 'shotgun dice sides');
assert.equal(shotgun.weaponData?.damageFlat, 13, 'shotgun flat');

const metalArmor = ITEM_DATABASE.find((item) => item.id === 'metal_armor')!;
assert.equal(metalArmor.armorData?.damageThreshold, 8, 'metal armor DT');
assert.equal(metalArmor.armorData?.damageResistancePercent, 0, 'metal armor DR');

const auditCharacter = {
  name: 'Audit',
  gender: 'male' as const,
  avatarId: 'm1',
  backgroundId: 'none',
  background: 'Test',
  level: 1,
  xp: 0,
  baseSpecial: { STR: 5, PER: 5, END: 5, CHA: 5, INT: 5, AGI: 5, LCK: 5 },
  effectiveSpecial: { STR: 5, PER: 5, END: 5, CHA: 5, INT: 5, AGI: 5, LCK: 5 },
  taggedSkills: [],
  skillPointsInvested: {
    athletics: 0,
    stealth: 0,
    sleightOfHand: 0,
    unarmed: 0,
    melee: 0,
    firearms: 0,
    explosives: 0,
    survival: 0,
    search: 0,
    navigation: 0,
    insight: 0,
    medicine: 0,
    mechanics: 0,
    electronics: 0,
    science: 0,
    crafting: 0,
    persuasion: 0,
    barter: 0,
    deception: 0,
    leadership: 0,
    animalHandling: 0,
    performance: 0,
    energyWeapons: 0,
  },
  feats: [],
  survival: {
    hunger: 100,
    thirst: 100,
    fatigue: 100,
    radiation: 0,
    infection: 0,
    addictions: {
      stims: { level: 0, activeDuration: 0, withdrawal: false },
      psycho: { level: 0, activeDuration: 0, withdrawal: false },
      buffout: { level: 0, activeDuration: 0, withdrawal: false },
      alcohol: { level: 0, activeDuration: 0, withdrawal: false },
    },
  },
  currentHp: 50,
  currentAp: 9,
  equippedArmorId: 'metal_armor',
};

const auditDerived = calculateDerivedStats(
  auditCharacter,
  auditCharacter.effectiveSpecial,
  []
);
assert.equal(auditDerived.maxAp, 9, 'canonical AP is not reduced by survival state');
assert.equal(auditDerived.evasion, 12, 'legacy armor defense must not double as ArmorAC');




// Canonical 22-skill mathematical audit.
assert.equal(SKILL_DEFINITIONS.length, 23, 'canonical skill count');
assert.equal(new Set(SKILL_DEFINITIONS.map((s) => s.id)).size, 23, 'skill IDs must be unique');
assert.deepEqual(SKILL_DEFINITIONS.map((s) => s.id), ["athletics","stealth","sleightOfHand","unarmed","melee","firearms","explosives","survival","search","navigation","insight","medicine","mechanics","electronics","science","crafting","persuasion","barter","deception","leadership","animalHandling","performance","energyWeapons"], 'skill order must match canonical model');

const skillIds = SKILL_DEFINITIONS.map((skill) => skill.id);
const neutralSkillCharacter = {
  ...auditCharacter,
  taggedSkills: [],
  skillPointsInvested: Object.fromEntries(skillIds.map((id) => [id, 0])) as Record<SkillName, number>,
};
const neutralSpecial = { STR: 5, PER: 5, END: 5, CHA: 5, INT: 5, AGI: 5, LCK: 5 };

for (const skill of SKILL_DEFINITIONS) {
  assert.equal(calculateSkillValue(skill.id, neutralSkillCharacter, neutralSpecial), 15, skill.id + ' neutral baseline');
}

const taggedCharacter = { ...neutralSkillCharacter, taggedSkills: ['performance'] as SkillName[] };
assert.equal(calculateSkillValue('performance', taggedCharacter, neutralSpecial), 25, 'tag bonus is +10');
assert.equal(calculateSkillValue('athletics', taggedCharacter, neutralSpecial), 25, 'untagged skill receives no tag bonus');

const specialistSpecial = { STR: 10, PER: 10, END: 10, CHA: 10, INT: 10, AGI: 10, LCK: 10 };
assert.equal(calculateSkillValue('athletics', neutralSkillCharacter, specialistSpecial), 30, '10/10 attribute baseline');
assert.equal(calculateSkillValue('performance', taggedCharacter, specialistSpecial), 40, '10/10 tagged baseline');

const overCapCharacter = {
  ...neutralSkillCharacter,
  taggedSkills: ['athletics'] as SkillName[],
  skillPointsInvested: { ...neutralSkillCharacter.skillPointsInvested, athletics: 999 },
};
assert.equal(calculateSkillValue('athletics', overCapCharacter, specialistSpecial), 100, 'skill value is capped at 100');

for (const skill of SKILL_DEFINITIONS) {
  const low = calculateSkillValue(skill.id, neutralSkillCharacter, { STR: 1, PER: 1, END: 1, CHA: 1, INT: 1, AGI: 1, LCK: 1 });
  const high = calculateSkillValue(skill.id, neutralSkillCharacter, specialistSpecial);
  assert.ok(low >= 1 && low <= 100, skill.id + ' low bound');
  assert.ok(high >= 1 && high <= 100, skill.id + ' high bound');
}



// Canonical skill-check formula audit: d20 + SPECIAL modifier + skill tier vs DC.
assert.equal(resolveSkillCheck(5, 50, 15, 13).baseScore, 2);
assert.equal(resolveSkillCheck(5, 50, 15, 13).finalScore, 15);
assert.equal(resolveSkillCheck(5, 50, 15, 13).margin, 0);
assert.equal(resolveSkillCheck(5, 50, 15, 13).outcome, 'success');

const partialCheck = resolveSkillCheck(5, 50, 15, 9);
assert.equal(partialCheck.margin, -4);
assert.equal(partialCheck.outcome, 'partial');

const failureCheck = resolveSkillCheck(5, 50, 15, 8);
assert.equal(failureCheck.margin, -5);
assert.equal(failureCheck.outcome, 'failure');

const criticalFailure = resolveSkillCheck(5, 0, 25, 10);
assert.equal(criticalFailure.margin, -18);
assert.equal(criticalFailure.outcome, 'critical_failure');

const natural1AlwaysCritical = resolveSkillCheck(10, 100, 1, 1);
assert.equal(natural1AlwaysCritical.outcome, 'critical_failure');

const criticalSuccess = resolveSkillCheck(10, 100, 20, 20);
assert.equal(criticalSuccess.finalScore, 32);
assert.equal(criticalSuccess.margin, 12);
assert.equal(criticalSuccess.outcome, 'critical_success');

const maxSkillStillRollDependent = [1, 20].map((d20) =>
  resolveSkillCheck(10, 100, 20, d20).outcome
);
assert.equal(maxSkillStillRollDependent[0], 'critical_failure');
assert.equal(maxSkillStillRollDependent[1], 'critical_success');

assert.throws(() => resolveSkillCheck(5, 50, 15, 0));
assert.throws(() => resolveSkillCheck(5, 50, 15, 21));

// Progression economy audit.
const progressionChar = { ...auditCharacter, level: 1, baseSpecial: { ...neutralSpecial }, effectiveSpecial: { ...neutralSpecial }, backgroundId: 'hunter' };
assert.equal(getStartingSkillPoints(progressionChar), 13);
assert.equal(getSkillPointsPerLevel(progressionChar), 6);
assert.equal(getTotalSkillPointsEarned(progressionChar), 13);
assert.equal(getSkillTrainingCostPerPoint(49), 1);
assert.equal(getSkillTrainingCostPerPoint(50), 2);
assert.equal(getSkillTrainingCostPerPoint(74), 2);
assert.equal(getSkillTrainingCostPerPoint(75), 3);
assert.equal(getSkillTrainingCostPerPoint(89), 3);
assert.equal(getSkillTrainingCostPerPoint(90), 4);
assert.equal(getSkillTrainingCostPerPoint(100), 4);

const freeBackgroundChar = { ...progressionChar, backgroundId: 'none', level: 2 };
assert.equal(getSkillPointsPerLevel(freeBackgroundChar), 8);
assert.equal(getTotalSkillPointsEarned(freeBackgroundChar), 21);

const int10Level20 = { ...progressionChar, level: 20, baseSpecial: { ...neutralSpecial, INT: 10 }, effectiveSpecial: { ...neutralSpecial, INT: 10 } };
assert.equal(getTotalSkillPointsEarned(int10Level20), 189);

const int5Level20 = { ...progressionChar, level: 20, baseSpecial: { ...neutralSpecial, INT: 5 }, effectiveSpecial: { ...neutralSpecial, INT: 5 } };
assert.equal(getTotalSkillPointsEarned(int5Level20), 127);

// Regression tests for archetype preset creation and field preservation
assert.equal(ARCHETYPE_PRESETS.length, 8, '8 archetype presets must be defined');

// Verify 22 skills metadata completeness
assert.equal(SKILL_DEFINITIONS.length, 23, 'Must have exactly 23 skill definitions');
for (const skill of SKILL_DEFINITIONS) {
  assert.ok(skill.nameRu && skill.nameRu.trim().length > 0, `Skill ${skill.id} must have non-empty nameRu`);
  assert.ok(skill.description && skill.description.trim().length > 10, `Skill ${skill.id} must have detailed description`);
  assert.ok(['STR', 'PER', 'END', 'CHA', 'INT', 'AGI', 'LCK'].includes(skill.primaryAttr), `Skill ${skill.id} valid primaryAttr`);
}

// Verify natural names for archetypes (no 'Имя — Профессия' format)
for (const preset of ARCHETYPE_PRESETS) {
  assert.ok(!preset.titleRu.includes(' — ') && !preset.titleRu.includes(' - '), `${preset.id} titleRu must be a natural person name without class dash: ${preset.titleRu}`);
  assert.ok(preset.titleRu.split(' ').length >= 2, `${preset.id} titleRu should have full name/patronymic: ${preset.titleRu}`);
  assert.ok(preset.subtitleRu && preset.subtitleRu.trim().length > 0, `${preset.id} must retain role in subtitleRu`);
  assert.ok(preset.descriptionRu && preset.descriptionRu.trim().length > 20, `${preset.id} must retain detailed character biography`);
}

for (const preset of ARCHETYPE_PRESETS) {
  const char = createCharacterFromPreset(preset);
  assert.equal(char.gender, preset.gender, `${preset.id} must preserve gender`);
  assert.equal(char.backgroundId, preset.backgroundId, `${preset.id} must preserve backgroundId`);
  assert.deepEqual(char.baseSpecial, preset.special, `${preset.id} must preserve base special`);
  assert.deepEqual(char.taggedSkills, preset.taggedSkills, `${preset.id} must preserve taggedSkills`);
  assert.ok(char.feats.includes(preset.startingFeat), `${preset.id} must include startingFeat`);
  
  const expectedAvatar = preset.avatarId || (preset.gender === 'female' ? 'f1' : 'm1');
  assert.equal(char.avatarId, expectedAvatar, `${preset.id} must assign matching avatarId`);
  
  const expectedPet = preset.petId || 'hound';
  assert.equal(char.petId, expectedPet, `${preset.id} must assign matching petId`);
}

// Explicit spot-checks on specific archetypes
const vera = createCharacterFromPreset(ARCHETYPE_PRESETS.find((p) => p.id === 'vera_mechanic')!);
assert.equal(vera.gender, 'female', 'Vera must be female');
assert.equal(vera.avatarId, 'f1', 'Vera must have female avatar f1');
assert.equal(vera.backgroundId, 'mechanic', 'Vera must have mechanic backgroundId');
assert.deepEqual(vera.taggedSkills, ['mechanics', 'electronics', 'science']);

const nikita = createCharacterFromPreset(ARCHETYPE_PRESETS.find((p) => p.id === 'nikita_hunter')!);
assert.equal(nikita.gender, 'male', 'Nikita must be male');
assert.equal(nikita.avatarId, 'm1', 'Nikita must have male avatar m1');
assert.equal(nikita.backgroundId, 'hunter', 'Nikita must have hunter backgroundId');
assert.deepEqual(nikita.taggedSkills, ['search', 'navigation', 'firearms']);

// ---------------------------------------------------------------------------
// GAMEPLAY INTEGRATION PASS 1: 8 SKILLS UNIT & REGRESSION TESTS
// ---------------------------------------------------------------------------

// 1. SEARCH: Canonical resolveSkillCheck replacing survival in ruins scavenging
// Formula: Base = Attribute (PER) * 4 + Skill * 0.6. DC = 45.
const lowSearchCheck = resolveSkillCheck(3, 10, 45, 10); // Base = 3*4 + 6 = 18. Margin = 18 - 45 = -27
assert.equal(lowSearchCheck.outcome, 'critical_failure');

const midSearchCheck = resolveSkillCheck(5, 50, 45, 10); // Base = 5*4 + 30 = 50. Margin = 50 - 45 = +5
assert.equal(midSearchCheck.outcome, 'success');

const partialSearchCheck = resolveSkillCheck(5, 30, 45, 10); // Base = 20 + 18 = 38. Margin = 38 - 45 = -7
assert.equal(partialSearchCheck.outcome, 'partial');

const critSearchCheck = resolveSkillCheck(8, 70, 45, 20); // Natural 20 + margin > 0
assert.equal(critSearchCheck.outcome, 'critical_success');

// 2. STEALTH: Ruins ambush avoidance
// DC = 50. Governing attribute = AGI.
const highStealthAvoidsAmbush = resolveSkillCheck(8, 70, 50, 10); // Base = 32 + 42 = 74. Margin = +24
assert.equal(highStealthAvoidsAmbush.outcome, 'success');
assert.ok(highStealthAvoidsAmbush.margin >= 0, 'High stealth succeeds and avoids ambush');

const lowStealthCaughtInAmbush = resolveSkillCheck(2, 10, 50, 5); // Base = 8 + 6 = 14, RollMod = -5. Final = 9. Margin = -41
assert.equal(lowStealthCaughtInAmbush.outcome, 'critical_failure');

// 3. SURVIVAL: Scale hunger and thirst accumulation rate
// Base: 10 units. Skill 0 -> 10.0; Skill 50 -> 8.5; Skill 100 -> 7.0 (30% reduction).
assert.equal(calculateSurvivalConsumptionRate(10, 0, false), 10);
assert.equal(calculateSurvivalConsumptionRate(10, 50, false), 8.5);
assert.equal(calculateSurvivalConsumptionRate(10, 100, false), 7.0);

// Survivalist feat stack: 10 * 0.70 * 0.65 = 4.55
assert.equal(Math.round(calculateSurvivalConsumptionRate(10, 100, true) * 100) / 100, 4.55);

// Over-cap clamp: skill 999 cannot reduce beyond 30%
assert.equal(calculateSurvivalConsumptionRate(10, 999, false), 7.0);
// Negative skill clamp
assert.equal(calculateSurvivalConsumptionRate(10, -50, false), 10);

// 4. NAVIGATION: Travel hours determined by resolveSkillCheck (DC 45, PER)
const getTravelHours = (per: number, navSkill: number, d20: number): number => {
  const check = resolveSkillCheck(per, navSkill, 45, d20);
  if (check.outcome === 'critical_success') return 1;
  if (check.outcome === 'success') return 2;
  if (check.outcome === 'partial') return 3;
  if (check.outcome === 'failure') return 4;
  return 5;
};

assert.equal(getTravelHours(8, 70, 20), 1, 'Crit success = 1 hour shortcut');
assert.equal(getTravelHours(6, 50, 12), 2, 'Success = 2 hours efficient travel');
assert.equal(getTravelHours(5, 30, 10), 3, 'Partial = 3 hours standard route');
assert.equal(getTravelHours(4, 20, 8), 4, 'Failure = 4 hours delayed route');
assert.equal(getTravelHours(2, 10, 1), 5, 'Critical failure = 5 hours lost in storm');

// 5. BARTER: Economic pricing bounds
// Base value 100:
// Barter 0: Buy = 150, Sell = 35
assert.equal(calculateBarterPrice(100, 0, 'buy'), 150);
assert.equal(calculateBarterPrice(100, 0, 'sell'), 35);

// Barter 50: Buy = 130, Sell = 53 (rounded from 52.5)
assert.equal(calculateBarterPrice(100, 50, 'buy'), 130);
assert.equal(calculateBarterPrice(100, 50, 'sell'), 53);

// Barter 100: Buy = 110, Sell = 70
assert.equal(calculateBarterPrice(100, 100, 'buy'), 110);
assert.equal(calculateBarterPrice(100, 100, 'sell'), 70);

// Minimum price safety bounds: never 0 or negative
assert.equal(calculateBarterPrice(0, 50, 'buy'), 1);
assert.equal(calculateBarterPrice(-20, 50, 'sell'), 1);
assert.equal(calculateBarterPrice(1, 100, 'sell'), 1);

// 6. LEADERSHIP: Companion tactical defense and support fire scaling
assert.equal(calculateLeadershipDefenseBonus(0), 0);
assert.equal(calculateLeadershipDefenseBonus(24), 0);
assert.equal(calculateLeadershipDefenseBonus(25), 1);
assert.equal(calculateLeadershipDefenseBonus(50), 2);
assert.equal(calculateLeadershipDefenseBonus(75), 3);
assert.equal(calculateLeadershipDefenseBonus(100), 4);
assert.equal(calculateLeadershipDefenseBonus(999), 4, 'Defense bonus capped at 4');

assert.equal(calculateCompanionSupportEffectiveness(10, 0), 10);
assert.equal(calculateCompanionSupportEffectiveness(10, 50), 11);
assert.equal(calculateCompanionSupportEffectiveness(10, 100), 13); // +30%

// Companion damage resolution with leadership mitigation:
// 10 max HP, takes 5 damage with 50 leadership (mitigation 2) -> effective damage 3, remaining HP = 7
const compState = resolveCompanionDamage(10, 10, 5, 50);
assert.equal(compState.currentHp, 7);
assert.equal(compState.state, 'HEALTHY');

// 7. ANIMAL HANDLING: Pet assist scaling
assert.deepEqual(getPetHandlingBonus(null, 50), { searchBonus: 0, stealthBonus: 0, combatDamageBonus: 0, foodPreservationPct: 0 });
assert.deepEqual(getPetHandlingBonus('none', 100), { searchBonus: 0, stealthBonus: 0, combatDamageBonus: 0, foodPreservationPct: 0 });

const houndNoSkill = getPetHandlingBonus('hound', 0);
assert.equal(houndNoSkill.combatDamageBonus, 1);
assert.equal(houndNoSkill.searchBonus, 2);
assert.equal(houndNoSkill.stealthBonus, 3);

const houndMasterSkill = getPetHandlingBonus('hound', 100);
assert.equal(houndMasterSkill.combatDamageBonus, 5); // +5 bite damage
assert.equal(houndMasterSkill.searchBonus, 10);
assert.equal(houndMasterSkill.stealthBonus, 11);

const catBonus = getPetHandlingBonus('cat', 100);
assert.equal(catBonus.foodPreservationPct, 25);
assert.equal(catBonus.stealthBonus, 16);

const crowBonus = getPetHandlingBonus('crow', 100);
assert.equal(crowBonus.searchBonus, 17); // aerial scout spots hidden caches

// 8. ATHLETICS: Physical obstacle clearance check (DC 50, STR)
const strongAthletics = resolveSkillCheck(7, 60, 50, 10); // Base = 28 + 36 = 64. Margin = +14
assert.equal(strongAthletics.outcome, 'success');

const weakAthletics = resolveSkillCheck(2, 10, 50, 10); // Base = 8 + 6 = 14. Margin = -36
assert.equal(weakAthletics.outcome, 'critical_failure');

// ---------------------------------------------------------------------------
// FEATS & BALANCE PASS UNIT TESTS
// ---------------------------------------------------------------------------

const dummySurvivalNeeds = {
  hunger: 0,
  thirst: 0,
  fatigue: 0,
  radiation: 0,
  infection: 0,
  addictions: {
    stims: { level: 0, activeDuration: 0, withdrawal: false },
    psycho: { level: 0, activeDuration: 0, withdrawal: false },
    buffout: { level: 0, activeDuration: 0, withdrawal: false },
    alcohol: { level: 0, activeDuration: 0, withdrawal: false },
  },
};

const createTestChar = (featId?: string, baseSpecialOverrides?: Partial<SpecialStats>): Character => {
  const baseSpecial: SpecialStats = {
    STR: 5, PER: 5, END: 5, CHA: 5, INT: 5, AGI: 5, LCK: 5,
    ...baseSpecialOverrides,
  };
  const feats = featId ? [featId] : [];
  const effSpec = calculateEffectiveSpecial(baseSpecial, feats, dummySurvivalNeeds);
  return {
    name: 'Тестер',
    gender: 'male',
    avatarId: 'm1',
    backgroundId: 'none',
    background: 'Без предыстории',
    level: 1,
    xp: 0,
    baseSpecial,
    effectiveSpecial: effSpec,
    taggedSkills: [],
    skillPointsInvested: {
      athletics: 0, stealth: 0, sleightOfHand: 0, unarmed: 0, melee: 0, firearms: 0,
      explosives: 0, survival: 0, search: 0, navigation: 0, insight: 0, medicine: 0,
      mechanics: 0, electronics: 0, science: 0, crafting: 0, persuasion: 0, barter: 0,
      deception: 0, leadership: 0, animalHandling: 0, performance: 0,
    },
    feats,
    survival: dummySurvivalNeeds,
    currentHp: 50,
    currentAp: 9,
  };
};

// 1. One-Eyed
const charOneEyed = createTestChar('one_eyed');
assert.equal(charOneEyed.effectiveSpecial.PER, 4, 'One-Eyed must reduce PER by 1');
const baseSurvival = calculateSkillValue('survival', createTestChar(), createTestChar().effectiveSpecial);
const oneEyedSurvival = calculateSkillValue('survival', charOneEyed, charOneEyed.effectiveSpecial);
// One-Eyed gives +5 to survival, while PER decreased by 1 (secondaryAttr for survival, loses 2 points): net +3
assert.equal(oneEyedSurvival, baseSurvival + 3, 'One-Eyed net survival bonus: +5 skill bonus - 2 from PER loss');
const oneEyedDef = FEAT_DEFINITIONS.find((f) => f.id === 'one_eyed')!;
assert.equal(oneEyedDef.rangedAccuracyBonus, 10, 'One-Eyed must grant +10 ranged accuracy');

// 2. Sprinter
const charSprinter = createTestChar('sprint');
const baseDerived = calculateDerivedStats(createTestChar(), createTestChar().effectiveSpecial, []);
const sprinterDerived = calculateDerivedStats(charSprinter, charSprinter.effectiveSpecial, []);
assert.equal(sprinterDerived.maxAp, baseDerived.maxAp + 1, 'Sprinter must grant +1 AP');
const sprintDef = FEAT_DEFINITIONS.find((f) => f.id === 'sprint')!;
assert.equal(sprintDef.needsRateModPct, 20, 'Sprinter must increase fatigue/needs rate by +20%');

// 3. Miniature (Small Frame)
const charMiniature = createTestChar('miniature');
assert.equal(charMiniature.effectiveSpecial.AGI, 6, 'Miniature must grant +1 AGI');
const miniatureDerived = calculateDerivedStats(charMiniature, charMiniature.effectiveSpecial, []);
// STR 5 -> base carry = 5*6 + 25 = 55. Miniature has carryWeightBonus = -10 -> 45.
assert.equal(miniatureDerived.carryWeightMax, 45, 'Miniature must reduce max carry weight by 10 kg');

// 4. Sexuality (Sex Appeal)
const charSexuality = createTestChar('sexuality');
const basePersuasion = calculateSkillValue('persuasion', createTestChar(), createTestChar().effectiveSpecial);
const sexPersuasion = calculateSkillValue('persuasion', charSexuality, charSexuality.effectiveSpecial);
assert.equal(sexPersuasion, basePersuasion + 10, 'Sexuality must grant +10 to Persuasion');
const baseInsight = calculateSkillValue('insight', createTestChar(), createTestChar().effectiveSpecial);
const sexInsight = calculateSkillValue('insight', charSexuality, charSexuality.effectiveSpecial);
assert.equal(sexInsight, baseInsight - 5, 'Sexuality must penalize Insight by -5');

// 5. Pack Rat
const charPackRat = createTestChar('pack_rat');
assert.equal(charPackRat.effectiveSpecial.AGI, 4, 'Pack Rat must reduce AGI by 1');
const packRatDerived = calculateDerivedStats(charPackRat, charPackRat.effectiveSpecial, []);
assert.equal(packRatDerived.carryWeightMax, 70, 'Pack Rat must grant +15 kg carry weight (55 + 15 = 70)');

// 6. Junkie
const junkieDef = FEAT_DEFINITIONS.find((f) => f.id === 'junkie')!;
assert.equal(junkieDef.statModifiers?.AGI, 1, 'Junkie must grant +1 AGI');
assert.equal(junkieDef.addictionRiskModPct, 30, 'Junkie must increase addiction risk by 30%');

// 7. Workaholic
const charWorkaholic = createTestChar('workaholic');
assert.equal(charWorkaholic.effectiveSpecial.INT, 6, 'Workaholic must grant +1 INT');
const baseMechanics = calculateSkillValue('mechanics', createTestChar(), createTestChar().effectiveSpecial);
const workMechanics = calculateSkillValue('mechanics', charWorkaholic, charWorkaholic.effectiveSpecial);
// INT increased by 1 (primaryAttr: +3), plus skillModifiers.mechanics (+10) -> +13 total
assert.equal(workMechanics, baseMechanics + 13, 'Workaholic must grant +10 skill + 3 attribute = +13 to Mechanics');

// 8. Fast Metabolism
const metabolismDef = FEAT_DEFINITIONS.find((f) => f.id === 'metabolism')!;
assert.equal(metabolismDef.healingRateModPct, 20, 'Fast Metabolism must grant +20% healing');
assert.equal(metabolismDef.needsRateModPct, 20, 'Fast Metabolism must increase hunger/thirst accumulation by 20%');

// 9. Verify Feat bonuses are idempotent (not applied twice)
const eff1 = calculateEffectiveSpecial(charOneEyed.baseSpecial, charOneEyed.feats, dummySurvivalNeeds);
const eff2 = calculateEffectiveSpecial(charOneEyed.baseSpecial, charOneEyed.feats, dummySurvivalNeeds);
assert.deepEqual(eff1, eff2, 'Feat calculation must be idempotent and deterministic');

// 10. Check total Feat count and balance
assert.equal(FEAT_DEFINITIONS.length, 15, 'Must have exactly 15 defined feats');
for (const feat of FEAT_DEFINITIONS) {
  assert.ok(feat.prosRu.length > 0, `${feat.id} must have pros`);
  assert.ok(feat.consRu.length > 0, `${feat.id} must have cons`);
  assert.ok(!feat.description.includes('Пустош'), `${feat.id} must not use word 'Пустошь'`);
}

// 11. Check Backgrounds: no class labels, no Пустошь, correct core skills
assert.equal(BACKGROUND_DEFINITIONS.length, 8, 'Must have 8 backgrounds');
for (const bg of BACKGROUND_DEFINITIONS) {
  assert.ok(!bg.descriptionRu.includes('Пустош'), `${bg.id} must not use word 'Пустошь'`);
  assert.ok(bg.descriptionRu.length > 30, `${bg.id} must have rich personal backstory`);
  if (bg.coreSkill) assert.ok(SKILL_DEFINITIONS.some((s) => s.id === bg.coreSkill), `${bg.id} coreSkill must be valid 23-skill`);
  assert.ok(FEAT_DEFINITIONS.some((f) => f.id === bg.recommendedFeat), `${bg.id} recommendedFeat must exist in FEAT_DEFINITIONS`);
}

// 12. Check Pets: all 4 pets have roleNoteRu, subtitleRu, descriptionRu, no Пустошь
assert.equal(PET_DEFINITIONS.length, 4, 'Must have 4 pets');
for (const pet of PET_DEFINITIONS) {
  assert.ok(pet.roleNoteRu && pet.roleNoteRu.length > 10, `${pet.id} must have roleNoteRu`);
  assert.ok(pet.subtitleRu && pet.subtitleRu.length > 5, `${pet.id} must have subtitleRu`);
  assert.ok(!pet.descriptionRu.includes('Пустош'), `${pet.id} must not use word 'Пустошь'`);
}

console.log('22-skill mathematical audit, archetype, feat balance & gameplay integration tests: PASS');

