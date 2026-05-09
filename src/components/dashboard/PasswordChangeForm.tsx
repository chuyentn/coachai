import React, { useState } from 'react';
import { auth } from '../../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';

export const PasswordChangeForm: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (!auth.currentUser) return;

    setLoading(true);
    setSuccess(false);

    try {
      await updatePassword(auth.currentUser, newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Password update error:', error);
      if (error.code === 'auth/requires-recent-login') {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại để đổi mật khẩu.');
      } else {
        alert('Lỗi: ' + (error.message || 'Không thể cập nhật mật khẩu.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
        <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
          <Lock size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bảo mật tài khoản</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Cập nhật mật khẩu mới cho tài khoản của bạn.</p>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
              <ShieldCheck size={20} />
              <p className="text-sm font-bold">Mật khẩu đã được cập nhật thành công!</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mật khẩu mới</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
};
