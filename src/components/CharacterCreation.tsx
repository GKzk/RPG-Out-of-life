import React, { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { SpecialStats, SkillName, SpecialAttribute } from '../types/game';
import {
  MAX_SPECIAL_POINT_POOL,
  getTotalPointCost,
  getActiveAntiSynergies,
  calculateSkillBaseValue,
  getSkillTrainingCostPerPoint,
} from '../utils/statCalculations';
import { getAttributeMod, getMaxAP } from '../utils/characterSystem';
import { ARCHETYPE_PRESETS } from '../data/archetypes';
import { BACKGROUND_DEFINITIONS } from '../data/backgrounds';
import { SKILL_DEFINITIONS } from '../data/skills';
import { FEAT_DEFINITIONS } from '../data/feats';
import { PET_DEFINITIONS } from '../data/pets';
import { AVATAR_OPTIONS, AvatarOption } from '../data/avatars';
import { SPECIAL_DESCRIPTIONS, SpecialDetail } from '../data/specialDescriptions';
import {
  Check,
  ChevronRight,
  ShieldAlert,
  UserRound,
  Wrench,
  Crosshair,
  Brain,
  HeartPulse,
  BriefcaseBusiness,
  Sparkles,
  Dog,
  Cat,
  Bird,
  UserX,
  HelpCircle,
  X,
  Flame,
  Plus,
  Minus,
  Info,
  SlidersHorizontal,
} from 'lucide-react';

const STAT_ORDER: SpecialAttribute[] = ['STR', 'PER', 'END', 'CHA', 'INT', 'AGI', 'LCK'];

const FEAT_ICON: Record<string, React.ReactNode> = {
  one_eyed: <Crosshair className="w-4 h-4" />,
  sprint: <Sparkles className="w-4 h-4" />,
  musician: <Sparkles className="w-4 h-4" />,
  metabolism: <HeartPulse className="w-4 h-4" />,
  alcoholic: <HeartPulse className="w-4 h-4" />,
  junkie: <HeartPulse className="w-4 h-4" />,
  narcissist: <BriefcaseBusiness className="w-4 h-4" />,
  workaholic: <Wrench className="w-4 h-4" />,
  sleepless: <ShieldAlert className="w-4 h-4" />,
  hard_life: <ShieldAlert className="w-4 h-4" />,
  iron_stomach: <HeartPulse className="w-4 h-4" />,
  glass_nerves: <Brain className="w-4 h-4" />,
  pack_rat: <Wrench className="w-4 h-4" />,
  miniature: <UserRound className="w-4 h-4" />,
  sexuality: <Sparkles className="w-4 h-4" />,
};

export const CharacterCreation: React.FC = () => {
  const { createCharacter, loadPresetCharacter } = useGame();

  const [name, setName] = useState('Алекс');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [avatarId, setAvatarId] = useState('m1');
  const [petId, setPetId] = useState('hound');
  const [backgroundId, setBackgroundId] = useState('none');
  const [showArchetypes, setShowArchetypes] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeSpecialModal, setActiveSpecialModal] = useState<SpecialAttribute | null>(null);

  const [special, setSpecial] = useState<SpecialStats>({
    STR: 5, PER: 5, END: 5, CHA: 5, INT: 5, AGI: 5, LCK: 5,
  });
  const [taggedSkills, setTaggedSkills] = useState<SkillName[]>(['survival', 'navigation', 'sleightOfHand']);
  const [startingFeat, setStartingFeat] = useState('hard_life');
  const [skillInvestments, setSkillInvestments] = useState<Record<SkillName, number>>({
    athletics: 0, stealth: 0, sleightOfHand: 0, unarmed: 0, melee: 0,
    firearms: 0, explosives: 0, survival: 0, search: 0, navigation: 0,
    insight: 0, medicine: 0, mechanics: 0, electronics: 0, science: 0,
    crafting: 0, persuasion: 0, barter: 0, deception: 0, leadership: 0,
    animalHandling: 0, performance: 0, energyWeapons: 0,
  });

  const background = BACKGROUND_DEFINITIONS.find((item) => item.id === backgroundId) ?? BACKGROUND_DEFINITIONS[0];
  const chosenPet = PET_DEFINITIONS.find((p) => p.id === petId) ?? PET_DEFINITIONS[0];
  const chosenFeat = FEAT_DEFINITIONS.find((f) => f.id === startingFeat) ?? FEAT_DEFINITIONS[0];

  // 1. Effective SPECIAL with live feat modifications applied
  const effectiveSpecial = useMemo<SpecialStats>(() => {
    const feat = FEAT_DEFINITIONS.find((f) => f.id === startingFeat);
    const eff = { ...special };
    if (feat?.statModifiers) {
      (Object.keys(feat.statModifiers) as SpecialAttribute[]).forEach((attr) => {
        eff[attr] += feat.statModifiers![attr] || 0;
      });
    }
    return eff;
  }, [special, startingFeat]);

  const totalCostUsed = getTotalPointCost(special);
  const remainingPoints = MAX_SPECIAL_POINT_POOL - totalCostUsed;
  const activeAntiSynergies = getActiveAntiSynergies(effectiveSpecial);

  const backgroundSkill = background.coreSkill;
  const backgroundSkillName = SKILL_DEFINITIONS.find((s) => s.id === backgroundSkill)?.nameRu ?? backgroundSkill;

  // 2. Total SP pool for Level 1 (8 + INT + background bonus)
  const totalSpBudget = useMemo(() => {
    return 8 + special.INT + (backgroundId === 'none' ? 2 : 0);
  }, [special.INT, backgroundId]);

  // 3. Derived stats preview (AP, Carry, HP)
  const statPreview = useMemo(() => {
    const feat = FEAT_DEFINITIONS.find((f) => f.id === startingFeat);
    const apBonus = feat?.apBonus || 0;
    const carryBonus = feat?.carryWeightBonus || 0;
    const str = effectiveSpecial.STR;
    const agi = effectiveSpecial.AGI;
    const end = effectiveSpecial.END;
    return {
      hp: 40 + end * 5,
      ap: getMaxAP(agi) + apBonus,
      carry: str * 6 + 25 + carryBonus,
    };
  }, [effectiveSpecial, startingFeat]);

  // 4. Calculate skill values & SP spent
  const { skillValues, spentSp, remainingSp } = useMemo(() => {
    let spent = 0;
    const values: Record<SkillName, number> = {} as Record<SkillName, number>;
    const feat = FEAT_DEFINITIONS.find((f) => f.id === startingFeat);

    SKILL_DEFINITIONS.forEach((skill) => {
      let base = calculateSkillBaseValue(skill.id, effectiveSpecial);
      if (taggedSkills.includes(skill.id)) base += 10;
      if (feat?.skillModifiers && feat.skillModifiers[skill.id] !== undefined) {
        base += feat.skillModifiers[skill.id]!;
      }
      const invested = skillInvestments[skill.id] || 0;
      let cur = base;
      for (let i = 0; i < invested && cur < 100; i++) {
        spent += getSkillTrainingCostPerPoint(cur);
        cur += 1;
      }
      values[skill.id] = Math.max(0, Math.min(100, cur));
    });

    return {
      skillValues: values,
      spentSp: spent,
      remainingSp: totalSpBudget - spent,
    };
  }, [effectiveSpecial, taggedSkills, startingFeat, skillInvestments, totalSpBudget]);

  const handleGenderChange = (newGender: 'male' | 'female') => {
    setGender(newGender);
    if (newGender === 'female' && avatarId.startsWith('m')) {
      setAvatarId('f1');
    } else if (newGender === 'male' && avatarId.startsWith('f')) {
      setAvatarId('m1');
    }
  };

  const handleSelectBackground = (id: string) => {
    const next = BACKGROUND_DEFINITIONS.find((item) => item.id === id);
    if (!next) return;
    setBackgroundId(id);
    if (next.coreSkill) {
      setTaggedSkills((current) =>
        current.includes(next.coreSkill!) ? current : [...current.slice(0, 2), next.coreSkill!]
      );
    }
  };

  const startArchetype = (presetId: string) => {
    const preset = ARCHETYPE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    loadPresetCharacter(presetId, preset.titleRu);
  };

  const updateStat = (attr: SpecialAttribute, delta: number) => {
    const next = special[attr] + delta;
    if (next < 1 || next > 10) return;
    if (delta > 0 && getTotalPointCost({ ...special, [attr]: next }) > MAX_SPECIAL_POINT_POOL) return;
    setSpecial((prev) => ({ ...prev, [attr]: next }));
  };

  const toggleTagSkill = (skillId: SkillName) => {
    if (backgroundSkill && skillId === backgroundSkill) return;
    if (taggedSkills.includes(skillId)) {
      setTaggedSkills(taggedSkills.filter((s) => s !== skillId));
      return;
    }
    if (taggedSkills.length >= 3) return;
    setTaggedSkills([...taggedSkills, skillId]);
  };

  const handleInvestSkill = (skillId: SkillName, delta: number) => {
    const curInvested = skillInvestments[skillId] || 0;
    if (delta < 0 && curInvested <= 0) return;

    const curVal = skillValues[skillId];
    if (delta > 0) {
      if (curVal >= 100) return;
      const cost = getSkillTrainingCostPerPoint(curVal);
      if (remainingSp < cost) return;
      setSkillInvestments((prev) => ({ ...prev, [skillId]: curInvested + 1 }));
    } else {
      setSkillInvestments((prev) => ({ ...prev, [skillId]: curInvested - 1 }));
    }
  };

  const handleFinishCreation = () => {
    if (taggedSkills.length !== 3 || (backgroundSkill && !taggedSkills.includes(backgroundSkill)) || remainingPoints < 0) return;
    createCharacter(
      name.trim() || 'Алекс',
      background.titleRu,
      special,
      taggedSkills,
      startingFeat,
      gender,
      avatarId,
      petId,
      background.id,
      skillInvestments
    );
  };

  const currentAvatarDef = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
  const petIconMap = {
    Dog,
    Cat,
    Bird,
    Ferret: Sparkles,
    Boar: Flame,
    UserX,
  };

  return (
    <main className="min-h-screen bg-[#111312] text-[#e6e2d8]">
      <div className="max-w-7xl mx-auto px-4 py-5 md:px-6 md:py-8">
        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl border border-[#39413c] bg-[#191d1b] shadow-2xl mb-5">
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#d7d0c2 1px, transparent 1px), linear-gradient(90deg, #d7d0c2 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative p-5 md:p-7 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#b84d43] text-[11px] font-bold tracking-[0.24em] uppercase mb-2">
                <span className="w-8 h-px bg-[#b84d43]" /> ЛИЧНОЕ ДЕЛО · 001
              </div>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#eeeae0]">СОЗДАНИЕ ПЕРСОНАЖА</h1>
            </div>
            <button
              onClick={() => setShowArchetypes(true)}
              className="rounded-xl border border-[#6b413b] bg-[#241a18] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#d8c9c0] hover:border-[#b84d43] transition-colors"
            >
              Готовые персонажи
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* BLOCK 01 & 02: ЛИЧНОСТЬ + СПУТНИК                                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-5">
          {/* Identity: 4 columns on xl */}
          <section className="xl:col-span-4 rounded-2xl border border-[#39413c] bg-[#191d1b] p-5 flex flex-col justify-between">
            <div>
              <SectionTitle number="01" title="Личность" right="Имя, пол, внешность" />

              <label className="block text-[11px] text-[#89918b] uppercase tracking-wider mb-1.5 mt-4">Имя персонажа</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-3.5 w-4 h-4 text-[#657068]" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#101311] border border-[#343c37] rounded-xl pl-10 pr-3 py-2.5 text-sm text-[#eeeae0] outline-none focus:border-[#b84d43] transition-colors"
                  maxLength={32}
                  placeholder="Имя персонажа"
                />
              </div>

              {/* Gender */}
              <label className="block text-[11px] text-[#89918b] uppercase tracking-wider mb-1.5 mt-4">Пол</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenderChange('male')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    gender === 'male'
                      ? 'border-[#b84d43] bg-[#241a18] text-[#eeeae0] shadow-[inset_2px_0_0_#b84d43]'
                      : 'border-[#303833] bg-[#121614] text-[#8f9891] hover:border-[#59625b]'
                  }`}
                >
                  Мужской
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange('female')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    gender === 'female'
                      ? 'border-[#b84d43] bg-[#241a18] text-[#eeeae0] shadow-[inset_2px_0_0_#b84d43]'
                      : 'border-[#303833] bg-[#121614] text-[#8f9891] hover:border-[#59625b]'
                  }`}
                >
                  Женский
                </button>
              </div>

              {/* Avatar Selector Card */}
              <label className="block text-[11px] text-[#89918b] uppercase tracking-wider mb-1.5 mt-4">Внешность</label>
              <div className="p-3.5 rounded-xl border border-[#343c37] bg-[#121614] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#241a18] border border-[#b84d43]/50 flex items-center justify-center text-xs font-bold text-[#f08a7e] shrink-0 shadow-inner">
                    {currentAvatarDef.badge}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#eeeae0] truncate">{currentAvatarDef.nameRu}</div>
                    <div className="text-[11px] text-[#8a948c] line-clamp-1">{currentAvatarDef.descriptionRu}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="px-3 py-2 rounded-lg border border-[#54413e] bg-[#221715] hover:bg-[#2e1d1b] text-xs font-semibold text-[#f08a7e] shrink-0 transition-colors"
                >
                  Выбрать
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2d3530] flex items-center justify-between text-xs text-[#7e8780]">
              <span>Портрет личного дела:</span>
              <span className="text-[#ded9ce] font-medium">{currentAvatarDef.callsignRu}</span>
            </div>
          </section>

          {/* Companion: 8 columns on xl */}
          <section className="xl:col-span-8 rounded-2xl border border-[#39413c] bg-[#191d1b] p-5 flex flex-col justify-between">
            <div>
              <SectionTitle number="02" title="Спутник" right="Выбор четвероногого или пернатого спутника" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {PET_DEFINITIONS.map((pet) => {
                  const selected = petId === pet.id;
                  const PetIcon = petIconMap[pet.iconName] || UserX;
                  return (
                    <button
                      key={pet.id}
                      onClick={() => setPetId(pet.id)}
                      className={`text-left rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                        selected
                          ? 'border-[#b84d43] bg-[#241a18] shadow-[inset_3px_0_0_#b84d43]'
                          : 'border-[#303833] bg-[#121614] hover:border-[#59625b]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              selected ? 'bg-[#b84d43] text-white' : 'bg-[#252c28] text-[#9ca49d]'
                            }`}
                          >
                            <PetIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-sm font-semibold ${selected ? 'text-[#eeeae0]' : 'text-[#c8c4ba]'}`}>{pet.nameRu}</span>
                              {selected && <Check className="w-4 h-4 text-[#c95a4f] shrink-0" />}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-[#727b74] mt-0.5">{pet.speciesRu}</div>
                          </div>
                        </div>

                        <div className="mt-2 text-[10px] font-medium text-[#b58b84] italic">{pet.subtitleRu}</div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-[#89918b]">{pet.descriptionRu}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2d3530] flex items-center justify-between text-xs text-[#7e8780]">
              <span>Выбран спутник:</span>
              <span className="text-[#ded9ce] font-medium">{chosenPet.nameRu} ({chosenPet.speciesRu})</span>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* BLOCK 03: SPECIAL + НАВЫКИ                                                */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-5">
          {/* SPECIAL: 6 cols */}
          <section className="xl:col-span-6 rounded-2xl border border-[#39413c] bg-[#191d1b] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 border-b border-[#303833] pb-4 mb-4">
                <div>
                  <SectionTitle number="03" title="SPECIAL" />
                  <div className="text-xs text-[#788179] mt-1">
                    Базовый потенциал персонажа: 40 очков бюджета. Кликните по названию для справки.
                  </div>
                </div>
                <div
                  className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-semibold ${
                    remainingPoints >= 0 ? 'border-[#344b3e] bg-[#172019] text-[#8ec59b]' : 'border-[#6a302a] bg-[#271816] text-[#d9776d]'
                  }`}
                >
                  {remainingPoints} / {MAX_SPECIAL_POINT_POOL}
                </div>
              </div>

              <div className="space-y-2.5">
                {STAT_ORDER.map((attr) => {
                  const baseVal = special[attr];
                  const effVal = effectiveSpecial[attr];
                  const mod = getAttributeMod(effVal);
                  const statDetail = SPECIAL_DESCRIPTIONS[attr];
                  const featDiff = effVal - baseVal;

                  return (
                    <div key={attr} className="grid grid-cols-[46px_1fr_auto] items-center gap-3 rounded-xl bg-[#121614] border border-[#2c342f] px-3.5 py-2.5 hover:border-[#434e46] transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-[#202622] border border-[#343d37] flex items-center justify-center text-sm font-bold text-[#d2cec4]">
                        {attr}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveSpecialModal(attr)}
                            className="flex items-center gap-1.5 text-left group"
                          >
                            <span className="text-sm font-semibold text-[#ded9ce] group-hover:text-[#f08a7e] group-hover:underline transition-colors">
                              {statDetail.nameRu}
                            </span>
                            <Info className="w-3.5 h-3.5 text-[#6c766e] group-hover:text-[#f08a7e] transition-colors" />
                          </button>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {featDiff !== 0 && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${featDiff > 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                                {featDiff > 0 ? `+${featDiff} фит` : `${featDiff} фит`}
                              </span>
                            )}
                            <span className="text-[#8e978f] hidden sm:inline">Эффект: {effVal}</span>
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-[#2b312d] overflow-hidden">
                          <div className="h-full rounded-full bg-[#b84d43]" style={{ width: `${Math.min(100, effVal * 10)}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateStat(attr, -1)}
                          disabled={baseVal <= 1}
                          className="w-8 h-8 rounded-lg border border-[#3a433d] bg-[#1b201d] text-[#b9b5ac] hover:border-[#68716a] disabled:opacity-25 transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-12 text-center">
                          <div className="text-base font-bold text-[#eeeae0]">
                            {effVal}
                            {featDiff !== 0 && <span className="text-[10px] text-[#8e978f] ml-0.5">({baseVal})</span>}
                          </div>
                          <div className="text-[9px] text-[#727b74]">
                            {mod >= 0 ? '+' : ''}
                            {mod} мод
                          </div>
                        </div>
                        <button
                          onClick={() => updateStat(attr, 1)}
                          disabled={baseVal >= 10 || remainingPoints <= 0}
                          className="w-8 h-8 rounded-lg border border-[#3a433d] bg-[#1b201d] text-[#b9b5ac] hover:border-[#b84d43] disabled:opacity-25 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2.5 mt-4">
                <Metric label="Здоровье (HP)" value={`${statPreview.hp}`} />
                <Metric label="Макс. AP" value={`${statPreview.ap}`} />
                <Metric label="Переносимый вес" value={`${statPreview.carry} кг`} />
              </div>

              {activeAntiSynergies.length > 0 && (
                <div className="mt-4 rounded-xl border border-[#63342f] bg-[#241817] p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#d4776d]">
                    <ShieldAlert className="w-4 h-4" /> Особые сочетания характеристик
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {activeAntiSynergies.map((item) => (
                      <div key={item.id} className="text-[11px] text-[#aa918c]">
                        {item.nameRu}: {item.descriptionRu}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#2d3530] text-[11px] text-[#727b74]">
              Сумма базовых характеристик: <span className="font-semibold text-[#eeeae0]">{totalCostUsed}</span> / {MAX_SPECIAL_POINT_POOL}
            </div>
          </section>

          {/* Навыки: 6 cols */}
          <section className="xl:col-span-6 rounded-2xl border border-[#39413c] bg-[#191d1b] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#303833] pb-4 mb-3">
                <div>
                  <SectionTitle number="04" title="Навыки и Обучение 1-го уровня" />
                  <div className="text-xs text-[#788179] mt-1">
                    Выберите 3 профильных навыка (+10) и распределите стартовые очки обучения (SP).
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${taggedSkills.length === 3 ? 'bg-[#1b2b20] text-[#78c48a] border-[#2e5239]' : 'bg-[#291a18] text-[#c96055] border-[#522b27]'}`}>
                    {taggedSkills.length}/3 Tagged
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${remainingSp >= 0 ? 'bg-[#1d2720] text-[#86cca0] border-[#31573c]' : 'bg-[#2b1816] text-[#e06d60] border-[#662822]'}`}>
                    {remainingSp} SP
                  </span>
                </div>
              </div>

              {backgroundSkill && (
                <div className="p-2.5 rounded-xl bg-[#241a18] border border-[#51312d] mb-3 flex items-center justify-between text-xs">
                  <span className="text-[#baa8a3]">Обязательный навык предыстории:</span>
                  <span className="font-semibold text-[#f08a7e]">{backgroundSkillName}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-1.5 max-h-[520px] overflow-y-auto pr-1">
                {SKILL_DEFINITIONS.map((skill) => {
                  const selected = taggedSkills.includes(skill.id);
                  const locked = skill.id === backgroundSkill;
                  const curValue = skillValues[skill.id];
                  const invested = skillInvestments[skill.id] || 0;
                  const nextCost = getSkillTrainingCostPerPoint(curValue);

                  return (
                    <div
                      key={skill.id}
                      className={`rounded-xl border p-2.5 transition-all flex items-center justify-between gap-3 ${
                        selected
                          ? 'border-[#8f3f37] bg-[#221816]'
                          : 'border-[#28302b] bg-[#121614] hover:border-[#47524a]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleTagSkill(skill.id)}
                            className="flex items-center gap-1.5 text-left group"
                          >
                            <span className={`text-xs font-semibold ${selected ? 'text-[#eeeae0] underline decoration-[#c95a4f]' : 'text-[#c8c4ba] group-hover:text-[#eeeae0]'}`}>
                              {skill.nameRu}
                            </span>
                          </button>
                          {locked && (
                            <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-[#381a17] text-[#e06d60] border border-[#642d27]">
                              основа
                            </span>
                          )}
                          {selected && !locked && (
                            <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-[#2c1d1a] text-[#f08a7e]">
                              +10 Tagged
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#78837a] mt-0.5 truncate">
                          {skill.description}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Current Skill Value badge */}
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#eeeae0]">{curValue}%</div>
                          <div className="text-[9px] text-[#717a73]">
                            {invested > 0 ? `+${invested} SP` : `${nextCost} SP/п.`}
                          </div>
                        </div>

                        {/* SP Increment Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleInvestSkill(skill.id, -1)}
                            disabled={invested <= 0}
                            className="w-6 h-6 rounded bg-[#1c221e] border border-[#333c36] text-[#b8beb7] disabled:opacity-20 hover:border-[#68736a] flex items-center justify-center text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInvestSkill(skill.id, 1)}
                            disabled={curValue >= 100 || remainingSp < nextCost}
                            className="w-6 h-6 rounded bg-[#1c221e] border border-[#333c36] text-[#b8beb7] disabled:opacity-20 hover:border-[#b84d43] flex items-center justify-center text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#2d3530] flex items-center justify-between text-[11px] text-[#727b74]">
              <span>Пул обучения 1-го уровня: {spentSp} / {totalSpBudget} SP</span>
              <span>Шкала стоимости: &lt;50: 1 SP · 50+: 2 SP · 75+: 3 SP</span>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* BLOCK 04: ПРЕДЫСТОРИЯ                                                     */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#39413c] bg-[#191d1b] p-5 mb-5">
          <div className="border-b border-[#303833] pb-4 mb-4">
            <SectionTitle number="05" title="Предыстория" right="Жизненный опыт персонажа до начала странствий" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {BACKGROUND_DEFINITIONS.map((item) => {
              const selected = item.id === backgroundId;
              const coreSkillDef = SKILL_DEFINITIONS.find((s) => s.id === item.coreSkill);
              const recFeatDef = FEAT_DEFINITIONS.find((f) => f.id === item.recommendedFeat);
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectBackground(item.id)}
                  className={`text-left rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    selected
                      ? 'border-[#b84d43] bg-[#241a18] shadow-[inset_3px_0_0_#b84d43]'
                      : 'border-[#303833] bg-[#121614] hover:border-[#59625b]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className={`text-base font-semibold ${selected ? 'text-[#eeeae0]' : 'text-[#c8c4ba]'}`}>{item.titleRu}</div>
                      {selected && <Check className="w-4 h-4 text-[#c95a4f] shrink-0" />}
                    </div>
                    <p className="mt-2 text-[11.5px] leading-relaxed text-[#89918b] min-h-[58px]">{item.descriptionRu}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#262c28] space-y-1 text-[10.5px]">
                    {item.coreSkill ? (
                      <div className="text-[#c95a4f]">
                        Профильный навык: <span className="font-semibold text-[#ded9ce]">{coreSkillDef?.nameRu}</span>
                      </div>
                    ) : (
                      <div className="text-[#8f9891]">
                        Свободный выбор всех навыков (+2 SP).
                      </div>
                    )}
                    {recFeatDef && (
                      <div className="text-[#858e87]">
                        Рекомендуемый фит: <span className="text-[#aeb5ad]">{recFeatDef.nameRu}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 05: СТАРТОВЫЙ ФИТ                                                   */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#39413c] bg-[#191d1b] p-5 mb-5">
          <div className="flex items-center justify-between border-b border-[#303833] pb-4 mb-4">
            <div>
              <SectionTitle number="06" title="Стартовая особенность (Фит)" />
              <div className="text-xs text-[#788179] mt-1">
                Каждый бонус сопряжен со строгой и соразмерной ценой. Изменения характеристик и навыков сразу отражаются в досье.
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#202622] text-[#c8c4ba] border border-[#333d36]">
              1 выбор
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[540px] overflow-y-auto pr-1">
            {FEAT_DEFINITIONS.map((feat) => {
              const selected = startingFeat === feat.id;
              return (
                <button
                  key={feat.id}
                  onClick={() => setStartingFeat(feat.id)}
                  className={`text-left rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                    selected ? 'border-[#b84d43] bg-[#251b19] shadow-[inset_3px_0_0_#b84d43]' : 'border-[#2e3631] bg-[#121614] hover:border-[#555e57]'
                  }`}
                >
                  <div>
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          selected ? 'bg-[#b84d43] text-white' : 'bg-[#252c28] text-[#7f8981]'
                        }`}
                      >
                        {FEAT_ICON[feat.id] ?? <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-semibold ${selected ? 'text-[#eeeae0]' : 'text-[#ddd8ce]'}`}>{feat.nameRu}</span>
                          {selected && <Check className="w-4 h-4 text-[#d06357] shrink-0" />}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-[#858e87]">{feat.description}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#262c28] space-y-1 text-[10.5px]">
                    <div className="text-[#88b993] font-medium">+ {feat.prosRu.join(' · ')}</div>
                    <div className="text-[#c4776d] font-medium">− {feat.consRu.join(' · ')}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 06: ИТОГОВОЕ ДОСЬЕ                                                  */}
        {/* ========================================================================= */}
        <section className="rounded-2xl border border-[#39413c] bg-[#191d1b] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#303833] pb-3 mb-4">
            <div className="text-xs uppercase font-bold tracking-[0.2em] text-[#b84d43]">Итоговое досье персонажа</div>
            <div className="text-xs text-[#727b74]">Проверьте готовность всех параметров перед выходом в путь</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            <SummaryItem label="Имя & Пол" value={`${name} (${gender === 'female' ? 'Ж' : 'М'})`} />
            <SummaryItem label="Внешность" value={currentAvatarDef.callsignRu} />
            <SummaryItem label="Спутник" value={chosenPet.nameRu} />
            <SummaryItem label="Фит" value={chosenFeat.nameRu} />
            <SummaryItem
              label="SPECIAL"
              value={`S${effectiveSpecial.STR} P${effectiveSpecial.PER} E${effectiveSpecial.END} C${effectiveSpecial.CHA} I${effectiveSpecial.INT} A${effectiveSpecial.AGI} L${effectiveSpecial.LCK}`}
            />
            <SummaryItem
              label="Tagged навыки"
              value={taggedSkills.map((s) => SKILL_DEFINITIONS.find((def) => def.id === s)?.nameRu || s).join(', ')}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-[#303833]">
            <div className="text-xs text-[#89918b]">
              {remainingPoints !== 0 && (
                <span className="text-[#d9776d] font-semibold mr-3">
                  Осталось нераспределенных очков SPECIAL: {remainingPoints}
                </span>
              )}
              {taggedSkills.length !== 3 && (
                <span className="text-[#d9776d] font-semibold mr-3">
                  Нужно выбрать ровно 3 навыка ({taggedSkills.length}/3)
                </span>
              )}
              {remainingPoints === 0 && taggedSkills.length === 3 && (
                <span className="text-[#8ec59b] font-medium">
                  ✓ Все параметры настроены корректно. Персонаж готов к пути.
                </span>
              )}
            </div>

            <button
              onClick={handleFinishCreation}
              disabled={remainingPoints < 0 || taggedSkills.length !== 3 || (!!backgroundSkill && !taggedSkills.includes(backgroundSkill))}
              className="w-full md:w-auto min-w-[280px] rounded-xl bg-[#a9473f] hover:bg-[#bc5148] disabled:bg-[#3a312f] disabled:text-[#706964] text-white font-semibold py-3.5 px-6 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-950/30"
            >
              Подтвердить персонажа и начать
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* MODAL 1: ПОЛНОРАЗМЕРНЫЙ ВЫБОР АВАТАРОВ (12M + 12F)                        */}
        {/* ========================================================================= */}
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 md:p-8 overflow-y-auto flex items-center justify-center">
            <div className="max-w-5xl w-full rounded-2xl border border-[#4a514c] bg-[#171b19] shadow-2xl p-5 md:p-7 max-h-[90vh] flex flex-col">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2d3530]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-[#b84d43]">Личное дело: Фоторобот</div>
                  <h2 className="text-2xl font-bold text-[#eeeae0] mt-1">Выбор внешности персонажа</h2>
                  <p className="text-xs text-[#89918b] mt-0.5">Выберите образ, соответствующий характеру вашего странника.</p>
                </div>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 rounded-lg border border-[#3a433d] text-[#aeb5ae] hover:border-[#677069] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Gender Switch inside Avatar Modal */}
              <div className="flex items-center gap-2 py-4">
                <button
                  type="button"
                  onClick={() => handleGenderChange('male')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    gender === 'male'
                      ? 'border-[#b84d43] bg-[#281b19] text-[#eeeae0]'
                      : 'border-[#303833] bg-[#121614] text-[#8e9890] hover:border-[#525b54]'
                  }`}
                >
                  Мужские образы (12)
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange('female')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    gender === 'female'
                      ? 'border-[#b84d43] bg-[#281b19] text-[#eeeae0]'
                      : 'border-[#303833] bg-[#121614] text-[#8e9890] hover:border-[#525b54]'
                  }`}
                >
                  Женские образы (12)
                </button>
              </div>

              {/* Grid of Avatars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto pr-1 flex-1 py-1">
                {AVATAR_OPTIONS.filter((a) => a.gender === gender).map((av) => {
                  const isSel = avatarId === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setAvatarId(av.id);
                        setShowAvatarModal(false);
                      }}
                      className={`text-left rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                        isSel
                          ? 'border-[#b84d43] bg-[#271b19] shadow-[inset_3px_0_0_#b84d43]'
                          : 'border-[#2d3530] bg-[#121614] hover:border-[#525d55]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[#202622] border border-[#39423b] flex items-center justify-center text-xs font-bold text-[#f08a7e]">
                            {av.badge}
                          </div>
                          {isSel && <Check className="w-4 h-4 text-[#c95a4f]" />}
                        </div>
                        <div className="text-sm font-semibold text-[#eeeae0]">{av.nameRu}</div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-[#8a948c]">{av.descriptionRu}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#242b26] text-[10px] uppercase tracking-wider text-[#6e7770]">
                        Позывной: {av.callsignRu}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#2d3530] flex items-center justify-between">
                <div className="text-xs text-[#778078]">Выбран: {currentAvatarDef.nameRu}</div>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#b84d43] hover:bg-[#c95a4f] text-white text-xs font-semibold transition-colors"
                >
                  Подтвердить выбор
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: ПОДРОБНОЕ ОПИСАНИЕ ХАРАКТЕРИСТИКИ SPECIAL                        */}
        {/* ========================================================================= */}
        {activeSpecialModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center">
            <div className="max-w-xl w-full rounded-2xl border border-[#4a514c] bg-[#171b19] shadow-2xl p-6">
              {(() => {
                const item = SPECIAL_DESCRIPTIONS[activeSpecialModal];
                return (
                  <div>
                    <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#2d3530]">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#b84d43]">Справка SPECIAL</div>
                        <h2 className="text-2xl font-bold text-[#eeeae0] mt-1">{item.nameRu} ({item.id})</h2>
                        <div className="text-xs text-[#b58b84] mt-0.5">{item.headlineRu}</div>
                      </div>
                      <button
                        onClick={() => setActiveSpecialModal(null)}
                        className="p-1.5 rounded-lg border border-[#3a433d] text-[#aeb5ae] hover:border-[#677069]"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-[#c2bdb2]">
                      {item.descriptionRu}
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-[#121614] border border-[#2d3530]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#b84d43] mb-2">
                        Влияние на производные параметры
                      </div>
                      <ul className="space-y-1 text-xs text-[#a6b0a7]">
                        {item.derivedEffectsRu.map((eff, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#b84d43]">•</span>
                            <span>{eff}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#121614] border border-[#2d3530]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#88b993] mb-1">
                          Ключевые навыки (Primary)
                        </div>
                        <div className="text-[11px] text-[#ccd3cc]">
                          {item.governedSkillsRu.primary.length > 0 ? item.governedSkillsRu.primary.join(', ') : 'Нет прямых'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#121614] border border-[#2d3530]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#89918b] mb-1">
                          Вторичные навыки (Secondary)
                        </div>
                        <div className="text-[11px] text-[#a0aaa1]">
                          {item.governedSkillsRu.secondary.length > 0 ? item.governedSkillsRu.secondary.join(', ') : 'Нет'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveSpecialModal(null)}
                      className="w-full mt-5 py-2.5 rounded-xl bg-[#281b19] border border-[#b84d43]/60 hover:bg-[#331f1d] text-xs font-semibold text-[#f08a7e] transition-colors"
                    >
                      Понятно
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: ГОТОВЫЕ АРХЕТИПЫ                                                 */}
        {/* ========================================================================= */}
        {showArchetypes && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 md:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto rounded-2xl border border-[#4a514c] bg-[#171b19] shadow-2xl p-5 md:p-7">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-[#b84d43]">Старт без ручной сборки</div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[#eeeae0] mt-1">Готовые персонажи</h2>
                  <p className="text-sm text-[#89918b] mt-1">Выберите героя с готовыми характеристиками, навыками и перком — и сразу начните игру.</p>
                </div>
                <button onClick={() => setShowArchetypes(false)} className="px-3 py-2 rounded-lg border border-[#3a433d] text-[#aeb5ae] hover:border-[#677069]">Закрыть</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {ARCHETYPE_PRESETS.map((preset) => (
                  <div key={preset.id} className="rounded-xl border border-[#303833] bg-[#101412] p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-base font-semibold text-[#eeeae0]">{preset.titleRu}</div>
                      <div className="text-[10px] uppercase tracking-wider text-[#737c75] mt-1">{preset.subtitleRu}</div>
                      <p className="text-[11px] leading-relaxed text-[#8f9891] mt-3 min-h-[70px]">{preset.descriptionRu}</p>
                      <div className="mt-3 text-[10px] text-[#aaa9a0]">Предыстория: {BACKGROUND_DEFINITIONS.find((b) => b.id === preset.backgroundId)?.titleRu}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {preset.taggedSkills.map((id) => (
                          <span key={id} className="px-2 py-1 rounded bg-[#202622] text-[9px] text-[#b8beb7]">
                            {SKILL_DEFINITIONS.find((s) => s.id === id)?.nameRu}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 text-[10px] text-[#d08a7f]">Перк: {FEAT_DEFINITIONS.find((f) => f.id === preset.startingFeat)?.nameRu}</div>
                    </div>
                    <button
                      onClick={() => startArchetype(preset.id)}
                      className="w-full mt-4 rounded-lg bg-[#a9473f] hover:bg-[#bc5148] text-white text-xs font-semibold py-2.5 transition-colors"
                    >
                      НАЧАТЬ ИГРУ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-[9px] uppercase tracking-[0.22em] text-[#505852]">
          СИСТЕМА ЛИЧНОГО ДЕЛА · СЕКТОР 04 · ВЕРСИЯ ПЕРСОНАЖА 0.4.7.0
        </div>
      </div>
    </main>
  );
};

const SectionTitle: React.FC<{ number: string; title: string; right?: string }> = ({ number, title, right }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-bold tracking-widest text-[#b84d43]">{number}</span>
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#e1ddd3]">{title}</h2>
    </div>
    {right && <span className="text-[9px] uppercase tracking-wider text-[#69726b]">{right}</span>}
  </div>
);

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl bg-[#121614] border border-[#2d3530] px-3 py-2 text-center">
    <div className="text-[9px] uppercase tracking-wider text-[#69726b] truncate">{label}</div>
    <div className="mt-0.5 text-sm font-bold text-[#ddd8ce]">{value}</div>
  </div>
);

const SummaryItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl bg-[#121614] border border-[#2d3530] p-3">
    <div className="text-[9px] uppercase tracking-wider text-[#737c75]">{label}</div>
    <div className="mt-1 text-xs font-semibold text-[#ded9ce] truncate" title={value}>
      {value}
    </div>
  </div>
);
