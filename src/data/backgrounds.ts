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
  { id: 'hunter', titleRu: 'Охотник', subtitleRu: 'След, зверь, дальний выстрел', descriptionRu: 'Знаете повадки зверя, умеете читать следы, разделывать добычу и ждать подходящего момента для выстрела.', coreSkill: 'hunting', recommendedFeat: 'one_eyed' },
  { id: 'mechanic', titleRu: 'Слесарь', subtitleRu: 'Металл, механика, ремонт', descriptionRu: 'Руки привыкли к ржавому металлу, заклинившим механизмам и технике, которую давно пора было списать.', coreSkill: 'repair', recommendedFeat: 'workaholic' },
  { id: 'bard', titleRu: 'Бард', subtitleRu: 'Музыка, слух, люди', descriptionRu: 'Музыкой, голосом и историей умеете менять настроение толпы, поддерживать союзников и добиваться своего.', coreSkill: 'music', recommendedFeat: 'musician' },
  { id: 'community_healer', titleRu: 'Знахарь общины', subtitleRu: 'Травы, болезни, лечение', descriptionRu: 'Знаете местные растения, простые лекарства, признаки болезней и цену неправильного лечения.', coreSkill: 'herbalism', recommendedFeat: 'metabolism' },
  { id: 'settlement_guard', titleRu: 'Охрана поселения', subtitleRu: 'Караул, оружие, порядок', descriptionRu: 'Дежурства научили замечать угрозу раньше остальных, держать оружие и не терять голову под огнём.', coreSkill: 'smallGuns', recommendedFeat: 'sleepless' },
  { id: 'merchant', titleRu: 'Торговец', subtitleRu: 'Сделки, оценка, связи', descriptionRu: 'Вы умеете считать дефицит, читать намерения покупателя и превращать нужный хлам в капитал.', coreSkill: 'barter', recommendedFeat: 'narcissist' },
  { id: 'innkeeper', titleRu: 'Корчмарь', subtitleRu: 'Люди, слухи, выносливость', descriptionRu: 'Годы за стойкой научили слушать больше, чем говорить, запоминать лица и переживать чужие драки.', coreSkill: 'speech', recommendedFeat: 'alcoholic' },
  { id: 'none', titleRu: 'Без предыстории', subtitleRu: 'Ничего не предопределено', descriptionRu: 'У прошлого нет профессии, которая диктует будущее. Все стартовые решения остаются за вами.', coreSkill: 'survival', recommendedFeat: 'hard_life' },
];