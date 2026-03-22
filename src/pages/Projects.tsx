import React, { useState, useEffect } from 'react';
import { Code2, ArrowUpRight, CheckCircle2, Zap, X, Send, User, Mail, Phone, Loader2, Search, Github, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { googleSheetsService } from '../services/googleSheetsService';
import { crmService } from '../services/crmService';

const CATEGORIES = ['Tất cả', 'AI Agent', 'SaaS', 'Bot', 'Dashboard', 'App Mobile'];

const FALLBACK_PROJECTS = [
  {
    title: 'AI Legal Agent',
    desc: 'Trợ lý pháp lý AI tự động soạn hợp đồng, phân tích rủi ro và tư vấn điều khoản bằng Claude + RAG vector search.',
    category: 'AI Agent',
    badge: 'HOT',
    tech: ['React', 'Claude AI', 'Supabase', 'Cloudflare'],
    preview_url: '',
    status: 'active',
    color: 'from-violet-600/20 to-purple-600/20',
    emoji: '⚖️',
  },
  {
    title: 'No-Code SaaS Builder',
    desc: 'Nền tảng SaaS multi-tenant xây bằng Google Sheets + Apps Script + Cloudflare Pages. 0 đồng server, deploy trong 1 giờ.',
    category: 'SaaS',
    badge: 'BÁN CHẠY',
    tech: ['Google Sheets', 'Apps Script', 'React', 'Cloudflare'],
    preview_url: '',
    status: 'active',
    color: 'from-blue-600/20 to-cyan-600/20',
    emoji: '🚀',
  },
  {
    title: 'Vibe Code Daily Bot',
    desc: 'Bot Telegram tự động gửi bài học, nhắc thực hành và tracking streak học viên. Tích hợp AI tạo nội dung mỗi ngày.',
    category: 'Bot',
    badge: 'NEW',
    tech: ['Telegram API', 'Google Sheets', 'Node.js', 'Gemini'],
    preview_url: '',
    status: 'active',
    color: 'from-emerald-600/20 to-teal-600/20',
    emoji: '🤖',
  },
  {
    title: 'AI Dashboard Analytics',
    desc: 'Dashboard phân tích dữ liệu real-time với AI insights tự động, kết nối Google Sheets và Gemini API.',
    category: 'Dashboard',
    badge: null,
    tech: ['React', 'Recharts', 'Gemini API', 'Google Sheets'],
    preview_url: '',
    status: 'active',
    color: 'from-orange-600/20 to-amber-600/20',
    emoji: '📊',
  },
  {
    title: 'Chrome AI Extension',
    desc: 'Extension trình duyệt dùng AI tóm tắt bài viết, dịch thuật và trả lời câu hỏi ngay trong tab đang mở.',
    category: 'App Mobile',
    badge: null,
    tech: ['Chrome Extension', 'Claude AI', 'TypeScript', 'Vite'],
    preview_url: '',
    status: 'active',
    color: 'from-rose-600/20 to-pink-600/20',
    emoji: '🧩',
  },
  {
    title: 'Multi-Agent Email CRM',
    desc: 'Hệ thống CRM email marketing tự động hóa hoàn toàn với AI agents, Resend API và Google Sheets backend.',
    category: 'SaaS',
    badge: null,
    tech: ['GAS', 'Resend API', 'Claude AI', 'React'],
    preview_url: '',
    status: 'active',
    color: 'from-indigo-600/20 to-blue-600/20',
    emoji: '✉️',
  },
];

const BADGE_COLORS: Record<string, string> = {
  'HOT': 'bg-rose-500/90 text-white',
  'BÁN CHẠY': 'bg-orange-500/90 text-white',
  'NEW': 'bg-emerald-500/90 text-white',
};

export const Projects = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState('');
  const isVip = profile?.role === 'vip' || profile?.role === 'admin';

  useEffect(() => {
    if (profile) { if (!name) setName(profile.full_name || ''); if (!email) setEmail(profile.email || ''); }
  }, [profile]);

  useEffect(() => {
    googleSheetsService.fetchProjects()
      .then(data => {
        const formatted = data.map(p => ({
          ...p,
          tech: typeof p.tech === 'string' ? p.tech.split(',').map((t: string) => t.trim()) : (p.tech || [])
        }));
        setProjects(formatted.length > 0 ? formatted : FALLBACK_PROJECTS);
      })
      .catch(() => setProjects(FALLBACK_PROJECTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => {
    const matchCat = activeCategory === 'Tất cả' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const openModal = (title: string) => {
    if (isVip) { window.open('https://github.com/vibe-code-ai?subject=' + encodeURIComponent(title), '_blank'); return; }
    setSelectedProject(title); setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      await googleSheetsService.submitLead(email, name, phone, `[Nhận Code Dự Án] ${selectedProject}`);
      try {
        await crmService.sendTransactionalEmail(email,
          `🎉 Yêu cầu Mã Nguồn: ${selectedProject}`,
          `<h2>Yêu cầu thành công!</h2><p>Chào <strong>${name || 'bạn'}</strong>, mã nguồn <strong>${selectedProject}</strong> sẽ được gửi qua email trong 24h.</p>`
        );
      } catch {}
      setIsSuccess(true);
    } catch { alert('Có lỗi xảy ra. Vui lòng thử lại.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#0B0E17]">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-[#0d0f1c] via-[#111827] to-[#0d0f1c] border-b border-white/5 pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Code2 size={12} /> Mã nguồn thực tế đang chạy
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4"
          >
            Dự Án{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Thực Chiến</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg mb-10 max-w-xl mx-auto"
          >
            Clone sản phẩm thật — từ AI Agent đến SaaS multi-tenant. Nhận mã nguồn, deploy và tùy chỉnh ngay.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Tìm dự án AI, SaaS, Bot..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-13 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500 text-sm font-medium transition-all pl-12"
            />
          </motion.div>
        </div>
      </div>

      {/* ── CATEGORY CHIPS ── */}
      <div className="sticky top-16 z-40 bg-[#0d0f1c]/95 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white bg-white/5'
              }`}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* ── PROJECT GRID ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {!loading && (
          <p className="text-sm text-slate-500 mb-6">
            <span className="text-white font-bold">{filtered.length}</span> dự án
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/5 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filtered.map((p, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className={`group relative bg-gradient-to-br ${p.color || 'from-indigo-600/10 to-purple-600/10'} border border-white/8 rounded-2xl overflow-hidden cursor-pointer hover:border-white/15 transition-all duration-300`}
                onClick={() => openModal(p.title)}
              >
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{p.emoji || '📦'}</div>
                    <div className="flex items-center gap-2">
                      {p.badge && (
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${BADGE_COLORS[p.badge] || 'bg-white/10 text-white'}`}>
                          {p.badge}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-white/10 text-slate-300 text-[10px] font-bold rounded-full">{p.category}</span>
                    </div>
                  </div>

                  {/* Title + Desc */}
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{p.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5 line-clamp-2">{p.desc}</p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {(p.tech || []).slice(0, 4).map((t: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/8 rounded-lg text-[11px] font-bold text-slate-400">
                        <Code2 size={9} className="text-slate-500" /> {t}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 size={13} /> Tải miễn phí
                    </span>
                    {isVip ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                        <Github size={13} /> Xem code
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                        Nhận Code <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 border border-emerald-500/15 text-center"
          >
            <Lock className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Truy cập toàn bộ mã nguồn ngay lập tức</h2>
            <p className="text-slate-400 mb-6">Đăng ký VIP để download code, xem video hướng dẫn và hỏi trực tiếp Coach 24/7.</p>
            <Link to="/auth/signup?plan=vip"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-600/25"
            >
              <Zap size={18} /> Đăng ký VIP Member
            </Link>
          </motion.div>
        )}
      </div>

      {/* ── LEAD MODAL ── */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#111827] rounded-3xl shadow-2xl border border-white/10 overflow-hidden z-10"
            >
              <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors z-20">
                <X size={18} />
              </button>

              {isSuccess ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Đã nhận yêu cầu!</h3>
                  <p className="text-slate-400 text-sm mb-6">Mã nguồn <strong className="text-white">{selectedProject}</strong> sẽ gửi đến <strong className="text-indigo-400">{email}</strong> trong 24h.</p>
                  <Link to="/auth/signup?plan=vip"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Zap size={16} /> Đăng ký VIP — nhận ngay
                  </Link>
                </div>
              ) : (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400"><Code2 size={22} /></div>
                    <div>
                      <h3 className="font-black text-white text-lg leading-tight">Nhận Mã Nguồn</h3>
                      <p className="text-slate-400 text-xs font-medium truncate max-w-[220px]">{selectedProject}</p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input required value={name} onChange={e => setName(e.target.value)} type="text"
                        placeholder="Họ và tên" className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500 text-sm font-medium transition-all" />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input required value={email} onChange={e => setEmail(e.target.value)} type="email"
                        placeholder="Email nhận code *" className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500 text-sm font-medium transition-all" />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
                        placeholder="Zalo / SĐT (tuỳ chọn)" className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500 text-sm font-medium transition-all" />
                    </div>
                    <button disabled={isSubmitting} type="submit"
                      className="w-full py-3.5 bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Gửi mã nguồn cho tôi</>}
                    </button>
                    <p className="text-center text-xs text-slate-500">🛡️ Cam kết không spam. Bảo mật thông tin.</p>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
