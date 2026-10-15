import { DialogueNode } from '../components/dialogue/FalloutDialogueModal';

export const ELDER_MATVEY_DIALOGUE: Record<string, DialogueNode> = {
  root: {
    id: 'root',
    speakerNameRu: 'Староста Матвей',
    speakerTitleRu: 'Хранитель Опустевшей деревни',
    portraitType: 'elder',
    textRu:
      'Здравствуй, путник. Редко кто добирается до нашего угла живым. В лесу воют одичавшие псы, а на холме мародёры заняли радиомачту. Что привело тебя в нашу глушь?',
    options: [
      {
        id: 'opt_what_happened',
        textRu: '«Что произошло в этих краях? Откуда взялась эта выжженная земля?»',
        targetNodeId: 'node_lore',
      },
      {
        id: 'opt_radio_tower',
        textRu: '«Мне нужно восстановить связь. Как добраться до Радиомачты "Маяк-4"?»',
        targetNodeId: 'node_tower',
      },
      {
        id: 'opt_bribe_help',
        textRu: '«Я могу помочь деревне с починкой генератора и охраной. Что вы предложите взамен?» [Бартер DC 11]',
        skillReq: 'barter',
        difficulty: 11,
        targetNodeId: 'node_barter',
        onSuccessRewards: { xp: 45, itemId: 'stimpak', count: 1 },
      },
      {
        id: 'opt_goodbye',
        textRu: '«Я просто осматриваюсь. Береги себя, дед.»',
        targetNodeId: 'exit_dialogue',
      },
    ],
  },
  node_lore: {
    id: 'node_lore',
    speakerNameRu: 'Староста Матвей',
    speakerTitleRu: 'Хранитель Опустевшей деревни',
    portraitType: 'elder',
    textRu:
      'Семьдесят лет назад небеса раскололись. В Москве и военных городках включились автоматические комплексы СверхИИ. Те, кто успел, ушли под землю в «Объект-17», но гермошлюзы захлопнулись намертво. Мы же выжили на поверхности благодаря колодцу и брезентовым срубам.',
    options: [
      {
        id: 'opt_bunker_details',
        textRu: '«Расскажи подробнее про Бункер "Объект-17". Туда можно проникнуть?»',
        targetNodeId: 'node_bunker',
      },
      {
        id: 'opt_back',
        textRu: '«Понятно. Вернемся к другим вопросам.»',
        targetNodeId: 'root',
      },
    ],
  },
  node_tower: {
    id: 'node_tower',
    speakerNameRu: 'Староста Матвей',
    speakerTitleRu: 'Хранитель Опустевшей деревни',
    portraitType: 'elder',
    textRu:
      'Тропа на север ведёт прямо к КПП мачты. Но будь начеку: банда «Воронов» поставила снайперов на вышке. Без хорошей брони или скрытности через кусты тебе туда не сунуться. Если найдёшь рабочий радиомодуль — принеси мне взглянуть.',
    options: [
      {
        id: 'opt_back',
        textRu: '«Спасибо за предупреждение. Я буду осторожен.»',
        targetNodeId: 'root',
      },
    ],
  },
  node_bunker: {
    id: 'node_bunker',
    speakerNameRu: 'Староста Матвей',
    speakerTitleRu: 'Хранитель Опустевшей деревни',
    portraitType: 'elder',
    textRu:
      'Вход под холмом к югу. Там тяжеленная титановая дверь ГО СССР. Замок электронный, без ключ-карты начальника караула или глубоких знаний схемотехники не пробиться. И ещё... внутри фонит. Надень противогаз ГП-5, иначе лёгкие сгорят.',
    options: [
      {
        id: 'opt_back',
        textRu: '«Я найду способ открыть гермодверь.»',
        targetNodeId: 'root',
      },
    ],
  },
  node_barter: {
    id: 'node_barter',
    speakerNameRu: 'Староста Матвей',
    speakerTitleRu: 'Хранитель Опустевшей деревни',
    portraitType: 'elder',
    textRu:
      'Деловой подход, уважаю. Если починишь дизель-генератор на краю деревни — отдам тебе довоенный охотничий нож и запас сухарей. Вот, держи стимулятор на первое время.',
    options: [
      {
        id: 'opt_back',
        textRu: '«Договорились. Я займусь генератором.»',
        targetNodeId: 'root',
      },
    ],
  },
};

export const RAIDER_SENTRY_DIALOGUE: Record<string, DialogueNode> = {
  root: {
    id: 'root',
    speakerNameRu: 'Часовой «Воронов»',
    speakerTitleRu: 'Дозорный мародёр',
    portraitType: 'raider',
    textRu:
      'Стоять, падаль! Оружие в землю! Это территория банды «Вороны». Сюда вход стоит либо десять гильз, либо твоя шкура!',
    options: [
      {
        id: 'opt_persuade',
        textRu: '«Я пришел не за вашей добычей. Мне нужен только доступ к радиомачте, никому не мешая.» [Красноречие DC 12]',
        skillReq: 'persuasion',
        difficulty: 12,
        targetNodeId: 'node_passed',
        onSuccessRewards: { xp: 60 },
      },
      {
        id: 'opt_intimidate',
        textRu: '«Один неверный шаг — и твой череп разлетится по камням. Пропусти, пока я добрый.» [Сила 7+]',
        targetNodeId: 'node_scared',
      },
      {
        id: 'opt_attack',
        textRu: '«[АТАКА] Меньше слов, мародёр!»',
        targetNodeId: 'combat_trigger',
      },
      {
        id: 'opt_retreat',
        textRu: '«Я ухожу. Не стреляй.»',
        targetNodeId: 'exit_dialogue',
      },
    ],
  },
  node_passed: {
    id: 'node_passed',
    speakerNameRu: 'Часовой «Воронов»',
    speakerTitleRu: 'Дозорный мародёр',
    portraitType: 'raider',
    textRu:
      'Ладно, черт с тобой. Проходи, но если сунешься в арсенал к боссу — лично пулю в лоб пущу.',
    options: [
      {
        id: 'opt_exit',
        textRu: '«Разошлись миром.»',
        targetNodeId: 'exit_dialogue',
      },
    ],
  },
  node_scared: {
    id: 'node_scared',
    speakerNameRu: 'Часовой «Воронов»',
    speakerTitleRu: 'Дозорный мародёр',
    portraitType: 'raider',
    textRu:
      'Эй, тише, мужик! Я просто часовой на окладе... Проходи, только не делай глупостей!',
    options: [
      {
        id: 'opt_exit',
        textRu: '«То-то же.»',
        targetNodeId: 'exit_dialogue',
      },
    ],
  },
};
