import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Terminal, ChevronDown, ChevronUp, ScrollText } from 'lucide-react';

export const CombatLogConsole: React.FC = () => {
  const { combatLog } = useGame();
  const [isOpen, setIsOpen] = useState(true);

  if (combatLog.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-6xl mx-auto px-4 pointer-events-none">
      <div className="bg-neutral-950/95 border-t border-x border-amber-500/40 rounded-t-lg shadow-2xl shadow-black font-mono text-amber-300 pointer-events-auto backdrop-blur-md">
        {/* Toggle Bar */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between cursor-pointer select-none text-xs hover:bg-neutral-850 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span>ТЕРМИНАЛ СОБЫТИЙ И БРОСКОВ КУБИКОВ (d20 / VATS LOG)</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
              {combatLog.length} записей
            </span>
          </div>

          <button className="text-amber-400 hover:text-amber-200">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Log Entries Body */}
        {isOpen && (
          <div className="p-3 max-h-44 overflow-y-auto space-y-1 text-[11px] leading-relaxed divide-y divide-neutral-900">
            {combatLog.map((entry) => {
              let colorClass = 'text-amber-300';
              if (entry.type === 'hit') colorClass = 'text-emerald-400 font-semibold';
              if (entry.type === 'crit') colorClass = 'text-amber-200 font-bold bg-amber-500/10 px-1 rounded';
              if (entry.type === 'miss') colorClass = 'text-neutral-500 italic';
              if (entry.type === 'damage') colorClass = 'text-red-400 font-semibold';
              if (entry.type === 'heal') colorClass = 'text-emerald-300 font-semibold';
              if (entry.type === 'hazard') colorClass = 'text-red-500 font-bold';
              if (entry.type === 'turn') colorClass = 'text-cyan-400 font-bold border-y border-cyan-900/50 py-0.5 my-1';

              return (
                <div key={entry.id} className="pt-1 flex items-start gap-2">
                  <span className="text-neutral-500 shrink-0 text-[10px] font-mono">{entry.timestamp}</span>
                  <span className={colorClass}>{entry.textRu}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
