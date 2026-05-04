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
import { collection, query, where, getDocs, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

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
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [bankInfo, setBankInfo] = useState({ bankName: '', accountName: '', accountNumber: '' });
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    const unsubPayouts = onSnapshot(
      query(collection(db, 'payouts'), where('teacher_id', '==', profile.id), orderBy('created_at', 'desc')),
      (snapshot) => {
        setPayoutsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error('Error fetching payouts', error)
    );
    return () => unsubPayouts();
  }, [profile?.id]);

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

  const handleRequestPayout = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (payoutBalance < 1000000) {
      alert('Số dư tối thiểu để rút là 1.000.000₫');
      return;
    }
    const finalBankName = bankInfo.bankName.trim();
    const finalAccountName = bankInfo.accountName.trim();
    const finalAccountNumber = bankInfo.accountNumber.trim();

    if (!finalBankName || !finalAccountName || !finalAccountNumber) {
       alert('Vui lòng nhập đầy đủ thông tin ngân hàng ở Tab Rút tiền');
       return;
    }

    setIsRequestingPayout(true);
    try {
      const paymentInfoStr = `${finalBankName} - ${finalAccountNumber} - ${finalAccountName}`;
      await googleSheetsService.submitWithdrawal(profile?.id || '', payoutBalance, paymentInfoStr);
      await addDoc(collection(db, 'payouts'), {
        teacher_id: profile?.id,
        teacher_name: profile?.full_name,
        teacher_email: profile?.email,
        amount: payoutBalance,
        bank_name: finalBankName,
        bank_account: `${finalAccountNumber} - ${finalAccountName}`,
        status: 'pending',
        created_at: serverTimestamp()
      });
      alert('Yêu cầu rút tiền thành công! Admin sẽ xử lý trong 24h.');
      setBankInfo({ bankName: '', accountName: '', accountNumber: '' });
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setIsRequestingPayout(false);
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
                      onClick={() => setActiveTab('payouts')}
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

            {!isCreatingCourse && activeTab === 'payouts' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Yêu cầu Rút Tiền */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white dark:bg-[#111623] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
                        <DollarSign size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yêu Cầu Rút Tiền</h2>
                    </div>
                    
                    <div className="mb-8">
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Số dư khả dụng</p>
                      <h3 className="text-4xl font-black text-amber-500 tracking-tight">{formatVND(payoutBalance)}</h3>
                    </div>

                    <form onSubmit={handleRequestPayout} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Tên Ngân Hàng</label>
                        <input required value={bankInfo.bankName} onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})} type="text" placeholder="VD: Vietcombank" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Số Tài Khoản</label>
                        <input required value={bankInfo.accountNumber} onChange={e => setBankInfo({...bankInfo, accountNumber: e.target.value})} type="text" placeholder="VD: 0123456789" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Chủ Tài Khoản</label>
                        <input required value={bankInfo.accountName} onChange={e => setBankInfo({...bankInfo, accountName: e.target.value})} type="text" placeholder="VD: NGUYEN VAN A" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm uppercase focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isRequestingPayout || payoutBalance < 1000000}
                        className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        {isRequestingPayout ? <Loader2 className="animate-spin" size={20} /> : <DollarSign size={20} />}
                        Gửi Yêu Cầu Rút Tiền
                      </button>
                      {payoutBalance < 1000000 && <p className="text-xs text-rose-500 text-center mt-3 font-bold flex items-center justify-center gap-1"><AlertCircle size={12}/> Tối thiểu 1.000.000₫</p>}
                    </form>
                  </div>
                </div>

                {/* Lịch Sử Rút Tiền */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-[#111623] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Lịch Sử Giao Dịch</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          <tr>
                            <th className="px-6 py-4 rounded-l-xl">Thời Gian</th>
                            <th className="px-6 py-4">Số Tiền</th>
                            <th className="px-6 py-4">Ngân Hàng</th>
                            <th className="px-6 py-4 rounded-r-xl">Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {payoutsList.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                {p.created_at?.toDate().toLocaleString('vi-VN')}
                              </td>
                              <td className="px-6 py-4 font-black text-amber-500">{formatVND(p.amount)}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                                {p.bank_name}<br/>
                                <span className="text-slate-400 font-normal">{p.bank_account}</span>
                              </td>
                              <td className="px-6 py-4">
                                {p.status === 'paid' ? (
                                  <span className="text-[10px] font-black px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 uppercase tracking-widest">Thành công</span>
                                ) : (
                                  <span className="text-[10px] font-black px-2.5 py-1 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/30 uppercase tracking-widest">Đang xử lý</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {payoutsList.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">Chưa có giao dịch rút tiền nào.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {!isCreatingCourse && activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-white dark:bg-[#111623] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                      <Settings size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cài Đặt Hồ Sơ Giảng Viên</h2>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); alert('Cập nhật thành công!'); }} className="space-y-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
                      <div>
                        <button type="button" className="px-5 py-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors">Tải ảnh mới</button>
                        <p className="text-xs text-slate-500 mt-2">Định dạng JPG, PNG. Tối đa 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Họ & Tên</label>
                        <input type="text" defaultValue={profile?.full_name} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                        <input type="email" defaultValue={profile?.email} disabled className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Chuyên Môn / Tiêu Đề</label>
                        <input type="text" placeholder="VD: Chuyên gia chuyển đổi số & AI" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Giới Thiệu Bản Thân</label>
                        <textarea rows={4} placeholder="Viết vài dòng giới thiệu về kinh nghiệm của bạn..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none"></textarea>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button type="submit" className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200">
                        Lưu Thay Đổi
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
