import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Character,
  SpecialStats,
  SkillName,
  SurvivalNeeds,
  DerivedStats,
  InventoryItem,
  CombatLogEntry,
  CombatState,
  Enemy,
  DistanceBand,
  Item,
} from '../types/game';
import { ARCHETYPE_PRESETS } from '../data/archetypes';
import { BACKGROUND_DEFINITIONS } from '../data/backgrounds';
import {
  calculateEffectiveSpecial,
  calculateDerivedStats,
  calculateSkillValue,
  rollD20,
  resolveSkillCheck,
  getSkillTrainingCostPerPoint,
  getTrainingSpecial,
} from '../utils/statCalculations';
import {
  getAttributeMod,
  calculateMeleeDamage,
  calculateCritMeleeDamage,
  applyDamageMitigation,
  calculateSurvivalConsumptionRate,
} from '../utils/characterSystem';
import { getPetHandlingBonus } from '../utils/companionSystem';
import { FEAT_DEFINITIONS } from '../data/feats';
import { ITEM_DATABASE } from '../data/items';
import { ENEMY_DATABASE } from '../data/enemies';

interface GameContextType {
  character: Character | null;
  effectiveSpecial: SpecialStats;
  derivedStats: DerivedStats;
  inventory: InventoryItem[];
  combatState: CombatState;
  combatLog: CombatLogEntry[];
  gameTimeHours: number;
  gameDay: number;

  // Creation Actions
  createCharacter: (
    name: string,
    background: string,
    baseSpecial: SpecialStats,
    taggedSkills: SkillName[],
    startingFeatId: string,
    gender?: 'male' | 'female',
    avatarId?: string,
    petId?: string,
    backgroundId?: string
  ) => void;
  loadPresetCharacter: (presetId: string, name?: string) => void;

  // Inventory & Equipment Actions
  equipWeapon: (itemId: string | undefined) => void;
  equipArmor: (itemId: string | undefined) => void;
  useItem: (itemId: string) => void;
  addItemToInventory: (item: Item, quantity?: number) => void;
  removeItemFromInventory: (itemId: string, quantity?: number) => void;

  // Survival & Time Actions
  passTime: (hours: number, activityNameRu?: string) => void;
  restAndSleep: (hours: number) => void;
  scavengeRuins: () => void;
  travelBetweenSectors: (targetSectorName?: string) => void;
  clearSectorObstacle: () => void;

  // Combat Actions
  startCombatEncounter: (enemyTemplate?: Enemy) => void;
  endCombat: (won: boolean) => void;
  performPlayerAttack: (aimedBodyPart?: 'head' | 'body' | 'arms' | 'legs') => void;
  performPlayerDefensiveStance: () => void;
  performPlayerMove: (newDistance: DistanceBand) => void;
  passPlayerCombatTurn: () => void;

  // Level Up & Points Allocation
  investSkillPoint: (skillId: SkillName) => void;
  addFeat: (featId: string) => void;
  addLogMessage: (textRu: string, type?: CombatLogEntry['type']) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_SURVIVAL: SurvivalNeeds = {
  hunger: 15,
  thirst: 20,
  fatigue: 10,
  radiation: 0,
  infection: 0,
  addictions: {
    stims: { level: 0, activeDuration: 0, withdrawal: false },
    psycho: { level: 0, activeDuration: 0, withdrawal: false },
    buffout: { level: 0, activeDuration: 0, withdrawal: false },
    alcohol: { level: 0, activeDuration: 0, withdrawal: false },
  },
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [gameTimeHours, setGameTimeHours] = useState<number>(8); // 08:00 AM
  const [gameDay, setGameDay] = useState<number>(1);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);

  const [combatState, setCombatState] = useState<CombatState>({
    inCombat: false,
    round: 1,
    turnOwner: 'player',
    enemy: null,
    distance: 'medium',
    playerDefensiveStance: false,
    enemyDefensiveStance: false,
  });

  // Calculate effective SPECIAL and Derived Stats on the fly
  const effectiveSpecial = character
    ? calculateEffectiveSpecial(character.baseSpecial, character.feats, character.survival)
    : { STR: 5, PER: 5, END: 5, CHA: 5, INT: 5, AGI: 5, LCK: 5 };

  const derivedStats = character
    ? calculateDerivedStats(character, effectiveSpecial, inventory)
    : {
        maxHp: 100,
        currentHp: 100,
        maxAp: 10,
        currentAp: 10,
        evasion: 10,
        initiative: 5,
        critChance: 5,
        carryWeightMax: 150,
        carryWeightCurrent: 20,
        radResist: 10,
        diseaseResist: 10,
      };

  // Helper log message
  const addLogMessage = (textRu: string, type: CombatLogEntry['type'] = 'info') => {
    const newEntry: CombatLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: `[День ${gameDay}, ${String(gameTimeHours).padStart(2, '0')}:00]`,
      textRu,
      type,
    };
    setCombatLog((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  const createCharacter = (
    name: string,
    background: string,
    baseSpecial: SpecialStats,
    taggedSkills: SkillName[],
    startingFeatId: string,
    gender: 'male' | 'female' = 'male',
    avatarId = 'm1',
    petId = 'hound',
    backgroundId = 'none'
  ) => {
    const initialSkillInvestments: Record<SkillName, number> = {
      athletics: 0,
      stealth: 0,
      sleightOfHand: 0,
      unarmed: 0,
      melee: 0,
      firearms: 0,
      explosives: 0,
      survival: 0,
      search: 0,
      navigation: 0,
      insight: 0,
      medicine: 0,
      mechanics: 0,
      electronics: 0,
      science: 0,
      crafting: 0,
      persuasion: 0,
      barter: 0,
      deception: 0,
      leadership: 0,
      animalHandling: 0,
      performance: 0,
      energyWeapons: 0,
    };

    const newChar: Character = {
      name: name || 'Странник',
      gender,
      avatarId,
      backgroundId,
      background: background || 'Выживший из Развалин',
      petId,
      level: 1,
      xp: 0,
      baseSpecial,
      effectiveSpecial: { ...baseSpecial },
      taggedSkills,
      skillPointsInvested: initialSkillInvestments,
      feats: startingFeatId ? [startingFeatId] : [],
      survival: { ...INITIAL_SURVIVAL },
      currentHp: 50,
      currentAp: 10,
      equippedWeaponId: 'pipe_rifle',
      equippedArmorId: 'vault_suit',
    };

    // Calculate initial Max HP and AP
    const effSpec = calculateEffectiveSpecial(baseSpecial, newChar.feats, newChar.survival);
    const derived = calculateDerivedStats(newChar, effSpec, []);
    newChar.currentHp = derived.maxHp;
    newChar.currentAp = derived.maxAp;

    setCharacter(newChar);

    // Initial Starter Items
    const startingInventory: InventoryItem[] = [
      { item: ITEM_DATABASE.find((i) => i.id === 'pipe_rifle')!, quantity: 1 },
      { item: ITEM_DATABASE.find((i) => i.id === 'vault_suit')!, quantity: 1 },
      { item: ITEM_DATABASE.find((i) => i.id === 'purified_water')!, quantity: 3 },
      { item: ITEM_DATABASE.find((i) => i.id === 'canned_cram')!, quantity: 2 },
      { item: ITEM_DATABASE.find((i) => i.id === 'stimpak')!, quantity: 2 },
    ];
    setInventory(startingInventory);

    addLogMessage(`Персонаж ${newChar.name} вошёл в Пустошь.`, 'info');
  };

  const loadPresetCharacter = (presetId: string, customName?: string) => {
    const preset = ARCHETYPE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const bgDef = BACKGROUND_DEFINITIONS.find((b) => b.id === preset.backgroundId);
    createCharacter(
      customName || preset.titleRu,
      bgDef?.titleRu || preset.subtitleRu || 'Без предыстории',
      preset.special,
      preset.taggedSkills,
      preset.startingFeat,
      preset.gender,
      preset.avatarId || (preset.gender === 'female' ? 'f1' : 'm1'),
      preset.petId || 'hound',
      preset.backgroundId
    );
  };

  // Pass time in game hours & handle survival need updates
  const passTime = (hours: number, activityNameRu?: string) => {
    if (!character) return;

    let newHours = gameTimeHours + hours;
    let newDay = gameDay;
    if (newHours >= 24) {
      newDay += Math.floor(newHours / 24);
      newHours = newHours % 24;
    }
    setGameTimeHours(newHours);
    setGameDay(newDay);

    // Update survival scales using Survival skill (governing END/PER) and Feat modifiers
    const survSkill = calculateSkillValue('survival', character, effectiveSpecial);
    let featNeedsMult = 1.0;
    character.feats.forEach((featId) => {
      const feat = FEAT_DEFINITIONS.find((f) => f.id === featId);
      if (feat?.needsRateModPct) {
        featNeedsMult += feat.needsRateModPct / 100;
      }
    });
    const hungerIncrease = calculateSurvivalConsumptionRate(hours * 3 * featNeedsMult, survSkill, false);
    const thirstIncrease = calculateSurvivalConsumptionRate(hours * 4.5 * featNeedsMult, survSkill, false);
    const newHunger = Math.min(100, Math.max(0, character.survival.hunger + hungerIncrease));
    const newThirst = Math.min(100, Math.max(0, character.survival.thirst + thirstIncrease));
    const newFatigue = Math.min(100, Math.max(0, character.survival.fatigue + hours * 3 * featNeedsMult));

    // Update chem duration / withdrawal
    const newAddictions = { ...character.survival.addictions };
    (Object.keys(newAddictions) as (keyof typeof newAddictions)[]).forEach((chem) => {
      if (newAddictions[chem].activeDuration > 0) {
        newAddictions[chem].activeDuration = Math.max(0, newAddictions[chem].activeDuration - hours);
        if (newAddictions[chem].activeDuration === 0 && newAddictions[chem].level > 0) {
          newAddictions[chem].withdrawal = true;
          addLogMessage(`Наступила тяжелая ломка от ${chem.toUpperCase()}!`, 'hazard');
        }
      }
    });

    setCharacter({
      ...character,
      survival: {
        ...character.survival,
        hunger: newHunger,
        thirst: newThirst,
        fatigue: newFatigue,
        addictions: newAddictions,
      },
    });

    if (activityNameRu) {
      addLogMessage(`Прошло времени: ${hours} ч. (${activityNameRu}).`, 'info');
    }

    // Health damage if starving or severely dehydrated
    if (newHunger >= 85 || newThirst >= 85) {
      const dmg = Math.floor(hours * 3);
      setCharacter((prev) => (prev ? { ...prev, currentHp: Math.max(1, prev.currentHp - dmg) } : null));
      addLogMessage(`Организм истощен! Вы получили ${dmg} урон от обезвоживания/голода.`, 'hazard');
    }
  };

  const restAndSleep = (hours: number) => {
    if (!character) return;
    passTime(hours, `Сон на стоянке (${hours} ч.)`);

    // Sleep reduces fatigue and recovers HP if fed; Survival skill improves field camp recovery
    const survSkill = calculateSkillValue('survival', character, effectiveSpecial);
    const campBonus = Math.floor(survSkill / 15);
    const isFedAndHydrated = character.survival.hunger < 50 && character.survival.thirst < 50;
    const hpRecovery = (isFedAndHydrated ? hours * 6 : hours * 2) + campBonus;

    setCharacter((prev) => {
      if (!prev) return null;
      const newFatigue = Math.max(0, prev.survival.fatigue - hours * 15);
      return {
        ...prev,
        currentHp: Math.min(derivedStats.maxHp, prev.currentHp + hpRecovery),
        survival: {
          ...prev.survival,
          fatigue: newFatigue,
        },
      };
    });

    addLogMessage(`Вы восстановили ${hpRecovery} HP и снизили усталость на стоянке.`, 'heal');
  };

  // Scavenge ruins action: SEARCH replaces SURVIVAL, STEALTH resolves ambush risk
  const scavengeRuins = () => {
    if (!character) return;
    passTime(2, 'Поиск припасов в руинах');

    const searchSkill = calculateSkillValue('search', character, effectiveSpecial);
    const animalSkill = calculateSkillValue('animalHandling', character, effectiveSpecial);
    const petBonus = getPetHandlingBonus(character.petId, animalSkill);

    // Canonical search check: governing attribute PER, DC 45
    const searchRoll = rollD20();
    const searchCheck = resolveSkillCheck(
      effectiveSpecial.PER,
      searchSkill,
      45,
      searchRoll,
      petBonus.searchBonus
    );

    const possibleLoot = ['purified_water', 'dirty_water', 'canned_cram', 'mutant_meat', 'stimpak', 'radaway'];
    const petNameRu = character.petId === 'hound' ? 'Байкал' : character.petId === 'crow' ? 'Каркун' : character.petId === 'cat' ? 'Барсик' : '';

    if (searchCheck.outcome === 'critical_success') {
      const loot1 = ITEM_DATABASE.find((i) => i.id === 'stimpak')!;
      const loot2 = ITEM_DATABASE.find((i) => i.id === 'canned_cram')!;
      addItemToInventory(loot1, 1);
      addItemToInventory(loot2, 1);
      addLogMessage(
        `[ПОИСК: КРИТИЧЕСКИЙ УСПЕХ] d20=${searchRoll} (Margin +${searchCheck.margin})! ` +
        `${petBonus.searchBonus > 0 ? `Питомец ${petNameRu} помог учуять схрон: ` : ''}` +
        `найден тайник с припасами: ${loot1.nameRu} и ${loot2.nameRu}!`,
        'heal'
      );
    } else if (searchCheck.outcome === 'success') {
      const lootId = possibleLoot[Math.floor(Math.random() * possibleLoot.length)];
      const item = ITEM_DATABASE.find((i) => i.id === lootId)!;
      addItemToInventory(item, 1);
      addLogMessage(
        `[ПОИСК: УСПЕХ] d20=${searchRoll} (Margin +${searchCheck.margin})! Обнаружен предмет: ${item.nameRu}.`,
        'heal'
      );
    } else if (searchCheck.outcome === 'partial') {
      const item = ITEM_DATABASE.find((i) => i.id === 'dirty_water')!;
      addItemToInventory(item, 1);
      addLogMessage(
        `[ПОИСК: ЧАСТИЧНЫЙ УСПЕХ] d20=${searchRoll} (Margin ${searchCheck.margin}). Сектор почти пуст, удалось найти только: ${item.nameRu}.`,
        'info'
      );
    } else if (searchCheck.outcome === 'failure') {
      addLogMessage(
        `[ПОИСК: НЕУДАЧА] d20=${searchRoll} (Margin ${searchCheck.margin}). Руины оказались разграблены до вас.`,
        'info'
      );
    } else {
      addLogMessage(
        `[ПОИСК: КРИТИЧЕСКИЙ ПРОВАЛ] d20=${searchRoll} (Margin ${searchCheck.margin})! Обрушение хлама при поисках — ценностей не найдено, поднят шум!`,
        'hazard'
      );
    }

    // Stealth check against hostile ambush
    const stealthSkill = calculateSkillValue('stealth', character, effectiveSpecial);
    const stealthRoll = rollD20();
    const stealthCheck = resolveSkillCheck(
      effectiveSpecial.AGI,
      stealthSkill,
      50,
      stealthRoll,
      petBonus.stealthBonus
    );

    if (stealthCheck.outcome === 'critical_success') {
      addLogMessage(
        `[СКРЫТНОСТЬ: КРИТИЧЕСКИЙ УСПЕХ] d20=${stealthRoll} (Margin +${stealthCheck.margin})! ` +
        `Вы бесшумно проскользнули мимо логова врагов, оставшись незамеченным.`,
        'heal'
      );
    } else if (stealthCheck.outcome === 'success') {
      addLogMessage(
        `[СКРЫТНОСТЬ: УСПЕХ] d20=${stealthRoll} (Margin +${stealthCheck.margin}). ` +
        `Вы вовремя заметили патруль рейдеров и укрылись в тени развалин. Засада предотвращена.`,
        'info'
      );
    } else if (stealthCheck.outcome === 'partial') {
      addLogMessage(
        `[СКРЫТНОСТЬ: ЧАСТИЧНЫЙ УСПЕХ] d20=${stealthRoll} (Margin ${stealthCheck.margin}). ` +
        `Вы услышали шаги врага за секунду до удара и успели занять оборону!`,
        'hazard'
      );
      startCombatEncounter();
    } else {
      addLogMessage(
        `[СКРЫТНОСТЬ: ПРОВАЛ] d20=${stealthRoll} (Margin ${stealthCheck.margin})! ` +
        `Шорох под ногой выдал вас — из тени нападает враг!`,
        'hazard'
      );
      startCombatEncounter();
    }
  };

  // Navigation: travel between sectors
  const travelBetweenSectors = (targetSectorName?: string) => {
    if (!character) return;
    const navSkill = calculateSkillValue('navigation', character, effectiveSpecial);
    const navRoll = rollD20();
    const navCheck = resolveSkillCheck(effectiveSpecial.PER, navSkill, 45, navRoll);

    let hoursTaken = 3;
    if (navCheck.outcome === 'critical_success') {
      hoursTaken = 1;
      addLogMessage(
        `[НАВИГАЦИЯ: КРИТИЧЕСКИЙ УСПЕХ] d20=${navRoll} (Margin +${navCheck.margin})! ` +
        `Найден идеальный довоенный тоннель. Переход занял всего 1 час!`,
        'heal'
      );
    } else if (navCheck.outcome === 'success') {
      hoursTaken = 2;
      addLogMessage(
        `[НАВИГАЦИЯ: УСПЕХ] d20=${navRoll} (Margin +${navCheck.margin})! ` +
        `Выбрана короткая безопасная тропа. Переход занял 2 часа.`,
        'heal'
      );
    } else if (navCheck.outcome === 'partial') {
      hoursTaken = 3;
      addLogMessage(
        `[НАВИГАЦИЯ: ЧАСТИЧНЫЙ УСПЕХ] d20=${navRoll} (Margin ${navCheck.margin}). ` +
        `Стандартный маршрут по разрушенным улицам занял 3 часа.`,
        'info'
      );
    } else if (navCheck.outcome === 'failure') {
      hoursTaken = 4;
      addLogMessage(
        `[НАВИГАЦИЯ: НЕУДАЧА] d20=${navRoll} (Margin ${navCheck.margin}). ` +
        `Тропа оказалась завалена, блуждание по пустоши заняло 4 часа.`,
        'hazard'
      );
    } else {
      hoursTaken = 5;
      addLogMessage(
        `[НАВИГАЦИЯ: КРИТИЧЕСКИЙ ПРОВАЛ] d20=${navRoll} (Margin ${navCheck.margin})! ` +
        `Пыльная буря стёрла ориентиры. Вы кружили по руинам 5 часов!`,
        'hazard'
      );
    }

    passTime(hoursTaken, `Смена сектора${targetSectorName ? `: ${targetSectorName}` : ''}`);
  };

  // Athletics: clear physical obstacle / rubble in sector
  const clearSectorObstacle = () => {
    if (!character) return;
    const athSkill = calculateSkillValue('athletics', character, effectiveSpecial);
    const athRoll = rollD20();
    const athCheck = resolveSkillCheck(effectiveSpecial.STR, athSkill, 50, athRoll);

    if (athCheck.outcome === 'critical_success') {
      addLogMessage(
        `[АТЛЕТИКА: КРИТИЧЕСКИЙ УСПЕХ] d20=${athRoll} (Margin +${athCheck.margin})! ` +
        `Вы с лёгкостью отжали бетонную плиту! Проход открыт за 1 час, спасены довоенные материалы.`,
        'heal'
      );
      addItemToInventory(ITEM_DATABASE.find((i) => i.id === 'canned_cram')!, 1);
      passTime(1, 'Расчистка завала (Атлетика)');
    } else if (athCheck.outcome === 'success') {
      addLogMessage(
        `[АТЛЕТИКА: УСПЕХ] d20=${athRoll} (Margin +${athCheck.margin})! ` +
        `Физическая мощь позволила расчистить завал и открыть безопасный проход за 1 час.`,
        'heal'
      );
      passTime(1, 'Расчистка завала (Атлетика)');
    } else if (athCheck.outcome === 'partial') {
      addLogMessage(
        `[АТЛЕТИКА: ЧАСТИЧНЫЙ УСПЕХ] d20=${athRoll} (Margin ${athCheck.margin}). ` +
        `Завал поддался с большим трудом, потребовалось 2 часа тяжёлого труда.`,
        'info'
      );
      passTime(2, 'Тяжёлая расчистка завала');
    } else if (athCheck.outcome === 'failure') {
      addLogMessage(
        `[АТЛЕТИКА: НЕУДАЧА] d20=${athRoll} (Margin ${athCheck.margin}). ` +
        `Балки заклинило. Пришлось потратить 3 часа на поиск обходных путей.`,
        'hazard'
      );
      passTime(3, 'Поиск обхода завала');
    } else {
      addLogMessage(
        `[АТЛЕТИКА: КРИТИЧЕСКИЙ ПРОВАЛ] d20=${athRoll} (Margin ${athCheck.margin})! ` +
        `Обрушение арматуры! Вы потратили 3 часа и получили травму (-10 HP).`,
        'hazard'
      );
      setCharacter((prev) => (prev ? { ...prev, currentHp: Math.max(1, prev.currentHp - 10) } : null));
      passTime(3, 'Обрушение завала');
    }
  };

  // Equipment actions
  const equipWeapon = (itemId: string | undefined) => {
    if (!character) return;
    setCharacter({ ...character, equippedWeaponId: itemId });
    const item = ITEM_DATABASE.find((i) => i.id === itemId);
    addLogMessage(`Экипировано оружие: ${item ? item.nameRu : 'Без оружия'}.`, 'info');
  };

  const equipArmor = (itemId: string | undefined) => {
    if (!character) return;
    setCharacter({ ...character, equippedArmorId: itemId });
    const item = ITEM_DATABASE.find((i) => i.id === itemId);
    addLogMessage(`Экипирована броня: ${item ? item.nameRu : 'Без брони'}.`, 'info');
  };

  // Inventory actions
  const addItemToInventory = (item: Item, quantity = 1) => {
    setInventory((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) => (i.item.id === item.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { item, quantity }];
    });
  };

  const removeItemFromInventory = (itemId: string, quantity = 1) => {
    setInventory((prev) => {
      const existing = prev.find((i) => i.item.id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= quantity) {
        return prev.filter((i) => i.item.id !== itemId);
      }
      return prev.map((i) => (i.item.id === itemId ? { ...i, quantity: i.quantity - quantity } : i));
    });
  };

  // Consume item
  const useItem = (itemId: string) => {
    if (!character) return;
    const invItem = inventory.find((i) => i.item.id === itemId);
    if (!invItem) return;

    const item = invItem.item;
    const data = item.consumableData;
    if (!data) return;

    // Apply stats
    let newHp = character.currentHp;
    let newHunger = character.survival.hunger;
    let newThirst = character.survival.thirst;
    let newFatigue = character.survival.fatigue;
    let newRad = character.survival.radiation;
    let newInfection = character.survival.infection;
    let newAddictions = { ...character.survival.addictions };

    if (data.hpHeal) {
      const medSkill = calculateSkillValue('medicine', character, effectiveSpecial);
      let healMult = 1.0;
      character.feats.forEach((featId) => {
        const feat = FEAT_DEFINITIONS.find((f) => f.id === featId);
        if (feat?.healingRateModPct) {
          healMult += feat.healingRateModPct / 100;
        }
      });
      const totalHeal = Math.max(1, Math.floor(data.hpHeal * (1 + medSkill / 100) * healMult));
      newHp = Math.min(derivedStats.maxHp, newHp + totalHeal);
      addLogMessage(`Использован ${item.nameRu}: восстановлено ${totalHeal} HP.`, 'heal');
    }

    if (data.hungerRestore) {
      newHunger = Math.max(0, newHunger - data.hungerRestore);
      addLogMessage(`${item.nameRu}: утоление голода на -${data.hungerRestore}%.`, 'info');
    }

    if (data.thirstRestore) {
      newThirst = Math.max(0, newThirst - data.thirstRestore);
      addLogMessage(`${item.nameRu}: утоление жажды на -${data.thirstRestore}%.`, 'info');
    }

    if (data.radsRemove) {
      newRad = Math.max(0, newRad - data.radsRemove);
      addLogMessage(`${item.nameRu}: выведено ${data.radsRemove} Rads.`, 'heal');
    }

    if (data.infectionReduce) {
      newInfection = Math.max(0, newInfection - data.infectionReduce);
      addLogMessage(`${item.nameRu}: инфекция снижена на ${data.infectionReduce}%.`, 'heal');
    }

    // Handle Chem Effect & Addiction Risk
    if (data.chemType) {
      const chem = data.chemType;
      let duration = data.chemDurationTurns || 4;
      let addictChance = data.addictionChance || 20;

      character.feats.forEach((featId) => {
        const feat = FEAT_DEFINITIONS.find((f) => f.id === featId);
        if (feat?.addictionRiskModPct) {
          addictChance += feat.addictionRiskModPct;
        }
      });

      if (character.feats.includes('junkie')) {
        duration = Math.round(duration * 1.25);
      }

      newAddictions[chem] = {
        level: newAddictions[chem].level + 1,
        activeDuration: duration,
        withdrawal: false,
      };

      addLogMessage(`Принят препарат ${item.nameRu}! Прилив сил на ${duration} ч.`, 'heal');

      if (Math.random() * 100 < addictChance) {
        addLogMessage(`[ЗАВИСИМОСТЬ] У вас развилась зависимость от ${item.nameRu}!`, 'hazard');
      }
    }

    setCharacter({
      ...character,
      currentHp: newHp,
      survival: {
        ...character.survival,
        hunger: newHunger,
        thirst: newThirst,
        fatigue: newFatigue,
        radiation: newRad,
        infection: newInfection,
        addictions: newAddictions,
      },
    });

    removeItemFromInventory(itemId, 1);
  };

  // Start turn-based combat encounter
  const startCombatEncounter = (enemyTemplate?: Enemy) => {
    if (!character) return;
    const enemyToFight = enemyTemplate
      ? { ...enemyTemplate }
      : { ...ENEMY_DATABASE[Math.floor(Math.random() * ENEMY_DATABASE.length)] };

    // Reset combat HP / AP
    enemyToFight.hpCurrent = enemyToFight.hpMax;
    enemyToFight.apCurrent = enemyToFight.apMax;

    // Roll Initiative d20 + Initiative Stat
    const playerInitRoll = rollD20() + derivedStats.initiative;
    const enemyInitRoll = rollD20() + enemyToFight.initiative;

    const playerGoesFirst = playerInitRoll >= enemyInitRoll;

    setCombatState({
      inCombat: true,
      round: 1,
      turnOwner: playerGoesFirst ? 'player' : 'enemy',
      enemy: enemyToFight,
      distance: enemyToFight.range === 'melee' ? 'close' : 'medium',
      playerDefensiveStance: false,
      enemyDefensiveStance: false,
    });

    addLogMessage(
      `--- БОЙ НАЧАЛСЯ: Противник ${enemyToFight.nameRu}! Инициатива: Игрок (${playerInitRoll}) vs Враг (${enemyInitRoll}) ---`,
      'turn'
    );

    // Reset player AP for combat start
    setCharacter({ ...character, currentAp: derivedStats.maxAp });

    if (!playerGoesFirst) {
      setTimeout(() => performEnemyCombatTurn(enemyToFight), 800);
    }
  };

  const endCombat = (won: boolean) => {
    if (won && combatState.enemy && character) {
      const xpGained = combatState.enemy.xpValue;
      const newXp = character.xp + xpGained;
      addLogMessage(`[ПОБЕДА] Враг повержен! Получено +${xpGained} XP.`, 'heal');

      // Random caps & ammo reward
      const caps = Math.floor(Math.random() * 35) + 10;
      addLogMessage(`В карманах врага найдено ${caps} крышек.`, 'info');

      setCharacter({ ...character, xp: newXp });
    } else if (!won) {
      addLogMessage(`Вы сбежали из боя или были поражены...`, 'hazard');
    }

    setCombatState({
      inCombat: false,
      round: 1,
      turnOwner: 'player',
      enemy: null,
      distance: 'medium',
      playerDefensiveStance: false,
      enemyDefensiveStance: false,
    });
  };

  // Perform Player Attack in Turn-Based Combat
  const performPlayerAttack = (aimedPart: 'head' | 'body' | 'arms' | 'legs' = 'body') => {
    if (!character || !combatState.enemy || !combatState.inCombat) return;

    const weapon = ITEM_DATABASE.find((i) => i.id === character.equippedWeaponId);
    const weaponData = weapon?.weaponData || {
      damageMin: 3,
      damageMax: 6,
      damageDiceCount: 1,
      damageDiceSides: 4,
      damageFlat: 2,
      apCost: 3,
      range: 'melee' as const,
      skillReq: 'unarmed' as SkillName,
      critMultiplier: 1.5,
    };

    const diceCount = weaponData.damageDiceCount ?? 1;
    const diceSides = weaponData.damageDiceSides ?? Math.max(1, weaponData.damageMax - weaponData.damageMin + 1);
    const weaponFlat =
      weaponData.damageFlat ??
      (weaponData.damageMin - 1);

    const apCost = weaponData.apCost;
    if (character.currentAp < apCost) {
      addLogMessage(`Недостаточно Очков Действий (AP)! Требуется ${apCost} AP.`, 'hazard');
      return;
    }

    const remainingAp = character.currentAp - apCost;
    const skillVal = calculateSkillValue(weaponData.skillReq, character, effectiveSpecial);

    // Canonical attack structure: D20 + attribute modifier + skill bonus + weapon accuracy.
    let featRangedAccuracy = 0;
    if (weaponData.range !== 'melee') {
      character.feats.forEach((featId) => {
        const feat = FEAT_DEFINITIONS.find((f) => f.id === featId);
        if (feat?.rangedAccuracyBonus) {
          featRangedAccuracy += feat.rangedAccuracyBonus;
        }
      });
    }

    const attackMod = getAttributeMod(effectiveSpecial.PER);
    const skillBonus = skillVal;
    const weaponAccuracy = featRangedAccuracy;
    const d20 = rollD20();
    const attackTotal = d20 + attackMod + skillBonus + weaponAccuracy;

    const targetAC = combatState.enemy.evasion + (combatState.enemyDefensiveStance ? 4 : 0);
    const isNatural20 = d20 === 20;
    const isNatural1 = d20 === 1;
    const isHit = !isNatural1 && (isNatural20 || attackTotal >= targetAC);

    // LCK threat brackets: 20 / 19-20 / 18-20 / 17-20.
    const threatMin =
      effectiveSpecial.LCK <= 4 ? 20 :
      effectiveSpecial.LCK <= 7 ? 19 :
      effectiveSpecial.LCK <= 9 ? 18 : 17;
    const isCrit = isHit && (isNatural20 || (d20 >= threatMin && attackTotal >= targetAC));

    addLogMessage(
      `Атака (${aimedPart.toUpperCase()}): d20=${d20}, итог=${attackTotal}, AC=${targetAC}.`,
      isHit ? 'hit' : 'miss'
    );

    if (!isHit) {
      addLogMessage(
        isNatural1
          ? `Критический провал! Natural 1 — атака промахнулась и требует стандартной проверки осечки.`
          : `Промах! Вы промазали по ${combatState.enemy.nameRu}.`,
        'miss'
      );
      setCharacter({ ...character, currentAp: remainingAp });
      return;
    }

    let rollWeaponDice = 0;
    for (let i = 0; i < diceCount; i++) {
      rollWeaponDice += Math.floor(Math.random() * diceSides) + 1;
    }

    // STR modifies melee damage only. Ranged attacks use no STR damage modifier.
    const attributeMod = weaponData.range === 'melee'
      ? getAttributeMod(effectiveSpecial.STR)
      : 0;

    const maxWeaponDice = diceCount * diceSides;
    let rawDamage = rollWeaponDice + weaponFlat + attributeMod;

    if (isCrit) {
      rawDamage = maxWeaponDice + rollWeaponDice + weaponFlat + attributeMod;
    }

    // Pet assistance in combat (if pet is hound and animalHandling is trained)
    const animalSkill = calculateSkillValue('animalHandling', character, effectiveSpecial);
    const petBonus = getPetHandlingBonus(character.petId, animalSkill);
    if (petBonus.combatDamageBonus > 0) {
      rawDamage += petBonus.combatDamageBonus;
      addLogMessage(`Пёс Байкал атаковал врага (+${petBonus.combatDamageBonus} урона)!`, 'hit');
    }

    rawDamage = Math.max(1, rawDamage);

    // Enemy armor remains a legacy numeric field until enemy DT/DR is explicitly designed.
    const damageThreshold = Math.max(
      0,
      combatState.enemy.damageThreshold ?? combatState.enemy.armor
    );
    const damageResistancePercent = Math.max(
      0,
      combatState.enemy.damageResistancePercent ?? 0
    );
    const netDamage = applyDamageMitigation(
      rawDamage,
      damageThreshold,
      damageResistancePercent
    );

    const newEnemyHp = Math.max(0, combatState.enemy.hpCurrent - netDamage);

    addLogMessage(
      `${isCrit ? '[КРИТИЧЕСКИЙ УДАР!] ' : ''}Попадание по ${combatState.enemy.nameRu}! Урон: ${rawDamage} [DT ${damageThreshold} = ${netDamage} чистыми HP].`,
      isCrit ? 'crit' : 'damage'
    );

    const updatedEnemy = { ...combatState.enemy, hpCurrent: newEnemyHp };
    setCombatState((prev) => ({ ...prev, enemy: updatedEnemy }));
    setCharacter({ ...character, currentAp: remainingAp });

    if (newEnemyHp <= 0) {
      setTimeout(() => endCombat(true), 600);
    }
  };

  const performPlayerDefensiveStance = () => {
    if (!character || character.currentAp < 3) {
      addLogMessage(`Недостаточно AP для Защитной Стойки (нужно 3 AP).`, 'hazard');
      return;
    }

    setCharacter({ ...character, currentAp: character.currentAp - 3 });
    setCombatState((prev) => ({ ...prev, playerDefensiveStance: true }));
    addLogMessage(`Вы встали в защитную стойку (+4 к Уклонению до следующего хода).`, 'info');
  };

  const performPlayerMove = (newDistance: DistanceBand) => {
    if (!character || character.currentAp < 2) {
      addLogMessage(`Недостаточно AP для перемещения (нужно 2 AP).`, 'hazard');
      return;
    }

    setCharacter({ ...character, currentAp: character.currentAp - 2 });
    setCombatState((prev) => ({ ...prev, distance: newDistance }));
    addLogMessage(`Дистанция боя изменена на: ${newDistance.toUpperCase()}.`, 'info');
  };

  const passPlayerCombatTurn = () => {
    if (!combatState.inCombat || !combatState.enemy) return;

    addLogMessage(`Ход переходит к противнику ${combatState.enemy.nameRu}...`, 'turn');
    setCombatState((prev) => ({ ...prev, turnOwner: 'enemy', playerDefensiveStance: false }));

    setTimeout(() => performEnemyCombatTurn(combatState.enemy!), 800);
  };

  // Enemy Combat Logic (Turn AI)
  const performEnemyCombatTurn = (currentEnemy: Enemy) => {
    if (!character) return;

    addLogMessage(`--- Ход Врага: ${currentEnemy.nameRu} ---`, 'turn');

    let enemyAp = currentEnemy.apMax;

    // Enemy AI decision
    if (combatState.distance === 'long' && currentEnemy.range === 'melee') {
      // Enemy closes distance
      setCombatState((prev) => ({ ...prev, distance: 'close' }));
      addLogMessage(`${currentEnemy.nameRu} сокращает дистанцию до БЛИЖНЕГО боя!`, 'info');
      enemyAp -= 3;
    }

    if (enemyAp >= 3) {
      // Enemy Attacks
      const enemyD20 = rollD20();
      const enemyAttackMod = currentEnemy.attackBonus ?? 0;
      const enemyAttackTotal = enemyD20 + enemyAttackMod;
      const isHit = enemyD20 === 20 || (enemyD20 !== 1 && enemyAttackTotal >= derivedStats.evasion + (combatState.playerDefensiveStance ? 4 : 0));

      if (isHit) {
        const enemyRange = currentEnemy.damageMax - currentEnemy.damageMin + 1;
        const dmg = currentEnemy.damageMin + Math.floor(Math.random() * enemyRange);

        let damageThreshold = 0;
        let damageResistancePercent = 0;
        if (character.equippedArmorId) {
          const armorItem = ITEM_DATABASE.find((i) => i.id === character.equippedArmorId);
          if (armorItem?.armorData) {
            damageThreshold = armorItem.armorData.damageThreshold ?? armorItem.armorData.defense;
            damageResistancePercent = armorItem.armorData.damageResistancePercent ?? 0;
          }
        }

        const netDmg = applyDamageMitigation(
          dmg,
          damageThreshold,
          damageResistancePercent
        );
        const newPlayerHp = Math.max(0, character.currentHp - netDmg);

        addLogMessage(
          `Враг ${currentEnemy.nameRu} наносит вам урон: ${dmg} [DT ${damageThreshold} = ${netDmg} HP]!`,
          'damage'
        );

        setCharacter((prev) => (prev ? { ...prev, currentHp: newPlayerHp } : null));

        if (newPlayerHp <= 0) {
          addLogMessage(`[СМЕРТЬ] Вы погибли от ран в Пустоши...`, 'hazard');
          setTimeout(() => endCombat(false), 1000);
          return;
        }
      } else {
        addLogMessage(`Враг ${currentEnemy.nameRu} промахивается! (d20=${enemyD20}, итог=${enemyAttackTotal})`, 'miss');
      }
    }

    // End enemy turn, pass back to player
    setTimeout(() => {
      setCombatState((prev) => ({
        ...prev,
        turnOwner: 'player',
        round: prev.round + 1,
        enemyDefensiveStance: false,
      }));

      // Refresh Player AP on new round start
      setCharacter((prev) => (prev ? { ...prev, currentAp: derivedStats.maxAp } : null));
      addLogMessage(`=== Раунд ${combatState.round + 1}: Ваш ход! (AP Восстановлены) ===`, 'turn');
    }, 600);
  };

  // Level Up Skill Point Investment: escalating 1/2/3/4 SP curve, no per-skill cap.
  const investSkillPoint = (skillId: SkillName) => {
    if (!character) return;
    const currentInvested = character.skillPointsInvested[skillId] || 0;
    const skillDef = SKILL_DEFINITIONS.find((s) => s.id === skillId);
    if (!skillDef) return;

    const trainingSpecial = getTrainingSpecial(character);
    const baseSkill = calculateSkillValue(
      skillId,
      { ...character, skillPointsInvested: { ...character.skillPointsInvested, [skillId]: 0 } },
      trainingSpecial
    );
    const currentValue = Math.min(100, baseSkill + currentInvested);
    if (currentValue >= 100) {
      addLogMessage('Навык уже достиг максимума 100.', 'hazard');
      return;
    }

    const cost = getSkillTrainingCostPerPoint(currentValue);

    const totalEarned =
      8 + character.baseSpecial.INT +
      Math.max(0, character.level - 1) *
        (4 + Math.floor(character.baseSpecial.INT / 2) + (character.backgroundId === 'none' ? 2 : 0));

    let spent = 0;
    for (const [id, invested] of Object.entries(character.skillPointsInvested)) {
      if (!invested) continue;
      const def = SKILL_DEFINITIONS.find((s) => s.id === id);
      if (!def) continue;
      const base = calculateSkillValue(
        id as SkillName,
        { ...character, skillPointsInvested: { ...character.skillPointsInvested, [id as SkillName]: 0 } },
        trainingSpecial
      );
      let value = base;
      for (let i = 0; i < invested && value < 100; i++) {
        spent += getSkillTrainingCostPerPoint(value);
        value++;
      }
    }

    if (totalEarned - spent < cost) {
      addLogMessage(`Недостаточно очков обучения. Нужно ${cost} SP.`, 'hazard');
      return;
    }

    setCharacter({
      ...character,
      skillPointsInvested: {
        ...character.skillPointsInvested,
        [skillId]: currentInvested + 1,
      },
    });
    addLogMessage(`Навык ${skillId} повышен до ${currentValue + 1}. Потрачено ${cost} SP.`, 'info');
  };

  const addFeat = (featId: string) => {
    if (!character || character.feats.includes(featId)) return;
    setCharacter({
      ...character,
      feats: [...character.feats, featId],
    });
    const feat = FEAT_DEFINITIONS.find((f) => f.id === featId);
    addLogMessage(`Получен новый Фит: ${feat?.nameRu || featId}!`, 'heal');
  };

  const resetGame = () => {
    setCharacter(null);
    setInventory([]);
    setCombatLog([]);
  };

  return (
    <GameContext.Provider
      value={{
        character,
        effectiveSpecial,
        derivedStats,
        inventory,
        combatState,
        combatLog,
        gameTimeHours,
        gameDay,
        createCharacter,
        loadPresetCharacter,
        equipWeapon,
        equipArmor,
        useItem,
        addItemToInventory,
        removeItemFromInventory,
        passTime,
        restAndSleep,
        scavengeRuins,
        travelBetweenSectors,
        clearSectorObstacle,
        startCombatEncounter,
        endCombat,
        performPlayerAttack,
        performPlayerDefensiveStance,
        performPlayerMove,
        passPlayerCombatTurn,
        investSkillPoint,
        addFeat,
        addLogMessage,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
