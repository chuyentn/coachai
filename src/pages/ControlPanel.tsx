import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Control Panel — admin & teacher only
 * Embeds /control_panel.html (static Vite public file) in a full-screen iframe.
 * Authentication is handled here in React before the iframe loads.
 */
export const ControlPanel: React.FC = () => {
  const { profile, loading } = useAuth();
  const { t } = useTranslation();

  // Still loading auth state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f0f1a]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-900/40" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  // Not logged in → go sign in
  if (!profile) {
    return <Navigate to="/auth/signin?redirect=/control-panel" replace />;
  }

  // Student / affiliate → Access Denied
  if (profile.role !== 'admin' && profile.role !== 'teacher') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0f0f1a] text-center px-4">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6">
          <ShieldOff className="text-rose-500" size={36} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">{t('controlPanel.accessDenied')}</h1>
        <p className="text-slate-400 mb-8 max-w-sm">
          {t('controlPanel.accessDeniedDesc', { role: profile.role })}
        </p>
        <Link
          to={profile.role === 'student' ? '/dashboard/student' : '/'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
        >
          <ArrowLeft size={18} /> {t('controlPanel.backToDashboard')}
        </Link>
      </div>
    );
  }

  // Admin or Teacher → show full-screen iframe
  return (
    <div className="fixed inset-0 flex flex-col bg-[#0f0f1a]">
      {/* Slim top bar with back navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a2e] border-b border-[#2d2d50] z-10 flex-shrink-0">
        <Link
          to={profile.role === 'admin' ? '/dashboard/admin' : '/dashboard/teacher'}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          🎛️ Control Panel · {profile.role}
        </span>
        <a
          href="/control_panel.html"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          <ExternalLink size={13} /> {t('controlPanel.openNewTab')}
        </a>
      </div>

      {/* Full-height iframe */}
      <iframe
        src="/control_panel.html"
        title="Control Panel"
        className="flex-1 w-full border-0"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};
