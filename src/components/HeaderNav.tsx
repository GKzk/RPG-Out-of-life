import React from 'react';
import { useGame } from '../context/GameContext';
import {
  User,
  Zap,
  Activity,
  Package,
  Swords,
  Compass,
  RotateCcw,
  Clock,
  Heart,
  Shield,
  Award,
} from 'lucide-react';

interface HeaderNavProps {
  activeTab: 'character' | 'skills' | 'survival' | 'inventory' | 'combat' | 'explorer';
  setActiveTab: (tab: 'character' | 'skills' | 'survival' | 'inventory' | 'combat' | 'explorer') => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab }) => {
  const { character, derivedStats, gameDay, gameTimeHours, combatState, resetGame } = useGame();

  if (!character) return null;

  const timeFormatted = `${String(gameTimeHours).padStart(2, '0')}:00`;

  return (
    <header className="bg-neutral-900 border-b border-amber-500/30 text-amber-400 font-mono sticky top-0 z-50 shadow-lg shadow-black/60">
      {/* Top status banner */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 text-xs">
        {/* Brand & Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-amber-500 font-bold tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-sm">PIP-BOY 3000 Mk.V</span>
          </div>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-200 font-semibold">{character.name}</span>
          <span className="text-amber-500/70">Ур. {character.level}</span>
        </div>

        {/* Time & Location */}
        <div className="flex items-center gap-4 text-neutral-300">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>День {gameDay}, {timeFormatted}</span>
          </div>

          {/* Quick Vital Gauges */}
          <div className="flex items-center gap-3 border-l border-neutral-800 pl-3">
            <div className="flex items-center gap-1 text-emerald-400">
              <Heart className="w-3.5 h-3.5 fill-emerald-500/20" />
              <span>
                {character.currentHp}/{derivedStats.maxHp} HP
              </span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400">
              <Zap className="w-3.5 h-3.5 fill-cyan-500/20" />
              <span>
                {character.currentAp}/{derivedStats.maxAp} AP
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Evas {derivedStats.evasion}</span>
            </div>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={resetGame}
          className="flex items-center gap-1 text-neutral-400 hover:text-red-400 text-xs transition-colors py-0.5 px-2 rounded hover:bg-neutral-800"
          title="Сбросить и создать нового персонажа"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Новая игра</span>
        </button>
      </div>

      {/* Main Tab Navigation */}
      <nav className="max-w-7xl mx-auto px-2 flex items-center overflow-x-auto no-scrollbar gap-1 text-xs">
        <button
          onClick={() => setActiveTab('character')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'character'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-neutral-400 hover:text-amber-200 hover:bg-neutral-800/50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Карточка (SPECIAL)</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'skills'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-neutral-400 hover:text-amber-200 hover:bg-neutral-800/50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Навыки & Фиты</span>
        </button>

        <button
          onClick={() => setActiveTab('survival')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'survival'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-neutral-400 hover:text-amber-200 hover:bg-neutral-800/50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Выживание</span>
          {(character.survival.hunger > 60 || character.survival.thirst > 60 || character.survival.radiation > 300) && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-neutral-400 hover:text-amber-200 hover:bg-neutral-800/50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Инвентарь</span>
        </button>

        <button
          onClick={() => setActiveTab('combat')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'combat' || combatState.inCombat
              ? 'border-red-500 text-red-400 bg-red-500/10'
              : 'border-transparent text-neutral-400 hover:text-red-300 hover:bg-neutral-800/50'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Пошаговый Бой</span>
          {combatState.inCombat && (
            <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded font-bold uppercase animate-pulse">
              В бою
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'explorer'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-neutral-400 hover:text-amber-200 hover:bg-neutral-800/50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Исследование & Поиск</span>
        </button>
      </nav>
    </header>
  );
};
