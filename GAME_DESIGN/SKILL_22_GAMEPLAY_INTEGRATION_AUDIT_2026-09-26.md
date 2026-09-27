# АУДИТ ИНТЕГРАЦИИ 22 НАВЫКОВ В ИГРОВОЙ ПРОЦЕСС (GAMEPLAY INTEGRATION PASS 1)

> **Дата аудита:** 26 сентября 2026  
> **Репозиторий:** `GKzk/RPG-Out-of-life`  
> **Ветка:** `main` (commit HEAD: `534bfa1f9007713249a1d6e9ac2c6aae1b578fd8` + archetype fix + gameplay pass 1)  
> **Статус:** Реализована первая очередь геймплейной интеграции (8 новых навыков + 4 ранее встроенных = 12 Integrated, 0 Partial, 10 Missing).

---

## 1. Сравнительная таблица интеграции (До и После Pass 1)

| Skill | До | После | Реальный gameplay trigger | Resolver | Последствие | Test |
|---|---|---|---|---|---|---|
| `athletics` | Missing | **Integrated** | `clearSectorObstacle()` в `GameContext` и `WastelandExplorer` | `resolveSkillCheck(STR, athSkill, 50, d20)` | Crit: 1 ч + найден схрон; Success: 1 ч; Partial: 2 ч; Fail: 3 ч; Crit Fail: 3 ч + 10 урона | `tests/characterSystem.test.ts` |
| `stealth` | Missing | **Integrated** | `scavengeRuins()` в `GameContext` (предотвращение засады) | `resolveSkillCheck(AGI, stealthSkill, 50, d20, petBonus)` | Crit/Success: засада предотвращена; Partial: оборона перед боем; Fail/Crit Fail: бой из засады | `tests/characterSystem.test.ts` |
| `sleightOfHand` | Missing | **Missing** | Отложен до механики карманных краж и мелких механических замков | — | — | 22-skill baseline |
| `unarmed` | Integrated | **Integrated** | Рукопашный бой кулаками и кастетом (`brass_knuckles`) | `d20 + PER mod + skillVal >= targetAC` | Рукопашный урон (крит 2.5x) или промах | `tests/characterSystem.test.ts` |
| `melee` | Integrated | **Integrated** | Удары ножом (`combat_knife`) и кувалдой (`sledgehammer`) | `d20 + PER mod + skillVal >= targetAC`, `+STR mod` | Физический урон с DT/DR или промах | `tests/characterSystem.test.ts` |
| `firearms` | Integrated | **Integrated** | Стрельба из карабина (`pipe_rifle`), обреза, лазера | `d20 + PER mod + skillVal >= targetAC` | Дистанционный урон или промах | `tests/characterSystem.test.ts` |
| `explosives` | Missing | **Missing** | Отложен до введения гранат, мин и сапёрных задач | — | — | 22-skill baseline |
| `survival` | Partial | **Integrated** | `passTime()` (голод/жажда) и `restAndSleep()` (лагерь) | `calculateSurvivalConsumptionRate()`, `campBonus` | До 30% снижение жажды/голода; +HP при привале; исключен из лутания | `tests/characterSystem.test.ts` |
| `search` | Missing | **Integrated** | `scavengeRuins()` в `GameContext` (поиск ресурсов) | `resolveSkillCheck(PER, searchSkill, 45, d20, petBonus)` | Crit: двойной ценный схрон; Success: предмет; Partial: вода; Fail: пусто; Crit Fail: шум | `tests/characterSystem.test.ts` |
| `navigation` | Missing | **Integrated** | `travelBetweenSectors()` в `WastelandExplorer` | `resolveSkillCheck(PER, navSkill, 45, d20)` | Crit: 1 ч; Success: 2 ч; Partial: 3 ч; Fail: 4 ч; Crit Fail: 5 ч | `tests/characterSystem.test.ts` |
| `insight` | Missing | **Missing** | Отложен до диалоговой системы | — | — | 22-skill baseline |
| `medicine` | Integrated | **Integrated** | `useItem()` (аптечки/еда) и стабилизация компаньонов | `totalHeal = hpHeal * (1 + medSkill / 100)` | До +100% к силе любого стимпака/лекарства | `tests/characterSystem.test.ts` |
| `mechanics` | Missing | **Missing** | Отложен до ремонта механизмов, помп и оружия | — | — | 22-skill baseline |
| `electronics` | Missing | **Missing** | Отложен до терминалов и электронных гермодверей | — | — | 22-skill baseline |
| `science` | Missing | **Missing** | Отложен до химического синтеза и анализа веществ | — | — | 22-skill baseline |
| `crafting` | Missing | **Missing** | Отложен до верстака и создания боеприпасов | — | — | 22-skill baseline |
| `persuasion` | Missing | **Missing** | Отложен до диалоговой дипломатии | — | — | 22-skill baseline |
| `barter` | Missing | **Integrated** | `calculateBarterPrice()` и расчет сдачи в `InventoryView` | `calculateBarterPrice(value, barterSkill, 'sell'/'buy')` | Покупка: наценка 150% → 110%; Сдача: 35% → 70%; мин >= 1 кр. | `tests/characterSystem.test.ts` |
| `deception` | Missing | **Missing** | Отложен до диалогового блефа и маскировки | — | — | 22-skill baseline |
| `leadership` | Missing | **Integrated** | `resolveCompanionDamage()`, огневая поддержка в `companionSystem` | `calculateLeadershipDefenseBonus()`, support damage | До +4 DT спутникам; до +30% к урону поддержки | `tests/characterSystem.test.ts` |
| `animalHandling` | Missing | **Integrated** | `getPetHandlingBonus()` (поиск, скрытность, урон пса в бою) | `getPetHandlingBonus(petId, animalSkill)` | Пёс: +2..10 Поиск, +3..11 Скрытность, +1..5 урон; Кот: скрытность/еда; Ворон: тайники | `tests/characterSystem.test.ts` |
| `performance` | Missing | **Missing** | Отложен до трактиров и сценических событий | — | — | 22-skill baseline |

### Итоговый статус:
- **Integrated:** **12** / 22 (ранее 4)
- **Partial:** **0** / 22 (ранее 1)
- **Missing:** **10** / 22 (ранее 17)

---

## 2. Реализованные механики первой очереди (Pass 1)

### 2.1. SEARCH (Поиск)
- **Файл:** `src/context/GameContext.tsx` (`scavengeRuins`).
- **Замена:** Навык `survival` полностью удален из процедуры лутания развалин.
- **Формула:** Канонический `resolveSkillCheck(effectiveSpecial.PER, searchSkill, 45, d20, petBonus.searchBonus)`.
- **Последствия:**
  - `critical_success`: найден армейский тайник (2 ценных предмета: стимпак + консервы);
  - `success`: найден случайный предмет из пула сектора;
  - `partial`: найден минимум припасов (грязная вода);
  - `failure`: руины разграблены;
  - `critical_failure`: обрушение хлама при поиске, ценностей нет, поднят громкий шум.

### 2.2. STEALTH (Скрытность)
- **Файл:** `src/context/GameContext.tsx` (`scavengeRuins`).
- **Замена:** Фиксированная вероятность `Math.random() < 0.35` заменена проверкой Скрытности.
- **Формула:** `resolveSkillCheck(effectiveSpecial.AGI, stealthSkill, 50, d20, petBonus.stealthBonus)`.
- **Последствия:**
  - `critical_success` / `success`: игрок бесшумно огибает логово врагов, засада полностью предотвращена;
  - `partial`: игрок вовремя замечает приближение врага и начинает бой готовым к обороне;
  - `failure` / `critical_failure`: неосторожный шаг выдает героя, враг атакует из засады (`startCombatEncounter()`).

### 2.3. SURVIVAL (Выживание)
- **Файлы:** `src/utils/characterSystem.ts` (`calculateSurvivalConsumptionRate`), `src/context/GameContext.tsx` (`passTime`, `restAndSleep`).
- **Семантика:** Выживание переведено на жизнеобеспечение, замедление расхода ресурсов и эффективность стоянки.
- **Формула:** 
  $$\text{rate} = \text{baseRate} \times \left(1.0 - \min(100, \text{Skill}) \times 0.003\right) \times \text{featMultiplier}$$
  - Навык 0: множитель 1.0x (базовое накопление голода/жажды);
  - Навык 50: множитель 0.85x (15% экономия);
  - Навык 100: множитель 0.70x (30% экономия).
  - На стоянке (`restAndSleep`): лагерный бонус к восстановлению $\text{campBonus} = \lfloor\text{Skill} / 15\rfloor$ HP.

### 2.4. NAVIGATION (Ориентирование)
- **Файлы:** `src/context/GameContext.tsx` (`travelBetweenSectors`), `src/components/WastelandExplorer.tsx`.
- **Формула:** `resolveSkillCheck(effectiveSpecial.PER, navSkill, 45, d20)`.
- **Последствия:**
  - `critical_success`: идеальный довоенный тоннель $\rightarrow$ **1 час** пути;
  - `success`: короткая безопасная тропа $\rightarrow$ **2 часа** пути;
  - `partial`: стандартный маршрут по разрушенным улицам $\rightarrow$ **3 часа** пути;
  - `failure`: заблокированная тропа и блуждание $\rightarrow$ **4 часа** пути;
  - `critical_failure`: песчаная буря стёрла ориентиры $\rightarrow$ **5 часов** пути.

### 2.5. BARTER (Торговля)
- **Файлы:** `src/utils/characterSystem.ts` (`calculateBarterPrice`), `src/components/InventoryView.tsx`.
- **Формула:**
  - Покупка: $\text{Markup} = 150\% - \text{round}((\text{Skill} / 100) \times 40\%)$ (от 150% до 110%);
  - Продажа: $\text{Markdown} = 35\% + \text{round}((\text{Skill} / 100) \times 35\%)$ (от 35% до 70%);
  - Безопасная граница: $\min(\text{Price}) \ge 1$ крышка, отсутствие отрицательных цен.
- **Интеграция в UI:** Карточка предмета в инвентаре отображает базовую ценность и гарантированную цену сдачи с учётом Бартера.

### 2.6. LEADERSHIP (Лидерство)
- **Файл:** `src/utils/companionSystem.ts` (`calculateLeadershipDefenseBonus`, `calculateCompanionSupportEffectiveness`, `resolveCompanionDamage`).
- **Формула:**
  - Защита спутников: $\text{DefenseBonus} = \min(4, \lfloor\text{Skill} / 25\rfloor)$ к снижению получаемого урона;
  - Огневая поддержка: до $+30\%$ к базовому урону спутника ($\text{damage} \times (1 + \text{Skill} \times 0.003)$).

### 2.7. ANIMAL HANDLING (Обращение с животными)
- **Файлы:** `src/utils/companionSystem.ts` (`getPetHandlingBonus`), `src/context/GameContext.tsx` (`scavengeRuins`, `performPlayerAttack`).
- **Формула:**
  - Если `petId` равен `null` или `'none'`: строгий 0 по всем бонусам;
  - Пёс Байкал (`hound`): $+2..+10$ к проверкам Поиска, $+3..+11$ к предупреждению засад (Скрытность), $+1..+5$ прямого боевого урона в бою (`performPlayerAttack`);
  - Кот Барсик (`cat`): до $+16$ к Скрытности и до $25\%$ к защите пайков от порчи;
  - Ворон Каркун (`crow`): до $+17$ к обнаружению тайников с воздуха.

### 2.8. ATHLETICS (Атлетика)
- **Файлы:** `src/context/GameContext.tsx` (`clearSectorObstacle`), `src/components/WastelandExplorer.tsx`.
- **Формула:** `resolveSkillCheck(effectiveSpecial.STR, athSkill, 50, d20)`.
- **Последствия:**
  - `critical_success`: завал раскидан за 1 час + спасены довоенные материалы;
  - `success`: завал расчищен за 1 час;
  - `partial`: завал поддался с большим трудом (2 часа);
  - `failure`: завал не поддался, обход 3 часа;
  - `critical_failure`: обрушение арматуры (3 часа, ушиб на 10 HP).

---

## 3. Семантические границы нереализованных навыков (Missing 10)

Следующие 10 навыков зафиксированы в дизайне и оставлены для целевых модулей, чтобы не создавать искусственный или перегруженный код:

1. `sleightOfHand`: Вскрытие механических замков шпильками и карманные кражи (модуль замков/сундуков).
2. `explosives`: Метание гранат и сапёрное дело (модуль гранат и минных полей).
3. `insight`: Распознавание скрытых намерений NPC (диалоговое древо).
4. `mechanics`: Обслуживание оружия, починка генераторов поселений (модуль износа и ремонта).
5. `electronics`: Взлом охранных консолей и терминалов довоенных бункеров (модуль терминалов).
6. `science`: Химический синтез лекарств и исследование мутагенов (лабораторный модуль).
7. `crafting`: Сборка боеприпасов и улучшений из хлама (модуль верстака).
8. `persuasion`: Дипломатические аргументы и мирные резолюции (диалоговое древо).
9. `deception`: Легенды прикрытия и блеф (диалоговое древо).
10. `performance`: Музыкальные выступления в трактирах за крышки и слухи (модуль поселений).

---

## 4. Результаты верификации

- **Unit & Integration Tests (`npm test`):** **PASS**
  - Математика v0.4.5.7: PASS
  - Канонические 22 навыка: PASS
  - 8 архетипов: PASS
  - 8 новых интеграций (Search, Stealth, Survival, Navigation, Barter, Leadership, Animal Handling, Athletics): **PASS**
- **TypeScript Diagnostics (`npm run lint` / `tsc --noEmit`):** **PASS** (0 ошибок).
- **Vite Production Compiler (`compile_applet`):** **PASS** (успешная компиляция).
