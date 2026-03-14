import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Course } from '../types';
import { CourseCard } from '../components/CourseCard';
import { Search, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true);

      if (error) throw error;
      
      // Fetch instructors separately or just use the data
      setCourses(data || []);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Không thể kết nối với máy chủ dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white border-b border-black/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-50">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-6">
              <Sparkles size={14} />
              <span>Học tập không giới hạn</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Nâng tầm kỹ năng <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
                Cùng chuyên gia Việt
              </span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
              Khám phá hàng ngàn khóa học chất lượng cao từ các giảng viên hàng đầu. 
              Học mọi lúc, mọi nơi với lộ trình bài bản.
            </p>

            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học (React, Marketing, Design...)"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Course List */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" />
              Khóa học nổi bật
            </h2>
            <p className="text-gray-500">Những khóa học được học viên yêu thích nhất</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
            <p className="text-red-600 mb-4 font-medium">{error}</p>
            <button 
              onClick={fetchCourses}
              className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold"
            >
              Thử lại
            </button>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500">Không tìm thấy khóa học nào phù hợp.</p>
          </div>
        )}
      </main>
    </div>
  );
};
