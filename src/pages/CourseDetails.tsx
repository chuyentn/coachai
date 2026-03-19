import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Course, Enrollment, Lesson } from '../types';
import { useAuth } from '../hooks/useAuth';
import { googleSheetsService } from '../services/googleSheetsService';
import { CheckCircle2, Lock, PlayCircle, ShieldCheck, Clock, Award, Loader2, MessageSquare, Send, User as UserIcon, List, FileText, FileBox, Calendar, CreditCard, Share2, AlertTriangle, X, Eye, EyeOff, Star } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTranslation } from 'react-i18next';

export const CourseDetails: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null); // P4.7: inline error
  const [activeTab, setActiveTab] = useState<'curriculum' | 'resources' | 'notes' | 'coaching'>('curriculum');
  const [showAccessDenied, setShowAccessDenied] = useState(searchParams.get('access') === 'denied'); // P4.2

  // P3.6 + P4.1: Dynamic page title
  usePageTitle(course ? course.title : t('courseDetails.pageTitle'));

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      fetchComments();
    }
  }, [id, profile]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const allCourses = await googleSheetsService.fetchCourses();
      const courseData = allCourses.find(c => String(c.id) === String(id));

      if (courseData) {
        setCourse(courseData);
        // Fetch detailed lessons from the new lessons sheet
        const lessonsData = await googleSheetsService.fetchLessons(id);
        if (lessonsData && lessonsData.length > 0) {
          setLessons(lessonsData);
        } else if (courseData.modules && Array.isArray(courseData.modules)) {
          // Fallback to legacy modules column if lessons sheet is empty
          setLessons(courseData.modules.map((m: any) => ({
            id: m.id,
            course_id: id,
            chapter: 'Tổng quan',
            title: isEn && m.title_en ? m.title_en : m.title,
            video_url: m.video_url,
            order: m.order,
            is_free: false
          })) as Lesson[]);
        }
      }

      if (profile && id) {
        const enrollDocRef = doc(db, 'enrollments', `${profile.id}_${id}`);
        const enrollDocSnap = await getDoc(enrollDocRef);
        if (enrollDocSnap.exists()) {
          setEnrollment(enrollDocSnap.data() as Enrollment);
        }
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    const data = await googleSheetsService.fetchComments(id);
    setComments(data);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !id || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const success = await googleSheetsService.submitComment(
        id,
        profile.id,
        profile.full_name,
        newComment,
        profile.email,
        profile.avatar_url || undefined
      );

      if (success) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEnroll = async () => {
    if (!profile) {
      navigate('/auth/signin');
      return;
    }

    setPaying(true);
    // Redirect cleanly to the central Payment page
    navigate(`/payment?plan=course&courseId=${course?.id}&amount=${course?.price_vnd}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{t('courseDetails.notFound')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{t('courseDetails.notFoundDesc')}</p>
        <button onClick={() => navigate('/')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
          {t('courseDetails.viewOtherCourses')}
        </button>
      </div>
    </div>
  );

  const isEnrolled = enrollment?.status === 'completed';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 transition-colors duration-300">
      {/* P4.2: Access Denied Banner */}
      {showAccessDenied && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-[72px] left-0 right-0 z-50 flex items-center justify-between gap-4 bg-amber-500 text-white px-6 py-3 shadow-lg"
        >
          <div className="flex items-center gap-3 font-bold text-sm">
            <AlertTriangle size={18} />
            {t('courseDetails.accessDenied')}
          </div>
          <button onClick={() => setShowAccessDenied(false)} className="p-1 hover:bg-amber-600 rounded-lg transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </motion.div>
      )}
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,0.4),transparent_70%)]"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_100%_100%,_rgba(139,92,246,0.3),transparent_70%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest">
                <ShieldCheck size={14} />
                <span>{course?.level || t('courseDetails.specialBadge')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-black uppercase tracking-widest">
                <Star size={14} fill="currentColor" />
                <span>{course?.rating_avg || course?.avg_rating || 4.8}</span>
                <span className="text-[10px] opacity-60">({course?.rating_count || 128} đánh giá)</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-[1.1] tracking-tight break-words">
              {isEn && course.title_en ? course.title_en : course.title}
            </h1>
            <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed max-w-xl break-words">
              {isEn && course.description_en ? course.description_en : course.description}
            </p>
            <div className="flex flex-wrap items-center gap-8 text-sm text-slate-300 font-medium">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Clock size={18} className="text-indigo-400" />
                </div>
                <span>{course?.duration_text || t('courseDetails.lessonsCount', { count: lessons.length })}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Award size={18} className="text-indigo-400" />
                </div>
                <span>{t('courseDetails.certBadge')}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/1200/675`} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt={course.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center group-hover:bg-slate-900/20 transition-all duration-500">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl transform group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-12 h-12 text-white fill-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Tabs Navigation */}
          <div className="inline-flex p-1.5 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl gap-1 overflow-x-auto hide-scrollbar w-full md:w-auto mb-8">
            {[
              { id: 'curriculum', label: t('courseDetails.tabCurriculum'), icon: List },
              { id: 'resources', label: t('courseDetails.tabResources'), icon: FileBox },
              { id: 'notes', label: t('courseDetails.tabNotes'), icon: FileText },
              { id: 'coaching', label: t('courseDetails.tabCoaching'), icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 transform scale-100' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 scale-95'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {activeTab === 'curriculum' ? t('courseDetails.contentTitle') : 
                 activeTab === 'resources' ? t('courseDetails.resourcesTitle') :
                 activeTab === 'notes' ? t('courseDetails.notesTitle') : t('courseDetails.coachingTitle')}
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('courseDetails.lessonsSubtitle', { count: lessons.length })}</span>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {activeTab === 'curriculum' && (() => {
                // Group lessons by chapter
                const chapters: Record<string, Lesson[]> = {};
                lessons.forEach(l => {
                  if (!chapters[l.chapter]) chapters[l.chapter] = [];
                  chapters[l.chapter].push(l);
                });

                return Object.entries(chapters).map(([chapterName, chapterLessons]) => (
                  <div key={chapterName}>
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 px-6 py-3 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{chapterName}</h3>
                    </div>
                    {chapterLessons.sort((a, b) => a.order - b.order).map((lesson, idx) => (
                      <div 
                        key={lesson.id}
                        className="group flex items-center justify-between p-6 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0"
                        onClick={() => isEnrolled ? navigate(`/learn/${course.id}/${lesson.id}`) : !lesson.is_free && handleEnroll()}
                      >
                        <div className="flex items-center gap-6">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 font-black text-xs group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors block">{isEn && lesson.title_en ? lesson.title_en : lesson.title}</span>
                              {lesson.is_free && (
                                <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-widest">Học thử</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                              <span className="flex items-center gap-1"><Clock size={10} /> {lesson.video_url ? 'Video' : 'Nội dung'}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <span>{t('courseDetails.videoSubtitle')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {(isEnrolled || lesson.is_free) ? (
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                              <PlayCircle size={20} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 dark:text-slate-600">
                              <Lock size={18} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ));
              })()}

              {activeTab === 'resources' && (
                <div className="p-8 space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Tài liệu đính kèm ({lessons.filter(l => l.doc_url).length})</h3>
                  {lessons.filter(l => l.doc_url).map(l => (
                    <div key={l.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{l.title}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Resource Link</p>
                        </div>
                      </div>
                      <a 
                        href={l.doc_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-indigo-600 hover:bg-slate-50 transition-all shadow-sm"
                      >
                        Mở tài liệu
                      </a>
                    </div>
                  ))}
                  {lessons.filter(l => l.doc_url).length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                       <FileBox size={40} className="mx-auto mb-4 opacity-10" />
                       <p className="text-sm font-bold uppercase tracking-widest">Chưa có tài liệu đính kèm.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="p-8">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <MessageSquare size={120} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-4">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                        {t('courseDetails.aiSummary')}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('courseDetails.aiSummaryTitle')}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {t('courseDetails.aiSummaryDesc')}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          t('courseDetails.aiQuestions_0'),
                          t('courseDetails.aiQuestions_1'),
                          t('courseDetails.aiQuestions_2'),
                          t('courseDetails.aiQuestions_3')
                        ].map((q, i) => (
                          <button key={i} className="flex items-center gap-3 p-4 bg-white border border-indigo-100 rounded-2xl text-xs font-bold text-slate-700 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-left">
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-600">?</span>
                            </div>
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Comments Section */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-slate-900">{t('courseDetails.discussionsTitle')}</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                <MessageSquare size={18} />
                <span>{t('courseDetails.commentsCount', { count: comments.length })}</span>
              </div>
            </div>

            {profile ? (
              <form onSubmit={handleCommentSubmit} className="mb-12">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('courseDetails.commentPlaceholder')}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none min-h-[120px] resize-none"
                  />
                  <div className="absolute bottom-4 right-4">
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                      {submittingComment ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      {t('courseDetails.submitComment')}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center mb-12">
                <p className="text-slate-600 font-medium mb-4">{t('courseDetails.loginToComment')}</p>
                <button 
                  onClick={() => navigate('/auth/signin')}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  {t('courseDetails.loginNow')}
                </button>
              </div>
            )}

            <div className="space-y-8">
              {comments.length > 0 ? (
                comments.map((comment, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={comment.id || i} 
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5">
                        {comment.photoUrl || comment.avatar_url ? (
                          <img 
                            src={comment.photoUrl || comment.avatar_url} 
                            className="w-full h-full rounded-[0.85rem] object-cover bg-white"
                            alt={comment.userName || comment.user_name}
                          />
                        ) : (
                          <div className="w-full h-full rounded-[0.85rem] bg-white flex items-center justify-center text-indigo-600">
                            <UserIcon size={24} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white">{comment.userName || comment.user_name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {comment.timestamp ? format(new Date(comment.timestamp), 'dd/MM/yyyy', { locale: vi }) : 
                           comment.created_at ? new Date(comment.created_at).toLocaleDateString('vi-VN') : t('courseDetails.justNow')}
                        </span>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-5 text-slate-600 leading-relaxed border border-slate-100">
                        {comment.content}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="font-bold uppercase tracking-widest text-xs">{t('courseDetails.noComments')}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-indigo-500/5 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {course.price_vnd?.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-slate-400 font-bold mb-1">{t('courseDetails.currency')}</span>
                </div>

                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/learn/${course.id}`)}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 mb-6"
                  >
                    <PlayCircle size={24} />
                    {t('courseDetails.continueLearning')}
                  </button>
                ) : (
                  <div className="space-y-4 mb-8">
                    <button
                      onClick={handleEnroll}
                      disabled={paying}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {paying ? <Loader2 className="animate-spin" /> : <CreditCard size={24} />}
                      {t('courseDetails.enrollBtn')}
                    </button>
                    {payError && (
                      <p className="text-center text-sm font-bold text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100">{payError}</p>
                    )}
                  </div>
                )}

                <div className="space-y-5">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('courseDetails.coursePerks')}</h4>
                  {[
                    { icon: ShieldCheck, text: t('courseDetails.perkLifetimeAccess') },
                    { icon: MessageSquare, text: t('courseDetails.perkAiSupport') },
                    { icon: Award, text: t('courseDetails.perkCertificate') },
                    { icon: Clock, text: t('courseDetails.perkUpdates') }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600">
                        <item.icon size={16} />
                      </div>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('courseDetails.shareCourse')}</span>
                <div className="flex gap-2">
                  {['fb', 'tw', 'ln'].map(s => (
                    <button key={s} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                      <Share2 size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4">{t('courseDetails.qualityCommitment')}</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                  {t('courseDetails.qualityDesc')}
                </p>
                <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                  {t('courseDetails.learnMore')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
