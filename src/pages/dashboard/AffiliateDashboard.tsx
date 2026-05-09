import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  DollarSign,
  Users,
  MousePointerClick,
  Copy,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Settings,
  LayoutDashboard,
  Lock,
  Mail,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PasswordChangeForm } from '../../components/dashboard/PasswordChangeForm';

export const AffiliateDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  // Giả lập data Phase 2 MVP
  const stats = [
    { label: 'Tổng số Click', value: '1,245', icon: MousePointerClick, color: 'indigo', change: '+12%' },
    { label: 'Đăng ký mới', value: '48', icon: Users, color: 'emerald', change: '+5%' },
    { label: 'Doanh thu phát sinh', value: '24.000.000₫', icon: TrendingUp, color: 'violet', change: '+18%' },
    { label: 'Hoa hồng (50%)', value: '12.000.000₫', icon: DollarSign, color: 'amber', change: '+18%' },
  ];

  const recentReferrals = [
    { email: 'n***@gmail.com', date: '15/03/2026', status: 'Mua VIP', commission: '500.000₫' },
    { email: 't***@yahoo.com', date: '14/03/2026', status: 'Đăng ký Free', commission: '0₫' },
    { email: 'l***@outlook.com', date: '12/03/2026', status: 'Mua VIP', commission: '500.000₫' },
    { email: 'p***@agency.vn', date: '10/03/2026', status: 'Pending', commission: '-' },
  ];

  const affiliateLink = `${window.location.origin}/?ref=${profile?.id?.substring(0, 8) || 'YOUR_ID'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestPayout = () => {
    alert('Yêu cầu rút tiền đã được gửi đến Admin. Chúng tôi sẽ xử lý trong 24h làm việc.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0E17] flex flex-col">
      {/* Tab Navigation Header */}
      <div className="bg-white dark:bg-[#111623] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-8 h-full">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 h-full border-b-2 transition-all font-bold text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard size={18} />
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 h-full border-b-2 transition-all font-bold text-sm ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings size={18} />
              Cài đặt
            </button>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{profile?.full_name}</p>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Affiliate Partner</p>
            </div>
            <img
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800"
              alt="Avatar"
            />
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-10 flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Header */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-500/20">
                    <TrendingUp size={12} /> Chương trình Đối tác
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Affiliate Center</h1>
                  <p className="text-slate-500 mt-2">Chia sẻ giá trị, nhận hoa hồng 50% trọn đời cho mỗi lượt nâng cấp VIP thành công.</p>
                </div>

                {/* Link & Payout Action Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/10 border border-indigo-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10">
                      <h3 className="font-bold text-lg mb-2">Link Giới Thiệu Của Bạn</h3>
                      <p className="text-indigo-200 text-sm mb-6">Sử dụng link này để giới thiệu bạn bè. Bất kỳ ai click vào và tạo tài khoản, họ sẽ được gắn với mã ID của bạn.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between group hover:border-indigo-500/50 transition-colors">
                          <span className="font-mono text-emerald-400 text-sm truncate select-all">{affiliateLink}</span>
                        </div>
                        <button 
                          onClick={copyToClipboard}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-indigo-500/20"
                        >
                          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                          {copied ? 'Đã copy!' : 'Sao chép Link'}
                        </button>
                      </div>

                      <div className="flex items-center gap-6 mt-8 p-4 bg-white/5 rounded-xl border border-white/5 w-fit">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">1</div>
                          <span className="text-sm font-medium text-slate-300">Copy Link</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-500" />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">2</div>
                          <span className="text-sm font-medium text-slate-300">Bạn bè Đăng ký VIP</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-500" />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">3</div>
                          <span className="text-sm font-medium text-slate-300">Nhận 50% Hoa hồng</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#111623] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Số dư khả dụng</p>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight text-amber-500 dark:text-amber-400">
                        {(profile?.affiliate_balance || 1500000).toLocaleString('vi-VN')}₫
                      </h2>
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> Tối thiểu rút: 500.000₫
                      </p>
                    </div>
                    
                    <button 
                      onClick={handleRequestPayout}
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                      Yêu cầu Rút tiền <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white dark:bg-[#111623] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/30 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400`}>
                          <stat.icon size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">{stat.change}</span>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white dark:bg-[#111623] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lịch sử giới thiệu</h2>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      Xem tất cả <ExternalLink size={14} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold text-xs uppercase tracking-widest">
                          <th className="px-6 md:px-8 py-4">Tài khoản giới thiệu</th>
                          <th className="px-6 md:px-8 py-4">Ngày</th>
                          <th className="px-6 md:px-8 py-4">Trạng thái</th>
                          <th className="px-6 md:px-8 py-4 text-right">Hoa hồng nhận</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                        {recentReferrals.map((ref, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 md:px-8 py-5 font-bold text-slate-900 dark:text-white">{ref.email}</td>
                            <td className="px-6 md:px-8 py-5 text-slate-500">{ref.date}</td>
                            <td className="px-6 md:px-8 py-5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                ref.status === 'Mua VIP' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                ref.status === 'Đăng ký Free' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                                {ref.status === 'Mua VIP' && <CheckCircle2 size={12} />}
                                {ref.status}
                              </span>
                            </td>
                            <td className="px-6 md:px-8 py-5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              {ref.commission}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {recentReferrals.length === 0 && (
                      <div className="p-12 text-center text-slate-500">
                        Chưa có lượt giới thiệu nào. Bắt đầu chia sẻ link của bạn ngay!
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="bg-white dark:bg-[#111623] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                      <User size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Thông tin cá nhân</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <img
                        src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`}
                        alt="Avatar"
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.full_name}</p>
                        <p className="text-xs text-slate-500">{profile?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Họ & Tên</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="text"
                            readOnly
                            value={profile?.full_name || ''}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Email liên hệ</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="email"
                            readOnly
                            value={profile?.email || ''}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111623] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600">
                      <Lock size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bảo mật tài khoản</h2>
                  </div>
                  <PasswordChangeForm />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
