import React, { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { SpecialStats, SkillName, SpecialAttribute } from '../types/game';
import { MAX_SPECIAL_POINT_POOL, getTotalPointCost, getActiveAntiSynergies } from '../utils/statCalculations';
import { getAttributeMod, getMaxAP } from '../utils/characterSystem';
import { ARCHETYPE_PRESETS } from '../data/archetypes';
import { BACKGROUND_DEFINITIONS } from '../data/backgrounds';
import { SKILL_DEFINITIONS } from '../data/skills';
import { FEAT_DEFINITIONS } from '../data/feats';
import { PET_DEFINITIONS } from '../data/pets';
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
} from 'lucide-react';

const SPECIAL_NAMES: Record<SpecialAttribute, { ru: string; short: string }> = {
  STR: { ru: 'Сила', short: 'Физика и ближний бой' },
  PER: { ru: 'Восприятие', short: 'Меткость и наблюдение' },
  END: { ru: 'Выносливость', short: 'Живучесть и сопротивление' },
  CHA: { ru: 'Харизма', short: 'Диалоги и торговля' },
  INT: { ru: 'Интеллект', short: 'Знания и техника' },
  AGI: { ru: 'Ловкость', short: 'AP, уклонение и скрытность' },
  LCK: { ru: 'Удача', short: 'Критические события' },
};

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
};

interface AvatarOption {
  id: string;
  nameRu: string;
  gender: 'male' | 'female';
  badge: string;
}

const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'm1', nameRu: 'Следопыт', gender: 'male', badge: 'СЛЕД' },
  { id: 'm2', nameRu: 'Ветеран', gender: 'male', badge: 'ВЕТ' },
  { id: 'm3', nameRu: 'Бродяга', gender: 'male', badge: 'БРОД' },
  { id: 'm4', nameRu: 'Разведчик', gender: 'male', badge: 'РАЗВ' },
  { id: 'f1', nameRu: 'Охотница', gender: 'female', badge: 'ОХОТ' },
  { id: 'f2', nameRu: 'Санитар', gender: 'female', badge: 'САН' },
  { id: 'f3', nameRu: 'Механик', gender: 'female', badge: 'ТЕХ' },
  { id: 'f4', nameRu: 'Стрелок', gender: 'female', badge: 'СТР' },
];

export const CharacterCreation: React.FC = () => {
  const { createCharacter, loadPresetCharacter } = useGame();

  const [name, setName] = useState('Алекс');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [avatarId, setAvatarId] = useState('m1');
  const [petId, setPetId] = useState('hound');
  const [backgroundId, setBackgroundId] = useState('none');
  const [showArchetypes, setShowArchetypes] = useState(false);
  const [special, setSpecial] = useState<SpecialStats>({
    STR: 5, PER: 5, END: 5, CHA: 5, INT: 5, AGI: 5, LCK: 5,
  });
  const [taggedSkills, setTaggedSkills] = useState<SkillName[]>(['survival', 'navigation', 'sleightOfHand']);
  const [startingFeat, setStartingFeat] = useState('hard_life');

  const background = BACKGROUND_DEFINITIONS.find((item) => item.id === backgroundId) ?? BACKGROUND_DEFINITIONS[0];
  const totalCostUsed = getTotalPointCost(special);
  const remainingPoints = MAX_SPECIAL_POINT_POOL - totalCostUsed;
  const activeAntiSynergies = getActiveAntiSynergies(special);

  const backgroundSkill = background.coreSkill;
  const backgroundSkillName = SKILL_DEFINITIONS.find((s) => s.id === backgroundSkill)?.nameRu ?? backgroundSkill;

  const statPreview = useMemo(() => ({
    ap: getMaxAP(special.AGI),
    carry: special.STR * 6 + 25,
  }), [special]);

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
    setStartingFeat(next.recommendedFeat);
    setTaggedSkills((current) => current.includes(next.coreSkill) ? current : [...current.slice(0, 2), next.coreSkill]);
  };

  const startArchetype = (presetId: string) => {
    const preset = ARCHETYPE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    loadPresetCharacter(presetId, preset.titleRu.split(' — ')[0]);
  };

  const updateStat = (attr: SpecialAttribute, delta: number) => {
    const next = special[attr] + delta;
    if (next < 1 || next > 10) return;
    if (delta > 0 && getTotalPointCost({ ...special, [attr]: next }) > MAX_SPECIAL_POINT_POOL) return;
    setSpecial((prev) => ({ ...prev, [attr]: next }));
  };

  const toggleTagSkill = (skillId: SkillName) => {
    if (skillId === backgroundSkill) return;
    if (taggedSkills.includes(skillId)) {
      setTaggedSkills(taggedSkills.filter((s) => s !== skillId));
      return;
    }
    if (taggedSkills.length >= 3) return;
    setTaggedSkills([...taggedSkills, skillId]);
  };

  const handleFinishCreation = () => {
    if (taggedSkills.length !== 3 || !taggedSkills.includes(backgroundSkill) || remainingPoints < 0) return;
    createCharacter(
      name.trim() || 'Алекс',
      background.titleRu,
      special,
      taggedSkills,
      startingFeat,
      gender,
      avatarId,
      petId,
      background.id
    );
  };

  const currentAvatars = AVATAR_OPTIONS.filter((a) => a.gender === gender);

  return (
    <main className="min-h-screen bg-[#111312] text-[#e6e2d8]">
      <div className="max-w-7xl mx-auto px-4 py-5 md:px-6 md:py-8">
        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl border border-[#39413c] bg-[#191d1b] shadow-2xl mb-5">
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(#d7d0c2 1px, transparent 1px), linear-gradient(90deg, #d7d0c2 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
          <div className="relative p-5 md:p-7 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#b84d43] text-[11px] font-bold tracking-[0.24em] uppercase mb-2">
                <span className="w-8 h-px bg-[#b84d43]" /> ЛИЧНОЕ ДЕЛО · 001
              </div>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#eeeae0]">ЛИЧНОЕ ДЕЛО</h1>
            </div>
            <button
              onClick={() => setShowArchetypes(true)}
              className="rounded-xl border border-[#6b413b] bg-[#241a18] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#d8c9c0] hover:border-[#b84d43] transition-colors"
            >
              Готовые персонажи
            </button>
          </div>
        </header>

        {/* Identity + Background */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-5">
          <div className="xl:col-span-4 rounded-2xl border border-[#39413c] bg-[#191d1b] p-5 flex flex-col justify-between">
            <div>
              <SectionTitle number="01" title="Личность" />
              
              <label className="block text-[11px] text-[#89918b] uppercase tracking-wider mb-1.5 mt-3">Имя</label>
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

              {/* Gender selection */}
              <label className="block text-[11px] text-[#89918b] uppercase tracking-wider mb-1.5 mt-3">Пол</label>
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

              {/* Avatar selection */}
              <label className="block text-[11px] text-[#89918b] uppercase tracking-wider mb-1.5 mt-3">Внешность</label>
              <div className="grid grid-cols-4 gap-2">
                {currentAvatars.map((av) => {
                  const isSel = avatarId === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarId(av.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isSel
                          ? 'border-[#b84d43] bg-[#281c1a] text-[#eeeae0]'
                          : 'border-[#2d3530] bg-[#121614] text-[#788179] hover:border-[#59625b]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#202622] flex items-center justify-center text-[10px] font-bold text-[#d2cec4] mb-1">
                        {av.badge}
                      </div>
                      <span className="text-[10px] truncate max-w-full">{av.nameRu}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#121614] border border-[#2d3530]">
              <div className="text-[10px] uppercase tracking-widest text-[#68716b]">Предыстория</div>
              <div className="mt-1 text-sm font-medium text-[#e6e2d8]">{background.titleRu}</div>
              <div className="mt-1 text-xs text-[#879089]">{background.subtitleRu}</div>
            </div>
          </div>

          <div className="xl:col-span-8 rounded-2xl border border-[#39413c] bg-[#191d1b] p-5">
            <SectionTitle number="02" title="Предыстория" right="Выберите основу" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
              {BACKGROUND_DEFINITIONS.map((item) => {
                const selected = item.id === backgroundId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectBackground(item.id)}
                    className={`text-left rounded-xl border p-3.5 transition-all ${
                      selected
                        ? 'border-[#b84d43] bg-[#241a18] shadow-[inset_3px_0_0_#b84d43]'
                        : 'border-[#303833] bg-[#121614] hover:border-[#59625b]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className={`text-sm font-medium ${selected ? 'text-[#eeeae0]' : 'text-[#c8c4ba]'}`}>{item.titleRu}</div>
                      {selected && <Check className="w-4 h-4 text-[#c95a4f] shrink-0" />}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-[#6f7871]">{item.subtitleRu}</div>
                    <p className="mt-2 text-[11px] leading-relaxed text-[#89918b]">{item.descriptionRu}</p>
                    <div className="mt-3 text-[10px] text-[#c95a4f]">
                      Основной навык: <span className="text-[#b9b5ac]">{SKILL_DEFINITIONS.find((s) => s.id === item.coreSkill)?.nameRu ?? item.coreSkill}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section: Pet Companion */}
        <section className="rounded-2xl border border-[#39413c] bg-[#191d1b] p-5 mb-5">
          <SectionTitle number="03" title="Спутник-питомец" right="Выбор напарника при пробуждении" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            {PET_DEFINITIONS.map((pet) => {
              const selected = petId === pet.id;
              const PetIcon = pet.iconName === 'Dog' ? Dog : pet.iconName === 'Cat' ? Cat : pet.iconName === 'Bird' ? Bird : UserX;
              return (
                <button
                  key={pet.id}
                  onClick={() => setPetId(pet.id)}
                  className={`text-left rounded-xl border p-3.5 transition-all ${
                    selected
                      ? 'border-[#b84d43] bg-[#241a18] shadow-[inset_3px_0_0_#b84d43]'
                      : 'border-[#303833] bg-[#121614] hover:border-[#59625b]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      selected ? 'bg-[#b84d43] text-white' : 'bg-[#252c28] text-[#9ca49d]'
                    }`}>
                      <PetIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm font-medium ${selected ? 'text-[#eeeae0]' : 'text-[#c8c4ba]'}`}>{pet.nameRu}</span>
                        {selected && <Check className="w-4 h-4 text-[#c95a4f] shrink-0" />}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-[#727b74] mt-0.5">{pet.speciesRu}</div>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-[#89918b]">{pet.descriptionRu}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Archetypes Modal */}
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
                        {preset.taggedSkills.map(id => (
                          <span key={id} className="px-2 py-1 rounded bg-[#202622] text-[9px] text-[#b8beb7]">
                            {SKILL_DEFINITIONS.find(s => s.id === id)?.nameRu}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 text-[10px] text-[#d08a7f]">Перк: {FEAT_DEFINITIONS.find(f => f.id === preset.startingFeat)?.nameRu}</div>
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

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Stats */}
          <section className="xl:col-span-7 rounded-2xl border border-[#39413c] bg-[#191d1b] p-5">
            <div className="flex items-center justify-between gap-4 border-b border-[#303833] pb-4 mb-4">
              <div>
                <SectionTitle number="04" title="SPECIAL" />
                <div className="text-xs text-[#788179] mt-1">Распределите 28 очков по шкале Point Buy. Значение 8+ требует специализации.</div>
              </div>
              <div className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-semibold ${remainingPoints >= 0 ? 'border-[#344b3e] bg-[#172019] text-[#8ec59b]' : 'border-[#6a302a] bg-[#271816] text-[#d9776d]'}`}>
                {remainingPoints} / {MAX_SPECIAL_POINT_POOL}
              </div>
            </div>

            <div className="space-y-2">
              {STAT_ORDER.map((attr) => {
                const val = special[attr];
                const mod = getAttributeMod(val);
                return (
                  <div key={attr} className="grid grid-cols-[46px_1fr_auto] items-center gap-3 rounded-xl bg-[#121614] border border-[#2c342f] px-3 py-2.5">
                    <div className="w-10 h-10 rounded-lg bg-[#202622] border border-[#343d37] flex items-center justify-center text-sm font-bold text-[#d2cec4]">{attr}</div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-[#ded9ce]">{SPECIAL_NAMES[attr].ru}</span>
                        <span className="text-[10px] text-[#737c75] hidden sm:block">{SPECIAL_NAMES[attr].short}</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-[#2b312d] overflow-hidden">
                        <div className="h-full rounded-full bg-[#9b4b43]" style={{ width: `${val * 10}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateStat(attr, -1)} disabled={val <= 1} className="w-8 h-8 rounded-lg border border-[#3a433d] bg-[#1b201d] text-[#b9b5ac] hover:border-[#68716a] disabled:opacity-25 transition-colors">−</button>
                      <div className="w-10 text-center">
                        <div className="text-lg font-semibold text-[#eeeae0]">{val}</div>
                        <div className="text-[9px] text-[#727b74]">{mod >= 0 ? '+' : ''}{mod}</div>
                      </div>
                      <button onClick={() => updateStat(attr, 1)} disabled={val >= 10 || remainingPoints <= 0} className="w-8 h-8 rounded-lg border border-[#3a433d] bg-[#1b201d] text-[#b9b5ac] hover:border-[#b84d43] disabled:opacity-25 transition-colors">+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Metric label="Макс. AP" value={String(statPreview.ap)} />
              <Metric label="Переносимый вес" value={`${statPreview.carry} кг`} />
            </div>

            {activeAntiSynergies.length > 0 && (
              <div className="mt-4 rounded-xl border border-[#63342f] bg-[#241817] p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#d4776d]">
                  <ShieldAlert className="w-4 h-4" /> Особые сочетания характеристик
                </div>
                <div className="mt-2 space-y-1.5">
                  {activeAntiSynergies.map((item) => (
                    <div key={item.id} className="text-[11px] text-[#aa918c]">{item.nameRu}: {item.descriptionRu}</div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Skills + Feats */}
          <div className="xl:col-span-5 space-y-5">
            <section className="rounded-2xl border border-[#39413c] bg-[#191d1b] p-5">
              <div className="flex items-center justify-between border-b border-[#303833] pb-4 mb-4">
                <SectionTitle number="05" title="Навыки" />
                <span className="text-[10px] text-[#7d867f]">{taggedSkills.length}/3</span>
              </div>
              <div className="p-3 rounded-xl bg-[#241a18] border border-[#51312d] mb-3">
                <div className="text-[10px] uppercase tracking-wider text-[#a85a50]">Зависимость от предыстории</div>
                <div className="mt-1 text-xs text-[#c9c0b8]">
                  {background.titleRu} → обязательный навык: <span className="font-semibold text-[#eeeae0]">{backgroundSkillName}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[390px] overflow-y-auto pr-1">
                {SKILL_DEFINITIONS.map((skill) => {
                  const selected = taggedSkills.includes(skill.id);
                  const locked = skill.id === backgroundSkill;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleTagSkill(skill.id)}
                      className={`text-left rounded-xl border p-2.5 transition-colors ${
                        selected ? 'border-[#a04c44] bg-[#251b19]' : 'border-[#2e3631] bg-[#121614] hover:border-[#555e57]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-medium ${selected ? 'text-[#e8ddd4]' : 'text-[#aaa9a0]'}`}>{skill.nameRu}</span>
                        {locked && <span className="text-[9px] uppercase text-[#c05b50]">основа</span>}
                      </div>
                      <div className="mt-1 text-[9px] uppercase tracking-wider text-[#667069]">{skill.primaryAttr}{skill.secondaryAttr ? ` + ${skill.secondaryAttr}` : ''}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-[#39413c] bg-[#191d1b] p-5">
              <div className="flex items-center justify-between border-b border-[#303833] pb-4 mb-4">
                <SectionTitle number="06" title="Стартовый перк" />
                <span className="text-[10px] text-[#7d867f]">1 выбор</span>
              </div>
              <div className="space-y-2 max-h-[390px] overflow-y-auto pr-1">
                {FEAT_DEFINITIONS.map((feat) => {
                  const selected = startingFeat === feat.id;
                  return (
                    <button
                      key={feat.id}
                      onClick={() => setStartingFeat(feat.id)}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${
                        selected ? 'border-[#b84d43] bg-[#251b19]' : 'border-[#2e3631] bg-[#121614] hover:border-[#555e57]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          selected ? 'bg-[#b84d43] text-white' : 'bg-[#252c28] text-[#7f8981]'
                        }`}>
                          {FEAT_ICON[feat.id] ?? <Sparkles className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-[#ddd8ce]">{feat.nameRu}</span>
                            {selected && <Check className="w-4 h-4 text-[#d06357]" />}
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed text-[#858e87]">{feat.description}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                            <div className="text-[#88b993]">+ {feat.prosRu.join(' · ')}</div>
                            <div className="text-[#c4776d]">− {feat.consRu.join(' · ')}</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {/* Finish */}
        <section className="mt-5 rounded-2xl border border-[#39413c] bg-[#191d1b] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#6e7770]">Проверка досье</div>
            <div className="mt-1 text-sm text-[#c9c5bb]">
              {name} · {gender === 'female' ? 'Женщина' : 'Мужчина'} · {background.titleRu} · {backgroundSkillName} · {taggedSkills.length}/3 навыка · {remainingPoints} очков
            </div>
          </div>
          <button
            onClick={handleFinishCreation}
            disabled={remainingPoints < 0 || taggedSkills.length !== 3 || !taggedSkills.includes(backgroundSkill)}
            className="w-full md:w-auto min-w-[260px] rounded-xl bg-[#a9473f] hover:bg-[#bc5148] disabled:bg-[#3a312f] disabled:text-[#706964] text-white font-semibold py-3.5 px-6 flex items-center justify-center gap-2 transition-colors"
          >
            Подтвердить персонажа
            <ChevronRight className="w-5 h-5" />
          </button>
        </section>

        <div className="mt-3 text-center text-[9px] uppercase tracking-[0.22em] text-[#505852]">
          СИСТЕМА ЛИЧНОГО ДЕЛА · СЕКТОР 04 · ВЕРСИЯ ПЕРСОНАЖА 0.4.5.7
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
  <div className="rounded-xl bg-[#121614] border border-[#2d3530] px-3 py-2.5">
    <div className="text-[9px] uppercase tracking-wider text-[#69726b]">{label}</div>
    <div className="mt-0.5 text-sm font-semibold text-[#ddd8ce]">{value}</div>
  </div>
);
