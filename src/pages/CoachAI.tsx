import React, { useState, useEffect, useMemo } from 'react';
import { CoachAICard } from '../components/CoachAI/CoachAICard';
import { Sparkles, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { crmService } from '../services/crmService';
import type { CoachAIConfig, RoleTarget, BotCategory } from '../components/CoachAI/types';
import { googleSheetsService } from '../services/googleSheetsService';
import { useTranslation } from 'react-i18next';

const FALLBACK_DATA: CoachAIConfig = {
  hero: {
    title: "Coach AI - Chọn trợ lý đúng mục tiêu",
    subtitle: "Học AI, làm dự án, kiếm tiền cùng trợ lý phù hợp."
  },
  bots: [
    {
      id: "bot_student_01",
      title: "Coach AI cho Học viên",
      slug: "student-gem",
      role_target: "student",
      category: "gem",
      short_desc: "Hỏi nhanh về lộ trình học AI và cách bắt đầu.",
      button_primary_text: "Mở Gem",
      button_primary_url: "https://gemini.google.com/gem/...",
      button_secondary_text: "Xem khóa học",
      button_secondary_url: "https://edu.victorchuyen.net/courses/ai-basic",
      thumbnail_url: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
      status: "active",
      featured: true,
      sort_order: 1,
      tags: "ai,học tập,cơ bản"
    },
    {
      id: "bot_teacher_01",
      title: "Coach AI - Trợ lý giảng viên",
      slug: "teacher-gem",
      role_target: "teacher",
      category: "gem",
      short_desc: "Giúp soạn outline, tối ưu khóa học, tạo FAQ nhanh.",
      button_primary_text: "Mở Gem",
      button_primary_url: "https://gemini.google.com/gem/...",
      button_secondary_text: "Hỗ trợ Docs",
      button_secondary_url: "https://docs.google.com/",
      thumbnail_url: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
      status: "active",
      featured: true,
      sort_order: 2,
      tags: "teacher,outline,soạn bài"
    },
    {
      id: "bot_admin_01",
      title: "Coach AI - Admin & Support",
      slug: "admin-support-gem",
      role_target: "admin",
      category: "support",
      short_desc: "Hỗ trợ trả lời FAQ, tra cứu SOP nội bộ vận hành.",
      button_primary_text: "Mở Gem",
      button_primary_url: "https://gemini.google.com/gem/...",
      button_secondary_text: "Quy trình",
      button_secondary_url: "https://docs.google.com/",
      thumbnail_url: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
      status: "active",
      featured: false,
      sort_order: 3,
      tags: "admin,support,quy trình"
    },
    {
      id: "bot_nblm_01",
      title: "NotebookLM - AI cho người mới",
      slug: "nblm-ai-newbie",
      role_target: "student",
      category: "notebooklm",
      short_desc: "Kho tri thức AI từ 0-1 được cấu trúc sẵn để hỏi đáp sâu.",
      button_primary_text: "Mở NotebookLM",
      button_primary_url: "https://notebooklm.google.com/...",
      button_secondary_text: "Tham gia nhóm",
      button_secondary_url: "https://facebook.com/groups/...",
      thumbnail_url: "https://upload.wikimedia.org/wikipedia/commons/7/77/NotebookLM.svg",
      status: "active",
      featured: true,
      sort_order: 4,
      tags: "notebooklm,kiến thức"
    },
    {
      id: "bot_nblm_02",
      title: "NotebookLM - Kiếm tiền MMO",
      slug: "nblm-mmo-money",
      role_target: "student",
      category: "notebooklm",
      short_desc: "Kinh nghiệm thực chiến Affiliate & MMO với AI.",
      button_primary_text: "Mở NotebookLM",
      button_primary_url: "https://notebooklm.google.com/...",
      button_secondary_text: "Khóa Affiliate",
      button_secondary_url: "https://edu.victorchuyen.net/courses/",
      thumbnail_url: "https://upload.wikimedia.org/wikipedia/commons/7/77/NotebookLM.svg",
      status: "active",
      featured: false,
      sort_order: 5,
      tags: "mmo,affiliate"
    }
  ]
};

export const CoachAI: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [data, setData] = useState<CoachAIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<RoleTarget | 'all'>('student');
  const [activeCategory, setActiveCategory] = useState<BotCategory | 'all'>('all');
  
  // Newsletter state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const lang = i18n.language === 'en' ? 'en' : 'vi';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = await googleSheetsService.fetchConfig(lang);
        if (!config || config.error) throw new Error('API fetch failed or returned error');
        setData(config);
      } catch (error) {
        console.warn('Failed to fetch Coach AI config, using fallback data:', error);
        setData(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lang]);

  const filteredBots = useMemo(() => {
    if (!data) return [];
    return data.bots.filter(bot => {
      const matchRole = activeRole === 'all' || bot.role_target === activeRole || bot.role_target === 'all';
      const matchCat = activeCategory === 'all' || bot.category === activeCategory;
      return matchRole && matchCat;
    });
  }, [data, activeRole, activeCategory]);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#F9FAFB] dark:bg-[#0B0E17]">
      {/* Hero Section */}
      <section className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-900/10 dark:via-slate-900 dark:to-purple-900/10" />
        
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl py-12 lg:py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-6 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI Ecosystem Hub</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            {data?.hero.title || "Coach AI - Chọn đúng trợ lý"}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            {data?.hero.subtitle || "Học AI, xây khóa học, kiếm tiền online với trợ lý phù hợp."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5" onClick={() => document.getElementById('hub-grid')?.scrollIntoView({ behavior: 'smooth' })}>
              Mở trợ lý cho tôi
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-semibold transition-all shadow-sm">
              Khám phá kho tri thức
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-7xl" id="hub-grid">
        {/* Role Tabs */}
        <div className="flex justify-center mb-10 relative z-20">
          <div className="inline-flex p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none">
            {[
              { id: 'student', label: 'Học viên' },
              { id: 'teacher', label: 'Giảng viên' },
              { id: 'admin', label: 'Admin/Hỗ trợ' }
            ].map(role => (
              <button
                key={role.id}
                onClick={() => {
                  setActiveRole(role.id as RoleTarget);
                  setActiveCategory('all'); // Reset filter on role change
                }}
                className={`relative px-8 py-3 rounded-xl font-bold text-sm transition-all duration-500 ease-out ${
                  activeRole === role.id 
                    ? 'text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {activeRole === role.id && (
                  <motion.div
                    layoutId="activeRoleTabIndicator"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/20"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-2">
            Lọc theo:
          </span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'gem', label: 'Gemini Gems' },
            { id: 'notebooklm', label: 'NotebookLM' },
            { id: 'course', label: 'Khóa học' },
            { id: 'support', label: 'Hỗ trợ' },
            { id: 'tool', label: 'Công cụ' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[400px]">
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="h-[340px] bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 overflow-hidden relative shadow-sm"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 dark:via-white/5 to-transparent skew-x-12" />
                <div className="h-44 bg-slate-100 dark:bg-slate-800/50 w-full mb-6" />
                <div className="px-8 space-y-4">
                  <div className="h-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-full" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-2/3" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : filteredBots.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredBots.map((bot, idx) => (
                <motion.div
                  key={bot.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                >
                  <CoachAICard bot={bot} index={idx} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có trợ lý nào</h3>
            <p className="text-slate-500 dark:text-slate-400">Không tìm thấy AI hoặc công cụ nào trong danh mục này.</p>
          </div>
        )}
        
        {/* FAQ & Support Section at the bottom */}
        <section className="mt-24 pt-16 border-t border-gray-100 dark:border-slate-800 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">FAQ: Dành cho người mới</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-2">Gemini Gems là gì?</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Là các trợ lý AI chuyên biệt được lập trình sẵn mục tiêu và ngữ cảnh. Khác với ChatGPT chung chung, Gem của CoachAI giống như một người cố vấn đã học qua toàn bộ phương pháp giảng dạy của Edu Vibe.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-2">NotebookLM khác gì Gem?</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  NotebookLM là công cụ "hỏi đáp đúng nguồn". Nó chỉ dựa vào tài liệu được tải lên (PDF, Google Sheets, SOP) và tuyệt đối không "bịa" câu trả lời (hallucination). Rất tốt khi cần tra cứu SOP, tài liệu khóa học nâng cao..
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-3xl h-fit border border-indigo-100 dark:border-indigo-800/30">
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">Tham gia cộng đồng AI</h3>
            <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-6">Nhận lộ trình cập nhật mới nhất về các công cụ AI, MMO và Xây khóa học mỗi tuần.</p>
            
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold"
              >
                <CheckCircle2 className="w-5 h-5" /> Đã đăng ký thành công!
              </motion.div>
            ) : (
              <form 
                className="flex flex-col sm:flex-row gap-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!email || isSubmitting) return;
                  setIsSubmitting(true);
                  try {
                    await googleSheetsService.submitLead(email, '', '', '[CoachAI Newsletter] Nhận Roadmap AI mỗi tuần');
                    await crmService.sendTransactionalEmail(
                      email,
                      '🎁 [CoachAI] Roadmap AI & Roadmap MMO dành cho bạn',
                      `
                        <h2 style="color: #4f46e5; margin-top: 0;">Chào mừng bạn đến với CoachAI Roadmap!</h2>
                        <p style="font-size: 16px;">Cảm ơn bạn đã đăng ký nhận lộ trình phát triển AI & MMO. Bạn đã thực hiện bước đi đúng đắn để làm chủ công nghệ và tạo ra thu nhập thụ động.</p>
                        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0;">
                          <p style="margin: 0;"><strong>🎁 Quà tặng kèm theo:</strong> Danh sách 50+ công cụ AI giúp X3 tốc độ làm việc (vừa cập nhật).</p>
                        </div>
                        <p style="font-size: 16px;">Hãy thường xuyên kiểm tra hòm thư để không bỏ lỡ các dự án thực chiến mới nhất từ CoachAI.</p>
                      `
                    );
                    setIsSuccess(true);
                    setEmail('');
                  } catch (err) {
                    console.error('Lỗi đăng ký Newsletter CoachAI:', err);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..." 
                  className="flex-1 px-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800/80 dark:text-white placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Nhận Roadmap <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
