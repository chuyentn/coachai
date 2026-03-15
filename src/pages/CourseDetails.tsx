import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Course, Enrollment } from '../types';
import { useAuth } from '../hooks/useAuth';
import { googleSheetsService } from '../services/googleSheetsService';
import { CheckCircle2, Lock, PlayCircle, ShieldCheck, Clock, Award, Loader2, MessageSquare, Send, User as UserIcon, List, FileText, CreditCard, Share2, AlertTriangle, X, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { usePageTitle } from '../hooks/usePageTitle';

export const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
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
  usePageTitle(course ? course.title : 'Chi tiết khóa học');

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
      const courseData = allCourses.find(c => c.id === id);

      if (courseData) {
        setCourse(courseData);
        if (courseData.modules && Array.isArray(courseData.modules)) {
          setLessons(courseData.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
            video_url: m.video_url,
            order_index: m.order
          })));
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

  const handleEnroll = async (method: 'vnpay' | 'momo' | 'paypal') => {
    if (!profile) {
      navigate('/auth/signin');
      return;
    }

    setPaying(true);
    setPayError(null); // P4.7: reset inline error
    try {
      if (method === 'vnpay') {
        // P1.2 Fix: Do NOT create enrollment here. Enrollment is created server-side
        // only after VNPAY callback verifies the payment signature successfully.
        const res = await axios.post('/api/payments/vnpay/create', {
          amount: course?.price_vnd,
          orderId: `ENROLL_${Date.now()}`,
          orderInfo: `Thanh toan khoa hoc: ${course?.title}`,
          userId: profile.id,
          courseId: course?.id,
        });

        window.location.href = res.data.url;
      } else {
        setPayError('Phương thức này đang được bảo trì. Vui lòng chọn VNPAY.'); // P4.7
      }
    } catch (err) {
      console.error(err);
      setPayError('Đã có lỗi xảy ra khi khởi tạo thanh toán. Vui lòng thử lại.'); // P4.7
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">Khóa học không tồn tại</h2>
        <p className="text-slate-500 mb-8 font-medium">Khóa học này đã bị xóa hoặc đang được cập nhật. Hãy khám phá các khóa học khác!</p>
        <button onClick={() => navigate('/')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
          Xem các khóa học khác
        </button>
      </div>
    </div>
  );

  const isEnrolled = enrollment?.status === 'completed';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* P4.2: Access Denied Banner */}
      {showAccessDenied && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-[72px] left-0 right-0 z-50 flex items-center justify-between gap-4 bg-amber-500 text-white px-6 py-3 shadow-lg"
        >
          <div className="flex items-center gap-3 font-bold text-sm">
            <AlertTriangle size={18} />
            Bạn chưa đăng ký khóa học này. Hãy mua khóa học để bắt đầu học!
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
              <ShieldCheck size={14} />
              <span>Khóa học Coaching AI Chuyên sâu</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tight">
              {course.title}
            </h1>
            <p className="text-slate-400 text-xl mb-10 leading-relaxed max-w-xl">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-8 text-sm text-slate-300 font-medium">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Clock size={18} className="text-indigo-400" />
                </div>
                <span>{lessons.length} bài học chuyên sâu</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Award size={18} className="text-indigo-400" />
                </div>
                <span>Chứng chỉ quốc tế</span>
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
          <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-wrap gap-2">
            {[
              { id: 'curriculum', label: 'Lộ trình học', icon: List },
              { id: 'resources', label: 'Tài nguyên', icon: FileText },
              { id: 'notes', label: 'Ghi chú AI', icon: MessageSquare },
              { id: 'coaching', label: 'Lịch Coaching', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">
                {activeTab === 'curriculum' ? 'Nội dung khóa học' : 
                 activeTab === 'resources' ? 'Tài liệu đính kèm' :
                 activeTab === 'notes' ? 'Tóm tắt thông minh từ AI' : 'Lịch Coaching trực tiếp'}
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lessons.length} bài học</span>
            </div>

            <div className="divide-y divide-slate-50">
              {activeTab === 'curriculum' && lessons.map((lesson, idx) => (
                <div 
                  key={lesson.id}
                  className="group flex items-center justify-between p-6 hover:bg-slate-50/80 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors block mb-1">{lesson.title}</span>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Clock size={10} /> 15:30</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>Video bài giảng</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {isEnrolled ? (
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <PlayCircle size={20} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <Lock size={18} />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {activeTab === 'notes' && (
                <div className="p-8">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <MessageSquare size={120} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-4">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                        AI Summary
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Tóm tắt lộ trình học tập</h3>
                      <p className="text-slate-600 leading-relaxed mb-6">
                        Khóa học này tập trung vào việc ứng dụng AI để tự động hóa quy trình kinh doanh. Bạn sẽ bắt đầu từ việc hiểu các mô hình ngôn ngữ lớn (LLM), sau đó tiến tới xây dựng các Agent AI có khả năng tự thực hiện nhiệm vụ phức tạp.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          'Làm thế nào để viết Prompt hiệu quả?',
                          'Cách kết nối AI với Google Sheets?',
                          'Xây dựng Chatbot hỗ trợ khách hàng',
                          'Tối ưu hóa chi phí API'
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
              <h2 className="text-2xl font-black text-slate-900">Thảo luận khóa học</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                <MessageSquare size={18} />
                <span>{comments.length} bình luận</span>
              </div>
            </div>

            {profile ? (
              <form onSubmit={handleCommentSubmit} className="mb-12">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ suy nghĩ hoặc đặt câu hỏi cho giảng viên..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none min-h-[120px] resize-none"
                  />
                  <div className="absolute bottom-4 right-4">
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                      {submittingComment ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      Gửi bình luận
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center mb-12">
                <p className="text-slate-600 font-medium mb-4">Đăng nhập để tham gia thảo luận cùng cộng đồng.</p>
                <button 
                  onClick={() => navigate('/auth/signin')}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Đăng nhập ngay
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
                        <h4 className="font-bold text-slate-900">{comment.userName || comment.user_name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {comment.timestamp ? format(new Date(comment.timestamp), 'dd/MM/yyyy', { locale: vi }) : 
                           comment.created_at ? new Date(comment.created_at).toLocaleDateString('vi-VN') : 'Vừa xong'}
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
                  <p className="font-bold uppercase tracking-widest text-xs">Chưa có bình luận nào</p>
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
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-4xl font-black text-slate-900">
                    {course.price_vnd?.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-slate-400 font-bold mb-1">VNĐ</span>
                </div>

                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/learn/${course.id}`)}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 mb-6"
                  >
                    <PlayCircle size={24} />
                    Tiếp tục học ngay
                  </button>
                ) : (
                  <div className="space-y-4 mb-8">
                    <button
                      onClick={() => handleEnroll('vnpay')}
                      disabled={paying}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {paying ? <Loader2 className="animate-spin" /> : <CreditCard size={24} />}
                      Đăng ký bằng VNPAY
                    </button>
                    <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Hoặc thanh toán qua</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-200 transition-all">
                        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" className="h-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" alt="MoMo" />
                      </button>
                      <button className="flex items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-200 transition-all">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" alt="PayPal" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Đặc quyền khóa học</h4>
                  {[
                    { icon: ShieldCheck, text: 'Truy cập trọn đời' },
                    { icon: MessageSquare, text: 'Hỗ trợ 1:1 từ AI Coach' },
                    { icon: Award, text: 'Chứng chỉ hoàn thành' },
                    { icon: Clock, text: 'Cập nhật nội dung mới' }
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
              
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chia sẻ khóa học</span>
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
                <h3 className="text-xl font-black mb-4">Cam kết chất lượng</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                  Hoàn tiền 100% trong vòng 7 ngày nếu bạn không hài lòng với chất lượng nội dung khóa học.
                </p>
                <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
