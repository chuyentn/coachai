import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { googleSheetsService } from '../services/googleSheetsService';
import { Lesson, Course } from '../types';
import { 
  CheckCircle2, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Download, 
  PlayCircle, 
  Bot, 
  Send, 
  Loader2, 
  X, 
  Check, 
  Save, 
  ThumbsUp, 
  Share2,
  FileText,
  Award,
  ArrowRight,
  BookOpen,
  Menu,
  ShoppingCart,
  Zap
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'motion/react';
import { AICoach } from '../components/AICoach';

const Player = ReactPlayer as any;

export const LearningPlayer: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-coach' | 'discussion' | 'resources' | 'notes' | 'quizzes' | 'role-play'>('overview');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lessonNote, setLessonNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Comment state
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    if (courseId && profile) fetchLearningData();
  }, [courseId, profile]);

  // Fetch granular lesson progress and notes (V6)
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !profile) return;
      try {
        if (lessons.length === 0) {
          const fetchedLessons = await googleSheetsService.fetchLessons(courseId);
          setLessons(fetchedLessons);
          if (fetchedLessons.length > 0 && !currentLesson) {
            setCurrentLesson(fetchedLessons[0]);
          }
        }

        const progress = await googleSheetsService.fetchLessonProgress(profile.id, courseId);
        setCompletedLessons(progress.filter((p: any) => p.status === 'completed').map((p: any) => p.lesson_id));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, profile, lessons.length, currentLesson]);

  // Fetch note for current lesson (V6)
  useEffect(() => {
    if (activeTab === 'notes' && profile && currentLesson) {
      const fetchNote = async () => {
        try {
          const notes = await googleSheetsService.fetchNotes(profile.id, currentLesson.id);
          if (notes.length > 0) setLessonNote(notes[0].content);
          else setLessonNote('');
        } catch (error) {
          console.error('Error fetching note:', error);
        }
      };
      fetchNote();
    }
  }, [activeTab, currentLesson, profile]);

  const fetchLearningData = async () => {
    try {
      const allCourses = await googleSheetsService.fetchCourses();
      const courseData = allCourses.find(c => String(c.id) === String(courseId));

      const q = query(
        collection(db, 'enrollments'), 
        where('course_id', '==', courseId), 
        where('user_id', '==', profile?.id)
      );
      const querySnapshot = await getDocs(q);
      const enrollData = !querySnapshot.empty ? { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as any : null;

      if (courseData) {
        setCourse(courseData);
        if (!enrollData) {
          setAccessDenied(true);
          return;
        }
        setEnrollment(enrollData);

        const lessonsData = await googleSheetsService.fetchLessons(courseId);
        const activeLessons = (lessonsData && lessonsData.length > 0) ? lessonsData : (courseData.modules?.map((m: any) => ({
          id: m.id,
          course_id: courseId,
          chapter: 'Tổng quan',
          title: m.title,
          video_url: m.video_url,
          order: m.order,
          is_free: false
        })) as Lesson[]);
        
        setLessons(activeLessons);

        const currentLessonId = enrollData?.current_lesson_id || enrollData?.progress?.last_lesson_id;
        const savedLesson = activeLessons.find(l => String(l.id) === String(currentLessonId));
        
        if (savedLesson) {
          setCurrentLesson(savedLesson);
        } else if (activeLessons.length > 0) {
          setCurrentLesson(activeLessons[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !profile || !courseId) return;

    setCommentLoading(true);
    try {
      await googleSheetsService.submitComment(
        courseId,
        profile.id,
        profile.full_name || 'Học viên',
        comment,
        profile.email,
        profile.avatar_url || ''
      );
      setComment('');
      alert('Cảm ơn bạn! Câu hỏi của bạn đã được gửi đến giảng viên.');
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setLessonNote('');
  };

  const handleNextLesson = () => {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
      handleLessonClick(lessons[currentIndex + 1]);
    }
  };

  const toggleLessonCompletion = async () => {
    if (!profile || !currentLesson || !courseId) return;
    setMarkingDone(true);
    try {
      const isCompleted = completedLessons.includes(currentLesson.id);
      const newStatus = isCompleted ? 'in_progress' : 'completed';
      
      await googleSheetsService.updateLessonProgress(profile.id, courseId, currentLesson.id, newStatus);
      
      if (newStatus === 'completed') {
        setCompletedLessons([...completedLessons, currentLesson.id]);
        setTimeout(() => handleNextLesson(), 500);
      } else {
        setCompletedLessons(completedLessons.filter(id => id !== currentLesson.id));
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setMarkingDone(false);
    }
  };

  const handleSaveNote = async () => {
    if (!profile || !currentLesson || !courseId) return;
    setSavingNote(true);
    try {
      await googleSheetsService.saveNote(profile.id, courseId, currentLesson.id, lessonNote);
      alert('Đã lưu ghi chú bài học!');
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0A0A0B] text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-400 w-12 h-12" />
        <p className="text-slate-400 font-medium animate-pulse">Đang tải lớp học...</p>
      </div>
    </div>
  );

  if (accessDenied) return (
    <div className="h-screen flex items-center justify-center bg-[#0A0A0B] text-white p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Lock size={36} className="text-indigo-400" />
        </div>
        {course?.title && (
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
            <BookOpen size={10} /> {course.title}
          </p>
        )}
        <h1 className="text-2xl font-bold text-white mb-3">Bạn chưa sở hữu khóa học này</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Để truy cập nội dung, bạn cần mua khóa học này trước. Nhấn "Mua ngay" để xem các gói học phù hợp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3.5 px-6 rounded-2xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-all"
          >
            ← Quay lại
          </button>
          <a
            href="/pricing"
            className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} /> Mua ngay
          </a>
        </div>
      </motion.div>
    </div>
  );

  if (!course) return (
    <div className="h-screen flex items-center justify-center bg-[#0A0A0B] text-white">
      <div className="text-center">
        <BookOpen size={48} className="mx-auto mb-4 text-slate-600" />
        <p className="text-lg font-bold text-slate-400">Không tìm thấy khóa học</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/10 transition-all">
          ← Quay lại
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0B] text-white overflow-hidden font-sans">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#111113] relative z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              <BookOpen size={10} />
              <span>Khóa học của tôi</span>
            </div>
            <h1 className="font-bold text-sm truncate max-w-[200px] md:max-w-md text-slate-200">{course.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 bg-black/20 px-4 py-2 rounded-2xl border border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tiến độ học tập</span>
              <span className="text-xs font-bold text-indigo-400">{enrollment?.completion_percentage || 0}% Hoàn thành</span>
            </div>
            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${enrollment?.completion_percentage || 0}%` }}
                className="h-full bg-indigo-500"
              />
            </div>
          </div>

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-3 rounded-xl transition-all border ${
              sidebarOpen 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-[#0A0A0B]">
          <div className="w-full bg-black aspect-video relative group shadow-2xl">
            {currentLesson?.video_url ? (
              <div className="w-full h-full">
                <Player
                  key={currentLesson.id}
                  url={currentLesson.video_url}
                  width="100%"
                  height="100%"
                  controls={true}
                  playing={true}
                  playbackRate={playbackRate}
                  config={{
                    youtube: {
                      playerVars: { showinfo: 0, autoplay: 1, rel: 0, modestbranding: 1 }
                    }
                  }}
                />
                {/* Video Speed Selector (V7 Elite) */}
                <div className="absolute bottom-16 right-4 z-10 flex flex-col gap-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackRate(speed)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all border ${
                        playbackRate === speed 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'bg-black/60 border-white/10 text-slate-400 hover:bg-black/80'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-6">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <PlayCircle size={48} className="opacity-20" />
                </div>
                <p className="font-bold text-lg">Chọn một bài học để bắt đầu</p>
              </div>
            )}
          </div>

          <div className="p-8 lg:p-12 max-w-6xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-3">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Bài học hiện tại
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {currentLesson?.title || 'Chào mừng bạn quay trở lại'}
                  </h1>
                  <button 
                    onClick={toggleLessonCompletion}
                    disabled={markingDone || !currentLesson}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                      currentLesson && completedLessons.includes(currentLesson.id)
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    {markingDone ? <Loader2 className="animate-spin" size={18} /> : (currentLesson && completedLessons.includes(currentLesson.id) ? <><CheckCircle2 size={18} /> Hoàn thành</> : 'Đánh dấu hoàn thành')}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {(() => {
                  const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
                  return (
                    <>
                      <button 
                        disabled={currentIndex <= 0}
                        onClick={() => handleLessonClick(lessons[currentIndex - 1])}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        disabled={currentIndex === -1 || currentIndex >= lessons.length - 1}
                        onClick={() => handleLessonClick(lessons[currentIndex + 1])}
                        className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all disabled:opacity-20"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex pb-0 overflow-x-auto hide-scrollbar mb-8 border-b border-white/5">
              <div className="flex gap-8">
                {[
                  { id: 'overview', label: 'Tổng quan', icon: ThumbsUp },
                  { id: 'ai-coach', label: 'Hỏi AI Coach', icon: Bot },
                  { id: 'quizzes', label: 'Kiểm tra', icon: Award },
                  { id: 'role-play', label: 'Thực chiến AI', icon: Zap },
                  { id: 'notes', label: 'Ghi chú', icon: Save },
                  { id: 'resources', label: 'Tài liệu', icon: Download },
                  { id: 'discussion', label: 'Thảo luận', icon: MessageSquare }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 text-sm font-bold transition-all flex items-center gap-2 relative ${
                      activeTab === tab.id 
                        ? 'text-white' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-10">
                      <h3 className="text-xl font-bold text-white mb-6">Nội dung bài học</h3>
                      <div className="text-slate-400 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
                        {currentLesson?.content || 'Đang cập nhật nội dung văn bản cho bài học này...'}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="p-6 bg-black/20 rounded-3xl border border-white/5">
                          <h4 className="text-sm font-bold text-indigo-400 mb-4 uppercase tracking-widest">Mục tiêu đạt được</h4>
                          <ul className="space-y-3">
                            {['Hiểu cấu trúc Automation', 'Kết nối API thành thạo', 'Xử lý lỗi logic'].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-6 bg-black/20 rounded-3xl border border-white/5">
                          <h4 className="text-sm font-bold text-indigo-400 mb-4 uppercase tracking-widest">Lưu ý quan trọng</h4>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Hãy chắc chắn rằng bạn đã hoàn thành bài tập ở chương trước để có đủ kiến thức nền tảng cho phần này.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ai-coach' && (
                  <motion.div
                    key="ai-coach"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-[600px]"
                  >
                    <AICoach 
                      courseTitle={course?.title || ''} 
                      lessonTitle={currentLesson?.title || 'Tổng quan'} 
                    />
                  </motion.div>
                )}

                {activeTab === 'notes' && (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5">
                      <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Save size={18} className="text-indigo-400" />
                        Ghi chú bài học
                      </h3>
                      <textarea 
                        value={lessonNote}
                        onChange={(e) => setLessonNote(e.target.value)}
                        placeholder="Ghi lại kiến thức quan trọng tại đây..."
                        className="w-full h-48 p-6 bg-black/40 border border-white/10 rounded-3xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-lg transition-all font-medium resize-none"
                      />
                      <div className="mt-6 flex justify-end">
                        <button 
                          onClick={handleSaveNote}
                          disabled={savingNote || !currentLesson}
                          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                        >
                          {savingNote ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                          Lưu Ghi Chú
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'resources' && (
                  <motion.div
                    key="resources"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid sm:grid-cols-2 gap-4"
                  >
                    {lessons.filter(l => l.doc_url).map((res, i) => (
                      <a 
                        key={i} 
                        href={res.doc_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">{res.title}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tài liệu học tập</p>
                          </div>
                        </div>
                        <Download size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                      </a>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'discussion' && (
                  <motion.div
                    key="discussion"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-10">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-indigo-600/10 text-indigo-400 rounded-2xl flex items-center justify-center">
                          <MessageSquare size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Thảo luận cộng đồng</h3>
                          <p className="text-sm text-slate-500 font-medium">Chia sẻ thắc mắc và học hỏi cùng mọi người</p>
                        </div>
                      </div>

                      <form onSubmit={handleCommentSubmit} className="mb-10">
                        <textarea
                          required
                          placeholder="Bạn có thắc mắc gì về bài học này không?"
                          className="w-full px-8 py-6 rounded-[2rem] bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[150px] resize-none mb-4 text-lg"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={commentLoading}
                            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-500/20"
                          >
                            {commentLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            Gửi thảo luận
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-[400px] border-l border-white/5 bg-[#111113] flex flex-col relative z-40"
            >
              <div className="p-8 border-b border-white/5">
                <h3 className="font-black text-lg text-white mb-1">Cấu trúc khóa học</h3>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>{lessons.length} Bài học</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span>Full Course</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {(() => {
                  const chapters: Record<string, Lesson[]> = {};
                  lessons.forEach(l => {
                    const ch = l.chapter || 'Tổng quan';
                    if (!chapters[ch]) chapters[ch] = [];
                    chapters[ch].push(l);
                  });

                  return Object.entries(chapters).map(([chapterName, chapterLessons]) => (
                    <div key={chapterName} className="space-y-2">
                      <div className="px-2">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{chapterName}</h4>
                      </div>
                      <div className="space-y-1">
                        {chapterLessons.sort((a, b) => a.order - b.order).map((lesson, idx) => {
                          const isCompleted = completedLessons.includes(lesson.id);
                          const isActive = currentLesson?.id === lesson.id;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson)}
                              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group relative ${
                                isActive 
                                  ? 'bg-indigo-600/10 text-white border border-indigo-500/20' 
                                  : 'hover:bg-white/5 text-slate-400 border border-transparent'
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 size={14} />
                                  </div>
                                ) : (
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border font-black text-[10px] ${
                                    isActive ? 'border-indigo-500/30 text-indigo-400' : 'border-white/10 text-slate-600'
                                  }`}>
                                    {idx + 1}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {lesson.video_url ? (
                                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase opacity-40"><PlayCircle size={10} /> Video</span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase opacity-40"><FileText size={10} /> Reading</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showUpsell && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111113] border border-white/10 p-8 md:p-10 rounded-[2.5rem] max-w-md w-full text-center relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/20 to-transparent blur-2xl pointer-events-none" />
              
              <button 
                onClick={() => setShowUpsell(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all z-10"
              >
                <X size={20} />
              </button>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-inner shadow-indigo-500/20 border border-indigo-500/20">
                  <Award size={40} className="drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-3">Bạn Học Rất Tuyệt Vời!</h3>
                <p className="text-slate-400 leading-relaxed mb-6">Bạn đã hoàn thành 30% khóa học. Đã đến lúc tăng tốc dự án bằng cách sử dụng Source Code đầy đủ và Nhận Coaching 1:1.</p>
                
                <div className="w-full space-y-3">
                  <button 
                    onClick={() => {
                      setShowUpsell(false);
                      navigate(profile ? '/payment?plan=vip' : '/auth/signup?plan=vip');
                    }}
                    className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl font-black text-sm hover:scale-[1.02] flex items-center justify-center gap-2 transition-transform shadow-xl shadow-rose-500/20"
                  >
                    Nâng Cấp VIP Ngay <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => setShowUpsell(false)}
                    className="w-full py-4 bg-white/5 text-slate-300 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Tiếp tục học miễn phí
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
