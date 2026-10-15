import React, { useState } from 'react';
import { CharacterSheet } from '../CharacterSheet';
import { SkillsView } from '../SkillsView';
import { SurvivalView } from '../SurvivalView';
import { CharacterCreation } from '../CharacterCreation';
import { X, Shield, BookOpen, Heart, UserCog, Layers } from 'lucide-react';

interface CharacterSheetModalProps {
  onClose: () => void;
  defaultTab?: 'stats' | 'skills' | 'survival' | 'customize';
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  onClose,
  defaultTab = 'stats',
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'skills' | 'survival' | 'customize'>(defaultTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-6xl bg-stone-950 border-2 border-amber-600/60 rounded-2xl shadow-[0_0_50px_rgba(217,119,6,0.3)] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Terminal Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 px-5 py-3.5 border-b border-amber-600/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-950/70 border border-amber-600/60 text-amber-400">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-400 tracking-wider uppercase">
                ТЕРМИНАЛ ХАРАКТЕРИСТИК: СТАТУС ВЫЖИВШЕГО
              </h2>
              <p className="text-[11px] text-stone-400">
                S.P.E.C.I.A.L., распределение очков навыков, перки и биометрия
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-red-950/80 border border-stone-700 hover:border-red-600 text-stone-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-stone-800 bg-stone-950/80 px-4 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>S.P.E.C.I.A.L. & Перки</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'skills'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>23 Навыка</span>
          </button>

          <button
            onClick={() => setActiveTab('survival')}
            className={`py-3 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'survival'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Потребности & Травмы</span>
          </button>

          <button
            onClick={() => setActiveTab('customize')}
            className={`py-3 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ml-auto ${
              activeTab === 'customize'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-stone-400 hover:text-cyan-300'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Сменить / Настроить героя</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {activeTab === 'stats' && <CharacterSheet />}
          {activeTab === 'skills' && <SkillsView />}
          {activeTab === 'survival' && <SurvivalView />}
          {activeTab === 'customize' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/60 text-xs text-cyan-300">
                Здесь вы можете выбрать другой стартовый архетип или пересобрать характеристики героя с нуля.
              </div>
              <CharacterCreation onDone={() => setActiveTab('stats')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
