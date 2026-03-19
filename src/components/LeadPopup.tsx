import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Phone, User, Mail, MessageSquare, CheckCircle2, Star, ChevronDown } from 'lucide-react';
import { googleSheetsService } from '../services/googleSheetsService';
import { crmService } from '../services/crmService';
import { useTranslation } from 'react-i18next';

export const LeadPopup: React.FC = () => {
  const { t } = useTranslation();
  const appName = import.meta.env.VITE_APP_NAME || 'CoachAI';
  
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    note: ''
  });

  useEffect(() => {
    // Show popup after 60 seconds or on exit intent, but only if not submitted and not dismissed recently
    const hasSubmitted = localStorage.getItem('lead_submitted');
    const lastDismissed = localStorage.getItem('lead_dismissed_at');
    
    // Check if dismissed in the last 7 days
    if (lastDismissed) {
      const daysSinceDismissal = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 7) return;
    }

    if (!hasSubmitted) {
      const timer = setTimeout(() => setIsOpen(true), 60000); // Increased to 60s
      
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setIsOpen(true);
        }
      };
      
      // Only attach leave listener if we haven't shown it yet
      if (!isOpen) {
        document.addEventListener('mouseleave', handleMouseLeave);
      }

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('lead_dismissed_at', Date.now().toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await googleSheetsService.submitLead(
        formData.email,
        formData.name,
        formData.phone,
        `[Trang chủ Popup] Giai đoạn: ${formData.note || 'Chưa chọn'}`
      );
      if (success) {
        setSubmitted(true);
        localStorage.setItem('lead_submitted', 'true');
        
        // Gửi email chào mừng ngay khi khách để lại thông tin
        try {
          await crmService.sendTransactionalEmail(
            formData.email,
            `🎁 Quà tặng từ ${appName}: Hệ sinh thái AI & Coaching`,
            `
              <h2 style="color: #4f46e5; margin-top: 0;">Chào ${formData.name}!</h2>
              <p>Cảm ơn bạn đã quan tâm đến <strong>${appName}</strong>. Chúng tôi đã nhận được thông tin đăng ký nhận quà của bạn.</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Trạng thái:</strong> Đã tiếp nhận & Đang xử lý</p>
                <p style="margin: 5px 0 0 0;"><strong>Gói quà:</strong> Bộ tài liệu hướng dẫn AI & Coaching thực chiến</p>
              </div>
              <p>Mentor sẽ sớm liên hệ với bạn qua SĐT <strong>${formData.phone}</strong> để gửi quà và hỗ trợ bạn lộ trình phát triển tốt nhất.</p>
              <p>Trong lúc đó, hãy khám phá các khóa học hấp dẫn khác của chúng tôi tại Dashboard nhé.</p>
            `
          );
        } catch (emailErr) {
          console.error('Lỗi khi gửi email chào mừng từ Popup:', emailErr);
        }

        setTimeout(() => setIsOpen(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        // P2.4 Fix: The backdrop is now a child inside AnimatePresence-animated element,
        // so it disappears atomically with the modal — no lingering invisible overlay.
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-black/5 dark:border-slate-700/50"
          >
            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-400/20 via-purple-400/15 to-transparent dark:from-indigo-500/10 dark:via-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-emerald-400/15 to-transparent dark:from-emerald-500/8 rounded-full blur-2xl pointer-events-none" />
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
            >
              <X size={20} className="text-slate-400" />
            </button>
            {!submitted ? (
              <div className="p-8 md:p-12">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold mb-4 border border-amber-200 dark:border-amber-500/30 shadow-sm shadow-amber-100 dark:shadow-none">
                    <Star size={12} fill="currentColor" className="drop-shadow-sm" /> {t('leadPopup.badge')}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{t('leadPopup.title')}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-sm md:text-base">{t('leadPopup.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="text"
                      placeholder={t('leadPopup.name')}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="email"
                      placeholder={t('leadPopup.email')}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="tel"
                      placeholder={t('leadPopup.phone')}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      required
                      className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all appearance-none font-medium"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    >
                      <option value="">{t('leadPopup.selectStagePlaceholder')}</option>
                      <option value="Hoàn toàn mới, chưa biết gì">{t('leadPopup.stageNew')}</option>
                      <option value="Đã học cơ bản, muốn làm dự án thật">{t('leadPopup.stageBasic')}</option>
                      <option value="Đã có dự án, cần tối ưu / scale">{t('leadPopup.stageAdvanced')}</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 overflow-hidden group"
                  >
                    <span className="relative z-10">{loading ? t('leadPopup.loading') : `✉️ ${t('leadPopup.btnSubmit')}`}</span>
                    <div className="absolute inset-0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] bg-white/10 transition-transform duration-700" />
                  </button>
                </form>

                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 font-medium">
                  {t('leadPopup.privacy')}
                </p>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200 dark:shadow-emerald-500/20">
                  <CheckCircle2 size={40} strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('leadPopup.successTitle')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium">
                  {t('leadPopup.successDesc')}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
