import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { SectorId, SectorTileType } from '../../data/sectors/types';
import { ALL_SECTORS, getSectorById, isPassableTile, getTileProperties } from '../../data/sectors/worldSectorManager';
import { MapPOI, PatrolEnemy, GridPosition } from '../../data/villageMapData';
import { PET_DEFINITIONS } from '../../data/pets';
import { ITEM_DATABASE } from '../../data/items';
import { ENEMY_DATABASE } from '../../data/enemies';
import { SpriteDirection } from './CharacterSprite';
import { IsometricGridRenderer } from './IsometricGridRenderer';
import { ThreeIsometricViewport } from './ThreeIsometricViewport';
import { CompanionCommandPanel } from './CompanionCommandPanel';
import { InteractionDialogModal } from './InteractionDialogModal';
import { SketchGalleryModal } from './SketchGalleryModal';
import { CharacterPaperdoll } from './CharacterPaperdoll';
import { RadialWorldMapModal } from './RadialWorldMapModal';
import { FalloutDialogueModal } from '../dialogue/FalloutDialogueModal';
import { ELDER_MATVEY_DIALOGUE, RAIDER_SENTRY_DIALOGUE } from '../../data/dialogueNodes';
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
  Layers,
  MapPin,
  Move,
  Volume2,
  Tv,
} from 'lucide-react';

export const VillageTacticalMap: React.FC = () => {
  const {
    character,
    effectiveSpecial,
    derivedStats,
    inventory,
    addItemToInventory,
    addExperience,
    addLogMessage,
    startCombatEncounter,
    equipWeapon,
    equipArmor,
    passTime,
  } = useGame();

  if (!character) return null;

  // Current Active Sector
  const [currentSectorId, setCurrentSectorId] = useState<SectorId>('village_hub');
  const sector = getSectorById(currentSectorId);

  // Sector-specific State Records (preserves explored tiles and completed POIs when switching sectors)
  const [sectorPois, setSectorPois] = useState<Record<SectorId, MapPOI[]>>({
    village_hub: ALL_SECTORS.village_hub.pois,
    dead_forest: ALL_SECTORS.dead_forest.pois,
    radio_tower: ALL_SECTORS.radio_tower.pois,
    bunker_17: ALL_SECTORS.bunker_17.pois,
  });

  const [sectorEnemies, setSectorEnemies] = useState<Record<SectorId, PatrolEnemy[]>>({
    village_hub: ALL_SECTORS.village_hub.enemies,
    dead_forest: ALL_SECTORS.dead_forest.enemies,
    radio_tower: ALL_SECTORS.radio_tower.enemies,
    bunker_17: ALL_SECTORS.bunker_17.enemies,
  });

  const [sectorExplored, setSectorExplored] = useState<Record<SectorId, boolean[][]>>({
    village_hub: Array(ALL_SECTORS.village_hub.gridHeight)
      .fill(false)
      .map(() => Array(ALL_SECTORS.village_hub.gridWidth).fill(false)),
    dead_forest: Array(ALL_SECTORS.dead_forest.gridHeight)
      .fill(false)
      .map(() => Array(ALL_SECTORS.dead_forest.gridWidth).fill(false)),
    radio_tower: Array(ALL_SECTORS.radio_tower.gridHeight)
      .fill(false)
      .map(() => Array(ALL_SECTORS.radio_tower.gridWidth).fill(false)),
    bunker_17: Array(ALL_SECTORS.bunker_17.gridHeight)
      .fill(false)
      .map(() => Array(ALL_SECTORS.bunker_17.gridWidth).fill(false)),
  });

  // Player position & movement
  const [playerPos, setPlayerPos] = useState<GridPosition>(sector.defaultSpawn);
  const [playerFacing, setPlayerFacing] = useState<SpriteDirection>('south');
  const [companionPos, setCompanionPos] = useState<GridPosition>({
    x: Math.max(0, sector.defaultSpawn.x - 1),
    y: sector.defaultSpawn.y,
  });
  const [currentAp, setCurrentAp] = useState<number>(derivedStats?.maxAp || 10);
  const [stance, setStance] = useState<'normal' | 'sneak' | 'sprint'>('normal');

  // Engine Display Options
  const [viewMode, setViewMode] = useState<'isometric' | 'orthographic'>('isometric');
  const [flashlightOn, setFlashlightOn] = useState<boolean>(true);
  const [crtScanlines, setCrtScanlines] = useState<boolean>(true);
  const [hoveredTile, setHoveredTile] = useState<GridPosition | null>(null);

  // Active Modals & Overlays
  const [activePoi, setActivePoi] = useState<MapPOI | null>(null);
  const [showSketchGallery, setShowSketchGallery] = useState(false);
  const [showPaperdoll, setShowPaperdoll] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [scoutRevealedTurns, setScoutRevealedTurns] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [safeRouteActive, setSafeRouteActive] = useState<boolean>(false);
  const [is3DEngine, setIs3DEngine] = useState<boolean>(true);

  const selectedPet =
    PET_DEFINITIONS.find((p) => p.id === character?.petId) || PET_DEFINITIONS[0];

  const currentTerrain = sector.terrain;
  const currentPois = sectorPois[currentSectorId] || [];
  const currentEnemies = sectorEnemies[currentSectorId] || [];
  const explored = sectorExplored[currentSectorId] || [];

  // Helper: check if tile is walkable
  const isWalkable = (x: number, y: number): boolean => {
    if (x < 0 || x >= sector.gridWidth || y < 0 || y >= sector.gridHeight) return false;
    const tile = currentTerrain[y][x];
    return isPassableTile(tile);
  };

  // Helper: Manhattan distance
  const getDistance = (pos1: GridPosition, pos2: GridPosition) => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  };

  // Switch Sector Handler
  const handleSwitchSector = (targetSectorId: SectorId, spawnX?: number, spawnY?: number) => {
    const targetSector = getSectorById(targetSectorId);
    setCurrentSectorId(targetSectorId);

    const newSpawn = {
      x: spawnX !== undefined ? spawnX : targetSector.defaultSpawn.x,
      y: spawnY !== undefined ? spawnY : targetSector.defaultSpawn.y,
    };

    setPlayerPos(newSpawn);
    setCompanionPos({
      x: Math.max(0, newSpawn.x - 1),
      y: newSpawn.y,
    });
    setCurrentAp(derivedStats?.maxAp || 10);
    setAlertMessage(`Переход в локацию: ${targetSector.nameRu}`);
    addLogMessage(`Вы прибыли в ${targetSector.nameRu}. ${targetSector.atmosphereRu}`);
    if (passTime) passTime(1);
  };

  // Reveal tiles around player based on Perception (PER)
  useEffect(() => {
    setSectorExplored((prev) => {
      const currentGrid = prev[currentSectorId] || [];
      const nextGrid = currentGrid.map((row) => [...row]);
      const basePerception = effectiveSpecial?.PER || 5;
      const sightRadius = scoutRevealedTurns > 0 ? 10 : flashlightOn ? basePerception + 2 : basePerception;
      let changed = false;

      for (let y = 0; y < sector.gridHeight; y++) {
        for (let x = 0; x < sector.gridWidth; x++) {
          if (getDistance({ x, y }, playerPos) <= sightRadius) {
            if (nextGrid[y] && !nextGrid[y][x]) {
              nextGrid[y][x] = true;
              changed = true;
            }
          }
        }
      }

      if (!changed) return prev;
      return { ...prev, [currentSectorId]: nextGrid };
    });
  }, [playerPos, scoutRevealedTurns, flashlightOn, currentSectorId, sector.gridHeight, sector.gridWidth, effectiveSpecial?.PER]);

  // Handle tile click (movement & POI triggers)
  const handleTileClick = (targetX: number, targetY: number) => {
    // Check if clicking directly on a transition tile
    const transition = sector.transitions.find((t) => t.x === targetX && t.y === targetY);
    if (transition && getDistance(playerPos, { x: targetX, y: targetY }) <= 2) {
      handleSwitchSector(transition.targetSectorId, transition.targetSpawnX, transition.targetSpawnY);
      return;
    }

    if (!isWalkable(targetX, targetY)) {
      setAlertMessage('Препятствие: клетка непроходима!');
      return;
    }

    const dist = getDistance(playerPos, { x: targetX, y: targetY });
    if (dist === 0) return;

    // Movement AP calculation
    const apCostPerTile = stance === 'sneak' ? 2 : stance === 'sprint' ? 1 : 1;
    const requiredAp = Math.ceil(dist * apCostPerTile * (stance === 'sprint' ? 0.8 : 1));

    if (currentAp < requiredAp) {
      setAlertMessage(`Недостаточно ОД! Требуется ${requiredAp} ОД, доступно ${currentAp}. Завершите ход.`);
      return;
    }

    // Determine facing direction
    const dx = targetX - playerPos.x;
    const dy = targetY - playerPos.y;
    let newFacing: SpriteDirection = 'south';
    if (Math.abs(dx) > Math.abs(dy)) {
      newFacing = dx > 0 ? 'east' : 'west';
    } else {
      newFacing = dy > 0 ? 'south' : 'north';
    }
    setPlayerFacing(newFacing);

    // Update positions
    const oldPos = { ...playerPos };
    setPlayerPos({ x: targetX, y: targetY });
    setCompanionPos(oldPos);
    setCurrentAp((prev) => Math.max(0, prev - requiredAp));
    setAlertMessage(null);

    // Enemy Patrol movement tick
    stepPatrolEnemies({ x: targetX, y: targetY });

    // Check if stepped into transition trigger
    const arrivedTransition = sector.transitions.find((t) => t.x === targetX && t.y === targetY);
    if (arrivedTransition) {
      handleSwitchSector(arrivedTransition.targetSectorId, arrivedTransition.targetSpawnX, arrivedTransition.targetSpawnY);
      return;
    }

    // Check for nearby POI
    const nearPoi = currentPois.find(
      (poi) => !poi.completed && getDistance({ x: targetX, y: targetY }, { x: poi.x, y: poi.y }) <= 1
    );
    if (nearPoi) {
      setActivePoi(nearPoi);
    }
  };

  // Advance enemy patrol paths and check detection
  const stepPatrolEnemies = (newPlayerPos: GridPosition) => {
    setSectorEnemies((prev) => {
      const updated = currentEnemies.map((enemy) => {
        let nextIndex = (enemy.currentRouteIndex + 1) % enemy.route.length;
        let nextPos = enemy.route[nextIndex];

        // Detection check
        const distToPlayer = getDistance(nextPos, newPlayerPos);
        const tileProps = getTileProperties(currentTerrain[newPlayerPos.y]?.[newPlayerPos.x] || 'ground');
        const effectiveVision = tileProps.providesCover || stance === 'sneak' ? Math.max(1, enemy.visionRange - 2) : enemy.visionRange;

        const isSpotted = distToPlayer <= effectiveVision;

        if (isSpotted && !enemy.alerted) {
          setAlertMessage(`ВНИМАНИЕ! ${enemy.nameRu} заметил движение! Уходите в укрытие или атакуйте.`);
          addLogMessage(`[ТРЕВОГА] ${enemy.nameRu} насторожился и взял оружие на изготовку!`);
        }

        return {
          ...enemy,
          x: nextPos.x,
          y: nextPos.y,
          currentRouteIndex: nextIndex,
          alerted: isSpotted,
        };
      });

      return { ...prev, [currentSectorId]: updated };
    });
  };

  // Turn reset / Rest action
  const handleEndTurn = () => {
    const maxAp = derivedStats?.maxAp || 10;
    setCurrentAp(maxAp);
    setAlertMessage('Ход завершен. Очки действия восстановлены (100%).');
    addLogMessage('Вы выждали удобный момент, восстановив тактические силы.');

    // Step enemies
    stepPatrolEnemies(playerPos);

    if (scoutRevealedTurns > 0) {
      setScoutRevealedTurns((prev) => prev - 1);
    }
  };

  // Companion Command Handler
  const handleCompanionCommand = (commandId: string, commandNameRu: string) => {
    const apCost = 2;
    if (currentAp < apCost) {
      setAlertMessage(`Недостаточно ОД для команды питомцу (${apCost} ОД)!`);
      return;
    }

    setCurrentAp((prev) => Math.max(0, prev - apCost));

    switch (commandId) {
      case 'scout_area':
      case 'cat_sense':
        setScoutRevealedTurns(3);
        setAlertMessage(`Питомец ${selectedPet.nameRu} провел разведку! Радиус видимости увеличен.`);
        addLogMessage(`[СПУТНИК] ${selectedPet.nameRu} исследовал сектор, подсветив тайники.`);
        break;
      case 'distract_guard':
        setSectorEnemies((prev) => {
          const stunned = currentEnemies.map((e) => ({ ...e, alerted: false, visionRange: 1 }));
          return { ...prev, [currentSectorId]: stunned };
        });
        setAlertMessage(`Питомец отвлек часовых! Радиус обзора противников временно снижен.`);
        addLogMessage(`[СПУТНИК] Мародёры отвлеклись на шум в кустах!`);
        break;
      case 'track_scent':
        setSafeRouteActive(true);
        setAlertMessage('Гончая взяла след! На сетке подсвечены безопасные тропы и схроны.');
        addLogMessage(`[СПУТНИК] Байкал учуял запах пороха и тайников.`);
        break;
      case 'ram_door':
      case 'ferret_dig':
        setAlertMessage('Питомец помог с обходом препятствий. Проверки замков облегчены!');
        break;
      default:
        setAlertMessage(`Команда ${commandNameRu || commandId} выполнена.`);
    }
  };

  // Complete POI inspection and grant rewards
  const handlePoiComplete = (poiId: string, rewards: { itemId: string; count: number }[], xp: number) => {
    setSectorPois((prev) => {
      const updated = currentPois.map((p) => (p.id === poiId ? { ...p, completed: true } : p));
      return { ...prev, [currentSectorId]: updated };
    });

    rewards.forEach((r) => {
      const foundItem = ITEM_DATABASE.find((i) => i.id === r.itemId);
      if (foundItem) {
        addItemToInventory(foundItem, r.count);
      }
    });

    if (xp > 0) {
      addExperience(xp);
    }

    addLogMessage(`Успешное взаимодействие с объектом! Получено +${xp} XP.`);
    setActivePoi(null);
  };

  return (
    <div
      className={`relative w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 ${
        crtScanlines
          ? 'after:pointer-events-none after:fixed after:inset-0 after:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] after:bg-[length:100%_4px] after:z-40'
          : ''
      }`}
    >
      {/* --- TOP TACTICAL CONTROL BAR --- */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-amber-600/40 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Sector Name & Atmosphere */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-950/70 border border-amber-600/60 text-amber-400">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-amber-400 tracking-wider">
                {sector.nameRu}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 border border-stone-700 text-stone-300">
                {sector.dangerRating}
              </span>
            </div>
            <p className="text-xs text-stone-400 font-mono line-clamp-1">{sector.subtitleRu}</p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Radial Hub World Map */}
          <button
            onClick={() => setShowWorldMap(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-600/50 text-amber-400 text-xs font-mono font-bold transition-all shadow-md active:scale-95"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            КАРТА РЕГИОНА
          </button>

          {/* Character Paperdoll */}
          <button
            onClick={() => setShowPaperdoll(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500 text-amber-300 text-xs font-mono font-bold transition-all shadow-md active:scale-95"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            КУКЛА ЭКИПИРОВКИ
          </button>

          {/* Sketch Gallery */}
          <button
            onClick={() => setShowSketchGallery(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-mono font-bold transition-all active:scale-95"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            АРТ-СКЕТЧИ
          </button>

          {/* 3D Engine Toggle (ATOM RPG Style) */}
          <button
            onClick={() => setIs3DEngine(!is3DEngine)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono font-bold transition-all active:scale-95 ${
              is3DEngine
                ? 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-stone-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            {is3DEngine ? 'АТОМ 3D ДВИЖОК ВКЛ' : '2Д СЕТКА'}
          </button>

          {/* Perspective View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'isometric' ? 'orthographic' : 'isometric')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-bold transition-all active:scale-95"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            {viewMode === 'isometric' ? 'РЕЖИМ: ИЗОМЕТРИЯ' : 'РЕЖИМ: СЕТКА 2D'}
          </button>

          {/* CRT Monitor Effect Toggle */}
          <button
            onClick={() => setCrtScanlines(!crtScanlines)}
            className={`p-2 rounded-lg border text-xs font-mono transition-all ${
              crtScanlines
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-500'
            }`}
            title="Переключить кинескопный сканлайн CRT"
          >
            <Tv className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --- AP STATUS, STANCE, AND TRANSITIONS BAR --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Tactical Status Cards */}
        <div className="md:col-span-8 flex flex-wrap items-center gap-3 p-3.5 bg-stone-900/80 border border-amber-900/40 rounded-xl font-mono text-xs">
          {/* Action Points */}
          <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-lg border border-amber-600/30">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-stone-400">ОЧКИ ДЕЙСТВИЯ:</span>
            <span className="text-cyan-400 font-bold text-sm">
              {currentAp} / {derivedStats?.maxAp || 10}
            </span>
          </div>

          {/* Stance Selector */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
            <button
              onClick={() => setStance('sneak')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                stance === 'sneak'
                  ? 'bg-emerald-900/80 border border-emerald-500 text-emerald-300'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Скрытность (Стелс)
            </button>
            <button
              onClick={() => setStance('normal')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                stance === 'normal'
                  ? 'bg-amber-950/80 border border-amber-500 text-amber-300'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Шаг
            </button>
            <button
              onClick={() => setStance('sprint')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                stance === 'sprint'
                  ? 'bg-red-950/80 border border-red-500 text-red-300'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Бег
            </button>
          </div>

          {/* Flashlight Button */}
          <button
            onClick={() => setFlashlightOn(!flashlightOn)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              flashlightOn
                ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                : 'bg-stone-950 border-stone-800 text-stone-500'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Фонарь {flashlightOn ? 'ВКЛ (+2 к Обзору)' : 'ВЫКЛ'}
          </button>

          {/* End Turn */}
          <button
            onClick={handleEndTurn}
            className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono transition-all shadow active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            КОНЕЦ ХОДА
          </button>
        </div>

        {/* Sector Transitions Quick Navigator */}
        <div className="md:col-span-4 p-3.5 bg-stone-900/80 border border-amber-900/40 rounded-xl flex items-center justify-between font-mono text-xs">
          <div>
            <div className="text-[11px] text-stone-400 uppercase font-bold">Выходы из сектора:</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {sector.transitions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSwitchSector(t.targetSectorId, t.targetSpawnX, t.targetSpawnY)}
                  className="px-2 py-0.5 rounded bg-stone-950 hover:bg-amber-950 border border-stone-700 hover:border-amber-500 text-amber-400 text-[11px] font-bold"
                >
                  {t.directionRu}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right text-[11px] text-stone-500">
            {sector.gridWidth}x{sector.gridHeight} клеток
          </div>
        </div>
      </div>

      {/* --- NOTIFICATION / ALERT BANNER --- */}
      {alertMessage && (
        <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/80 text-amber-300 font-mono text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{alertMessage}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="text-stone-400 hover:text-stone-200">
            ×
          </button>
        </div>
      )}

      {/* --- MAIN TACTICAL VIEWPORT & COMPANION PANEL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CENTER TACTICAL CANVAS (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center">
          {is3DEngine ? (
            <ThreeIsometricViewport
              terrain={currentTerrain}
              gridWidth={sector.gridWidth}
              gridHeight={sector.gridHeight}
              playerPos={playerPos}
              playerFacing={playerFacing}
              companionPos={companionPos}
              selectedPetId={character.petId || 'hound'}
              pois={currentPois}
              enemies={currentEnemies}
              revealedTiles={explored}
              hoveredTile={hoveredTile}
              onTileClick={handleTileClick}
              onTileHover={(x: number | null, y: number | null) => (x === null || y === null ? setHoveredTile(null) : setHoveredTile({ x, y }))}
              character={character}
              flashlightOn={flashlightOn}
            />
          ) : (
            <IsometricGridRenderer
              terrain={currentTerrain}
              gridWidth={sector.gridWidth}
              gridHeight={sector.gridHeight}
              playerPos={playerPos}
              playerFacing={playerFacing}
              companionPos={companionPos}
              selectedPetId={character.petId}
              pois={currentPois}
              enemies={currentEnemies}
              revealedTiles={explored}
              viewMode={viewMode}
              hoveredTile={hoveredTile}
              onTileClick={handleTileClick}
              onTileHover={(x, y) => (y === null ? setHoveredTile(null) : setHoveredTile({ x, y }))}
              character={character}
              flashlightOn={flashlightOn}
            />
          )}

          <div className="w-full flex items-center justify-between text-[11px] text-stone-500 font-mono mt-2 px-2">
            <span>Кликните по клетке для перемещения или подхода к объекту осмотра</span>
            <span>Позиция: X:{playerPos.x}, Y:{playerPos.y}</span>
          </div>
        </div>

        {/* RIGHT SIDEBAR: COMPANION & SECTOR INFO (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Companion Command Panel */}
          <CompanionCommandPanel
            pet={selectedPet}
            onExecuteCommand={handleCompanionCommand}
            scoutRevealedTurns={scoutRevealedTurns}
          />

          {/* Sector Lore & Active POIs Overview */}
          <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 font-mono space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest pb-1 border-b border-stone-800 flex items-center justify-between">
              <span>Объекты сектора ({currentPois.filter((p) => !p.completed).length})</span>
              <span className="text-[10px] text-stone-500">Инспекция</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {currentPois.map((poi) => (
                <div
                  key={poi.id}
                  onClick={() => {
                    if (!poi.completed) {
                      // Move player adjacent to POI
                      handleTileClick(
                        Math.max(0, Math.min(sector.gridWidth - 1, poi.x)),
                        Math.max(0, Math.min(sector.gridHeight - 1, poi.y + 1))
                      );
                      setActivePoi(poi);
                    }
                  }}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between ${
                    poi.completed
                      ? 'bg-stone-950/40 border-stone-900 text-stone-600'
                      : 'bg-stone-950/80 border-stone-800 hover:border-amber-600/70 text-stone-300'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      {poi.nameRu}
                      {poi.completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <div className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                      {poi.descriptionRu}
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-500 shrink-0 ml-2">
                    {poi.completed ? 'Изучено' : `DC ${poi.difficulty || 10}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {/* 1. POI Inspection Modal */}
      {activePoi && (
        <InteractionDialogModal
          poi={activePoi}
          character={character}
          effectiveSpecial={effectiveSpecial}
          companionId={character.petId}
          onClose={() => setActivePoi(null)}
          onCompletePOI={(poiId: string, itemsGained: { itemId: string; count: number }[], xpGained: number) =>
            handlePoiComplete(poiId, itemsGained, xpGained)
          }
          onStartCombatWithPatrol={() => {
            const marauderEnemy = ENEMY_DATABASE.find((e) => e.id === 'raider_psycho') || ENEMY_DATABASE[0];
            if (marauderEnemy) {
              startCombatEncounter(marauderEnemy);
            }
          }}
        />
      )}

      {/* 2. Character Paperdoll Screen */}
      {showPaperdoll && (
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
          onClose={() => setShowPaperdoll(false)}
        />
      )}

      {/* 3. Radial World Map Modal */}
      {showWorldMap && (
        <RadialWorldMapModal
          currentSectorId={currentSectorId}
          onSelectSector={handleSwitchSector}
          onClose={() => setShowWorldMap(false)}
        />
      )}

      {/* 4. Sketch Gallery Modal */}
      {showSketchGallery && (
        <SketchGalleryModal
          character={character}
          onClose={() => setShowSketchGallery(false)}
        />
      )}
    </div>
  );
};
