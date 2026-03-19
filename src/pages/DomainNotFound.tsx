import React from 'react';
import { motion } from 'framer-motion';

export const DomainNotFound: React.FC = () => {
  const domain = window.location.hostname;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#0B0E17] font-sans selection:bg-indigo-500/30">
      <div className="max-w-xl mx-auto p-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none p-10 border border-slate-100/80 dark:border-slate-800 relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/5 blur-[80px] pointer-events-none" />

          <div className="relative w-24 h-24 mx-auto bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-8 border border-rose-100 dark:border-rose-500/20">
            <svg className="w-12 h-12 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Tên miền chưa được đăng ký
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed">
            Hệ thống đào tạo tại địa chỉ <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{domain}</strong> hiện chưa được cấu hình hoặc đã hết hạn dịch vụ.
          </p>
          
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-2xl mb-8 border border-indigo-100/50 dark:border-indigo-500/20 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <svg className="w-16 h-16 text-indigo-500/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 relative z-10 text-lg">Bạn là chủ sở hữu tên miền này?</h3>
            <p className="text-indigo-700/80 dark:text-indigo-400/80 text-sm mb-6 relative z-10 leading-relaxed max-w-[90%]">
              Biến tên miền này thành một Hệ thống LMS Đào tạo mang thương hiệu riêng của bạn chỉ trong 30 phút. Không cần biết code!
            </p>
            <a 
              href="https://coach.online/start" 
              className="relative z-10 inline-flex items-center justify-center w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5"
            >
              <span>Khởi tạo Nền tảng ngay</span>
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
          </div>
          
          <a href="https://coach.online" className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors inline-block">
            Tìm hiểu thêm về nền tảng Coach.online
          </a>
        </motion.div>
      </div>
    </div>
  );
};
