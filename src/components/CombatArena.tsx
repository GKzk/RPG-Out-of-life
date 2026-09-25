import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ITEM_DATABASE } from '../data/items';
import { calculateSkillValue } from '../utils/statCalculations';
import { getAttributeMod, getLckThreatMin } from '../utils/characterSystem';
import {
  Swords,
  Shield,
  Zap,
  Heart,
  Crosshair,
  Footprints,
  ShieldAlert,
  Flame,
  User,
  Bot,
  Skull,
  Bug,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';

export const CombatArena: React.FC = () => {
  const {
    character,
    effectiveSpecial,
    derivedStats,
    combatState,
    startCombatEncounter,
    performPlayerAttack,
    performPlayerDefensiveStance,
    performPlayerMove,
    passPlayerCombatTurn,
    endCombat,
    useItem,
    inventory,
  } = useGame();

  const [aimedPart, setAimedPart] = useState<'head' | 'body' | 'arms' | 'legs'>('body');

  if (!character) return null;

  // Render start encounter button if not in combat
  if (!combatState.inCombat || !combatState.enemy) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 font-mono text-amber-300 text-center space-y-6">
        <div className="bg-neutral-900 border border-amber-500/40 p-8 rounded-lg shadow-xl space-y-4">
          <div className="w-16 h-16 bg-red-500/10 border-2 border-red-500/40 rounded-full flex items-center justify-center mx-auto text-red-400">
            <Swords className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-amber-200 uppercase tracking-wider">
            ПОШАГОВАЯ БОЕВАЯ АРЕНА (DnD 5e + VATS)
          </h1>
          <p className="text-xs text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Испытайте вашего выжившего в пошаговой схватке. Точность зависит от <strong className="text-amber-300">Восприятия</strong> и навыков владения оружием, уклонение — от <strong className="text-amber-300">Ловкости</strong>, урон — от оружия и <strong className="text-amber-300">Силы</strong>.
          </p>

          <button
            onClick={() => startCombatEncounter()}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-8 rounded-lg text-sm shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Flame className="w-5 h-5" />
            <span>НАЙТИ ВРАГА И НАЧАТЬ БОЙ</span>
          </button>
        </div>
      </div>
    );
  }

  const { enemy, turnOwner, round, distance, playerDefensiveStance } = combatState;
  const isPlayerTurn = turnOwner === 'player';

  const weapon = ITEM_DATABASE.find((i) => i.id === character.equippedWeaponId);
  const weaponData = weapon?.weaponData || {
    damageMin: 3,
    damageMax: 6,
    apCost: 3,
    range: 'melee' as const,
    skillReq: 'unarmed' as any,
  };

  // Live preview mirrors the actual D20 attack resolver.
  // No legacy percentage formula or aimed-part accuracy/AP modifier is used.
  const skillVal = calculateSkillValue(weaponData.skillReq, character, effectiveSpecial);
  const attackMod = getAttributeMod(effectiveSpecial.PER);
  const targetAC = enemy.evasion + (combatState.enemyDefensiveStance ? 4 : 0);
  const requiredD20 = Math.max(2, targetAC - attackMod - skillVal);
  const normalHitFaces = Math.max(0, 21 - Math.max(2, requiredD20));
  const natural20AutoHit = 1;
  const previewHitChance = Math.round(((normalHitFaces + natural20AutoHit) / 20) * 100);

  const apCost = weaponData.apCost;
  const critThreat = getLckThreatMin(effectiveSpecial.LCK);

  const stimpakItem = inventory.find((i) => i.item.id === 'stimpak');

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-mono text-amber-300 space-y-6">
      {/* Top Combat Status Header */}
      <div className="bg-neutral-900 border border-red-500/50 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-red-600 text-white font-bold text-xs rounded uppercase tracking-wider animate-pulse">
            РАУНД {round}
          </span>
          <span className="text-sm font-bold text-amber-200">
            Чей ход: {isPlayerTurn ? <strong className="text-emerald-400">ВАШ ХОД (ИГРОК)</strong> : <strong className="text-red-400">ХОД ВРАГА</strong>}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            Дистанция: <strong className="text-amber-300 uppercase">{distance}</strong>
          </div>
          <button
            onClick={() => endCombat(false)}
            className="text-xs text-neutral-400 hover:text-red-400 underline"
          >
            Сбежать из боя
          </button>
        </div>
      </div>

      {/* Battlefield Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Player Card */}
        <div className="lg:col-span-5 bg-neutral-900 border border-emerald-500/40 p-5 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
              <User className="w-5 h-5" />
              <span>{character.name} (Вы)</span>
            </div>
            {playerDefensiveStance && (
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                В Защитной Стойке (+4 Evas)
              </span>
            )}
          </div>

          {/* Vitals */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Здоровье (HP)</span>
                <span className="text-emerald-400 font-bold">{character.currentHp} / {derivedStats.maxHp}</span>
              </div>
              <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.max(0, (character.currentHp / derivedStats.maxHp) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Очки Действий (AP)</span>
                <span className="text-cyan-400 font-bold">{character.currentAp} / {derivedStats.maxAp}</span>
              </div>
              <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-cyan-500 transition-all"
                  style={{ width: `${Math.max(0, (character.currentAp / derivedStats.maxAp) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-neutral-950 p-3 rounded border border-neutral-800 text-xs space-y-1">
            <div>Экипировано: <strong className="text-amber-200">{weapon ? weapon.nameRu : 'Без оружия'}</strong></div>
            <div className="text-neutral-400 text-[11px]">
              Базовый урон: {weaponData.damageMin}-{weaponData.damageMax} | Расход: {weaponData.apCost} AP
            </div>
          </div>
        </div>

        {/* Versus Divider */}
        <div className="lg:col-span-2 flex items-center justify-center">
          <div className="text-center font-bold text-red-500 text-xl font-mono">VS</div>
        </div>

        {/* Enemy Card */}
        <div className="lg:col-span-5 bg-neutral-900 border border-red-500/40 p-5 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
              <Skull className="w-5 h-5 text-red-500" />
              <span>{enemy.nameRu}</span>
            </div>
            <span className="text-xs text-neutral-400">Броня: {enemy.armor}</span>
          </div>

          {/* Enemy HP */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">Здоровье Врага (HP)</span>
              <span className="text-red-400 font-bold">{enemy.hpCurrent} / {enemy.hpMax}</span>
            </div>
            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-red-600 transition-all"
                style={{ width: `${Math.max(0, (enemy.hpCurrent / enemy.hpMax) * 100)}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed bg-neutral-950 p-3 rounded border border-neutral-800">
            {enemy.description}
          </p>
        </div>
      </div>

      {/* VATS & Combat Controls */}
      <div className="bg-neutral-900 border border-amber-500/30 p-5 rounded-lg space-y-4">
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-amber-400" />
          <span>СИСТЕМА ПРИЦЕЛИВАНИЯ V.A.T.S. И БОЕВЫЕ ДЕЙСТВИЯ</span>
        </h2>

        {/* Body Part Aim Selector */}
        <div className="space-y-2">
          <label className="text-xs text-neutral-400 block">Выберите зону прицеливания:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['head', 'body', 'arms', 'legs'] as const).map((part) => {
              const isSelected = aimedPart === part;
              const labels = {
                head: 'Голова (+30% крит, -20% точность)',
                body: 'Торс (Стандарт)',
                arms: 'Руки (Обезоружить)',
                legs: 'Ноги (Замедление)',
              };

              return (
                <button
                  key={part}
                  onClick={() => setAimedPart(part)}
                  className={`p-2.5 rounded text-left border text-xs transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="uppercase font-semibold">{part}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{labels[part]}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hit Chance & Attack Action */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-neutral-950 p-3 rounded border border-neutral-800 text-center">
            <div className="text-[10px] text-neutral-500 uppercase">Шанс попадания (VATS)</div>
            <div className="text-2xl font-bold text-amber-300 font-mono mt-0.5">{previewHitChance}%</div>
          </div>

          <div className="bg-neutral-950 p-3 rounded border border-neutral-800 text-center">
            <div className="text-[10px] text-neutral-500 uppercase">Стоимость Атаки</div>
            <div className="text-2xl font-bold text-cyan-400 font-mono mt-0.5">{apCost} AP</div>
          </div>

          <button
            onClick={() => performPlayerAttack(aimedPart)}
            disabled={!isPlayerTurn || character.currentAp < apCost}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-20 text-neutral-950 font-bold py-3 px-6 rounded text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Swords className="w-5 h-5" />
            <span>АТАКОВАТЬ ({aimedPart.toUpperCase()})</span>
          </button>
        </div>

        {/* Utility Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800">
          <button
            onClick={performPlayerDefensiveStance}
            disabled={!isPlayerTurn || character.currentAp < 3}
            className="p-2.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-20 border border-neutral-800 rounded text-xs text-cyan-300 font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Защита (3 AP)</span>
          </button>

          <button
            onClick={() => performPlayerMove(distance === 'melee' ? 'medium' : 'melee')}
            disabled={!isPlayerTurn || character.currentAp < 2}
            className="p-2.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-20 border border-neutral-800 rounded text-xs text-amber-300 font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Footprints className="w-4 h-4" />
            <span>Сменить дистанцию (2 AP)</span>
          </button>

          {stimpakItem ? (
            <button
              onClick={() => useItem('stimpak')}
              disabled={!isPlayerTurn}
              className="p-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>Стимулятор ({stimpakItem.quantity})</span>
            </button>
          ) : (
            <button
              disabled
              className="p-2.5 bg-neutral-950 opacity-30 border border-neutral-800 text-xs text-neutral-500 rounded flex items-center justify-center gap-1.5"
            >
              Нет Стимуляторов
            </button>
          )}

          <button
            onClick={passPlayerCombatTurn}
            disabled={!isPlayerTurn}
            className="p-2.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-4 h-4 text-red-400" />
            <span>Завершить ход</span>
          </button>
        </div>
      </div>
    </div>
  );
};
