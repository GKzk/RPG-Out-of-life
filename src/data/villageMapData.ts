export type TileType = 'ground' | 'grass' | 'path' | 'wall' | 'debris' | 'fence' | 'forest';

export interface GridPosition {
  x: number;
  y: number;
}

export interface MapPOI {
  id: string;
  nameRu: string;
  iconName: 'home' | 'wrench' | 'radio' | 'box' | 'skull' | 'footprints' | 'lock';
  x: number;
  y: number;
  descriptionRu: string;
  associatedSkill?: string;
  difficulty?: number;
  completed?: boolean;
  requiresCompanionSkill?: 'ferret_burrow' | 'boar_ram' | 'crow_scout' | 'hound_track' | 'cat_sense';
  lootItems?: { itemId: string; count: number }[];
  rewardXp?: number;
}

export interface PatrolEnemy {
  id: string;
  nameRu: string;
  x: number;
  y: number;
  facing: 'north' | 'south' | 'east' | 'west';
  visionRange: number;
  route: GridPosition[];
  currentRouteIndex: number;
  alerted: boolean;
}

export const MAP_GRID_WIDTH = 12;
export const MAP_GRID_HEIGHT = 10;

// Base layout of "Пустая деревня" (12x10 grid)
// 0: ground, 1: grass, 2: path, 3: wall, 4: debris, 5: fence, 6: forest
export const VILLAGE_TERRAIN_MAP: TileType[][] = [
  ['forest', 'forest', 'forest', 'forest', 'fence',  'path',   'path',   'fence',  'forest', 'forest', 'forest', 'forest'],
  ['forest', 'grass',  'ground', 'ground', 'ground', 'path',   'path',   'ground', 'ground', 'grass',  'forest', 'forest'],
  ['forest', 'wall',   'wall',   'wall',   'ground', 'path',   'path',   'ground', 'wall',   'wall',   'wall',   'forest'],
  ['fence',  'wall',   'ground', 'wall',   'ground', 'path',   'path',   'ground', 'wall',   'ground', 'wall',   'fence'],
  ['ground', 'wall',   'ground', 'wall',   'ground', 'path',   'path',   'debris', 'wall',   'ground', 'wall',   'ground'],
  ['ground', 'ground', 'ground', 'ground', 'ground', 'path',   'path',   'ground', 'ground', 'ground', 'ground', 'ground'],
  ['ground', 'debris', 'ground', 'ground', 'ground', 'path',   'path',   'ground', 'ground', 'ground', 'debris', 'ground'],
  ['forest', 'wall',   'wall',   'wall',   'ground', 'path',   'path',   'ground', 'grass',  'ground', 'ground', 'forest'],
  ['forest', 'wall',   'ground', 'wall',   'ground', 'path',   'path',   'ground', 'grass',  'ground', 'forest', 'forest'],
  ['forest', 'forest', 'forest', 'forest', 'fence',  'path',   'path',   'fence',  'forest', 'forest', 'forest', 'forest'],
];

export const INITIAL_VILLAGE_POIS: MapPOI[] = [
  {
    id: 'elders_cabin',
    nameRu: 'Изба Старосты',
    iconName: 'home',
    x: 2,
    y: 3,
    descriptionRu: 'Полуразрушенный бревенчатый дом старосты. На массивном дубовом столе лежит тяжелый запертый кованый сундук.',
    associatedSkill: 'Lockpick',
    difficulty: 14,
    rewardXp: 40,
    lootItems: [
      { itemId: 'canned_cram', count: 2 },
      { itemId: 'hunting_knife', count: 1 },
      { itemId: 'dirty_water', count: 2 },
    ],
  },
  {
    id: 'blacksmith_generator',
    nameRu: 'Кузница & Дизель-генератор',
    iconName: 'wrench',
    x: 9,
    y: 3,
    descriptionRu: 'Старая механическая мастерская. В углу стоит закопченный дизель-генератор, у которого перебиты медные контакты стартера.',
    associatedSkill: 'Repair',
    difficulty: 15,
    rewardXp: 50,
    lootItems: [
      { itemId: 'survivor_jacket', count: 1 },
      { itemId: 'stimpak', count: 1 },
    ],
  },
  {
    id: 'radio_tower',
    nameRu: 'Связная радиостанция',
    iconName: 'radio',
    x: 2,
    y: 8,
    descriptionRu: 'Самодельная радиомачта на крыше сарая. Ламповый передатчик шипит статикой на частоте соседнего поселения.',
    associatedSkill: 'Science',
    difficulty: 15,
    rewardXp: 45,
    lootItems: [
      { itemId: 'stimpak', count: 1 },
    ],
  },
  {
    id: 'narrow_cache',
    nameRu: 'Узкий схрон подполка',
    iconName: 'box',
    x: 7,
    y: 4,
    descriptionRu: 'Глубокая щель под сгнившим срубом сарая. Человеческая рука туда не пролезет, но ловкий зверек может достать завернутый в промасленную тряпку сверток.',
    requiresCompanionSkill: 'ferret_burrow',
    rewardXp: 35,
    lootItems: [
      { itemId: 'stimpak', count: 2 },
      { itemId: 'canned_cram', count: 1 },
    ],
  },
  {
    id: 'heavy_rubble',
    nameRu: 'Заваленный погреб',
    iconName: 'lock',
    x: 1,
    y: 6,
    descriptionRu: 'Тяжелые балки и бревна обрушились на вход в старый погреб с довоенными запасами. Сильный компаньон или таран могли бы сдвинуть завал.',
    requiresCompanionSkill: 'boar_ram',
    rewardXp: 35,
    lootItems: [
      { itemId: 'canned_cram', count: 2 },
      { itemId: 'dirty_water', count: 3 },
    ],
  },
  {
    id: 'scavenger_tracks',
    nameRu: 'Свежие следы мародёров',
    iconName: 'footprints',
    x: 5,
    y: 1,
    descriptionRu: 'Глубокие отпечатки кованых сапог и свежесорванная листва. Банда «Стервятников» из 5 человек прошла здесь меньше часа назад.',
    associatedSkill: 'Outdoorsman',
    difficulty: 13,
    rewardXp: 30,
  },
];

export const INITIAL_PATROL_ENEMIES: PatrolEnemy[] = [
  {
    id: 'scavenger_guard',
    nameRu: 'Дозорный мародёр',
    x: 6,
    y: 7,
    facing: 'south',
    visionRange: 2,
    currentRouteIndex: 0,
    alerted: false,
    route: [
      { x: 6, y: 7 },
      { x: 6, y: 8 },
      { x: 5, y: 8 },
      { x: 5, y: 7 },
    ],
  },
];
