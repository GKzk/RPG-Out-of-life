import React from 'react';
import { SectorId } from '../../data/sectors/types';
import { ALL_SECTORS } from '../../data/sectors/worldSectorManager';
import { Compass, ShieldAlert, Clock, MapPin, X, ArrowRight, Radio, TreePine, Warehouse, Shield } from 'lucide-react';

interface RadialWorldMapModalProps {
  currentSectorId: SectorId;
  onSelectSector: (sectorId: SectorId, spawnX?: number, spawnY?: number) => void;
  onClose: () => void;
}

export const RadialWorldMapModal: React.FC<RadialWorldMapModalProps> = ({
  currentSectorId,
  onSelectSector,
  onClose,
}) => {
  const sectors = Object.values(ALL_SECTORS);

  const getSectorIcon = (id: SectorId) => {
    switch (id) {
      case 'village_hub':
        return <Warehouse className="w-5 h-5 text-amber-400" />;
      case 'dead_forest':
        return <TreePine className="w-5 h-5 text-emerald-400" />;
      case 'radio_tower':
        return <Radio className="w-5 h-5 text-cyan-400" />;
      case 'bunker_17':
        return <Shield className="w-5 h-5 text-red-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-stone-950 border-2 border-amber-600/60 rounded-xl shadow-[0_0_50px_rgba(217,119,6,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 px-6 py-4 border-b border-amber-600/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-950/60 border border-amber-600/50 text-amber-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-400 tracking-wider font-mono uppercase">
                ТАКТИЧЕСКАЯ РАДИАЛЬНАЯ КАРТА РЕГИОНА
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                Центральный хаб Подмосковья и прилегающие сектора
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-red-950/80 border border-stone-700 hover:border-red-600 text-stone-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Radial Hub Diagram */}
          <div className="relative p-6 bg-gradient-to-b from-stone-900/90 to-stone-950 border border-amber-900/30 rounded-xl flex flex-col items-center justify-center min-h-[220px]">
            {/* Ambient concentric radar rings */}
            <div className="absolute w-72 h-72 rounded-full border border-amber-600/15 pointer-events-none" />
            <div className="absolute w-48 h-48 rounded-full border border-amber-600/20 pointer-events-none" />
            <div className="absolute w-24 h-24 rounded-full border border-amber-600/30 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full z-10">
              {sectors.map((sec) => {
                const isCurrent = sec.id === currentSectorId;
                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      if (!isCurrent) {
                        onSelectSector(sec.id);
                        onClose();
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                        : 'bg-stone-900/70 border-stone-800 hover:border-amber-600/70 hover:bg-stone-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-stone-950 border border-stone-800">
                          {getSectorIcon(sec.id)}
                        </div>
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-stone-950 uppercase">
                            Текущий
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-stone-400 border border-stone-700 px-1.5 py-0.5 rounded">
                            {sec.dangerRating}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-stone-200 text-sm font-mono leading-tight mb-1">
                        {sec.nameRu}
                      </h3>
                      <p className="text-[11px] text-stone-400 line-clamp-2 mb-2 font-mono">
                        {sec.atmosphereRu}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-500">Сетка: {sec.gridWidth}x{sec.gridHeight}</span>
                      {!isCurrent && (
                        <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Перейти <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sector Details Card */}
          <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 font-mono text-xs text-stone-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <ShieldAlert className="w-4 h-4" />
              ПРАВИЛА ПЕРЕМЕЩЕНИЯ МЕЖДУ СЕКТОРАМИ:
            </div>
            <p className="text-stone-400">
              Переход пешком между секторами требует от 15 до 25 минут игрового времени и расходует воду и калории.
              Вы также можете дойти до края карты текущего сектора (к путевым столбам и дорожным знакам) для бесшовного перемещения.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
