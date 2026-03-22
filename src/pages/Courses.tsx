import React, { useState, useEffect } from 'react';
import { CourseCard } from '../components/CourseCard';
import { Search, X, TrendingUp, Star, Zap, BookOpen, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
  { label: 'Tất cả', value: 'All', icon: '🎯' },
  { label: 'Miễn phí', value: 'Free', icon: '🎁' },
  { label: 'AI Agent', value: 'AI Projects', icon: '🤖' },
  { label: 'No-Code', value: 'No-Code', icon: '⚡' },
  { label: 'Bán chạy', value: 'Bestseller', icon: '🔥' },
  { label: 'Vibe Code', value: 'Vibe', icon: '🎵' },
];

// Fallback data hiển thị khi Google Sheets API chưa sẵn sàng
const FALLBACK_COURSES: Course[] = [
  {
    id: 'f1', title: 'AI Masterclass: ChatGPT & Midjourney', title_en: '',
    description: 'Làm chủ ChatGPT và Midjourney để tăng năng suất x10 — từ prompt engineering đến tự động hóa công việc hàng ngày.',
    description_en: '', short_description: '', short_description_en: '',
    price_vnd: 0, price_usd: 0, thumbnail_url: '',
    instructor_id: 'victorchuyen', published: true, featured: true,
    total_students: 1240, total_reviews: 98, avg_rating: 4.9, rating_avg: 4.9, rating_count: 98,
    level: 'Beginner', duration_text: '8 giờ', created_at: '2024-01-01', status: 'published', modules: []
  },
  {
    id: 'f2', title: 'Vibe Code AI: Build SaaS No-Code', title_en: '',
    description: 'Xây dựng SaaS multi-tenant từ A-Z bằng Google Sheets, Apps Script và Cloudflare Pages — không cần server, không cần code backend.',
    description_en: '', short_description: '', short_description_en: '',
    price_vnd: 990000, price_usd: 39, thumbnail_url: '',
    instructor_id: 'victorchuyen', published: true, featured: true,
    total_students: 420, total_reviews: 45, avg_rating: 4.8, rating_avg: 4.8, rating_count: 45,
    level: 'Intermediate', duration_text: '12 giờ', created_at: '2024-03-01', status: 'published', modules: []
  },
  {
    id: 'f3', title: 'AI Agent với n8n & Make.com', title_en: '',
    description: 'Thiết kế AI Agent tự động hóa toàn bộ quy trình: email, CRM, báo cáo — không cần lập trình, chỉ cần kéo thả.',
    description_en: '', short_description: '', short_description_en: '',
    price_vnd: 790000, price_usd: 29, thumbnail_url: '',
    instructor_id: 'victorchuyen', published: true, featured: false,
    total_students: 680, total_reviews: 72, avg_rating: 4.7, rating_avg: 4.7, rating_count: 72,
    level: 'Intermediate', duration_text: '10 giờ', created_at: '2024-06-01', status: 'published', modules: []
  },
  {
    id: 'f4', title: 'Vibe Coding: React + Firebase từ Zero', title_en: '',
    description: 'Học lập trình React và Firebase theo phong cách Vibe Coding — tư duy sản phẩm, build nhanh, deploy ngay trong ngày đầu tiên.',
    description_en: '', short_description: '', short_description_en: '',
    price_vnd: 0, price_usd: 0, thumbnail_url: '',
    instructor_id: 'victorchuyen', published: true, featured: false,
    total_students: 330, total_reviews: 28, avg_rating: 4.6, rating_avg: 4.6, rating_count: 28,
    level: 'Beginner', duration_text: '15 giờ', created_at: '2024-09-01', status: 'published', modules: []
  },
  {
    id: 'f5', title: 'No-Code App Mobile với Glide & Softr', title_en: '',
    description: 'Tạo ứng dụng mobile đẹp và chức năng chỉ trong 2 giờ — kết nối Google Sheets, tùy chỉnh UI, publish lên App Store.',
    description_en: '', short_description: '', short_description_en: '',
    price_vnd: 490000, price_usd: 19, thumbnail_url: '',
    instructor_id: 'victorchuyen', published: true, featured: false,
    total_students: 510, total_reviews: 41, avg_rating: 4.5, rating_avg: 4.5, rating_count: 41,
    level: 'Beginner', duration_text: '6 giờ', created_at: '2025-01-01', status: 'published', modules: []
  },
  {
    id: 'f6', title: 'Prompt Engineering Nâng Cao', title_en: '',
    description: 'Kỹ thuật viết prompt chuyên sâu cho Claude, GPT-4 và Gemini — Chain-of-thought, ReAct, RAG và tối ưu output AI.',
    description_en: '', short_description: '', short_description_en: '',
    price_vnd: 690000, price_usd: 25, thumbnail_url: '',
    instructor_id: 'victorchuyen', published: true, featured: false,
    total_students: 290, total_reviews: 33, avg_rating: 4.8, rating_avg: 4.8, rating_count: 33,
    level: 'Expert', duration_text: '9 giờ', created_at: '2025-06-01', status: 'published', modules: []
  },
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Expert'];
const SORTS = [
  { label: 'Phổ biến nhất', value: 'popular' },
  { label: 'Đánh giá cao', value: 'rating' },
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Giá thấp', value: 'price_asc' },
];

export const Courses: React.FC = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFeatured, setShowFeatured] = useState(false);

  const fetchCourses = async () => {
    setLoading(true); setError(null);
    try {
      const data = await googleSheetsService.fetchCourses();
      const published = data.filter(c => c.status === 'published' || c.published);
      // Fallback to hardcoded data if API returns empty (e.g. WEBHOOK_URL missing on prod)
      setCourses(published.length > 0 ? published : FALLBACK_COURSES);
    } catch {
      // On any network error, still show fallback courses so page is never blank
      setCourses(FALLBACK_COURSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const filteredCourses = React.useMemo(() => {
    let result = courses.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      const matchCat =
        activeCategory === 'All' ? true :
        activeCategory === 'Free' ? (!c.price_vnd || c.price_vnd === 0) :
        activeCategory === 'AI Projects' ? c.title?.toLowerCase().includes('ai') :
        activeCategory === 'No-Code' ? c.title?.toLowerCase().includes('no-code') :
        activeCategory === 'Vibe' ? c.title?.toLowerCase().includes('vibe') :
        activeCategory === 'Bestseller' ? (c.total_students || 0) > 50 : true;
      const matchLevel = filterLevel === 'All' ? true : c.level === filterLevel;
      const matchFeatured = !showFeatured || c.featured === true;
      return matchSearch && matchCat && matchLevel && matchFeatured;
    });

    // Sort
    if (sortBy === 'popular') result.sort((a, b) => (b.total_students || 0) - (a.total_students || 0));
    else if (sortBy === 'rating') result.sort((a, b) => (b.avg_rating || b.rating_avg || 0) - (a.avg_rating || a.rating_avg || 0));
    else if (sortBy === 'price_asc') result.sort((a, b) => (a.price_vnd || 0) - (b.price_vnd || 0));
    return result;
  }, [courses, searchQuery, activeCategory, filterLevel, sortBy, showFeatured]);

  const totalStudents = courses.reduce((acc, c) => acc + (c.total_students || 0), 0);

  return (
    <div className="min-h-screen bg-[#0B0E17]">

      {/* ── HERO SEARCH BANNER ── */}
      <div className="bg-gradient-to-br from-[#0d0f1c] via-[#111827] to-[#0d0f1c] border-b border-white/5 pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Flame size={12} /> Live 2026 · AI & Vibe Coding
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 leading-tight"
          >
            Học AI,{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Build thật
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg mb-10 max-w-xl mx-auto"
          >
            Khóa học từ cơ bản đến ra sản phẩm thật — AI Agent, No-Code SaaS, Vibe Coding
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm khóa học AI, No-Code, Vibe Coding..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-14 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:bg-white/8 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-white placeholder-slate-500 text-base font-medium transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm"
          >
            {[
              { icon: <BookOpen size={14} />, text: `${courses.length || '10+'} khóa học` },
              { icon: <TrendingUp size={14} />, text: `${totalStudents.toLocaleString() || '500+'} học viên` },
              { icon: <Star size={14} />, text: 'Cập nhật 2026' },
              { icon: <Zap size={14} />, text: 'Build sản phẩm thật' },
            ].map((s, i) => (
              <span key={i} className="flex items-center gap-1.5 text-slate-400">
                <span className="text-indigo-400">{s.icon}</span>{s.text}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── FILTERS TOOLBAR — single scrollable row ── */}
      <div className="sticky top-16 z-40 bg-[#0d0f1c]/95 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">

          {/* ① Category chips */}
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                activeCategory === cat.value
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white bg-white/5'
              }`}
            >
              <span className="text-xs">{cat.icon}</span> {cat.label}
            </button>
          ))}

          {/* ─── Divider ─── */}
          <div className="flex-shrink-0 w-px h-5 bg-white/10 mx-1" />

          {/* ② Trình độ chips — inline */}
          {LEVELS.map(l => (
            <button key={l}
              onClick={() => setFilterLevel(l)}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-bold transition-all border ${
                filterLevel === l
                  ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white bg-white/5'
              }`}
            >
              {l === 'All' ? '📚 Mọi trình độ' : l === 'Beginner' ? '🌱 Cơ bản' : l === 'Intermediate' ? '⚡ Trung cấp' : '🔥 Nâng cao'}
            </button>
          ))}

          {/* ─── Divider ─── */}
          <div className="flex-shrink-0 w-px h-5 bg-white/10 mx-1" />

          {/* ③ Nổi bật toggle */}
          <button
            onClick={() => setShowFeatured(!showFeatured)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold transition-all border ${
              showFeatured
                ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white bg-white/5'
            }`}
          >
            <Star size={13} className={showFeatured ? 'fill-white' : ''} /> Nổi bật
          </button>

          {/* Spacer đẩy sort về phải */}
          <div className="flex-1 min-w-4" />

          {/* ④ Sort dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="flex-shrink-0 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {SORTS.map(s => <option key={s.value} value={s.value} className="bg-[#111827]">{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── COURSE GRID ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        
        {/* Result count */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-400">
              {filteredCourses.length > 0
                ? <><span className="text-white font-bold">{filteredCourses.length}</span> khóa học</>
                : 'Không tìm thấy kết quả'}
            </p>
            {(filterLevel !== 'All' || activeCategory !== 'All' || searchQuery || showFeatured) && (
              <button
                onClick={() => { setFilterLevel('All'); setActiveCategory('All'); setSearchQuery(''); setShowFeatured(false); }}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold"
              >
                <X size={12} /> Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Skeleton Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden animate-pulse">
                <div className="h-48 bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 w-16 bg-white/5 rounded-full" />
                    <div className="h-6 w-20 bg-white/5 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-rose-400 mb-4">{error}</p>
            <button onClick={fetchCourses} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Thử lại</button>
          </div>
        ) : filteredCourses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-white font-bold text-xl mb-2">Không tìm thấy khóa học</p>
            <p className="text-slate-400 mb-6">Thử từ khóa khác hoặc xóa bộ lọc</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); setFilterLevel('All'); }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >Xem tất cả khóa học</button>
          </div>
        )}

        {/* CTA Banner */}
        {!loading && filteredCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 text-center"
          >
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-2xl font-black text-white mb-2">Chưa biết bắt đầu từ đâu?</h2>
            <p className="text-slate-400 mb-6">Đặt lịch tư vấn 1:1 miễn phí với Coach — 30 phút lên kế hoạch học cụ thể.</p>
            <a
              href="https://cal.com/victorchuyen/coachai"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/25"
            >
              📅 Đặt lịch miễn phí
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Courses;
