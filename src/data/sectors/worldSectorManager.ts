import { SectorDefinition, SectorId, SectorTileType } from './types';
import { VILLAGE_HUB_SECTOR } from './villageHubData';
import { DEAD_FOREST_SECTOR } from './deadForestData';
import { RADIO_TOWER_SECTOR } from './radioTowerData';
import { BUNKER_SECTOR } from './bunkerData';

export const ALL_SECTORS: Record<SectorId, SectorDefinition> = {
  village_hub: VILLAGE_HUB_SECTOR,
  dead_forest: DEAD_FOREST_SECTOR,
  radio_tower: RADIO_TOWER_SECTOR,
  bunker_17: BUNKER_SECTOR,
};

export function getSectorById(id: SectorId): SectorDefinition {
  return ALL_SECTORS[id] || ALL_SECTORS.village_hub;
}

export function isPassableTile(tile: SectorTileType): boolean {
  return tile !== 'wall' && tile !== 'forest' && tile !== 'fence';
}

export function getTileProperties(tile: SectorTileType): {
  nameRu: string;
  movementAp: number;
  providesCover: boolean;
  isHazard?: boolean;
} {
  switch (tile) {
    case 'path':
    case 'asphalt':
    case 'concrete':
    case 'metal_floor':
      return { nameRu: 'Тропа / Покрытие', movementAp: 1, providesCover: false };
    case 'grass':
      return { nameRu: 'Высокая трава / Подлесок', movementAp: 1, providesCover: true };
    case 'debris':
      return { nameRu: 'Обломки / Завал', movementAp: 2, providesCover: true };
    case 'radiation':
      return { nameRu: 'Радиоактивная лужа', movementAp: 2, providesCover: false, isHazard: true };
    case 'bunker_gate':
      return { nameRu: 'Шлюз гермодвери', movementAp: 1, providesCover: true };
    case 'wall':
      return { nameRu: 'Стена / Перекрытие', movementAp: 99, providesCover: true };
    case 'fence':
      return { nameRu: 'Забор / Колючая проволока', movementAp: 99, providesCover: false };
    case 'forest':
      return { nameRu: 'Непроходимая чаща', movementAp: 99, providesCover: true };
    case 'ground':
    default:
      return { nameRu: 'Утрамбованный грунт', movementAp: 1, providesCover: false };
  }
}
