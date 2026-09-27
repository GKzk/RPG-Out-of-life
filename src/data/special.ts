import { SpecialAttribute, SpecialDefinition } from '../types/game';

export const SPECIAL_DEFINITIONS: SpecialDefinition[] = [
  {
    id: 'STR',
    nameRu: 'Сила',
    short: 'Физика и ближний бой',
    descriptionRu: 'Отвечает за физическую мощь персонажа: ближний бой, переносимый вес, физические действия и урон некоторого оружия.',
  },
  {
    id: 'PER',
    nameRu: 'Восприятие',
    short: 'Меткость и наблюдение',
    descriptionRu: 'Определяет внимательность и способность замечать детали. Влияет на стрельбу, поиск, обнаружение угроз и ориентирование.',
  },
  {
    id: 'END',
    nameRu: 'Выносливость',
    short: 'Живучесть и сопротивление',
    descriptionRu: 'Определяет физическую стойкость организма. Влияет на здоровье, сопротивление болезням, радиации, голоду и другим нагрузкам.',
  },
  {
    id: 'CHA',
    nameRu: 'Харизма',
    short: 'Диалоги и торговля',
    descriptionRu: 'Способность располагать к себе людей и влиять на них. Влияет на переговоры, торговлю, убеждение, обман, лидерство и взаимодействие с животными.',
  },
  {
    id: 'INT',
    nameRu: 'Интеллект',
    short: 'Знания и техника',
    descriptionRu: 'Способность анализировать информацию и работать со сложными системами. Влияет на медицину, науку, механику, электронику и изготовление.',
  },
  {
    id: 'AGI',
    nameRu: 'Ловкость',
    short: 'AP, уклонение и скрытность',
    descriptionRu: 'Координация, скорость реакции и точность движений. Влияет на AP, уклонение, скрытность, ловкость рук и безоружный бой.',
  },
  {
    id: 'LCK',
    nameRu: 'Удача',
    short: 'Критические события',
    descriptionRu: 'Характеристика непредсказуемых преимуществ. Влияет на критические события и вероятность особенно удачных исходов.',
  },
];

export const SPECIAL_ORDER: SpecialAttribute[] = ['STR', 'PER', 'END', 'CHA', 'INT', 'AGI', 'LCK'];

export const SPECIAL_MAP: Record<SpecialAttribute, SpecialDefinition> = SPECIAL_DEFINITIONS.reduce(
  (acc, def) => {
    acc[def.id] = def;
    return acc;
  },
  {} as Record<SpecialAttribute, SpecialDefinition>
);
