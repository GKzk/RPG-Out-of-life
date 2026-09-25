import { SkillName } from '../types/game';

export interface BackgroundDefinition {
  id: string;
  titleRu: string;
  subtitleRu: string;
  descriptionRu: string;
  coreSkill: SkillName;
  recommendedFeat: string;
}

export const BACKGROUND_DEFINITIONS: BackgroundDefinition[] = [
  {
    id: 'vault_service',
    titleRu: 'Служба в Убежище',
    subtitleRu: 'Регламент, медицина, техника',
    descriptionRu: 'Вы выросли внутри системы: знаете протоколы, обслуживание оборудования и цену дисциплины.',
    coreSkill: 'repair',
    recommendedFeat: 'glass_cannon',
  },
  {
    id: 'settlement_guard',
    titleRu: 'Охрана поселения',
    subtitleRu: 'Дежурства, патрули, оружие',
    descriptionRu: 'Вы привыкли к караулам, патрулированию и ситуации, когда решение нужно принять за секунду.',
    coreSkill: 'smallGuns',
    recommendedFeat: 'heavy_striker',
  },
  {
    id: 'caravan',
    titleRu: 'Караванщик',
    subtitleRu: 'Маршруты, сделки, наблюдение',
    descriptionRu: 'Вы знаете торговые маршруты, умеете оценивать риск и не тратите боеприпасы без причины.',
    coreSkill: 'barter',
    recommendedFeat: 'sniper_eye',
  },
  {
    id: 'field_medicine',
    titleRu: 'Полевой санитар',
    subtitleRu: 'Травмы, препараты, выживание',
    descriptionRu: 'Вы научились оказывать помощь там, где аптечка важнее оружия, а ошибка стоит жизни.',
    coreSkill: 'medicine',
    recommendedFeat: 'wasteland_survivalist',
  },
  {
    id: 'technical_brigade',
    titleRu: 'Ремонтная бригада',
    subtitleRu: 'Энергия, механика, аварийные работы',
    descriptionRu: 'Вы привыкли чинить то, что другие уже списали. Старая техника для вас — задача, а не загадка.',
    coreSkill: 'science',
    recommendedFeat: 'glass_cannon',
  },
  {
    id: 'free_trader',
    titleRu: 'Вольный торговец',
    subtitleRu: 'Связи, переговоры, риск',
    descriptionRu: 'Вы живёте за счёт договорённостей, информации и умения понять, чего хочет собеседник.',
    coreSkill: 'speech',
    recommendedFeat: 'eloquent_diplomat',
  },
];
