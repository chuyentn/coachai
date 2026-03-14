import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Enrollment } from '../../types';
import { BookOpen, Clock, Award, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    if (profile) {
      fetchEnrollments();
    }
  }, [profile]);

  const fetchEnrollments = async () => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, course:courses(*)')
      .eq('user_id', profile?.id);

    if (!error) {
      setEnrollments(data || []);
    }
    setLoading(false);
  };

  const filteredEnrollments = enrollments.filter(enroll => {
    if (filter === 'in_progress') return enroll.completion_percentage > 0 && enroll.completion_percentage < 100;
    if (filter === 'completed') return enroll.completion_percentage === 100;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Chào mừng, {profile?.full_name || 'Học viên'}!</h1>
          <p className="text-gray-500 mt-2">Tiếp tục hành trình chinh phục kiến thức của bạn.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
            <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
              <BookOpen size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{enrollments.length}</div>
            <div className="text-sm text-gray-500">Khóa học đã đăng ký</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
            <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
              <Clock size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">12h 45m</div>
            <div className="text-sm text-gray-500">Thời gian đã học</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
            <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
              <Award size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">2</div>
            <div className="text-sm text-gray-500">Chứng chỉ đã đạt</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900">Khóa học của tôi</h2>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-black/5 self-start">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'in_progress' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Đang học
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'completed' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Hoàn thành
            </button>
          </div>
        </div>
        
        {filteredEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEnrollments.map((enroll) => {
              const progress = enroll.completion_percentage || 0;
              const totalLessons = enroll.course?.modules?.length || 0;
              const completedLessons = Math.round((progress / 100) * totalLessons);
              
              // Extract active lesson from progress JSONB
              const progressData = enroll.progress as any;
              const lastModuleId = progressData?.last_module;
              const activeLesson = enroll.course?.modules?.find(m => m.id === lastModuleId);
              
              return (
                <motion.div
                  key={enroll.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl border border-black/5 overflow-hidden group shadow-sm flex flex-col"
                >
                  <div className="aspect-video relative">
                    <img 
                      src={enroll.course?.thumbnail_url || `https://picsum.photos/seed/${enroll.course_id}/600/400`} 
                      className="w-full h-full object-cover"
                      alt={enroll.course?.title}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    {progress === 100 && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Award size={12} />
                        Hoàn thành
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{enroll.course?.title}</h3>
                    
                    {activeLesson && progress < 100 && (
                      <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Đang học</p>
                        <p className="text-sm font-medium text-indigo-900 line-clamp-1">{activeLesson.title}</p>
                      </div>
                    )}

                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>Tiến độ học tập</span>
                        <span>{completedLessons}/{totalLessons} bài học</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full mb-4 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Tiến độ: {progress}%</span>
                        <Link 
                          to={`/learn/${enroll.course_id}`}
                          className={`flex items-center gap-1 font-bold hover:gap-2 transition-all ${
                            progress === 100 ? 'text-emerald-600' : 'text-indigo-600'
                          }`}
                        >
                          {progress === 100 ? 'Xem lại' : 'Học tiếp'} <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Bạn chưa đăng ký khóa học nào.' 
                : filter === 'in_progress' 
                  ? 'Không có khóa học nào đang trong tiến trình.' 
                  : 'Bạn chưa hoàn thành khóa học nào.'}
            </p>
            {filter === 'all' && (
              <Link to="/" className="bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800">
                Khám phá khóa học ngay
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
