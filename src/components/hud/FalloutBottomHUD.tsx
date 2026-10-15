import React from 'react';
import { useGame } from '../../context/GameContext';
import { ITEM_DATABASE } from '../../data/items';
import {
  Shield,
  Swords,
  Heart,
  Zap,
  Package,
  BookOpen,
  Compass,
  Dog,
  Palette,
  Crosshair,
  AlertTriangle,
  Droplets,
  Flame,
  Radio,
} from 'lucide-react';

interface FalloutBottomHUDProps {
  onOpenInventory: () => void;
  onOpenStats: () => void;
  onOpenMap: () => void;
  onOpenJournal: () => void;
  onOpenCompanion: () => void;
  onOpenGallery: () => void;
  onStartCombat?: () => void;
  activeSectorNameRu?: string;
}

export const FalloutBottomHUD: React.FC<FalloutBottomHUDProps> = ({
  onOpenInventory,
  onOpenStats,
  onOpenMap,
  onOpenJournal,
  onOpenCompanion,
  onOpenGallery,
  onStartCombat,
  activeSectorNameRu = 'Хаб',
}) => {
  const { character, derivedStats, effectiveSpecial } = useGame();

  if (!character) return null;

  const equippedWeapon = ITEM_DATABASE.find((i) => i.id === character.equippedWeaponId);
  const equippedArmor = ITEM_DATABASE.find((i) => i.id === character.equippedArmorId);

  const hpPercent = Math.max(0, Math.min(100, (derivedStats.currentHp / derivedStats.maxHp) * 100));
  const apPercent = Math.max(0, Math.min(100, (derivedStats.currentAp / derivedStats.maxAp) * 100));

  // Determine health bar color
  const hpColorClass =
    hpPercent > 60 ? 'bg-emerald-500' : hpPercent > 30 ? 'bg-amber-500' : 'bg-red-500 animate-pulse';

  const isThirsty = character.survival.thirst > 50;
  const isHungry = character.survival.hunger > 50;
  const isRadiated = character.survival.radiation > 100;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950 border-t-2 border-amber-600/60 shadow-[0_-10px_30px_rgba(0,0,0,0.85)] font-mono select-none">
      {/* Top metallic bevel line */}
      <div className="h-0.5 bg-gradient-to-r from-amber-700/30 via-amber-500 to-amber-700/30" />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
        {/* ================= LEFT SECTION: HP, AP, SURVIVAL VITALS ================= */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          {/* Health Block */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg px-3 py-1.5 flex items-center gap-2.5 shadow-inner">
            <div className="p-1 rounded bg-red-950/70 border border-red-700/50 text-red-400 shrink-0">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                <span>ЗДОРОВЬЕ</span>
                <span className="text-emerald-400 font-mono">
                  {derivedStats.currentHp}/{derivedStats.maxHp}
                </span>
              </div>
              {/* Mini Health Bar */}
              <div className="w-24 sm:w-28 h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800 mt-1">
                <div
                  className={`h-full transition-all duration-300 ${hpColorClass}`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Points Block */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg px-3 py-1.5 flex items-center gap-2.5 shadow-inner">
            <div className="p-1 rounded bg-emerald-950/70 border border-emerald-700/50 text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                <span>ОЧКИ ДЕЙСТВИЙ</span>
                <span className="text-emerald-400 font-mono">
                  {derivedStats.currentAp}/{derivedStats.maxAp}
                </span>
              </div>
              {/* AP Dots Indicator */}
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: derivedStats.maxAp }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full border ${
                      idx < derivedStats.currentAp
                        ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                        : 'bg-stone-950 border-stone-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Survival Mini Pips */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-stone-900/60 rounded border border-stone-800/80 text-[10px]">
            <span
              title={`Жажда: ${character.survival.thirst}%`}
              className={`flex items-center gap-0.5 ${
                isThirsty ? 'text-amber-400 font-bold animate-pulse' : 'text-stone-500'
              }`}
            >
              <Droplets className="w-3 h-3" />
              <span>{character.survival.thirst}%</span>
            </span>
            <span className="text-stone-700">|</span>
            <span
              title={`Голод: ${character.survival.hunger}%`}
              className={`flex items-center gap-0.5 ${
                isHungry ? 'text-amber-400 font-bold animate-pulse' : 'text-stone-500'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>{character.survival.hunger}%</span>
            </span>
            {isRadiated && (
              <>
                <span className="text-stone-700">|</span>
                <span
                  title={`Радиация: ${character.survival.radiation} рад`}
                  className="flex items-center gap-0.5 text-yellow-400 font-bold animate-bounce"
                >
                  <Radio className="w-3 h-3" />
                  <span>{character.survival.radiation}R</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* ================= CENTER SECTION: WEAPON & ATTACK BOX ================= */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Active Weapon Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-inner">
            <div className="p-1 rounded bg-amber-950/70 border border-amber-600/50 text-amber-400">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                ОРУЖИЕ
              </div>
              <div className="text-xs font-bold text-stone-100 truncate max-w-36">
                {equippedWeapon ? equippedWeapon.nameRu : 'Кулаки (Рукопашная)'}
              </div>
              <div className="text-[10px] text-amber-400 font-mono">
                {equippedWeapon?.weaponData
                  ? `Урон: ${equippedWeapon.weaponData.damageMin}–${equippedWeapon.weaponData.damageMax}`
                  : 'Урон: 1–4 (STR+1)'}
              </div>
            </div>
          </div>

          {/* Quick Combat Button */}
          {onStartCombat && (
            <button
              onClick={onStartCombat}
              title="Начать боевую стычку с ближайшим патрулём"
              className="px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/80 hover:border-red-500 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95"
            >
              <Crosshair className="w-4 h-4 text-red-400 animate-pulse" />
              <span>БОЙ</span>
            </button>
          )}

          {/* Active Armor Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-inner">
            <div className="p-1 rounded bg-cyan-950/70 border border-cyan-700/50 text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                ЗАЩИТА
              </div>
              <div className="text-xs font-bold text-stone-100 truncate max-w-32">
                {equippedArmor ? equippedArmor.nameRu : 'Одежда бродяги'}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                КБ: {derivedStats.evasion} | ПУ: {equippedArmor?.armorData?.damageThreshold || 0}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SECTION: FALLOUT INTERFACE BUTTONS ================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-center md:justify-end overflow-x-auto py-1">
          {/* 1. ИНВ (Inventory & Paperdoll) */}
          <button
            onClick={onOpenInventory}
            title="Открыть инвентарь и куклу экипировки [I]"
            className="group px-3 py-1.5 rounded-lg bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs shadow-[0_0_12px_rgba(245,158,11,0.3)] border border-amber-400 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span>ИНВ</span>
          </button>

          {/* 2. СТАТ (Character Sheet & Customize) */}
          <button
            onClick={onOpenStats}
            title="Открыть характеристики, перки и навыки [C]"
            className="group px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-xs border border-stone-700 hover:border-amber-500 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>СТАТ</span>
          </button>

          {/* 3. КАРТА (Radial World Map) */}
          <button
            onClick={onOpenMap}
            title="Открыть карту радиальных секторов [M]"
            className="group px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-xs border border-stone-700 hover:border-amber-500 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span>КАРТА</span>
          </button>

          {/* 4. ЖУРНАЛ (Events, Quests, Lore) */}
          <button
            onClick={onOpenJournal}
            title="Открыть журнал событий, задачи и лор [J]"
            className="group px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-xs border border-stone-700 hover:border-amber-500 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>ЖУРНАЛ</span>
          </button>

          {/* 5. СПУТНИК (Companion Commands) */}
          <button
            onClick={onOpenCompanion}
            title="Команды четвероногому спутнику [P]"
            className="group px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 font-bold text-xs border border-stone-700 hover:border-amber-500 active:scale-95 transition-all flex items-center gap-1"
          >
            <Dog className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ПЁС</span>
          </button>

          {/* 6. СКЕТЧИ (Visual Art Gallery) */}
          <button
            onClick={onOpenGallery}
            title="Галерея скетчей и артов [G]"
            className="group p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-400 border border-stone-700 hover:border-amber-500 active:scale-95 transition-all"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
