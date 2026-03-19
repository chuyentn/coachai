import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SaaSOnboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    domain: '',
    appName: '',
    color: '#10B981',
    oldWebsite: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return;
    setStep(4);
    // In a real scenario, this would post to the N8N/Webhook
    // which then creates the Tenant row in Google Sheets
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0B0E17] font-sans flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold tracking-widest text-sm uppercase mb-3 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-full"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Setup 30 Phút</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Khởi tạo Hệ thống
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto">
            Biến kiến thức của bạn thành một cỗ máy in tiền tự động mang thương hiệu độc quyền.
          </p>
        </div>

        <motion.div 
          className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {step < 4 && (
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              {[1, 2, 3].map((i, index) => (
                <div key={i} className={`flex-1 flex flex-col items-center py-5 relative ${step >= i ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 z-10 transition-colors ${step >= i ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    {step > i ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : i}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider hidden sm:block">
                    {i === 1 ? 'Định danh' : i === 2 ? 'Thương hiệu' : 'Kích hoạt'}
                  </span>
                  {index < 2 && (
                    <div className="absolute top-9 left-1/2 w-full h-[2px] bg-slate-200 dark:bg-slate-800">
                      <div className={`h-full bg-indigo-600 transition-all duration-500 ${step > i ? 'w-full' : 'w-0'}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="p-8 sm:p-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">1. Tên gọi & Đường dẫn</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên nền tảng hiển thị</label>
                      <input 
                        type="text" 
                        placeholder="VD: Học viện Đào tạo Khởi nghiệp"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                        value={formData.appName}
                        onChange={e => setFormData({...formData, appName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên miền hệ thống</label>
                      <div className="flex items-stretch shadow-sm rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                        <input 
                          type="text" 
                          placeholder="ten-ban"
                          className="w-full px-5 py-4 border-y border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none text-right font-medium"
                          value={formData.domain}
                          onChange={e => setFormData({...formData, domain: e.target.value})}
                        />
                        <span className="px-5 py-4 bg-slate-100 dark:bg-slate-800 border-y border-r border-slate-200 dark:border-slate-700 text-slate-500 font-bold whitespace-nowrap">.coach.online</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 ml-1">Bạn có thể trỏ tên miền riêng (.com, .vn) sau khi hệ thống hoạt động.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!formData.appName || !formData.domain}
                    className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Tiếp tục
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">2. Auto Migrate & Branding</h2>
                  <div className="space-y-8">
                    <div>
                      <label className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        <span>AI Clone Website cũ</span>
                        <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-full uppercase">HOT</span>
                      </label>
                      <p className="text-sm text-slate-500 mb-3 leading-relaxed">Chỉ cần dán link website cũ (VD: WordPress, Teachable) của bạn vào đây. AI Crawler sẽ tự quét, lấy Khóa học và Bài viết mang sang nhà mới hoàn toàn tự động.</p>
                      <input 
                        type="url" 
                        placeholder="https://your-old-site.com (Tùy chọn)"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                        value={formData.oldWebsite}
                        onChange={e => setFormData({...formData, oldWebsite: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Màu sắc chủ đạo (Theme Color)</label>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <input 
                            type="color" 
                            className="w-16 h-16 rounded-2xl cursor-pointer border-0 p-0 opacity-0 absolute inset-0 z-10"
                            value={formData.color}
                            onChange={e => setFormData({...formData, color: e.target.value})}
                          />
                          <div className="w-16 h-16 rounded-2xl shadow-inner flex items-center justify-center border-2 border-slate-200 dark:border-slate-700" style={{ backgroundColor: formData.color }}>
                            <svg className="w-6 h-6 text-white/80 mix-blend-difference" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {['#10B981', '#3B82F6', '#F43F5E', '#8B5CF6', '#F59E0B'].map(c => (
                            <div 
                              key={c}
                              onClick={() => setFormData({...formData, color: c})}
                              className={`w-10 h-10 rounded-full cursor-pointer ring-offset-4 dark:ring-offset-slate-900 transition-all ${formData.color === c ? 'ring-2 scale-110' : 'hover:scale-110'}`}
                              style={{ backgroundColor: c, borderColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-10">
                    <button onClick={() => setStep(1)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Quay lại</button>
                    <button onClick={() => setStep(3)} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20">Tiếp tục</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">3. Kích hoạt Radar</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email nhận thông báo Admin</label>
                      <input 
                        type="email" 
                        placeholder="admin@example.com"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <p className="text-sm text-indigo-900 dark:text-indigo-300 leading-relaxed font-medium">
                          Sau khi gửi yêu cầu, hệ thống AI sẽ tự động sinh ra một file Google Sheets cá nhân cho bạn. Đây sẽ là "Trái tim hệ thống" để quản lý Học viên và Doanh thu.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-10">
                    <button onClick={() => setStep(2)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Quay lại</button>
                    <button onClick={handleSubmit} disabled={!formData.email} className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2">
                      <span>Bắt đầu Khởi chạy AI</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" className="text-center py-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="relative w-28 h-28 mx-auto mb-8">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                    <div className="relative w-full h-full bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500">
                      <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">AI Đang Làm Việc!</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg leading-relaxed">
                    Đội ngũ AI của Cloudflare và Google đang quét dữ liệu và thiết lập nền tảng cho bạn. Vui lòng kiểm tra hòm thư <strong>{formData.email}</strong> trong vòng 30 phút tới.
                  </p>
                  <a href="/" className="inline-block py-4 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl transition-all hover:-translate-y-1 shadow-xl">
                    Về Trang Chủ Coach.online
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
