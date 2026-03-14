import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { PlayCircle, CheckCircle2, ChevronLeft, Menu, FileText, MessageSquare, Award } from 'lucide-react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'motion/react';

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

  useEffect(() => {
    if (id && profile) fetchLearningData();
  }, [id, profile]);

  const fetchLearningData = async () => {
    // 1. Fetch Course
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    // 2. Fetch Enrollment for this user
    const { data: enrollData } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', id)
      .eq('user_id', profile?.id)
      .single();

    if (courseData) {
      setCourse(courseData);
      setEnrollment(enrollData);

      // 3. Resume Logic: Find last lesson or start from first
      const lastLessonId = enrollData?.progress?.last_lesson_id;
      const lastLesson = courseData.modules?.find((m: any) => m.id === lastLessonId);
      
      if (lastLesson) {
        setCurrentLesson(lastLesson);
      } else if (courseData.modules?.length > 0) {
        setCurrentLesson(courseData.modules[0]);
      }
    }
    setLoading(false);
  };

  const handleLessonChange = async (lesson: any) => {
    setCurrentLesson(lesson);
    
    // Save progress to Supabase
    if (enrollment) {
      const newProgress = {
        ...(enrollment.progress || {}),
        last_lesson_id: lesson.id
      };

      await supabase
        .from('enrollments')
        .update({ progress: newProgress })
        .eq('id', enrollment.id);
      
      setEnrollment({ ...enrollment, progress: newProgress });
    }
  };

  const markAsComplete = async () => {
    if (!enrollment || !currentLesson) return;

    const completedLessons = enrollment.progress?.completed_lessons || [];
    if (!completedLessons.includes(currentLesson.id)) {
      const newCompleted = [...completedLessons, currentLesson.id];
      const totalModules = course.modules?.length || 1;
      const newPercentage = Math.round((newCompleted.length / totalModules) * 100);

      const newProgress = {
        ...enrollment.progress,
        completed_lessons: newCompleted
      };

      const { error } = await supabase
        .from('enrollments')
        .update({ 
          progress: newProgress,
          completion_percentage: newPercentage,
          status: newPercentage === 100 ? 'completed' : 'pending'
        })
        .eq('id', enrollment.id);

      if (!error) {
        setEnrollment({ 
          ...enrollment, 
          progress: newProgress, 
          completion_percentage: newPercentage 
        });
        alert('Chúc mừng! Bạn đã hoàn thành bài học này.');
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white">Đang tải lớp học...</div>;
  if (!course) return <div>Không tìm thấy khóa học</div>;

  return (
    <div className="h-screen flex flex-col bg-[#0F0F0F] text-white overflow-hidden">
      {/* Top Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-[#1A1A1A]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-semibold truncate max-w-[300px] md:max-w-md">{course.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <Award size={16} className="text-yellow-500" />
            <span>Tiến độ: 45%</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Player Area */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="aspect-video bg-black w-full shadow-2xl">
            {currentLesson?.video_url ? (
              <div className="w-full h-full">
                <Player
                  url={currentLesson.video_url}
                  width="100%"
                  height="100%"
                  controls={true}
                  playing={true}
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                <PlayCircle size={64} className="opacity-20" />
                <p>Chọn một bài học để bắt đầu</p>
              </div>
            )}
          </div>

          <div className="p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">{currentLesson?.title || 'Chào mừng bạn'}</h2>
              <button 
                onClick={markAsComplete}
                className={`px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  enrollment?.progress?.completed_lessons?.includes(currentLesson?.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {enrollment?.progress?.completed_lessons?.includes(currentLesson?.id) ? (
                  <><CheckCircle2 size={18} /> Đã hoàn thành</>
                ) : (
                  'Hoàn thành bài học'
                )}
              </button>
            </div>
            
            <div className="flex gap-6 border-b border-white/10 mb-8">
              <button className="pb-4 border-b-2 border-indigo-500 font-medium">Tổng quan</button>
              <button className="pb-4 text-gray-500 hover:text-white transition-colors">Tài liệu</button>
              <button className="pb-4 text-gray-500 hover:text-white transition-colors">Thảo luận</button>
            </div>

            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed">
              <p>Trong bài học này, chúng ta sẽ tìm hiểu về các khái niệm cốt lõi. Hãy đảm bảo bạn đã cài đặt đầy đủ môi trường trước khi bắt đầu thực hành theo video.</p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li>Hiểu về cấu trúc thư mục dự án</li>
                <li>Cách tối ưu hóa hiệu năng render</li>
                <li>Xử lý lỗi và debug thực tế</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Curriculum */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ x: 350 }}
              animate={{ x: 0 }}
              exit={{ x: 350 }}
              className="w-[350px] border-l border-white/10 bg-[#141414] flex flex-col"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="font-bold text-lg">Nội dung khóa học</h3>
                <p className="text-xs text-gray-500 mt-1">{course.modules?.length || 0} bài học • 12 giờ học</p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {course.modules?.map((module: any, idx: number) => {
                  const isCompleted = enrollment?.progress?.completed_lessons?.includes(module.id);
                  const isActive = currentLesson?.id === module.id;

                  return (
                    <button
                      key={module.id}
                      onClick={() => handleLessonChange(module)}
                      className={`w-full flex items-start gap-4 p-4 border-b border-white/5 transition-all hover:bg-white/5 text-left ${isActive ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500' : ''}`}
                    >
                      <div className="mt-1">
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : isActive ? (
                          <PlayCircle size={18} className="text-indigo-500" />
                        ) : (
                          <div className="w-[18px] h-[18px] rounded-full border border-gray-600 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-400/80' : 'text-gray-300'}`}>
                          {module.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                          <span className="flex items-center gap-1"><FileText size={10} /> 1 tài liệu</span>
                          <span className="flex items-center gap-1"><MessageSquare size={10} /> 12 thảo luận</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
