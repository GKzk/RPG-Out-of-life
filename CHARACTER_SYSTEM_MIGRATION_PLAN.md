# Character System Migration Plan

**Project:** RPG-Out-of-life  
**Branch:** main  
**Design baseline:** CHARACTER_SYSTEM_v0.4.5.7_FINAL_DESIGN_LOCK  
**Status:** Planning only — no `src/` implementation in this document.

## 1. Migration rule

The implementation must reproduce the locked design without silently changing numerical values or introducing new mechanics.

Before modifying `src/`, inspect the current combat/stat/character architecture and map each canonical rule to the existing implementation.

## 2. Canonical systems to migrate

### Core mathematics
- AttributeMod = SPECIAL - 5.
- STR melee damage = max(1, RollWeaponDice + STR - 5).
- Max AP = 7 + floor(AGI / 2).
- Point Buy = locked v0.4 rules.
- LCK threat brackets and confirmation rules.
- Natural 20 = auto-hit + crit.
- Natural 1 = auto-miss + Misfire.

### Burst Fire
- 3 ammunition.
- AP = base shot AP + 2.
- Accuracy penalty = -4.
- Exactly one D20 attack roll.
- One critical check per Burst.
- Normal damage = max(1, 2 * RollWeaponDice + WeaponFlat + AttributeMod).
- Critical damage = 2 * MaxWeaponDice + 2 * RollWeaponDice + WeaponFlat + AttributeMod.
- DT once; DR after DT.
- Nat 20 auto-hit + crit.
- Nat 1 auto-miss + Misfire.

### Companions
- Companion slots = max(0, floor((CHA - 2) / 3)).
- 0 companions at CHA 1-4; 1 at CHA 5-7; 2 at CHA 8-10.
- Each active companion gets one tactical action per squad round.
- No separate AP pool and no consumption of player AP for tactical actions.
- Support Fire consumes 1 common-inventory ammunition.
- Each active companion adds +1 Food/day and +1 Water/day.
- Each active companion adds +30 kg Carry Weight.
- No permanent Stealth penalty from companion count.
- State machine and medical transitions follow v0.4.5.7.

## 3. Animal companion — mandatory design preservation

The game has a **story-driven animal companion choice at the beginning of the game**. This is an existing narrative/design requirement and must not be lost during migration.

For the migration:
- preserve the animal companion as a distinct early-game selection/content entity;
- do not automatically equate the animal choice with the CHA-based human-companion slot system;
- do not invent animal statistics, abilities, species, images, or balance values during technical migration;
- expose a clear data/model boundary so the later initial-game design can define the animal's narrative role, available choices, visuals, stats, and progression without restructuring the core character system.

The initial-game design phase will separately specify:
1. opening sequence;
2. animal-companion choice and story justification;
3. available animal options;
4. animal portraits/sprites/illustrations;
5. early combat/exploration role;
6. relationship/progression rules;
7. how the animal interacts with the later CHA companion system.

## 4. Required implementation tests

Before considering migration complete, add tests for:
- AttributeMod mapping;
- STR damage and minimum damage;
- Max AP for AGI 1..10;
- Point Buy boundary values;
- LCK threat brackets;
- Natural 20 and Natural 1;
- Burst AP;
- Burst -4 Accuracy;
- Burst 3-ammo consumption;
- one-roll/one-crit Burst behavior;
- Burst damage and critical damage;
- DT/DR ordering;
- companion slot thresholds;
- Food/Water logistics;
- Support Fire ammunition;
- Carry Weight;
- companion state transitions;
- regression of existing combat behavior.

## 5. Prohibited during migration

Do not:
- change balance values;
- add unapproved combat mechanics;
- add permanent Stealth penalties;
- restore obsolete AP formulas;
- implement multiple independent rolls for Burst;
- implement three separate DT/DR resolutions for Burst;
- silently merge the animal companion into ordinary CHA companion slots;
- create final animal balance/content before the initial-game design phase.

## 6. Implementation order

1. Inspect current `src/` architecture.
2. Produce a code-to-canon mapping.
3. Identify conflicts between current code and locked design.
4. Implement core mathematics.
5. Implement Burst.
6. Implement companion logistics/action economy/state machine.
7. Add automated tests.
8. Run regression tests.
9. Report every remaining discrepancy.
10. Only after all discrepancies are resolved, consider Character System migration complete.

**Important:** This document authorizes planning, not an automatic source-code rewrite. Any implementation should follow the mapping and test gates above.
