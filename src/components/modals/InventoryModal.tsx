import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { CharacterPaperdoll } from '../visuals/CharacterPaperdoll';
import {
  Package,
  Weight,
  X,
  Layers,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface InventoryModalProps {
  onClose: () => void;
  initialTab?: 'paperdoll' | 'backpack';
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  onClose,
  initialTab = 'paperdoll',
}) => {
  const {
    character,
    derivedStats,
    inventory,
    equipWeapon,
    equipArmor,
    useItem,
    removeItemFromInventory,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'paperdoll' | 'backpack'>(initialTab);
  const [filterType, setFilterType] = useState<'all' | 'weapon' | 'armor' | 'chem' | 'consumable' | 'junk'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!character) return null;

  const isOverweight = derivedStats.carryWeightCurrent > derivedStats.carryWeightMax;

  const filteredItems = inventory.filter((inv) => {
    if (filterType === 'all') return true;
    if (filterType === 'weapon') return inv.item.type === 'weapon';
    if (filterType === 'armor') return inv.item.type === 'armor';
    if (filterType === 'chem') return inv.item.type === 'chem';
    if (filterType === 'consumable') return inv.item.type === 'consumable';
    if (filterType === 'junk') return inv.item.type === 'junk' || inv.item.type === 'ammo';
    return true;
  });

  const handleUse = (itemId: string, itemName: string) => {
    useItem(itemId);
    setActionNotice(`Использовано: ${itemName}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleEquip = (itemId: string) => {
    const item = inventory.find((inv) => inv.item.id === itemId)?.item;
    if (item?.type === 'weapon') {
      equipWeapon(character.equippedWeaponId === itemId ? undefined : itemId);
    } else if (item?.type === 'armor') {
      equipArmor(character.equippedArmorId === itemId ? undefined : itemId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono text-amber-300">
      <div className="relative w-full max-w-6xl bg-stone-950 border-2 border-amber-600/60 rounded-2xl shadow-[0_0_50px_rgba(217,119,6,0.25)] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Retro Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 px-5 py-3 border-b border-amber-600/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-950/70 border border-amber-600/60 text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-400 tracking-wider uppercase">
                ТЕРМИНАЛ ЭКИПИРОВКИ И СНАРЯЖЕНИЯ
              </h2>
              <p className="text-[11px] text-stone-400">
                Модульная кукла бойца, оружейные слоты и инвентарь выжившего
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Carry weight readout */}
            <div
              className={`px-3 py-1.5 rounded border text-xs font-bold flex items-center gap-1.5 ${
                isOverweight
                  ? 'bg-red-950/80 border-red-500 text-red-300'
                  : 'bg-stone-900 border-amber-500/40 text-amber-400'
              }`}
            >
              <Weight className="w-3.5 h-3.5" />
              <span>
                {derivedStats.carryWeightCurrent.toFixed(1)} / {derivedStats.carryWeightMax} кг
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-900 hover:bg-red-950/80 border border-stone-700 hover:border-red-600 text-stone-400 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action notification toast */}
        {actionNotice && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/60 px-4 py-2 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/90 px-4 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('paperdoll')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'paperdoll'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Модульная кукла экипировки</span>
          </button>
          <button
            onClick={() => setActiveTab('backpack')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'backpack'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Рюкзак и расходники ({inventory.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {activeTab === 'paperdoll' ? (
            <div className="space-y-4">
              <CharacterPaperdoll
                character={character}
                derivedStats={derivedStats}
                inventory={inventory}
                onEquipItem={(itemId) => {
                  const item = inventory.find((inv) => inv.item.id === itemId)?.item;
                  if (item?.type === 'weapon') equipWeapon(itemId);
                  if (item?.type === 'armor') equipArmor(itemId);
                }}
                onUnequipItem={(slot) => {
                  if (slot === 'weapon') equipWeapon('');
                  if (slot === 'armor') equipArmor('');
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-stone-800">
                {[
                  { id: 'all', label: 'Все предметы' },
                  { id: 'weapon', label: 'Оружие' },
                  { id: 'armor', label: 'Броня' },
                  { id: 'chem', label: 'Химия' },
                  { id: 'consumable', label: 'Провизия' },
                  { id: 'junk', label: 'Хлам и патроны' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterType(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      filterType === cat.id
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-amber-300 hover:border-stone-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredItems.map((inv) => {
                  const isEquipped =
                    character.equippedWeaponId === inv.item.id ||
                    character.equippedArmorId === inv.item.id;
                  const canEquip = inv.item.type === 'weapon' || inv.item.type === 'armor';
                  const canUse = inv.item.type === 'chem' || inv.item.type === 'consumable';

                  return (
                    <div
                      key={inv.item.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isEquipped
                          ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                          : 'bg-stone-900/80 border-stone-800 hover:border-amber-600/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-sm text-stone-100 flex items-center gap-1.5">
                            {inv.item.nameRu}
                            {inv.quantity > 1 && (
                              <span className="text-xs text-amber-400 font-mono">
                                ×{inv.quantity}
                              </span>
                            )}
                          </div>
                          {isEquipped && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-stone-950 font-bold uppercase tracking-wider shrink-0">
                              Надето
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                          {inv.item.description}
                        </div>

                        {/* Item Stats Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400">
                            {inv.item.weight} кг
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400">
                            {inv.item.value} кр.
                          </span>
                          {inv.item.weaponData && (
                            <span className="px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/60 text-red-300">
                              Урон {inv.item.weaponData.damageMin}-{inv.item.weaponData.damageMax} ({inv.item.weaponData.skillReq})
                            </span>
                          )}
                          {inv.item.armorData && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                              Класс брони +{inv.item.armorData.armorClassBonus} | ПУ {inv.item.armorData.damageThreshold}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-stone-800/80">
                        {canEquip && (
                          <button
                            onClick={() => handleEquip(inv.item.id)}
                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-colors ${
                              isEquipped
                                ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                                : 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold'
                            }`}
                          >
                            {isEquipped ? 'Снять' : 'Экипировать'}
                          </button>
                        )}

                        {canUse && (
                          <button
                            onClick={() => handleUse(inv.item.id, inv.item.nameRu)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-stone-950 transition-colors"
                          >
                            Применить
                          </button>
                        )}

                        <button
                          onClick={() => removeItemFromInventory(inv.item.id, 1)}
                          title="Выбросить 1 шт."
                          className="p-1.5 rounded-lg bg-stone-950 hover:bg-red-950 border border-stone-800 hover:border-red-600 text-stone-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12 text-stone-500 text-xs">
                  В этой категории нет предметов.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
