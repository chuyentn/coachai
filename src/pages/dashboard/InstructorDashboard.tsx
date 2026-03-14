import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
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
  MoreVertical,
  Star,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    if (profile) fetchInstructorData();
  }, [profile]);

  const fetchInstructorData = async () => {
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', profile?.id);

    if (coursesData) {
      setCourses(coursesData);
      const totalStudents = coursesData.reduce((acc, curr) => acc + (curr.total_students || 0), 0);
      const totalRevenue = coursesData.reduce((acc, curr) => acc + ((curr.total_students || 0) * (curr.price_vnd || 0)), 0);
      const avgRating = coursesData.reduce((acc, curr) => acc + (curr.avg_rating || 0), 0) / (coursesData.length || 1);
      
      setStats({
        totalStudents,
        totalRevenue,
        avgRating,
        activeCourses: coursesData.length
      });
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Bảng điều khiển Giảng viên</h1>
            <p className="text-gray-500 mt-2">Chào mừng trở lại, {profile?.full_name}. Hãy quản lý các khóa học của bạn.</p>
          </div>
          <button className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
            <PlusCircle size={20} />
            Tạo khóa học mới
          </button>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Tổng học viên', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Doanh thu (VND)', value: stats.totalRevenue.toLocaleString(), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Đánh giá trung bình', value: stats.avgRating.toFixed(1), icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Khóa học đang hoạt động', value: stats.activeCourses, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all"
            >
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                <stat.icon size={24} />
              </div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-4">
                <TrendingUp size={14} />
                <span>+12% so với tháng trước</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Course Management Table */}
        <div className="bg-white rounded-3xl border border-black/5 shadow-xl shadow-black/5 overflow-hidden">
          <div className="p-8 border-b border-black/5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Danh sách khóa học</h2>
            <button className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-widest font-bold">
                  <th className="px-8 py-4">Khóa học</th>
                  <th className="px-8 py-4">Học viên</th>
                  <th className="px-8 py-4">Giá bán</th>
                  <th className="px-8 py-4">Trạng thái</th>
                  <th className="px-8 py-4">Đánh giá</th>
                  <th className="px-8 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/100/100`} 
                          className="w-16 h-10 rounded-lg object-cover border border-black/5"
                          alt=""
                        />
                        <div>
                          <p className="font-bold text-gray-900">{course.title}</p>
                          <p className="text-xs text-gray-500 mt-1">Cập nhật: 2 ngày trước</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-medium text-gray-600">{course.total_students}</td>
                    <td className="px-8 py-6 font-bold text-gray-900">{course.price_vnd.toLocaleString()} ₫</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">Đang bán</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={14} fill="currentColor" />
                        <span>{course.avg_rating}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors" title="Xem chi tiết">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 hover:bg-amber-50 text-amber-600 rounded-xl transition-colors" title="Chỉnh sửa">
                          <Edit3 size={18} />
                        </button>
                        <button className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
