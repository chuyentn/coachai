import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AICoachProps {
  courseTitle: string;
  lessonTitle: string;
}

export const AICoach: React.FC<AICoachProps> = ({ courseTitle, lessonTitle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Chào bạn! Tôi là AI Coach của bạn cho khóa học "${courseTitle}". Bạn có thắc mắc gì về bài học "${lessonTitle}" không?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // P1.6 Fix: Call server-side endpoint instead of using Gemini SDK directly on the client.
      // This keeps the GEMINI_API_KEY secret — it never leaves the server.
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, courseTitle, lessonTitle }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const aiText = data.text || "Xin lỗi, tôi gặp chút trục trặc. Bạn có thể thử lại không?";
      
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error('AI Coach Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Tôi đang bận một chút, hãy thử lại sau nhé!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Coach Assistant</h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <Sparkles size={16} className="text-indigo-400" />
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-white/10'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/5">
                <Loader2 size={16} className="animate-spin text-indigo-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/20">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI Coach về bài học..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          AI có thể nhầm lẫn. Hãy kiểm tra lại thông tin quan trọng.
        </p>
      </form>
    </div>
  );
};
