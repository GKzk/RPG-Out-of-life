export interface PetDefinition {
  id: string;
  nameRu: string;
  speciesRu: string;
  subtitleRu: string;
  descriptionRu: string;
  iconName: 'Dog' | 'Cat' | 'Bird' | 'UserX';
}

export const PET_DEFINITIONS: PetDefinition[] = [
  {
    id: 'hound',
    nameRu: 'Байкал',
    speciesRu: 'Охотничий пёс',
    subtitleRu: 'Чуткий сторож и следопыт',
    descriptionRu: 'Крепкий лесной пёс. Первым чует опасность на тропе, не боится выстрелов и помогает выслеживать добычу.',
    iconName: 'Dog',
  },
  {
    id: 'cat',
    nameRu: 'Барсик',
    speciesRu: 'Лесной кот',
    subtitleRu: 'Осторожный и тихий спутник',
    descriptionRu: 'Ловкий и тихий кот. Истребляет грызунов на стоянках, тонко слышит шорохи и помогает сохранять припасы.',
    iconName: 'Cat',
  },
  {
    id: 'crow',
    nameRu: 'Каркун',
    speciesRu: 'Ручной ворон',
    subtitleRu: 'Воздушный разведчик',
    descriptionRu: 'Умная птица Старого Мира. Кружит над заброшенными строениями, замечает блестящий лут и предупреждает о засадах.',
    iconName: 'Bird',
  },
  {
    id: 'none',
    nameRu: 'Без питомца',
    speciesRu: 'Одиночка',
    subtitleRu: 'Полагаюсь только на себя',
    descriptionRu: 'Вам не с кем делить пайки и чистую воду. Вы идёте через Пустошь в полном одиночестве.',
    iconName: 'UserX',
  },
];
