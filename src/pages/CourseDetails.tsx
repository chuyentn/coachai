import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Course, CourseModule, Enrollment } from '../types';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, Lock, PlayCircle, ShieldCheck, Clock, Award, Loader2 } from 'lucide-react';
import axios from 'axios';

export const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id, profile]);

  const fetchCourseDetails = async () => {
    const { data: courseData } = await supabase
      .from('courses')
      .select('*, instructor:users(*)')
      .eq('id', id)
      .single();

    if (profile) {
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', id)
        .eq('user_id', profile.id)
        .single();
      setEnrollment(enrollData);
    }

    setCourse(courseData);
    
    // If course has modules in JSONB, use them. Otherwise fallback to lessons table.
    if (courseData?.modules && Array.isArray(courseData.modules) && courseData.modules.length > 0) {
      setLessons(courseData.modules.map((m: any) => ({
        id: m.id,
        title: m.title,
        video_url: m.video_url,
        order_index: m.order
      })));
    } else {
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index', { ascending: true });
      setLessons(lessonsData || []);
    }
    setLoading(false);
  };

  const handleEnroll = async (method: 'vnpay' | 'momo' | 'paypal') => {
    if (!profile) {
      navigate('/auth/signin');
      return;
    }

    setPaying(true);
    try {
      if (method === 'vnpay') {
        const res = await axios.post('/api/payments/vnpay/create', {
          amount: course?.price_vnd,
          orderId: `ENROLL_${Date.now()}`,
          orderInfo: `Thanh toan khoa hoc: ${course?.title}`
        });
        
        // In a real app, we'd create a 'pending' enrollment in Supabase first
        await supabase.from('enrollments').upsert({
          user_id: profile.id,
          course_id: course?.id,
          status: 'pending',
          payment_method: 'vnpay',
          amount_paid: course?.price_vnd,
          currency: 'VND'
        });

        window.location.href = res.data.url;
      } else {
        alert('Phương thức này đang được bảo trì. Vui lòng chọn VNPAY.');
      }
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra khi khởi tạo thanh toán.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
    </div>
  );

  if (!course) return <div>Course not found</div>;

  const isEnrolled = enrollment?.status === 'completed';

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* Header / Banner */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-4">
              <ShieldCheck size={16} />
              <span>Khóa học được chứng thực</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              {course.description}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{lessons.length} bài học</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={18} />
                <span>Chứng chỉ hoàn thành</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10">
            <img 
              src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/800/450`} 
              className="w-full h-full object-cover"
              alt={course.title}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <PlayCircle className="w-20 h-20 text-white opacity-80" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-6">Nội dung khóa học</h2>
            <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
              {lessons.map((lesson, idx) => (
                <div 
                  key={lesson.id}
                  className="flex items-center justify-between p-5 border-b border-black/5 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-300 font-mono text-sm">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="font-medium text-gray-700">{lesson.title}</span>
                  </div>
                  {isEnrolled ? (
                    <PlayCircle className="text-indigo-600" size={20} />
                  ) : (
                    <Lock className="text-gray-300" size={18} />
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar / Enrollment */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl shadow-black/5 sticky top-24">
            {isEnrolled ? (
              <div className="text-center">
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-6">
                  <p className="font-bold">Bạn đã sở hữu khóa học này!</p>
                </div>
                <button 
                  onClick={() => navigate(`/learn/${course.id}`)}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all"
                >
                  Tiếp tục học ngay
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <span className="text-3xl font-bold text-gray-900">{course.price_vnd.toLocaleString('vi-VN')} ₫</span>
                  <p className="text-gray-500 text-sm mt-1">Sở hữu vĩnh viễn khóa học</p>
                </div>

                <div className="space-y-4">
                  <button 
                    disabled={paying}
                    onClick={() => handleEnroll('vnpay')}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    {paying ? <Loader2 className="animate-spin" /> : 'Thanh toán qua VNPAY'}
                  </button>
                  <button 
                    disabled={paying}
                    onClick={() => handleEnroll('momo')}
                    className="w-full bg-[#A50064] text-white py-4 rounded-2xl font-bold hover:bg-[#80004e] transition-all"
                  >
                    Thanh toán qua MoMo
                  </button>
                  <button 
                    disabled={paying}
                    onClick={() => handleEnroll('paypal')}
                    className="w-full bg-[#FFC439] text-black py-4 rounded-2xl font-bold hover:bg-[#e6b033] transition-all"
                  >
                    Thanh toán qua PayPal
                  </button>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                    <span>Truy cập trọn đời</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                    <span>Hỗ trợ 24/7 từ chuyên gia</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="text-emerald-500" size={18} />
                    <span>Cập nhật nội dung miễn phí</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
