# Character System Runtime Audit — 25 September 2026

**Project:** RPG-Out-of-life  
**Branch:** main  
**Design baseline:** CHARACTER_SYSTEM_v0.4.5.7_FINAL_DESIGN_LOCK  
**Status:** IN PROGRESS — runtime migration audit with direct fixes

## Scope

Audit focused on the currently migrated character/combat runtime and the data structures that feed it. No new balance values were invented.

## Fixed

### 1. Max AP
The runtime previously applied additional hunger/thirst/fatigue AP reductions on top of the canonical formula.

Canonical baseline is now:

`Max AP = 7 + floor(AGI / 2)`

Existing feat AP modifiers remain as explicit feat modifiers. Survival state no longer silently changes the formula.

### 2. Armor AC vs DT
Legacy armor `defense` was being used both as AC/evasion and as damage reduction.

The runtime now separates them:

- Armor AC = `10 + floor(AGI / 2) + ArmorAC`
- `defense` / `damageThreshold` = DT
- DR = explicit `damageResistancePercent`

The current baseline armor catalog does not define an ArmorAC bonus, so the compatibility value is 0 rather than inventing new balance.

### 3. Enemy mitigation
Enemies now expose explicit:

- `damageThreshold`
- `damageResistancePercent`

The old `armor` field remains as a compatibility fallback.

### 4. Enemy attack bonus
The enemy runtime previously derived attack accuracy from damage range at runtime:

`floor((damageMax + damageMin) / 4)`

That hidden coupling is removed. Current baseline enemies store an explicit `attackBonus` equal to the previous adapter result, preserving behavior while making the value auditable and editable.

### 5. DT → DR damage resolution
Player and enemy combat resolution now uses the canonical DT → DR helper. Post-armor damage may reach 0; the resolver no longer forces a minimum 1 damage after armor mitigation.

### 6. Regression tests
Added tests for:

- canonical AP despite severe survival values;
- separation of legacy armor defense/DT from ArmorAC.

## Additional `src/` audit — 25 September 2026

### Combat UI preview
The Combat Arena previously used the legacy percentage-based `calculateHitChance()` and displayed head-shot accuracy/AP modifiers that were no longer used by the D20 runtime. The preview now mirrors the actual D20 resolver: natural 1 misses, natural 20 hits, and normal hits use the same PER modifier + current skill bonus + target AC structure. Aimed body-part selection is currently descriptive only.

### Character Sheet critical display
The sheet previously displayed the legacy `LCK * 1.5` percentage as a generic critical chance. That is not the canonical LCK model. The sheet now displays the canonical threat bracket (20 / 19–20 / 18–20 / 17–20).

### Legacy feat accuracy/damage percentages
Feat definitions still contain legacy percentage fields such as ranged accuracy and melee/ranged damage bonuses. They are not silently translated into D20 modifiers because the locked Character System does not define those conversions. They remain design data until the feat system is formally migrated.

### Survival / effective SPECIAL
Survival effects still modify effective SPECIAL. This was not changed because those effects are a separate survival-system layer and removing them would alter existing gameplay balance. AP itself no longer receives an additional hidden survival penalty.

### Remaining blockers / discrepancies

### A. Player skill-to-attack conversion is not formally locked
Current player attack still feeds the existing skill value directly as a D20 attack bonus.

This is technically functional but **not yet mathematically justified by the locked Character System specification**. A new conversion formula must not be invented during migration.

### B. Enemy attack balance is still a baseline adapter
The explicit enemy `attackBonus` values preserve the previous runtime adapter. They are not a newly balance-verified enemy combat system.

### C. Full Burst runtime
Burst mathematics exists in the canonical utility layer and tests, but the current baseline weapon catalog contains no explicitly designed automatic/Burst weapon. Burst UI/runtime integration should therefore wait for the weapon design pass.

### D. Companion integration
The companion state/logistics utilities exist, but the main game state does not yet contain the complete active-companion runtime model. No animal companion data was invented.

### E. Legacy compatibility fields
The following remain intentionally for compatibility and should not be used as canonical combat sources:

- weapon `damageMin` / `damageMax`
- weapon `critMultiplier`
- armor `defense`
- enemy `armor`

## Audit status

**Character math:** substantially migrated  
**Armor mitigation:** corrected  
**Enemy combat adapters:** made explicit, not final balance  
**Burst math:** implemented/tested at utility level  
**Burst gameplay integration:** pending weapon design  
**Companion runtime integration:** pending  
**Full migration:** NOT COMPLETE

## Verification limitation
GitHub source inspection was completed. A local `npm test` / TypeScript build could not be executed because this environment has no network/DNS access to clone/install the repository. No test run is claimed.
