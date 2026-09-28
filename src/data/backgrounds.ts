import { SkillName } from '../types/game';

export interface BackgroundDefinition {
  id: string;
  titleRu: string;
  subtitleRu: string;
  descriptionRu: string;
  coreSkill?: SkillName;
  recommendedFeat: string;
}

export const BACKGROUND_DEFINITIONS: BackgroundDefinition[] = [
  {
    id: 'hunter',
    titleRu: 'Охотник',
    subtitleRu: 'Лес, след, добыча',
    descriptionRu: 'Годы в лесу научили вас отличать свежий след от старого, находить чистую воду среди бурелома и никогда не делать выстрел без уверенности в цели.',
    coreSkill: 'search',
    recommendedFeat: 'one_eyed',
  },
  {
    id: 'mechanic',
    titleRu: 'Слесарь',
    subtitleRu: 'Механизмы, ремонт, старая техника',
    descriptionRu: 'Вы провели юность среди довоенных дизелей, гидравлических узлов и ржавых труб. Вы знаете, как заставить работать узел, от которого все остальные уже отказались.',
    coreSkill: 'mechanics',
    recommendedFeat: 'workaholic',
  },
  {
    id: 'bard',
    titleRu: 'Бард',
    subtitleRu: 'Музыка, слухи, влияние',
    descriptionRu: 'Со старой семиструнной гитарой вы прошли через десятки укреплений и лагерей. Вы знаете, когда песня или вовремя сказанное слово спасают надежнее, чем патрон в патроннике.',
    coreSkill: 'performance',
    recommendedFeat: 'musician',
  },
  {
    id: 'community_healer',
    titleRu: 'Знахарь общины',
    subtitleRu: 'Растения, болезни, первая помощь',
    descriptionRu: 'Вы научились по запаху корней отличать целебный сбор от смертельного яда, останавливать заражение подручными средствами и спасать жизни в условиях дефицита чистых бинтов.',
    coreSkill: 'medicine',
    recommendedFeat: 'metabolism',
  },
  {
    id: 'settlement_guard',
    titleRu: 'Охрана поселения',
    subtitleRu: 'Караул, дисциплина, защита периметра',
    descriptionRu: 'Бессчетные часы на вышке и в ночных секретах выработали у вас привычку спать вполглаза, мгновенно вскидывать оружие на шорох и держать сектор под прицелом.',
    coreSkill: 'firearms',
    recommendedFeat: 'sleepless',
  },
  {
    id: 'merchant',
    titleRu: 'Торговец',
    subtitleRu: 'Обмен, оценка, связи',
    descriptionRu: 'Вы привыкли на глаз определять ценность любой найденной вещи, понимать скрытые нужды покупателя и не уходить со сделки в убытке.',
    coreSkill: 'barter',
    recommendedFeat: 'narcissist',
  },
  {
    id: 'innkeeper',
    titleRu: 'Корчмарь',
    subtitleRu: 'Люди, конфликты, житейский опыт',
    descriptionRu: 'Через вашу стойку проходили караванщики, беглецы и наемники всех мастей. Вы умеете вовремя налить, слушать внимательнее разведчика и гасить назревающую поножовщину одним словом.',
    coreSkill: 'persuasion',
    recommendedFeat: 'alcoholic',
  },
  {
    id: 'none',
    titleRu: 'Без предыстории',
    subtitleRu: 'Свободный выбор пути',
    descriptionRu: 'Никто в общине не успел решить за вас, кем вы должны стать. У вас нет груза чужих ожиданий и профессиональных рамок — ваш характер и навыки формируются здесь и сейчас.',
    recommendedFeat: 'hard_life',
  },
];