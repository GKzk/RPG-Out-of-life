import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Compass,
  MapPin,
  Search,
  Swords,
  Shield,
  Layers,
  Sparkles,
  Map,
  ExternalLink,
  ChevronRight,
  Radio,
} from 'lucide-react';

interface SectorLocation {
  id: string;
  nameRu: string;
  dangerLevel: 'Низкая' | 'Умереная' | 'Высокая' | 'Смертельная';
  descriptionRu: string;
  lootChance: string;
}

const SECTOR_LOCATIONS: SectorLocation[] = [
  {
    id: 'bunker_101',
    nameRu: 'Сектор 7: Заброшенный бункер «Восток»',
    dangerLevel: 'Умереная',
    descriptionRu: 'Бетонный дот довоенной постройки. Внутренние гермодвери взломаны, внутри сохранились ящики с армейскими сухпайками.',
    lootChance: 'Высокая (Консервы, патроны)',
  },
  {
    id: 'supermarket_ruins',
    nameRu: 'Развалины Супермаркета «Super-Duper Mart»',
    dangerLevel: 'Высокая',
    descriptionRu: 'Обрушившаяся крыша и сгоревшие стеллажи. Территорию патрулируют банды рейдеров и дикие гули.',
    lootChance: 'Очень высокая (Чистая вода, химикаты, медикаменты)',
  },
  {
    id: 'crater_zero',
    nameRu: 'Радиационный кратер «Точка Ноль»',
    dangerLevel: 'Смертельная',
    descriptionRu: 'Эпицентр ядреного удара. Стеклянистая почва и смертельный фон радиации (200+ Rad/час).',
    lootChance: 'Легендарная (Энергооружие, довоенные схемы)',
  },
];

export const WastelandExplorer: React.FC = () => {
  const { scavengeRuins, startCombatEncounter, travelBetweenSectors, clearSectorObstacle } = useGame();
  const [selectedLocation, setSelectedLocation] = useState<SectorLocation>(SECTOR_LOCATIONS[0]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-mono text-amber-300 space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 border border-amber-500/40 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
            <Compass className="w-6 h-6" />
            <h1>ИССЛЕДОВАНИЕ ПУСТОШИ И СЕКТОРОВ</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Выбирайте сектора для экспедиций, обыскивайте заброшенные заводы и военные склады. Каждый шаг расходует <strong className="text-amber-300">время, сытость и воду</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sectors List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
            Доступные сектора для поиска:
          </h2>

          {SECTOR_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation.id === loc.id;

            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`p-4 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 text-amber-200 shadow'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>{loc.nameRu}</span>
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 leading-relaxed">{loc.descriptionRu}</div>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                  <span>Опасность: <strong className="text-red-400">{loc.dangerLevel}</strong></span>
                  <span className="text-emerald-400">{loc.lootChance}</span>
                </div>
              </div>
            );
          })}

          {/* Google Maps Teaser Banner */}
          <div className="bg-neutral-900 border border-cyan-500/30 p-4 rounded-lg space-y-2 mt-4 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Map className="w-4 h-4" />
              <span>GOOGLE MAPS API INTEGRATION (READY)</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Модуль географической карты подготовлен к подключению реальных GPS координат вашей локации для визуализации секторов.
            </p>
          </div>
        </div>

        {/* Right Column: Selected Sector Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-900 border border-amber-500/30 p-6 rounded-lg space-y-4">
            <div className="border-b border-neutral-800 pb-3">
              <div className="text-xs text-neutral-400 uppercase">Выбранный сектор:</div>
              <h2 className="text-lg font-bold text-amber-200 mt-0.5">{selectedLocation.nameRu}</h2>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                {selectedLocation.descriptionRu}
              </p>
            </div>

            {/* Expedition Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={scavengeRuins}
                className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-4 rounded text-xs flex items-center justify-between transition-colors shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>НАЧАТЬ ПОИСК ПРИПАСОВ (Поиск и Скрытность)</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearSectorObstacle}
                className="w-full bg-neutral-950 hover:bg-neutral-800 border border-amber-500/40 text-amber-200 font-bold py-3 px-4 rounded text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>РАСЧИСТИТЬ ЗАВАЛ / ОБВАЛ (Атлетика)</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => startCombatEncounter()}
                className="w-full bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 font-bold py-3 px-4 rounded text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-red-400" />
                  <span>ПАТРУЛИРОВАТЬ И ВСТУПИТЬ В БОЙ</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => travelBetweenSectors(selectedLocation.nameRu)}
                className="w-full bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold py-3 px-4 rounded text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>СМЕНИТЬ ДИСЛОКАЦИЮ И СЕКТОР (Навигация)</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
