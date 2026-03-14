import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Github, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('Email của bạn chưa được xác nhận. Vui lòng kiểm tra hộp thư hoặc tắt yêu cầu xác nhận email trong Supabase Dashboard.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không chính xác.');
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      navigate('/dashboard/student');
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard/student`,
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F9FAFB] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h1>
          <p className="text-gray-500">Đăng nhập để tiếp tục hành trình học tập</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <Link to="/auth/reset" className="text-xs text-indigo-600 hover:underline">Quên mật khẩu?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Đăng nhập'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
          >
            <Chrome size={18} />
            Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
          >
            <Github size={18} />
            GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Chưa có tài khoản?{' '}
          <Link to="/auth/signup" className="text-indigo-600 font-semibold hover:underline">Đăng ký ngay</Link>
        </p>
      </motion.div>
    </div>
  );
};
