import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import {
  VILLAGE_TERRAIN_MAP,
  INITIAL_VILLAGE_POIS,
  INITIAL_PATROL_ENEMIES,
  MAP_GRID_WIDTH,
  MAP_GRID_HEIGHT,
  MapPOI,
  PatrolEnemy,
  TileType,
  GridPosition,
} from '../../data/villageMapData';
import { PET_DEFINITIONS } from '../../data/pets';
import { CharacterSprite } from './CharacterSprite';
import { CompanionSprite } from './CompanionSprite';
import { CompanionCommandPanel } from './CompanionCommandPanel';
import { InteractionDialogModal } from './InteractionDialogModal';
import { SketchGalleryModal } from './SketchGalleryModal';
import {
  Compass,
  Eye,
  Shield,
  Zap,
  RotateCcw,
  Palette,
  AlertTriangle,
  Lock,
  Wrench,
  Home,
  Radio,
  Package,
  Footprints,
  Info,
  CheckCircle,
} from 'lucide-react';

export const VillageTacticalMap: React.FC = () => {
  const {
    character,
    effectiveSpecial,
    derivedStats,
    addItemToInventory,
    addExperience,
    addLogMessage,
    startCombatEncounter,
  } = useGame();

  if (!character) return null;

  // Player position
  const [playerPos, setPlayerPos] = useState<GridPosition>({ x: 5, y: 5 });
  const [playerFacing, setPlayerFacing] = useState<'north' | 'south' | 'east' | 'west'>('south');
  const [companionPos, setCompanionPos] = useState<GridPosition>({ x: 4, y: 5 });
  const [currentAp, setCurrentAp] = useState<number>(derivedStats?.maxAp || 10);

  // Map state
  const [pois, setPois] = useState<MapPOI[]>(INITIAL_VILLAGE_POIS);
  const [patrol, setPatrol] = useState<PatrolEnemy[]>(INITIAL_PATROL_ENEMIES);
  const [exploredTiles, setExploredTiles] = useState<boolean[][]>(() =>
    Array(MAP_GRID_HEIGHT)
      .fill(false)
      .map(() => Array(MAP_GRID_WIDTH).fill(false))
  );

  // Active Modals & Buffs
  const [activePoi, setActivePoi] = useState<MapPOI | null>(null);
  const [showSketchGallery, setShowSketchGallery] = useState(false);
  const [activeCompanionBuff, setActiveCompanionBuff] = useState<string | null>(null);
  const [scoutRevealedTurns, setScoutRevealedTurns] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [safeRouteActive, setSafeRouteActive] = useState<boolean>(false);

  const selectedPet =
    PET_DEFINITIONS.find((p) => p.id === character?.petId) || PET_DEFINITIONS[0];

  // Helper: check if tile is walkable
  const isWalkable = (x: number, y: number): boolean => {
    if (x < 0 || x >= MAP_GRID_WIDTH || y < 0 || y >= MAP_GRID_HEIGHT) return false;
    const tile = VILLAGE_TERRAIN_MAP[y][x];
    if (tile === 'wall' || tile === 'forest' || tile === 'fence') return false;
    return true;
  };

  // Helper: calculate distance
  const getDistance = (pos1: GridPosition, pos2: GridPosition) => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  };

  // Reveal tiles around player
  useEffect(() => {
    setExploredTiles((prev) => {
      const next = prev.map((row) => [...row]);
      const sightRadius = scoutRevealedTurns > 0 ? 8 : 3;
      for (let y = 0; y < MAP_GRID_HEIGHT; y++) {
        for (let x = 0; x < MAP_GRID_WIDTH; x++) {
          if (getDistance({ x, y }, playerPos) <= sightRadius) {
            next[y][x] = true;
          }
        }
      }
      return next;
    });
  }, [playerPos, scoutRevealedTurns]);

  // Handle player movement
  const handleTileClick = (targetX: number, targetY: number) => {
    if (!isWalkable(targetX, targetY)) return;

    const dist = getDistance(playerPos, { x: targetX, y: targetY });
    // Move up to 1 tile per click (adjacent)
    if (dist > 1) return;

    if (currentAp < 1) {
      setAlertMessage('Недостаточно Очков Действия (AP)! Завершите ход для восстановления сил.');
      return;
    }

    // Determine facing
    if (targetX > playerPos.x) setPlayerFacing('east');
    else if (targetX < playerPos.x) setPlayerFacing('west');
    else if (targetY > playerPos.y) setPlayerFacing('south');
    else if (targetY < playerPos.y) setPlayerFacing('north');

    // Move companion to previous player position
    setCompanionPos({ ...playerPos });
    // Move player
    setPlayerPos({ x: targetX, y: targetY });
    setCurrentAp((prev) => Math.max(0, prev - 1));

    // Progress patrol enemy
    advancePatrolTurn();

    // Check if player entered marauder vision cone
    checkPatrolDetection({ x: targetX, y: targetY });
  };

  // Move patrol along their route
  const advancePatrolTurn = () => {
    setPatrol((prev) =>
      prev.map((enemy) => {
        const nextIndex = (enemy.currentRouteIndex + 1) % enemy.route.length;
        const nextPos = enemy.route[nextIndex];
        let nextFacing = enemy.facing;
        if (nextPos.x > enemy.x) nextFacing = 'east';
        else if (nextPos.x < enemy.x) nextFacing = 'west';
        else if (nextPos.y > enemy.y) nextFacing = 'south';
        else if (nextPos.y < enemy.y) nextFacing = 'north';

        return {
          ...enemy,
          x: nextPos.x,
          y: nextPos.y,
          facing: nextFacing,
          currentRouteIndex: nextIndex,
        };
      })
    );

    if (scoutRevealedTurns > 0) {
      setScoutRevealedTurns((prev) => prev - 1);
    }
  };

  // Check if enemy sees player
  const checkPatrolDetection = (pos: GridPosition) => {
    const isPlayerInGrass = VILLAGE_TERRAIN_MAP[pos.y][pos.x] === 'grass';
    const isStealthBuffed = activeCompanionBuff?.includes('Барсик');

    patrol.forEach((enemy) => {
      // Vision cone: 2 cells ahead and 1 diagonal
      let inVision = false;
      if (enemy.facing === 'south' && pos.y > enemy.y && pos.y <= enemy.y + 2 && Math.abs(pos.x - enemy.x) <= 1) {
        inVision = true;
      } else if (enemy.facing === 'north' && pos.y < enemy.y && pos.y >= enemy.y - 2 && Math.abs(pos.x - enemy.x) <= 1) {
        inVision = true;
      } else if (enemy.facing === 'east' && pos.x > enemy.x && pos.x <= enemy.x + 2 && Math.abs(pos.y - enemy.y) <= 1) {
        inVision = true;
      } else if (enemy.facing === 'west' && pos.x < enemy.x && pos.x >= enemy.x - 2 && Math.abs(pos.y - enemy.y) <= 1) {
        inVision = true;
      }

      if (inVision) {
        if (isPlayerInGrass || isStealthBuffed) {
          setAlertMessage('Внимание: Дозорный мародёр прошёл рядом, но густая трава скрыла вас!');
          addLogMessage('Скрытность: Вы затаились в траве, избежав обнаружения патрулём.', 'info');
        } else {
          setAlertMessage('ТРЕВОГА! Дозорный мародёр заметил движение у ворот!');
          addLogMessage('Обнаружение! Мародёр поднял карабин и вскинул руку к тревожному свистку!', 'hazard');
        }
      }
    });
  };

  // Reset AP and end turn
  const handleEndTurn = () => {
    setCurrentAp(derivedStats?.maxAp || 10);
    advancePatrolTurn();
    setAlertMessage('Ход завершен. Очки действия восстановлены.');
    addLogMessage('Тактический ход: позиция выверена, патруль сместился.', 'turn');
  };

  // Execute companion command
  const handleExecuteCompanionCommand = (buffKey: string, commandNameRu: string) => {
    setActiveCompanionBuff(commandNameRu);

    if (buffKey === 'crow_scout') {
      setScoutRevealedTurns(3);
      addLogMessage('Каркун взмыл ввысь, открыв обзор на всю деревню и постройки.', 'info');
    } else if (buffKey === 'hound_track') {
      setSafeRouteActive(true);
      addLogMessage('Байкал учуял запах костров бандитов и подсветил безопасную тропу.', 'info');
    } else if (buffKey === 'hound_bark' || buffKey === 'crow_distract') {
      // Rotate enemy away from player
      setPatrol((prev) =>
        prev.map((enemy) => ({
          ...enemy,
          facing: 'north',
        }))
      );
      addLogMessage(`Отвлечение: ${commandNameRu} заставил часового повернуться к северным амбарам.`, 'hit');
    } else if (buffKey === 'boar_ram') {
      // Clear obstacle at (1, 6)
      setPois((prev) =>
        prev.map((p) => (p.id === 'heavy_rubble' ? { ...p, descriptionRu: 'Завал расчищен мощным ударом кабанчика!' } : p))
      );
      addLogMessage('Буян с глухим треском расколол сгнившие балки завала погреба!', 'hit');
    }

    setTimeout(() => {
      setActiveCompanionBuff(null);
    }, 6000);
  };

  // Complete POI
  const handleCompletePOI = (poiId: string, itemsGained: { itemId: string; count: number }[], xpGained: number) => {
    setPois((prev) => prev.map((p) => (p.id === poiId ? { ...p, completed: true } : p)));

    // Grant items
    itemsGained.forEach((loot) => {
      addItemToInventory({ id: loot.itemId } as any, loot.count);
    });

    // Grant XP
    if (xpGained > 0) {
      addExperience(xpGained, 'Исследование Пустой деревни');
    }

    addLogMessage(`Локация: Исследован объект [${poiId}], получено ${xpGained} XP.`, 'heal');
  };

  // Render tile visuals
  const renderTileContent = (x: number, y: number, tile: TileType) => {
    const isPlayer = playerPos.x === x && playerPos.y === y;
    const isCompanion = companionPos.x === x && companionPos.y === y && selectedPet.id !== 'none' && !isPlayer;
    const enemyAtTile = patrol.find((e) => e.x === x && e.y === y);
    const poiAtTile = pois.find((p) => p.x === x && p.y === y);
    const isExplored = exploredTiles[y][x];

    // Distance to player
    const distToPlayer = getDistance(playerPos, { x, y });
    const isVisibleNow = scoutRevealedTurns > 0 || distToPlayer <= 3;
    const isAdjacentWalkable = distToPlayer === 1 && isWalkable(x, y);

    // Vision cone overlay
    let inPatrolVision = false;
    patrol.forEach((enemy) => {
      if (enemy.facing === 'south' && y > enemy.y && y <= enemy.y + 2 && Math.abs(x - enemy.x) <= 1) inPatrolVision = true;
      if (enemy.facing === 'north' && y < enemy.y && y >= enemy.y - 2 && Math.abs(x - enemy.x) <= 1) inPatrolVision = true;
      if (enemy.facing === 'east' && x > enemy.x && x <= enemy.x + 2 && Math.abs(y - enemy.y) <= 1) inPatrolVision = true;
      if (enemy.facing === 'west' && x < enemy.x && x >= enemy.x - 2 && Math.abs(y - enemy.y) <= 1) inPatrolVision = true;
    });

    // Color/texture according to tile
    let bgClass = 'bg-[#1a1714]';
    if (tile === 'grass') bgClass = 'bg-[#29331f] border-[#3f4f30]/40';
    else if (tile === 'path') bgClass = 'bg-[#3b3429] border-[#52493a]/40';
    else if (tile === 'wall') bgClass = 'bg-[#261f18] border-[#423427]';
    else if (tile === 'forest') bgClass = 'bg-[#0f1f14] border-[#183321]';
    else if (tile === 'fence') bgClass = 'bg-[#2a221b] border-[#544335]';
    else if (tile === 'debris') bgClass = 'bg-[#2d2822] border-[#4a4238]';

    return (
      <div
        key={`${x}-${y}`}
        onClick={() => {
          if (poiAtTile && distToPlayer <= 1) {
            setActivePoi(poiAtTile);
          } else {
            handleTileClick(x, y);
          }
        }}
        className={`relative w-12 h-12 md:w-14 md:h-14 border border-black/40 flex items-center justify-center transition-all cursor-pointer ${bgClass} ${
          isAdjacentWalkable ? 'hover:ring-2 hover:ring-amber-400/80 hover:bg-amber-500/10' : ''
        }`}
        style={{
          opacity: isVisibleNow ? 1 : isExplored ? 0.45 : 0.15,
        }}
      >
        {/* Subtle grid pattern / textures */}
        {tile === 'wall' && (
          <div className="absolute inset-1 flex flex-col justify-between py-1 border border-[#524030] rounded bg-[#36291f]">
            <div className="h-0.5 bg-[#1f1712]" />
            <div className="h-0.5 bg-[#1f1712]" />
            <div className="h-0.5 bg-[#1f1712]" />
          </div>
        )}

        {tile === 'forest' && (
          <div className="text-emerald-900/60 font-bold text-[18px] select-none">▲▲</div>
        )}

        {tile === 'fence' && (
          <div className="w-full h-1 bg-[#854d0e]/60 border-t border-b border-[#451a03]" />
        )}

        {tile === 'grass' && (
          <div className="absolute bottom-1 right-1 text-emerald-500/30 text-[10px]">░░</div>
        )}

        {/* Patrol Vision Warning Overlay */}
        {inPatrolVision && isVisibleNow && (
          <div className="absolute inset-0 bg-red-600/20 border border-red-500/40 pointer-events-none animate-pulse" />
        )}

        {/* Safe route hint */}
        {safeRouteActive && x === 5 && (
          <div className="absolute inset-0 border border-dashed border-cyan-400/50 bg-cyan-500/10 pointer-events-none" />
        )}

        {/* POI Marker */}
        {poiAtTile && isExplored && !isPlayer && !enemyAtTile && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (distToPlayer <= 1) {
                setActivePoi(poiAtTile);
              } else {
                setAlertMessage(`Слишком далеко для осмотра! Подойдите ближе к [${poiAtTile.nameRu}].`);
              }
            }}
            className={`z-10 p-1 rounded-full border shadow-md transition-transform hover:scale-110 ${
              poiAtTile.completed
                ? 'bg-neutral-800 text-neutral-500 border-neutral-700'
                : 'bg-amber-500 text-neutral-950 border-amber-300 animate-bounce'
            }`}
          >
            {poiAtTile.iconName === 'home' && <Home className="w-3.5 h-3.5" />}
            {poiAtTile.iconName === 'wrench' && <Wrench className="w-3.5 h-3.5" />}
            {poiAtTile.iconName === 'radio' && <Radio className="w-3.5 h-3.5" />}
            {poiAtTile.iconName === 'box' && <Package className="w-3.5 h-3.5" />}
            {poiAtTile.iconName === 'footprints' && <Footprints className="w-3.5 h-3.5" />}
            {poiAtTile.iconName === 'lock' && <Lock className="w-3.5 h-3.5" />}
          </div>
        )}

        {/* Patrol Enemy Token */}
        {enemyAtTile && isVisibleNow && (
          <div className="z-20 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-red-700 border-2 border-red-400 flex items-center justify-center text-white shadow-lg shadow-red-600/50">
              <span className="text-[10px] font-bold">М</span>
            </div>
            <div className="text-[9px] text-red-300 font-bold bg-black/80 px-1 rounded -mt-1 border border-red-500/40">
              Дозор
            </div>
          </div>
        )}

        {/* Player Sprite */}
        {isPlayer && (
          <div className="z-30 absolute -top-3">
            <CharacterSprite character={character} direction={playerFacing} scale={0.85} isSelected={true} />
          </div>
        )}

        {/* Companion Sprite */}
        {isCompanion && (
          <div className="z-25 absolute -top-1">
            <CompanionSprite petId={selectedPet.id} scale={0.8} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 font-mono space-y-4">
      {/* Top Banner & Quick Controls */}
      <div className="bg-neutral-900 border border-amber-500/40 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <span>Тактическая карта: Пустая деревня</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                12 x 10 Сетка
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Сектор Подмосковья • Пошаговое исследование руин • Патруль «Стервятников»
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* AP Counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300">Очки действия:</span>
            <span className="text-cyan-400 font-bold text-sm">
              {currentAp} / {derivedStats?.maxAp || 10} AP
            </span>
          </div>

          {/* End Turn button */}
          <button
            onClick={handleEndTurn}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-800 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-2 transition-all active:translate-y-0.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Завершить ход</span>
          </button>

          {/* Artbook / Sketch Gallery button */}
          <button
            onClick={() => setShowSketchGallery(true)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Арт-бук & Скетчи</span>
          </button>
        </div>
      </div>

      {/* Alert / Notification strip */}
      {alertMessage && (
        <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{alertMessage}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-neutral-400 hover:text-amber-200 text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tactical Grid View + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Left: Tactical Grid (Takes 3 columns on large screens) */}
        <div className="lg:col-span-3 bg-neutral-950 border border-neutral-800 rounded-xl p-4 shadow-xl flex flex-col items-center overflow-x-auto">
          {/* Tactical Header bar */}
          <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-xs text-neutral-400">
            <div className="flex items-center gap-4">
              <span>
                Координаты: <strong className="text-amber-400">[{playerPos.x}, {playerPos.y}]</strong>
              </span>
              <span>
                Ландшафт: <strong className="text-neutral-200">{VILLAGE_TERRAIN_MAP[playerPos.y][playerPos.x]}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              <span>Туман войны активен (Линия взгляда)</span>
            </div>
          </div>

          {/* Grid Canvas */}
          <div
            className="inline-grid gap-[1px] p-2 bg-neutral-900/80 rounded-lg border border-neutral-800 shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${MAP_GRID_WIDTH}, minmax(0, 1fr))`,
            }}
          >
            {VILLAGE_TERRAIN_MAP.map((row, y) =>
              row.map((tile, x) => renderTileContent(x, y, tile))
            )}
          </div>

          {/* Grid Legend */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-[#36291f] border border-[#524030]" /> Сруб (стена)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-[#29331f] border border-[#3f4f30]" /> Высокая трава (стелс)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-[#3b3429]" /> Тропа
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-red-600/30 border border-red-500/50" /> Сектор мародёра
              </span>
            </div>
            <span className="text-amber-500/80">Клик по соседней клетке — перемещение (1 AP)</span>
          </div>
        </div>

        {/* Right Sidebar: Companion & Objectives Panel */}
        <div className="space-y-4">
          {/* Companion Command Panel */}
          <CompanionCommandPanel
            pet={selectedPet}
            onExecuteCommand={handleExecuteCompanionCommand}
            activeBuff={activeCompanionBuff}
            scoutRevealedTurns={scoutRevealedTurns}
          />

          {/* Objectives & POI checklist */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-xs space-y-3">
            <h4 className="font-bold text-amber-300 flex items-center gap-2 border-b border-neutral-800 pb-2">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>Цели пролога в деревне</span>
            </h4>

            <div className="space-y-2 text-[11px]">
              {pois.map((poi) => (
                <div
                  key={poi.id}
                  onClick={() => {
                    if (getDistance(playerPos, { x: poi.x, y: poi.y }) <= 1) {
                      setActivePoi(poi);
                    } else {
                      setAlertMessage(`Подойдите к объекту [${poi.nameRu}], чтобы начать взаимодействие.`);
                    }
                  }}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    poi.completed
                      ? 'bg-neutral-950/60 border-neutral-800 text-neutral-500 line-through'
                      : 'bg-neutral-950 border-amber-500/20 text-neutral-300 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        poi.completed ? 'bg-neutral-600' : 'bg-amber-400 animate-pulse'
                      }`}
                    />
                    <span>{poi.nameRu}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    [{poi.x},{poi.y}]
                  </span>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>Совет следопыта:</span>
              </div>
              <p>
                Не вступайте в лобовой бой со всеми мародёрами сразу. Обойдите патруль по кустам слева или отвлеките спутником, чтобы собрать стартовое снаряжение и выйти на лесную тропу.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* POI Interaction Modal */}
      {activePoi && (
        <InteractionDialogModal
          poi={activePoi}
          character={character}
          effectiveSpecial={effectiveSpecial}
          companionId={selectedPet.id}
          onClose={() => setActivePoi(null)}
          onCompletePOI={handleCompletePOI}
          onStartCombatWithPatrol={() => {
            setActivePoi(null);
            startCombatEncounter();
          }}
        />
      )}

      {/* Concept Sketch & Model Gallery Modal */}
      {showSketchGallery && (
        <SketchGalleryModal character={character} onClose={() => setShowSketchGallery(false)} />
      )}
    </div>
  );
};
