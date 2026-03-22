import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Calendar, Phone, Mail, CheckCircle2, User, Send, ArrowRight, Zap, Globe, Facebook, MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { googleSheetsService } from '../services/googleSheetsService';
import { crmService } from '../services/crmService';
import { useSaaSConfig } from '../hooks/useSaaSConfig';

export const Contact = () => {
  const { t } = useTranslation();
  const config = useSaaSConfig();
  
  const appName = config.appName;
  const companyName = config.companyName;
  const supportEmail = config.supportEmail;
  const adminZalo = config.adminZalo;
  const adminTelegram = config.adminTelegram;
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Submit to Google Sheets with Tag
      await googleSheetsService.submitLead(
        formData.email,
        formData.name,
        formData.phone,
        `[Liên Hệ - ${formData.topic}] ${formData.message}`
      );

      // 2. Send Notification Email via Smart Email Hub
      await crmService.sendTransactionalEmail(
        formData.email,
        `[${appName}] Xác nhận yêu cầu: ${formData.topic}`,
        `
          <p>Chào <strong>${formData.name}</strong>,</p>
          <p>Cảm ơn bạn đã liên hệ với ${appName}. Chúng mình đã nhận được yêu cầu về chủ đề <strong>${formData.topic}</strong>.</p>
          <p>Đội ngũ hỗ trợ sẽ phản hồi bạn trong vòng 24h làm việc.</p>
          <div style="margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 10px;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">💡 Bạn muốn trao đổi trực tiếp ngay?</p>
            <p style="margin: 5px 0 15px 0;">Hãy đặt lịch Coaching 1:1 miễn phí 30 phút để được giải đáp thắc mắc nhanh nhất.</p>
          </div>
        `
      );

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', topic: '', message: '' });
    } catch (error) {
      console.error('Contact submission error:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
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
                  <div className="text-xl font-medium">{supportEmail}</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-2">{t('contact.hotline')}</div>
                  <div className="flex flex-col gap-3">
                    <div className="text-lg font-bold">{adminZalo}</div>
                    <div className="flex gap-3">
                      <a href={config.adminWhatsappLink || `https://zalo.me/${adminZalo.replace(/\./g, '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer" title="Zalo Admin" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><MessageCircle size={20} /></a>
                      <a href={config.adminWhatsappLink || `https://wa.me/${adminZalo.replace(/\./g, '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer" title="Whatsapp Admin" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><Users size={20} /></a>
                      <a href={adminTelegram.startsWith('http') ? adminTelegram : `https://t.me/${adminTelegram.replace('@', '')}`} target="_blank" rel="noreferrer" title="Telegram Admin" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><Send size={20} /></a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-2">Cộng Đồng & Support</div>
                  <div className="flex flex-wrap gap-3">
                    <a href={config.fbGroupUrl || "#"} target="_blank" rel="noreferrer" title="Group Facebook" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><Facebook size={20} /></a>
                    <a href={config.zaloGroupUrl || "#"} target="_blank" rel="noreferrer" title="Zalo Support Group" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><MessageCircle size={20} /></a>
                    <a href={config.telegramGroupUrl || "#"} target="_blank" rel="noreferrer" title="Telegram Support Group" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><Send size={20} /></a>
                    <a href={config.whatsappGroupUrl || "#"} target="_blank" rel="noreferrer" title="Whatsapp Group" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><Users size={20} /></a>
                    <a href={config.whatsappChannelUrl || "#"} target="_blank" rel="noreferrer" title="Whatsapp Channel" className="w-10 h-10 bg-white/10 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"><Globe size={20} /></a>
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

          {/* Form & Booking Section */}
          <div className="space-y-6">
            {/* Cal.com Quick Action Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <Calendar className="text-amber-400" /> {t('contact.booking.title')}
                  </h3>
                  <p className="text-indigo-100 font-medium">{t('contact.booking.subtitle')}</p>
                </div>
                <a 
                  href="https://cal.com/victorchuyen/coachai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white text-indigo-600 font-black rounded-xl hover:bg-indigo-50 transition-all flex items-center gap-2 shrink-0 shadow-lg group-hover:scale-105 active:scale-95"
                >
                  {t('contact.booking.btn')} <ArrowRight size={20} />
                </a>
              </div>
            </motion.div>

            {/* Standard Message Form */}
            <div className="bg-white dark:bg-[#111623] rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-black mb-8 text-slate-900 dark:text-white flex items-center gap-3">
                <MessageSquare className="text-indigo-600" /> {t('contact.formTitle')}
              </h2>
              
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 dark:text-white">{t('contact.successTitle')}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{t('contact.successDesc')}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t('contact.fields.name')}</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t('contact.fields.namePlaceholder')}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t('contact.fields.email')}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@example.com"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t('contact.fields.phone')}</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="09xx xxx xxx"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t('contact.fields.topic')}</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                          required
                          name="topic"
                          value={formData.topic}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all dark:text-white appearance-none"
                        >
                          <option value="">-- {t('contact.fields.topicPlaceholder')} --</option>
                          <option value="AI Consultant">{t('contact.topics.consultant')}</option>
                          <option value="Coaching 1:1">{t('contact.topics.coaching')}</option>
                          <option value="B2B Solutions">{t('contact.topics.b2b')}</option>
                          <option value="Bug Report">{t('contact.topics.bug')}</option>
                          <option value="Other">{t('contact.topics.other')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t('contact.fields.message')}</label>
                    <textarea
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder={t('contact.fields.messagePlaceholder')}
                      className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all dark:text-white resize-none"
                    />
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Zap className="animate-pulse" /> {t('contact.fields.submitting')}
                      </span>
                    ) : (
                      <>
                        {t('contact.fields.submit')} <Send size={20} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-20 bg-white dark:bg-[#0B0E17] border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="pt-8 flex justify-between items-center gap-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 text-sm font-medium">{t('common.footerCopyright', { appName: appName })}</p>
            <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
              <Link to="/"><Zap className="text-indigo-600 inline" size={18} /> {t('contact.backHome')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
