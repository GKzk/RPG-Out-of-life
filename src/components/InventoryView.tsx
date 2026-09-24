import React from 'react';
import { useGame } from '../context/GameContext';
import { ITEM_DATABASE } from '../data/items';
import {
  Package,
  Shield,
  Swords,
  Weight,
  AlertTriangle,
  Pill,
  Trash2,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    character,
    inventory,
    derivedStats,
    equipWeapon,
    equipArmor,
    useItem,
    removeItemFromInventory,
  } = useGame();

  if (!character) return null;

  const equippedWeapon = ITEM_DATABASE.find((i) => i.id === character.equippedWeaponId);
  const equippedArmor = ITEM_DATABASE.find((i) => i.id === character.equippedArmorId);

  const isOverweight = derivedStats.carryWeightCurrent > derivedStats.carryWeightMax;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-mono text-amber-300 space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 border border-amber-500/40 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
            <Package className="w-6 h-6" />
            <h1>ИНВЕНТАРЬ И СНАРЯЖЕНИЕ</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Управляйте арсеналом, защитной броней, запасами еды и медикаментами. Будьте осторожны с химией — она вызывает острую зависимость.
          </p>
        </div>

        {/* Carry Weight Gauge */}
        <div className={`p-3.5 rounded border text-right shrink-0 min-w-48 ${
          isOverweight ? 'bg-red-950/50 border-red-500 text-red-300' : 'bg-neutral-950 border-amber-500/30'
        }`}>
          <div className="text-xs text-neutral-400 flex items-center justify-end gap-1">
            <Weight className="w-3.5 h-3.5" />
            <span>Переносимый вес:</span>
          </div>
          <div className="text-xl font-bold font-mono">
            {derivedStats.carryWeightCurrent.toFixed(1)} / {derivedStats.carryWeightMax} кг
          </div>
          {isOverweight && (
            <div className="text-[10px] text-red-400 font-bold uppercase mt-0.5 flex items-center justify-end gap-1">
              <AlertTriangle className="w-3 h-3" /> Перегруз (-2 AP, штраф к бегу)
            </div>
          )}
        </div>
      </div>

      {/* Equipment Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weapon Slot */}
        <div className="bg-neutral-900 border border-amber-500/30 p-4 rounded-lg space-y-2">
          <div className="text-xs text-neutral-400 uppercase tracking-wider font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Swords className="w-4 h-4 text-amber-500" />
              <span>Экипированное Оружие</span>
            </span>
            {equippedWeapon && (
              <button
                onClick={() => equipWeapon(undefined)}
                className="text-[11px] text-neutral-500 hover:text-amber-300 underline"
              >
                Снять
              </button>
            )}
          </div>

          {equippedWeapon ? (
            <div className="bg-neutral-950 p-3 rounded border border-amber-500/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-amber-200 text-sm">{equippedWeapon.nameRu}</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Урон: <strong className="text-amber-300">{equippedWeapon.weaponData?.damageMin}-{equippedWeapon.weaponData?.damageMax}</strong> | 
                  Расход AP: <strong className="text-cyan-400">{equippedWeapon.weaponData?.apCost} AP</strong> | 
                  Дальность: <strong className="text-amber-400">{equippedWeapon.weaponData?.range}</strong>
                </div>
              </div>
              <span className="text-xs text-neutral-500 font-mono">{equippedWeapon.weight} кг</span>
            </div>
          ) : (
            <div className="bg-neutral-950/60 p-4 rounded border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
              Оружие не экипировано (Кулачный бой)
            </div>
          )}
        </div>

        {/* Armor Slot */}
        <div className="bg-neutral-900 border border-amber-500/30 p-4 rounded-lg space-y-2">
          <div className="text-xs text-neutral-400 uppercase tracking-wider font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Экипированная Броня</span>
            </span>
            {equippedArmor && (
              <button
                onClick={() => equipArmor(undefined)}
                className="text-[11px] text-neutral-500 hover:text-amber-300 underline"
              >
                Снять
              </button>
            )}
          </div>

          {equippedArmor ? (
            <div className="bg-neutral-950 p-3 rounded border border-amber-500/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-amber-200 text-sm">{equippedArmor.nameRu}</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Защита (AC): <strong className="text-amber-300">+{equippedArmor.armorData?.defense}</strong> | 
                  Рад. защиты: <strong className="text-emerald-400">+{equippedArmor.armorData?.radResistBonus || 0}%</strong>
                </div>
              </div>
              <span className="text-xs text-neutral-500 font-mono">{equippedArmor.weight} кг</span>
            </div>
          ) : (
            <div className="bg-neutral-950/60 p-4 rounded border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
              Броня не экипирована
            </div>
          )}
        </div>
      </div>

      {/* Inventory List Table */}
      <div className="bg-neutral-900 border border-amber-500/30 rounded-lg overflow-hidden shadow-lg">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Ваши Припасы</h2>
          <span className="text-xs text-neutral-400 font-mono">Предметов в рюкзаке: {inventory.length}</span>
        </div>

        {inventory.length > 0 ? (
          <div className="divide-y divide-neutral-800/80">
            {inventory.map((inv) => {
              const item = inv.item;
              const isEquippedWpn = character.equippedWeaponId === item.id;
              const isEquippedArm = character.equippedArmorId === item.id;
              const isEquipped = isEquippedWpn || isEquippedArm;

              return (
                <div
                  key={item.id}
                  className={`p-4 hover:bg-neutral-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isEquipped ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-200 text-sm">{item.nameRu}</span>
                      <span className="text-xs bg-neutral-950 border border-neutral-800 text-amber-400 px-2 py-0.2 rounded font-mono">
                        x{inv.quantity}
                      </span>
                      {isEquipped && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase">
                          Экипировано
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">{item.description}</p>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      Тип: <span className="text-amber-400/80">{item.type}</span> | Вес единицы:{' '}
                      <span className="text-neutral-300">{item.weight} кг</span> | Ценность:{' '}
                      <span className="text-amber-300">{item.value} крышек</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {item.type === 'weapon' && (
                      <button
                        onClick={() => equipWeapon(isEquippedWpn ? undefined : item.id)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                          isEquippedWpn
                            ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            : 'bg-amber-600 hover:bg-amber-500 text-neutral-950'
                        }`}
                      >
                        {isEquippedWpn ? 'Снять' : 'Экипировать'}
                      </button>
                    )}

                    {item.type === 'armor' && (
                      <button
                        onClick={() => equipArmor(isEquippedArm ? undefined : item.id)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                          isEquippedArm
                            ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            : 'bg-amber-600 hover:bg-amber-500 text-neutral-950'
                        }`}
                      >
                        {isEquippedArm ? 'Снять' : 'Экипировать'}
                      </button>
                    )}

                    {(item.type === 'consumable' || item.type === 'chem') && (
                      <button
                        onClick={() => useItem(item.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 rounded text-xs font-bold transition-colors"
                      >
                        Применить
                      </button>
                    )}

                    <button
                      onClick={() => removeItemFromInventory(item.id, 1)}
                      className="p-1.5 bg-neutral-950 hover:bg-red-950 text-neutral-500 hover:text-red-400 border border-neutral-800 hover:border-red-800 rounded transition-colors"
                      title="Выбросить 1 шт."
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-neutral-500">
            Ваш рюкзак пуст. Отправляйтесь исследовать руины Пустоши!
          </div>
        )}
      </div>
    </div>
  );
};
