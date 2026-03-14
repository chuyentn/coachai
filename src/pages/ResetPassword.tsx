import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
          <p className="text-gray-500">Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Kiểm tra email của bạn</h3>
              <p className="text-gray-500">Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới <b>{email}</b></p>
            </div>
            <Link 
              to="/auth/signin" 
              className="block w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Gửi yêu cầu'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Nhớ ra mật khẩu?{' '}
              <Link to="/auth/signin" className="text-indigo-600 font-semibold hover:underline">Đăng nhập ngay</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};
