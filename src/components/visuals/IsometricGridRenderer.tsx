import React, { useMemo } from 'react';
import { SectorTileType } from '../../data/sectors/types';
import { MapPOI, PatrolEnemy, GridPosition } from '../../data/villageMapData';
import { Character } from '../../types/game';
import { PET_DEFINITIONS } from '../../data/pets';
import { CharacterSprite, SpriteDirection } from './CharacterSprite';
import { CompanionSprite } from './CompanionSprite';
import {
  Wrench,
  Lock,
  Footprints,
  Skull,
  Radio,
  Box,
  Home,
  AlertTriangle,
  Flame,
  Radiation,
} from 'lucide-react';

interface IsometricGridRendererProps {
  terrain: SectorTileType[][];
  gridWidth: number;
  gridHeight: number;
  playerPos: GridPosition;
  playerFacing: SpriteDirection;
  companionPos: GridPosition | null;
  selectedPetId?: string;
  pois: MapPOI[];
  enemies: PatrolEnemy[];
  revealedTiles: boolean[][];
  viewMode: 'isometric' | 'orthographic';
  hoveredTile: GridPosition | null;
  onTileClick: (x: number, y: number) => void;
  onTileHover: (x: number, y: number | null) => void;
  character: Character;
  flashlightOn: boolean;
  activePath?: GridPosition[];
}

export const IsometricGridRenderer: React.FC<IsometricGridRendererProps> = ({
  terrain,
  gridWidth,
  gridHeight,
  playerPos,
  playerFacing,
  companionPos,
  selectedPetId,
  pois,
  enemies,
  revealedTiles,
  viewMode,
  hoveredTile,
  onTileClick,
  onTileHover,
  character,
  flashlightOn,
  activePath = [],
}) => {
  const tileW = 58;
  const tileH = 29;

  // Origin offset to center the isometric diamond
  const originX = (gridHeight * tileW) / 2 + 60;
  const originY = 40;

  // Compute total isometric SVG canvas size
  const totalW = (gridWidth + gridHeight) * (tileW / 2) + 120;
  const totalH = (gridWidth + gridHeight) * (tileH / 2) + 180;

  // Map POI icon helper
  const renderPoiIcon = (iconName: MapPOI['iconName']) => {
    switch (iconName) {
      case 'home':
        return <Home className="w-3.5 h-3.5 text-amber-300" />;
      case 'wrench':
        return <Wrench className="w-3.5 h-3.5 text-blue-300" />;
      case 'radio':
        return <Radio className="w-3.5 h-3.5 text-cyan-300" />;
      case 'lock':
        return <Lock className="w-3.5 h-3.5 text-yellow-300" />;
      case 'skull':
        return <Skull className="w-3.5 h-3.5 text-red-400" />;
      case 'footprints':
        return <Footprints className="w-3.5 h-3.5 text-orange-300" />;
      case 'box':
      default:
        return <Box className="w-3.5 h-3.5 text-emerald-300" />;
    }
  };

  // Helper for tile coloring in retro CRPG palette
  const getTileFill = (type: SectorTileType, isRevealed: boolean) => {
    if (!isRevealed) return '#0c0a09';

    switch (type) {
      case 'grass':
        return '#253520';
      case 'forest':
        return '#142113';
      case 'path':
        return '#453828';
      case 'asphalt':
        return '#27272a';
      case 'concrete':
        return '#3f3f46';
      case 'metal_floor':
        return '#1e293b';
      case 'debris':
        return '#382c20';
      case 'radiation':
        return '#14532d';
      case 'bunker_gate':
        return '#78350f';
      case 'fence':
        return '#292524';
      case 'wall':
        return '#1c1917';
      case 'ground':
      default:
        return '#2e261e';
    }
  };

  // Helper for tile borders
  const getTileStroke = (type: SectorTileType, isRevealed: boolean) => {
    if (!isRevealed) return '#1c1917';
    switch (type) {
      case 'radiation':
        return '#22c55e';
      case 'metal_floor':
        return '#475569';
      case 'path':
      case 'asphalt':
        return '#524433';
      default:
        return '#1e1b18';
    }
  };

  if (viewMode === 'orthographic') {
    // 2D Classic Grid Render
    return (
      <div
        className="relative grid gap-[2px] bg-stone-950 p-4 border border-stone-800 rounded-xl select-none"
        style={{
          gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
          maxWidth: `${gridWidth * 44 + 32}px`,
        }}
        onMouseLeave={() => onTileHover(0, null)}
      >
        {terrain.map((row, y) =>
          row.map((tileType, x) => {
            const isRevealed = revealedTiles[y]?.[x] ?? true;
            const isPlayerHere = playerPos.x === x && playerPos.y === y;
            const isCompanionHere = companionPos?.x === x && companionPos?.y === y;
            const poi = pois.find((p) => p.x === x && p.y === y && !p.completed);
            const enemy = enemies.find((e) => e.x === x && e.y === y);
            const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
            const isInPath = activePath.some((p) => p.x === x && p.y === y);

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => onTileClick(x, y)}
                onMouseEnter={() => onTileHover(x, y)}
                className={`relative w-10 h-10 rounded border flex items-center justify-center cursor-pointer transition-all ${
                  isHovered
                    ? 'ring-2 ring-amber-400 z-10'
                    : isInPath
                    ? 'ring-1 ring-amber-400/70 bg-amber-500/20'
                    : ''
                }`}
                style={{
                  backgroundColor: getTileFill(tileType, isRevealed),
                  borderColor: getTileStroke(tileType, isRevealed),
                }}
              >
                {/* Radiation pulse */}
                {tileType === 'radiation' && isRevealed && (
                  <Radiation className="w-4 h-4 text-emerald-400/80 animate-spin-slow pointer-events-none" />
                )}

                {/* Wall icon */}
                {tileType === 'wall' && isRevealed && (
                  <div className="w-full h-full bg-stone-800/80 border border-stone-700/60 flex items-center justify-center">
                    <span className="text-[10px] text-stone-500 font-mono">■</span>
                  </div>
                )}

                {/* POI */}
                {poi && isRevealed && !isPlayerHere && (
                  <div className="p-1 rounded bg-amber-950/80 border border-amber-500 text-amber-300 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                    {renderPoiIcon(poi.iconName)}
                  </div>
                )}

                {/* Enemy */}
                {enemy && isRevealed && (
                  <div className="p-1 rounded bg-red-950/80 border border-red-500 text-red-400 animate-bounce">
                    <Skull className="w-4 h-4" />
                  </div>
                )}

                {/* Companion */}
                {isCompanionHere && selectedPetId && (
                  <CompanionSprite petId={selectedPetId} scale={0.7} />
                )}

                {/* Player */}
                {isPlayerHere && (
                  <CharacterSprite
                    character={character}
                    direction={playerFacing}
                    scale={0.7}
                    flashlightOn={flashlightOn}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  // --- ISOMETRIC CRPG RENDER ---
  return (
    <div
      className="relative overflow-auto max-h-[72vh] rounded-xl bg-stone-950 border border-amber-900/30 p-2 select-none"
      onMouseLeave={() => onTileHover(0, null)}
    >
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="w-full h-auto min-w-[760px] overflow-visible"
        style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.9))' }}
      >
        <defs>
          {/* Subtle grid line shadow */}
          <radialGradient id="isoFogGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
          </radialGradient>
        </defs>

        {/* 1. TERRAIN BASE LAYER */}
        {terrain.map((row, y) =>
          row.map((tileType, x) => {
            const isRevealed = revealedTiles[y]?.[x] ?? true;
            const cx = (x - y) * (tileW / 2) + originX;
            const cy = (x + y) * (tileH / 2) + originY;
            const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
            const isInPath = activePath.some((p) => p.x === x && p.y === y);

            // Diamond points: Top, Right, Bottom, Left
            const topPt = `${cx},${cy - tileH / 2}`;
            const rightPt = `${cx + tileW / 2},${cy}`;
            const bottomPt = `${cx},${cy + tileH / 2}`;
            const leftPt = `${cx - tileW / 2},${cy}`;
            const points = `${topPt} ${rightPt} ${bottomPt} ${leftPt}`;

            const fill = getTileFill(tileType, isRevealed);
            const stroke = isHovered
              ? '#fbbf24'
              : isInPath
              ? '#f59e0b'
              : getTileStroke(tileType, isRevealed);

            return (
              <g
                key={`iso-tile-${x}-${y}`}
                onClick={() => onTileClick(x, y)}
                onMouseEnter={() => onTileHover(x, y)}
                className="cursor-pointer"
              >
                {/* Isometric diamond floor */}
                <polygon
                  points={points}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isHovered ? 2 : 1}
                  className="transition-colors duration-150"
                />

                {/* Elevated Wall Block (Extruded 3D Isometric Wall) */}
                {tileType === 'wall' && isRevealed && (
                  <g className="pointer-events-none">
                    {/* Left wall face */}
                    <polygon
                      points={`${leftPt} ${bottomPt} ${cx},${cy + tileH / 2 - 20} ${cx - tileW / 2},${cy - 20}`}
                      fill="#141210"
                      stroke="#292524"
                      strokeWidth="0.8"
                    />
                    {/* Right wall face */}
                    <polygon
                      points={`${bottomPt} ${rightPt} ${cx + tileW / 2},${cy - 20} ${cx},${cy + tileH / 2 - 20}`}
                      fill="#26221d"
                      stroke="#292524"
                      strokeWidth="0.8"
                    />
                    {/* Top wall cap */}
                    <polygon
                      points={`${cx},${cy - tileH / 2 - 20} ${cx + tileW / 2},${cy - 20} ${cx},${cy + tileH / 2 - 20} ${cx - tileW / 2},${cy - 20}`}
                      fill="#3a332a"
                      stroke="#574c3e"
                      strokeWidth="1"
                    />
                  </g>
                )}

                {/* Radiation hazard green glow */}
                {tileType === 'radiation' && isRevealed && (
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={tileW / 3}
                    ry={tileH / 3}
                    fill="#22c55e"
                    fillOpacity="0.3"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })
        )}

        {/* 2. DYNAMIC ENTITIES LAYER (Y-SORTED FOR PROPER OVERLAP) */}
        {(() => {
          // Flatten entities: POIs, Enemies, Companion, Player
          const entities: Array<{
            key: string;
            x: number;
            y: number;
            depth: number;
            render: () => React.ReactNode;
          }> = [];

          // POIs
          pois.forEach((poi) => {
            if (!poi.completed && revealedTiles[poi.y]?.[poi.x]) {
              entities.push({
                key: `poi-${poi.id}`,
                x: poi.x,
                y: poi.y,
                depth: poi.y * 100 + poi.x + 5,
                render: () => {
                  const cx = (poi.x - poi.y) * (tileW / 2) + originX;
                  const cy = (poi.y + poi.x) * (tileH / 2) + originY;
                  return (
                    <g key={poi.id} className="pointer-events-none">
                      {/* Pulsing ring on floor */}
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={14}
                        ry={7}
                        fill="rgba(245,158,11,0.2)"
                        stroke="#f59e0b"
                        strokeWidth="1.2"
                        className="animate-ping"
                      />
                      {/* Floating POI Pin */}
                      <g transform={`translate(${cx - 12}, ${cy - 28})`}>
                        <rect
                          width="24"
                          height="24"
                          rx="6"
                          fill="#451a03"
                          stroke="#d97706"
                          strokeWidth="1.5"
                          className="shadow-lg"
                        />
                        <foreignObject x="4" y="4" width="16" height="16">
                          <div className="w-full h-full flex items-center justify-center">
                            {renderPoiIcon(poi.iconName)}
                          </div>
                        </foreignObject>
                      </g>
                    </g>
                  );
                },
              });
            }
          });

          // Enemies
          enemies.forEach((enemy) => {
            if (revealedTiles[enemy.y]?.[enemy.x]) {
              entities.push({
                key: `enemy-${enemy.id}`,
                x: enemy.x,
                y: enemy.y,
                depth: enemy.y * 100 + enemy.x + 10,
                render: () => {
                  const cx = (enemy.x - enemy.y) * (tileW / 2) + originX;
                  const cy = (enemy.y + enemy.x) * (tileH / 2) + originY;
                  return (
                    <g key={enemy.id} className="pointer-events-none">
                      {/* Red detection cone indicator */}
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={16}
                        ry={8}
                        fill="rgba(239,68,68,0.25)"
                        stroke="#ef4444"
                        strokeWidth="1.2"
                      />
                      {/* Enemy Sprite Pin */}
                      <g transform={`translate(${cx - 16}, ${cy - 40})`}>
                        <circle cx="16" cy="16" r="14" fill="#450a0a" stroke="#dc2626" strokeWidth="2" />
                        <foreignObject x="6" y="6" width="20" height="20">
                          <div className="w-full h-full flex items-center justify-center text-red-400">
                            <Skull className="w-4 h-4" />
                          </div>
                        </foreignObject>
                      </g>
                    </g>
                  );
                },
              });
            }
          });

          // Companion
          if (companionPos && selectedPetId) {
            entities.push({
              key: 'companion',
              x: companionPos.x,
              y: companionPos.y,
              depth: companionPos.y * 100 + companionPos.x + 15,
              render: () => {
                const cx = (companionPos.x - companionPos.y) * (tileW / 2) + originX;
                const cy = (companionPos.y + companionPos.x) * (tileH / 2) + originY;
                return (
                  <foreignObject
                    key="companion-obj"
                    x={cx - 24}
                    y={cy - 44}
                    width={48}
                    height={52}
                    className="pointer-events-none overflow-visible"
                  >
                    <CompanionSprite petId={selectedPetId} scale={0.9} />
                  </foreignObject>
                );
              },
            });
          }

          // Player
          entities.push({
            key: 'player',
            x: playerPos.x,
            y: playerPos.y,
            depth: playerPos.y * 100 + playerPos.x + 20,
            render: () => {
              const cx = (playerPos.x - playerPos.y) * (tileW / 2) + originX;
              const cy = (playerPos.y + playerPos.x) * (tileH / 2) + originY;
              return (
                <foreignObject
                  key="player-obj"
                  x={cx - 26}
                  y={cy - 56}
                  width={56}
                  height={68}
                  className="pointer-events-none overflow-visible"
                >
                  <CharacterSprite
                    character={character}
                    direction={playerFacing}
                    scale={1.05}
                    flashlightOn={flashlightOn}
                  />
                </foreignObject>
              );
            },
          });

          // Sort by depth for correct isometric Z-indexing
          return entities.sort((a, b) => a.depth - b.depth).map((e) => e.render());
        })()}
      </svg>
    </div>
  );
};
