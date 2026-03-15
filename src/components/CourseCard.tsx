import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { PlayCircle, Users, Star, Clock, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all group flex flex-col h-full"
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
          <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-indigo-200 flex items-center gap-1 border border-indigo-400">
            <Zap size={10} fill="currentColor" />
            AI Coaching
          </span>
          {course.total_students > 50 && (
            <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-rose-200 flex items-center gap-1 border border-rose-400">
              Bán chạy
            </span>
          )}
          <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-emerald-200 flex items-center gap-1 border border-emerald-400">
            📦 Có mã nguồn
          </span>
          {(!course.price_vnd || course.price_vnd === 0) && (
            <span className="px-3 py-1 bg-slate-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-slate-300 flex items-center gap-1 border border-slate-500">
              🆓 Xem miễn phí
            </span>
          )}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{course.avg_rating || 4.8}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <Users size={14} />
            <span className="text-xs font-medium">{course.total_students || 0} học viên</span>
          </div>
        </div>

        <h3 className="font-black text-xl text-slate-900 dark:text-white line-clamp-2 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
          {course.title.includes('JavaScript') ? 'Xây Chatbot AI cho Website trong 1 ngày' :
           course.title.includes('React') ? 'App AI Sinh Ảnh (SaaS) với React' :
           course.title.includes('Python') ? 'Tự Động Hóa Affiliate với AI Agent & Python' :
           course.title}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 font-medium leading-relaxed">
          {course.description}
        </p>

        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-900/50">
            <Zap size={14} className="text-indigo-500" /> Phù hợp: Người mới / Không cần code
          </span>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-indigo-600 dark:text-indigo-400 font-black text-xl tracking-tight">
              {(course.price_vnd || 0).toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
              Truy cập trọn đời
            </span>
          </div>
          <Link
            to={`/courses/${course.id}`}
            className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-xl shadow-slate-100 dark:shadow-none hover:shadow-indigo-100 flex items-center gap-1 whitespace-nowrap"
          >
            Xem & Tải mã nguồn →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
