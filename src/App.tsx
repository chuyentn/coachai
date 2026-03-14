import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ResetPassword } from './pages/ResetPassword';
import { UpdatePassword } from './pages/UpdatePassword';
import { CourseDetails } from './pages/CourseDetails';
import { StudentDashboard } from './pages/dashboard/StudentDashboard';
import { InstructorDashboard } from './pages/dashboard/InstructorDashboard';
import { LearningPlayer } from './pages/LearningPlayer';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { profile, loading } = useAuth();

  if (loading) return null;
  if (!profile) return <Navigate to="/auth/signin" />;
  if (role && profile.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
        <Navbar />
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
          
          {/* Add more routes as needed */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
