import React, { useState } from 'react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Github, Chrome, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTranslation } from 'react-i18next';

export const SignIn: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // P4.3
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  usePageTitle('Đăng nhập');

  const redirectByRole = async (uid: string) => {
    try {
      const profileDoc = await getDoc(doc(db, 'users', uid));
      const role = profileDoc.exists() ? profileDoc.data().role : 'student';
      
      if (role === 'admin') {
        navigate('/dashboard/admin');
      } else if (role === 'teacher') {
        navigate('/dashboard/teacher');
      } else {
        navigate('/dashboard/student');
      }
    } catch {
      navigate('/dashboard/student');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await redirectByRole(result.user.uid);
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(t('auth.invalidError'));
      } else if (err.code === 'auth/user-disabled') {
        setError(t('auth.disabledError'));
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
      const result = await signInWithPopup(auth, googleProvider);
      await redirectByRole(result.user.uid);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F9FAFB] dark:bg-slate-950 p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-black/5 dark:shadow-indigo-500/5 border border-black/5 dark:border-slate-800 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.welcome')}</h1>
          <p className="text-gray-500 dark:text-slate-400">{t('auth.welcomeSub')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 ml-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('auth.password')}</label>
              <Link to="/auth/reset" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{t('auth.forgotPassword')}</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
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
            {loading ? <Loader2 className="animate-spin" /> : t('auth.signInBtn')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-gray-500 dark:text-slate-400">{t('auth.orContinueWith')}</span>
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
            onClick={() => setError(t('auth.githubError'))}
            className="flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-medium text-sm text-slate-700 dark:text-slate-300"
          >
            <Github size={18} />
            GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          {t('auth.noAccount')}{' '}
          <Link to="/auth/signup" className="text-indigo-600 font-semibold hover:underline">{t('auth.signUpNow')}</Link>
        </p>
      </motion.div>
    </div>
  );
};
