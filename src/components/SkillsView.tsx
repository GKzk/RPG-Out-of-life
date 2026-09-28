import React from 'react';
import { useGame } from '../context/GameContext';
import { SKILL_DEFINITIONS } from '../data/skills';
import { calculateSkillValue, getAvailableSkillPoints, getSkillTrainingCostPerPoint } from '../utils/statCalculations';
import { Award, CheckCircle2, Plus, Sparkles } from 'lucide-react';

export const SkillsView: React.FC = () => {
  const { character, effectiveSpecial, investSkillPoint } = useGame();

  if (!character) return null;

  const remainingPoints = getAvailableSkillPoints(character, effectiveSpecial);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-mono text-amber-300 space-y-6">
      <div className="bg-neutral-900 border border-amber-500/40 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
            <Award className="w-6 h-6" />
            <h1>СИСТЕМА НАВЫКОВ</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Навыки зависят от базовых параметров S.P.E.C.I.A.L. Tagged-навыки получают стартовый бонус +10. Стоимость обучения растёт после 50, 75 и 90. Очки за уровень зависят от вашего <strong className="text-amber-300">Интеллекта</strong>.
          </p>
        </div>

        <div className="bg-neutral-950 border border-amber-500/30 p-3.5 rounded text-right shrink-0">
          <div className="text-xs text-neutral-400">Доступно очков навыков:</div>
          <div className="text-2xl font-bold text-amber-300">{remainingPoints} pt</div>
        </div>
      </div>

      {/* Skills Table / Grid */}
      <div className="bg-neutral-900 border border-amber-500/30 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800 text-amber-500/80 font-bold uppercase tracking-wider">
                <th className="p-3">Название Навыка</th>
                <th className="p-3">Характеристика</th>
                <th className="p-3 text-center">Tagged (+10)</th>
                <th className="p-3 text-center">Вложено</th>
                <th className="p-3 text-right">Итоговое Значение</th>
                <th className="p-3 text-center">Прокачка</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {SKILL_DEFINITIONS.map((skill) => {
                const isTagged = character.taggedSkills.includes(skill.id);
                const invested = character.skillPointsInvested[skill.id] || 0;
                const totalVal = calculateSkillValue(skill.id, character, effectiveSpecial);
                const nextCost = totalVal >= 100 ? 0 : getSkillTrainingCostPerPoint(totalVal);

                return (
                  <tr key={skill.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-amber-200 text-sm">{skill.nameRu}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{skill.description}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-neutral-950 border border-neutral-800 px-2 py-1 rounded text-amber-300 font-bold">
                        {skill.primaryAttr}
                        {skill.secondaryAttr ? ` / ${skill.secondaryAttr}` : ''}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {isTagged ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tagged
                        </span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold text-neutral-300">{invested}</td>
                    <td className="p-3 text-right">
                      <span className="text-base font-bold text-amber-300 font-mono">{totalVal}%</span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => investSkillPoint(skill.id)}
                        disabled={remainingPoints <= 0}
                        className="bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 disabled:opacity-20 text-amber-300 p-1.5 rounded transition-all font-bold"
                        title="Повысить навык: стоимость зависит от текущего значения"
                      >
                        <><Plus className="w-4 h-4" /><span className="sr-only">Стоимость {nextCost} SP</span></>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
