import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { CourseCard } from '../components/CourseCard';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Mail, 
  Send, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Users, 
  Award,
  ArrowRight,
  Play,
  Globe,
  Cpu,
  BookOpen,
  FolderCode,
  Map,
  HeartHandshake,
  Gift,
  Star,
  BarChart3,
  CreditCard,
  Link2,
  Facebook,
  Youtube,
  MessageCircle,
  Video
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSearchParams, Link } from 'react-router-dom';
import { googleSheetsService } from '../services/googleSheetsService';
import { crmService } from '../services/crmService';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTranslation } from 'react-i18next';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filters = ['All', '🆓 Free', '🤖 AI Projects', '⚡ No-Code', '🏆 Bestseller'];
  // Lead state
  const [leadEmail, setLeadEmail] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  usePageTitle('Học AI & Coaching – Nền tảng hàng đầu Việt Nam');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value.trim() });
    } else {
      setSearchParams({});
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const coursesData = await googleSheetsService.fetchCourses();
      setCourses(coursesData.filter(c => c.published));
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('Không thể tải danh sách khóa học từ Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;

    setLeadLoading(true);
    try {
      await googleSheetsService.submitLead(leadEmail);
      await crmService.addContact(leadEmail);
      
      setLeadSuccess(true);
      setLeadEmail('');
      setTimeout(() => setLeadSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting lead:', err);
    } finally {
      setLeadLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTab = true;
    if (activeFilter === '🆓 Free') matchesTab = c.price_vnd === 0;
    if (activeFilter === '🏆 Bestseller') matchesTab = c.total_students > 50;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white dark:bg-[#0B0E17] border-b border-slate-100 dark:border-slate-800/60">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden xl:block hidden">
          <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full blur-[120px] mix-blend-multiply" />
          <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] bg-gradient-to-tl from-violet-100/50 to-fuchsia-100/50 rounded-full blur-[120px] mix-blend-multiply" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-black uppercase tracking-[0.15em] md:tracking-[0.2em] mb-6 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50">
                <Sparkles size={14} className="animate-pulse" />
                <span>🚀 Cộng Đồng Tự Học Vibe Code AI #1 Việt Nam</span>
              </div>
              
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-6 leading-[1.2] md:leading-[1.1]">
                <span className="text-slate-900 dark:text-white block mb-2">Tự Học AI Qua Dự Án Thật</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-400 block pb-2">
                  Dù Bạn Không Biết Code
                </span>
              </h1>
              
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed max-w-xl">
                Mỗi khóa học có mã nguồn đầy đủ + hướng dẫn từng bước. Tải về miễn phí, làm được ngay, kết quả thật sự trên chính máy của bạn.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <Link to="/auth/signup" className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center whitespace-nowrap">
                  🎁 Bắt đầu FREE ngay
                </Link>
                <Link to="/projects" className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-lg hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                   ▶ Xem dự án demo
                </Link>
              </div>

              {/* Trust text */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                 <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500"/> Miễn phí tài nguyên</span>
                 <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500"/> Mã nguồn thực tế</span>
                 <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500"/> Không cần thẻ TD</span>
              </div>
            </motion.div>

            {/* Right Column: Visualizer/Video */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative w-full aspect-video md:aspect-[4/3] lg:aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group cursor-pointer"
            >
              {/* Fallback pattern while video not present */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-5" />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/20" />
              
              {/* Mockup UI Window inside Video Container */}
              <div className="absolute top-4 left-4 right-4 bottom-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col border border-slate-100/50 dark:border-slate-700/50">
                <div className="h-8 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-700 flex items-center px-4 gap-2 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-6 relative">
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center group-hover:bg-slate-900/20 transition-all z-20">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Play fill="currentColor" size={32} className="ml-1" />
                    </div>
                  </div>
                  {/* Fake Code / Node visual */}
                  <div className="w-full max-w-sm flex items-center gap-4 opacity-50 blur-[1px]">
                    <div className="w-1/3 h-24 bg-white rounded-xl shadow-sm border border-slate-200"></div>
                    <div className="flex-1 h-2 bg-slate-300 rounded-full"></div>
                    <div className="w-1/2 h-32 bg-white rounded-xl shadow-sm border border-slate-200"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            
          </div>

          {/* Social Proof Stats Bottom */}
          <div className="mt-12 md:mt-20 pt-8 md:pt-12 border-t border-slate-100/50">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
              {[
                { label: 'Học viên tự học', value: '5.000+', icon: '🎓' },
                { label: 'Dự án có mã nguồn', value: '120+', icon: '📦' },
                { label: 'Đánh giá (TB)', value: '4.9/5', icon: '⭐' },
                { label: 'Tỉ lệ hoàn tiền', value: '0%', icon: '💰' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-slate-50/50 rounded-2xl p-4 md:p-6 border border-slate-100 flex flex-col items-center justify-center gap-2 hover:bg-white hover:shadow-xl hover:shadow-indigo-100 transition-all cursor-default"
                >
                  <span className="text-2xl md:text-3xl mb-1">{stat.icon}</span>
                  <span className="text-xl md:text-3xl font-black text-slate-900 dark:text-white">{stat.value}</span>
                  <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 text-center uppercase tracking-wide">{stat.label}</span>
                </motion.div>
              ))}
            </div>

            <p className="text-xs md:text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 text-center">Học viên đang làm việc tại:</p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 pb-8">
              {['VNG', 'Tiki', 'Shopee', 'Viettel', 'Mobifone', 'FPT', 'VNPT', 'Google', 'Meta'].map((brand) => (
                <span key={brand} className="text-lg md:text-2xl font-black tracking-tighter text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors duration-300 cursor-default">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-[#111623] border-b border-slate-100 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Tại Sao Chọn Chúng Tôi
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: 'Mã Nguồn Thực Tế', 
                desc: 'Mỗi khóa học kèm full source code dự án đang chạy thật. Clone về, edit tên bạn, deploy lên là xong.',
                icon: FolderCode,
                color: 'indigo'
              },
              { 
                title: 'Lộ Trình Từng Bước', 
                desc: 'Từ zero đến publish app AI. Hướng dẫn chi tiết cho người mới tuyệt đối, không bỏ sót bước nào.',
                icon: Map,
                color: 'violet'
              },
              { 
                title: 'Coaching 1:1 Thực Chiến', 
                desc: 'Đặt lịch gặp Coach, phân tích nhu cầu thật của bạn, xây dự án theo đúng mục tiêu cá nhân.',
                icon: HeartHandshake,
                color: 'emerald'
              },
              { 
                title: 'Miễn Phí Tải Về', 
                desc: 'Video nền tảng và tài nguyên 100% free. Trả phí chỉ khi bạn muốn vào cộng đồng VIP hoặc coaching.',
                icon: Gift,
                color: 'rose'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
              >
                <div className={`w-16 h-16 rounded-[1.5rem] bg-${feature.color}-50 flex items-center justify-center text-${feature.color}-600 mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed flex-grow">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course List */}
      <main id="courses" className="max-w-7xl mx-auto px-4 py-12 md:py-16 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
              <div className="w-8 h-[2px] bg-indigo-600"></div>
              {t('home.exploreKnowledge')}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('home.popularCourses')}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex px-4 pb-0 overflow-x-auto hide-scrollbar mb-12 justify-center">
          <div className="inline-flex p-1.5 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl gap-1">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  activeFilter === filter 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 transform scale-100' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 scale-95'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] bg-white rounded-[2.5rem] border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-rose-50 rounded-[3rem] border border-rose-100">
            <p className="text-rose-600 mb-6 font-bold">{error}</p>
            <button 
              onClick={fetchCourses}
              className="px-10 py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all font-black shadow-xl shadow-rose-200"
            >
              Thử lại ngay
            </button>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Search size={40} />
            </div>
            <p className="text-slate-900 font-bold text-xl">Không tìm thấy kết quả</p>
            <p className="text-slate-500 mt-2">Hãy thử tìm kiếm với từ khóa khác.</p>
          </div>
        )}
      </main>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#0B0E17] relative overflow-hidden border-t border-slate-100 dark:border-slate-800/60">
        <div className="absolute inset-0 pointer-events-none xl:block hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {t('home.pricingTitle')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
              {t('home.pricingSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all">
              <div className="inline-flex px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-slate-200">
                {t('home.pricingFreeBadge')}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('home.pricingFreePrefix')} FREE</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-slate-900 dark:text-white">0₫</span>
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">/ {t('home.freePriceText')}</span>
              </div>
              <ul className="space-y-4 mb-8 font-medium text-slate-600">
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('home.pricingFeature1')}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('home.pricingFeature2')}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('home.pricingFeature3')}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('home.pricingFeature4')}
                </li>
              </ul>
              <Link to="/auth/signup" className="block w-full text-center py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                {t('common.signUp')} Free
              </Link>
            </div>

            {/* VIP Plan */}
            <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative transform scale-100 md:scale-105 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/30 border border-rose-400">
                <Zap size={12} fill="currentColor" /> {t('home.pricingVipBadge')}
              </div>
              <h3 className="text-2xl font-black text-white mb-2 mt-2">{t('home.pricingVipPrefix')} VIP MEMBER</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-white">50$</span>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('pricing.vipPriceYearly')} (~1.200.000₫)</span>
              </div>
              <ul className="space-y-4 mb-8 font-medium text-slate-300">
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" /> <span className="font-bold">{t('home.pricingVipFeature1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" /> {t('home.pricingVipFeature2')}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" /> {t('home.pricingVipFeature3')}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" /> {t('home.pricingVipFeature4')}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" /> Cộng đồng VIP riêng
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 flex-shrink-0" /> {t('home.pricingVipFeature5')}
                </li>
              </ul>
              <Link to="/auth/signup?plan=vip" className="block w-full text-center py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-500 shadow-xl shadow-indigo-900/20 transition-all">
                {t('common.signUp')} VIP
              </Link>
            </div>

            {/* Coaching Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all">
              <div className="inline-flex px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 dark:border-indigo-800">
                {t('home.pricingCoachBadge')}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('home.pricingCoachPrefix')} COACHING 1:1</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{t('pricing.coachPrice')}</span>
              </div>
              <ul className="space-y-4 mb-8 font-medium text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> <span className="font-bold">{t('home.pricingCoachFeature1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('home.pricingCoachFeature2')}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('home.pricingCoachFeature3')}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('home.pricingCoachFeature4')}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {t('home.pricingCoachFeature5')}
                </li>
              </ul>
              <Link to="/contact" className="block w-full text-center py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-200 dark:shadow-none transition-all">
                {t('common.contact')} Coaching
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
              <CheckCircle2 size={16} /> {t('home.pricingRefund')}
            </span>
          </div>
        </div>
      </section>

      {/* Affiliate Section */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-[#111623] relative overflow-hidden border-t border-b border-slate-100 dark:border-slate-800/60">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-6 border border-emerald-200 dark:border-emerald-800">
                <TrendingUp size={16} /> {t('home.affiliateBadge')}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                {t('home.affiliateTitle')} <br /><span className="text-emerald-600 dark:text-emerald-500">{t('home.affiliateTitleHighlight')}</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
                {t('home.affiliateDesc')}
              </p>
              <Link to="/affiliate" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 text-lg group">
                {t('home.affiliateBtn')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Content - Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-slate-700 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">{t('home.affiliatePolicy')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100 uppercase text-[10px] tracking-widest text-slate-400 font-black">
                      <th className="pb-4 pt-2 px-4 whitespace-nowrap">{t('home.affiliatePlan')}</th>
                      <th className="pb-4 pt-2 px-4 text-center whitespace-nowrap">{t('home.affiliateCommission')}</th>
                      <th className="pb-4 pt-2 px-4 text-right whitespace-nowrap">{t('home.affiliateExample')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-5 px-4 whitespace-nowrap">{t('home.affiliateFreeUpgrade')}</td>
                      <td className="py-5 px-4 text-center text-emerald-600 text-lg font-black">20%</td>
                      <td className="py-5 px-4 text-right text-slate-500 whitespace-nowrap">~240.000₫</td>
                    </tr>
                    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors bg-emerald-50/30">
                      <td className="py-5 px-4 flex items-center gap-2 whitespace-nowrap"><Zap size={16} className="text-amber-500"/> {t('home.affiliateVip')}</td>
                      <td className="py-5 px-4 text-center text-emerald-600 text-lg font-black">40%</td>
                      <td className="py-5 px-4 text-right text-slate-500 whitespace-nowrap">~480.000₫</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-5 px-4 whitespace-nowrap">{t('home.affiliateCoach')}</td>
                      <td className="py-5 px-4 text-center text-emerald-600 text-lg font-black">50%</td>
                      <td className="py-5 px-4 text-right text-slate-500 whitespace-nowrap">Theo giá thực tế</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 py-4 px-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5"><BarChart3 size={14} className="text-indigo-500"/> {t('home.affiliateTracking')}</span>
                <span className="text-slate-300 hidden sm:block">•</span>
                <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-emerald-500"/> {t('home.affiliatePayout')}</span>
                <span className="text-slate-300 hidden md:block">•</span>
                <span className="flex items-center gap-1.5"><Link2 size={14} className="text-rose-500"/> {t('home.affiliateLink')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Học viên', value: '50,000+', icon: Users },
              { label: 'Khóa học', value: '1,200+', icon: BookOpen },
              { label: 'Giảng viên', value: '300+', icon: Star },
              { label: 'Quốc gia', value: '25+', icon: Globe },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-6xl font-black mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[3rem] md:rounded-[4rem] p-8 md:p-24 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
            
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl text-white mb-10 border border-white/30 shadow-xl">
                <Mail size={40} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">{t('home.newsletterTitle')}</h2>
              <p className="text-indigo-100 mb-12 text-xl font-medium leading-relaxed">
                {t('home.newsletterDesc')}
              </p>

              {leadSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/20 border border-emerald-500/50 rounded-[2rem] p-8 text-white flex items-center justify-center gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="text-xl font-bold">{t('home.newsletterSuccess')}</span>
                </motion.div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                  <input
                    type="email"
                    required
                    placeholder={t('home.newsletterPlaceholder')}
                    className="flex-1 px-8 py-5 rounded-[2rem] bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all text-lg font-medium"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={leadLoading}
                    className="px-8 py-5 bg-white text-indigo-600 rounded-[2rem] font-black text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-2xl shadow-indigo-900/20 whitespace-nowrap"
                  >
                    {leadLoading ? 'Đang gửi...' : t('home.newsletterBtn')}
                    <ArrowRight size={20} />
                  </button>
                </form>
              )}
              
              <p className="mt-8 text-indigo-200/60 text-xs font-bold uppercase tracking-widest">
                {t('home.newsletterSpam')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white dark:bg-[#0B0E17] border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
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
                {t('home.footerDesc')}
              </p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">{t('home.footerProgram')}</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
                <li><Link to="/affiliate" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('common.affiliate')}</Link></li>
                <li><Link to="/auth/signup?plan=vip" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('home.affiliateVip')}</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('common.coaching')}</Link></li>
                <li><Link to="/referral" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('affiliate.title')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">{t('home.footerSupport')}</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
                <li><Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('home.footerHelp')}</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('home.footerTerms')}</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('home.footerPrivacy')}</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('home.footerContact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">{t('home.footerConnect')}</h4>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                  <Facebook size={20} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  <Youtube size={20} />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-black hover:text-white transition-all shadow-sm">
                  <Video size={20} />
                </a>
                <a href="https://zalo.me/g/tdhmtu261" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-400 hover:text-white transition-all shadow-sm">
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-medium">{t('home.footerCopyright')}</p>
            <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
              <span className="flex items-center gap-1"><ShieldCheck size={14} /> {t('home.footerSSL')}</span>
              <span className="flex items-center gap-1"><Globe size={14} /> {t('home.footerLang')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
