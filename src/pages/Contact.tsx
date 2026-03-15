import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Calendar, Phone, Mail, CheckCircle2, User, Send, ArrowRight, Zap, Globe, ShieldCheck, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Contact = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
                  <div className="text-xl font-medium">0987.654.321 (Zalo)</div>
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

          {/* Form */}
          <div className="bg-white dark:bg-[#111623] rounded-[2.5rem] p-10 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center py-10"
              >
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 text-center">{t('contact.successTitle')}</h2>
                <p className="text-slate-500 text-center font-medium max-w-sm">
                  {t('contact.successDesc')}
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 px-6 py-3 border-2 border-slate-200 rounded-full text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  {t('contact.btnSendMore')}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">{t('contact.formTitle')} <span className="text-indigo-600">{t('contact.formTitleHighlight')}</span></h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.formName')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required type="text" className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-white" placeholder="" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.formPhone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required type="tel" className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-white" placeholder="" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.formTopic')}</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select required className="w-full appearance-none pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700 dark:text-slate-300">
                      <option value="">{t('contact.topicPlaceholder')}</option>
                      <option value="coaching">{t('contact.topicCoaching')}</option>
                      <option value="course">{t('contact.topicCourse')}</option>
                      <option value="affiliate">{t('contact.topicAffiliate')}</option>
                      <option value="other">{t('contact.topicOther')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('contact.formContent')}</label>
                  <textarea 
                    required 
                    rows={4} 
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none font-medium text-slate-900 dark:text-white" 
                    placeholder={t('contact.contentPlaceholder')}
                  ></textarea>
                </div>

                <button type="submit" className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all shadow-xl shadow-slate-200 dark:shadow-none">
                  {t('contact.btnSubmit')} <Send size={20} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <footer className="py-20 bg-white dark:bg-[#0B0E17] border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="pt-8 flex justify-between items-center gap-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 text-sm font-medium">{t('affiliate.footerCopyright')}</p>
            <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
              <Link to="/"><Zap className="text-indigo-600 inline" size={18} /> {t('contact.backHome')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
