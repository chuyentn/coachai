import React, { useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { crmService } from '../services/crmService';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Github, Chrome, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTranslation } from 'react-i18next';

export const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false); // P4.3
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  usePageTitle('Đăng ký');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Capture referral code from LocalStorage (set by App.tsx)
      const refCode = localStorage.getItem('aff_ref');

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: fullName });

      // Create Firestore profile
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        full_name: fullName,
        avatar_url: null,
        role: 'student',
        referred_by: refCode || null,
        created_at: new Date().toISOString(),
      });
      // Clear ref code after successful signup
      if (refCode) localStorage.removeItem('aff_ref');
      
      // Gửi email chào mừng thành viên mới
      try {
        await crmService.sendTransactionalEmail(
          email,
          `🏮 Chào mừng ${fullName} đến với CoachAI!`,
          `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4f46e5;">Chúc mừng bạn đã gia nhập CoachAI!</h2>
              <p>Chào <strong>${fullName}</strong>,</p>
              <p>Tài khoản học tập của bạn đã được khởi tạo thành công. Từ nay, bạn có thể truy cập vào kho tàng kiến thức về AI & Code thực chiến bất cứ lúc nào.</p>
              <div style="background: #eef2ff; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #4338ca;">🚀 Bắt đầu ngay:</h3>
                <ol>
                  <li>Hoàn thiện hồ sơ cá nhân.</li>
                  <li>Lựa chọn khóa học phù hợp với mục tiêu.</li>
                  <li>Sử dụng <strong>AI Coach Trợ Lý</strong> để giải đáp thắc mắc 24/7.</li>
                </ol>
              </div>
              <p>Nếu cần hỗ trợ, đừng ngần ngại reply email này hoặc liên hệ Mentor qua Zalo.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://edu.victorchuyen.net/dashboard/student" style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Vào Dashboard Học Viên</a>
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
              <p style="font-size: 12px; color: #94a3b8;">© 2026 CoachAI - Nền tảng học AI & Coaching hàng đầu Việt Nam.</p>
            </div>
          `
        );
      } catch (emailErr) {
        console.error('Lỗi khi gửi email chào mừng (SignUp):', emailErr);
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard/student'), 3000);
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError(t('auth.emailInUse'));
      } else if (err.code === 'auth/weak-password') {
        setError(t('auth.weakPassword'));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      // Check if profile exists, if not create it with ref code
      // The profile creation logic is handled in useAuth.ts
      // where we will also read from localStorage.
      
      navigate('/dashboard/student');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F9FAFB] dark:bg-slate-950 p-4 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-black/5 dark:shadow-indigo-500/5 border border-black/5 dark:border-slate-800 p-8 text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('auth.signUpSuccess')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
            {t('auth.signUpSuccessMsg', { name: fullName })}
          </p>
          <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium">
            <Loader2 className="animate-spin" size={18} />
            <span>{t('auth.redirecting')}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F9FAFB] dark:bg-slate-950 p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-black/5 dark:shadow-indigo-500/5 border border-black/5 dark:border-slate-800 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.createAccount')}</h1>
          <p className="text-gray-500 dark:text-slate-400">{t('auth.startJourney')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 ml-1">{t('auth.fullName')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder={t('auth.namePlaceholder')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 ml-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 ml-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder={t('auth.pwdPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : t('auth.signUpBtn')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-gray-500 dark:text-slate-400">{t('auth.orSignUpWith')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-medium text-sm text-slate-700 dark:text-slate-300"
          >
            <Chrome size={18} />
            Google
          </button>
          <button
            onClick={() => setError(t('auth.githubSignUpError'))}
            className="flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-medium text-sm text-slate-700 dark:text-slate-300"
          >
            <Github size={18} />
            GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/auth/signin" className="text-indigo-600 font-semibold hover:underline">{t('auth.signInBtn')}</Link>
        </p>
      </motion.div>
    </div>
  );
};
