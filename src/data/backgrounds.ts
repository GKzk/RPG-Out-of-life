import { SkillName } from '../types/game';

export interface BackgroundDefinition {
  id: string;
  titleRu: string;
  descriptionRu: string;
  coreSkill?: SkillName;
  recommendedFeat: string;
}

export const BACKGROUND_DEFINITIONS: BackgroundDefinition[] = [
  {
    id: 'hunter',
    titleRu: 'Охотник',
    descriptionRu: 'Годы в лесу научили вас читать следы, находить чистую воду среди бурелома и никогда не спускать курок без полной уверенности в цели.',
    coreSkill: 'search',
    recommendedFeat: 'one_eyed',
  },
  {
    id: 'mechanic',
    titleRu: 'Слесарь',
    descriptionRu: 'Юность среди довоенных дизелей, гидравлических узлов и ржавых труб научила вас восстанавливать агрегаты, от которых все остальные уже отказались.',
    coreSkill: 'mechanics',
    recommendedFeat: 'workaholic',
  },
  {
    id: 'bard',
    titleRu: 'Бард',
    descriptionRu: 'Странствия со старой семиструнной гитарой через десятки лагерей доказали: вовремя спетая баллада или меткое слово порой спасают вернее полного магазина.',
    coreSkill: 'performance',
    recommendedFeat: 'musician',
  },
  {
    id: 'community_healer',
    titleRu: 'Знахарь общины',
    descriptionRu: 'Практика полевого врачевания приучила вас отличать целебные травы от яда, останавливать заражение подручными средствами и бороться за жизнь каждого раненого.',
    coreSkill: 'medicine',
    recommendedFeat: 'metabolism',
  },
  {
    id: 'settlement_guard',
    titleRu: 'Охрана поселения',
    descriptionRu: 'Бессчетные часы на вышке и в ночных секретах выработали привычку спать вполглаза, мгновенно вскидывать карабин на подозрительный шорох и держать сектор под прицелом.',
    coreSkill: 'firearms',
    recommendedFeat: 'sleepless',
  },
  {
    id: 'merchant',
    titleRu: 'Торговец',
    descriptionRu: 'Постоянные сделки с караванщиками приучили на глаз оценивать ценность любой найденной вещи, распознавать обман и никогда не уходить в убыток.',
    coreSkill: 'barter',
    recommendedFeat: 'narcissist',
  },
  {
    id: 'innkeeper',
    titleRu: 'Корчмарь',
    descriptionRu: 'Через вашу стойку проходили караванщики, беглецы и наемники всех мастей. Вы умеете вовремя налить, слушать внимательнее разведчика и гасить конфликты в зародыше.',
    coreSkill: 'persuasion',
    recommendedFeat: 'alcoholic',
  },
  {
    id: 'none',
    titleRu: 'Без предыстории',
    descriptionRu: 'Никто не определял заранее ваше призвание. Вы свободны от чужих ожиданий и профессиональных рамок — характер и навыки формируются вашими собственными решениями.',
    recommendedFeat: 'hard_life',
  },
];