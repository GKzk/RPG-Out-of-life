export interface PetDefinition {
  id: string;
  nameRu: string;
  speciesRu: string;
  subtitleRu: string;
  descriptionRu: string;
  iconName: 'Dog' | 'Cat' | 'Bird' | 'Ferret' | 'Boar' | 'UserX';
}

export const PET_DEFINITIONS: PetDefinition[] = [
  {
    id: 'hound',
    nameRu: 'Байкал',
    speciesRu: 'Сторожевой пёс',
    subtitleRu: 'Выслеживание и обнаружение угроз',
    descriptionRu: 'Выслеживание, обнаружение скрытых угроз и засад, бонус к инициативе в бою.',
    iconName: 'Dog',
  },
  {
    id: 'cat',
    nameRu: 'Барсик',
    speciesRu: 'Кот',
    subtitleRu: 'Скрытность и чутьё на радиацию',
    descriptionRu: 'Скрытность, реакция на очаги радиации и приближение мутантов, осторожность.',
    iconName: 'Cat',
  },
  {
    id: 'crow',
    nameRu: 'Каркун',
    speciesRu: 'Ворон',
    subtitleRu: 'Разведка с воздуха и отвлечение',
    descriptionRu: 'Разведка с воздуха, обнаружение ценного лута в завалах, отвлечение врагов.',
    iconName: 'Bird',
  },
  {
    id: 'ferret',
    nameRu: 'Ермак',
    speciesRu: 'Степной хорёк',
    subtitleRu: 'Проникновение в щели и добыча деталей',
    descriptionRu: 'Проникновение в узкие щели руин, добыча мелких ценных деталей из закрытых зон.',
    iconName: 'Ferret',
  },
  {
    id: 'boar',
    nameRu: 'Буян',
    speciesRu: 'Сторожевой кабанчик',
    subtitleRu: 'Поиск кореньев и таран препятствий',
    descriptionRu: 'Поиск питательных кореньев и трюфелей, таран препятствий, сбивание врагов с ног.',
    iconName: 'Boar',
  },
  {
    id: 'none',
    nameRu: 'Без питомца',
    speciesRu: 'Одиночка',
    subtitleRu: 'Свободный бродяга',
    descriptionRu: 'Полная независимость и строгая экономия припасов ценой отсутствия напарника.',
    iconName: 'UserX',
  },
];
