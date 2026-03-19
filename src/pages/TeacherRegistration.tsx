import React from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  DollarSign, 
  Users, 
  ArrowRight,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTranslation } from 'react-i18next';

export const TeacherRegistration: React.FC = () => {
  usePageTitle('Trở thành Giảng viên');
  const { t } = useTranslation();

  // Replace this with your actual Google Form link
  const GOOGLE_FORM_URL = "https://forms.google.com/";

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-indigo-500/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-rose-500/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight whitespace-pre-line">
                {t('teach.title')}
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
                {t('teach.desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
                >
                  {t('teach.registerBtn')}
                  <ArrowRight size={20} />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Replace with a real inspiring instructor image */}
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Instructor teaching" 
                className="rounded-3xl shadow-2xl shadow-indigo-500/20 border border-slate-800"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <span className="font-black text-xl">4.8</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Đánh giá trung bình</p>
                  <div className="flex text-amber-400 text-sm">
                    ★★★★★
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reasons to teach */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900">Tại sao nên giảng dạy cùng {import.meta.env.VITE_APP_NAME || 'CoachAI'}?</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Chúng tôi cung cấp mọi công cụ cần thiết để bạn tập trung vào việc tạo ra những bài giảng chất lượng nhất.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Video,
                title: 'Tự do sáng tạo',
                desc: 'Thiết kế khóa học mang đậm phong cách cá nhân của bạn. Không gò bó khuôn mẫu, bạn làm chủ nội dung.',
                color: 'indigo'
              },
              {
                icon: DollarSign,
                title: 'Thu nhập hấp dẫn',
                desc: 'Kiếm được doanh thu mỗi khi có học viên đăng ký khóa học của bạn. Tự định giá và tự chủ tài chính.',
                color: 'emerald'
              },
              {
                icon: Users,
                title: 'Cộng đồng lớn mạnh',
                desc: 'Phân phối kiến thức đến hàng chục ngàn học viên. Xây dựng thương hiệu chuyên gia uy tín trong ngành.',
                color: 'rose'
              }
            ].map((reason, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${reason.color}-50 text-${reason.color}-600`}>
                  <reason.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{reason.title}</h3>
                <p className="text-slate-600 leading-relaxed">{reason.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-slate-900 mb-8">Hành trình trở thành Giảng viên</h2>
              <div className="space-y-8">
                {[
                  {
                    step: '01',
                    title: 'Gửi hồ sơ đăng ký',
                    desc: 'Chia sẻ thông tin và chuyên môn của bạn qua biểu mẫu rút gọn của chúng tôi.'
                  },
                  {
                    step: '02',
                    title: 'Đội ngũ xét duyệt',
                    desc: 'Admin sẽ kiểm tra năng lực và cấp quyền truy cập vào Khu vực Giảng viên (Teacher Dashboard) cho tài khoản của bạn.'
                  },
                  {
                    step: '03',
                    title: 'Quay & Đăng tải khóa học',
                    desc: `Sử dụng các công cụ độc quyền của ${import.meta.env.VITE_APP_NAME || 'CoachAI'} để xây dựng bài giảng, upload video và tài liệu.`
                  },
                  {
                    step: '04',
                    title: 'Bắt đầu kiếm tiền',
                    desc: 'Quảng bá khóa học của bạn, tương tác trực tiếp với học viên và nhận doanh thu hàng tháng.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="w-12 h-12 shrink-0 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg border-4 border-white shadow-sm">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <GraduationCap size={200} />
                </div>
                <h3 className="text-2xl font-bold mb-6 relative z-10">Yêu cầu tối thiểu</h3>
                <ul className="space-y-4 relative z-10">
                  {[
                    `Đã có tài khoản Học viên trên mạng lưới ${import.meta.env.VITE_APP_NAME || 'CoachAI'}.`,
                    'Có kinh nghiệm hoặc kiến thức chuyên sâu về 1 lĩnh vực.',
                    'Đam mê chia sẻ kiến thức, kỹ năng sư phạm tốt.',
                    'Cam kết bảo mật chất lượng nội dung.',
                    'Sở hữu ít nhất 1 máy tính và micro thu âm rõ nét.'
                  ].map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                      <span className="text-slate-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-indigo-600 py-20 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Bạn đã sẵn sàng truyền lửa?</h2>
        <p className="text-indigo-100 mb-10 max-w-2xl mx-auto text-lg">
          Hàng ngàn học viên đang chờ đón những bài giảng tuyệt vời từ bạn. Hãy bắt đầu hành trình ngay hôm nay.
        </p>
        <a 
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-indigo-900/20"
        >
          {t('teach.registerBtn')}
          <ArrowRight size={20} />
        </a>
      </section>
    </div>
  );
};
