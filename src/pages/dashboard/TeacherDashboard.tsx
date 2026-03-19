import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { googleSheetsService } from '../../services/googleSheetsService';
import { 
  LayoutDashboard, 
  BookOpen, 
  DollarSign, 
  Settings, 
  Users, 
  TrendingUp,
  Plus,
  PlayCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CourseBuilder } from '../../components/dashboard/CourseBuilder';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export const TeacherDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'payouts' | 'settings'>('overview');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  // ── Real Firestore State ─────────────────────────────────────────────────────
  const [loadingStats, setLoadingStats] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [publishedCourses, setPublishedCourses] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [payoutBalance, setPayoutBalance] = useState(0);
  const [myCourses, setMyCourses] = useState<any[]>([]);

  const [instructorStats, setInstructorStats] = useState<any>(null);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchTeacherData = async () => {
      setLoadingStats(true);
      try {
        // 1. Fetch teacher stats from V7 Backend (Apps Script)
        const stats = await googleSheetsService.fetchInstructorStats(profile.id);
        if (stats) {
          setInstructorStats(stats);
          setTotalStudents(stats.total_students || 0);
          setPublishedCourses(stats.course_count || 0);
          setPayoutBalance(stats.total_revenue_vnd || 0);
        }

        // 2. Fetch courses from Firestore for Builder
        const coursesSnap = await getDocs(
          query(collection(db, 'courses'), where('teacherId', '==', profile.id))
        );
        setMyCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.warn('TeacherDashboard: Fetch error', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchTeacherData();
  }, [profile?.id]);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const stats = [
    { label: 'Tổng Học Viên', value: loadingStats ? '…' : String(totalStudents), icon: Users, color: 'indigo', change: '' },
    { label: 'Khóa học đã đăng', value: loadingStats ? '…' : String(publishedCourses), icon: BookOpen, color: 'emerald', change: '' },
    { label: 'Doanh thu tháng này', value: loadingStats ? '…' : formatVND(monthlyRevenue), icon: TrendingUp, color: 'violet', change: '' },
    { label: 'Số dư Payout', value: loadingStats ? '…' : formatVND(payoutBalance), icon: DollarSign, color: 'amber', change: 'Sẵn sàng' },
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'courses', label: 'Khóa học của tôi', icon: BookOpen },
    { id: 'payouts', label: 'Rút tiền (Payout)', icon: DollarSign },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ] as const;

  const handleRequestPayout = async () => {
    if (payoutBalance < 1000000) {
      alert('Số dư tối thiểu để rút là 1.000.000₫');
      return;
    }
    const paymentInfo = prompt('Nhập thông tin nhận tiền (STK, Ngân hàng, Chủ TK):');
    if (!paymentInfo) return;

    const success = await googleSheetsService.submitWithdrawal(profile?.id || '', payoutBalance, paymentInfo);
    if (success) {
      alert('Yêu cầu rút tiền thành công! Admin sẽ xử lý trong 24h.');
    } else {
      alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0E17] flex">
      {/* Sidebar - Similar to Admin */}
      <aside className="w-72 bg-white dark:bg-[#111623] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <BookOpen size={24} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white block">Teacher Portal</span>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{import.meta.env.VITE_APP_NAME || 'CoachAI'} Creator</span>
            </div>
          </div>

          <nav className="inline-flex p-1.5 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl gap-1 flex-col w-full">
            {[
              { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
              { id: 'courses', label: 'Khóa học của tôi', icon: BookOpen },
              { id: 'payouts', label: 'Rút tiền (Payout)', icon: DollarSign },
              { id: 'settings', label: 'Cài đặt', icon: Settings }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsCreatingCourse(false);
                }}
                className={`w-full flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === item.id && !isCreatingCourse
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 transform scale-100'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 scale-95'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Header (Simplified) */}
        <header className="h-20 bg-white/80 dark:bg-[#111623]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isCreatingCourse ? 'Tạo Khóa Học Mới' : sidebarItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.full_name}</p>
              <p className="text-xs text-amber-500 font-bold">Giảng viên / Chuyên gia</p>
            </div>
            <img
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`}
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
              alt="Avatar"
            />
          </div>
        </header>

        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">
            {!isCreatingCourse && activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white dark:bg-[#111623] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/30 flex items-center justify-center text-${stat.color}-600`}>
                          <stat.icon size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">{stat.change}</span>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/10">
                    <div className="absolute inset-0 bg-transparent opacity-5" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}} />
                    <div className="relative z-10">
                      <h3 className="font-bold text-xl mb-2">Đóng góp chất xám của bạn!</h3>
                      <p className="text-indigo-200 text-sm mb-6">Tạo khóa học mới, chia sẻ kiến thức với hàng ngàn học viên và bắt đầu kiếm tiền ngay hôm nay.</p>
                      <button 
                        onClick={() => setIsCreatingCourse(true)}
                        className="px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                      >
                        <Plus size={18} /> Tạo Khóa Học Mới
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#111623] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Số dư chia sẻ doanh thu</p>
                      <h2 className="text-4xl font-black text-amber-500 tracking-tight">
                        {loadingStats ? '…' : formatVND(payoutBalance)}
                      </h2>
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> Tối thiểu rút: 1.000.000₫
                      </p>
                    </div>
                    <button 
                      onClick={handleRequestPayout}
                      className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold text-sm transition-all"
                    >
                      Rút tiền về Bank
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {!isCreatingCourse && activeTab === 'courses' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-end">
                  <button 
                    onClick={() => setIsCreatingCourse(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    <Plus size={18} /> Khóa học Mới
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCourses.length === 0 ? (
                    <div className="col-span-3 text-center py-20 text-slate-400">
                      <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="font-bold">Chưa có khóa học nào.</p>
                      <p className="text-sm mt-1">Nhấn "Khóa học Mới" để bắt đầu.</p>
                    </div>
                  ) : myCourses.map((course: any, idx) => (
                    <div key={course.id || idx} className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col group hover:shadow-lg transition-all hover:border-indigo-500/30">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                          <PlayCircle size={24} />
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                          course.status === 'published'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">{course.title || 'Khóa học chưa đặt tên'}</h3>
                      <div className="flex items-center gap-4 mt-auto pt-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1"><Users size={14} /> {course.enrollmentCount ?? 0} học viên</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><TrendingUp size={14} /> {course.price ? formatVND(course.price) : 'Miễn phí'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {isCreatingCourse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <button 
                    onClick={() => setIsCreatingCourse(false)}
                    className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                  >
                    ← Quay lại Dashboard
                  </button>
                </div>
                <CourseBuilder />
              </motion.div>
            )}

            {/* Payouts Tab / Settings Tab (Placeholders for MVP Phase 2) */}
            {!isCreatingCourse && (activeTab === 'payouts' || activeTab === 'settings') && (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500">
                Hiển thị tab {activeTab}. Tính năng đang phát triển...
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
