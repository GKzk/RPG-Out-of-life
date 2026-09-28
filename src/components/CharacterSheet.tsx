import React from 'react';
import { useGame } from '../context/GameContext';
import { SpecialAttribute } from '../types/game';
import { getLckThreatMin } from '../utils/characterSystem';
import { getActiveAntiSynergies } from '../utils/statCalculations';
import { FEAT_DEFINITIONS } from '../data/feats';
import { getXpForLevel, getXpForNextLevel } from '../utils/progression';
import {
  ShieldAlert,
  User,
  Heart,
  Zap,
  Shield,
  Crosshair,
  Sparkles,
  Weight,
  Flame,
  Award,
  AlertOctagon,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const SPECIAL_LABELS: Record<SpecialAttribute, { nameRu: string; desc: string }> = {
  STR: { nameRu: 'Сила (STR)', desc: 'Физическая мощь, урон ближнего боя и грузоподъемность' },
  PER: { nameRu: 'Восприятие (PER)', desc: 'Точность дальнего боя, обнаружение скрытых угроз' },
  END: { nameRu: 'Выносливость (END)', desc: 'Запас HP, стойкость к радиации и инфекциям' },
  CHA: { nameRu: 'Харизма (CHA)', desc: 'Лидерство, убеждение и выгода при бартере' },
  INT: { nameRu: 'Интеллект (INT)', desc: 'Скорость обучения, медицина, наука и ремонт' },
  AGI: { nameRu: 'Ловкость (AGI)', desc: 'Очки действий (AP), скорость и уклонение' },
  LCK: { nameRu: 'Удача (LCK)', desc: 'Шанс критических ударов и везение в мелочах' },
};

export const CharacterSheet: React.FC = () => {
  const { character, effectiveSpecial, derivedStats, pendingFeatChoices, chooseFeat } = useGame();

  if (!character) return null;

  const activeAntiSynergies = getActiveAntiSynergies(character.baseSpecial);
  const currentLevelXp = getXpForLevel(character.level);
  const nextLevelXp = getXpForNextLevel(character.level);
  const xpIntoLevel = Math.max(0, character.xp - currentLevelXp);
  const xpSpan = nextLevelXp === null ? 1 : Math.max(1, nextLevelXp - currentLevelXp);
  const xpProgressPct = nextLevelXp === null ? 100 : Math.min(100, Math.round((xpIntoLevel / xpSpan) * 100));
  const availableFeats = FEAT_DEFINITIONS.filter((feat) => !character.feats.includes(feat.id));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-mono text-amber-300 space-y-6">
      {/* Top Identity Card */}
      <div className="bg-neutral-900 border border-amber-500/40 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-400 rounded-full flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-amber-200">{character.name}</h1>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                Уровень {character.level}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{character.background}</p>
            <div className="text-[11px] text-amber-500/80 mt-1 font-mono">
              Опыт (XP): {character.xp}{nextLevelXp === null ? ' / МАКС.' : ` / ${nextLevelXp}`}
            </div>
            <div className="mt-1.5 w-full max-w-xs h-1.5 bg-neutral-800 rounded overflow-hidden">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${xpProgressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Quick Vitals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-950 p-3 rounded border border-neutral-800 text-xs">
          <div>
            <div className="text-neutral-500 text-[10px] uppercase">Здоровье (HP)</div>
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-1">
              <Heart className="w-4 h-4 fill-emerald-500/20" />
              {character.currentHp} / {derivedStats.maxHp}
            </div>
          </div>
          <div>
            <div className="text-neutral-500 text-[10px] uppercase">Очки Действия (AP)</div>
            <div className="text-cyan-400 font-bold text-sm flex items-center gap-1">
              <Zap className="w-4 h-4 fill-cyan-500/20" />
              {character.currentAp} / {derivedStats.maxAp}
            </div>
          </div>
          <div>
            <div className="text-neutral-500 text-[10px] uppercase">Уклонение (AC)</div>
            <div className="text-amber-300 font-bold text-sm flex items-center gap-1">
              <Shield className="w-4 h-4" />
              {derivedStats.evasion}
            </div>
          </div>
          <div>
            <div className="text-neutral-500 text-[10px] uppercase">Крит. Шанс</div>
            <div className="text-amber-400 font-bold text-sm flex items-center gap-1">
              <Crosshair className="w-4 h-4" />
              {derivedStats.critChance}%
            </div>
          </div>
        </div>
      </div>

      {pendingFeatChoices > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/60 p-5 rounded-lg space-y-4 shadow-lg shadow-amber-950/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider">НОВАЯ НАГРАДА ЗА УРОВЕНЬ</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Выберите Фит. Выбор постоянный и не тратит очки навыков.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-300 border border-amber-500/40 px-2 py-1 rounded">
              Выборов: {pendingFeatChoices}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableFeats.map((feat) => (
              <button
                key={feat.id}
                onClick={() => chooseFeat(feat.id)}
                className="text-left bg-neutral-950 border border-neutral-800 hover:border-amber-500/60 p-3 rounded transition-colors"
              >
                <div className="font-bold text-amber-200 text-sm">{feat.nameRu}</div>
                <div className="text-[11px] text-neutral-400 mt-1">{feat.description}</div>
                <div className="text-[10px] text-emerald-400 mt-2">Плюсы: {feat.prosRu.join(' | ')}</div>
                <div className="text-[10px] text-red-400 mt-1">Минусы: {feat.consRu.join(' | ')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: SPECIAL Grid & Anti-Synergies */}
        <div className="lg:col-span-7 space-y-6">
          {/* SPECIAL Attributes Card */}
          <div className="bg-neutral-900 border border-amber-500/30 p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Характеристики S.P.E.C.I.A.L.</span>
              </h2>
              <span className="text-xs text-neutral-400 font-mono">Баз. / Эффект.</span>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(character.baseSpecial) as SpecialAttribute[]).map((attr) => {
                const baseVal = character.baseSpecial[attr];
                const effVal = effectiveSpecial[attr];
                const diff = effVal - baseVal;
                const info = SPECIAL_LABELS[attr];

                return (
                  <div
                    key={attr}
                    className="bg-neutral-950/80 border border-neutral-800 p-3 rounded flex items-center justify-between gap-3 hover:border-neutral-700"
                  >
                    <div>
                      <div className="font-bold text-sm text-amber-200">{info.nameRu}</div>
                      <div className="text-[11px] text-neutral-400">{info.desc}</div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono">
                        <span className="text-xs text-neutral-500">Базовый: {baseVal}</span>
                        <div className="text-lg font-bold flex items-center justify-end gap-1">
                          <span className={diff < 0 ? 'text-red-400' : diff > 0 ? 'text-emerald-400' : 'text-amber-300'}>
                            {effVal}
                          </span>
                          {diff !== 0 && (
                            <span className={`text-xs ${diff < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              ({diff > 0 ? `+${diff}` : diff})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Anti-Synergies & Penalties */}
          {activeAntiSynergies.length > 0 ? (
            <div className="bg-red-950/30 border border-red-500/50 p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm border-b border-red-900/50 pb-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span>АКТИВНЫЕ АНТИ-СИНЕРГИИ И ОГРАНИЧЕНИЯ БИЛДА</span>
              </div>
              <div className="space-y-2">
                {activeAntiSynergies.map((penalty) => (
                  <div key={penalty.id} className="bg-neutral-950 p-3 rounded border border-red-800/60 text-xs">
                    <div className="font-semibold text-red-300 text-sm">{penalty.nameRu}</div>
                    <p className="text-neutral-400 text-[11px] mt-1">{penalty.descriptionRu}</p>
                    <div className="text-red-400 font-bold mt-1.5">
                      Штрафы к статам: {Object.entries(penalty.penalties).map(([k, v]) => `${k} ${v}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg text-xs text-neutral-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ваш билд сбалансирован, экстремальные анти-синергетические штрафы отсутствуют.</span>
            </div>
          )}
        </div>

        {/* Right Column: Derived Combat Stats & Active Feats */}
        <div className="lg:col-span-5 space-y-6">
          {/* Derived Combat Stats */}
          <div className="bg-neutral-900 border border-amber-500/30 p-5 rounded-lg space-y-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Боевые & Спец. Параметры</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <div className="text-neutral-400 text-[11px]">Инициатива в бою</div>
                <div className="text-amber-200 font-bold text-sm mt-0.5">+{derivedStats.initiative} (d20)</div>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <div className="text-neutral-400 text-[11px]">Макс. Переносимый Вес</div>
                <div className="text-amber-200 font-bold text-sm mt-0.5">
                  {derivedStats.carryWeightCurrent.toFixed(1)} / {derivedStats.carryWeightMax} кг
                </div>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <div className="text-neutral-400 text-[11px]">Сопротивление Радиации</div>
                <div className="text-amber-200 font-bold text-sm mt-0.5">{derivedStats.radResist}%</div>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <div className="text-neutral-400 text-[11px]">Сопротивление Болезням</div>
                <div className="text-amber-200 font-bold text-sm mt-0.5">{derivedStats.diseaseResist}%</div>
              </div>
            </div>
          </div>

          {/* Active Feats List */}
          <div className="bg-neutral-900 border border-amber-500/30 p-5 rounded-lg space-y-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-neutral-800 pb-2">
              Выбранные Фиты (Feats)
            </h2>

            {character.feats.length > 0 ? (
              <div className="space-y-3">
                {character.feats.map((featId) => {
                  const feat = FEAT_DEFINITIONS.find((f) => f.id === featId);
                  if (!feat) return null;

                  return (
                    <div key={featId} className="bg-neutral-950 p-3 rounded border border-amber-500/20 text-xs">
                      <div className="font-bold text-amber-200 text-sm mb-0.5">{feat.nameRu}</div>
                      <p className="text-neutral-400 text-[11px] mb-2">{feat.description}</p>

                      <div className="space-y-1">
                        <div className="text-emerald-400 font-mono text-[11px]">
                          <strong>Плюсы:</strong> {feat.prosRu.join(' | ')}
                        </div>
                        <div className="text-red-400 font-mono text-[11px]">
                          <strong>Минусы:</strong> {feat.consRu.join(' | ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic">Фиты ещё не выбраны.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
