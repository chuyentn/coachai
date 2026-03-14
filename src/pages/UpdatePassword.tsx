import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert('Mật khẩu đã được cập nhật thành công!');
      navigate('/auth/signin');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F9FAFB] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
          <p className="text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="•••••••• (ít nhất 6 ký tự)"
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
            {loading ? <Loader2 className="animate-spin" /> : 'Cập nhật mật khẩu'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
