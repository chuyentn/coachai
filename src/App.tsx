import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LeadPopup } from './components/LeadPopup';
import { SalesNotification } from './components/ui/SalesNotification';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { useAuth } from './hooks/useAuth';
import { db } from './lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

// P3.2: Lazy-load all page components for code splitting.
// Each page becomes a separate JS chunk — users only download what they visit.
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const SignIn = lazy(() => import('./pages/SignIn').then(m => ({ default: m.SignIn })));
const SignUp = lazy(() => import('./pages/SignUp').then(m => ({ default: m.SignUp })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword').then(m => ({ default: m.UpdatePassword })));
const CourseDetails = lazy(() => import('./pages/CourseDetails').then(m => ({ default: m.CourseDetails })));
const Courses = lazy(() => import('./pages/Courses').then(m => ({ default: m.Courses })));
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const TeacherDashboard = lazy(() => import('./pages/dashboard/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TeacherRegistration = lazy(() => import('./pages/TeacherRegistration').then(m => ({ default: m.TeacherRegistration })));
const AffiliateDashboard = lazy(() => import('./pages/dashboard/AffiliateDashboard').then(m => ({ default: m.AffiliateDashboard })));
const LearningPlayer = lazy(() => import('./pages/LearningPlayer').then(m => ({ default: m.LearningPlayer })));
const Pricing = lazy(() => import('./pages/Pricing').then(m => ({ default: m.Pricing })));
const Affiliate = lazy(() => import('./pages/Affiliate').then(m => ({ default: m.Affiliate })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Projects = lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })));
const Payment = lazy(() => import('./pages/Payment').then(m => ({ default: m.default })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const CoachAI = lazy(() => import('./pages/CoachAI').then(m => ({ default: m.CoachAI })));

// Premium Page loading fallback
const PageLoader = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-[#F9FAFB] dark:bg-[#0B0E17] gap-4">
    <div className="relative">
      <div className="w-14 h-14 rounded-full border-4 border-indigo-100 dark:border-indigo-900/40" />
      <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
      <div className="absolute inset-2 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 animate-pulse" />
    </div>
    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">Đang tải...</p>
  </div>
);

// Smart toast state lives at module scope so ProtectedRoute can trigger it
let _toastFn: ((msg: string) => void) | null = null;

const RoleToast = () => {
  const [msg, setMsg] = React.useState('');
  _toastFn = setMsg;
  if (!msg) return null;
  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-2xl shadow-rose-600/30 animate-in slide-in-from-top-4 duration-300"
      onClick={() => setMsg('')}
    >
      <span>🚫</span>
      <span>{msg}</span>
    </div>
  );
};

const ROLE_DASHBOARD: Record<string, string> = {
  admin: '/dashboard/admin',
  teacher: '/dashboard/teacher',
  student: '/dashboard/student',
};

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { profile, loading } = useAuth();

  if (loading) return null;
  if (!profile) return <Navigate to="/auth/signin" />;

  if (role && profile.role !== role) {
    // Toast fires after render
    setTimeout(() => {
      _toastFn?.(`Bạn không có quyền truy cập trang này (cần role: ${role})`);
      setTimeout(() => _toastFn?.(''), 4000);
    }, 0);
    const redirectTo = ROLE_DASHBOARD[profile.role] || '/dashboard/student';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default function App() {
  React.useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  return (
    <Router>
      <GoogleAnalytics />
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0B0E17] font-sans text-gray-900 dark:text-slate-300 transition-colors duration-300">
      <RoleToast />
        <Navbar />
        <LeadPopup />
        <SalesNotification />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coachai" element={<CoachAI />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
            <Route path="/auth/update-password" element={<UpdatePassword />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/coaching" element={<Contact />} />
            <Route path="/payment" element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={<Projects />} />
            <Route 
              path="/learn/:id" 
              element={
                <ProtectedRoute>
                  <LearningPlayer />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/teach" 
              element={<TeacherRegistration />} 
            />

            <Route 
              path="/dashboard/student" 
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/affiliate" 
              element={
                <ProtectedRoute>
                  <AffiliateDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/dashboard/teacher" 
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Role Shortcut Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher" 
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

