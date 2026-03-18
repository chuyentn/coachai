import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Calendar, Phone, Mail, CheckCircle2, User, Send, ArrowRight, Zap, Globe, ShieldCheck, Facebook, Youtube, Users, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0B0E17] font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Container */}
      <div className="pt-32 pb-20 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Info */}
          <div className="bg-indigo-600 text-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[50px] rounded-full pointer-events-none" />
            
            <h2 className="text-3xl font-black mb-10">{t('contact.infoTitle')}</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-1">{t('contact.supportEmail')}</div>
                  <div className="text-xl font-medium">support@coachai.vn</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-1">{t('contact.hotline')}</div>
                  <div className="text-xl font-medium hover:text-indigo-200 transition-colors"><a href="https://zalo.me/0989890022" target="_blank" rel="noreferrer">0989.890.022 (Zalo Admin)</a></div>
                  <div className="text-xl font-medium mt-1 hover:text-indigo-200 transition-colors"><a href="https://t.me/victorchuyen" target="_blank" rel="noreferrer">@victorchuyen (Telegram Admin)</a></div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-2">Cộng Đồng & Support</div>
                  <div className="flex gap-4">
                    <a href="https://www.facebook.com/groups/vibecodecoaching" target="_blank" rel="noreferrer" title="Group Facebook" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><Facebook size={20} /></a>
                    <a href="https://zalo.me/g/tdhmtu261" target="_blank" rel="noreferrer" title="Zalo Support Group" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><MessageCircle size={20} /></a>
                    <a href="https://t.me/vibecodocoaching" target="_blank" rel="noreferrer" title="Telegram Support Group" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><Send size={20} /></a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-1">{t('contact.workHoursTitle')}</div>
                  <div className="text-xl font-medium">{t('contact.workHours1')}<br/>{t('contact.workHours2')}</div>
                </div>
              </div>
            </div>

            <div className="mt-16 bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Zap size={20} className="text-amber-400" /> {t('contact.b2bTitle')}</h3>
              <p className="text-indigo-100 text-sm">
                {t('contact.b2bDesc')}
              </p>
            </div>
          </div>

          {/* Form / Booking Lịch */}
          <div className="bg-white dark:bg-[#111623] rounded-[2.5rem] p-4 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[700px]">
            <div className="text-center mb-6 px-4">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">Đặt lịch <span className="text-indigo-600">Coaching 1:1</span></h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Chọn khung giờ phù hợp bên dưới. Hệ thống sẽ tự động duyệt và gửi link Google Meet qua Email của bạn.</p>
            </div>
            
            <div className="flex-1 w-full relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/50">
              <iframe 
                src="https://cal.com/victorchuyen/coachai?embed=true&theme=light" 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Đặt lịch Coaching CoachAI"
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="py-20 bg-white dark:bg-[#0B0E17] border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="pt-8 flex justify-between items-center gap-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 text-sm font-medium">{t('common.footerCopyright')}</p>
            <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
              <Link to="/"><Zap className="text-indigo-600 inline" size={18} /> {t('contact.backHome')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
