# XP & LEVEL PROGRESSION — BALANCE LOCK

## Status

Canonical progression model for the current prototype.

The structure is intentionally Fallout-like, while the level-up reward structure also uses a D&D-like explicit level threshold model.

## 1. Level cap

- Levels: 1–20.
- Level 1 starts at 0 XP.
- XP above the level-20 threshold is retained.
- Level cannot exceed 20.

## 2. XP curve

The project uses a scaled triangular Fallout-style curve:

`XP(level) = 100 × level × (level - 1) / 2`

| Level | Total XP |
|---:|---:|
| 1 | 0 |
| 2 | 100 |
| 3 | 300 |
| 4 | 600 |
| 5 | 1,000 |
| 6 | 1,500 |
| 7 | 2,100 |
| 8 | 2,800 |
| 9 | 3,600 |
| 10 | 4,500 |
| 11 | 5,500 |
| 12 | 6,600 |
| 13 | 7,800 |
| 14 | 9,100 |
| 15 | 10,500 |
| 16 | 12,000 |
| 17 | 13,600 |
| 18 | 15,300 |
| 19 | 17,100 |
| 20 | 19,000 |

The 100-XP scaling is deliberate. Existing enemy rewards are 45–210 XP; using the original Fallout 1,000-XP unit would make combat progression excessively slow for this prototype.

## 3. Current XP sources

Implemented:
- defeating an enemy awards that enemy's `xpValue`.

Reserved API:
- `addExperience(amount, reasonRu)` is exposed through GameContext so future quests, exploration milestones and story events can award XP through the same canonical path.

Repeated ordinary checks should NOT award unlimited XP by default. One-time narrative/exploration rewards should be tracked by their event/quest state before they are added.

## 4. Level-up rewards

Every level:
- character level increases;
- Skill Points become available through the existing progression formula:
  - starting SP = `8 + INT`;
  - SP per level = `4 + floor(INT / 2)`;
  - no-background bonus = +2 SP per level;
- maximum HP increases by:
  - `2 + floor(END / 2)` per level;
- the HP increase is added to current HP on level-up, but level-up does not fully heal the character.

## 5. Feat progression

Progression Feat choices occur at:

**3, 6, 9, 12, 15, 18**

Level-up creates a pending choice instead of silently selecting a Feat.

The player chooses from Feats not already owned.

The starting Feat from character creation is not counted as a progression Feat.

## 6. Balance targets

The current enemy database awards:

- 45 XP — weak encounter;
- 65 XP — standard human threat;
- 110 XP — stronger creature;
- 180 XP — major melee threat;
- 210 XP — high-value mechanical threat.

At an illustrative average of 125 XP per combat, reaching level 20 requires roughly 152 enemy-equivalent XP rewards if combat were the only source.

This is a pacing reference, not a promise of campaign length. Story and quest XP should reduce the required combat count.

## 7. Important balance constraint

Do not change the XP curve or SP economy independently.

Any future change to:
- enemy XP;
- quest XP;
- exploration XP;
- level cap;
- skill-point income;
- Feat frequency

must be evaluated together because XP controls the rate at which the existing skill economy receives new SP.

## 8. Verification requirements

Before declaring progression stable:

1. `npm run lint`
2. `npm test`
3. `npm run build`
4. simulate INT 1 / 5 / 10 through level 20;
5. compare specialist vs generalist skill investment;
6. audit combat encounter count against actual campaign rewards;
7. audit perk availability and duplicate prevention.

The current environment has not executed the post-change npm suite; repository/network access for dependency installation was unavailable during the implementation pass.
