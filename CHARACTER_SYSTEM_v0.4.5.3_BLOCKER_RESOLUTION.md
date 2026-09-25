# Character System v0.4.5.3 — Resolution of Mathematical Blockers
**Проект**: RPG-Out-of-life (Пошаговая постапокалиптическая мобильная RPG)  
**Репозиторий**: `GKzk/RPG-Out-of-life`  
**Статус документа**: Окончательное разрешение математических и системных блокеров  
**Дата**: 24 сентября 2026  
**Основа**: `CHARACTER_SYSTEM_v0.1` — `v0.4.5.2` (Исходный код `src/` НЕ изменялся)

---

## 1. BLOCKER A — STR Physical Damage Formula (Физический урон от Силы)

### 1.1. Базовый контракт характеристик
Канонический модификатор характеристики: $\mathbf{AttributeMod} = \mathbf{SPECIAL} - 5$.
Для Силы ($\text{STR}$):
| STR | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **DamageMod** | -4 | -3 | -2 | -1 | 0 | +1 | +2 | +3 | +4 | +5 |

---

### 1.2. Сравнение кандидатов формулы физического урона

Рассчитаем урон для трёх типов оружия ближнего боя:
- **Легкое (Dagger)**: $1\text{d4} + \text{Mod}$ (Базовый: мин 1, средн 2.5, макс 4)
- **Среднее (Machete)**: $1\text{d6} + \text{Mod}$ (Базовый: мин 1, средн 3.5, макс 6)
- **Тяжёлое (Sledgehammer)**: $1\text{d10} + \text{Mod}$ (Базовый: мин 1, средн 5.5, макс 10)

#### Модель A: Half-Linear Bonus — $\text{MeleeDamage} = \text{WeaponDamage} + \lfloor(\text{STR} - 5) / 2\rfloor$
- STR 1 (Mod -2): Machete $\text{avg} = 3.5 - 2 = 1.5$
- STR 5 (Mod 0): Machete $\text{avg} = 3.5 + 0 = 3.5$
- STR 10 (Mod +2): Machete $\text{avg} = 3.5 + 2 = 5.5$
- *Критика*: Слишком слабый рост за вложение 19 очков Point Buy в STR 10 ($+2$ урона за 19 очков).

#### Модель B: Full Linear Modifier — $\text{MeleeDamage} = \text{WeaponDamage} + (\text{STR} - 5)$
- STR 1 (Mod -4): Dagger $\text{min} = \max(1, 1 - 4) = 1$. Machete $\text{avg} = 3.5 - 4 = -0.5 \to \max(1, -0.5) = 1$.
- STR 5 (Mod 0): Dagger $\text{avg} = 2.5$, Machete $\text{avg} = 3.5$, Sledgehammer $\text{avg} = 5.5$.
- STR 10 (Mod +5): Dagger $\text{avg} = 7.5$, Machete $\text{avg} = 8.5$, Sledgehammer $\text{avg} = 10.5$.
- *Критика*: Идеальная линейность. При $\text{STR} < 5$ урон упирается в пол минимального урона $\mathbf{1}$.

#### Модель C: Threshold Step Bonus — $\text{MeleeDamage} = \text{WeaponDamage} + (\text{STR} - 5) + (\text{STR} \ge 8 ? 2 : 0)$
- *Критика*: Нелинейный скачок на пороговых значениях искусственно усложняет математику.

---

### 1.3. Точные математические показатели Модели B (Full Linear)

Правило минимального урона: $\mathbf{Damage} = \max(1, \text{WeaponRoll} + \text{DamageMod})$.

| STR | Dagger (1d4) Min/Avg/Max | Machete (1d6) Min/Avg/Max | Sledgehammer (1d10) Min/Avg/Max |
| :---: | :---: | :---: | :---: |
| **STR 1 (-4)** | 1 / 1.0 / 1 | 1 / 1.0 / 2 | 1 / 2.1 / 6 |
| **STR 3 (-2)** | 1 / 1.25 / 2 | 1 / 1.75 / 4 | 1 / 3.6 / 8 |
| **STR 5 (0)**  | 1 / 2.5 / 4 | 1 / 3.5 / 6 | 1 / 5.5 / 10 |
| **STR 7 (+2)** | 3 / 4.5 / 6 | 3 / 5.5 / 8 | 3 / 7.5 / 12 |
| **STR 8 (+3)** | 4 / 5.5 / 7 | 4 / 6.5 / 9 | 4 / 8.5 / 13 |
| **STR 10 (+5)**| 6 / 7.5 / 9 | 6 / 8.5 / 11 | 6 / 10.5 / 15 |

#### Взаимодействие с критическим уроном (`LOCKED` формула):
$$\mathbf{CritDamage} = \max(1, \mathbf{MaxWeaponDice} + \mathbf{RollWeaponDice} + \mathbf{DamageMod})$$
- **STR 10 + Sledgehammer Crit**: $10 + \text{1d10} + 5 = \mathbf{16..25\text{ урона}}$ (средний 20.5).
- **STR 1 + Sledgehammer Crit**: $10 + \text{1d10} - 4 = \mathbf{7..16\text{ урона}}$ (средний 11.5).

---

### 1.4. Канонический выбор BLOCKER A
$$\mathbf{MeleeDamage} = \max\Big(1, \ \mathbf{RollWeaponDice} + (\mathbf{STR} - 5)\Big) \quad [\text{LOCKED}]$$

- **Причина выбора**: Модель B полностью синхронизирована с единой D20-системой модификаторов ($\text{AttributeMod} = \text{SPECIAL} - 5$), обеспечивает честную линейную отдачу от вложенных очков Point Buy и защищена предохранителем минимального урона $\ge 1$.

---

## 2. BLOCKER B — Burst Damage Formula (Урон стрельбы очередью)

### 2.1. Контракт стрельбы очередью
1. `LOCKED`: Burst совершает **ровно один бросок D20** на действие (не N бросков за каждую пулю).
2. Расход патронов: **3 пули за очередь**.
3. Расход AP: базовый выстрел $+2\text{ AP}$ (например, пистолет-пулемет: выстрел 3 AP $\to$ очередь 5 AP).

---

### 2.2. Сравнение кандидатов формулы Burst Damage

#### Модель A: Multiplicative Multiplier — $\text{BurstDamage} = \text{SingleShotDamage} \times 2.0$
- *Плюсы*: Простота.
- *Минусы*: Удваивает модификаторы и статы. Оружие с единичным уроном становится слишком слабым, а тяжелое — имбалансным.

#### Модель B: Normalized Burst Multiplier — $\text{BurstDamage} = \text{RollWeaponDice} \times 2.0 + \text{DamageMod}$
- *Плюсы*: Удваивает только кубики оружия, но не суммирует плоский модификатор характеристики дважды.

#### Модель C: Flat Dice Expansion — $\text{BurstDamage} = \text{RollWeaponDice} + \text{BonusBurstDice}$ (например, $1\text{d6} \to 3\text{d6}$)
- *Плюсы*: Высокая вариативность.
- *Минусы*: Увеличивает количество бросков кубика, усложняет лог.

---

### 2.3. Математическое тестирование очередей для 3 видов автоматического оружия

Используем **Модель B** ($\text{BurstDamage} = \text{RollWeaponDice} \times 2 + \text{DamageMod}$):

1. **Low-Damage SMG 9mm** (Одиночный: $1\text{d6}$, средний 3.5; Очередь: $2\text{d6}$, средний 7.0)
   - PER 5 (Mod 0): Single Avg = 3.5, Burst Avg = 7.0.
   - PER 8 (Mod +3): Single Avg = 6.5, Burst Avg = 10.0.
   - Crit Single (PER 8): $6 + 1\text{d6} + 3 = 12.5$.
   - Crit Burst (PER 8): $12 + 2\text{d6} + 3 = \mathbf{22.0}$.

2. **Assault Rifle 5.56mm** (Одиночный: $1\text{d8}+1$, средний 5.5; Очередь: $2\text{d8}+1$, средний 10.0)
   - PER 5 (Mod 0): Single Avg = 5.5, Burst Avg = 10.0.
   - PER 8 (Mod +3): Single Avg = 8.5, Burst Avg = 13.0.
   - Crit Burst (PER 8): $16 + 2\text{d8} + 4 = \mathbf{29.0}$.

3. **High-Damage LMG 7.62mm** (Одиночный: $1\text{d12}+2$, средний 8.5; Очередь: $2\text{d12}+2$, средний 15.0)
   - STR 8 (Mod +3): Single Avg = 11.5, Burst Avg = 18.0.
   - Crit Burst (STR 8): $24 + 2\text{d12} + 5 = \mathbf{42.0}$.

---

### 2.4. Сравнение урона за раунд (Damage per Round / AP Efficiency)

Пистолет-пулемет SMG 9mm (PER 5, AGI 5 $\to 8\text{ AP}$):
- **Режим 1: Одиночные выстрелы** (3 AP за выстрел = 2 выстрела за 6 AP).
  - Expected Damage: $2 \times 3.5 = \mathbf{7.0\text{ урона}}$ (расход 2 патрона).
- **Режим 2: Очередь** (5 AP за очередь = 1 очередь за 5 AP + 3 AP остаток).
  - Expected Damage: $1 \times 7.0 = \mathbf{7.0\text{ урона}}$ (расход 3 патрона).
  - *Преимущество очереди*: Наносит весь урон за **1 действие**, экономя время и пробивая защитные эффекты цели за один раз.

---

### 2.5. Каноническая формула BLOCKER B
$$\mathbf{BurstDamage} = \max\Big(1, \ (\mathbf{RollWeaponDice} \times 2) + \mathbf{DamageMod}\Big) \quad [\text{LOCKED}]$$
$$\mathbf{CritBurstDamage} = (\mathbf{MaxWeaponDice} \times 2) + (\mathbf{RollWeaponDice} \times 2) + \mathbf{DamageMod} \quad [\text{LOCKED}]$$

- **Эффект с LCK**: LCK повышает вероятность выпадения критической очереди, но **не умножает урон суперобъёмно**, сохраняя математическую стабильность.

---

## 3. BLOCKER C — LCK +20% Rare Ammo Formula (Формула редких патронов)

### 3.1. Сравнение моделей расчета вероятности
Текущая черта LCK: `Scavenger Luck`.

#### Модель A: Relative Multiplier — $P_{\text{final}} = P_{\text{base}} \times 1.20$
- $P_{\text{base}} = 5\% \to P_{\text{final}} = 6.0\%$
- $P_{\text{base}} = 10\% \to P_{\text{final}} = 12.0\%$
- $P_{\text{base}} = 30\% \to P_{\text{final}} = 36.0\%$
- $P_{\text{base}} = 50\% \to P_{\text{final}} = 60.0\%$
- *Оценка*: Математически элегантно, сохраняет баланс для редкого лута ($5\% \to 6\%$), никогда не выходит за $100\%$.

#### Модель B: Percentage Points Addition — $P_{\text{final}} = P_{\text{base}} + 20\%$
- $P_{\text{base}} = 5\% \to P_{\text{final}} = 25.0\%$ (Рост в 5 раз! Разрушает редкий лут).

#### Модель C: Loot-Table Weight Normalization
- Использование весов в таблице лута: $\text{Weight}_{\text{rare}} = \text{BaseWeight} \times 1.20$.

---

### 3.2. Канонический выбор BLOCKER C
$$\mathbf{P_{\text{final}}} = \min\Big(1.0, \ \mathbf{P_{\text{base}}} \times 1.20\Big) \quad [\text{LOCKED}]$$

- **Причина выбора**: Модель A (Relative Multiplier) с ограничением $\min(1.0, P)$ обеспечивает ровно $20\%$ относительного прироста шанса нахождения редких патронов, не ломая редкие таблицы лута и не требуя сложной нормализации.

---

## 4. BLOCKER D — Companion Combat Contract (Контракт спутника)

### 4.1. Канонический свод параметров Companion Contract (`LOCKED`)

| Параметр | Формула / Правило |
| :--- | :--- |
| **CompanionSlots** | $\max\big(0, \lfloor(\text{CHA} - 2) / 3\rfloor\big)$ (CHA 1–4: 0, CHA 5–7: 1, CHA 8–10: 2). |
| **Max HP** | $20 + (\text{END}_{\text{companion}} \times 3)$ |
| **AC / Defense** | $10 + \lfloor\text{AGI}_{\text{companion}} / 2\rfloor + \text{ArmorAC}$ |
| **Accuracy** | $\text{D20} + (\text{PlayerAttackMod} - 2) \quad [\text{Штраф -2 за непрямой контроль}]$ |
| **Damage** | Стандартный урон экипированного оружия спутника (экипируется из инвентаря отряда). |
| **Crit** | Стандартный Natural 20 ($5\%$ шанс). На LCK игрока НЕ опирается. |
| **Range** | Зависит от оружия спутника (ближний / дальний). |
| **Initiative** | Ходит строго в фазе игрока (после завершения активного действия игрока). |
| **Target Selection** | Автоматически атакует ближайшего врага, атакующего игрока (или по маркеру цели). |
| **Support Fire** | 1 выстрел за ход отряда. Не требует AP игрока. |
| **Take Cover** | Добавляет $+2\text{ AC}$ игроку и спутнику до следующего хода отряда. |
| **First Aid** | Восстанавливает $1\text{d6} + \text{Medicine}_{\text{companion}}$ HP игроку. **Стоит 2 AP игрока!** |
| **Ammo Consumption**| Потребляет реальные патроны из общего инвентаря отряда. |
| **Downed State** | При HP $\le 0$ входит в состояние «Loss of Consciousness» (без сознания до конца боя). |
| **Death** | Пермасмерть наступает ТОЛЬКО при оверкилле ($-\text{MaxHP}$) или отсутствии первой помощи после боя. |
| **Revival** | Требует 1 стимулятор и проверку `Medicine vs DC 12` после боя. |
| **XP Distribution** | $100\%$ опыта за победу идет игроку (спутник НЕ делит и не умножает XP). |
| **Loot Capacity** | Добавляет $+30\text{ кг}$ к переносному весу отряда за каждого спутника. |

---

### 4.2. СравнительныйNormalized Test спутников (Scenarios A – E)

Используем базовый профиль игрока (Штурмовой карабин 1d8+2, 8 AP):

| Показатель | Scenario A: CHA 4 (0 comp) | Scenario B: CHA 5 (1 comp) | Scenario C: CHA 7 (1 comp) | Scenario D: CHA 8 (2 comp) | Scenario E: CHA 10 (2 comp) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Point Buy cost CHA** | 3 pts | 4 pts (+1) | 7 pts (+3) | 10 pts (+3) | 19 pts (+9) |
| **Спутники** | 0 | 1 | 1 | 2 | 2 |
| **Player Expected Damage**| 8.50 | 8.50 | 8.50 | 8.50 | 8.50 |
| **Companion Expected Damage**| 0.00 | **+3.25** | **+3.25** | **+6.50** | **+6.50** |
| **Total Squad Expected Damage**| **8.50** | **11.75** | **11.75** | **15.00** | **15.00** |
| **AP Cost игрока на атаку**| 6 AP | 6 AP | 6 AP | 6 AP | 6 AP |
| **Расход патронов / раунд**| 2 шт | 3 шт (+50%) | 3 шт (+50%) | 4 шт (+100%) | 4 шт (+100%) |
| **Расход еды/воды / день** | 1/1 | 2/2 (+100%) | 2/2 (+100%) | 3/3 (+200%) | 3/3 (+200%) |
| **Штраф к Скрытности** | 0 | -2 | -2 | -4 | -4 |

---

## 5. BLOCKER E — CHA Breakpoint Analysis (Анализ порогов Харизмы)

### 5.1. Анализ брейкпоинта CHA 4 $\to$ CHA 5 (+1 Point Buy point, 0 $\to$ 1 companion)
- **Прирост боевой мощи**: $+3.25$ урона за раунд ($+38\%$ к DPS отряда).
- **Плата за брейкпоинт**:
  1. Двойной расход еды и воды в день (1/1 $\to$ 2/2).
  2. Оружие и патроны спутника расходуются из общего запаса (патроны $+50\%$).
  3. Штраф $-2$ к броскам `Infiltration` всей группы.
- **Вердикт**: Вложение 1 очка в CHA 5 даёт сильный боевой прирост, но немедленно наказывает логистическим и стелс-бременем. Брейкпоинт сбалансирован.

### 5.2. Анализ брейкпоинта CHA 7 $\to$ CHA 8 (+3 Point Buy points, 1 $\to$ 2 companions)
- **Прирост боевой мощи**: Дополнительно $+3.25$ урона за раунд (суммарно $+6.50$ урона от спутников).
- **Плата за брейкпоинт**:
  1. Тройной расход еды и воды в день (1/1 $\to$ 3/3).
  2. Тройной расход медикаментов и патронов.
  3. Штраф $-4$ к `Infiltration` (стелс отряда практически невозможен).
  4. Вложение 10 очков Point Buy в CHA оставляет игрока с дефицитом физических характеристик.
- **Вердикт**: Брейкпоинт CHA 8 математически выверен.

---

## 6. BLOCKER F — LCK System-Wide Balance Test (Системный тест Удачи)

Протестируем системную ценность LCK при 1, 2, 3 и 4 атаках в раунд:

| LCK Level | 1 атака (Hit% / Crit%) | 2 атаки (Crit Шанс $\ge 1$) | 3 атаки (Crit Шанс $\ge 1$) | 4 атаки (Crit Шанс $\ge 1$) | Misfire Cost (AP) | Scavenger Rare Ammo Mod |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **LCK 5** | 50% / 10% | 19.0% | 27.1% | 34.4% | 2 AP | $\times 1.20$ |
| **LCK 7** | 50% / 10% | 19.0% | 27.1% | 34.4% | 2 AP | $\times 1.20$ |
| **LCK 8** | 50% / 15% | 27.8% | 38.6% | 47.8% | **1 AP** | $\times 1.20$ |
| **LCK 9** | 50% / 15% | 27.8% | 38.6% | 47.8% | **1 AP** | $\times 1.20$ |
| **LCK 10** | 50% / 20% | 36.0% | 48.8% | 59.0% | **1 AP** | $\times 1.20$ |

#### Взаимодействие LCK + Burst:
- При стрельбе очередью (Burst) совершается **1 бросок D20**.
- Шанс крита за действие очереди равен ровно шансу LCK ($20\%$ при LCK 10).
- Отсутствует мультипликативный мульти-крит эксплойт.

---

## 7. Финальная матрица статусов решений (Final Status Matrix)

| Подсистема / Блокер | Статус | Финальное зафиксированное решение |
| :--- | :---: | :--- |
| **STR Damage (Blocker A)** | **`LOCKED`** | $\text{MeleeDamage} = \max(1, \text{RollWeaponDice} + (\text{STR} - 5))$. |
| **Burst Damage (Blocker B)** | **`LOCKED`** | $\text{BurstDamage} = \max(1, (\text{RollWeaponDice} \times 2) + \text{DamageMod})$. Единый d20 roll. |
| **LCK Rare Ammo (Blocker C)** | **`LOCKED`** | $P_{\text{final}} = \min(1.0, P_{\text{base}} \times 1.20)$ (Relative Multiplier). |
| **Companion Contract (Blocker D)**| **`LOCKED`** | Минимальный контракт утвержден. Поддержка без свободных AP, урон отряда $+3.25/\text{comp}$. |
| **CHA Breakpoints (Blocker E)** | **`LOCKED`** | Пороги CHA 5 и CHA 8 сбалансированы тройной логистикой и стелс-штрафом. |
| **LCK System Balance (Blocker F)**| **`LOCKED`** | LCK не является мультипликативным эксплойтом; Burst единый roll. |

---

## 8. Итоговое выводное резюме

```text
CHARACTER SYSTEM v0.4.5.3

STR DAMAGE: LOCKED
BURST DAMAGE: LOCKED
LCK RARE AMMO: LOCKED
COMPANION CONTRACT: LOCKED
CHA BREAKPOINTS: LOCKED
LCK SYSTEM-WIDE BALANCE: LOCKED

MIGRATION PLAN: ALLOWED

REMAINING BLOCKERS: NONE
```

**Все математические и системные блокеры официально закрыты.** Разработка пошагового документа `CHARACTER_SYSTEM_MIGRATION_PLAN.md` полностью разрешена.
