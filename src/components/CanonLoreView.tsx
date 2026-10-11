import React, { useState } from 'react';
import { CANON_LORE_ARTICLES, LoreArticle } from '../data/canonLore';
import { BookOpen, ShieldAlert, Sparkles, FileText, Lock } from 'lucide-react';

export const CanonLoreView: React.FC = () => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(CANON_LORE_ARTICLES[0].id);
  const [showSecret, setShowSecret] = useState<boolean>(false);

  const selectedArticle = CANON_LORE_ARTICLES.find((a) => a.id === selectedArticleId) || CANON_LORE_ARTICLES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-mono text-amber-300">
      <div className="flex items-center justify-between mb-6 border-b border-amber-500/30 pb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl font-bold tracking-wider text-amber-400">АРХИВЫ ПУСТОШИ И КАНОН v1.0</h2>
            <p className="text-xs text-neutral-400">Справочник по истории Подмосковья, довоенным технологиям и прологам</p>
          </div>
        </div>

        <button
          onClick={() => setShowSecret(!showSecret)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-all border ${
            showSecret
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-amber-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{showSecret ? 'Скрыть засекреченные архивы ИИ' : 'Доступ к архивам СверхИИ'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Article list sidebar */}
        <div className="space-y-2 bg-neutral-900/80 p-4 rounded-xl border border-amber-500/20 shadow-lg">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 pb-2 border-b border-neutral-800">
            Каталог материалов
          </h3>
          {CANON_LORE_ARTICLES.map((article) => {
            if (article.isSecret && !showSecret) return null;
            return (
              <button
                key={article.id}
                onClick={() => setSelectedArticleId(article.id)}
                className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-2.5 ${
                  selectedArticleId === article.id
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200'
                    : 'bg-neutral-950/60 hover:bg-neutral-800/60 border border-neutral-800 text-neutral-300'
                }`}
              >
                {article.isSecret ? <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> : <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                <div>
                  <div className="text-xs font-bold">{article.titleRu}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{article.categoryRu}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Article viewer */}
        <div className="md:col-span-2 bg-neutral-900/90 p-6 rounded-xl border border-amber-500/30 shadow-xl space-y-6">
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
        </div>
      </div>
    </div>
  );
};
