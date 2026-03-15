import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  BookOpen,
  Settings
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
      case 'instructor': return '/dashboard/instructor';
      default: return '/dashboard/student';
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-lg border-b border-slate-200 py-3' 
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
              <span className="font-black text-2xl tracking-tighter text-slate-900">CoachAI</span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-12 items-center">
            <form onSubmit={handleSearch} className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl text-sm font-medium transition-all"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </form>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-bold transition-colors ${
                location.pathname === '/'
                  ? 'text-indigo-600 underline underline-offset-4'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Khám phá
            </Link>
            
            {profile ? (
              <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-1 pr-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    <img 
                      src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} 
                      className="w-8 h-8 rounded-xl border border-white shadow-sm"
                      alt="Avatar"
                    />
                    <span className="text-xs font-bold text-slate-700">{profile.full_name?.split(' ').pop() || 'User'}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[110]"
                      >
                        <div className="px-4 py-3 border-b border-slate-50 mb-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tài khoản</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{profile.full_name}</p>
                        </div>
                        
                        <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <LayoutDashboard size={18} />
                          Dashboard
                        </Link>
                        {/* P4.5: /profile and /settings don't exist — redirect to dashboard instead */}
                        <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <User size={18} />
                          Hồ sơ cá nhân
                        </Link>
                        
                        <div className="border-t border-slate-50 mt-2 pt-2">
                          <button 
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <LogOut size={18} />
                            Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth/signin" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-all">Đăng nhập</Link>
                <Link to="/auth/signup" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">Đăng ký</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {profile && (
               <button className="p-2 text-slate-500 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
            )}
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
            className="fixed inset-0 top-[72px] bg-white z-[90] md:hidden overflow-y-auto"
          >
            <div className="p-6 space-y-8">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm khóa học..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl text-sm font-medium transition-all"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </form>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menu</p>
                <Link to="/" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl text-slate-900 font-bold">
                  <BookOpen size={20} className="text-indigo-600" />
                  Khám phá khóa học
                </Link>
                {profile ? (
                  <>
                    <Link to={getDashboardLink()} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl text-slate-900 font-bold">
                      <LayoutDashboard size={20} className="text-indigo-600" />
                      Dashboard
                    </Link>
                    <Link to="/profile" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl text-slate-900 font-bold">
                      <User size={20} className="text-indigo-600" />
                      Hồ sơ cá nhân
                    </Link>
                    <button 
                      onClick={handleSignOut} 
                      className="w-full flex items-center gap-4 p-4 bg-rose-50 rounded-2xl text-rose-600 font-bold"
                    >
                      <LogOut size={20} />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Link to="/auth/signin" className="flex items-center justify-center p-4 bg-slate-100 rounded-2xl text-slate-900 font-bold">Đăng nhập</Link>
                    <Link to="/auth/signup" className="flex items-center justify-center p-4 bg-indigo-600 rounded-2xl text-white font-bold">Đăng ký</Link>
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
