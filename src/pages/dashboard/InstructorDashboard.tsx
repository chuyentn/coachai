import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { googleSheetsService } from '../../services/googleSheetsService';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  TrendingUp, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  ChevronRight,
  Star,
  Loader2,
  LayoutDashboard,
  Settings,
  PieChart,
  MessageSquare,
  Search,
  Bell,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AddCourseModal } from '../../components/instructor/AddCourseModal';

export const InstructorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0,
    activeCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (profile) fetchInstructorData();
  }, [profile]);

  const fetchInstructorData = async () => {
    try {
      const allCourses = await googleSheetsService.fetchCourses();
      const instructorCourses = allCourses.filter(c => c.instructor_id === profile?.id);

      setCourses(instructorCourses);
      const totalStudents = instructorCourses.reduce((acc, curr) => acc + (curr.total_students || 0), 0);
      const totalRevenue = instructorCourses.reduce((acc, curr) => acc + ((curr.total_students || 0) * (curr.price_vnd || 0)), 0);
      const avgRating = instructorCourses.reduce((acc, curr) => acc + (curr.avg_rating || 0), 0) / (instructorCourses.length || 1);
      
      setStats({
        totalStudents,
        totalRevenue,
        avgRating,
        activeCourses: instructorCourses.length
      });
    } catch (error) {
      console.error('Error fetching instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
        <p className="text-gray-500 font-medium animate-pulse">Đang tải dữ liệu giảng viên...</p>
      </div>
    </div>
  );

  const sidebarItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'courses', label: 'Khóa học', icon: BookOpen },
    { id: 'students', label: 'Học viên', icon: Users },
    { id: 'earnings', label: 'Thu nhập', icon: DollarSign },
    { id: 'messages', label: 'Tin nhắn', icon: MessageSquare },
    { id: 'analytics', label: 'Phân tích', icon: PieChart },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <TrendingUp size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CoachAI Pro</span>
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
              <Star size={64} fill="white" />
            </div>
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Gói Premium</p>
            <p className="text-sm font-medium text-slate-300 mb-4">Mở khóa tất cả tính năng AI Coach nâng cao.</p>
            <button className="w-full py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
              Nâng cấp ngay
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
                placeholder="Tìm kiếm khóa học, học viên..." 
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
                <p className="text-xs text-slate-500">Giảng viên Expert</p>
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
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Chào buổi chiều, {profile?.full_name?.split(' ').pop() || 'bạn'}! 👋</h1>
              <p className="text-slate-500 mt-1">Đây là những gì đang diễn ra với các khóa học của bạn hôm nay.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <PlusCircle size={20} />
                Tạo khóa học mới
              </button>
              <a 
                href={import.meta.env.VITE_GOOGLE_SHEET_EDIT_URL || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                title="Quản lý trên Google Sheet"
              >
                <LayoutDashboard size={20} />
              </a>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Học viên', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'indigo', trend: '+12.5%', isUp: true },
              { label: 'Doanh thu', value: `${stats.totalRevenue.toLocaleString()} ₫`, icon: DollarSign, color: 'emerald', trend: '+8.2%', isUp: true },
              { label: 'Đánh giá', value: stats.avgRating.toFixed(1), icon: Star, color: 'amber', trend: '-2.1%', isUp: false },
              { label: 'Khóa học', value: stats.activeCourses, icon: BookOpen, color: 'violet', trend: '0%', isUp: true },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'indigo' ? 'indigo' : stat.color === 'emerald' ? 'emerald' : stat.color === 'amber' ? 'amber' : 'violet'}-50 flex items-center justify-center text-${stat.color === 'indigo' ? 'indigo' : stat.color === 'emerald' ? 'emerald' : stat.color === 'amber' ? 'amber' : 'violet'}-600 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course List - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Khóa học của bạn</h2>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                      <Search size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-slate-50">
                        <th className="px-6 py-4">Khóa học</th>
                        <th className="px-6 py-4">Học viên</th>
                        <th className="px-6 py-4">Doanh thu</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {courses.length > 0 ? courses.map((course) => (
                        <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-8 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                                <img 
                                  src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/100/100`} 
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate">{course.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex items-center gap-0.5 text-amber-500">
                                    <Star size={10} fill="currentColor" />
                                    <span className="text-[10px] font-bold">{course.avg_rating || 0}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">•</span>
                                  <span className="text-[10px] text-slate-400 font-medium">12 bài học</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex -space-x-2 overflow-hidden">
                              {[1, 2, 3].map((i) => (
                                <img
                                  key={i}
                                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.id + i}`}
                                  alt=""
                                />
                              ))}
                              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-bold text-slate-500">
                                +{course.total_students > 3 ? course.total_students - 3 : 0}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-slate-900">{(course.price_vnd * (course.total_students || 0)).toLocaleString()} ₫</p>
                            <p className="text-[10px] text-slate-400 font-medium">{course.price_vnd.toLocaleString()} ₫ / học viên</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                              <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse"></span>
                              Đang bán
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" title="Xem chi tiết">
                                <Eye size={16} />
                              </button>
                              <button className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors" title="Chỉnh sửa">
                                <Edit3 size={16} />
                              </button>
                              <button className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" title="Xóa">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                <BookOpen size={32} />
                              </div>
                              <div>
                                <p className="text-slate-900 font-bold">Chưa có khóa học nào</p>
                                <p className="text-slate-500 text-sm mt-1">Bắt đầu chia sẻ kiến thức của bạn ngay hôm nay.</p>
                              </div>
                              <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="mt-2 text-indigo-600 font-bold text-sm hover:underline"
                              >
                                Tạo khóa học đầu tiên
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
                  <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                    Xem tất cả khóa học <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Hoạt động mới nhất</h3>
                <div className="space-y-6">
                  {[
                    { user: 'Nguyễn Văn A', action: 'vừa đăng ký khóa học', target: 'Master AI Automation', time: '2 phút trước', icon: Users, color: 'indigo' },
                    { user: 'Trần Thị B', action: 'đã để lại đánh giá 5 sao', target: 'AI for Business', time: '1 giờ trước', icon: Star, color: 'amber' },
                    { user: 'Lê Văn C', action: 'đã hoàn thành bài học 4', target: 'Prompt Engineering', time: '3 giờ trước', icon: CheckCircle2, color: 'emerald' },
                  ].map((activity, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-${activity.color === 'indigo' ? 'indigo' : activity.color === 'amber' ? 'amber' : 'emerald'}-50 flex items-center justify-center text-${activity.color === 'indigo' ? 'indigo' : activity.color === 'amber' ? 'amber' : 'emerald'}-600 flex-shrink-0`}>
                        <activity.icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-600 leading-tight">
                          <span className="font-bold text-slate-900">{activity.user}</span> {activity.action} <span className="font-bold text-slate-900">{activity.target}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                  Xem tất cả hoạt động
                </button>
              </div>

              {/* Tips Card */}
              <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 opacity-10">
                  <TrendingUp size={120} />
                </div>
                <h3 className="text-lg font-bold mb-2">Mẹo tăng doanh thu 🚀</h3>
                <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
                  Sử dụng AI Coach để tạo các bài tập thực hành cá nhân hóa giúp học viên hoàn thành khóa học nhanh hơn 30%.
                </p>
                <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-bold transition-all">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {profile && (
        <AddCourseModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchInstructorData}
          instructorId={profile.id}
        />
      )}
    </div>
  );
};
