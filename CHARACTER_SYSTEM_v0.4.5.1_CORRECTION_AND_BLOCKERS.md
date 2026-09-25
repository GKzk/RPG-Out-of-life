# Character System v0.4.5.1 — Correction & Remaining Blockers

**Проект:** RPG-Out-of-life  
**Основа:** CHARACTER_SYSTEM_v0.4.5_FINAL_EDGE_CASE_AUDIT.md  
**Назначение:** исправление математических ошибок v0.4.5 и фиксация реально незакрытых вопросов перед Migration Plan.

> Этот документ не меняет исторический аудит v0.4.5. Он фиксирует результаты независимой проверки его расчётов и заменяет только те выводы, которые не выдерживают повторной проверки.

## 1. Статус

**Итоговый статус Character System после проверки v0.4.5: CONDITIONALLY READY.**

Migration Plan пока **не разрешается**.

Причина: базовая D20-модель и большая часть правил согласованы, но quantitative balance proof для LCK и CHA/Companion action economy недостаточен.

## 2. D20 — подтверждено

Правило вне боя:

Total = D20 + AttributeMod + SkillRank + EquipmentMod + ConditionMod + Circumstance

Natural 1 вне боя не является автоматическим провалом.

Если Total >= DC, проверка успешна независимо от результата D20.

Поэтому:

- RequiredRoll > 20 → 0%
- RequiredRoll <= 1 → 100%
- 2..20 → (21 - RequiredRoll) × 5%

Боевые атаки отдельно используют Auto-Miss на Natural 1 и поэтому имеют максимум 95% при обычном броске атаки.

**Статус: LOCKED.**

## 3. Success with Cost — подтверждено

Финальная модель:

- Total >= DC → Success
- Total = DC-1 → Success with Cost
- Total = DC-2 → Success with Cost
- Total <= DC-3 → Failure

Natural 1 не отменяет Success with Cost, если действие разрешает эту категорию исхода.

Natural 1 при Total >= DC даёт Success with Glitch.

Success with Cost не используется для действий, где система заранее запрещает такой исход из-за смертельного/необратимого риска.

**Статус: LOCKED.**

## 4. LCK — математическая ошибка в v0.4.5

В исходном v0.4.5 были неверно рассчитаны Expected Damage per Attack.

Условия исходного теста:

- weapon: 1d8 + 2
- normal average damage = 6.5
- critical damage = 8 + 1d8 + 2 = 14.5
- crit происходит только после успешного попадания
- AC = 14

Правильная формула:

E[D] = P(hit) × ((1-P(crit)) × D_normal + P(crit) × D_crit)

### 4.1. LCK Focus

LCK 9:

- crit = 18–20 = 15%
- hit = 35%
- attacks = 2

E[D/attack] = 0.35 × (0.85×6.5 + 0.15×14.5) = **2.695**

E[D/round] = **5.390**

Исходный аудит указывал 3.025 / 6.05. Это математически неверно.

### 4.2. PER Focus

PER 9:

- hit = 55%
- crit = 5%
- attacks = 2

E[D/attack] = 0.55 × (0.95×6.5 + 0.05×14.5) = **3.795**

E[D/round] = **7.590**

Исходный аудит указывал 3.975 / 7.95. Это математически неверно.

### 4.3. AGI Focus

AGI 9:

- hit = 35%
- crit = 5%
- attacks = 3

E[D/attack] = 0.35 × (0.95×6.5 + 0.05×14.5) = **2.415**

E[D/round] = **7.245**

Исходный аудит указывал 2.675 / 8.025. Это математически неверно.

### 4.4. STR Focus

В v0.4.5 STR Focus сравнивается с CQC, но окончательная формула влияния STR на damage не зафиксирована в самом тесте.

Поэтому числовой результат STR Focus нельзя использовать как доказательство баланса до фиксации:

- влияет ли STR на damage;
- точной формулы damage modifier;
- применимости этого modifier к CQC;
- взаимодействия STR с оружием.

**Статус LCK quantitative proof: NOT LOCKED.**

## 5. LCK — что уже можно утверждать

После исправления арифметики при указанных условиях:

| Build | Hit | Crit | Attacks | Expected damage/round |
|---|---:|---:|---:|---:|
| LCK 9 | 35% | 15% | 2 | **5.390** |
| PER 9 | 55% | 5% | 2 | **7.590** |
| AGI 9 | 35% | 5% | 3 | **7.245** |

Это показывает, что в данном конкретном тесте LCK 9 не является dominant по ожидаемому урону.

Однако это **не является полным доказательством отсутствия LCK dominance** во всей системе.

Необходимо отдельно проверить:

1. LCK 10;
2. 1, 2, 3 и 4 атаки;
3. burst после окончательной фиксации его damage formula;
4. perks, которые увеличивают число атак или усиливают crit;
5. marginal value Point Buy при переносе 1–5 очков между PER/AGI/LCK;
6. влияние LCK на misfire;
7. влияние LCK на procedural loot.

## 6. Burst — правило сохраняется

Burst должен делать **один D20 roll на действие**, а не отдельный crit roll для каждой пули.

Это предотвращает искусственное масштабирование LCK через количество пуль.

Однако damage formula Burst должна быть зафиксирована отдельно до реализации.

**Статус Burst crit interaction: LOCKED.**  
**Статус Burst damage formula: INSUFFICIENT DATA.**

## 7. CHA / Companions — основной незакрытый балансный вопрос

Формула слотов:

CompanionSlots = max(0, floor((CHA-2)/3))

даёт:

- CHA 1–4 → 0
- CHA 5–7 → 1
- CHA 8–10 → 2

Саму формулу можно сохранить.

Но переход CHA 4 → CHA 5 стоит только 1 Point Buy и одновременно открывает дополнительную боевую сущность.

Поэтому утверждение «дисбаланса нет» не может быть доказано только расходом еды/воды и штрафом к скрытности.

Нужен нормализованный combat test.

Минимальные условия:

- одинаковый общий Point Buy;
- одинаковое оружие/экипировка;
- одинаковый стартовый ресурс;
- одинаковый враг;
- одинаковое количество раундов;
- сравнение CHA 4 / CHA 5;
- сравнение CHA 7 / CHA 8;
- измерение expected damage, survivability и resource cost.

**Статус CHA breakpoint balance: NOT LOCKED.**

## 8. Companion Contract — обязательное дополнение

В v0.4.5 появился минимальный interface, но он недостаточен для количественного combat balance.

До Migration Plan необходимо зафиксировать:

- attack modifier / accuracy;
- damage formula;
- crit rules;
- range;
- initiative/order;
- target selection;
- defense/AC;
- status effects;
- Support Fire;
- Take Cover;
- First Aid;
- cost/effect of First Aid;
- ammunition consumption;
- healing;
- Downed state;
- death/permadeath;
- revival;
- XP;
- loot;
- weapon loss;
- interaction with LCK;
- interaction with player skills;
- exact effect of suppression.

Также устранить внутреннюю неопределённость:

maxHP = 20 + END×3

использует END, но END отсутствует среди параметров текущего CompanionContract.

**Статус Companion Contract: CONDITIONALLY LOCKED.**

## 9. Survival — подтверждено концептуально

Adrenaline Surge:

- только во время боя;
- максимум 3 раунда;
- вне боя не действует;
- после боя +20 Fatigue через Adrenaline Crash.

Это закрывает выявленный low-HP exploit на уровне design rule.

Но точные значения остальных survival modifiers должны быть проверены при реализации.

**Статус: CONDITIONALLY LOCKED до gameplay implementation test.**

## 10. Logical consistency

Следующие правила теперь непротиворечивы:

- Combat Nat 1 → Auto-Miss.
- Non-Combat Nat 1 → обычный Total + возможный Glitch.
- Combat Nat 20 → Auto-Hit + Crit.
- Non-Combat Nat 20 → не гарантирует успех.
- Success with Cost не отменяется Nat 1.
- Burst не получает отдельный crit roll на каждую пулю.

Но утверждение о полном отсутствии противоречий преждевременно, пока не закрыты Companion и damage formulas.

**Статус: CONDITIONALLY LOCKED.**

## 11. Final Decision Matrix

| Подсистема | Статус |
|---|---|
| SPECIAL | LOCKED |
| Point Buy | LOCKED |
| D20 | LOCKED |
| Nat 1 / Nat 20 | LOCKED |
| Success with Cost | LOCKED |
| 8 Skills | LOCKED |
| Burst crit model | LOCKED |
| Burst damage formula | INSUFFICIENT DATA |
| Survival core | CONDITIONALLY LOCKED |
| LCK concept | CONDITIONALLY LOCKED |
| LCK quantitative balance | NOT LOCKED |
| CHA slot formula | LOCKED |
| CHA breakpoint balance | NOT LOCKED |
| Companion action economy | NOT LOCKED |
| Companion combat contract | CONDITIONALLY LOCKED |
| Progression / XP | LOCKED |
| Character System overall | CONDITIONALLY READY |

## 12. Required next verification

Следующий аудит должен быть узким и не должен переписывать всю Character System.

Обязательно:

1. Correct LCK/PER/AGI/STR expected-damage model.
2. Explicit STR damage formula.
3. LCK 1–10 marginal-value test.
4. LCK with 1–4 attacks.
5. Burst damage + crit interaction.
6. CHA 4→5 and 7→8 action-economy test.
7. Full Companion combat contract.
8. Solo / Squad / Commander normalized comparison.
9. Re-run contradiction audit after these rules are fixed.

До выполнения этих пунктов **Migration Plan не создавать**.

---

FINAL VERDICT:
CONDITIONALLY READY

MIGRATION PLAN:
NOT ALLOWED

REMAINING BLOCKERS:
1. Исправить Expected Damage calculations from v0.4.5.
2. Зафиксировать STR damage formula.
3. Доказать LCK balance normalized tests.
4. Доказать CHA 4→5 and 7→8 action economy balance.
5. Полностью определить Companion combat contract.
6. Зафиксировать Burst damage formula.
