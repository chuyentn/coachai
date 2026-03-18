import React from 'react';
import { Sparkles, BookOpen, Wrench, HeadphonesIcon, Info } from 'lucide-react';
import type { CoachAIBot } from './types';

interface CoachAICardProps {
  bot: CoachAIBot;
}

export const CoachAICard: React.FC<CoachAICardProps> = ({ bot }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gem': return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'notebooklm': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'course': return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'tool': return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'support': return <HeadphonesIcon className="w-4 h-4 text-indigo-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'gem': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'notebooklm': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'course': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'tool': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'support': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="group flex flex-col h-full bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Thumbnail area */}
      <div className="relative h-40 w-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-6 border-b border-gray-100 dark:border-slate-700/50 overflow-hidden">
        {bot.thumbnail_url ? (
          <img 
            src={bot.thumbnail_url} 
            alt={bot.title} 
            className="w-20 h-20 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            {getCategoryIcon(bot.category)}
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 relative z-10">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium pb-[3px] shadow-sm ${getCategoryTheme(bot.category)}`}>
            {getCategoryIcon(bot.category)}
            <span className="capitalize">{bot.category}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {bot.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
          {bot.short_desc}
        </p>

        {/* Tags */}
        {bot.tags && (
          <div className="flex flex-wrap gap-2 mb-6">
            {bot.tags.split(',').map((tag, idx) => (
              <span key={idx} className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-md">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-auto relative z-10">
          {bot.button_primary_url && (
            <a
              href={bot.button_primary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              {bot.button_primary_text || 'Open'}
            </a>
          )}
          {bot.button_secondary_url && (
            <a
              href={bot.button_secondary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            >
              {bot.button_secondary_text || 'Details'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
