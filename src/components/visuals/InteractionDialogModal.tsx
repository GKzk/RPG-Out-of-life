import React, { useState } from 'react';
import { MapPOI } from '../../data/villageMapData';
import { Character, SpecialStats } from '../../types/game';
import { ITEM_DATABASE } from '../../data/items';
import {
  calculateSkillValue,
  resolveSkillCheck,
  rollD20,
  SkillCheckResult,
} from '../../utils/statCalculations';
import {
  X,
  Dices,
  Package,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface InteractionDialogModalProps {
  poi: MapPOI;
  character: Character;
  effectiveSpecial: SpecialStats;
  companionId?: string;
  onClose: () => void;
  onCompletePOI: (poiId: string, itemsGained: { itemId: string; count: number }[], xpGained: number) => void;
  onStartCombatWithPatrol?: () => void;
}

export const InteractionDialogModal: React.FC<InteractionDialogModalProps> = ({
  poi,
  character,
  effectiveSpecial,
  companionId = 'none',
  onClose,
  onCompletePOI,
  onStartCombatWithPatrol,
}) => {
  const [checkResult, setCheckResult] = useState<SkillCheckResult | null>(null);
  const [d20Roll, setD20Roll] = useState<number | null>(null);
  const [isLootClaimed, setIsLootClaimed] = useState(false);
  const [activeStoryStage, setActiveStoryStage] = useState<'initial' | 'resolved' | 'loot'>('initial');

  // Determine required skill and attribute
  let skillId: any = 'search';
  let attrVal = effectiveSpecial.PER;

  if (poi.associatedSkill === 'Lockpick') {
    skillId = 'stealth'; // agility/dexterity based
    attrVal = effectiveSpecial.AGI;
  } else if (poi.associatedSkill === 'Repair') {
    skillId = 'mechanics';
    attrVal = effectiveSpecial.INT;
  } else if (poi.associatedSkill === 'Science') {
    skillId = 'science';
    attrVal = effectiveSpecial.INT;
  } else if (poi.associatedSkill === 'Outdoorsman') {
    skillId = 'survival';
    attrVal = effectiveSpecial.PER;
  } else if (poi.associatedSkill === 'Stealth') {
    skillId = 'stealth';
    attrVal = effectiveSpecial.AGI;
  }

  const skillValue = calculateSkillValue(skillId, character, effectiveSpecial);
  const dc = poi.difficulty || 14;

  // Companion bypass check
  const hasCompanionBypass =
    (poi.requiresCompanionSkill === 'ferret_burrow' && companionId === 'ferret') ||
    (poi.requiresCompanionSkill === 'boar_ram' && companionId === 'boar');

  const handlePerformCheck = (bonus = 0) => {
    const roll = rollD20();
    setD20Roll(roll);
    const result = resolveSkillCheck(attrVal, skillValue, dc, roll, bonus);
    setCheckResult(result);
    setActiveStoryStage('resolved');

    if (result.outcome === 'success' || result.outcome === 'critical_success' || result.outcome === 'partial') {
      // successful check allows collecting loot
    }
  };

  const handleCompanionBypass = () => {
    setD20Roll(20);
    const fakeResult: SkillCheckResult = {
      baseScore: 10,
      rollModifier: 20,
      finalScore: 30,
      margin: 16,
      outcome: 'critical_success',
    };
    setCheckResult(fakeResult);
    setActiveStoryStage('resolved');
  };

  const handleClaimLootAndFinish = () => {
    setIsLootClaimed(true);
    onCompletePOI(poi.id, poi.lootItems || [], poi.rewardXp || 25);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-neutral-900 border border-amber-500/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-amber-500/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-300 leading-tight">{poi.nameRu}</h3>
              <p className="text-[11px] text-neutral-400">Координаты: Сектор [{poi.x}, {poi.y}]</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Stylized Concept Sketch Illustration */}
          <div className="relative w-full h-44 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center">
            {/* Background blueprint grid */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #f59e0b 1px, transparent 1px), linear-gradient(to right, #404040 1px, transparent 1px), linear-gradient(to bottom, #404040 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Custom SVG Sketch by POI type */}
            <svg viewBox="0 0 400 160" className="w-full h-full p-2">
              <defs>
                <filter id="sketchFilter">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                </filter>
              </defs>

              {poi.id === 'elders_cabin' && (
                <g stroke="#d97706" strokeWidth="1.5" fill="none">
                  {/* Cabin interior wooden beam outline */}
                  <rect x="30" y="20" width="340" height="120" stroke="#78350f" strokeDasharray="6,3" />
                  <line x1="30" y1="20" x2="200" y2="5" stroke="#78350f" />
                  <line x1="370" y1="20" x2="200" y2="5" stroke="#78350f" />
                  {/* Table with chest */}
                  <rect x="130" y="80" width="140" height="40" fill="#292524" stroke="#d97706" />
                  <line x1="140" y1="120" x2="140" y2="145" stroke="#78350f" strokeWidth="2" />
                  <line x1="260" y1="120" x2="260" y2="145" stroke="#78350f" strokeWidth="2" />
                  {/* Heavy locked ironbound chest */}
                  <rect x="160" y="60" width="80" height="35" rx="3" fill="#44403c" stroke="#f59e0b" strokeWidth="2" />
                  <path d="M 160,60 C 160,50 240,50 240,60 Z" fill="#57534e" stroke="#f59e0b" strokeWidth="2" />
                  <rect x="195" y="70" width="10" height="12" rx="2" fill="#d97706" stroke="#78350f" />
                  <circle cx="200" cy="75" r="1.5" fill="#000" />
                  {/* Paper documents on table */}
                  <rect x="235" y="88" width="22" height="14" fill="#fafaf9" stroke="#78350f" transform="rotate(8 235 88)" />
                  <text x="50" y="40" fill="#f59e0b" fontSize="10" fontFamily="monospace">СХРОН СТАРОСТЫ // ЗАПЕРТЫЙ КОВАНЫЙ СУНДУК</text>
                </g>
              )}

              {poi.id === 'blacksmith_generator' && (
                <g stroke="#d97706" strokeWidth="1.5" fill="none">
                  {/* Generator Block */}
                  <rect x="120" y="45" width="160" height="80" rx="4" fill="#1c1917" stroke="#f59e0b" strokeWidth="2" />
                  {/* Cooling fins */}
                  <line x1="140" y1="55" x2="140" y2="115" stroke="#78716c" />
                  <line x1="150" y1="55" x2="150" y2="115" stroke="#78716c" />
                  <line x1="160" y1="55" x2="160" y2="115" stroke="#78716c" />
                  {/* Fuel tank */}
                  <rect x="180" y="25" width="80" height="24" rx="6" fill="#44403c" stroke="#f59e0b" />
                  <circle cx="250" cy="30" r="4" fill="#f59e0b" />
                  {/* Exhaust pipe */}
                  <path d="M 125,50 L 105,40 L 105,20" stroke="#78716c" strokeWidth="3" />
                  {/* Spark effect at broken contacts */}
                  <polygon points="265,90 275,80 270,95 285,92 272,108 274,98" fill="#38bdf8" stroke="#0284c7" />
                  <text x="40" y="40" fill="#38bdf8" fontSize="10" fontFamily="monospace">ДИЗЕЛЬ-ГЕНЕРАТОР 1958 // ПОВРЕЖДЕН СТАРТЕР</text>
                </g>
              )}

              {poi.id === 'radio_tower' && (
                <g stroke="#d97706" strokeWidth="1.5" fill="none">
                  {/* Radio antenna lattice tower */}
                  <line x1="120" y1="140" x2="190" y2="20" stroke="#78716c" strokeWidth="2" />
                  <line x1="260" y1="140" x2="190" y2="20" stroke="#78716c" strokeWidth="2" />
                  <line x1="135" y1="115" x2="245" y2="115" stroke="#78716c" />
                  <line x1="150" y1="85" x2="230" y2="85" stroke="#78716c" />
                  <line x1="170" y1="50" x2="210" y2="50" stroke="#78716c" />
                  <circle cx="190" cy="20" r="5" fill="#f59e0b" stroke="#78350f" />
                  {/* Radio waves */}
                  <path d="M 175,12 A 20 20 0 0 1 205,12" stroke="#38bdf8" strokeDasharray="3,3" />
                  <path d="M 165,6 A 35 35 0 0 1 215,6" stroke="#38bdf8" strokeDasharray="3,3" />
                  {/* Portable transponder box */}
                  <rect x="250" y="100" width="55" height="40" rx="3" fill="#292524" stroke="#f59e0b" />
                  <circle cx="265" cy="115" r="7" stroke="#38bdf8" />
                  <text x="40" y="30" fill="#38bdf8" fontSize="10" fontFamily="monospace">РАДИОМАЧТА ПОСЁЛКА // ПРИЁМНИК "СОСНА-М"</text>
                </g>
              )}

              {(poi.id === 'narrow_cache' || poi.id === 'heavy_rubble') && (
                <g stroke="#d97706" strokeWidth="1.5" fill="none">
                  {/* Stone foundation & rubble */}
                  <path d="M 60,130 L 110,70 L 170,120 L 250,65 L 320,130 Z" fill="#292524" stroke="#78716c" />
                  <rect x="140" y="90" width="60" height="25" fill="#1c1917" stroke="#f59e0b" strokeDasharray="4,2" />
                  {/* Timber logs fallen */}
                  <line x1="90" y1="60" x2="210" y2="110" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
                  <line x1="130" y1="110" x2="240" y2="70" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
                  {/* Glowing stash inside */}
                  <circle cx="170" cy="102" r="6" fill="#f59e0b" stroke="#fbbf24" />
                  <text x="40" y="30" fill="#f59e0b" fontSize="10" fontFamily="monospace">РАЗРУШЕННЫЙ ПОДПОЛ // СХРОН ПОД БАЛКАМИ</text>
                </g>
              )}

              {poi.id === 'scavenger_tracks' && (
                <g stroke="#d97706" strokeWidth="1.5" fill="none">
                  {/* Muddy ground line */}
                  <line x1="20" y1="120" x2="380" y2="120" stroke="#451a03" strokeWidth="3" />
                  {/* Boot prints */}
                  <ellipse cx="120" cy="110" rx="8" ry="16" fill="#1c1917" stroke="#d97706" transform="rotate(15 120 110)" />
                  <ellipse cx="170" cy="95" rx="8" ry="16" fill="#1c1917" stroke="#d97706" transform="rotate(-10 170 95)" />
                  <ellipse cx="220" cy="115" rx="8" ry="16" fill="#1c1917" stroke="#d97706" transform="rotate(20 220 115)" />
                  <ellipse cx="270" cy="90" rx="8" ry="16" fill="#1c1917" stroke="#d97706" transform="rotate(-5 270 90)" />
                  <text x="40" y="40" fill="#f59e0b" fontSize="10" fontFamily="monospace">СВЕЖИЕ СЛЕДЫ // ОТРЯД 5-6 ЧЕЛОВЕК У ВОРОТ</text>
                </g>
              )}
            </svg>

            {/* Corner Stamp */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 border border-amber-500/30 text-[10px] text-amber-400">
              СКЕТЧ-ДОСЬЕ ПОЛЕВОГО ЖУРНАЛА
            </div>
          </div>

          {/* Description */}
          <div className="bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
            {poi.descriptionRu}
          </div>

          {/* Check / Companion requirements */}
          {activeStoryStage === 'initial' && (
            <div className="space-y-3">
              {poi.associatedSkill && (
                <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-neutral-400">Проверка навыка: </span>
                    <span className="text-amber-400 font-bold">{poi.associatedSkill}</span>
                    <span className="text-neutral-500 ml-2">(DC {dc})</span>
                  </div>
                  <div className="text-neutral-400">
                    Ваш навык: <span className="text-emerald-400 font-bold">{skillValue}%</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {poi.associatedSkill && (
                  <button
                    onClick={() => handlePerformCheck()}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:translate-y-0.5"
                  >
                    <Dices className="w-4 h-4" />
                    <span>Бросить D20 ({poi.associatedSkill} vs DC {dc})</span>
                  </button>
                )}

                {hasCompanionBypass && (
                  <button
                    onClick={handleCompanionBypass}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Команда спутнику (Автоматический успех)</span>
                  </button>
                )}

                {poi.id === 'scavenger_tracks' && (
                  <button
                    onClick={() => {
                      if (onStartCombatWithPatrol) {
                        onStartCombatWithPatrol();
                        onClose();
                      }
                    }}
                    className="py-2.5 px-4 rounded-lg bg-red-600/30 border border-red-500/50 text-red-300 font-bold text-xs hover:bg-red-600/50 transition-colors flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Атаковать дозорного мародёра</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Result view */}
          {activeStoryStage === 'resolved' && checkResult && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border text-xs ${
                  checkResult.outcome === 'success' || checkResult.outcome === 'critical_success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : checkResult.outcome === 'partial'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-2 text-sm">
                  <div className="flex items-center gap-2">
                    {checkResult.outcome === 'success' || checkResult.outcome === 'critical_success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                    <span>
                      {checkResult.outcome === 'critical_success'
                        ? 'Критический триумф!'
                        : checkResult.outcome === 'success'
                        ? 'Успех проверки!'
                        : checkResult.outcome === 'partial'
                        ? 'Частичный успех'
                        : 'Неудача проверки'}
                    </span>
                  </div>
                  <span className="text-xs bg-black/40 px-2 py-0.5 rounded border border-current">
                    D20: {d20Roll} | Итог: {checkResult.finalScore} (DC {dc})
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed">
                  {checkResult.outcome === 'success' || checkResult.outcome === 'critical_success'
                    ? 'Ваши действия увенчались полным успехом! Механизм поддался без повреждений, открывая доступ к содержимому и секретам.'
                    : checkResult.outcome === 'partial'
                    ? 'С трудом, погнув пару отмычек и ободрав пальцы, вам удается завершить действие.'
                    : 'Замок заклинило или контакты замкнуло. Потребуется больше опыта или помощь компаньона.'}
                </p>
              </div>

              {/* Loot Section */}
              {poi.lootItems && poi.lootItems.length > 0 && (
                <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2.5">
                    <Package className="w-4 h-4" />
                    <span>Обнаруженная добыча:</span>
                  </div>
                  <div className="space-y-1.5">
                    {poi.lootItems.map((loot) => {
                      const itemDef = ITEM_DATABASE.find((i) => i.id === loot.itemId);
                      return (
                        <div
                          key={loot.itemId}
                          className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800 text-xs"
                        >
                          <span className="text-neutral-200">{itemDef?.nameRu || loot.itemId}</span>
                          <span className="text-amber-400 font-bold">x{loot.count}</span>
                        </div>
                      );
                    })}
                  </div>
                  {poi.rewardXp && (
                    <div className="mt-2 text-[11px] text-cyan-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>+{poi.rewardXp} XP начислено за исследование</span>
                    </div>
                  )}
                </div>
              )}

              {/* Claim / Finish Button */}
              <button
                onClick={handleClaimLootAndFinish}
                disabled={isLootClaimed}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <span>Забрать всё и продолжить разведку</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
