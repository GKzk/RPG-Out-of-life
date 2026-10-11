import React, { useState } from 'react';
import { PetDefinition } from '../../data/pets';
import { Eye, ShieldAlert, Sparkles, Navigation, Zap, Compass, CheckCircle2 } from 'lucide-react';

interface CompanionCommandPanelProps {
  pet: PetDefinition;
  onExecuteCommand: (commandId: string, commandNameRu: string) => void;
  activeBuff?: string | null;
  scoutRevealedTurns?: number;
}

export const CompanionCommandPanel: React.FC<CompanionCommandPanelProps> = ({
  pet,
  onExecuteCommand,
  activeBuff,
  scoutRevealedTurns = 0,
}) => {
  const [lastUsedTime, setLastUsedTime] = useState<Record<string, number>>({});

  if (pet.id === 'none') {
    return (
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-400 font-mono">
        <div className="flex items-center gap-2 text-neutral-500 font-semibold mb-1">
          <Navigation className="w-3.5 h-3.5" />
          <span>Спутник не выбран</span>
        </div>
        <p className="text-[11px] text-neutral-500">
          Вы путешествуете в одиночку. Все задачи разведки, взлома и обнаружения ловушек ложатся исключительно на ваши плечи.
        </p>
      </div>
    );
  }

  // Tactical abilities specific to the chosen pet
  const petCommands = [
    {
      id: 'primary_special',
      petRequirement: 'hound',
      nameRu: 'Взять след мародёров',
      apCost: 2,
      icon: Eye,
      description: 'Байкал вынюхивает свежие следы «Стервятников», подсвечивая маршрут патруля и безопасные зоны обхода.',
      buffKey: 'hound_track',
    },
    {
      id: 'secondary_alert',
      petRequirement: 'hound',
      nameRu: 'Боевой рык (Отвлечение)',
      apCost: 3,
      icon: ShieldAlert,
      description: 'Предупреждающий низкий рык в сторону ворот отвлекает внимание часового на 1 ход.',
      buffKey: 'hound_bark',
    },

    {
      id: 'primary_special',
      petRequirement: 'cat',
      nameRu: 'Скрытная тропа & Чутьё',
      apCost: 2,
      icon: Sparkles,
      description: 'Барсик крадется впереди по высокой траве, повышая вашу скрытность (+20% к Стелсу) на 2 хода.',
      buffKey: 'cat_sense',
    },
    {
      id: 'secondary_alert',
      petRequirement: 'cat',
      nameRu: 'Детектор аномалий',
      apCost: 1,
      icon: Navigation,
      description: 'Шерсть встает дыбом при приближении радиационных карманов и ловушек.',
      buffKey: 'cat_detector',
    },

    {
      id: 'primary_special',
      petRequirement: 'crow',
      nameRu: 'Воздушная разведка',
      apCost: 2,
      icon: Eye,
      description: 'Каркун взмывает над крышами деревни, полностью снимая туман войны со всей локации на 2 хода.',
      buffKey: 'crow_scout',
    },
    {
      id: 'secondary_alert',
      petRequirement: 'crow',
      nameRu: 'Крик над крышей (Отвлечь)',
      apCost: 2,
      icon: Zap,
      description: 'Громкий хриплый крик над амбаром заставляет мародёра повернуться спиной к тропе.',
      buffKey: 'crow_distract',
    },

    {
      id: 'primary_special',
      petRequirement: 'ferret',
      nameRu: 'Проникнуть в узкую щель',
      apCost: 2,
      icon: Sparkles,
      description: 'Ермак ныряет в разрушенный подпол сарая (клетка 7,4), чтобы вытащить спрятанный схрон.',
      buffKey: 'ferret_burrow',
    },
    {
      id: 'secondary_alert',
      petRequirement: 'ferret',
      nameRu: 'Поиск мелких деталей',
      apCost: 1,
      icon: Compass,
      description: 'Хорёк вынюхивает медную проволоку и изоленту, давая +2 к броску Ремонта генератора.',
      buffKey: 'ferret_loot',
    },

    {
      id: 'primary_special',
      petRequirement: 'boar',
      nameRu: 'Таран завала',
      apCost: 3,
      icon: Zap,
      description: 'Буян с разгона выбивает сгнившие бревна на входе в погреб (клетка 1,6), открывая тайник.',
      buffKey: 'boar_ram',
    },
    {
      id: 'secondary_alert',
      petRequirement: 'boar',
      nameRu: 'Поиск питательных кореньев',
      apCost: 1,
      icon: Sparkles,
      description: 'Раскапывает влажную землю у забора в поисках питательных корешков (-10 к голоду).',
      buffKey: 'boar_root',
    },
  ].filter((cmd) => cmd.petRequirement === pet.id);

  return (
    <div className="bg-neutral-900/95 border border-amber-500/40 rounded-lg p-3 text-xs font-mono shadow-md backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-amber-300">
            Напарник: {pet.nameRu} ({pet.speciesRu})
          </span>
        </div>
        <span className="text-[11px] text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Связь активна
        </span>
      </div>

      <p className="text-[11px] text-neutral-400 mb-2 leading-relaxed">{pet.descriptionRu}</p>

      {/* Active buffs info */}
      {scoutRevealedTurns > 0 && (
        <div className="mb-2 p-1.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Воздушный обзор активен: осталось ходов: {scoutRevealedTurns}</span>
        </div>
      )}

      {activeBuff && (
        <div className="mb-2 p-1.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Эффект действия: {activeBuff}</span>
        </div>
      )}

      {/* Command Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {petCommands.map((cmd) => {
          const Icon = cmd.icon;
          const isCooldowned = lastUsedTime[cmd.id] && Date.now() - lastUsedTime[cmd.id] < 5000;

          return (
            <button
              key={cmd.nameRu}
              onClick={() => {
                setLastUsedTime((prev) => ({ ...prev, [cmd.id]: Date.now() }));
                onExecuteCommand(cmd.buffKey, cmd.nameRu);
              }}
              disabled={Boolean(isCooldowned)}
              className={`p-2 rounded text-left border transition-all flex flex-col justify-between ${
                isCooldowned
                  ? 'bg-neutral-800/40 border-neutral-700/40 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-800/80 border-amber-500/30 text-amber-200 hover:bg-amber-500/20 hover:border-amber-400 hover:text-amber-100 shadow-sm active:translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 font-medium text-amber-300">
                  <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{cmd.nameRu}</span>
                </div>
                <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-900 text-cyan-300 border border-cyan-500/30">
                  {cmd.apCost} AP
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">{cmd.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
