import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ALL_SECTORS } from '../../data/sectors/worldSectorManager';
import { CanonLoreView } from '../CanonLoreView';
import {
  BookOpen,
  ClipboardList,
  Compass,
  FileText,
  X,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  Radio,
  TreePine,
  Warehouse,
  Shield,
  Layers,
} from 'lucide-react';

interface JournalModalProps {
  onClose: () => void;
  initialTab?: 'log' | 'quests' | 'lore' | 'prologue';
}

export const JournalModal: React.FC<JournalModalProps> = ({
  onClose,
  initialTab = 'log',
}) => {
  const { character, combatLog, gameDay, gameTimeHours } = useGame();
  const [activeTab, setActiveTab] = useState<'log' | 'quests' | 'lore' | 'prologue'>(initialTab);
  const [logFilter, setLogFilter] = useState<'all' | 'combat' | 'hazard' | 'heal' | 'info'>('all');

  if (!character) return null;

  const filteredLogs = combatLog.filter((entry) => {
    if (logFilter === 'all') return true;
    if (logFilter === 'combat') return entry.type === 'hit' || entry.type === 'crit' || entry.type === 'miss' || entry.type === 'damage';
    if (logFilter === 'hazard') return entry.type === 'hazard';
    if (logFilter === 'heal') return entry.type === 'heal';
    if (logFilter === 'info') return entry.type === 'info' || entry.type === 'turn';
    return true;
  });

  const getLogTypeBadge = (type: string) => {
    switch (type) {
      case 'damage':
        return <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-950 text-red-400 border border-red-800">Урон</span>;
      case 'hazard':
        return <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-400 border border-amber-800">Угроза</span>;
      case 'heal':
        return <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800">Лечение</span>;
      case 'crit':
        return <span className="px-1.5 py-0.5 rounded text-[9px] bg-yellow-950 text-yellow-300 border border-yellow-700">Крит</span>;
      case 'hit':
        return <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800">Попадание</span>;
      case 'miss':
        return <span className="px-1.5 py-0.5 rounded text-[9px] bg-stone-900 text-stone-500 border border-stone-800">Промах</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] bg-stone-900 text-stone-400 border border-stone-800">Инфо</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono text-amber-300">
      <div className="relative w-full max-w-5xl bg-stone-950 border-2 border-amber-600/60 rounded-2xl shadow-[0_0_50px_rgba(217,119,6,0.25)] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Terminal Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 px-5 py-3 border-b border-amber-600/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-950/70 border border-amber-600/60 text-amber-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-400 tracking-wider uppercase">
                ТЕРМИНАЛ ЖУРНАЛА И ЗАМЕТОК ВЫЖИВШЕГО
              </h2>
              <p className="text-[11px] text-stone-400">
                День {gameDay} • {String(gameTimeHours).padStart(2, '0')}:00 • Хроника Пустоши и статус секторов
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-red-950/80 border border-stone-700 hover:border-red-600 text-stone-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/90 px-4 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('log')}
            className={`py-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'log'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Хроника событий ({combatLog.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quests')}
            className={`py-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'quests'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Радиальные секторы & Задачи</span>
          </button>

          <button
            onClick={() => setActiveTab('lore')}
            className={`py-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'lore'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Лор и архивы Пустоши</span>
          </button>

          <button
            onClick={() => setActiveTab('prologue')}
            className={`py-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'prologue'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Предыстория и миссия</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {/* TAB 1: CHRONICLE / COMBAT LOG */}
          {activeTab === 'log' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-800">
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'Все записи' },
                    { id: 'combat', label: 'Стычки' },
                    { id: 'loot', label: 'Находки' },
                    { id: 'warning', label: 'Предупреждения' },
                    { id: 'info', label: 'Инфо' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setLogFilter(filter.id as any)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                        logFilter === filter.id
                          ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-amber-300'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-stone-500">
                  Показано {filteredLogs.length} записей
                </span>
              </div>

              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {filteredLogs.slice().reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-stone-900/70 border border-stone-800 text-xs flex items-start gap-3 hover:border-stone-700 transition-colors"
                  >
                    <span className="text-[10px] text-amber-500/70 font-mono shrink-0 whitespace-nowrap mt-0.5">
                      {entry.timestamp}
                    </span>
                    <div className="shrink-0">{getLogTypeBadge(entry.type)}</div>
                    <div className="text-stone-200 leading-relaxed flex-1">
                      {entry.textRu}
                    </div>
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <div className="text-center py-12 text-stone-500 text-xs">
                    Записей пока нет. Исследуйте сектор и взаимодействуйте с объектами.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SECTORS & OBJECTIVES */}
          {activeTab === 'quests' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-400 leading-relaxed mb-4">
                Радиальная карта локаций вокруг базового поселения. Каждый сектор содержит точки интереса, заброшенные тайники, источники радиации или укрепления противников.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(ALL_SECTORS).map((sec) => {
                  const completedCount = sec.pois.filter((p) => p.completed).length;
                  return (
                    <div
                      key={sec.id}
                      className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-stone-100 flex items-center gap-2">
                            {sec.id === 'village_hub' && <Warehouse className="w-4 h-4 text-emerald-400" />}
                            {sec.id === 'dead_forest' && <TreePine className="w-4 h-4 text-lime-400" />}
                            {sec.id === 'radio_tower' && <Radio className="w-4 h-4 text-amber-400" />}
                            {sec.id === 'bunker_17' && <Shield className="w-4 h-4 text-cyan-400" />}
                            <span>{sec.nameRu}</span>
                          </div>
                          <div className="text-[11px] text-amber-500/90 mt-0.5">
                            {sec.subtitleRu}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          sec.dangerRating.includes('Безопасно') || sec.dangerRating.includes('Низкая')
                            ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-400'
                            : sec.dangerRating.includes('Средняя')
                            ? 'bg-amber-950/70 border border-amber-800 text-amber-400'
                            : 'bg-red-950/70 border border-red-800 text-red-400'
                        }`}>
                          {sec.dangerRating}
                        </span>
                      </div>

                      <p className="text-xs text-stone-400 leading-relaxed">
                        {sec.descriptionRu}
                      </p>

                      <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                        <span className="text-stone-500">
                          Исследовано объектов: {completedCount} / {sec.pois.length}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-amber-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Сетка {sec.gridWidth}×{sec.gridHeight}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LORE & ARCHIVES */}
          {activeTab === 'lore' && (
            <div>
              <CanonLoreView />
            </div>
          )}

          {/* TAB 4: BACKSTORY & PROLOGUE */}
          {activeTab === 'prologue' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="p-5 rounded-xl bg-stone-900 border border-amber-600/40 space-y-3">
                <div className="text-xs uppercase tracking-widest text-amber-500 font-bold">
                  ЛИЧНОЕ ДЕЛО ВЫЖИВШЕГО • ПРЕДЫСТОРИЯ
                </div>
                <h3 className="text-lg font-bold text-stone-100">
                  {character.name} — {character.background}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Поселение на окраине выжженной долины долго держалось на старых запасах и надежде. Но колодцы пересохли, дизель-генератор сгорел, а сигналы с восточной радиомачты «Маяк-4» внезапно оборвались.
                </p>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Совет старейшин вручил вам потрёпанную карту окрестностей, нож и флягу с чистой водой. Ваша цель — исследовать радиальные секторы: проверить заброшенные избы в Опустевшей деревне, пройти сквозь Мёртвый бор к Ретранслятору «Маяк-4» и найти гермодверь в секретный «Объект-17».
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2 text-xs text-stone-400">
                <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  Советы по выживанию:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Следите за шкалой жажды и голода в нижней панели: обезвоживание резко снижает силу и восприятие.</li>
                  <li>Используйте команды четвероногому компаньону — пес чует засады мародёров и находит закопанные схроны.</li>
                  <li>Включайте режим скрытности при сближении с патрулями: проверка Скрытности позволит обойти врагов без единого выстрела.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
