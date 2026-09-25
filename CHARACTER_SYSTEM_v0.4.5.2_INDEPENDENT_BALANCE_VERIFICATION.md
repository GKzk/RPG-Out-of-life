# Character System v0.4.5.2 — Independent Balance Verification

**Проект:** RPG-Out-of-life  
**Назначение:** независимая повторная проверка оставшихся блокеров после v0.4.5.1.  
**Правило аудита:** не принимать вывод READY из предыдущих документов без повторного расчёта.  
**Ограничение:** этот документ не меняет игровые правила и не разрешает Migration Plan.

## 1. Executive result

После независимой проверки статус **CONDITIONALLY READY** сохраняется.

- D20 probability — подтверждено.
- Nat 1 / Nat 20 split — подтверждено.
- Success with Cost — подтверждено.
- Point Buy — подтверждено арифметически.
- LCK — **не является доказанно dominant в проверенных нормализованных сценариях**, но system-wide proof отсутствует.
- CHA/Companion — **не может быть количественно закрыт**, потому что полного боевого контракта спутника нет.
- STR damage — текущий код содержит формулу, но она относится к старому D100 combat implementation и не является автоматически канонической формулой v0.4.4+.
- Burst damage — недостаточно данных для lock.
- Survival — design-level circuit breakers определены, но code-level проверка новой системы невозможна до миграции.

**Migration Plan: NOT ALLOWED.**

## 2. Independent D20 verification

Правило:

Total = d20 + AttributeMod + SkillRank + Equipment + Condition + Circumstance

Вне боя Natural 1 не является auto-fail.

Для RequiredRoll = DC - Modifier:

- >20 → 0%
- <=1 → 100%
- 2..20 → (21 - RequiredRoll) × 5%

Для обычной боевой атаки Natural 1 = auto-miss, поэтому максимум обычного попадания = 95%.

| DC | Modifier | Required | Non-combat | Combat |
|---:|---:|---:|---:|---:|
| 8 | +7 | 1 | 100% | 95% |
| 10 | +11 | -1 | 100% | 95% |
| 15 | +8 | 7 | 70% | 70% |
| 22 | +11 | 11 | 50% | 50% |
| 30 | +11 | 19 | 10% | 10% |
| 30 | +14 | 16 | 25% | 25% |

**Result: LOCKED.**

## 3. Success with Cost

- Total >= DC → Success.
- Total = DC-1 или DC-2 → Success with Cost.
- Total <= DC-3 → Failure.
- Natural 1 не отменяет Success with Cost.
- Natural 1 при Total >= DC → Success with Glitch.
- Механика не применяется к обычным боевым атакам.

**Result: LOCKED.**

## 4. Point Buy

Стоимость: 1=0, 2=1, 3=2, 4=3, 5=4, 6=5, 7=7, 8=10, 9=14, 10=19. Budget = 28.

Проверка 20 ранее заявленных билдов подтверждает: ни один не превышает 28.

Это доказывает только валидность Point Buy, а не balance всех билдов.

**Result: LOCKED mathematically; balance remains separate.**

## 5. LCK — corrected expected-damage model

Для оружия 1d8+2:

- normal average = 6.5
- crit average = 14.5
- crit occurs only after a successful hit
- AC = 14

E[D] = P(hit) × ((1-P(crit)) × 6.5 + P(crit) × 14.5)

| Build | Hit | Crit | Attacks | E[D]/attack | E[D]/round |
|---|---:|---:|---:|---:|---:|
| LCK 9 | 35% | 15% | 2 | 2.695 | 5.390 |
| PER 9 | 55% | 5% | 2 | 3.795 | 7.590 |
| AGI 9 | 35% | 5% | 3 | 2.415 | 7.245 |

В этом сценарии LCK 9 не dominant.

### 5.1 Normalized Point Buy test

Одинаковый бюджет 28 и одинаковые AGI/END.

**Pair A**

- LCK build: PER 6 / LCK 10 / AGI 2 / END 4.
- Accuracy = 55%.
- Crit = 20%.
- 2 attacks.
- Expected damage = **8.91/round**.

Equivalent-cost alternative:

- PER 8 / LCK 9 / AGI 2 / END 4.
- Accuracy = 65%.
- Crit = 15%.
- 2 attacks.
- Expected damage = **10.01/round**.

**Pair B**

- LCK build: PER 5 / LCK 10 / AGI 2 / END 5.
- Expected damage = **8.10/round**.

Equivalent-cost alternative:

- PER 10 / LCK 5 / AGI 2 / END 5.
- Expected damage = **10.95/round**.

**Conclusion:** повышение LCK до 10 не компенсирует потерю PER в проверенных ranged scenarios.

Это не доказывает отсутствие dominance во всех ситуациях, но снимает основной риск «LCK 10 автоматически лучший боевой стат».

## 6. LCK marginal-value analysis

При hit probability 50% переход между критическими ступенями даёт примерно +0.20 expected damage/attack для оружия 1d8+2.

При hit probability 80% тот же переход даёт примерно +0.32 expected damage/attack.

Следовательно, LCK становится ценнее при высокой точности, но PER одновременно является источником этой точности.

Это создаёт trade-off, а не бесплатный damage.

**Result: no dominance demonstrated.**

## 7. LCK + attack count

P(at least one crit) = 1 - (1-p)^n

Для LCK 10:

- 1 attack → 20.00%
- 2 → 36.00%
- 3 → 48.80%
- 4 → 59.04%

Для LCK 5–7:

- 1 → 10.00%
- 2 → 19.00%
- 3 → 27.10%
- 4 → 34.39%

LCK масштабируется с количеством атак. Это требует отдельной проверки после фиксации Burst и multi-attack mechanics.

**Result: conditionally locked.**

## 8. LCK misfire mitigation

Base clearing cost = 2 AP. LCK 8+ = 1 AP.

Ожидаемая экономия AP:

- 1 attack → 0.05 AP/round
- 2 → 0.10
- 3 → 0.15
- 4 → 0.20

Это небольшой secondary benefit и не выглядит источником dominance.

## 9. Scavenger Luck +20%

Правило «+20% rare ammo chance» недостаточно строго определено.

Неясно, означает ли это percentage points, relative multiplier, roll modifier или изменение loot-table weight.

Без baseline probability экономическую ценность посчитать нельзя.

**Result: NOT LOCKED.**

Предложение для будущего lock-test: P_final = min(P_max, P_base × 1.20). Это пока предложение, не утверждённое правило.

## 10. STR — Design vs Current Code

Текущий src/utils/statCalculations.ts содержит старую combat-формулу:

melee raw damage += floor(STR × 1.5)

Но текущий код одновременно использует D100 hit system, старые Fallout skills, старый Point Buy и старый derived-stat model.

Поэтому эта формула не может автоматически считаться канонической частью v0.4.4+.

Документация v0.4.4 задаёт STR как фактор CQC, но не фиксирует окончательную отдельную формулу damage для нового D20 model.

**Result: STR damage formula = NOT LOCKED.**

## 11. STR future design proposal

Для дальнейшего тестирования можно рассмотреть:

MeleeDamageMod = floor((STR - 5) / 2)

или:

MeleeDamageMod = STR - 5

Обе формулы требуют отдельного balance test и пока не являются утверждённым правилом.

## 12. CHA breakpoint audit

CompanionSlots = max(0, floor((CHA - 2)/3))

Breakpoints:

- CHA 4 → 0.
- CHA 5 → 1.
- CHA 7 → 1.
- CHA 8 → 2.

Стоимость:

- 4 → 5 = +1 Point Buy.
- 7 → 8 = +3 Point Buy.

Breakpoint создаёт новую боевую сущность, поэтому одного штрафа -2 to hit недостаточно для доказательства баланса.

Нужны:

- companion accuracy;
- HP;
- AC/Defense;
- damage;
- crit;
- range;
- initiative;
- target selection;
- status;
- ammunition;
- healing;
- downed/death;
- revival;
- XP;
- loot;
- support fire;
- take cover;
- first aid;
- suppression;
- action costs;
- LCK interaction.

**Result: CHA breakpoint balance = NOT LOCKED.**

## 13. Why Squad Support is not yet mathematically proven

Правило «1 tactical action per companion» действительно предотвращает независимые AP pools.

Но оно доказывает только отсутствие AP multiplication.

Оно не доказывает отсутствие damage multiplication.

Пример: если бесплатный support shot имеет 70% accuracy и 10 average damage, он даёт 7 expected damage/round до учёта дополнительных эффектов.

Поэтому CHA 4→5 и 7→8 требуют normalized combat test.

**Result: architecture = CONDITIONALLY LOCKED; balance = NOT LOCKED.**

## 14. Companion contract minimum lock table

| Parameter | Status |
|---|---|
| Companion HP | Inconsistent |
| Companion AC | Missing |
| Accuracy | Missing |
| Damage | Missing |
| Crit | Missing |
| Range | Partial |
| Initiative | Missing |
| Target selection | Missing |
| Support Fire | Name only |
| Take Cover | Name only |
| First Aid | Name only |
| First Aid cost | Missing |
| Ammo | Missing |
| Healing | Missing |
| Downed | Missing |
| Death | Missing |
| Revival | Missing |
| XP | Missing |
| Loot | Missing |
| Weapon loss | Missing |
| LCK interaction | Missing |
| Player skill interaction | Missing |
| Suppression | Missing |

Дополнительная внутренняя ошибка: ранее указанное maxHP = 20 + END×3 использует END, но END отсутствует в минимальном CompanionContract.

**Result: NOT LOCKED.**

## 15. Survival audit

Design-level circuit breakers:

- early hunger/thirst do not remove base combat AP;
- critical dehydration can remove 1 AP;
- Adrenaline Surge lasts max 3 combat rounds;
- Adrenaline Crash follows combat;
- clean-water camp rest removes fatigue debuff.

Это закрывает обнаруженный low-HP loop на уровне спецификации.

Но current code still contains old direct SPECIAL penalties and old AP penalties. Поэтому implementation verification новой системы возможна только после миграции или отдельного prototype.

**Result: DESIGN CONDITIONALLY LOCKED; implementation verification pending.**

## 16. Contradiction audit

Проверено:

1. Combat Nat 1 vs non-combat Nat 1 — no contradiction.
2. Combat Nat 20 vs non-combat Nat 20 — no contradiction.
3. Success with Cost vs Nat 1 — no contradiction after v0.4.5.1.
4. Burst single-roll crit model vs LCK crit range — no contradiction.
5. Point Buy cost table vs 20 sample builds — no arithmetic contradiction.
6. Squad Support vs independent companion AP — no contradiction.
7. Companion action economy vs damage economy — not proven because damage contract missing.
8. STR damage vs new D20 model — undefined, not contradictory but incomplete.
9. Scavenger Luck +20% — undefined, not contradictory but incomplete.

**Result: CONDITIONALLY LOCKED.**

## 17. Final status matrix

| Subsystem | Status |
|---|---|
| SPECIAL | LOCKED |
| Point Buy arithmetic | LOCKED |
| D20 | LOCKED |
| Nat 1 / Nat 20 | LOCKED |
| Success with Cost | LOCKED |
| 8 Skills | LOCKED |
| LCK crit concept | CONDITIONALLY LOCKED |
| LCK normalized combat test | PASS for tested scenarios |
| LCK system-wide proof | NOT LOCKED |
| LCK rare-ammo formula | NOT LOCKED |
| STR damage formula | NOT LOCKED |
| Burst crit interaction | LOCKED |
| Burst damage formula | NOT LOCKED |
| CHA slot formula | LOCKED |
| CHA breakpoint balance | NOT LOCKED |
| Squad Support architecture | CONDITIONALLY LOCKED |
| Companion combat contract | NOT LOCKED |
| Survival design | CONDITIONALLY LOCKED |
| Survival implementation | NOT VERIFIED |
| Overall Character System | CONDITIONALLY READY |
| Migration Plan | NOT ALLOWED |

## 18. Final blockers

### BLOCKER A — STR damage
Define exact D20-era melee damage formula.

### BLOCKER B — Burst damage
Define the final deterministic Burst damage model.

### BLOCKER C — LCK loot
Define mathematically what +20% means.

### BLOCKER D — Companion combat contract
Define all minimum combat parameters.

### BLOCKER E — CHA breakpoints
Run normalized CHA 4→5 and 7→8 tests after Companion Contract exists.

### BLOCKER F — LCK system-wide test
Run 1–4 attack scenarios with the final Burst/perk system.

## FINAL VERDICT

CHARACTER SYSTEM v0.4.5.2  
STATUS: CONDITIONALLY READY

MATHEMATICAL CORE: PASS

LCK: NO DOMINANCE FOUND IN NORMALIZED TESTS, BUT SYSTEM-WIDE PROOF INCOMPLETE

CHA: ACTION-ECONOMY ARCHITECTURE ACCEPTABLE, BALANCE PROOF INCOMPLETE

STR: DAMAGE FORMULA NOT LOCKED

COMPANIONS: COMBAT CONTRACT NOT LOCKED

BURST: DAMAGE FORMULA NOT LOCKED

MIGRATION PLAN: NOT ALLOWED
