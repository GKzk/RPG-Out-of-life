import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { SpecialStats, SkillName, SpecialAttribute } from '../types/game';
import {
  MAX_SPECIAL_POINT_POOL,
  getTotalPointCost,
  getActiveAntiSynergies,
} from '../utils/statCalculations';
import { ARCHETYPE_PRESETS } from '../data/archetypes';
import { SKILL_DEFINITIONS } from '../data/skills';
import { FEAT_DEFINITIONS } from '../data/feats';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';

const SPECIAL_NAMES: Record<SpecialAttribute, { ru: string; desc: string }> = {
  STR: { ru: 'Сила (STR)', desc: 'Физическая мощь, урон ближнего боя и переносимый вес.' },
  PER: { ru: 'Восприятие (PER)', desc: 'Меткость стрельбы, обнаружение засад и ловушек, инициатива.' },
  END: { ru: 'Выносливость (END)', desc: 'Запас здоровья (HP), устойчивость к радиации и ядам.' },
  CHA: { ru: 'Харизма (CHA)', desc: 'Сила убеждения, торговля и мирное решение конфликтов.' },
  INT: { ru: 'Интеллект (INT)', desc: 'Прирост очков навыков, медицина, наука и ремонт.' },
  AGI: { ru: 'Ловкость (AGI)', desc: 'Очки действий (AP) в бою, уклонение (Evasion) и скрытность.' },
  LCK: { ru: 'Удача (LCK)', desc: 'Шанс критического удара, случайно найденный лут и перебросы.' },
};

export const CharacterCreation: React.FC = () => {
  const { createCharacter } = useGame();

  const [name, setName] = useState('Алекс «Призрак»');
  const [background, setBackground] = useState('Выживший из Убежища');
  const [special, setSpecial] = useState<SpecialStats>({
    STR: 5,
    PER: 5,
    END: 5,
    CHA: 5,
    INT: 5,
    AGI: 5,
    LCK: 5,
  });

  const [taggedSkills, setTaggedSkills] = useState<SkillName[]>(['smallGuns', 'speech', 'survival']);
  const [startingFeat, setStartingFeat] = useState<string>('sniper_eye');

  // Point calculations
  const totalCostUsed = getTotalPointCost(special);
  const remainingPoints = MAX_SPECIAL_POINT_POOL - totalCostUsed;

  // Active anti-synergies
  const activeAntiSynergies = getActiveAntiSynergies(special);

  // Load archetype preset
  const handleSelectPreset = (presetId: string) => {
    const preset = ARCHETYPE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSpecial({ ...preset.special });
    setTaggedSkills([...preset.taggedSkills]);
    setStartingFeat(preset.startingFeat);
  };

  // Adjust stat with soft caps check
  const updateStat = (attr: SpecialAttribute, delta: number) => {
    const currentVal = special[attr];
    const newVal = currentVal + delta;
    if (newVal < 1 || newVal > 10) return;

    // Check point cost if increasing
    if (delta > 0) {
      const nextTotalCost = getTotalPointCost({ ...special, [attr]: newVal });
      if (nextTotalCost > MAX_SPECIAL_POINT_POOL) return;
    }

    setSpecial((prev) => ({ ...prev, [attr]: newVal }));
  };

  // Toggle Tagged Skills (Max 3)
  const toggleTagSkill = (skillId: SkillName) => {
    if (taggedSkills.includes(skillId)) {
      setTaggedSkills(taggedSkills.filter((s) => s !== skillId));
    } else {
      if (taggedSkills.length >= 3) return;
      setTaggedSkills([...taggedSkills, skillId]);
    }
  };

  const handleFinishCreation = () => {
    if (taggedSkills.length < 3) {
      alert('Выберите ровно 3 ключевых навыка!');
      return;
    }
    createCharacter(name, background, special, taggedSkills, startingFeat);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-mono text-amber-300">
      {/* Creation Banner */}
      <div className="bg-neutral-900 border border-amber-500/40 p-6 rounded-lg mb-6 shadow-xl shadow-amber-950/20">
        <div className="flex items-center gap-3 mb-2 text-amber-400">
          <Award className="w-8 h-8 text-amber-500" />
          <h1 className="text-2xl font-bold tracking-tight">СОЗДАНИЕ ПЕРСОНАЖА ПУСТОШИ</h1>
        </div>
        <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
          В этом жестоком мире <strong className="text-amber-300">нельзя быть хорошим во всём</strong>. Выберите специализацию. 
          Повышение характеристик выше 7 обойдется дороже, а экстремальные билды (например, физическая масса)
          накладывают <span className="text-red-400 font-bold">жёсткие штрафы анти-синергии</span> на противоположные параметры.
        </p>

        {/* Archetype Quick Presets */}
        <div className="mt-5 pt-4 border-t border-neutral-800">
          <label className="text-xs uppercase text-amber-500/80 font-bold tracking-wider block mb-2">
            Готовые архетипы выживших:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ARCHETYPE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className="bg-neutral-950/80 border border-amber-500/30 hover:border-amber-400 p-3 rounded text-left transition-all hover:bg-neutral-800/80 group"
              >
                <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">{preset.titleRu}</div>
                <div className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{preset.subtitleRu}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: SPECIAL Allocation & Anti-Synergies */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity Info */}
          <div className="bg-neutral-900 border border-amber-500/30 p-5 rounded-lg space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-neutral-800 pb-2">
              1. Имя и Происхождение
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Имя выжившего:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-amber-500/40 rounded px-3 py-1.5 text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Предыстория:</label>
                <input
                  type="text"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full bg-neutral-950 border border-amber-500/40 rounded px-3 py-1.5 text-sm text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* SPECIAL Allocation */}
          <div className="bg-neutral-900 border border-amber-500/30 p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                2. Распределение SPECIAL
              </h2>
              <div className="text-xs bg-amber-500/10 border border-amber-500/40 px-3 py-1 rounded text-amber-300 font-bold">
                Осталось очков: <span className={remainingPoints < 0 ? 'text-red-400' : 'text-emerald-400'}>{remainingPoints}</span> / {MAX_SPECIAL_POINT_POOL}
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded border border-neutral-800">
              <span className="text-amber-400 font-semibold">Мягкий Кап:</span> Значения 1–6 стоят по 1 очку за уровень; 7 стоит 7, 8 — 10, 9 — 14, 10 — 19 очков.
            </div>

            {/* Stats list */}
            <div className="space-y-3 pt-2">
              {(Object.keys(special) as SpecialAttribute[]).map((attr) => {
                const val = special[attr];
                const info = SPECIAL_NAMES[attr];
                const isHigh = val >= 8;

                return (
                  <div key={attr} className="bg-neutral-950/80 border border-neutral-800 p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-700">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isHigh ? 'text-amber-200' : 'text-neutral-200'}`}>
                          {info.ru}
                        </span>
                        {val >= 8 && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                            Высокая специализация
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400">{info.desc}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => updateStat(attr, -1)}
                        disabled={val <= 1}
                        className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 rounded text-amber-300 font-bold flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-base font-bold text-amber-300">{val}</span>
                      <button
                        onClick={() => updateStat(attr, 1)}
                        disabled={val >= 10 || remainingPoints <= 0}
                        className="w-7 h-7 bg-amber-600/80 hover:bg-amber-500 disabled:opacity-30 border border-amber-500 rounded text-neutral-950 font-bold flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Anti-Synergies Banner */}
          {activeAntiSynergies.length > 0 && (
            <div className="bg-red-950/40 border border-red-500/60 p-4 rounded-lg space-y-2 text-red-200">
              <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                <span>ОБНАРУЖЕНЫ АНТИ-СИНЕРГИИ (ШТРАФЫ ЭКСТРЕМАЛЬНОГО БИЛДА):</span>
              </div>
              <div className="space-y-2 pt-1 text-xs">
                {activeAntiSynergies.map((penalty) => (
                  <div key={penalty.id} className="bg-red-900/30 p-2.5 rounded border border-red-800">
                    <div className="font-semibold text-red-300">{penalty.nameRu} ({penalty.reason})</div>
                    <div className="text-neutral-300 text-[11px] mt-0.5">{penalty.descriptionRu}</div>
                    <div className="text-red-400 font-mono text-[11px] font-bold mt-1">
                      Штрафы к параметрам: {Object.entries(penalty.penalties).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Skills, Feat & Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tagged Skills */}
          <div className="bg-neutral-900 border border-amber-500/30 p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                3. Ключевые навыки (+20 Бонус)
              </h2>
              <div className="text-xs text-amber-300">
                Выбрано: <span className="font-bold">{taggedSkills.length}</span>/3
              </div>
            </div>

            <p className="text-[11px] text-neutral-400">
              Выберите ровно 3 ключевых навыка, в которых вы особенно натасканы с начала игры.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {SKILL_DEFINITIONS.map((skill) => {
                const isTagged = taggedSkills.includes(skill.id);

                return (
                  <button
                    key={skill.id}
                    onClick={() => toggleTagSkill(skill.id)}
                    className={`p-2 rounded text-left border text-xs transition-all flex items-center justify-between ${
                      isTagged
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{skill.nameRu}</div>
                      <div className="text-[10px] text-neutral-500">[{skill.primaryAttr}]</div>
                    </div>
                    {isTagged && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starting Feat */}
          <div className="bg-neutral-900 border border-amber-500/30 p-5 rounded-lg space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-neutral-800 pb-2">
              4. Стартовый Фит (Feat)
            </h2>

            <p className="text-[11px] text-neutral-400">
              Каждый фит дает сильное преимущество, но несет существенную цену или плату за выбор.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {FEAT_DEFINITIONS.map((feat) => {
                const isSelected = startingFeat === feat.id;

                return (
                  <div
                    key={feat.id}
                    onClick={() => setStartingFeat(feat.id)}
                    className={`p-3 rounded border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 text-amber-200 shadow'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1 text-sm">
                      <span className={isSelected ? 'text-amber-300' : 'text-neutral-300'}>
                        {feat.nameRu}
                      </span>
                      {isSelected && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">ВЫБРАНО</span>}
                    </div>
                    <p className="text-[11px] text-neutral-400 mb-2">{feat.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="text-emerald-400 bg-emerald-950/30 p-1.5 rounded border border-emerald-900/40">
                        <span className="font-semibold block mb-0.5">Плюсы:</span>
                        {feat.prosRu.map((p, i) => (
                          <div key={i}>+ {p}</div>
                        ))}
                      </div>
                      <div className="text-red-400 bg-red-950/30 p-1.5 rounded border border-red-900/40">
                        <span className="font-semibold block mb-0.5">Минусы:</span>
                        {feat.consRu.map((c, i) => (
                          <div key={i}>- {c}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Finish Button */}
          <button
            onClick={handleFinishCreation}
            disabled={remainingPoints < 0 || taggedSkills.length < 3}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-neutral-950 font-bold py-4 px-6 rounded-lg shadow-lg text-center flex items-center justify-center gap-2 text-base transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span>НАЧАТЬ ПУТЕШЕСТВИЕ ПО ПУСТОШИ</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
