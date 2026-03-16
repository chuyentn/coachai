import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, DollarSign, ArrowRight, CheckCircle2, ShieldCheck, Globe, Zap, Facebook, Youtube, Video, MessageCircle, ChevronRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

export const Affiliate = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0B0E17] font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="pt-32 pb-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-6 border border-indigo-200 dark:border-indigo-800">
            <TrendingUp size={16} /> {t('affiliate.badge')}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-slate-900 dark:text-white">
            {t('affiliate.headline')} <br /><span className="text-indigo-600 dark:text-indigo-400">{t('affiliate.headlineHighlight')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xl font-medium mb-10 max-w-2xl mx-auto">
            {t('affiliate.subHeadline')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-center transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-indigo-50 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <DollarSign size={32} />
              </div>
              <div className="text-2xl font-black mb-1 text-slate-900 dark:text-white">{t('affiliate.stat1Value')}</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('affiliate.stat1Label')}</div>
            </div>
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-center transform hover:-translate-y-1 transition-all duration-300">
               <Link to={profile ? "/payment?plan=vip" : "/auth/signup?plan=vip"} className="relative z-10 shrink-0 px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl shadow-rose-500/20 flex items-center gap-2">
                 Nâng Cấp VIP <ChevronRight size={18} />
               </Link>
              <div className="text-2xl font-black mb-1 text-slate-900 dark:text-white">{t('affiliate.stat2Value')}</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('affiliate.stat2Label')}</div>
            </div>
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-center transform hover:-translate-y-1 transition-all duration-300">
               <div className="w-16 h-16 mx-auto bg-indigo-50 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <Zap size={32} />
              </div>
              <div className="text-2xl font-black mb-1 text-slate-900 dark:text-white">{t('affiliate.stat3Value')}</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('affiliate.stat3Label')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10 relative z-20 mb-24">
        <div className="bg-white dark:bg-[#111623] rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10"
            >
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{t('affiliate.successTitle')}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium whitespace-pre-line">
                {t('affiliate.successDesc', { email: email })}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="text-left">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 text-center">{t('affiliate.formTitle')}</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('affiliate.formNameLabel')}</label>
                  <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all" placeholder={t('affiliate.formNamePlaceholder')} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('affiliate.formEmailLabel')}</label>
                  <input 
                    required 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all" 
                    placeholder={t('affiliate.formEmailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('affiliate.formPhoneLabel')}</label>
                  <input required type="tel" className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all" placeholder={t('affiliate.formPhonePlaceholder')} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('affiliate.formSocialLabel')}</label>
                  <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all" placeholder={t('affiliate.formSocialPlaceholder')} />
                </div>
              </div>
              <Link 
                  to={profile ? "/payment?plan=vip" : "/auth/signup?plan=vip"} 
                  className="flex items-center justify-center gap-2 w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 hover:-translate-y-1"
                >{t('affiliate.btnSubmit')} <ArrowRight size={20} />
              </Link>
            </form>
          )}
        </div>
      </div>

      <footer className="py-20 bg-white dark:bg-[#0B0E17] border-t border-slate-100 dark:border-slate-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Zap size={24} />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">CoachAI</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                {t('common.footerDesc')}
              </p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">{t('affiliate.footerCol1')}</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
                <li><Link to="/affiliate" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-indigo-600 dark:text-indigo-400 font-bold">{t('common.affiliate')}</Link></li>
                <li><Link to="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('home.affiliateVip')}</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('common.coaching')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">{t('affiliate.footerCol2')}</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/groups/vibecodecoaching" target="_blank" rel="noreferrer" title="Group Facebook" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm">
                  <Facebook size={20} />
                </a>
                <a href="https://zalo.me/g/tdhmtu261" target="_blank" rel="noreferrer" title="Zalo Support Group" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                  <MessageCircle size={20} />
                </a>
                <a href="https://t.me/vibecodocoaching" target="_blank" rel="noreferrer" title="Telegram Support Group" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                  <Send size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-medium">{t('common.footerCopyright')}</p>
            <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
              <span className="flex items-center gap-1"><ShieldCheck size={14} /> {t('common.footerSSL')}</span>
              <span className="flex items-center gap-1"><Globe size={14} /> {t('common.footerLang')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
