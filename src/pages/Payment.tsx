import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  ArrowLeft, 
  Copy, 
  CheckCircle2, 
  CreditCard,
  Zap,
  Info 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

const Payment = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const plan = searchParams.get('plan') || 'vip';
  const amountStr = searchParams.get('amount') || '1500000';
  const transactionCode = searchParams.get('code') || `COACH${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const [paymentMethod, setPaymentMethod] = React.useState<'vietqr' | 'momo' | 'paypal'>('vietqr');
  const [success, setSuccess] = React.useState(false);
  const [paypalLoaded, setPaypalLoaded] = React.useState(false);
  const [initingMomo, setInitingMomo] = React.useState(false);

  const amountNum = parseInt(amountStr.replace(/\D/g, ''), 10) || 1500000;
  const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amountNum);
  
  const qrUrl = `https://img.vietqr.io/image/techcombank-8486568666-compact2.png?amount=${amountNum}&addInfo=${transactionCode}&accountName=Trần Ngọc Chuyền`;

  // Load PayPal Script dynamically
  React.useEffect(() => {
    if (paymentMethod === 'paypal' && !paypalLoaded) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=sb&currency=USD`; // 'sb' for sandbox
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);
    }
  }, [paymentMethod, paypalLoaded]);

  const handleMoMoPayment = async () => {
    setInitingMomo(true);
    try {
      const response = await fetch('/api/payments/momo/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountNum,
          orderInfo: `Thanh toán gói ${plan.toUpperCase()} - ${transactionCode}`,
          orderId: transactionCode,
        }),
      });
      const data = await response.json();
      if (data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        alert(t('courseDetails.paymentInitError'));
      }
    } catch (error) {
      console.error('MoMo init error:', error);
      alert(t('courseDetails.paymentInitError'));
    } finally {
      setInitingMomo(false);
    }
  };

  const renderPayPalButtons = () => {
    const paypal = (window as any).paypal;
    if (!paypal) return null;

    return (
      <div id="paypal-button-container" className="w-full">
        <div ref={(el) => {
          if (el && !el.hasChildNodes()) {
            paypal.Buttons({
              createOrder: async () => {
                const res = await fetch('/api/payments/paypal/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    amount: amountNum,
                    plan: plan,
                    transactionCode: transactionCode
                  })
                });
                const order = await res.json();
                return order.id;
              },
              onApprove: async (data: any) => {
                const res = await fetch('/api/payments/paypal/capture', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderID: data.orderID })
                });
                const details = await res.json();
                if (details.status === 'COMPLETED') {
                  setSuccess(true);
                }
              }
            }).render(el);
          }
        }} />
      </div>
    );
  };

  // Listen for payment success from Firestore
  React.useEffect(() => {
    if (!profile?.id || !transactionCode) return;

    const paymentRef = doc(db, 'payments', transactionCode);
    
    const unsubscribe = onSnapshot(paymentRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data().status === 'success') {
        setSuccess(true);
      }
    });

    return () => unsubscribe();
  }, [profile, transactionCode]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('payment.successTitle')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
            {t('payment.successDesc', { plan: plan.toUpperCase() })}
          </p>
          <button
            onClick={() => navigate('/dashboard/student')}
            className="w-full bg-black dark:bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            {t('payment.successBtn')}
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
          {t('payment.backToPricing')}
        </Link>

        {/* Payment Method Selector */}
        <div className="flex flex-wrap gap-3 mb-8 bg-white dark:bg-[#111623] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
          <button 
            onClick={() => setPaymentMethod('vietqr')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'vietqr' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            {t('payment.methodVietQR')}
          </button>
          <button 
            onClick={() => setPaymentMethod('momo')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'momo' ? 'bg-[#A50064] text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            {t('payment.methodMoMo')}
          </button>
          <button 
            onClick={() => setPaymentMethod('paypal')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'paypal' ? 'bg-[#003087] text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            {t('payment.methodPayPal')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Main Payment Section */}
          {paymentMethod === 'vietqr' && (
            <div className="bg-white dark:bg-[#111623] rounded-3xl shadow-xl shadow-black/5 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 bg-indigo-600 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <QrCode size={24} /> {t('payment.vietqrTitle')}
                </h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 relative group">
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <img 
                      src={qrUrl}
                      alt="VietQR Chuyển khoản" 
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vietnam Technological And Commercial Joint Stock Bank (VTCBVNVX)</p>
                     <div className="flex items-center justify-between">
                       <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight tabular-nums">8486 568 666</span>
                       <button onClick={() => copyToClipboard('8486568666')} className="text-slate-400 hover:text-indigo-600 transition-colors">
                         <Copy size={16} />
                       </button>
                     </div>
                  </div>

                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                     <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">{t('payment.bankContent')}</p>
                     <div className="flex items-center justify-between">
                       <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">{transactionCode || '...'}</span>
                       <button onClick={() => copyToClipboard(transactionCode)} className="text-indigo-500 hover:text-indigo-700 transition-colors p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                         <Copy size={16} />
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'momo' && (
            <div className="bg-white dark:bg-[#111623] rounded-3xl shadow-xl shadow-black/5 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 bg-[#A50064] text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard size={24} /> {t('payment.momoTitle')}
                </h2>
              </div>
              <div className="p-8 text-center space-y-8">
                <div className="w-32 h-32 mx-auto">
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="w-full h-full object-contain" />
                </div>
                <button
                  onClick={handleMoMoPayment}
                  disabled={initingMomo}
                  className="w-full py-4 bg-[#A50064] text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-[#A50064]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {initingMomo ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : t('payment.momoBtn')}
                </button>
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="bg-white dark:bg-[#111623] rounded-3xl shadow-xl shadow-black/5 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 bg-[#003087] text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard size={24} /> {t('payment.paypalTitle')}
                </h2>
              </div>
              <div className="p-8 text-center space-y-8">
                <div className="w-48 mx-auto">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="w-full h-auto object-contain" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('payment.paypalAlt')}
                </p>
                <div className="min-h-[150px] flex items-center justify-center">
                  {!paypalLoaded ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-400">{t('payment.loadingPayPal')}</span>
                    </div>
                  ) : (
                    renderPayPalButtons()
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111623] rounded-3xl shadow-xl shadow-black/5 border border-slate-200 dark:border-slate-800 p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('payment.orderSummary')}</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500 font-medium text-sm">{t('payment.orderPlan')}</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{plan === 'vip' ? 'Gói Hội Viên VIP' : plan}</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="text-slate-900 dark:text-white font-bold">{t('payment.orderTotal')}</span>
                  <span className="text-2xl font-black text-indigo-600">{formattedAmount}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 mb-8 space-y-3">
                 <div className="flex items-start gap-3">
                    <Info size={16} className="text-amber-600 mt-1 shrink-0" />
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      {paymentMethod === 'vietqr' 
                        ? t('payment.bankNoticeVietQR')
                        : paymentMethod === 'momo'
                        ? t('payment.bankNoticeMoMo')
                        : t('payment.bankNoticePayPal')}
                    </p>
                 </div>
              </div>

              <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 mt-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('payment.waitingPayment')}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl shadow-indigo-500/20">
              <Zap size={60} className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">{t('payment.supportTitle')}</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">{t('payment.supportDesc')}</p>
              <a 
                href="https://zalo.me/0904543261" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
              >
                {t('payment.supportBtn')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
