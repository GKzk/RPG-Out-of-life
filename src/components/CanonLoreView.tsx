import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CANON_LORE_ARTICLES, getVisibleLoreArticles } from '../data/canonLore';
import { BookOpen, ShieldAlert, Sparkles, FileText, Lock, Play } from 'lucide-react';

export const CanonLoreView: React.FC = () => {
  const { unlockedLoreIds, openPrologue, character } = useGame();
  const [selectedArticleId, setSelectedArticleId] = useState<string>(CANON_LORE_ARTICLES[0].id);

  const visibleArticles = getVisibleLoreArticles(unlockedLoreIds);
  const selectedArticle = visibleArticles.find((article) => article.id === selectedArticleId) || visibleArticles[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-mono text-amber-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-amber-500/30 pb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl font-bold tracking-wider text-amber-400">АРХИВЫ ПУСТОШИ И КАНОН v1.0</h2>
            <p className="text-xs text-neutral-400">Справочник по истории Подмосковья (~70 лет после катастроф), СверхИИ и прологу</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {character && (
            <button
              onClick={openPrologue}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-all border bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 font-bold"
            >
              <Play className="w-4 h-4 fill-amber-300" />
              <span>Пролог «Пустая деревня»</span>
            </button>
          )}

          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Засекреченные материалы открываются по ходу сюжета.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Article list sidebar */}
        <div className="space-y-2 bg-neutral-900/80 p-4 rounded-xl border border-amber-500/20 shadow-lg">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 pb-2 border-b border-neutral-800">
            Каталог материалов
          </h3>
          {visibleArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => setSelectedArticleId(article.id)}
              className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-2.5 ${
                selectedArticleId === article.id
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200'
                  : 'bg-neutral-950/60 hover:bg-neutral-800/60 border border-neutral-800 text-neutral-300'
              }`}
            >
              {article.isSecret ? (
                <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-bold">{article.titleRu}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{article.categoryRu}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Article viewer */}
        <div className="md:col-span-2 bg-neutral-900/90 p-6 rounded-xl border border-amber-500/30 shadow-xl space-y-6">
          {selectedArticle ? (
            <>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded border border-amber-500/30">
                    {selectedArticle.categoryRu}
                  </span>
                  <h3 className="text-2xl font-bold text-amber-300 mt-2">{selectedArticle.titleRu}</h3>
                </div>
                {selectedArticle.isSecret && (
                  <span className="flex items-center gap-1 text-xs text-red-400 bg-red-950/40 px-3 py-1 rounded border border-red-500/30">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Гриф: Совершенно секретно</span>
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-300 italic bg-neutral-950/50 p-4 rounded border border-neutral-800">
                {selectedArticle.summaryRu}
              </p>

              <div className="space-y-4">
                {selectedArticle.contentRu.map((paragraph, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm text-neutral-200 leading-relaxed">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                    <p>{paragraph}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-neutral-500 text-sm">Материалы не найдены.</div>
          )}
        </div>
      </div>
    </div>
  );
};
