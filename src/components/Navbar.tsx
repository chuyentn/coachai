import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Zap, 
  Bell, 
  ChevronDown,
  User,
  Users,
  BookOpen,
  Settings,
  Sun,
  Moon,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    switch (profile.role) {
      case 'admin': return '/dashboard/admin';
      case 'teacher': return '/dashboard/teacher';
      default: return '/dashboard/student';
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <Zap className="text-white w-5 h-5" fill="currentColor" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white hidden sm:block">CoachAI</span>
            </Link>
          </div>

          {/* Desktop Search (Removed to optimize spacing) */}

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="inline-flex p-1.5 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl gap-1 mr-2">
              {[
                { label: t('common.courses'), href: '/courses', match: '/#courses' },
                { label: t('common.projects'), href: '/projects', match: '/projects' },
                { label: t('common.coaching'), href: '/coaching', match: '/coaching' },
                { label: t('common.affiliate'), href: '/affiliate', match: '/affiliate' },
                { label: t('common.pricing'), href: '/pricing', match: '/pricing' }
              ].map((item, idx) => {
                const isActive = location.pathname === item.href || (location.pathname + location.hash) === item.match;
                return (
                  <Link
                    key={idx}
                    to={item.href}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 transform scale-100'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 scale-95'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <LanguageSwitcher />
            
            {profile ? (
              <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-1 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    <img 
                      src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} 
                      className="w-8 h-8 rounded-xl border border-white shadow-sm"
                      alt="Avatar"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{profile.full_name?.split(' ').pop() || 'User'}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-[110]"
                      >
                        <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('common.accountNavbar')}</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.full_name}</p>
                        </div>
                        
                        <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <LayoutDashboard size={18} />
                          {t('common.dashboard')}
                        </Link>
                        
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <User size={18} />
                          {t('common.profile')}
                        </Link>

                        <Link to="/dashboard/affiliate" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                          <DollarSign size={18} />
                          Affiliate Center
                        </Link>
                        
                        <div className="border-t border-slate-50 dark:border-slate-800 mt-2 pt-2">
                          <button 
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <LogOut size={18} />
                            {t('common.signOut')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth/signin" className="px-3 xl:px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all whitespace-nowrap">{t('common.signIn')}</Link>
                <Link to="/auth/signup" className="px-4 xl:px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 whitespace-nowrap flex-shrink-0">{t('common.startFree')}</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {profile && (
               <button className="p-2 text-slate-500 relative hidden sm:block">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
            )}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <LanguageSwitcher />
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 text-slate-600 bg-slate-100 rounded-xl"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 top-[72px] bg-white dark:bg-slate-900 z-[90] md:hidden overflow-y-auto"
          >
            <div className="p-6 space-y-8">
              {/* Mobile Search Removed */}

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.menuNavbar')}</p>
                
                {[
                  { label: t('common.courses'), href: '/courses', icon: BookOpen },
                  { label: t('common.projects'), href: '/projects', icon: Zap },
                  { label: t('common.coaching'), href: '/coaching', icon: User },
                  { label: t('common.affiliate'), href: '/affiliate', icon: Users },
                  { label: t('common.pricing'), href: '/pricing', icon: BookOpen },
                ].map((item, idx) => (
                  <Link 
                    key={idx} 
                    to={item.href} 
                    className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-colors ${
                      location.pathname === item.href 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-300' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <item.icon size={20} className={location.pathname === item.href ? 'text-indigo-600' : 'text-slate-400'} />
                    {item.label}
                  </Link>
                ))}

                {profile ? (
                  <>
                    <Link to={getDashboardLink()} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold">
                      <LayoutDashboard size={20} className="text-indigo-600" />
                      {t('common.dashboard')}
                    </Link>
                    <Link to="/profile" className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold">
                      <User size={20} className="text-indigo-600" />
                      {t('common.profile')}
                    </Link>
                    <button 
                      onClick={handleSignOut} 
                      className="w-full flex items-center gap-4 p-4 bg-rose-50 rounded-2xl text-rose-600 font-bold"
                    >
                      <LogOut size={20} />
                      {t('common.signOut')}
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link to="/auth/signin" className="flex items-center justify-center p-4 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold transition-colors">{t('common.signIn')}</Link>
                    <Link to="/auth/signup" className="flex items-center justify-center p-4 bg-indigo-600 rounded-2xl text-white font-bold shadow-lg shadow-indigo-200 transition-all">{t('common.startFree')}</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
