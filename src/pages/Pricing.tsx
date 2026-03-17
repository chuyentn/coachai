import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Facebook, 
  Youtube, 
  Video, 
  MessageCircle,
  Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

export const Pricing = () => {
  const { t } = useTranslation();
  const { profile, loading: authLoading } = useAuth();
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0B0E17] font-sans relative overflow-hidden pt-10 transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="pt-28 pb-8 text-center relative z-20">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3 tracking-tight">
          {t('pricing.title')}
          <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/30">{t('pricing.badgeNew')}</span>
        </h1>
        <p className="text-slate-400 dark:text-slate-500 font-medium text-lg">{t('pricing.subtitle')}</p>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mb-16 relative z-20">
        <div className="p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 inline-flex flex-col sm:flex-row shadow-sm">
          <button 
            onClick={() => setIsYearly(false)}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${!isYearly ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 scale-95'}`}
          >
            {t('pricing.monthlyToggle')}
          </button>
          <button 
            onClick={() => setIsYearly(true)}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${isYearly ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 transform scale-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 scale-95'}`}
          >
            {t('pricing.yearlyToggle')}
            <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg uppercase tracking-wider ${isYearly ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}`}>
              -50%
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <section className="pb-24 px-4 relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Free Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('pricing.freePlan')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">{t('pricing.freeDesc')}</p>
            
            <div className="h-[72px] mb-8">
              <div className="text-[2.5rem] leading-none font-bold text-slate-900 dark:text-white tracking-tight">{t('pricing.freePrice')}</div>
            </div>
            
            <Link 
              to={profile ? "/dashboard" : "/auth/signup"} 
              className="w-full py-4 px-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-all mb-10 text-sm bg-transparent"
            >
              {profile ? t('common.dashboard') : t('pricing.btnLearnMore')}
            </Link>
            
            <ul className="space-y-5 text-sm font-medium text-slate-600 dark:text-slate-400 flex-1">
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('pricing.freeFeature1')}
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('pricing.freeFeature2')}
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('pricing.freeFeature3')}
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('pricing.freeFeature4')}
              </li>
            </ul>
          </div>

          {/* VIP Plan */}
          <div className="p-1 rounded-[2.2rem] bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-600 w-full transform md:-translate-y-4 shadow-2xl shadow-indigo-500/20 relative group">
            <div className="absolute -top-4 inset-x-0 flex justify-center z-20">
              <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase shadow-lg shadow-indigo-500/30 flex items-center gap-1">
                <Zap size={14} className="fill-white" /> {t('home.pricingVipBadge')}
              </div>
            </div>
            <div className="bg-white dark:bg-[#111623] rounded-[2rem] p-8 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 dark:group-hover:bg-indigo-500/10 transition-colors duration-500" />
              
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-2 relative z-10">{t('pricing.vipPlan')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 relative z-10">{t('pricing.vipDesc')}</p>
              
              <div className="h-[72px] mb-8 relative z-10">
                {isYearly ? (
                  <div>
                    <div className="text-slate-400 dark:text-slate-500 font-bold line-through text-sm mb-1">{t('pricing.vipOldPriceYear')}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[2.5rem] leading-none font-bold text-slate-900 dark:text-white tracking-tight">{t('pricing.vipPriceYear')}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">{t('pricing.vipPriceYearly')}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-slate-400 dark:text-slate-500 font-bold line-through text-sm mb-1">{t('pricing.vipOldPriceMonth')}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[2.5rem] leading-none font-bold text-slate-900 dark:text-white tracking-tight">{t('pricing.vipPriceMonth')}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">{t('pricing.vipPriceMonthly')}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {(!profile || profile?.role === 'student' || profile?.role === 'vip') ? (
                <Link 
                  to={authLoading ? "#" : (profile ? `/payment?plan=vip&amount=${isYearly ? 1500000 : 199000}` : "/auth/signup?plan=vip")} 
                  className="w-full py-4 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center transition-all mb-10 text-sm shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 relative z-10 transform hover:-translate-y-0.5"
                >
                  {t('pricing.btnBuyNow')}
                </Link>
              ) : (
                <Link 
                  to={profile.role === 'admin' ? "/admin" : "/teacher"}
                  className="w-full py-4 px-4 rounded-xl bg-slate-800 text-white font-bold text-center transition-all mb-10 text-sm relative z-10"
                >
                  {t('common.dashboard')}
                </Link>
              )}
              
              <ul className="space-y-5 text-sm font-medium text-slate-600 dark:text-slate-300 flex-1 relative z-10">
                <li className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" /> 
                  <span>{t('pricing.vipFeature1')} <span className="ml-2 px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black tracking-wider rounded-md">+100%</span></span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('pricing.vipFeature2')}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" /> {t('pricing.vipFeature3')}
                </li>
                <li className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" /> 
                  <span>{t('pricing.vipFeature4')} <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black tracking-wider rounded-md">NEW</span></span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" /> {t('pricing.vipFeature5')}
                </li>
              </ul>
            </div>
          </div>

          {/* Coaching Plan */}
          <div className="bg-white dark:bg-[#111623] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800/60 flex flex-col h-full hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('pricing.coachPlan')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">{t('pricing.coachDesc')}</p>
            
            <div className="h-[72px] mb-8">
              <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-1 uppercase tracking-widest hidden md:block opacity-0">{t('pricing.coachLabel')}</div>
              <div className="text-[2.5rem] leading-none font-bold text-slate-900 dark:text-white tracking-tight mt-6">{t('pricing.coachPrice')}</div>
            </div>
                        {(!profile || profile?.role === 'student' || profile?.role === 'vip') ? (
                <Link 
                  to={authLoading ? "#" : (profile ? "/contact" : "/auth/signup?plan=coaching")} 
                  className="w-full py-4 px-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-all mb-10 text-sm bg-transparent"
                >
                  {t('pricing.btnContact')}
                </Link>
              ) : (
                <Link 
                  to="/contact"
                  className="w-full py-4 px-4 rounded-xl border-2 border-slate-100 text-slate-500 font-bold text-center transition-all mb-10 text-sm"
                >
                  Hỗ trợ chuyên gia
                </Link>
              )}
            
            <ul className="space-y-5 text-sm font-medium text-slate-600 dark:text-slate-300 flex-1">
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('pricing.coachFeature1')}
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('pricing.coachFeature2')}
              </li>
              <li className="flex items-center gap-3 text-slate-900 dark:text-white">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> 
                <span>{t('pricing.coachFeature3')} <span className="ml-2 px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black tracking-wider rounded-md">HOT</span></span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('pricing.coachFeature4')}
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Footer - Standardized with common.footer keys */}
      <footer className="py-20 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#0B0E17] relative z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20 text-left">
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
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">{t('common.footerProgram')}</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                <li><Link to="/affiliate" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest text-[10px] font-black">{t('common.affiliate')}</Link></li>
                <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors uppercase tracking-widest text-[10px] font-black">{t('home.affiliateVip')}</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors uppercase tracking-widest text-[10px] font-black">{t('common.coaching')}</Link></li>
                <li><Link to="/referral" className="hover:text-indigo-400 transition-colors uppercase tracking-widest text-[10px] font-black">{t('common.referFriend')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">{t('common.footerSupport')}</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                <li><Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('common.footerHelp')}</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">{t('common.footerTerms')}</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">{t('common.footerPrivacy')}</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">{t('common.footerContact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">{t('common.footerConnect')}</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/groups/vibecodecoaching" target="_blank" rel="noreferrer" title="Group Facebook" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm">
                  <Facebook size={18} />
                </a>
                <a href="https://zalo.me/g/tdhmtu261" target="_blank" rel="noreferrer" title="Zalo Support Group" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-[#0068FF] hover:text-white transition-all shadow-sm">
                  <MessageCircle size={18} />
                </a>
                <a href="https://t.me/vibecodocoaching" target="_blank" rel="noreferrer" title="Telegram Support Group" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                  <Send size={18} />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">{t('common.footerCopyright')}</p>
            <div className="flex items-center gap-6 text-slate-500 text-sm font-medium">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} /> {t('common.footerSSL')}</span>
              <span className="flex items-center gap-1.5"><Globe size={16} /> {t('common.footerLang')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
