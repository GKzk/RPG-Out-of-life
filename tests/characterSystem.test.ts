import assert from 'node:assert/strict';
import { ITEM_DATABASE } from '../src/data/items';
import { calculateDerivedStats } from '../src/utils/statCalculations';
import { resolveCompanionDamage, stabilizeCompanion, advanceCompanionBleedout, resolveStabilizedMedicalProcedure, canAttemptStabilizedProcedure } from '../src/utils/companionSystem';
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
} from '../src/utils/characterSystem';
import { calculateSkillValue } from '../src/utils/statCalculations';
import { SKILL_DEFINITIONS } from '../src/data/skills';

for (let v = 1; v <= 10; v++) assert.equal(getAttributeMod(v), v - 5);
assert.deepEqual([1,2,3,4,5,6,7,8,9,10].map(getPointBuyCost), [0,1,2,3,4,5,7,10,14,19]);
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
assert.equal(calculateCritBurstDamage(6, 4, 2, -1), 17);
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


const healthy = resolveCompanionDamage(10, 20, 10);
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
assert.equal(SKILL_DEFINITIONS.length, 22, 'canonical skill count');
assert.equal(new Set(SKILL_DEFINITIONS.map((s) => s.id)).size, 22, 'skill IDs must be unique');
assert.deepEqual(SKILL_DEFINITIONS.map((s) => s.id), ["athletics","stealth","sleightOfHand","unarmed","melee","firearms","explosives","survival","search","navigation","insight","medicine","mechanics","electronics","science","crafting","persuasion","barter","deception","leadership","animalHandling","performance"], 'skill order must match canonical model');

const neutralSkillCharacter = {
  ...auditCharacter,
  taggedSkills: [],
  skillPointsInvested: Object.fromEntries(ids.map((id) => [id, 0])) as Record<string, number>,
};
const neutralSpecial = { STR: 5, PER: 5, END: 5, CHA: 5, INT: 5, AGI: 5, LCK: 5 };

for (const skill of SKILL_DEFINITIONS) {
  assert.equal(calculateSkillValue(skill.id, neutralSkillCharacter, neutralSpecial), 25, skill.id + ' neutral baseline');
}

const taggedCharacter = { ...neutralSkillCharacter, taggedSkills: ['performance'] as const };
assert.equal(calculateSkillValue('performance', taggedCharacter, neutralSpecial), 45, 'tag bonus is +20');
assert.equal(calculateSkillValue('athletics', taggedCharacter, neutralSpecial), 25, 'untagged skill receives no tag bonus');

const specialistSpecial = { STR: 10, PER: 10, END: 10, CHA: 10, INT: 10, AGI: 10, LCK: 10 };
assert.equal(calculateSkillValue('athletics', neutralSkillCharacter, specialistSpecial), 50, '10/10 attribute baseline');
assert.equal(calculateSkillValue('athletics', taggedCharacter, specialistSpecial), 70, '10/10 tagged baseline');

const overCapCharacter = {
  ...neutralSkillCharacter,
  taggedSkills: ['athletics'] as const,
  skillPointsInvested: { ...neutralSkillCharacter.skillPointsInvested, athletics: 999 },
};
assert.equal(calculateSkillValue('athletics', overCapCharacter, specialistSpecial), 100, 'skill value is capped at 100');

for (const skill of SKILL_DEFINITIONS) {
  const low = calculateSkillValue(skill.id, neutralSkillCharacter, { STR: 1, PER: 1, END: 1, CHA: 1, INT: 1, AGI: 1, LCK: 1 });
  const high = calculateSkillValue(skill.id, neutralSkillCharacter, specialistSpecial);
  assert.ok(low >= 1 && low <= 100, skill.id + ' low bound');
  assert.ok(high >= 1 && high <= 100, skill.id + ' high bound');
}

console.log('22-skill mathematical audit: PASS');
