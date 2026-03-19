import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { CourseCard } from '../components/CourseCard';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Course } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import { useTranslation } from 'react-i18next';

export const Courses: React.FC = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [filterPrice, setFilterPrice] = useState<string>('All');

  const filters = ['All', 'Free', 'AI Projects', 'No-Code', 'Bestseller'];

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await googleSheetsService.fetchCourses();
      setCourses(data.filter(c => c.status === 'published' || c.published));
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('Mất kết nối với máy chủ. Vui lòng tải lại trang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredCourses = React.useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = 
        activeFilter === 'All' ? true :
        activeFilter === 'Free' ? (!course.price_vnd || course.price_vnd === 0) :
        activeFilter === 'AI Projects' ? course.title?.toLowerCase().includes('ai') :
        activeFilter === 'No-Code' ? course.title?.toLowerCase().includes('no-code') :
        activeFilter === 'Bestseller' ? (course.total_students || 0) > 50 : true;

      const matchesLevel = filterLevel === 'All' ? true : course.level === filterLevel;
      const matchesRating = Number(course.rating_avg || 0) >= filterRating;
      const matchesPrice = filterPrice === 'All' ? true :
                           filterPrice === 'Free' ? (!course.price_vnd || course.price_vnd === 0) :
                           (course.price_vnd || 0) > 0;

      return matchesSearch && matchesTab && matchesLevel && matchesRating && matchesPrice;
    });
  }, [courses, searchQuery, activeFilter, filterLevel, filterRating, filterPrice]);

  // Display only real courses from Firestore
  const finalFilteredCourses = filteredCourses;


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0E17]">
      <main className="flex-grow pt-24 sm:pt-32 pb-20 sm:pb-24 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4"
          >
            {t('home.popularCourses') || "Khám Phá Khóa Học"}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl"
          >
            Hàng chục khóa học chuyên sâu từ cơ bản đến nâng cao về lập trình AI, No-Code và phát triển ứng dụng độc lập dành cho bạn.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Trình độ</h3>
              <div className="space-y-2">
                {['All', 'Beginner', 'Intermediate', 'Expert'].map(l => (
                  <label key={l} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="level" 
                      checked={filterLevel === l} 
                      onChange={() => setFilterLevel(l)}
                      className="w-4 h-4 accent-indigo-600" 
                    />
                    <span className={`text-sm font-bold transition-colors ${filterLevel === l ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>{l}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Đánh giá</h3>
              <div className="space-y-2">
                {[4.5, 4.0, 3.5, 0].map(r => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="rating" 
                      checked={filterRating === r} 
                      onChange={() => setFilterRating(r)}
                      className="w-4 h-4 accent-indigo-600" 
                    />
                    <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                      {r === 0 ? 'Tất cả' : `${r} sao trở lên`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-600/20">
               <h3 className="font-black text-sm mb-2">Hỗ trợ đặc biệt?</h3>
               <p className="text-[10px] text-indigo-100 font-medium leading-relaxed mb-4">Chat trực tiếp với Mentors để được tư vấn lộ trình học phù hợp nhất với bạn.</p>
               <button className="w-full py-2 bg-white text-indigo-600 rounded-xl font-black text-[10px] hover:bg-indigo-50 transition-all">NHẬN TƯ VẤN</button>
            </div>
          </aside>

          {/* Main List */}
          <div className="flex-1">
            {/* Search and Tab Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              {/* Tabs */}
              <div className="flex overflow-x-auto hide-scrollbar pb-2 md:pb-0">
                <div className="inline-flex p-1.5 bg-white dark:bg-slate-800/50 shadow-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl gap-1">
                  {filters.map(filter => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                        activeFilter === filter 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 transform scale-100' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 scale-95'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64 group shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Tìm khóa học..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium shadow-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

        {/* Course Grid */}
        {loading && courses.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[380px] sm:h-[450px] bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 animate-pulse" />
            ))}
          </div>
        ) : error && courses.length === 0 ? (
          <div className="text-center py-20 bg-rose-50 dark:bg-rose-900/10 rounded-[3rem] border border-rose-100 dark:border-rose-900/30">
            <p className="text-rose-600 dark:text-rose-400 mb-6 font-bold">{error}</p>
            <button 
              onClick={fetchCourses}
              className="px-8 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-bold shadow-lg shadow-rose-200 dark:shadow-rose-900/20"
            >
              Thử lại ngay
            </button>
          </div>
        ) : finalFilteredCourses.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {finalFilteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
              <Search size={40} />
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-xl">Không tìm thấy kết quả</p>
            <p className="text-slate-500 mt-2">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
          </div>
        )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Courses;
