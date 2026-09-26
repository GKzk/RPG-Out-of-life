# 22-SKILL CODE & MATH AUDIT

Дата: 26.09.2026

## 1. Scope

Проверены исходники текущей ветки `main` на остатки старых skill ID и математическую согласованность 22-навыковой модели.

Канонический набор: 22 навыка из `src/data/skills.ts`.

## 2. Legacy audit

Проверенные старые идентификаторы:

- `smallGuns`
- `bigGuns`
- `energyWeapons`
- `meleeWeapons`
- `herbalism`
- `repair`
- `engineering`
- `lockpick`
- `hacking`
- `hunting`
- `scouting`
- `traps`
- `speech`
- `music`
- `intimidation`
- `streetwise`
- `firstAid`
- `perception`

### Найденные реальные остатки

1. `src/context/GameContext.tsx`
   - старый Record навыков в `createCharacter`;
   - обращение к удалённому `lockpick`.
2. `tests/characterSystem.test.ts`
   - переменная `ids` не была определена в 22-skill тесте.
3. `src/context/GameContext.tsx`
   - динамический `require` архетипов заменён на типизированный импорт, чтобы убрать потенциальный ESM/TypeScript blocker.

Другие проверенные исходники не содержат legacy skill ID. Совпадение `hunting` в `tests/characterSystem.test.ts` относится к ID предмета `hunting_shotgun`, а не к навыку.

## 3. 22-skill integrity

Проверяется:

- ровно 22 определения;
- уникальность ID;
- соответствие каноническому порядку;
- наличие primary attribute;
- корректная работа всех 22 ID через `calculateSkillValue`.

Для нейтрального SPECIAL 5/5/5/5/5/5/5 и нулевых вложений текущая UI-модель даёт 25 для каждого навыка.

## 4. Canonical skill-check math

Зафиксирована реализация формулы из `GAME_DESIGN/SKILL_CHECK_BALANCE.md`:

`Base Score = Attribute × 4 + Skill × 0.6`

`Roll Modifier = d20 − 10`

`Final Score = Base Score + External Modifier + Roll Modifier`

`Margin = Final Score − Difficulty`

Результаты:

- Margin >= 0: успех;
- Margin -1..-9: частичный успех;
- Margin -10..-19: провал;
- Margin <= -20: критический провал;
- natural 20 + успешная проверка: критический успех.

## 5. Numeric control cases

Проверены:

- Attribute 5 / Skill 0 -> Base 20;
- Attribute 5 / Skill 50 -> Base 50;
- Attribute 10 / Skill 100 -> Base 100;
- 5/50 против Difficulty 50 на d20=10 -> Margin 0, Success;
- Margin -9 -> Partial;
- Margin -10 -> Failure;
- 5/0 против Difficulty 50 на d20=1 -> Critical Failure;
- 10/100 против Difficulty 100 на d20=20 -> Critical Success;
- 10/100 против Difficulty 100 на d20=1 -> Partial, то есть даже максимум компетенции не даёт автоматического успеха на экстремальной сложности.

## 6. Automated test limitation

GitHub connector позволяет читать и изменять репозиторий, но в текущей сессии нет доступного GitHub Actions workflow для этого репозитория и нет локального checkout с установленными зависимостями.

Поэтому данный аудит подтверждает статический кодовый анализ и детерминированные математические контрольные случаи, но не заявляет о выполненном `npm run lint` / `npm test` / `npm run build` на реальном Node environment.

Следующий технический шаг после этого commit: запустить `npm install && npm run lint && npm test && npm run build` в локальном/Gemini environment и исправить фактические compiler/runtime ошибки, если они появятся.
