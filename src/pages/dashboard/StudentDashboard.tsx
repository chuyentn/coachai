import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Enrollment, Course } from '../../types';
import { googleSheetsService } from '../../services/googleSheetsService';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  Clock, 
  Award, 
  ChevronRight, 
  Loader2,
  LayoutDashboard,
  Settings,
  Star,
  Search,
  Bell,
  MessageSquare,
  TrendingUp,
  PlayCircle,
  Calendar,
  ExternalLink,
  Zap,
  UserPlus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export const StudentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<(Enrollment & { course?: Course })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [certificateCount, setCertificateCount] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    if (profile) {
      fetchEnrollments();
    }
  }, [profile]);

  const fetchEnrollments = async () => {
    try {
      const q = query(collection(db, 'enrollments'), where('user_id', '==', profile?.id));
      const querySnapshot = await getDocs(q);
      const enrolls = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));

      const allCourses = await googleSheetsService.fetchCourses();
      
      const enrollmentsData = enrolls.map(enroll => ({
        ...enroll,
        course: allCourses.find(c => c.id === enroll.course_id)
      }));

      setEnrollments(enrollmentsData);

      // Compute total learning hours from completion_percentage * estimated course duration
      const hrs = enrollmentsData.reduce((sum, e) => {
        const pct = (e.completion_percentage || 0) / 100;
        const courseDurationHours = (e.course as any)?.duration_hours || 2; // default 2h
        return sum + pct * courseDurationHours;
      }, 0);
      setTotalHours(Math.round(hrs * 10) / 10);

      // Fetch real certificate count from Firestore
      const certSnap = await getDocs(
        query(collection(db, 'certificates'), where('user_id', '==', profile?.id))
      );
      setCertificateCount(certSnap.size);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enroll => {
    if (filter === 'in_progress') return enroll.completion_percentage > 0 && enroll.completion_percentage < 100;
    if (filter === 'completed') return enroll.completion_percentage === 100;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
        <p className="text-gray-500 font-medium animate-pulse">{t('studentDashboard.loading')}</p>
      </div>
    </div>
  );

  const sidebarItems = [
    { id: 'overview', label: t('studentDashboard.overview'), icon: LayoutDashboard },
    { id: 'my-courses', label: t('studentDashboard.myCourses'), icon: BookOpen },
    { id: 'certificates', label: t('studentDashboard.certificates'), icon: Award },
    { id: 'ai-coach', label: t('studentDashboard.aiCoach'), icon: Zap, comingSoon: true },
    { id: 'messages', label: t('studentDashboard.discussions'), icon: MessageSquare, comingSoon: true },
    { id: 'settings', label: t('studentDashboard.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Zap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CoachAI</span>
          </div>

          <nav className="inline-flex p-1.5 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl gap-1 flex-col w-full">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.comingSoon && setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 transform scale-100' 
                    : item.comingSoon
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 scale-95'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  {item.label}
                </div>
                {item.comingSoon && (
                  <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
                    Sắp có
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Award size={64} fill="white" />
            </div>
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">{t('studentDashboard.proStudentBadge')}</p>
            <p className="text-sm font-medium text-slate-300 mb-4">{t('studentDashboard.proStudentDesc')}</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
              <div className="w-[85%] h-full bg-indigo-400"></div>
            </div>
            <button className="w-full py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
              {t('studentDashboard.viewDetailsBtn')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t('studentDashboard.searchPlaceholder')} 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.full_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('studentDashboard.activeStudent')}</p>
              </div>
              <img 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} 
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                alt="Avatar"
              />
            </div>
          </div>
        </header>

        <div className="p-8 md:p-10 space-y-10">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('studentDashboard.welcomeTitle', { name: profile?.full_name?.split(' ')[0] || '' })}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t('studentDashboard.welcomeSub')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                <Search size={20} />
                {t('studentDashboard.exploreCoursesBtn')}
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: t('studentDashboard.statCourses'), value: enrollments.length, icon: BookOpen, color: 'indigo', sub: t('studentDashboard.statCoursesSub') },
              { label: t('studentDashboard.statHours'), value: `${totalHours}h`, icon: Clock, color: 'emerald', sub: t('studentDashboard.statHoursSub') },
              { label: t('studentDashboard.statCerts'), value: String(certificateCount).padStart(2, '0'), icon: Award, color: 'violet', sub: t('studentDashboard.statCertsSub') },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'indigo' ? 'indigo' : stat.color === 'emerald' ? 'emerald' : 'violet'}-50 flex items-center justify-center text-${stat.color === 'indigo' ? 'indigo' : stat.color === 'emerald' ? 'emerald' : 'violet'}-600 mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-2">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
          {/* VIP Upgrade Banner */}
          {profile?.role !== 'vip' && (
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-transparent opacity-5" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}} />
               <div className="relative z-10 max-w-xl">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-rose-500/30">
                   <Zap size={12} fill="currentColor" /> Quyền Lợi Đặc Quyền
                 </div>
                 <h2 className="text-2xl md:text-3xl font-black mb-3 text-white">Trở thành VIP Member</h2>
                 <p className="text-indigo-200 text-sm font-medium leading-relaxed">Mở khóa toàn bộ kho source code, thư viện dự án độc quyền và ưu tiên Coaching 1:1 trực tiếp cùng tôi. Nâng cấp ngay hôm nay!</p>
               </div>
               <Link to="/auth/signup?plan=vip" className="relative z-10 shrink-0 px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl shadow-rose-500/20 flex items-center gap-2">
                 Nâng Cấp VIP <ChevronRight size={18} />
               </Link>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Learning Path - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PlayCircle className="text-indigo-600" size={24} />
                  {t('studentDashboard.learningPath')}
                </h2>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {(['all', 'in_progress', 'completed'] as const).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filter === filterType ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {filterType === 'all' ? t('studentDashboard.filterAll') : filterType === 'in_progress' ? t('studentDashboard.filterInProgress') : t('studentDashboard.filterCompleted')}
                    </button>
                  ))}
                </div>
              </div>

              {filteredEnrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEnrollments.map((enroll) => {
                    const progress = enroll.completion_percentage || 0;
                    return (
                      <motion.div
                        key={enroll.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col group"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={enroll.course?.thumbnail_url || `https://picsum.photos/seed/${enroll.course_id}/800/450`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {progress === 100 && (
                            <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg">
                              <Award size={12} />
                              {t('studentDashboard.statusCompleted')}
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight mb-4">
                            {enroll.course?.title}
                          </h3>
                          <div className="mt-auto space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                <span>{t('studentDashboard.progressLabel')}</span>
                                <span className="text-slate-900 dark:text-white">{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                />
                              </div>
                            </div>
                            <Link 
                              to={`/learn/${enroll.course_id}`}
                              className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                                progress === 100 
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                              }`}
                            >
                              {progress === 100 ? t('studentDashboard.btnReviewCourse') : t('studentDashboard.btnContinueLesson')}
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={28} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('studentDashboard.noCoursesTitle')}</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                    {t('studentDashboard.noCoursesSub')}
                  </p>
                  <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                    {t('studentDashboard.exploreNowBtn')}
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-8">
              {/* AI Coach Assistant */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                      <Zap size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{t('studentDashboard.aiCoachTitle')}</h3>
                      <p className="text-[10px] text-indigo-200 font-medium">{t('studentDashboard.aiCoachSub')}</p>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-100 mb-6 leading-relaxed">
                    {t('studentDashboard.aiCoachMsg', { name: profile?.full_name?.split(' ')[0] || '' })}
                  </p>
                  <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-all shadow-lg">
                    {t('studentDashboard.startChatBtn')}
                  </button>
                </div>
              </div>

              {/* Next Session */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('studentDashboard.coachingSchedule')}</h3>
                  <Calendar size={16} className="text-slate-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Th3</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">18</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">Xây dựng hệ thống AI</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">20:00 - 21:30</p>
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <ExternalLink size={12} />
                    {t('studentDashboard.joinZoomBtn')}
                  </button>
                </div>
              </div>
              {/* Affiliate Simple */}
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="font-bold text-sm flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-emerald-400" /> Kiếm Tiền Cùng CoachAI</h3>
                  <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">Chia sẻ tài nguyên cho bạn bè, nhận hoa hồng lên đến 50% khi có người đăng ký từ link của bạn.</p>
                  <div className="bg-black/50 border border-white/10 p-3 rounded-xl flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-emerald-400 truncate opacity-90 select-all">https://edu.victorchuyen.net/?ref={profile?.id?.substring(0,8)}</span>
                  </div>
                  <button onClick={() => alert('Đã sao chép link!')} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs transition-colors border border-white/10 flex items-center justify-center gap-2">
                    <UserPlus size={14} /> Copy Link Giới Thiệu
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">{t('studentDashboard.resources')}</h3>
                <div className="space-y-2">
                  {[t('studentDashboard.promptLib'), t('studentDashboard.discordComm'), t('studentDashboard.pdfDocs')].map((item, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl transition-all group border border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600">{item}</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
