import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { PlayCircle, Users, Star, Clock, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  
  const displayTitle = isEn && course.title_en ? course.title_en : course.title;
  const displayDescription = isEn && course.short_description_en ? course.short_description_en : (course.short_description || course.description);

  return (
    <Link to={`/courses/${course.id}`} className="block h-full group outline-none">
      <motion.div 
        whileHover={{ y: -8 }}
        className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all flex flex-col h-full"
      >
      <div className="aspect-[16/10] relative overflow-hidden">
        <img
          src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/600/400`}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-transform duration-500">
            <PlayCircle size={32} />
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/30 flex items-center gap-1 border border-indigo-400/50">
            <Zap size={10} fill="currentColor" />
            AI Coaching
          </span>
          {course.total_students > 50 && (
            <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-rose-200 flex items-center gap-1 border border-rose-400">
              {t('courseCard.bestseller')}
            </span>
          )}
          <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-emerald-200 flex items-center gap-1 border border-emerald-400">
            {t('courseCard.hasSourceCode')}
          </span>
          {(!course.price_vnd || course.price_vnd === 0) && (
            <span className="px-3 py-1 bg-slate-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-slate-300 flex items-center gap-1 border border-slate-500">
              {t('courseCard.freeAccess')}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{course.avg_rating || 4.8}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <Users size={14} />
            <span className="text-xs font-medium">{course.total_students || 0} {t('courseCard.studentsCount')}</span>
          </div>
        </div>

        <h3 className="font-black text-xl text-slate-900 dark:text-white line-clamp-2 mb-3 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-indigo-400 dark:group-hover:to-purple-400 transition-all leading-tight">
          {displayTitle}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 font-medium leading-relaxed">
          {displayDescription}
        </p>

        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-900/50">
            <Zap size={14} className="text-indigo-500" /> {t('courseCard.suitability')}
          </span>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-indigo-600 dark:text-indigo-400 font-black text-xl tracking-tight">
              {(course.price_vnd || 0).toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
              {t('courseCard.lifetimeAccess')}
            </span>
          </div>
          <div className="relative px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-bold transition-all shadow-xl shadow-slate-100 dark:shadow-none hover:shadow-indigo-500/20 flex items-center gap-1 whitespace-nowrap overflow-hidden group/btn bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent">
            <span className="relative z-10">{t('courseCard.viewDetails')}</span>
            <div className="absolute inset-0 -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[200%] bg-white/20 transition-transform duration-700" />
          </div>
        </div>
      </div>
      </motion.div>
    </Link>
  );
};
