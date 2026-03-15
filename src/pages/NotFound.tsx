import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { usePageTitle } from '../hooks/usePageTitle';

/**
 * P4.6: Styled 404 Not Found page.
 * Replaces the silent Navigate to="/" redirect in App.tsx.
 */
export const NotFound: React.FC = () => {
  usePageTitle('404 – Trang không tìm thấy');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Animated 404 */}
        <div className="relative mb-10">
          <div className="text-[10rem] font-black text-slate-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 animate-bounce">
              <Zap className="text-white w-12 h-12" fill="currentColor" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          Trang không tìm thấy
        </h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển. 
          Hãy thử tìm kiếm hoặc quay về trang chủ.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            <Home size={18} />
            Về trang chủ
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
        </div>

        <Link
          to="/?q="
          className="mt-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-600 transition-colors font-medium"
        >
          <Search size={16} />
          Tìm kiếm khóa học
        </Link>
      </motion.div>
    </div>
  );
};
