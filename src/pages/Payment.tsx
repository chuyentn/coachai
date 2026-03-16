import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  Copy, 
  Download, 
  Zap,
  Info,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import SePay QR Codes
import sepayFlexible from '../assets/qrcodes/sepay_flexible.png';
import sepay100k from '../assets/qrcodes/sepay_100k.png';
import sepay1m from '../assets/qrcodes/sepay_1m.png';

export const Payment: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState<string>('');

  const plan = searchParams.get('plan') || 'vip';
  const courseId = searchParams.get('courseId');
  const amountStr = searchParams.get('amount') || (plan === 'vip' ? '1500000' : '0');
  const amountNum = parseInt(amountStr.replace(/\D/g, ''), 10) || 1500000;
  const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountNum);

  // Initialize payment record on mount
  React.useEffect(() => {
    if (!profile) return;
    let paymentDocId = '';
    
    // Auto-generate transaction code: EV + short user ID + random 4 digits
    const code = `EV${profile.id.substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    setTransactionCode(code);

    const initPayment = async () => {
      try {
        const docRef = await addDoc(collection(db, 'payments'), {
          user_id: profile.id,
          user_email: profile.email,
          amount: amountNum,
          plan_type: plan,
          course_id: courseId || null,
          transaction_code: code,
          status: 'pending',
          payment_method: 'vietqr',
          created_at: serverTimestamp(),
        });
        paymentDocId = docRef.id;
        setPaymentId(docRef.id);
        setLoading(false);
      } catch (error) {
        console.error('Error creating payment record:', error);
      }
    };

    initPayment();

    return () => {
      // Cleanup if needed
    };
  }, [profile, plan, courseId, amountNum]);

  // Real-time listener for the payment document
  React.useEffect(() => {
    if (!paymentId) return;
    
    const unsubscribe = onSnapshot(doc(db, 'payments', paymentId), (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.status === 'completed') {
        setSuccess(true);
      }
    });

    return () => unsubscribe();
  }, [paymentId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple toast or alert could go here
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#0B0E17] p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-[#111623] rounded-3xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-800"
        >
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Đã gửi yêu cầu!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
            Hệ thống đã nhận được thanh toán. Gói <b>{plan.toUpperCase()}</b> của bạn đã được kích hoạt thành công!
          </p>
          <button
            onClick={() => navigate('/dashboard/student')}
            className="w-full bg-black dark:bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            Về Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0B0E17] pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 font-medium">
          <ArrowLeft size={18} />
          Quay lại bảng giá
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Bank Info */}
          <div className="bg-white dark:bg-[#111623] rounded-3xl shadow-xl shadow-black/5 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 bg-indigo-600 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <QrCode size={24} /> Chuyển khoản qua QR
              </h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 relative group">
                {/* SePay QR images */}
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <img 
                    src={
                      amountNum === 100000 ? sepay100k :
                      amountNum === 1000000 ? sepay1m :
                      sepayFlexible
                    }
                    alt="SePay QR" 
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                   <a 
                     href={
                       amountNum === 100000 ? sepay100k :
                       amountNum === 1000000 ? sepay1m :
                       sepayFlexible
                     }
                     download={`SePay_QR_${amountNum}.png`}
                     className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 pointer-events-auto hover:bg-slate-50"
                   >
                     <Download size={14} /> Lưu mã QR
                   </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chủ tài khoản</p>
                   <div className="flex items-center justify-between">
                     <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">TRAN NGOC CHUYEN</span>
                     <button onClick={() => copyToClipboard('TRAN NGOC CHUYEN')} className="text-slate-400 hover:text-indigo-600 transition-colors">
                       <Copy size={16} />
                     </button>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số tài khoản (BIDV)</p>
                   <div className="flex items-center justify-between">
                     <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight tabular-nums">6700 067 179</span>
                     <button onClick={() => copyToClipboard('6700067179')} className="text-slate-400 hover:text-indigo-600 transition-colors">
                       <Copy size={16} />
                     </button>
                   </div>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                   <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Mã giao dịch (Bắt buộc ghi)</p>
                   <div className="flex items-center justify-between">
                     <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">{transactionCode || 'Đang tạo...'}</span>
                     <button onClick={() => copyToClipboard(transactionCode)} className="text-indigo-500 hover:text-indigo-700 transition-colors p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                       <Copy size={16} />
                     </button>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111623] rounded-3xl shadow-xl shadow-black/5 border border-slate-200 dark:border-slate-800 p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Chi tiết đơn hàng</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500 font-medium text-sm">Gói đăng ký</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{plan === 'vip' ? 'VIP Member 1 Year' : plan}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500 font-medium text-sm">Người dùng</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{profile?.full_name}</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="text-slate-900 dark:text-white font-bold">Tổng cộng</span>
                  <span className="text-2xl font-black text-indigo-600">{formattedAmount}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 mb-8 space-y-3">
                 <div className="flex items-start gap-3">
                    <Info size={16} className="text-amber-600 mt-1 shrink-0" />
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      Vui lòng chuyển <b>đúng số tiền</b> và <b>đúng nội dung</b> ghi bên trái để hệ thống tự động xác nhận nhanh nhất.
                    </p>
                 </div>
              </div>

              <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 mt-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Đang chờ thanh toán... Hệ thống tự duyệt 24/7</span>
                </div>
              </div>
              
              <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={12} /> Giao dịch bảo mật qua SSL
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl shadow-indigo-500/20">
              <Zap size={60} className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">Bạn cần hỗ trợ nhanh?</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Nếu gặp khó khăn khi thanh toán, hãy nhắn tin trực tiếp cho Admin Victor Chuyen qua Zalo.</p>
              <a 
                href="https://zalo.me/0904543261" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
              >
                Chat Zalo Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
