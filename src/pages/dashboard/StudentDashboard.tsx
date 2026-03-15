import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Enrollment, Course } from '../../types';
import { googleSheetsService } from '../../services/googleSheetsService';
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
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<(Enrollment & { course?: Course })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState('overview');

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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
        <p className="text-gray-500 font-medium animate-pulse">Đang tải dữ liệu học tập...</p>
      </div>
    </div>
  );

  const sidebarItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'my-courses', label: 'Khóa học của tôi', icon: BookOpen },
    { id: 'certificates', label: 'Chứng chỉ', icon: Award },
    { id: 'ai-coach', label: 'AI Coach', icon: Zap },
    { id: 'messages', label: 'Thảo luận', icon: MessageSquare },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Zap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CoachAI</span>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Award size={64} fill="white" />
            </div>
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Học viên Pro</p>
            <p className="text-sm font-medium text-slate-300 mb-4">Bạn đã hoàn thành 85% lộ trình tháng này.</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
              <div className="w-[85%] h-full bg-indigo-400"></div>
            </div>
            <button className="w-full py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
              Xem chi tiết
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm bài học, tài liệu..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{profile?.full_name}</p>
                <p className="text-xs text-slate-500">Học viên tích cực</p>
              </div>
              <img 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} 
                className="w-10 h-10 rounded-xl border border-slate-200 shadow-sm"
                alt="Avatar"
              />
            </div>
          </div>
        </header>

        <div className="p-8 md:p-10 space-y-10">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Chào mừng trở lại, {profile?.full_name?.split(' ')[0] || 'bạn'}! 👋</h1>
              <p className="text-slate-500 mt-1">Hôm nay là một ngày tuyệt vời để học thêm điều mới.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                <Search size={20} />
                Khám phá khóa học
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Khóa học', value: enrollments.length, icon: BookOpen, color: 'indigo', sub: 'Đang tham gia' },
              { label: 'Giờ học', value: '12.5h', icon: Clock, color: 'emerald', sub: 'Trong tháng này' },
              { label: 'Chứng chỉ', value: '02', icon: Award, color: 'violet', sub: 'Đã đạt được' },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'indigo' ? 'indigo' : stat.color === 'emerald' ? 'emerald' : 'violet'}-50 flex items-center justify-center text-${stat.color === 'indigo' ? 'indigo' : stat.color === 'emerald' ? 'emerald' : 'violet'}-600 mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-2">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Learning Path - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <PlayCircle className="text-indigo-600" size={24} />
                  Lộ trình học tập
                </h2>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(['all', 'in_progress', 'completed'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filter === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {t === 'all' ? 'Tất cả' : t === 'in_progress' ? 'Đang học' : 'Hoàn thành'}
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
                        className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col group"
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
                              Hoàn thành
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight mb-4">
                            {enroll.course?.title}
                          </h3>
                          <div className="mt-auto space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                <span>Tiến độ</span>
                                <span className="text-slate-900">{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
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
                              {progress === 100 ? 'Xem lại khóa học' : 'Tiếp tục bài học'}
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={28} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Chưa có khóa học nào</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                    Bắt đầu hành trình chinh phục kiến thức mới ngay hôm nay.
                  </p>
                  <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                    Khám phá ngay
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
                      <h3 className="font-bold text-sm">AI Coach</h3>
                      <p className="text-[10px] text-indigo-200 font-medium">Sẵn sàng hỗ trợ 24/7</p>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-100 mb-6 leading-relaxed">
                    "Chào {profile?.full_name?.split(' ')[0] || 'bạn'}, tôi đã chuẩn bị sẵn các bài tập thực hành cho bài học hôm nay của bạn!"
                  </p>
                  <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-all shadow-lg">
                    Bắt đầu trò chuyện
                  </button>
                </div>
              </div>

              {/* Next Session */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 text-sm">Lịch Coaching</h3>
                  <Calendar size={16} className="text-slate-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Th3</span>
                      <span className="text-lg font-bold text-slate-900 leading-none">18</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">Xây dựng hệ thống AI</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">20:00 - 21:30</p>
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <ExternalLink size={12} />
                    Tham gia Zoom
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Tài nguyên</h3>
                <div className="space-y-2">
                  {['Thư viện Prompt', 'Cộng đồng Discord', 'Tài liệu PDF'].map((item, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-3 bg-white hover:bg-indigo-50 rounded-xl transition-all group border border-slate-100">
                      <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">{item}</span>
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
