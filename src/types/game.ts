export type SpecialAttribute = 'STR' | 'PER' | 'END' | 'CHA' | 'INT' | 'AGI' | 'LCK';

export interface SpecialStats {
  STR: number;
  PER: number;
  END: number;
  CHA: number;
  INT: number;
  AGI: number;
  LCK: number;
}

export type SkillName =
  | 'athletics' | 'stealth' | 'sleightOfHand' | 'unarmed' | 'melee'
  | 'firearms' | 'explosives' | 'survival' | 'search' | 'navigation' | 'insight'
  | 'medicine' | 'mechanics' | 'electronics' | 'science' | 'crafting'
  | 'persuasion' | 'barter' | 'deception' | 'leadership'
  | 'animalHandling' | 'performance';

export interface SkillDefinition {
  id: SkillName;
  nameRu: string;
  nameEn: string;
  primaryAttr: SpecialAttribute;
  secondaryAttr?: SpecialAttribute;
  description: string;
}

export interface FeatDefinition {
  id: string;
  nameRu: string;
  nameEn: string;
  description: string;
  prosRu: string[];
  consRu: string[];
  statModifiers?: Partial<SpecialStats>;
  apBonus?: number;
  critBonus?: number;
  evasionBonus?: number;
  carryWeightBonus?: number;
  radResistBonus?: number;
  meleeDmgBonusPct?: number;
  rangedDmgBonusPct?: number;
  rangedAccuracyBonus?: number;
  needsRateModPct?: number; // e.g. -30% hunger/thirst rate
  healingRateModPct?: number;
  addictionRiskModPct?: number;
}

export interface SurvivalNeeds {
  hunger: number; // 0 to 100 (100 = starving)
  thirst: number; // 0 to 100 (100 = dehydrated)
  fatigue: number; // 0 to 100 (100 = exhausted)
  radiation: number; // 0 to 1000 rads
  infection: number; // 0 to 100 (disease severity)
  addictions: {
    stims: { level: number; activeDuration: number; withdrawal: boolean };
    psycho: { level: number; activeDuration: number; withdrawal: boolean };
    buffout: { level: number; activeDuration: number; withdrawal: boolean };
    alcohol: { level: number; activeDuration: number; withdrawal: boolean };
  };
}

export interface DerivedStats {
  maxHp: number;
  currentHp: number;
  maxAp: number;
  currentAp: number;
  evasion: number; // Armor class / Dodge
  initiative: number;
  critChance: number; // Percentage
  carryWeightMax: number;
  carryWeightCurrent: number;
  radResist: number; // Percentage
  diseaseResist: number; // Percentage
}

export interface AntiSynergyPenalty {
  id: string;
  nameRu: string;
  descriptionRu: string;
  penalties: Partial<SpecialStats>;
  reason: string;
}

export interface Character {
  name: string;
  gender: 'male' | 'female';
  avatarId: string;
  backgroundId: string;
  background: string;
  petId?: string;
  level: number;
  xp: number;
  baseSpecial: SpecialStats;
  effectiveSpecial: SpecialStats;
  taggedSkills: SkillName[];
  skillPointsInvested: Record<SkillName, number>;
  feats: string[]; // Feat IDs
  survival: SurvivalNeeds;
  currentHp: number;
  currentAp: number;
  equippedWeaponId?: string;
  equippedArmorId?: string;
}

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'chem' | 'ammo' | 'junk';

export interface Item {
  id: string;
  nameRu: string;
  type: ItemType;
  weight: number; // in lbs
  value: number; // Caps
  description: string;
  weaponData?: {
    // Legacy damage range retained until weapon dice/flat values are explicitly designed.
    damageMin: number;
    damageMax: number;
    damageDiceCount?: number;
    damageDiceSides?: number;
    damageFlat?: number;
    apCost: number;
    range: 'melee' | 'close' | 'medium' | 'long';
    skillReq: SkillName;
    ammoType?: string;
    critMultiplier: number;
  };
  armorData?: {
    // Legacy defense currently acts as DT. DR is optional and defaults to 0.
    defense: number;
    /** Canonical Armor Class contribution. Legacy `defense` is DT only. */
    armorClassBonus?: number;
    damageThreshold?: number;
    damageResistancePercent?: number;
    radResistBonus?: number;
    agiPenalty?: number;
  };
  consumableData?: {
    hpHeal?: number;
    hungerRestore?: number;
    thirstRestore?: number;
    fatigueRestore?: number;
    radsRemove?: number;
    infectionReduce?: number;
    addictionChance?: number; // 0..100
    chemType?: 'psycho' | 'buffout' | 'alcohol' | 'stims';
    chemDurationTurns?: number;
  };
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface Enemy {
  id: string;
  nameRu: string;
  hpMax: number;
  hpCurrent: number;
  apMax: number;
  apCurrent: number;
  evasion: number;
  armor: number;
  /** Canonical enemy mitigation fields. Legacy `armor` remains as a compatibility field. */
  damageThreshold?: number;
  damageResistancePercent?: number;
  /** Explicit attack modifier; avoids deriving accuracy from damage values. */
  attackBonus?: number;
  initiative: number;
  damageMin: number;
  damageMax: number;
  range: 'melee' | 'close' | 'medium' | 'long';
  specialAttackProb: number;
  specialAttackName?: string;
  xpValue: number;
  avatarIcon: string;
  description: string;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  textRu: string;
  type: 'info' | 'hit' | 'crit' | 'miss' | 'damage' | 'heal' | 'hazard' | 'turn';
}

export type DistanceBand = 'melee' | 'close' | 'medium' | 'long';

export interface CombatState {
  inCombat: boolean;
  round: number;
  turnOwner: 'player' | 'enemy';
  enemy: Enemy | null;
  distance: DistanceBand;
  playerDefensiveStance: boolean;
  enemyDefensiveStance: boolean;
}

export interface ArchetypePreset {
  id: string;
  titleRu: string;
  gender: 'male' | 'female';
  backgroundId: string;
  subtitleRu: string;
  descriptionRu: string;
  special: SpecialStats;
  taggedSkills: SkillName[];
  startingFeat: string;
  strengthsRu: string[];
  weaknessesRu: string[];
}
