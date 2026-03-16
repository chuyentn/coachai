import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { CourseCard } from '../components/CourseCard';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Course } from '../types';
import { useTranslation } from 'react-i18next';

export const Courses: React.FC = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = ['All', 'Free', 'AI Projects', 'No-Code', 'Bestseller'];

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('status', '==', 'published'));
      const querySnapshot = await getDocs(q);
      const fetchedCourses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(fetchedCourses);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      // Fallback Mock Data if Firebase fails or returns empty
      if (err.message?.includes('Missing or insufficient permissions')) {
        // Assume unauthenticated user reading from protected endpoint during development
      }
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
      
      const matchesFilter = 
        activeFilter === 'All' ? true :
        activeFilter === 'Free' ? (!course.price_vnd || course.price_vnd === 0) :
        activeFilter === 'AI Projects' ? course.title?.toLowerCase().includes('ai') :
        activeFilter === 'No-Code' ? course.title?.toLowerCase().includes('no-code') :
        activeFilter === 'Bestseller' ? (course.total_students || 0) > 50 : true;

      return matchesSearch && matchesFilter;
    });
  }, [courses, searchQuery, activeFilter]);

  // Use Mock Data if the list is empty and still loading
  const displayCourses = courses.length > 0 ? filteredCourses : (loading ? [] : mockCourses);
  const finalFilteredCourses = React.useMemo(() => {
    if (courses.length > 0) return filteredCourses;
    // Apply filters to mock data if real data is empty
    return mockCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        activeFilter === 'All' ? true :
        activeFilter === 'Free' ? course.price_vnd === 0 :
        activeFilter === 'AI Projects' ? course.title.toLowerCase().includes('ai') :
        activeFilter === 'No-Code' ? course.title.toLowerCase().includes('no-code') :
        activeFilter === 'Bestseller' ? course.total_students > 50 : true;

      return matchesSearch && matchesFilter;
    });
  }, [courses, filteredCourses, searchQuery, activeFilter]);


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0E17]">
      <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
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
            className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl max-w-full"
          >
            Hàng chục khóa học chuyên sâu từ cơ bản đến nâng cao về lập trình AI, No-Code và phát triển ứng dụng độc lập dành cho bạn.
          </motion.p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
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
          <div className="relative w-full md:w-80 group shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder={t('home.searchPlaceholder') || "Tìm kiếm khóa học..."}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium shadow-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Course Grid */}
        {loading && courses.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[450px] bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 animate-pulse" />
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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

      </main>
    </div>
  );
};

// --- MOCK DATA FALLBACK ---
const mockCourses: any[] = [
  {
    id: 'mock-1',
    title: 'Làm Chủ Cursor AI & Bolt.new Từ Bắt Đầu',
    description: 'Khóa học toàn diện hướng dẫn cách sử dụng Cursor AI làm trợ lý lập trình chuyên nghiệp và Bolt.new để deploy web applications siêu tốc.',
    short_description: 'Combo vũ khí mạnh mẽ nhất cho lập trình viên No-Code.',
    instructor_name: 'Trần Ngọc Chuyền',
    price_vnd: 2990000,
    thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600&h=400',
    total_students: 156,
    avg_rating: 4.9,
    status: 'published'
  },
  {
    id: 'mock-2',
    title: 'Phát Triển Web App Chuyên Nghiệp Không Cần Viết Code',
    description: 'Học cách xây dựng các ứng dụng web phức tạp, có cơ sở dữ liệu và tích hợp API mạnh mẽ mà không cần động đến một dòng code nào.',
    short_description: 'Giải pháp No-Code cho doanh nghiệp và khởi nghiệp tinh gọn.',
    instructor_name: 'Vibe Code Coaching',
    price_vnd: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=400',
    total_students: 843,
    avg_rating: 4.8,
    status: 'published'
  },
  {
    id: 'mock-3',
    title: 'Xây Dựng AI Chatbot Nội Bộ Với RAG Architecture',
    description: 'Cách ingest tài liệu nội bộ, setup vector database, và xây dựng UI cho AI chatbot thông minh nội bộ.',
    short_description: 'Ứng dụng AI đột phá vào quy trình làm việc.',
    instructor_name: 'Trần Ngọc Chuyền',
    price_vnd: 1500000,
    thumbnail_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600&h=400',
    total_students: 89,
    avg_rating: 5.0,
    status: 'published'
  },
  {
    id: 'mock-4',
    title: 'Tự Động Hóa Workflow Với n8n & Make',
    description: 'Kết nối toàn bộ công cụ làm việc của bạn (Slack, Gmail, Sheets, Airtable) để tự động hóa tối đa quy trình thủ công.',
    short_description: 'Làm việc thông minh hơn (Work smarter, not harder).',
    instructor_name: 'AI Agent Tùng',
    price_vnd: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600&h=400',
    total_students: 412,
    avg_rating: 4.7,
    status: 'published'
  },
  {
    id: 'mock-5',
    title: 'Học ReactJS Qua 10 Dự Án Thực Tế (Phần 1)',
    description: 'Thực hành ReactJS từ cơ bản với Hooks, Router, State Management thông qua chuỗi dự án tăng dần độ khó.',
    short_description: 'Khóa học nền tảng React bắt buộc phải có.',
    instructor_name: 'Vibe Code Coaching',
    price_vnd: 500000,
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600&h=400',
    total_students: 45,
    avg_rating: 4.9,
    status: 'published'
  },
  {
    id: 'mock-6',
    title: 'Tạo Tiền Từ AI Generated Art (Midjourney/DALL-E)',
    description: 'Bí kíp thiết lập Prompt engineering, luyện model riêng và kinh doanh các sản phẩm nghệ thuật sinh ra từ AI.',
    short_description: 'Hành trình bán ý tưởng cho kỷ nguyên mới.',
    instructor_name: 'Creator Minh Đức',
    price_vnd: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1686191128892-3b3b44b6c3bd?auto=format&fit=crop&q=80&w=600&h=400',
    total_students: 1205,
    avg_rating: 4.6,
    status: 'published'
  }
];  
