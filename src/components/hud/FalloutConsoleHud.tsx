import React, { useEffect } from 'react';
import { Character, DerivedStats, Item } from '../../types/game';
import { ITEM_DATABASE } from '../../data/items';
import {
  Shield,
  Zap,
  Sword,
  MapPin,
  BookOpen,
  RotateCcw,
  Layers,
  Settings,
  Heart,
  Radio,
  Flame,
  Volume2,
  Tv,
  Users,
} from 'lucide-react';

interface FalloutConsoleHudProps {
  character: Character;
  derivedStats?: DerivedStats;
  currentAp: number;
  maxAp: number;
  onOpenInventory: () => void;
  onOpenStats: () => void;
  onOpenMap: () => void;
  onOpenJournal: () => void;
  onOpenCompanion: () => void;
  onOpenSettings?: () => void;
  onEndTurn: () => void;
  stance: 'normal' | 'sneak' | 'sprint';
  onChangeStance: (stance: 'normal' | 'sneak' | 'sprint') => void;
  crtEnabled?: boolean;
  onToggleCrt?: () => void;
}

export const FalloutConsoleHud: React.FC<FalloutConsoleHudProps> = ({
  character,
  derivedStats,
  currentAp,
  maxAp,
  onOpenInventory,
  onOpenStats,
  onOpenMap,
  onOpenJournal,
  onOpenCompanion,
  onOpenSettings,
  onEndTurn,
  stance,
  onChangeStance,
  crtEnabled = true,
  onToggleCrt,
}) => {
  const hpCurrent = character.currentHp;
  const hpMax = derivedStats?.maxHp || 50;
  const hpPercent = Math.max(0, Math.min(100, Math.round((hpCurrent / hpMax) * 100)));

  const equippedWeapon = character.equippedWeaponId
    ? ITEM_DATABASE.find((i) => i.id === character.equippedWeaponId)
    : null;

  // Keyboard Hotkeys (I: Inv, C: Stats, M: Map, J: Journal, Space: End Turn)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'i' || key === 'ш') {
        e.preventDefault();
        onOpenInventory();
      } else if (key === 'c' || key === 'с') {
        e.preventDefault();
        onOpenStats();
      } else if (key === 'm' || key === 'ь') {
        e.preventDefault();
        onOpenMap();
      } else if (key === 'j' || key === 'о') {
        e.preventDefault();
        onOpenJournal();
      } else if (e.code === 'Space') {
        e.preventDefault();
        onEndTurn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenInventory, onOpenStats, onOpenMap, onOpenJournal, onEndTurn]);

  // AP Segments (up to 12 segments)
  const apSegments = Array.from({ length: Math.min(12, maxAp) }, (_, idx) => idx < currentAp);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 select-none font-mono pointer-events-auto">
      {/* Heavy Industrial Fallout-Style Console */}
      <div className="relative max-w-6xl mx-auto bg-gradient-to-t from-stone-950 via-stone-900 to-stone-850 border-t-2 border-x-2 border-amber-600/70 rounded-t-2xl shadow-[0_-10px_35px_rgba(0,0,0,0.9)] p-2.5 md:p-3.5">
        {/* Metal Trim Rivets and Bevel */}
        <div className="absolute top-1 left-4 flex gap-2 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-stone-600 border border-stone-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-stone-600 border border-stone-800" />
        </div>
        <div className="absolute top-1 right-4 flex gap-2 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-stone-600 border border-stone-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-stone-600 border border-stone-800" />
        </div>

        <div className="grid grid-cols-12 gap-2 md:gap-4 items-center">
          {/* --- LEFT SECTION: HP GAUGE & SURVIVAL (3 COLS) --- */}
          <div className="col-span-12 sm:col-span-3 flex flex-col justify-center bg-stone-950/90 border border-stone-800 rounded-xl p-2.5 shadow-inner">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-amber-500 font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/40" />
                ЗДОРОВЬЕ
              </span>
              <span className="text-stone-200 font-bold">
                {hpCurrent} / {hpMax}
              </span>
            </div>

            {/* Retro HP Bar */}
            <div className="w-full h-3 bg-stone-900 rounded-full border border-stone-700 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {/* Quick Survival Need Dots */}
            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1.5 pt-1 border-t border-stone-800/80">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Голод: {character.survival?.hunger || 0}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Жажда: {character.survival?.thirst || 0}%
              </span>
              <span className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    (character.survival?.radiation || 0) > 20 ? 'bg-green-500 animate-ping' : 'bg-stone-600'
                  }`}
                />
                Рад: {character.survival?.radiation || 0}
              </span>
            </div>
          </div>

          {/* --- CENTER SECTION: ACTIVE WEAPON & AP INDICATOR (5 COLS) --- */}
          <div className="col-span-12 sm:col-span-5 flex items-center gap-2 md:gap-3 bg-stone-950/90 border border-stone-800 rounded-xl p-2 shadow-inner">
            {/* Weapon Card */}
            <div
              onClick={onOpenInventory}
              className="flex-1 flex items-center gap-2.5 p-1.5 rounded-lg bg-stone-900/90 border border-amber-600/30 hover:border-amber-500 cursor-pointer transition-colors group"
              title="Кликните для перехода в инвентарь (I)"
            >
              <div className="w-9 h-9 rounded bg-stone-950 border border-stone-700 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                <Sword className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-200 truncate">
                  {equippedWeapon?.nameRu || 'Кулачный бой'}
                </div>
                <div className="text-[10px] text-amber-400/90 font-mono">
                  {equippedWeapon
                    ? `${equippedWeapon.weaponData?.damageMin}-${equippedWeapon.weaponData?.damageMax} УРН • ${equippedWeapon.weaponData?.apCost} ОД`
                    : '1-3 УРН • 2 ОД'}
                </div>
              </div>
            </div>

            {/* AP Gauge & End Turn Button */}
            <div className="flex flex-col items-center justify-center shrink-0 pr-1">
              <div className="flex items-center gap-1 mb-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300">
                  {currentAp} / {maxAp} ОД
                </span>
              </div>

              {/* Segmented Lights */}
              <div className="flex gap-1 mb-1">
                {apSegments.map((active, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-2.5 rounded-xs transition-all ${
                      active
                        ? 'bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.7)]'
                        : 'bg-stone-800 border border-stone-900'
                    }`}
                  />
                ))}
              </div>

              {/* End Turn Button */}
              <button
                onClick={onEndTurn}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 active:scale-95 text-stone-950 font-bold text-[10px] tracking-wider transition-all shadow-md flex items-center gap-1"
                title="Завершить ход (Space)"
              >
                <RotateCcw className="w-3 h-3" />
                ХОД [Пробел]
              </button>
            </div>
          </div>

          {/* --- RIGHT SECTION: FALLOUT RETRO TACTICAL BUTTONS (4 COLS) --- */}
          <div className="col-span-12 sm:col-span-4 flex items-center justify-between gap-1.5">
            {/* INV / ИНВ */}
            <button
              onClick={onOpenInventory}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-stone-900/90 hover:bg-amber-950/80 border border-amber-600/50 hover:border-amber-400 text-amber-400 hover:text-amber-200 transition-all shadow-md active:scale-95 group"
            >
              <Layers className="w-4 h-4 mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-[11px] font-bold tracking-wider">ИНВ</span>
              <span className="text-[8px] text-stone-500">[I]</span>
            </button>

            {/* STAT / СТАТ */}
            <button
              onClick={onOpenStats}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-stone-900/90 hover:bg-amber-950/80 border border-amber-600/50 hover:border-amber-400 text-amber-400 hover:text-amber-200 transition-all shadow-md active:scale-95 group"
            >
              <Shield className="w-4 h-4 mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-[11px] font-bold tracking-wider">СТАТ</span>
              <span className="text-[8px] text-stone-500">[C]</span>
            </button>

            {/* MAP / КАРТА */}
            <button
              onClick={onOpenMap}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-stone-900/90 hover:bg-amber-950/80 border border-amber-600/50 hover:border-amber-400 text-amber-400 hover:text-amber-200 transition-all shadow-md active:scale-95 group"
            >
              <MapPin className="w-4 h-4 mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-[11px] font-bold tracking-wider">КАРТА</span>
              <span className="text-[8px] text-stone-500">[M]</span>
            </button>

            {/* LOG / ЖУРНАЛ */}
            <button
              onClick={onOpenJournal}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-stone-900/90 hover:bg-amber-950/80 border border-amber-600/50 hover:border-amber-400 text-amber-400 hover:text-amber-200 transition-all shadow-md active:scale-95 group"
            >
              <BookOpen className="w-4 h-4 mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-[11px] font-bold tracking-wider">ЖУРНАЛ</span>
              <span className="text-[8px] text-stone-500">[J]</span>
            </button>

            {/* COMPANION / СПУТНИК */}
            <button
              onClick={onOpenCompanion}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-stone-900/90 hover:bg-cyan-950/80 border border-cyan-600/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-200 transition-all shadow-md active:scale-95 group"
            >
              <Users className="w-4 h-4 mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-[11px] font-bold tracking-wider">ПРИКАЗ</span>
              <span className="text-[8px] text-stone-500">[P]</span>
            </button>

            {/* Extra: CRT toggle */}
            {onToggleCrt && (
              <button
                onClick={onToggleCrt}
                className={`p-2 rounded-lg border text-xs transition-all ${
                  crtEnabled
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-stone-900 border-stone-800 text-stone-600'
                }`}
                title="Переключить CRT-сканлайн"
              >
                <Tv className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
