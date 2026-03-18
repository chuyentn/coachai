import React from 'react';
import { Sparkles, BookOpen, Wrench, HeadphonesIcon, Info } from 'lucide-react';
import { motion } from 'motion/react';
import type { CoachAIBot } from './types';

interface CoachAICardProps {
  bot: CoachAIBot;
  index?: number;
}

export const CoachAICard: React.FC<CoachAICardProps> = ({ bot, index = 0 }) => {
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group flex flex-col h-full bg-white/80 dark:bg-[#111623]/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300"
    >
      
      {/* Thumbnail area */}
      <div className="relative h-44 w-full bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900/50 dark:to-indigo-900/10 flex items-center justify-center p-6 border-b border-gray-100 dark:border-slate-800/60 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl rounded-full scale-150" />
        
        {bot.thumbnail_url ? (
          <img 
            src={bot.thumbnail_url} 
            alt={bot.title} 
            className="w-24 h-24 object-contain drop-shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10"
          />
        ) : (
          <div className="w-24 h-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-inner relative z-10">
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
      <div className="p-8 flex flex-col flex-grow relative z-20">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all">
          {bot.title}
        </h3>
        <p className="text-slate-500 font-medium text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
          {bot.short_desc}
        </p>

        {/* Tags */}
        {bot.tags && (
          <div className="flex flex-wrap gap-2 mb-8 mt-auto">
            {bot.tags.split(',').map((tag, idx) => (
              <span key={idx} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 rounded-lg group-hover:border-indigo-200 dark:group-hover:border-indigo-800/50 border border-transparent transition-colors">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          {bot.button_primary_url && (
            <a
              href={bot.button_primary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 dark:bg-white group-hover:bg-indigo-600 group-hover:text-white text-white dark:text-slate-900 text-sm font-black rounded-xl transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/10 group-hover:shadow-indigo-600/30 active:scale-95"
            >
              {bot.button_primary_text || 'Open'}
            </a>
          )}
          {bot.button_secondary_url && (
            <a
              href={bot.button_secondary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl border-2 border-slate-100 dark:border-slate-800 transition-all active:scale-95"
            >
              {bot.button_secondary_text || 'Details'}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};
