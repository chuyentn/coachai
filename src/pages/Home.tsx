import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { CourseCard } from '../components/CourseCard';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Mail, 
  Send, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Users, 
  Award,
  ArrowRight,
  Play,
  Star,
  Globe,
  Cpu,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSearchParams, Link } from 'react-router-dom';
import { googleSheetsService } from '../services/googleSheetsService';
import { crmService } from '../services/crmService';
import { usePageTitle } from '../hooks/usePageTitle';

export const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  // Lead state
  const [leadEmail, setLeadEmail] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  usePageTitle('Học AI & Coaching – Nền tảng hàng đầu Việt Nam');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value.trim() });
    } else {
      setSearchParams({});
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const coursesData = await googleSheetsService.fetchCourses();
      setCourses(coursesData.filter(c => c.published));
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('Không thể tải danh sách khóa học từ Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;

    setLeadLoading(true);
    try {
      await googleSheetsService.submitLead(leadEmail);
      await crmService.addContact(leadEmail);
      
      setLeadSuccess(true);
      setLeadEmail('');
      setTimeout(() => setLeadSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting lead:', err);
    } finally {
      setLeadLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-white">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
          <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm border border-indigo-100/50">
                <Sparkles size={14} className="animate-pulse" />
                <span>Nền tảng học tập AI thế hệ mới</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
                Học thông minh hơn <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-400">
                  Với AI Coaching
                </span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                Trải nghiệm mô hình học tập cá nhân hóa với trợ lý AI Coach 24/7. 
                Nâng tầm sự nghiệp cùng các chuyên gia hàng đầu.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <div className="max-w-md w-full relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm kỹ năng bạn muốn học..."
                    className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md text-lg font-medium"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <button
                  onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 flex items-center gap-2 group"
                >
                  Bắt đầu ngay
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Trusted By */}
              <div className="pt-8 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Được tin dùng bởi học viên từ</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                  {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix'].map((brand) => (
                    <span key={brand} className="text-2xl font-black tracking-tighter text-slate-900">{brand}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'AI Coach 24/7', 
                desc: 'Trợ lý AI thông minh giải đáp mọi thắc mắc và hướng dẫn thực hành ngay trong bài học.',
                icon: Cpu,
                color: 'indigo'
              },
              { 
                title: 'Lộ trình cá nhân', 
                desc: 'Hệ thống tự động điều chỉnh nội dung học tập phù hợp với tốc độ và trình độ của bạn.',
                icon: Zap,
                color: 'violet'
              },
              { 
                title: 'Chứng chỉ uy tín', 
                desc: 'Nhận chứng chỉ hoàn thành khóa học được công nhận bởi các đối tác doanh nghiệp.',
                icon: Award,
                color: 'emerald'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`w-16 h-16 rounded-[1.5rem] bg-${feature.color}-50 flex items-center justify-center text-${feature.color}-600 mb-8 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course List */}
      <main id="courses-section" className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
              <div className="w-8 h-[2px] bg-indigo-600"></div>
              Khám phá kiến thức
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Khóa học nổi bật
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">
              Tất cả khóa học
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-white hover:text-indigo-600 transition-all">
                <ArrowRight size={20} className="rotate-180" />
              </div>
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-white hover:text-indigo-600 transition-all">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] bg-white rounded-[2.5rem] border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-rose-50 rounded-[3rem] border border-rose-100">
            <p className="text-rose-600 mb-6 font-bold">{error}</p>
            <button 
              onClick={fetchCourses}
              className="px-10 py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all font-black shadow-xl shadow-rose-200"
            >
              Thử lại ngay
            </button>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Search size={40} />
            </div>
            <p className="text-slate-900 font-bold text-xl">Không tìm thấy kết quả</p>
            <p className="text-slate-500 mt-2">Hãy thử tìm kiếm với từ khóa khác.</p>
          </div>
        )}
      </main>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Học viên', value: '50,000+', icon: Users },
              { label: 'Khóa học', value: '1,200+', icon: BookOpen },
              { label: 'Giảng viên', value: '300+', icon: Star },
              { label: 'Quốc gia', value: '25+', icon: Globe },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-6xl font-black mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
            
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl text-white mb-10 border border-white/30 shadow-xl">
                <Mail size={40} />
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Sẵn sàng nâng tầm <br /> sự nghiệp của bạn?</h2>
              <p className="text-indigo-100 mb-12 text-xl font-medium leading-relaxed">
                Đăng ký nhận bản tin để nhận các ưu đãi độc quyền và kiến thức chuyên sâu về AI hàng tuần.
              </p>

              {leadSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/20 border border-emerald-500/50 rounded-[2rem] p-8 text-white flex items-center justify-center gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="text-xl font-bold">Tuyệt vời! Bạn đã đăng ký thành công.</span>
                </motion.div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                  <input
                    type="email"
                    required
                    placeholder="Nhập email của bạn..."
                    className="flex-1 px-8 py-5 rounded-[2rem] bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all text-lg font-medium"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={leadLoading}
                    className="px-10 py-5 bg-white text-indigo-600 rounded-[2rem] font-black text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-2xl shadow-indigo-900/20"
                  >
                    {leadLoading ? 'Đang gửi...' : 'Tham gia ngay'}
                    <Send size={20} />
                  </button>
                </form>
              )}
              
              <p className="mt-8 text-indigo-200/60 text-xs font-medium">
                Chúng tôi tôn trọng quyền riêng tư của bạn. Không spam, cam kết 100%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Zap size={24} />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900">CoachAI</span>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                Nền tảng học tập trực tuyến kết hợp AI Coaching hàng đầu Việt Nam. 
                Sứ mệnh của chúng tôi là giúp 1 triệu người Việt làm chủ công nghệ.
              </p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Khám phá</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Khóa học AI</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Marketing</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Lập trình</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Thiết kế</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Hỗ trợ</h4>
              <ul className="space-y-4 text-slate-500 font-medium">
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Trung tâm trợ giúp</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Điều khoản dịch vụ</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Chính sách bảo mật</Link></li>
                <li><Link to="/" className="hover:text-indigo-600 transition-colors">Liên hệ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Kết nối</h4>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-all">
                    <Globe size={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-medium">© 2026 CoachAI. All rights reserved.</p>
            <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
              <span className="flex items-center gap-1"><ShieldCheck size={14} /> Bảo mật SSL</span>
              <span className="flex items-center gap-1"><Globe size={14} /> Tiếng Việt</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
