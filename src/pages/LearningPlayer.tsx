import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { googleSheetsService } from '../services/googleSheetsService';
import { PlayCircle, CheckCircle2, ChevronLeft, Menu, FileText, MessageSquare, Award, Send, Sparkles, BookOpen, Info, Download, Loader2 } from 'lucide-react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'motion/react';
import { AICoach } from '../components/AICoach';

const Player = ReactPlayer as any;

export const LearningPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-coach' | 'discussion' | 'resources'>('overview');
  
  // Comment state
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (id && profile) fetchLearningData();
  }, [id, profile]);

  const fetchLearningData = async () => {
    try {
      // 1. Fetch Course from Google Sheets
      const allCourses = await googleSheetsService.fetchCourses();
      const courseData = allCourses.find(c => c.id === id);

      // 2. Fetch Enrollment for this user from Firestore
      const q = query(
        collection(db, 'enrollments'), 
        where('course_id', '==', id), 
        where('user_id', '==', profile?.id)
      );
      const querySnapshot = await getDocs(q);
      const enrollData = !querySnapshot.empty ? { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as any : null;

      if (courseData) {
        setCourse(courseData);

        // P2.5 Fix: Guard against unenrolled users accessing the player.
        // If no enrollment record found, redirect to course details page.
        if (!enrollData) {
          navigate(`/courses/${id}?access=denied`, { replace: true });
          return;
        }

        setEnrollment(enrollData);

        // 3. Resume Logic: Find current lesson or start from first
        const currentLessonId = enrollData?.current_lesson_id || enrollData?.progress?.last_lesson_id;
        const savedLesson = courseData.modules?.find((m: any) => m.id === currentLessonId);
        
        if (savedLesson) {
          setCurrentLesson(savedLesson);
        } else if (courseData.modules?.length > 0) {
          setCurrentLesson(courseData.modules[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !profile || !id) return;

    setCommentLoading(true);
    try {
      await googleSheetsService.submitComment(
        id,
        profile.id,
        profile.full_name || 'Học viên', // P2 null-safe fix
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

  const handleLessonChange = async (lesson: any) => {
    setCurrentLesson(lesson);
    
    // Save progress to Firestore
    if (enrollment) {
      try {
        const newProgress = {
          ...(enrollment.progress || {}),
          last_lesson_id: lesson.id
        };

        const enrollDocRef = doc(db, 'enrollments', enrollment.id);
        await updateDoc(enrollDocRef, { 
          progress: newProgress,
          current_lesson_id: lesson.id
        });
        
        setEnrollment({ ...enrollment, progress: newProgress, current_lesson_id: lesson.id });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const markAsComplete = async () => {
    if (!enrollment || !currentLesson) return;

    try {
      const completedLessons = enrollment.progress?.completed_lessons || [];
      if (!completedLessons.includes(currentLesson.id)) {
        const newCompleted = [...completedLessons, currentLesson.id];
        const totalModules = course.modules?.length || 1;
        const newPercentage = Math.round((newCompleted.length / totalModules) * 100);

        const newProgress = {
          ...enrollment.progress,
          completed_lessons: newCompleted
        };

        const enrollDocRef = doc(db, 'enrollments', enrollment.id);
        await updateDoc(enrollDocRef, { 
          progress: newProgress,
          completion_percentage: newPercentage,
          status: newPercentage === 100 ? 'completed' : 'pending'
        });

        setEnrollment({ 
          ...enrollment, 
          progress: newProgress, 
          completion_percentage: newPercentage 
        });
        alert('Chúc mừng! Bạn đã hoàn thành bài học này.');
      }
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white">Đang tải lớp học...</div>;
  if (!course) return <div>Không tìm thấy khóa học</div>;

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0B] text-white overflow-hidden font-sans">
      {/* Top Header */}
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
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-[#0A0A0B]">
          {/* Video Section */}
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
                  config={{
                    youtube: {
                      playerVars: { showinfo: 0, autoplay: 1, rel: 0, modestbranding: 1 }
                    }
                  }}
                />
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

          {/* Lesson Info & Tabs */}
          <div className="p-8 lg:p-12 max-w-6xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-3">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Bài học hiện tại
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {currentLesson?.title || 'Chào mừng bạn quay trở lại'}
                </h2>
              </div>
              
              <button 
                onClick={markAsComplete}
                className={`px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-xl ${
                  enrollment?.progress?.completed_lessons?.includes(currentLesson?.id)
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                }`}
              >
                {enrollment?.progress?.completed_lessons?.includes(currentLesson?.id) ? (
                  <><CheckCircle2 size={20} /> Bài học đã hoàn thành</>
                ) : (
                  <>Hoàn thành bài học</>
                )}
              </button>
            </div>
            
            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 mb-10 w-fit">
              {[
                { id: 'overview', label: 'Tổng quan', icon: Info },
                { id: 'ai-coach', label: 'AI Coach', icon: Sparkles },
                { id: 'resources', label: 'Tài liệu', icon: Download },
                { id: 'discussion', label: 'Thảo luận', icon: MessageSquare },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="prose prose-invert max-w-none"
                  >
                    <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-10">
                      <h3 className="text-xl font-bold text-white mb-6">Nội dung bài học</h3>
                      <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        Trong bài học này, chúng ta sẽ đi sâu vào các kỹ thuật tối ưu hóa quy trình làm việc bằng AI. 
                        Bạn sẽ được hướng dẫn từng bước để thiết lập hệ thống tự động hóa đầu tiên của mình.
                      </p>
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
                      courseTitle={course.title} 
                      lessonTitle={currentLesson?.title || 'Tổng quan'} 
                    />
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
                    {[
                      { name: 'Tài liệu bài giảng (PDF)', size: '2.4 MB' },
                      { name: 'Source code mẫu', size: '156 KB' },
                      { name: 'Cheat sheet phím tắt', size: '890 KB' }
                    ].map((res, i) => (
                      <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                            <FileText size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">{res.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{res.size}</p>
                          </div>
                        </div>
                        <Download size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                      </div>
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
                          className="w-full px-8 py-6 rounded-[2rem] bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[150px] resize-none mb-4 text-lg"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={commentLoading}
                            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-500/20"
                          >
                            {commentLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
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

        {/* Sidebar Curriculum */}
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
                <h3 className="font-black text-lg text-white mb-1">Nội dung khóa học</h3>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>{course.modules?.length || 0} Bài học</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span>12 Giờ học</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {course.modules?.map((module: any, idx: number) => {
                  const isCompleted = enrollment?.progress?.completed_lessons?.includes(module.id);
                  const isActive = currentLesson?.id === module.id;

                  return (
                    <button
                      key={module.id}
                      onClick={() => handleLessonChange(module)}
                      className={`w-full flex items-start gap-4 p-5 rounded-[1.5rem] transition-all text-left group relative ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                          : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {isCompleted ? (
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            <CheckCircle2 size={14} />
                          </div>
                        ) : (
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border font-black text-[10px] ${
                            isActive ? 'bg-white/20 border-white/30 text-white' : 'bg-white/5 border-white/10 text-slate-500'
                          }`}>
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                          {module.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold uppercase tracking-widest opacity-50">
                          <span className="flex items-center gap-1"><PlayCircle size={10} /> 15:30</span>
                          {isCompleted && !isActive && <span className="text-emerald-500">Hoàn thành</span>}
                        </div>
                      </div>
                      {isActive && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
