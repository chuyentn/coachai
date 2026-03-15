import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSalesFOMO } from '../../hooks/useSalesFOMO';
import { ShoppingCart } from 'lucide-react';

export const SalesNotification: React.FC = () => {
  const { pathname } = useLocation();
  const { profile } = useAuth();
  const { currentNotification, isVisible } = useSalesFOMO();

  // Rules:
  // 1. Never show if logged in
  if (profile) return null;
  // 2. Only show on Home (/) or Signup (/auth/signup)
  if (pathname !== '/' && pathname !== '/auth/signup') return null;

  return (
    <AnimatePresence>
      {isVisible && currentNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
          className="fixed bottom-6 left-6 z-[9999] max-w-sm w-[calc(100%-48px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-start gap-4"
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <img 
              src={currentNotification.avatarUrl} 
              alt={currentNotification.name} 
              className="w-12 h-12 rounded-full object-cover shadow-sm bg-slate-100"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <ShoppingCart size={10} className="text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                {currentNotification.name}
              </p>
              <span className="text-[10px] font-medium text-slate-400 shrink-0">
                {currentNotification.timeAgo}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">vừa đăng ký</p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 line-clamp-2 leading-snug">
              {currentNotification.course}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
