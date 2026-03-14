import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, LogOut, Menu, X, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-black/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight">CourseMarket <span className="text-indigo-600">VN</span></span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-black font-medium transition-colors">Khám phá</Link>
            {profile ? (
              <>
                <Link 
                  to={profile.role === 'admin' ? '/dashboard/admin' : profile.role === 'instructor' ? '/dashboard/instructor' : '/dashboard/student'} 
                  className="flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/auth/signin" className="text-gray-600 hover:text-black font-medium">Đăng nhập</Link>
                <Link to="/auth/signup" className="bg-black text-white px-5 py-2 rounded-xl font-medium hover:bg-gray-800 transition-all">Đăng ký</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-black/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" className="block px-3 py-2 text-gray-600 font-medium">Khám phá</Link>
              {profile ? (
                <>
                  <Link 
                    to={profile.role === 'admin' ? '/dashboard/admin' : profile.role === 'instructor' ? '/dashboard/instructor' : '/dashboard/student'} 
                    className="block px-3 py-2 text-gray-600 font-medium"
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 text-red-500 font-medium">Đăng xuất</button>
                </>
              ) : (
                <>
                  <Link to="/auth/signin" className="block px-3 py-2 text-gray-600 font-medium">Đăng nhập</Link>
                  <Link to="/auth/signup" className="block px-3 py-2 text-indigo-600 font-medium">Đăng ký</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
