import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PROLOGUE_SCENES } from '../data/canonLore';
import { PET_DEFINITIONS } from '../data/pets';
import { calculateSkillValue, resolveSkillCheck, rollD20 } from '../utils/statCalculations';
import { SKILL_DEFINITIONS } from '../data/skills';
import { ITEM_DATABASE } from '../data/items';
import { SkillName } from '../types/game';
import { Shield, Sparkles, Dices, ArrowRight, CheckCircle2, AlertTriangle, FastForward } from 'lucide-react';

interface PrologueSequenceModalProps {
  onComplete: () => void;
}

export const PrologueSequenceModal: React.FC<PrologueSequenceModalProps> = ({ onComplete }) => {
  const { character, effectiveSpecial, addLogMessage, addItemToInventory, passTime, claimPrologueScene } = useGame();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [rollResult, setRollResult] = useState<{ d20: number; modifier: number; total: number; success: boolean } | null>(null);
  const [sceneFinished, setSceneFinished] = useState(false);
  
  if (!character) return null;

  const scene = PROLOGUE_SCENES[currentSceneIndex];
  const pet = character.petId && character.petId !== 'none'
    ? PET_DEFINITIONS.find((p) => p.id === character.petId) ?? null
    : null;

  const skillId = scene.associatedSkill as SkillName;
  const skillVal = calculateSkillValue(skillId, character, effectiveSpecial);
  const skillDefinition = SKILL_DEFINITIONS.find((skill) => skill.id === skillId);
  const governingAttribute = skillDefinition ? effectiveSpecial[skillDefinition.primaryAttr] : effectiveSpecial.PER;
  // Existing scene difficulties (8–12) used a different scale. Offset locally to map them
  // to the canonical resolver; do not change the shared RPG check formula.
  const canonicalDifficulty = scene.difficulty + 8;
  const skillModifier = (governingAttribute - 5) + Math.floor(skillVal / 10) - 3;

  const handleRoll = () => {
    if (sceneFinished) return;
    const d20 = rollD20();
    const check = resolveSkillCheck(governingAttribute, skillVal, canonicalDifficulty, d20);
    const success = check.outcome === 'success' || check.outcome === 'critical_success';
    setRollResult({ d20, modifier: check.baseScore, total: check.finalScore, success });
    setSceneFinished(true);

    const mayApplyConsequences = claimPrologueScene(scene.id);
    let consequence = '';
    if (mayApplyConsequences && currentSceneIndex === 0 && success) {
      const item = ITEM_DATABASE.find((entry) => entry.id === 'canned_cram');
      if (item) { addItemToInventory(item, 1); consequence = ` Найдено: ${item.nameRu} ×1.`; }
    } else if (mayApplyConsequences && currentSceneIndex === 2 && !success) {
      passTime(1, 'Задержка при отходе от мародёров в прологе');
      consequence = ' Потерян час: пришлось переждать, пока мародёры уйдут.';
    } else if (mayApplyConsequences && currentSceneIndex === 3) {
      const itemId = success ? 'stimpak' : 'dirty_water';
      const item = ITEM_DATABASE.find((entry) => entry.id === itemId);
      if (item) {
        addItemToInventory(item, 1);
        consequence = success ? ` Найдено: ${item.nameRu} ×1.` : `В спешке удалось забрать минимум: ${item.nameRu} ×1.`;
      }
    } else if (mayApplyConsequences && currentSceneIndex === 4 && !success) {
      passTime(1, 'Трудный отход по лесной тропе в прологе');
      consequence = ' Побег удался, но дорога заняла лишний час.';
    }

    const msg = success ? scene.successTextRu : scene.failureTextRu;
    addLogMessage(`[Пролог] ${msg}${consequence}`, success ? 'info' : 'hazard');
  };

  const handleNextScene = () => {
    setRollResult(null);
    setSceneFinished(false);
    if (currentSceneIndex < PROLOGUE_SCENES.length - 1) {
      setCurrentSceneIndex((prev) => prev + 1);
    } else {
      addLogMessage('Пролог «Пустая деревня» успешно завершен. Вы вышли на лесные тракты Подмосковья.', 'info');
      onComplete();
    }
  };

  const handleSkip = () => {
    addLogMessage('Пролог пропущен. Вы прибыли на тракты Подмосковья со стандартным снаряжением.', 'info');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border-2 border-amber-500/60 rounded-xl max-w-2xl w-full p-6 text-amber-300 font-mono shadow-2xl shadow-amber-500/20 relative animate-in fade-in zoom-in duration-300">
        
        {/* Top banner */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-lg font-bold text-amber-400 tracking-wider">ПРОЛОГ: ПУСТАЯ ДЕРЕВНЯ</h2>
          </div>
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-amber-200 bg-neutral-800 px-3 py-1.5 rounded transition-colors"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Пропустить пролог</span>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-1 mb-6">
          {PROLOGUE_SCENES.map((s, idx) => (
            <div
              key={s.id}
              className={`h-2 flex-1 rounded-full transition-all ${
                idx === currentSceneIndex
                  ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                  : idx < currentSceneIndex
                  ? 'bg-amber-600/60'
                  : 'bg-neutral-800'
              }`}
            />
          ))}
        </div>

        {/* Scene Box */}
        <div className="bg-neutral-950/80 border border-amber-500/20 rounded-lg p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded border border-amber-500/30">
              Сцена {currentSceneIndex + 1} из {PROLOGUE_SCENES.length}
            </span>
            <span className="text-xs text-neutral-400">
              Напарник: <span className="text-amber-300 font-bold">{pet ? `${pet.nameRu} (${pet.speciesRu})` : 'нет питомца'}</span>
            </span>
          </div>

          <h3 className="text-xl font-bold text-amber-200">{scene.titleRu}</h3>
          
          <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-900/60 p-3 rounded border border-neutral-800">
            {scene.descriptionRu}
          </p>

          <div className="text-xs text-amber-400/90 flex items-center gap-2 bg-amber-500/5 p-2.5 rounded border border-amber-500/10">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Задача: {scene.promptRu}</span>
          </div>

          {/* Pet specific narrative flavour */}
          <div className="text-xs text-cyan-300 bg-cyan-950/30 p-2.5 rounded border border-cyan-500/20 flex items-start gap-2">
            <span className="font-bold shrink-0">{pet ? `Реакция ${pet.nameRu}:` : 'Ваша реакция:'}</span>
            <span>
              {character.petId === 'hound' && 'Байкал низко припал к земле, внюхиваясь в утренний воздух и предупреждая глухим рокотом.'}
              {character.petId === 'cat' && 'Барсик бесшумно взбесил шерсть на загривке, чутко прислушиваясь к каждому шороху в руинах.'}
              {character.petId === 'crow' && 'Каркун сделал пару кругов над крышей брошенного амбара, тихонько каркнув в знак тревоги.'}
              {character.petId === 'ferret' && 'Ермак юрко нырнул под разбитое крыльцо, обнюхивая следы чужих сапог.'}
              {character.petId === 'boar' && 'Буян сердито фыркнул, раскапывая копытцем мерзлую землю у ворот.'}
              {character.petId === 'none' && 'В тишине пустого поселка вы рассчитываете только на собственную бдительность.'}
            </span>
          </div>
        </div>

        {/* Roll / Results Section */}
        {!sceneFinished ? (
          <div className="flex items-center justify-between bg-neutral-950 p-4 rounded-lg border border-amber-500/30">
            <div className="text-xs">
              <span className="text-neutral-400">Проверка навыка ({scene.associatedSkill}):</span>
              <span className="text-amber-300 font-bold ml-2">Сложность {canonicalDifficulty} (модификатор навыка/характеристики: {skillModifier >= 0 ? `+${skillModifier}` : skillModifier})</span>
            </div>
            <button
              onClick={handleRoll}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-5 py-2.5 rounded font-bold text-sm transition-all shadow-lg shadow-amber-500/30 cursor-pointer"
            >
              <Dices className="w-4 h-4" />
              <span>Бросить D20</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            {rollResult && (
              <div className={`p-4 rounded-lg border flex items-center justify-between ${rollResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'}`}>
                <div className="flex items-center gap-3">
                  {rollResult.success ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-amber-400" />}
                  <div>
                    <div className="font-bold text-sm">
                      {rollResult.success ? 'Успешное преодоление сцены!' : 'Преодолено с трудом'}
                    </div>
                    <div className="text-xs text-neutral-300 mt-0.5">
                      Бросок D20: {rollResult.d20}; база: {rollResult.modifier >= 0 ? `+${rollResult.modifier}` : rollResult.modifier}; итог: <strong className="text-white">{rollResult.total}</strong> (сложность: {canonicalDifficulty})
                    </div>
                  </div>
                </div>
                <div className="text-xs font-semibold px-3 py-1 rounded bg-black/40">
                  {rollResult.success ? 'Небольшое преимущество' : 'Небольшая цена ошибки'}
                </div>
              </div>
            )}

            <div className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded border border-neutral-800">
              {rollResult?.success ? scene.successTextRu : scene.failureTextRu}
            </div>

            <button
              onClick={handleNextScene}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 py-3 rounded font-bold text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>{currentSceneIndex < PROLOGUE_SCENES.length - 1 ? 'Следующая сцена' : 'Выйти на глобальную карту'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
