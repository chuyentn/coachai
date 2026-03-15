import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LeadPopup } from './components/LeadPopup';
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
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const InstructorDashboard = lazy(() => import('./pages/dashboard/InstructorDashboard').then(m => ({ default: m.InstructorDashboard })));
const LearningPlayer = lazy(() => import('./pages/LearningPlayer').then(m => ({ default: m.LearningPlayer })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Page loading fallback
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { profile, loading } = useAuth();

  if (loading) return null;
  if (!profile) return <Navigate to="/auth/signin" />;
  if (role && profile.role !== role) return <Navigate to="/" />;

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
      <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
        <Navbar />
        <LeadPopup />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
            <Route path="/auth/update-password" element={<UpdatePassword />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route 
              path="/learn/:id" 
              element={
                <ProtectedRoute>
                  <LearningPlayer />
                </ProtectedRoute>
              } 
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
              path="/dashboard/instructor" 
              element={
                <ProtectedRoute role="instructor">
                  <InstructorDashboard />
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

