import React, { useState } from 'react';
import { Character, DerivedStats, Item } from '../../types/game';
import { ITEM_DATABASE } from '../../data/items';
import { CharacterSprite, SpriteDirection } from './CharacterSprite';
import {
  Shield,
  Zap,
  Sword,
  RotateCw,
  X,
  Radio,
  Layers,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';

interface CharacterPaperdollProps {
  character: Character;
  derivedStats?: DerivedStats;
  inventory?: { item: Item; quantity: number }[];
  onEquipItem?: (itemId: string) => void;
  onUnequipItem?: (slot: 'weapon' | 'armor') => void;
  onClose?: () => void;
}

export const CharacterPaperdoll: React.FC<CharacterPaperdollProps> = ({
  character,
  derivedStats,
  inventory = [],
  onEquipItem,
  onUnequipItem,
  onClose,
}) => {
  const [direction, setDirection] = useState<SpriteDirection>('south');
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [activeSlot, setActiveSlot] = useState<'weapon' | 'armor' | 'head' | 'accessory' | null>(null);
  const [crtMode, setCrtMode] = useState(true);

  const equippedWeapon = character.equippedWeaponId
    ? ITEM_DATABASE.find((i) => i.id === character.equippedWeaponId)
    : null;
  const equippedArmor = character.equippedArmorId
    ? ITEM_DATABASE.find((i) => i.id === character.equippedArmorId)
    : null;

  // Filter available items from inventory
  const weaponsInInventory = inventory.filter((inv) => inv.item.type === 'weapon');
  const armorsInInventory = inventory.filter((inv) => inv.item.type === 'armor');

  const rotateFacing = () => {
    const sequence: SpriteDirection[] = ['south', 'east', 'north', 'west'];
    const nextIdx = (sequence.indexOf(direction) + 1) % sequence.length;
    setDirection(sequence[nextIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-4xl bg-stone-950 border-2 border-amber-600/60 rounded-xl shadow-[0_0_50px_rgba(217,119,6,0.25)] overflow-hidden flex flex-col max-h-[92vh] ${
          crtMode ? 'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] after:bg-[length:100%_4px]' : ''
        }`}
      >
        {/* Retro Header Bar */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 px-6 py-3.5 border-b border-amber-600/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-950/60 border border-amber-600/50 text-amber-400">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-400 tracking-wider font-mono uppercase">
                ТАКТИЧЕСКИЙ ТЕРМИНАЛ: КУКЛА ЭКИПИРОВКИ
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                {character.name} • Уровень {character.level} • {character.background}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCrtMode(!crtMode)}
              className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                crtMode
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-stone-900 border-stone-700 text-stone-500 hover:text-stone-300'
              }`}
            >
              CRT ЭКРАН: {crtMode ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-red-950/80 border border-stone-700 hover:border-red-600 text-stone-400 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto">
          {/* LEFT COLUMN: Slots & Quick Equip */}
          <div className="md:col-span-4 space-y-4">
            <div className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest pb-1 border-b border-amber-600/30 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Слоты снаряжения
            </div>

            {/* ARMOR SLOT */}
            <div
              onClick={() => setActiveSlot(activeSlot === 'armor' ? null : 'armor')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeSlot === 'armor'
                  ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-stone-900/60 border-stone-800 hover:border-amber-700/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-1">
                <span className="text-amber-400 font-bold">ТОРС / БРОНЯ</span>
                {equippedArmor && (
                  <span className="text-green-400">DT +{equippedArmor.armorData?.damageThreshold || 0}</span>
                )}
              </div>
              {equippedArmor ? (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-stone-200">{equippedArmor.nameRu}</div>
                    <div className="text-xs text-stone-400 mt-0.5 line-clamp-1">{equippedArmor.description}</div>
                  </div>
                  {onUnequipItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnequipItem('armor');
                      }}
                      className="ml-2 text-xs text-red-400 hover:text-red-300 underline font-mono"
                    >
                      Снять
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-stone-500 italic py-1">[Слот пуст: надета гражданская одежда]</div>
              )}
            </div>

            {/* WEAPON SLOT */}
            <div
              onClick={() => setActiveSlot(activeSlot === 'weapon' ? null : 'weapon')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeSlot === 'weapon'
                  ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-stone-900/60 border-stone-800 hover:border-amber-700/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-1">
                <span className="text-amber-400 font-bold">ОСНОВНОЕ ОРУЖИЕ</span>
                {equippedWeapon && (
                  <span className="text-red-400">
                    {equippedWeapon.weaponData?.damageMin}-{equippedWeapon.weaponData?.damageMax} УРН • {equippedWeapon.weaponData?.apCost} ОД
                  </span>
                )}
              </div>
              {equippedWeapon ? (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-stone-200">{equippedWeapon.nameRu}</div>
                    <div className="text-xs text-stone-400 mt-0.5 line-clamp-1">{equippedWeapon.description}</div>
                  </div>
                  {onUnequipItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnequipItem('weapon');
                      }}
                      className="ml-2 text-xs text-red-400 hover:text-red-300 underline font-mono"
                    >
                      Убрать
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-stone-500 italic py-1">[Без оружия: бой голыми кулаками]</div>
              )}
            </div>

            {/* HEADGEAR / ACCESSORY */}
            <div className="p-3 rounded-lg border bg-stone-900/40 border-stone-800/80">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-1">
                <span className="text-amber-500 font-bold">ГОЛОВА / ПРОТИВОГАЗ</span>
                <span className="text-amber-500/70">Рад. защита</span>
              </div>
              <div className="text-xs text-stone-300 flex items-center justify-between">
                <span>Противогаз ГП-5 (Автофильтрация)</span>
                <span className="text-xs text-emerald-400 font-mono">+35% Рад.</span>
              </div>
            </div>

            {/* SELECTABLE ITEMS LIST WHEN A SLOT IS CLICKED */}
            {activeSlot && (
              <div className="p-3 rounded-lg bg-stone-900/90 border border-amber-600/50 space-y-2 animate-fade-in">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center justify-between">
                  <span>Доступно в рюкзаке ({activeSlot === 'weapon' ? 'Оружие' : 'Броня'}):</span>
                  <button onClick={() => setActiveSlot(null)} className="text-stone-400 hover:text-stone-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {(activeSlot === 'weapon' ? weaponsInInventory : armorsInInventory).length === 0 ? (
                    <p className="text-xs text-stone-500 italic py-2">Нет подходящих предметов в рюкзаке</p>
                  ) : (
                    (activeSlot === 'weapon' ? weaponsInInventory : armorsInInventory).map(({ item }) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (onEquipItem) onEquipItem(item.id);
                          setActiveSlot(null);
                        }}
                        className="p-2 rounded bg-stone-950/80 hover:bg-amber-950/60 border border-stone-800 hover:border-amber-600/80 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-stone-200">{item.nameRu}</div>
                          <div className="text-[10px] text-stone-400">Вес: {item.weight} кг</div>
                        </div>
                        <button className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold font-mono">
                          Надеть
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CENTER COLUMN: 3D-Like High-Res Paperdoll Viewport */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-stone-900/90 via-stone-950 to-stone-900/90 border border-amber-900/30 rounded-xl relative shadow-inner">
            {/* Viewport Grid Background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #d97706 1px, transparent 1px), linear-gradient(to bottom, #d97706 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Pedestal & Character Sprite */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Radial Glow */}
              <div className="absolute w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

              <CharacterSprite
                character={character}
                direction={direction}
                isSelected={true}
                scale={2.6}
                flashlightOn={flashlightOn}
                className="transform hover:scale-105 transition-transform cursor-pointer"
              />
            </div>

            {/* Visual Controls */}
            <div className="flex items-center gap-3 mt-4 z-10">
              <button
                onClick={rotateFacing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-600/50 text-amber-400 text-xs font-mono font-bold transition-all shadow-md active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                ПОВОРОТ (90°)
              </button>
              <button
                onClick={() => setFlashlightOn(!flashlightOn)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                  flashlightOn
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-stone-900 border-stone-800 text-stone-500'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                ФОНАРЬ: {flashlightOn ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>

            <div className="text-[11px] text-stone-500 font-mono mt-3 text-center">
              Ракурс: {direction.toUpperCase()} • Масштаб: 260%
            </div>
          </div>

          {/* RIGHT COLUMN: Tactical Stats & Readouts */}
          <div className="md:col-span-3 space-y-4">
            <div className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest pb-1 border-b border-amber-600/30 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Боевые параметры
            </div>

            <div className="space-y-2.5 font-mono">
              <div className="p-2.5 rounded bg-stone-900/60 border border-stone-800/80 flex justify-between items-center text-xs">
                <span className="text-stone-400">Порог урона (DT):</span>
                <span className="text-amber-400 font-bold text-sm">
                  {equippedArmor?.armorData?.damageThreshold || 0} ед.
                </span>
              </div>

              <div className="p-2.5 rounded bg-stone-900/60 border border-stone-800/80 flex justify-between items-center text-xs">
                <span className="text-stone-400">Класс брони (AC):</span>
                <span className="text-amber-400 font-bold text-sm">
                  {derivedStats?.evasion ?? 12}%
                </span>
              </div>

              <div className="p-2.5 rounded bg-stone-900/60 border border-stone-800/80 flex justify-between items-center text-xs">
                <span className="text-stone-400">Очки действия (AP):</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {derivedStats?.maxAp ?? 10} ОД
                </span>
              </div>

              <div className="p-2.5 rounded bg-stone-900/60 border border-stone-800/80 flex justify-between items-center text-xs">
                <span className="text-stone-400">Рад. сопротивление:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {derivedStats?.radResist ?? 15}%
                </span>
              </div>

              <div className="p-2.5 rounded bg-stone-900/60 border border-stone-800/80 flex justify-between items-center text-xs">
                <span className="text-stone-400">Шанс критич. удара:</span>
                <span className="text-red-400 font-bold text-sm">
                  {derivedStats?.critChance ?? 5}%
                </span>
              </div>
            </div>

            {/* Quick Slogan / Lore quote */}
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-300/80 font-mono italic">
              «Снаряжение — это броня между твоей плотью и беспощадным пеплом старого мира.»
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
