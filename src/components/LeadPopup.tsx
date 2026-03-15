import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Phone, User, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import { googleSheetsService } from '../services/googleSheetsService';

export const LeadPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    note: ''
  });

  useEffect(() => {
    // Show popup after 5 seconds if not submitted before
    const hasSubmitted = localStorage.getItem('lead_submitted');
    if (!hasSubmitted) {
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await googleSheetsService.submitLead(
        formData.email,
        formData.name,
        formData.phone,
        formData.note
      );
      if (success) {
        setSubmitted(true);
        localStorage.setItem('lead_submitted', 'true');
        setTimeout(() => setIsOpen(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        // P2.4 Fix: The backdrop is now a child inside AnimatePresence-animated element,
        // so it disappears atomically with the modal — no lingering invisible overlay.
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-black/5"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={20} className="text-gray-400" />
            </button>

            {!submitted ? (
              <div className="p-8 md:p-12">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Đăng ký tư vấn Coaching</h2>
                  <p className="text-gray-500 mt-2">Để lại thông tin để nhận lộ trình học tập 1:1 cùng chuyên gia AI.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="Họ và tên"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      type="email"
                      placeholder="Email liên hệ"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      type="tel"
                      placeholder="Số điện thoại"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
                    <select
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    >
                      <option value="">Chọn nhu cầu học tập</option>
                      <option value="Coaching 1:1 - Vibe Code AI">Coaching 1:1 - Vibe Code AI</option>
                      <option value="Coaching 1:1 - AI Automation">Coaching 1:1 - AI Automation</option>
                      <option value="Coaching 1:1 - AI Master Prompt">Coaching 1:1 - AI Master Prompt</option>
                      <option value="Coaching 1:1 - Video AI Marketing">Coaching 1:1 - Video AI Marketing</option>
                      <option value="Video Online - Trọn bộ AI">Video Online - Trọn bộ AI</option>
                      <option value="Khác">Nhu cầu khác...</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 disabled:opacity-50"
                  >
                    {loading ? 'Đang gửi...' : 'Nhận tư vấn ngay'}
                    <Send size={18} />
                  </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                  Cam kết bảo mật thông tin 100%. Chúng tôi sẽ liên hệ lại trong vòng 24h.
                </p>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Gửi thành công!</h2>
                <p className="text-gray-500 mt-4">
                  Cảm ơn bạn đã quan tâm. Đội ngũ Edu Victor Chuyen sẽ liên hệ với bạn sớm nhất.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
