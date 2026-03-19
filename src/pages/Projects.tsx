import React, { useState, useEffect } from 'react';
import { Code2, Terminal, ArrowUpRight, CheckCircle2, Zap, X, Send, User, Mail, Phone, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { googleSheetsService } from '../services/googleSheetsService';
import { crmService } from '../services/crmService';

export const Projects = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isVip = profile?.role === 'vip' || profile?.role === 'admin';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await googleSheetsService.fetchProjects();
      // Tech field might be a comma-separated string in Sheet
      const formatted = data.map(p => ({
        ...p,
        tech: typeof p.tech === 'string' ? p.tech.split(',').map((t: string) => t.trim()) : p.tech
      }));
      setProjects(formatted);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Unable to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState('');

  React.useEffect(() => {
    if (profile) {
      if (!name) setName(profile.full_name || '');
      if (!email) setEmail(profile.email || '');
    }
  }, [profile]);

  const openModal = (title: string) => {
    if (isVip) {
      // Nếu là VIP thì mở thẳng mã nguồn Github!
      window.open('https://github.com/vibe-code-ai?subject=' + encodeURIComponent(title), '_blank');
      return;
    }
    setSelectedProject(title);
    setIsSuccess(false);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await googleSheetsService.submitLead(
        email,
        name,
        phone,
        `[Nhận Code Dự Án] ${selectedProject}`
      );
      // Trigger the backend Cloudflare function to send a welcome email via Resend
      try {
        await crmService.sendTransactionalEmail(
          email,
          `🎉 [${import.meta.env.VITE_APP_NAME || 'CoachAI'}] Yêu cầu Mã Nguồn: ${selectedProject}`,
          `
            <h2 style="color: #4f46e5; margin-top: 0;">Yêu cầu mã nguồn thành công!</h2>
            <p>Chào <strong>${name || 'bạn'}</strong>,</p>
            <p>Cảm ơn bạn đã quan tâm và đăng ký nhận bản quyền mã nguồn cho dự án: <br/>
              <strong style="color: #e11d48; font-size: 18px; display: inline-block; margin-top: 5px;">🏆 ${selectedProject}</strong>
            </p>
            <div style="background-color: #f8fafc; padding: 20px; border-left: 5px solid #4f46e5; margin: 25px 0; border-radius: 0 8px 8px 0;">
               <h3 style="margin-top: 0; color: #0f172a;">🔥 Trạng Thái: Đã Tiếp Nhận</h3>
               <p style="margin-bottom: 0;">Yêu cầu của bạn đã được ghi nhận vào hệ thống CRM. Mentor sẽ liên hệ nhanh với bạn qua Zalo/SĐT để gửi bộ File Source Code và Hướng dẫn Deploy an toàn trong vòng 24h tới.</p>
            </div>
          `
        );
      } catch (emailErr) {
        console.error('Lỗi khi gửi email chào mừng (Resend API):', emailErr);
        // We don't block the UI success state if only the email fails
      }

      // Because of no-cors for Google Sheets, we assume success if no catch on the first fetch
      setIsSuccess(true);

    } catch (error) {
      console.error('Lỗi khi gửi thông tin lấy mã nguồn:', error);
      alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0B0E17] font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="pt-28 pb-16 text-center relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl text-indigo-600 dark:text-indigo-400 mb-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <Terminal size={28} className="md:w-8 md:h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">{t('projects.title')} <span className="text-indigo-600 dark:text-indigo-400">{t('projects.titleHighlight')}</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            {t('projects.description')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-24 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Đang tải dự án thực chiến...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-rose-50 rounded-[3rem] border border-rose-100">
            <p className="text-rose-600 mb-6 font-bold">{error}</p>
            <button 
              onClick={fetchProjects}
              className="px-10 py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all font-black"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {projects.map((p, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/80 dark:bg-[#111623]/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest">{p.category}</div>
                {p.badge && (
                  <div className="px-2 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-md text-[10px] font-black uppercase shadow-lg shadow-rose-500/30">
                    {p.badge}
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all">
                {p.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8 h-24">
                {p.desc}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {p.tech.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-800/50 transition-colors">
                    <Code2 size={12} className="inline mr-1 text-slate-400 group-hover:text-indigo-400" /> {t}
                  </span>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-sm font-bold">
                  <CheckCircle2 size={16} /> Tải miễn phí
                </span>
                <button onClick={() => openModal(p.title)} className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover:bg-indigo-600 group-hover:text-white flex items-center gap-2 font-black transition-all text-sm shadow-xl shadow-slate-900/10 dark:shadow-white/10 group-hover:shadow-indigo-600/30">
                  Nhận Code <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        <div className="mt-20 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline">
            {t('projects.backHome')}
          </Link>
        </div>
      </div>

      {/* Lead Magnet Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111623] rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10"
            >
              <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors z-20">
                <X size={20} />
              </button>

              {isSuccess ? (
                <div className="p-10 text-center relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Thành công!</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                    Mã nguồn của <strong>{selectedProject}</strong> đang được đóng gói và gửi đến hộp thư <strong>{email}</strong>. Vui lòng kiểm tra email của bạn sau ít phút.
                  </p>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-4 uppercase tracking-widest">Ưu đãi độc quyền</p>
                  <div className="bg-slate-50 dark:bg-[#1A1F32] p-6 rounded-2xl mb-2 text-left">
                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-4 leading-relaxed">
                      Nhận ngay <strong className="text-indigo-600 dark:text-indigo-400">toàn bộ mã nguồn thực tế đang chạy</strong>, kèm tài liệu hướng dẫn setup chi tiết A-Z và quyền lợi hỏi đáp trực tiếp cùng Coach. Xây app AI chưa bao giờ dễ đến thế.
                    </p>
                    <Link to={profile ? "/payment?plan=vip" : "/auth/signup?plan=vip"} className="flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-opacity">
                      Đăng ký VIP Member ngay
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-inner">
                      <Zap size={24} fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Nhận Mã Nguồn Miễn Phí</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-1 max-w-[200px] truncate">{selectedProject}</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Họ và tên</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input required value={name} onChange={(e)=>setName(e.target.value)} type="text" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-[#151A2D] border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium" placeholder="Nguyễn Văn A" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Email nhận Code <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input required value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-[#151A2D] border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium" placeholder="email@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Zalo / SĐT (Tùy chọn)</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input value={phone} onChange={(e)=>setPhone(e.target.value)} type="tel" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-[#151A2D] border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium" placeholder="09xx.xxx.xxx" />
                      </div>
                    </div>
                    
                    <button disabled={isSubmitting} type="submit" className="w-full mt-4 py-4 bg-indigo-600 disabled:bg-indigo-400 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
                      {isSubmitting ? 'Đang đóng gói...' : 'Gửi mã nguồn cho tôi'} <Send size={18} />
                    </button>
                    <p className="text-center text-xs font-medium text-slate-400 mt-4 leading-relaxed tracking-wide">🛡️ Cam kết không gửi thư rác. Thông tin bảo mật.</p>
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
