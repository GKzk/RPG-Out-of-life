import React, { useState } from 'react';
import { Character, SpecialStats } from '../../types/game';
import { calculateSkillValue, resolveSkillCheck, rollD20 } from '../../utils/statCalculations';
import {
  MessageSquare,
  Shield,
  Dices,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export interface DialogueOption {
  id: string;
  textRu: string;
  skillReq?: 'persuasion' | 'barter' | 'science' | 'mechanics' | 'medicine' | 'survival' | 'deception';
  difficulty?: number;
  statReq?: { stat: 'STR' | 'INT' | 'CHA' | 'PER'; minVal: number };
  targetNodeId: string;
  onSuccessRewards?: { xp?: number; itemId?: string; count?: number };
}

export interface DialogueNode {
  id: string;
  speakerNameRu: string;
  speakerTitleRu: string;
  portraitType: 'elder' | 'raider' | 'engineer' | 'bunker_ai' | 'companion';
  textRu: string;
  options: DialogueOption[];
}

interface FalloutDialogueModalProps {
  initialNode: DialogueNode;
  allNodes: Record<string, DialogueNode>;
  character: Character;
  effectiveSpecial: SpecialStats;
  onClose: () => void;
  onReward?: (xp: number, items: { itemId: string; count: number }[]) => void;
  onStartCombat?: () => void;
}

export const FalloutDialogueModal: React.FC<FalloutDialogueModalProps> = ({
  initialNode,
  allNodes,
  character,
  effectiveSpecial,
  onClose,
  onReward,
  onStartCombat,
}) => {
  const [currentNode, setCurrentNode] = useState<DialogueNode>(initialNode);
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ speaker: string; text: string }>>([
    { speaker: initialNode.speakerNameRu, text: initialNode.textRu },
  ]);
  const [checkResult, setCheckResult] = useState<{
    text: string;
    success: boolean;
    roll: number;
    total: number;
    dc: number;
  } | null>(null);

  // Render Illustrated NPC Portrait
  const renderPortrait = (type: DialogueNode['portraitType']) => {
    switch (type) {
      case 'elder':
        return (
          <div className="relative w-36 h-44 rounded-xl bg-gradient-to-b from-stone-800 to-stone-950 border-2 border-amber-600/70 overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner">
            <svg viewBox="0 0 80 100" className="w-full h-full">
              {/* Elder head & beard */}
              <circle cx="40" cy="35" r="18" fill="#d4a373" stroke="#5c3822" strokeWidth="1.5" />
              <path d="M 22,25 C 22,12 58,12 58,25 Z" fill="#9ca3af" />
              <path d="M 26,42 Q 40,75 54,42 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
              <circle cx="34" cy="32" r="1.5" fill="#1f2937" />
              <circle cx="46" cy="32" r="1.5" fill="#1f2937" />
              <path d="M 15,65 C 15,50 65,50 65,65 L 65,100 L 15,100 Z" fill="#3f2e24" stroke="#1f1610" strokeWidth="2" />
            </svg>
            <div className="text-[10px] text-amber-400 font-bold font-mono mt-1 text-center">
              Староста Матвей
            </div>
          </div>
        );

      case 'raider':
        return (
          <div className="relative w-36 h-44 rounded-xl bg-gradient-to-b from-red-950/60 to-stone-950 border-2 border-red-600/70 overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner">
            <svg viewBox="0 0 80 100" className="w-full h-full">
              {/* Raider spikes & scar */}
              <circle cx="40" cy="35" r="18" fill="#bc8a64" stroke="#451a03" strokeWidth="1.5" />
              <path d="M 28,18 L 32,5 L 36,18 L 44,5 L 48,18" stroke="#ef4444" strokeWidth="2" fill="none" />
              <line x1="28" y1="28" x2="42" y2="42" stroke="#dc2626" strokeWidth="1.5" />
              <circle cx="34" cy="33" r="1.5" fill="#ef4444" />
              <circle cx="46" cy="33" r="1.5" fill="#1f2937" />
              <path d="M 15,65 C 15,50 65,50 65,65 L 65,100 L 15,100 Z" fill="#18181b" stroke="#09090b" strokeWidth="2" />
            </svg>
            <div className="text-[10px] text-red-400 font-bold font-mono mt-1 text-center">
              Мародёр «Воронов»
            </div>
          </div>
        );

      case 'bunker_ai':
        return (
          <div className="relative w-36 h-44 rounded-xl bg-gradient-to-b from-cyan-950/60 to-stone-950 border-2 border-cyan-500/70 overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner">
            <svg viewBox="0 0 80 100" className="w-full h-full">
              {/* Terminal screen & eye */}
              <rect x="15" y="15" width="50" height="42" rx="4" fill="#042f2e" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="40" cy="36" r="12" fill="#083344" stroke="#22d3ee" strokeWidth="1.5" className="animate-pulse" />
              <circle cx="40" cy="36" r="5" fill="#38bdf8" />
              <line x1="20" y1="25" x2="60" y2="25" stroke="#0891b2" strokeWidth="0.8" strokeDasharray="2,2" />
              <line x1="20" y1="47" x2="60" y2="47" stroke="#0891b2" strokeWidth="0.8" strokeDasharray="2,2" />
            </svg>
            <div className="text-[10px] text-cyan-400 font-bold font-mono mt-1 text-center">
              ИИ «ГОРИЗОНТ-3»
            </div>
          </div>
        );

      case 'companion':
      default:
        return (
          <div className="relative w-36 h-44 rounded-xl bg-gradient-to-b from-amber-950/50 to-stone-950 border-2 border-amber-600/70 overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner">
            <svg viewBox="0 0 80 100" className="w-full h-full">
              {/* Hound / companion silhouette */}
              <path d="M 22,50 C 22,25 58,25 58,50 L 52,68 L 28,68 Z" fill="#854d0e" stroke="#451a03" strokeWidth="1.5" />
              <path d="M 24,30 L 16,14 L 32,24 Z" fill="#451a03" />
              <path d="M 56,30 L 64,14 L 48,24 Z" fill="#451a03" />
              <circle cx="34" cy="40" r="2" fill="#fef08a" />
              <circle cx="46" cy="40" r="2" fill="#fef08a" />
              <circle cx="40" cy="52" r="3" fill="#18181b" />
            </svg>
            <div className="text-[10px] text-amber-300 font-bold font-mono mt-1 text-center">
              Гончая «Байкал»
            </div>
          </div>
        );
    }
  };

  // Option select handler
  const handleSelectOption = (opt: DialogueOption) => {
    // Check if combat is triggered
    if (opt.targetNodeId === 'combat_trigger') {
      if (onStartCombat) onStartCombat();
      onClose();
      return;
    }

    if (opt.targetNodeId === 'exit_dialogue') {
      onClose();
      return;
    }

    // Resolve skill check if present
    if (opt.skillReq && opt.difficulty) {
      const skillVal = calculateSkillValue(opt.skillReq, character, effectiveSpecial);
      const attrKey: 'CHA' | 'INT' | 'PER' =
        opt.skillReq === 'persuasion' || opt.skillReq === 'barter' || opt.skillReq === 'deception'
          ? 'CHA'
          : opt.skillReq === 'survival'
          ? 'PER'
          : 'INT';
      const roll = rollD20();
      const check = resolveSkillCheck(effectiveSpecial[attrKey], skillVal, opt.difficulty, roll);
      const isSuccess = check.outcome === 'success' || check.outcome === 'critical_success';

      if (isSuccess) {
        setCheckResult({
          text: `[УСПЕХ] Проверка навыка (${opt.skillReq.toUpperCase()}) пройдена!`,
          success: true,
          roll: roll,
          total: check.finalScore,
          dc: opt.difficulty,
        });

        if (opt.onSuccessRewards && onReward) {
          const items = opt.onSuccessRewards.itemId ? [{ itemId: opt.onSuccessRewards.itemId, count: opt.onSuccessRewards.count || 1 }] : [];
          onReward(opt.onSuccessRewards.xp || 50, items);
        }
      } else {
        setCheckResult({
          text: `[ПРОВАЛ] Не хватило умения (${opt.skillReq.toUpperCase()}).`,
          success: false,
          roll: roll,
          total: check.finalScore,
          dc: opt.difficulty,
        });
      }
    }

    // Advance dialogue
    const nextNode = allNodes[opt.targetNodeId];
    if (nextNode) {
      setDialogueHistory((prev) => [
        ...prev,
        { speaker: character.name, text: opt.textRu },
        { speaker: nextNode.speakerNameRu, text: nextNode.textRu },
      ]);
      setCurrentNode(nextNode);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-4xl bg-stone-950 border-2 border-amber-600/70 rounded-2xl shadow-[0_0_50px_rgba(217,119,6,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Retro Title Bar */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 px-5 py-3 border-b border-amber-600/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <h2 className="text-sm font-bold text-amber-400 tracking-wider uppercase">
                {currentNode.speakerNameRu}
              </h2>
              <p className="text-[10px] text-stone-400">{currentNode.speakerTitleRu}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-red-950/80 border border-stone-700 hover:border-red-600 text-stone-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Portrait + History + Dialogue */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 overflow-y-auto flex-1">
          {/* LEFT: Portrait */}
          <div className="md:col-span-3 flex flex-col items-center justify-start gap-3">
            {renderPortrait(currentNode.portraitType)}
            <div className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-800 text-[11px] text-stone-400 w-full text-center">
              Статус: В диалоге
            </div>
          </div>

          {/* RIGHT: Text & History */}
          <div className="md:col-span-9 flex flex-col justify-between space-y-4">
            {/* Scrollable Dialogue History Box */}
            <div className="space-y-3 p-4 rounded-xl bg-stone-900/90 border border-stone-800/80 max-h-64 overflow-y-auto shadow-inner">
              {dialogueHistory.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    {item.speaker}:
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed font-mono pl-2 border-l border-amber-600/30">
                    «{item.text}»
                  </p>
                </div>
              ))}
            </div>

            {/* Skill Check Alert */}
            {checkResult && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between animate-fade-in ${
                  checkResult.success
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-red-950/60 border-red-500 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Dices className="w-4 h-4" />
                  <span>{checkResult.text}</span>
                </div>
                <span className="text-[11px] font-bold">
                  Итог: {checkResult.total} (Бросок: {checkResult.roll}) против DC {checkResult.dc}
                </span>
              </div>
            )}

            {/* Interactive Choices List */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1.5">
                Варианты ответа:
              </div>

              {currentNode.options.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className="w-full text-left p-3 rounded-xl bg-stone-900/80 hover:bg-amber-950/60 border border-stone-800 hover:border-amber-500/80 text-stone-200 hover:text-amber-200 transition-all text-xs font-mono flex items-start gap-2.5 group active:scale-[0.99]"
                >
                  <span className="text-amber-500 font-bold shrink-0">{idx + 1}.</span>
                  <div className="flex-1">
                    <span>{opt.textRu}</span>
                    {opt.skillReq && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold">
                        [{opt.skillReq.toUpperCase()} DC {opt.difficulty}]
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
