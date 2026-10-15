import { MapPOI, PatrolEnemy, GridPosition } from '../villageMapData';

export type SectorId = 'village_hub' | 'dead_forest' | 'radio_tower' | 'bunker_17';

export type SectorTileType =
  | 'ground'
  | 'grass'
  | 'path'
  | 'wall'
  | 'debris'
  | 'fence'
  | 'forest'
  | 'asphalt'
  | 'concrete'
  | 'metal_floor'
  | 'radiation'
  | 'water'
  | 'bunker_gate';

export interface SectorTransition {
  id: string;
  nameRu: string;
  targetSectorId: SectorId;
  x: number;
  y: number;
  targetSpawnX: number;
  targetSpawnY: number;
  directionRu: string;
  travelMinutes: number;
  travelHunger: number;
  travelThirst: number;
}

export interface SectorDefinition {
  id: SectorId;
  nameRu: string;
  subtitleRu: string;
  dangerRating: 'Безопасно (Хаб)' | 'Низкая (1-2 ур)' | 'Средняя (2-3 ур)' | 'Высокая (3-4 ур)';
  atmosphereRu: string;
  descriptionRu: string;
  gridWidth: number;
  gridHeight: number;
  terrain: SectorTileType[][];
  pois: MapPOI[];
  enemies: PatrolEnemy[];
  defaultSpawn: GridPosition;
  transitions: SectorTransition[];
}
