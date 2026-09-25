# Character System v0.4.5.7 — Final Design Lock

**Проект**: RPG-Out-of-life (пошаговая постапокалиптическая RPG)  
**Статус**: FINAL DESIGN LOCK — перед Migration Plan  
**Дата**: 25 сентября 2026  
**Основа**: `v0.4.5.6_FINAL_AUDIT_CORRECTIONS` + утверждённые человеком решения по Burst Fire и Companion Logistics  
**Исходный код `src/`**: НЕ изменяется на этом этапе.

---

## 1. Назначение документа

Документ закрывает два последних design blockers:

1. **Burst Fire** — финальная математическая модель и штраф к точности.
2. **Companion Logistics** — финальные правила снабжения, боеприпасов, скрытности и переносимого веса.

После этого Character System считается математически и системно заблокированной для подготовки отдельного `CHARACTER_SYSTEM_MIGRATION_PLAN.md`.

**Важно:** Migration Plan ещё не является реализацией. До его создания и отдельного одобрения миграции `src/` не изменяется.

---

# 2. BURST FIRE — LOCKED

## 2.1. Общая механика

Burst Fire — отдельный режим атаки автоматического оружия.

За одно действие Burst:

- расходуется **3 патрона**;
- выполняется **ровно 1 бросок D20**;
- Burst считается **одной атакой**;
- LCK получает только **одну проверку критического диапазона**;
- при промахе весь Burst промахивается;
- при попадании применяется полный Burst damage;
- отдельные пули не получают независимые броски на попадание/крит.

Это предотвращает экспоненциальный рост эффективности LCK на автоматическом оружии.

---

## 2.2. AP

Стоимость Burst:

[
\mathbf{BurstAP = BaseShotAP + 2}
]

Примеры:

| Одиночный выстрел | Burst |
|---:|---:|
| 2 AP | **4 AP** |
| 3 AP | **5 AP** |
| 4 AP | **6 AP** |

Burst не должен быть дешевле одиночного выстрела по AP.

---

## 2.3. Боеприпасы

Каждый Burst расходует:

[
\mathbf{AmmoCost = 3}
]

Если в магазине/инвентаре недостаточно 3 патронов, Burst недоступен.

Burst не создаёт дополнительных скрытых расходов сверх этих 3 патронов.

---

## 2.4. Штраф к точности

Burst получает фиксированный:

[
\mathbf{-4\ Accuracy}
]

к итоговому броску атаки.

Итоговая формула:

[
AttackRoll =
D20 + AttackMod + SkillBonus + WeaponAccuracy - 4
]

Штраф применяется **один раз ко всему Burst**.

### Дизайнерский смысл

Burst — мощный, но неточный режим.

Игрок получает:

- потенциально высокий урон;
- расход 3 патронов;
- +2 AP к базовой стоимости;
- **-4 к точности**.

Следовательно, Burst не является универсально лучшей альтернативой одиночному выстрелу.

---

## 2.5. Обычный Burst Damage

[
\mathbf{BurstDamage =
max(1, 2 \times RollWeaponDice + WeaponFlat + AttributeMod)}
]

Где:

- `RollWeaponDice` — один обычный бросок кубика оружия;
- `WeaponFlat` — плоский бонус оружия;
- `AttributeMod` — модификатор соответствующей характеристики.

Минимальный урон после расчёта — 1.

---

## 2.6. Critical Burst Damage

При критическом попадании:

[
\mathbf{CritBurstDamage =
2 \times MaxWeaponDice +
2 \times RollWeaponDice +
WeaponFlat +
AttributeMod}
]

Крит распространяется на **весь Burst**, но проверяется только один раз.

---

## 2.7. LCK и Burst

Burst использует стандартные правила LCK:

- LCK 1–4 → Threat 20;
- LCK 5–7 → Threat 19–20;
- LCK 8–9 → Threat 18–20;
- LCK 10 → Threat 17–20;
- Natural 20 → автоматическое попадание + крит;
- Threat 17–19 требует обычного подтверждения попадания против AC.

Важно:

> Burst не превращает 3 патрона в 3 независимых критических проверки.

Это обязательная часть баланса автоматического оружия.

---

## 2.8. DT и DR

После определения итогового Burst damage:

1. DT цели вычитается **один раз**;
2. затем применяется DR цели.

[
PostDT = max(0, BurstDamage - DT)
]

После этого применяется стандартная формула DR.

DT/DR не применяются отдельно к каждой из трёх пуль.

---

## 2.9. Natural 1

Natural 1 в Burst:

- автоматический промах;
- стандартная осечка (Misfire);
- применяются обычные правила задержки оружия.

LCK >= 8 уменьшает стандартную стоимость устранения Misfire с 2 AP до 1 AP.

---

## 2.10. Финальный контракт Burst

```text
BURST FIRE = LOCKED

1 D20
3 ammo
Base Shot AP + 2
-4 Accuracy
2x RollWeaponDice + WeaponFlat + AttributeMod
1 critical check per Burst
DT once
DR after DT
Nat 20 = Auto-Hit + Crit
Nat 1 = Auto-Miss + Misfire
```

---

# 3. COMPANION LOGISTICS — LOCKED

## 3.1. Основной принцип

Спутники создают **реальную экономическую нагрузку**, но не получают искусственных постоянных штрафов, которые не являются частью конкретной ситуации.

Баланс строится по принципу:

[
\text{CHA}
\rightarrow
\text{Companion Slots}
\rightarrow
\text{Additional Actions}
\rightarrow
\text{Additional Resource Consumption}
]

---

## 3.2. Еда и вода

Игрок без спутников:

- **1 Food / день**
- **1 Water / день**

Каждый активный спутник добавляет:

- **+1 Food / день**
- **+1 Water / день**

Итого:

| Состав отряда | Food/day | Water/day |
|---|---:|---:|
| Solo | 1 | 1 |
| Игрок + 1 companion | **2** | **2** |
| Игрок + 2 companions | **3** | **3** |

Это именно дополнительный расход спутников, а не штраф к характеристикам персонажа.

---

## 3.3. Боеприпасы спутников

Боеприпасы находятся в **общем инвентаре отряда**.

Каждое действие `Support Fire`:

[
\mathbf{AmmoCost = 1}
]

Таким образом:

- Solo: дополнительного расхода от спутников нет;
- 1 companion с Support Fire: +1 патрон за squad round;
- 2 companions с Support Fire: +2 патрона за squad round.

Если необходимого боеприпаса нет, `Support Fire` недоступен.

---

## 3.4. Stealth

**Постоянного штрафа к Stealth за наличие спутников нет.**

Удаляются/аннулируются старые значения:

- -2 Stealth за одного спутника;
- -4 Stealth за двух спутников.

Причина: такие фиксированные штрафы превращают CHA-композицию отряда в искусственный hard lock на скрытность.

Вместо этого:

- размер группы может учитываться конкретным сценарием;
- шум оружия, броня, поверхность, поведение NPC и конкретная ситуация могут давать ситуативные модификаторы;
- отсутствие постоянного штрафа не означает автоматическую незаметность группы.

---

## 3.5. Carry Weight

За каждого **активного** спутника отряд получает:

[
\mathbf{+30\ kg}
]

доступной грузоподъёмности.

| Состав отряда | Дополнительная Carry Weight |
|---|---:|
| Solo | +0 кг |
| 1 companion | **+30 кг** |
| 2 companions | **+60 кг** |

Это бонус логистики от наличия физического носителя/рюкзака спутника.

Бонус не применяется к мёртвым спутникам, удалённым из отряда.

---

# 4. COMPANION ACTION ECONOMY — LOCKED

Количество слотов:

[
\mathbf{CompanionSlots =
max(0, floor((CHA-2)/3))}
]

Следовательно:

| CHA | Companions |
|---:|---:|
| 1–4 | 0 |
| 5–7 | 1 |
| 8–10 | 2 |

Каждый активный спутник получает **1 tactical action за squad round**.

Доступные действия:

- `Support Fire`;
- `Take Cover`;
- `First Aid`.

Спутники:

- не используют AP игрока для своих tactical actions;
- не получают отдельный полноценный player turn;
- не получают отдельный AP pool;
- не умножают количество AP игрока.

---

# 5. COMPANION STATE MACHINE — CONSISTENCY LOCK

Состояния:

```text
HEALTHY
   ↓
DOWNED
   ↓
STABILIZED
   ↓
HEALTHY / DEAD
```

### DOWNED

При:

[
-MaxHP < FinalHP \le 0
]

спутник становится DOWNED.

При:

[
FinalHP \le -MaxHP
]

спутник сразу становится DEAD.

Граничное значение:

[
FinalHP = -MaxHP \Rightarrow DEAD
]

### DOWNED → STABILIZED

Через `First Aid`:

- игрок: 2 AP + 1 medical item;
- другой спутник: 1 tactical action + 1 medical item.

После стабилизации bleedout timer останавливается.

### DOWNED → DEAD

Без стабилизации после 3 боевых раундов:

[
DOWNED \rightarrow DEAD
]

Дополнительный урон также может привести к смерти по установленным правилам overkill/bleedout.

### STABILIZED → HEALTHY

Для сохранения согласованности системы **Full Rest не заменяет медицинскую процедуру**.

После боя требуется:

- 1 Stim;
- Medicine check vs DC 12;
- максимум 3 попытки.

При успехе:

[
STABILIZED \rightarrow HEALTHY
]

с 1 HP.

Если процедура не выполнена/исчерпана, спутник остаётся STABILIZED и требует дальнейшей медицинской помощи.

Это предотвращает логический эксплойт:

> «Спутник стабилизирован → достаточно просто поспать → тяжёлое ранение исчезает бесплатно».

---

# 6. CHA OPPORTUNITY COST — ОБНОВЛЁННЫЙ СТАТУС

После фиксации логистики:

### CHA 4 → 5

Стоимость:

[
3 \rightarrow 4 PB = +1 PB
]

Эффект:

- 0 → 1 companion;
- +1 tactical action;
- +1 Food/day;
- +1 Water/day;
- потенциально +1 Support Fire ammo/round;
- +30 кг Carry Weight.

Постоянного -2 Stealth нет.

### CHA 7 → 8

Стоимость:

[
7 \rightarrow 10 PB = +3 PB
]

Эффект:

- 1 → 2 companions;
- +1 дополнительный tactical action;
- ещё +1 Food/day;
- ещё +1 Water/day;
- ещё +1 Support Fire ammo/round;
- ещё +30 кг Carry Weight.

Полная количественная оценка боевой ценности по-прежнему зависит от оружия, AC, AI и конкретного боевого контекста. Универсальный DPS companion не фиксируется.

**Статус: LOCKED / CONDITIONALLY BALANCE-VERIFIED.**

---

# 7. УДАЛЁННЫЕ УСТАРЕВШИЕ ПРАВИЛА

Следующие значения больше не являются каноном:

- Burst без штрафа к точности;
- -2 Stealth за 1 companion;
- -4 Stealth за 2 companions;
- удвоение/утроение общего расхода припасов как отдельный штраф;
- произвольные значения Burst AP;
- несколько независимых D20/crit checks внутри одного Burst;
- независимое применение DT/DR к каждой пуле Burst;
- автоматическое восстановление STABILIZED → HEALTHY только через Full Rest.

Если старые документы содержат эти значения, они рассматриваются как **historical/obsolete drafts**, а не как актуальный канон.

---

# 8. ФИНАЛЬНЫЙ СТАТУС CHARACTER SYSTEM

```text
CHARACTER SYSTEM v0.4.5.7

SPECIAL CORE: LOCKED
POINT BUY: LOCKED
MAX AP: LOCKED
STR MELEE DAMAGE: LOCKED
LCK THREAT & CRIT: LOCKED

COMPANION SLOTS: LOCKED
COMPANION ACTION ECONOMY: LOCKED
COMPANION LOGISTICS: LOCKED
COMPANION STATE MACHINE: LOCKED

BURST FIRE: LOCKED
BURST ACCURACY PENALTY: -4
BURST AMMO COST: 3
BURST AP: BASE + 2
BURST ROLL: 1 D20
BURST CRIT CHECKS: 1
BURST DAMAGE: 2x WEAPON DICE + FLAT + MOD

CHA OPPORTUNITY COST:
LOCKED / BALANCE-CONTEXT DEPENDENT

MIGRATION PLAN:
ALLOWED TO PREPARE

SRC IMPLEMENTATION:
NOT YET AUTHORIZED

NEXT STEP:
CHARACTER_SYSTEM_MIGRATION_PLAN.md
```

---

## 9. Предохранители перед миграцией

Перед изменением `src/` Migration Plan должен отдельно потребовать:

1. unit tests для Burst;
2. тесты Natural 1 / Natural 20;
3. тесты LCK threat confirmation;
4. тесты DT/DR на Burst;
5. тесты расхода 3 патронов;
6. тесты -4 Accuracy;
7. тесты AP = Base + 2;
8. тесты Companion Slots;
9. тесты Food/Water logistics;
10. тесты Support Fire ammo;
11. тесты Carry Weight;
12. тесты Companion State Machine;
13. запрет старых Stealth penalty;
14. запрет старых альтернативных AP formulas;
15. regression tests для существующей боевой математики.

**До прохождения этих тестов игровые значения не считаются перенесёнными в код.**
