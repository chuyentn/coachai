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
  DollarSign,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
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
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 origin-left z-[110]"
        style={{ scaleX }}
      />
      
      <nav className={`fixed left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${
        isScrolled 
          ? 'top-4 w-[calc(100%-2rem)] max-w-7xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/10 rounded-3xl py-3 px-2' 
          : 'top-0 w-full bg-transparent py-6 px-4'
      }`}>
        <div className="max-w-7xl mx-auto w-full px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Zap className="text-white w-5 h-5" fill="currentColor" />
                </div>
                <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white hidden sm:block bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">CoachAI</span>
              </Link>
            </div>

            {/* Desktop Search (Removed to optimize spacing) */}

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">
              <nav className="inline-flex p-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl gap-1 mr-2 border border-white/20 dark:border-slate-700/30">
                {[
                  { label: t('common.courses'), href: '/courses', match: '/#courses' },
                  { label: 'AI Hub', href: '/coachai', match: '/coachai' },
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
                          ? 'bg-white dark:bg-slate-700 shadow-sm transform scale-100 border border-slate-200/50 dark:border-slate-600/50 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 scale-95'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-2xl transition-all"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <LanguageSwitcher />
              
              {profile ? (
                <div className="flex items-center gap-4">
                  <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  </button>

                  <div className="relative">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-3 p-1 pr-4 bg-white/80 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm shadow-slate-200/50 dark:shadow-none"
                    >
                      <img 
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} 
                        className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover"
                        alt="Avatar"
                      />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{profile.full_name?.split(' ').pop() || 'User'}</span>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="absolute right-0 mt-4 w-60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 dark:border-slate-700/50 py-3 z-[110]"
                        >
                          <div className="px-5 py-3 border-b border-slate-100/50 dark:border-slate-800/50 mb-2">
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{t('common.accountNavbar')}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{profile.full_name}</p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{profile.email}</p>
                          </div>
                          
                          <div className="px-2 space-y-1">
                            <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                              <LayoutDashboard size={18} />
                              {t('common.dashboard')}
                            </Link>
                            {/* P4.5: /profile and /settings don't exist — redirect to dashboard instead */}
                            <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                              <User size={18} />
                              {t('common.profile')}
                            </Link>

                            <Link to="/dashboard/affiliate" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
                              <DollarSign size={18} />
                              Affiliate Center
                            </Link>
                          </div>
                          
                          <div className="border-t border-slate-100/50 dark:border-slate-800/50 mt-2 mx-4 pt-2">
                            <button 
                              onClick={handleSignOut}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
                            >
                              <LogOut size={16} strokeWidth={2.5}/>
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
                  <Link to="/auth/signin" className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-2xl transition-all whitespace-nowrap">{t('common.signIn')}</Link>
                  <Link 
                    to="/auth/signup" 
                    className="relative px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/20 whitespace-nowrap flex-shrink-0 overflow-hidden group"
                  >
                    <span className="relative z-10">{t('common.startFree')}</span>
                    <div className="absolute inset-0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] bg-white/20 dark:bg-slate-900/20 transition-transform duration-700" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              {profile && (
                 <button className="p-2.5 text-slate-500 relative hidden sm:block">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>
              )}
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-2xl transition-all"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <LanguageSwitcher />
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2.5 text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl"
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
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 top-[72px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-[90] md:hidden overflow-y-auto"
          >
            {/* Gradient accent strip */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
            <div className="p-6 space-y-8">
              {/* Mobile Search Removed */}

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-4">{t('common.menuNavbar')}</p>
                
                {[
                  { label: t('common.courses'), href: '/courses', icon: BookOpen },
                  { label: 'AI Hub', href: '/coachai', icon: Sparkles },
                  { label: t('common.projects'), href: '/projects', icon: Zap },
                  { label: t('common.coaching'), href: '/coaching', icon: User },
                  { label: t('common.affiliate'), href: '/affiliate', icon: Users },
                  { label: t('common.pricing'), href: '/pricing', icon: BookOpen },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <Link 
                      to={item.href} 
                      className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-colors ${
                        location.pathname === item.href 
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${location.pathname === item.href ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-white dark:bg-slate-700'}`}>
                        <item.icon size={18} className={location.pathname === item.href ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                      </div>
                      {item.label}
                    </Link>
                  </motion.div>
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
    </>
  );
};
