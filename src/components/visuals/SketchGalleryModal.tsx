import React, { useState } from 'react';
import { Character } from '../../types/game';
import { PET_DEFINITIONS } from '../../data/pets';
import { X, Palette, Sparkles, BookOpen, Layers } from 'lucide-react';
import { CharacterSprite } from './CharacterSprite';
import { CompanionSprite } from './CompanionSprite';

interface SketchGalleryModalProps {
  character: Character;
  onClose: () => void;
}

export const SketchGalleryModal: React.FC<SketchGalleryModalProps> = ({ character, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'character' | 'companions' | 'gear' | 'locations'>('character');
  const [selectedPetId, setSelectedPetId] = useState<string>(character.petId || 'hound');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-neutral-900 border border-amber-500/60 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-amber-500/20">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-300">
                Арт-Бук: Концепт-Скетчи & 2D Модельки «Out-of-life»
              </h2>
              <p className="text-[11px] text-neutral-400">
                Визуальные наработки персонажей, питомцев, снаряжения и первой локации
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-4 gap-2 text-xs">
          <button
            onClick={() => setActiveCategory('character')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeCategory === 'character'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Моделька Персонажа</span>
          </button>

          <button
            onClick={() => setActiveCategory('companions')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeCategory === 'companions'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Компаньоны (5 видов)</span>
          </button>

          <button
            onClick={() => setActiveCategory('gear')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeCategory === 'gear'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Скетчи Экипировки</span>
          </button>

          <button
            onClick={() => setActiveCategory('locations')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeCategory === 'locations'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Пустая Деревня (Концепт)</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* CATEGORY 1: CHARACTER MODEL */}
          {activeCategory === 'character' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 flex flex-col items-center justify-center relative shadow-inner">
                <div className="absolute top-2 left-2 text-[10px] text-amber-500/70 border border-amber-500/20 px-2 py-0.5 rounded bg-black/40">
                  2D SPRITE RENDER // SVG VINTAGE
                </div>
                <div className="p-8">
                  <CharacterSprite character={character} direction="south" scale={2.5} isSelected={true} />
                </div>
                <div className="text-center mt-2">
                  <div className="text-amber-300 font-bold text-sm">{character.name}</div>
                  <div className="text-neutral-400 text-xs">
                    {character.gender === 'female' ? 'Выжившая' : 'Выживший'} • Ур. {character.level}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>Анатомия и слои 2D-модели:</span>
                </h4>
                <ul className="space-y-2 text-neutral-300">
                  <li className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <strong className="text-amber-300">Базовый силуэт:</strong> Плотное телосложение, защитные наколенники, прошитые стальной нитью армейские ботинки для тяжелой пересеченной местности.
                  </li>
                  <li className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <strong className="text-amber-300">Экипировка:</strong> Водонепроницаемая брезентовая штормовка с подкладкой, тактический разгрузочный жилет и станковый туристический рюкзак со скаткой.
                  </li>
                  <li className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <strong className="text-amber-300">Защита дыхания:</strong> Противопылевой респиратор с угольным фильтром и защитные очки от песчаных бурь и спор аномальных грибов.
                  </li>
                  <li className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <strong className="text-amber-300">Наручный прибор:</strong> Модифицированный прототип Pip-Boy 3000 Mk.V на левом предплечье с монохромным янтарно-зеленым экраном.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* CATEGORY 2: COMPANIONS */}
          {activeCategory === 'companions' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
                {PET_DEFINITIONS.filter((p) => p.id !== 'none').map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedPetId === pet.id
                        ? 'bg-amber-500 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {pet.nameRu} ({pet.speciesRu})
                  </button>
                ))}
              </div>

              {PET_DEFINITIONS.filter((p) => p.id === selectedPetId).map((pet) => (
                <div key={pet.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 flex flex-col items-center justify-center">
                    <div className="p-8">
                      <CompanionSprite petId={pet.id} scale={2.8} isMoving={false} />
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-amber-300 font-bold text-sm">{pet.nameRu}</div>
                      <div className="text-neutral-400 text-xs">{pet.subtitleRu}</div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
                    <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                      <h4 className="font-bold text-amber-400 mb-1">Специфика спрайта:</h4>
                      <p className="text-neutral-300">{pet.descriptionRu}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                      <h4 className="font-bold text-amber-400 mb-1">Геймплейное применение в деревне:</h4>
                      <p className="text-neutral-300">
                        {pet.id === 'hound' && 'Обнаружение приближения мародёров, рык на часовых, нахождение следов старосты.'}
                        {pet.id === 'cat' && 'Бесшумное передвижение по кустам, предчувствие радиоактивных пятен.'}
                        {pet.id === 'crow' && 'Полная разведка крыш с воздуха, сброс тумана войны, отвлечение часовых.'}
                        {pet.id === 'ferret' && 'Проникновение в узкие щели разрушенных фундаментов, кража ценных деталей.'}
                        {pet.id === 'boar' && 'Сбивание бревенчатых завалов, расчистка погребов, таран врагов.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CATEGORY 3: GEAR SKETCHES */}
          {activeCategory === 'gear' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="h-28 flex items-center justify-center bg-neutral-900/50 rounded-lg border border-neutral-800/80">
                  <svg viewBox="0 0 100 60" className="w-24 h-20">
                    {/* Knife sketch */}
                    <path d="M 15,35 L 35,35 L 75,25 Q 90,20 85,35 L 35,40 Z" fill="#94a3b8" stroke="#f59e0b" strokeWidth="1.5" />
                    <rect x="10" y="32" width="25" height="10" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                    <circle cx="18" cy="37" r="1.5" fill="#d97706" />
                    <circle cx="28" cy="37" r="1.5" fill="#d97706" />
                  </svg>
                </div>
                <h5 className="font-bold text-amber-300 text-xs">Охотничий нож</h5>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Кованый клинок с деревянной ручкой. Служит как оружием, так и инструментом срезания веревок и вскрытия тайников.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="h-28 flex items-center justify-center bg-neutral-900/50 rounded-lg border border-neutral-800/80">
                  <svg viewBox="0 0 100 60" className="w-24 h-20">
                    {/* Dynamo flashlight sketch */}
                    <rect x="25" y="20" width="45" height="24" rx="4" fill="#3f3f46" stroke="#f59e0b" strokeWidth="1.5" />
                    <circle cx="25" cy="32" r="8" fill="#fbbf24" stroke="#f59e0b" />
                    <rect x="70" y="26" width="15" height="12" rx="2" fill="#52525b" />
                    <line x1="78" y1="26" x2="84" y2="15" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h5 className="font-bold text-amber-300 text-xs">Динамо-фонарь "Жучок"</h5>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Ручной генератор света, незаменимый для ночного исследования брошенных срубов деревни.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="h-28 flex items-center justify-center bg-neutral-900/50 rounded-lg border border-neutral-800/80">
                  <svg viewBox="0 0 100 60" className="w-24 h-20">
                    {/* Map sketch */}
                    <rect x="20" y="10" width="60" height="42" rx="2" fill="#d4d4d8" stroke="#f59e0b" strokeWidth="1.5" />
                    <path d="M 25,25 Q 40,15 50,30 T 75,20" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3,2" />
                    <circle cx="50" cy="30" r="3" fill="#dc2626" />
                    <line x1="28" y1="45" x2="45" y2="45" stroke="#71717a" strokeWidth="1" />
                  </svg>
                </div>
                <h5 className="font-bold text-amber-300 text-xs">Карта Старосты на брезенте</h5>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Старинный план лесных дорог Подмосковья с пометками брошенных деревень и схронов.
                </p>
              </div>
            </div>
          )}

          {/* CATEGORY 4: LOCATIONS */}
          {activeCategory === 'locations' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-3 leading-relaxed">
                <h4 className="text-sm font-bold text-amber-400">Сеттинг: Пустая деревня в Подмосковье (~70 лет после коллапса)</h4>
                <p className="text-neutral-300">
                  Окруженная глухим смешанным бором деревня представляет собой образец реконструктивистского выживания.
                  Деревянные срубы укреплены кузовными листами, на крыше сарая смонтирована радиомачта на аккумуляторах,
                  а в мастерской кузнеца установлен перебранный дизельный генератор.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded bg-neutral-900 border border-neutral-800">
                    <span className="text-amber-400 font-semibold block mb-1">Сетка тактики (12x10):</span>
                    Позволяет пошагово перемещаться, использовать укрытия из поваленных сосен и разрушенных заборов.
                  </div>
                  <div className="p-3 rounded bg-neutral-900 border border-neutral-800">
                    <span className="text-amber-400 font-semibold block mb-1">Поле обзора (Fog of War):</span>
                    Исследование с фонарем или разведка ворона Каркуна открывают скрытые углы заброшенных домов.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
