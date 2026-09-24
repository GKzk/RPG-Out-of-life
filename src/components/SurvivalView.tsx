import React from 'react';
import { useGame } from '../context/GameContext';
import {
  Activity,
  Flame,
  Droplets,
  Moon,
  Zap,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Crosshair,
  Pill,
  Coffee,
  BedDouble,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const SurvivalView: React.FC = () => {
  const { character, passTime, restAndSleep, scavengeRuins } = useGame();

  if (!character) return null;

  const { survival } = character;

  // Status helper text
  const getHungerStatus = (val: number) => {
    if (val > 80) return { label: 'Смертельный голод (-3 STR, -3 END, -2 AP, урон HP)', color: 'text-red-400 border-red-500/50 bg-red-950/30' };
    if (val > 60) return { label: 'Сильное истощение (-2 STR, -2 END)', color: 'text-amber-400 border-amber-500/50 bg-amber-950/30' };
    if (val > 30) return { label: 'Легкий голод (-1 STR)', color: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/20' };
    return { label: 'Сыт и полон сил', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20' };
  };

  const getThirstStatus = (val: number) => {
    if (val > 80) return { label: 'Критическое обезвоживание (-3 PER, -3 AGI, -3 AP, урон HP)', color: 'text-red-400 border-red-500/50 bg-red-950/30' };
    if (val > 60) return { label: 'Сильная жажда (-2 PER, -2 AGI)', color: 'text-amber-400 border-amber-500/50 bg-amber-950/30' };
    if (val > 30) return { label: 'Пересохло в горле (-1 PER)', color: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/20' };
    return { label: 'Организм гидратирован', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20' };
  };

  const getFatigueStatus = (val: number) => {
    if (val > 70) return { label: 'Сильное истощение сна (-2 AGI, -2 INT, -2 PER, -2 AP)', color: 'text-red-400 border-red-500/50 bg-red-950/30' };
    if (val > 40) return { label: 'Усталость (-1 AGI, -1 INT)', color: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/20' };
    return { label: 'Бодр и выспался', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20' };
  };

  const getRadiationStatus = (val: number) => {
    if (val >= 700) return { label: 'Тяжелое лучевое отравление (-4 END, -3 STR, -2 AGI)', color: 'text-red-500 border-red-500 bg-red-950/40' };
    if (val >= 400) return { label: 'Умеренная лучевая болезнь (-2 END, -1 STR)', color: 'text-amber-400 border-amber-500/50 bg-amber-950/30' };
    if (val >= 200) return { label: 'Легкое фоновое облучение (-1 END)', color: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/20' };
    return { label: 'Уровень радиации в норме', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20' };
  };

  const hungerSt = getHungerStatus(survival.hunger);
  const thirstSt = getThirstStatus(survival.thirst);
  const fatigueSt = getFatigueStatus(survival.fatigue);
  const radSt = getRadiationStatus(survival.radiation);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-mono text-amber-300 space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-900 border border-amber-500/40 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
            <Activity className="w-6 h-6 text-amber-400" />
            <h1>СИСТЕМА ВЫЖИВАНИЯ И ПОТРЕБНОСТЕЙ</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            В Пустоши вас убивают не только раны от пуль, но и голод, обезвоживание, утомление, лучевая болезнь и химическая зависимость.
            Игнорирование потребностей снижает ваши характеристики и ухудшает боеспособность.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Survival Gauges */}
        <div className="lg:col-span-7 space-y-4">
          {/* Hunger Gauge */}
          <div className="bg-neutral-900 border border-amber-500/30 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-200 font-bold text-sm">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>Голод (Hunger)</span>
              </div>
              <span className="font-bold text-sm text-amber-300">{survival.hunger.toFixed(0)}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div
                className={`h-full transition-all ${
                  survival.hunger > 80 ? 'bg-red-500' : survival.hunger > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${survival.hunger}%` }}
              />
            </div>
            <div className={`p-2 rounded border text-xs font-semibold ${hungerSt.color}`}>
              {hungerSt.label}
            </div>
          </div>

          {/* Thirst Gauge */}
          <div className="bg-neutral-900 border border-amber-500/30 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-200 font-bold text-sm">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Жажда (Thirst)</span>
              </div>
              <span className="font-bold text-sm text-cyan-300">{survival.thirst.toFixed(0)}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div
                className={`h-full transition-all ${
                  survival.thirst > 80 ? 'bg-red-500' : survival.thirst > 50 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${survival.thirst}%` }}
              />
            </div>
            <div className={`p-2 rounded border text-xs font-semibold ${thirstSt.color}`}>
              {thirstSt.label}
            </div>
          </div>

          {/* Fatigue Gauge */}
          <div className="bg-neutral-900 border border-amber-500/30 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-200 font-bold text-sm">
                <Moon className="w-4 h-4 text-purple-400" />
                <span>Усталость / Сон (Fatigue)</span>
              </div>
              <span className="font-bold text-sm text-purple-300">{survival.fatigue.toFixed(0)}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div
                className={`h-full transition-all ${
                  survival.fatigue > 70 ? 'bg-red-500' : survival.fatigue > 40 ? 'bg-amber-500' : 'bg-purple-500'
                }`}
                style={{ width: `${survival.fatigue}%` }}
              />
            </div>
            <div className={`p-2 rounded border text-xs font-semibold ${fatigueSt.color}`}>
              {fatigueSt.label}
            </div>
          </div>

          {/* Radiation Gauge */}
          <div className="bg-neutral-900 border border-amber-500/30 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-200 font-bold text-sm">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Радиация (Radiation)</span>
              </div>
              <span className="font-bold text-sm text-yellow-300">{survival.radiation} / 1000 Rads</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div
                className={`h-full transition-all ${
                  survival.radiation > 600 ? 'bg-red-500' : survival.radiation > 300 ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (survival.radiation / 1000) * 100)}%` }}
              />
            </div>
            <div className={`p-2 rounded border text-xs font-semibold ${radSt.color}`}>
              {radSt.label}
            </div>
          </div>
        </div>

        {/* Right Column: Addictions, Diseases & Survival Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Addictions & Withdrawal */}
          <div className="bg-neutral-900 border border-amber-500/30 p-5 rounded-lg space-y-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Pill className="w-4 h-4 text-amber-400" />
              <span>Зависимости и Препараты</span>
            </h2>

            <div className="space-y-2 text-xs">
              {(Object.keys(survival.addictions) as (keyof typeof survival.addictions)[]).map((chemKey) => {
                const add = survival.addictions[chemKey];
                const isActive = add.activeDuration > 0;
                const isWithdrawal = add.withdrawal;

                return (
                  <div
                    key={chemKey}
                    className="bg-neutral-950 p-2.5 rounded border border-neutral-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-amber-200 uppercase">{chemKey}</span>
                      <div className="text-[11px] text-neutral-400">
                        {isActive ? (
                          <span className="text-emerald-400">Активно: еще {add.activeDuration} ч.</span>
                        ) : isWithdrawal ? (
                          <span className="text-red-400 font-bold">ЛОМКА! (-2 к статам)</span>
                        ) : (
                          <span className="text-neutral-500">Нет зависимости</span>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-neutral-400">
                      Уровень: {add.level}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Survival Quick Actions */}
          <div className="bg-neutral-900 border border-amber-500/30 p-5 rounded-lg space-y-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Действия выживания</span>
            </h2>

            <div className="space-y-2">
              <button
                onClick={() => restAndSleep(8)}
                className="w-full bg-neutral-950 hover:bg-neutral-800 border border-amber-500/40 p-3 rounded text-left text-xs text-amber-200 font-bold flex items-center gap-3 transition-colors group"
              >
                <BedDouble className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <div>Поспать на лагере (8 часов)</div>
                  <div className="text-[11px] text-neutral-400 font-normal">
                    Восстанавливает HP и снимает утомление. Расходует воду и пищу.
                  </div>
                </div>
              </button>

              <button
                onClick={() => passTime(1, 'Ожидание')}
                className="w-full bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 p-3 rounded text-left text-xs text-amber-200 font-bold flex items-center gap-3 transition-colors group"
              >
                <Clock className="w-5 h-5 text-neutral-400 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <div>Подождать 1 час</div>
                  <div className="text-[11px] text-neutral-400 font-normal">
                    Просто пропустить время в тишине.
                  </div>
                </div>
              </button>

              <button
                onClick={scavengeRuins}
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/60 p-3 rounded text-left text-xs text-amber-200 font-bold flex items-center gap-3 transition-colors group"
              >
                <Search className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <div>Поиск припасов в руинах (2 часа)</div>
                  <div className="text-[11px] text-neutral-400 font-normal">
                    Бросок навыка Выживания. Можно найти воду, консервы или встретить врага!
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
