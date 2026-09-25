import assert from 'node:assert/strict';
import {
  getAttributeMod,
  getPointBuyCost,
  getMaxAP,
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

for (let v = 1; v <= 10; v++) assert.equal(getAttributeMod(v), v - 5);
assert.deepEqual([1,2,3,4,5,6,7,8,9,10].map(getPointBuyCost), [0,1,2,3,4,5,7,10,14,19]);
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
