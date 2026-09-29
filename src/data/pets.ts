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
    speciesRu: 'Охотничий пёс',
    subtitleRu: 'Чуткий сторож и следопыт',
    descriptionRu: 'Чутко держит запах зверя и человека на тропе, поднимает тревогу при шуме и помогает в охоте.',
    iconName: 'Dog',
  },
  {
    id: 'cat',
    nameRu: 'Барсик',
    speciesRu: 'Лесной кот',
    subtitleRu: 'Осторожный мышелов',
    descriptionRu: 'Бесшумный охотник на стоянках. Бережет сухие пайки от порчи грызунами и не привлекает врагов.',
    iconName: 'Cat',
  },
  {
    id: 'crow',
    nameRu: 'Каркун',
    speciesRu: 'Ручной ворон',
    subtitleRu: 'Воздушный дозорный',
    descriptionRu: 'Осматривает заброшенные строения с высоты, замечает блеск металла в завалах и криком выдает засады.',
    iconName: 'Bird',
  },
  {
    id: 'ferret',
    nameRu: 'Ермак',
    speciesRu: 'Степной хорёк',
    subtitleRu: 'Юркий разведчик руин',
    descriptionRu: 'Пролезает в узкие вентиляции и щели развалин, вытаскивая мелкие довоенные детали и крепеж.',
    iconName: 'Ferret',
  },
  {
    id: 'boar',
    nameRu: 'Буян',
    speciesRu: 'Ручной кабанчик',
    subtitleRu: 'Таран и собиратель',
    descriptionRu: 'Выкапывает питательные коренья на привалах, сбивает противников с ног и защищает хозяина в стычках.',
    iconName: 'Boar',
  },
  {
    id: 'none',
    nameRu: 'Без питомца',
    speciesRu: 'Одиночка',
    subtitleRu: 'Свободный бродяга',
    descriptionRu: 'Полная независимость и строгая экономия провизии ценой отсутствия верного напарника на стоянках.',
    iconName: 'UserX',
  },
];
