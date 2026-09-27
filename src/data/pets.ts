export interface PetDefinition {
  id: string;
  nameRu: string;
  speciesRu: string;
  subtitleRu: string;
  descriptionRu: string;
  roleNoteRu: string;
  iconName: 'Dog' | 'Cat' | 'Bird' | 'UserX';
}

export const PET_DEFINITIONS: PetDefinition[] = [
  {
    id: 'hound',
    nameRu: 'Байкал',
    speciesRu: 'Охотничий пёс',
    subtitleRu: 'Чуткий сторож и следопыт',
    descriptionRu: 'Крепкий таежный пёс. Тонко чует запах зверя и человека на тропе, первым реагирует на подозрительный шум и помогает выслеживать добычу.',
    roleNoteRu: 'Лучше подходит для разведки, охоты и охраны стоянки.',
    iconName: 'Dog',
  },
  {
    id: 'cat',
    nameRu: 'Барсик',
    speciesRu: 'Лесной кот',
    subtitleRu: 'Осторожный и тихий спутник',
    descriptionRu: 'Ловкий и бесшумный спутник. Истребляет грызунов на стоянках, чутко слышит ночные шорохи и помогает сохранять съестные припасы от порчи.',
    roleNoteRu: 'Помогает беречь запасы еды от грызунов и не привлекает лишнего внимания.',
    iconName: 'Cat',
  },
  {
    id: 'crow',
    nameRu: 'Каркун',
    speciesRu: 'Ручной ворон',
    subtitleRu: 'Воздушный разведчик',
    descriptionRu: 'Умная птица Старого Мира. Кружит над заброшенными строениями, замечает блестящие предметы среди обломков и криком предупреждает о засадах.',
    roleNoteRu: 'Помогает находить тайники с высоты и предупреждает о внезапных врагах.',
    iconName: 'Bird',
  },
  {
    id: 'none',
    nameRu: 'Без питомца',
    speciesRu: 'Одиночка',
    subtitleRu: 'Полагаюсь только на себя',
    descriptionRu: 'Вы не зависите от животного и не тратите на него еду, воду и силы. Зато рядом нет никого, кто мог бы предупредить об опасности или помочь в пути.',
    roleNoteRu: 'Экономия провизии и полная независимость ценой отсутствия верного напарника.',
    iconName: 'UserX',
  },
];
