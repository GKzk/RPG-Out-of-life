# Weapon & Armor Math Lock — Baseline

**Project:** RPG-Out-of-life  
**Branch:** main  
**Status:** BASELINE LOCK / migration support  
**Date:** 25 September 2026

## Purpose

The Character System is already mathematically locked, but the repository did not yet contain a complete designed weapon/armor catalog. This document therefore records only **safe baseline mappings** from the existing item data.

No new balance values are invented here.

## 1. Canonical weapon representation

The Character System requires:

- `damageDiceCount`
- `damageDiceSides`
- `damageFlat`
- existing AP/range/skill/ammo metadata

The previous item database used a uniform inclusive damage range:

`damageMin..damageMax`

For the current six weapons, the exact same distribution can be represented without changing balance as:

`1dN + (damageMin - 1)`

where:

`N = damageMax - damageMin + 1`

This is an exact distribution-preserving transformation, not a rebalance.

| Item | Legacy range | Canonical dice | Flat |
|---|---:|---:|---:|
| Самодельный карабин | 6–12 | 1d7 | +5 |
| Охотничий обрез 12 калибра | 14–26 | 1d13 | +13 |
| Лазерный пистолет Wattz 1000 | 10–18 | 1d9 | +9 |
| Тяжелая кувалда | 12–24 | 1d13 | +11 |
| Боевой нож Ka-Bar | 5–10 | 1d6 | +4 |
| Шипованный кастет | 4–8 | 1d5 | +3 |

### Important

The unusual die sizes (d5, d7, d9, d13) are intentional in this baseline: they preserve the repository's existing damage distribution exactly.

They are **not** a claim that these are final designer-selected tabletop-style weapon dice.

If the game later requires conventional dice (d4/d6/d8/d10/d12/d20), that is a separate balance/design decision.

## 2. Canonical armor representation

The Character System requires DT followed by DR.

The existing armor database had only `defense`, used by the legacy combat resolver as direct damage subtraction.

Safe mapping:

`damageThreshold = defense`

and, because the existing items contained no damage-resistance percentage:

`damageResistancePercent = 0`

This preserves the current armor reduction semantics while exposing the canonical DT/DR model.

| Item | Legacy defense | DT | DR |
|---|---:|---:|---:|
| Кожанка рейда | 3 | 3 | 0% |
| Кованая металлическая броня | 8 | 8 | 0% |
| Комбинезон Убежища 101 | 2 | 2 | 0% |

No DR values have been invented.

## 3. What remains legacy

The following fields are intentionally retained for compatibility:

- weapon `damageMin`
- weapon `damageMax`
- weapon `critMultiplier`
- weapon `apCost`
- armor `defense`

They must not be treated as the final Character System combat formulas once the canonical resolver is migrated.

The canonical weapon damage source becomes:

`damageDiceCount + damageDiceSides + damageFlat`

The canonical armor mitigation source becomes:

`damageThreshold + damageResistancePercent`

## 4. Current blockers

The following still require combat-system migration rather than item-data invention:

1. Replace legacy d100 player hit resolution with canonical D20 + attack modifiers.
2. Replace legacy critical d100 roll with LCK threat/confirmation.
3. Replace legacy melee `floor(STR * 1.5)` with `STR - 5`.
4. Replace legacy direct armor subtraction with DT → DR.
5. Add/define Burst-capable weapon selection and UI only when automatic weapons are actually added.
6. Decide whether enemy armor should expose explicit DT/DR fields or continue through a compatibility adapter.
7. Decide final weapon taxonomy and additional weapons later; this is game-design work, not migration work.

## 5. Safety rule

Do not convert the existing values into conventional dice, add DR, change AP costs, change ranges, or add new weapons unless the change is explicitly treated as a balance/design decision.

This file is a technical bridge between the existing item database and the locked Character System.

## 6. Current baseline status

- Existing 6 weapons: canonical dice fields added.
- Existing 3 armor items: canonical DT/DR fields added.
- No item balance values changed.
- No new weapon/armor items added.
- Full weapon/armor catalog remains a later content/design task.
