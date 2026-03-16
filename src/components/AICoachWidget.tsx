import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, X, MessageCircle, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const MAX_FREE_QUESTIONS = 3;

const DEMO_RESPONSES: Record<string, string> = {
  default: "Câu hỏi hay đấy! 🎯 Để tối ưu dự án AI của bạn, tôi khuyên bạn nên bắt đầu với Make.com hoặc n8n để tự động hóa workflow, sau đó kết nối với ChatGPT API. Tất cả đều có sẵn mã nguồn trong kho Projects của chúng tôi!",
  ai: "AI No-Code là xu hướng 2026! 🚀 Bạn có thể xây chatbot, auto-post, voice AI mà không cần viết 1 dòng code nào. Trên nền tảng CoachAI, mỗi dự án đều có source code đầy đủ để bạn clone về và chạy ngay.",
  code: "Bạn hoàn toàn không cần biết code! 💡 Các công cụ No-Code như Typebot, Make.com, Vapi cho phép bạn kéo thả tạo app AI. Chúng tôi có hơn 120+ dự án mẫu kèm hướng dẫn step-by-step.",
  money: "Kiếm tiền với AI rất thực tế! 💰 Bạn có thể xây chatbot bán cho doanh nghiệp, tạo hệ thống auto marketing, hoặc tham gia chương trình Affiliate của chúng tôi với hoa hồng lên đến 50%.",
};

function getSmartResponse(userMsg: string): string {
  const msg = userMsg.toLowerCase();
  if (msg.includes('ai') || msg.includes('trí tuệ') || msg.includes('chatbot') || msg.includes('tự động')) return DEMO_RESPONSES.ai;
  if (msg.includes('code') || msg.includes('lập trình') || msg.includes('viết code') || msg.includes('không biết code')) return DEMO_RESPONSES.code;
  if (msg.includes('tiền') || msg.includes('kiếm') || msg.includes('thu nhập') || msg.includes('affiliate')) return DEMO_RESPONSES.money;
  return DEMO_RESPONSES.default;
}

export const AICoachWidget: React.FC = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Chào bạn! 👋 Tôi là AI Coach của CoachAI. Bạn có thể hỏi tôi 3 câu miễn phí về AI, No-Code, hoặc cách kiếm tiền online. Hỏi gì nào?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || (!profile && questionsUsed >= MAX_FREE_QUESTIONS)) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);
    const newCount = questionsUsed + 1;
    setQuestionsUsed(newCount);

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

    const aiText = getSmartResponse(userMessage);
    setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    setLoading(false);

    // If they've used all questions, show upgrade message after a short delay
    if (!profile && newCount >= MAX_FREE_QUESTIONS) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'model',
          text: '🔒 Bạn đã dùng hết 3 câu hỏi miễn phí! Đăng ký tài khoản FREE để tiếp tục chat với AI Coach không giới hạn, hoặc nâng cấp VIP để được Coach 1:1 cá nhân hóa.'
        }]);
      }, 1500);
    }
  };

  const questionsLeft = !profile ? MAX_FREE_QUESTIONS - questionsUsed : '∞';
  const isLimitReached = !profile && questionsUsed >= MAX_FREE_QUESTIONS;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[80] w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full shadow-2xl shadow-indigo-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform group"
          >
            <MessageCircle size={28} className="group-hover:hidden" />
            <Sparkles size={28} className="hidden group-hover:block animate-pulse" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20" />
            {/* Badge */}
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[80] w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] bg-white dark:bg-[#111623] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Coach Trợ Lý</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Online • {questionsLeft} câu còn lại</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white ${
                      msg.role === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-br from-violet-600 to-indigo-600'
                    }`}>
                      {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white">
                      <Bot size={12} />
                    </div>
                    <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input or CTA */}
            {isLimitReached ? (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0E17] space-y-2.5">
                <Link 
                  to="/auth/signup" 
                  className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  <Zap size={16} fill="currentColor" /> Đăng ký FREE – Chat không giới hạn
                </Link>
                <Link 
                  to="/auth/signup?plan=vip" 
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-orange-200 dark:shadow-none"
                >
                  Nâng cấp VIP – Coaching 1:1 <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111623]">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi AI Coach bất kỳ điều gì..."
                    className="w-full bg-slate-50 dark:bg-[#151A2D] border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-40"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
