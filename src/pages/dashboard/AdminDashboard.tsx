import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  Zap,
  Bell,
  Search,
  ChevronRight,
  DollarSign,
  UserPlus,
  ShieldCheck,
  Activity,
  UserCheck,
  CreditCard,
  CheckCircle2,
  XCircle,
  Globe,
  Percent,
  Mail,
  Phone,
  Save,
  Lock,
  RefreshCw,
  Unlock,
  ShieldAlert,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  where,
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'approvals' | 'finance' | 'settings'>('overview');
  
  // Settings form state
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [appName, setAppName] = useState('CoachAI – Vibe Code');
  const [supportEmail, setSupportEmail] = useState('support@coachai.vn');
  const [supportPhone, setSupportPhone] = useState('0987.654.321');
  const [affiliateRate, setAffiliateRate] = useState('30');
  const [freeTrialDays, setFreeTrialDays] = useState('7');
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalStudents: 0,
    vipMembers: 0,
    revenue: 0
  });

  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [vipUsers, setVipUsers] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  
  // Finance & Payouts State
  const [payouts, setPayouts] = useState<any[]>([]);
  
  // Course Management State
  const [allCourses, setAllCourses] = useState<any[]>([]);
  
  // User Management State
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  React.useEffect(() => {
    // 1. Fetch Stats & Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(users); // Store all users for the Users tab
      const students = users.filter((u: any) => u.role === 'student');
      const vips = users.filter((u: any) => u.role === 'vip');
      
      setVipUsers(vips);
      setStats(prev => ({
        ...prev,
        totalStudents: students.length,
        vipMembers: vips.length
      }));
    });

    // 2. Fetch Leads
    const unsubLeads = onSnapshot(
      query(collection(db, 'leads'), orderBy('created_at', 'desc'), limit(5)),
      (snapshot) => {
        setRecentLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setStats(prev => ({ ...prev, totalLeads: snapshot.size })); // Simple size for now
      }
    );

    // 3. Fetch Pending Payments
    const unsubPayments = onSnapshot(
      query(collection(db, 'payments'), where('status', '==', 'pending'), orderBy('created_at', 'desc')),
      (snapshot) => {
        setPendingPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error('Error fetching pending payments:', error);
        if (error.message.includes('requires an index')) {
          console.warn('⚠️ Admin: Missing Firestore Index for payments. Click the link in console to create it.');
        }
      }
    );

    // 4. Fetch All Courses
    const unsubCourses = onSnapshot(
      query(collection(db, 'courses'), orderBy('created_at', 'desc')),
      (snapshot) => {
        setAllCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error('Error fetching courses:', error);
      }
    );

    // 5. Fetch Payout Requests
    const unsubPayouts = onSnapshot(
      query(collection(db, 'payouts'), orderBy('created_at', 'desc')),
      (snapshot) => {
        setPayouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error('Error fetching payouts:', error);
      }
    );

    setLoading(false);
    return () => {
      unsubUsers();
      unsubLeads();
      unsubPayments();
      unsubCourses();
      unsubPayouts();
    };
  }, []);

  const sidebarItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'users', label: 'Quản lý Người dùng', icon: Users },
    { id: 'courses', label: 'Quản lý Khóa học', icon: BookOpen },
    { id: 'finance', label: 'Tài chính & Giao dịch', icon: CreditCard },
    { id: 'approvals', label: 'Duyệt Giảng viên', icon: UserCheck },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
  ] as const;

  const handleApprovePayment = async (payment: any) => {
    try {
      await updateDoc(doc(db, 'payments', payment.id), {
        status: 'completed',
        approved_at: serverTimestamp(),
      });
      if (payment.plan_type === 'vip') {
        await updateDoc(doc(db, 'users', payment.user_id), {
          role: 'vip'
        });
      }
      alert('Đã phê duyệt thanh toán và nâng cấp VIP!');
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Lỗi khi phê duyệt.');
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    if (!window.confirm('Xác nhận đã chuyển khoản số tiền này cho Giảng viên?')) return;
    try {
      await updateDoc(doc(db, 'payouts', payoutId), {
        status: 'paid',
        paid_at: serverTimestamp()
      });
      alert('Đã cập nhật trạng thái đã thanh toán.');
    } catch (error) {
      console.error('Error updating payout:', error);
      alert('Lỗi cập nhật payout.');
    }
  };

  const handleSaveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleApproveTeacher = (id: string) => {
    alert(`Đã phê duyệt giảng viên ID: ${id}`);
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!window.confirm(`Xác nhận đổi role user thành ${newRole.toUpperCase()}?`)) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      alert(`Đã cập nhật role thành ${newRole.toUpperCase()}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Lỗi khi cập nhật role.');
    }
  };

  const handleToggleUserLock = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
    try {
      await updateDoc(doc(db, 'users', userId), { disabled: !currentStatus });
    } catch (error) {
      console.error('Error toggling user lock:', error);
      alert('Lỗi cập nhật trạng thái.');
    }
  };

  const filteredUsers = allUsers.filter(u => 
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleApproveCourse = async (courseId: string) => {
    if (!window.confirm('Xác nhận duyệt khóa học này? Khóa học sẽ được hiển thị công khai.')) return;
    try {
      await updateDoc(doc(db, 'courses', courseId), { status: 'published', updated_at: serverTimestamp() });
      // Notify implementation placeholder
    } catch (error) {
      console.error('Error approving course:', error);
      alert('Lỗi duyệt khóa học.');
    }
  };

  const handleRejectCourse = async (courseId: string) => {
    const reason = window.prompt('Nhập lý do từ chối (bắt buộc):');
    if (!reason) return;
    try {
      await updateDoc(doc(db, 'courses', courseId), { status: 'rejected', reject_reason: reason, updated_at: serverTimestamp() });
    } catch (error) {
       console.error('Error rejecting course:', error);
       alert('Lỗi từ chối khóa học.');
    }
  };

  const formatPrice = (p: string | number) => {
     if (typeof p === 'string') return p;
     return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p as number);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0E17] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-[#111623] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Zap size={24} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white block">CoachAI</span>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Admin Panel</span>
            </div>
          </div>

          <nav className="inline-flex p-1.5 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl gap-1 flex-col w-full">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 transform scale-100'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 scale-95'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-[#111623]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white hidden md:block">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#111623]" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.full_name}</p>
                <p className="text-xs text-rose-500 font-bold">Admin</p>
              </div>
              <img
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                alt="Avatar"
              />
            </div>
          </div>
        </header>

        <div className="p-8 md:p-10 space-y-10">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Leads – Indigo */}
                  <motion.div className="bg-white dark:bg-[#111623] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <UserPlus size={24} />
                      </div>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">Lead</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.totalLeads}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Tổng Lead (WOA)</p>
                  </motion.div>

                  {/* Students – Violet */}
                  <motion.div 
                    onClick={() => { setActiveTab('users'); setRoleFilter('student'); }}
                    className="bg-white dark:bg-[#111623] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <Users size={24} />
                      </div>
                      <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded-full">Student</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.totalStudents}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Tổng Học Viên</p>
                  </motion.div>

                  {/* VIP – Amber */}
                  {/* VIP – Amber */}
                  <motion.div className="bg-white dark:bg-[#111623] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <ShieldCheck size={24} />
                      </div>
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">VIP</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.vipMembers}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">VIP Members</p>
                  </motion.div>

                  {/* Revenue – Emerald */}
                  <motion.div className="bg-white dark:bg-[#111623] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <DollarSign size={24} />
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">Revenue</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{formatPrice(stats.revenue)}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Doanh thu (Lý thuyết)</p>
                  </motion.div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Leads */}
                  <div className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity size={20} className="text-indigo-600" /> Lead mới nhất
                      </h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {recentLeads.map((lead, i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 text-xs font-bold">
                              {lead.name?.charAt(0) || lead.email.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">{lead.name || 'Anonymous'}</p>
                              <p className="text-xs text-slate-400">{lead.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{lead.source || 'Lead Magnet'}</span>
                            <p className="text-[10px] text-slate-400 mt-1">{lead.created_at?.slice(0, 10)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* VIP Users */}
                  <div className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck size={20} className="text-violet-600" /> VIP Members
                      </h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {vipUsers.map((user, i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 text-xs font-bold">
                              {user.full_name?.charAt(0) || user.email.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">{user.full_name}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30">VIP</span>
                            <p className="text-[10px] text-slate-400 mt-1">{user.created_at?.slice(0, 10)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       Quản Lý Người Dùng
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Tra cứu, thay đổi quyền hạn và trạng thái tài khoản.</p>
                  </div>
                  <div className="flex w-full md:w-auto gap-3">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-700 dark:text-slate-300"
                    >
                      <option value="all">Tất cả role</option>
                      <option value="student">Student</option>
                      <option value="vip">VIP</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Tìm theo email hoặc tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Người dùng</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Quyền (Role)</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Trạng thái</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                             <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt="" className="w-10 h-10 rounded-xl bg-slate-100" />
                             <div>
                               <p className="font-bold text-sm text-slate-900 dark:text-white max-w-[200px] truncate">{u.full_name || 'Chưa cập nhật'}</p>
                               <p className="text-xs text-slate-500 max-w-[200px] truncate">{u.email}</p>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={u.role || 'student'}
                              onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                              className="text-xs font-bold uppercase px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              <option value="student">Student</option>
                              <option value="vip">VIP</option>
                              <option value="teacher">Teacher</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            {u.disabled ? (
                              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1 rounded-full w-fit">
                                <Lock size={12} /> Bị khóa
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full w-fit">
                                <ShieldCheck size={12} /> Hoạt động
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button 
                               onClick={() => handleToggleUserLock(u.id, u.disabled)}
                               title={u.disabled ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                               className={`p-2 rounded-lg transition-colors ${u.disabled ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                             >
                               {u.disabled ? <Unlock size={16} /> : <Lock size={16} />}
                             </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                             <div className="flex flex-col items-center justify-center">
                               <Search size={32} className="text-slate-300 mb-3" />
                               <p>Không tìm thấy người dùng nào phù hợp.</p>
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <BookOpen className="text-indigo-600" size={24} /> Quản Lý Khóa Học
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Phê duyệt hoặc từ chối các khóa học do giảng viên tải lên.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Khóa học</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Giảng viên</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Trạng thái</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {allCourses.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                               {c.thumbnail ? <img src={c.thumbnail} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-full h-full p-3 text-slate-300" />}
                            </div>
                            <div>
                               <p className="font-bold text-sm text-slate-900 dark:text-white max-w-[250px] truncate">{c.title || 'Chưa cập nhật tên'}</p>
                               <p className="text-xs text-slate-500 font-bold text-amber-500">{formatPrice(c.price || 0)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <p className="text-sm text-slate-900 dark:text-white">{c.instructor_name || 'Không rõ'}</p>
                          </td>
                          <td className="px-6 py-4">
                            {c.status === 'published' && <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 uppercase">Published</span>}
                            {c.status === 'pending' && <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/30 uppercase">Chờ duyệt</span>}
                            {c.status === 'rejected' && <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 text-rose-600 dark:bg-rose-900/30 uppercase">Đã từ chối</span>}
                            {c.status === 'draft' && <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 uppercase">Nháp</span>}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                {c.status === 'pending' && (
                                  <>
                                    <button onClick={() => handleApproveCourse(c.id)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Duyệt khóa">
                                      <CheckCircle2 size={18} />
                                    </button>
                                    <button onClick={() => handleRejectCourse(c.id)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Từ chối">
                                      <XCircle size={18} />
                                    </button>
                                  </>
                                )}
                                {c.status !== 'pending' && (
                                   <Link to={`/course/${c.id}`} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors" title="Xem trước">
                                     <ChevronRight size={18} />
                                   </Link>
                                )}
                             </div>
                          </td>
                        </tr>
                      ))}
                      {allCourses.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Chưa có khóa học nào trên hệ thống.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'approvals' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Duyệt Hồ Sơ Giảng Viên</h2>
                  <p className="text-sm text-slate-500 mt-1">Quản lý và phê duyệt các yêu cầu đăng ký mở khóa học.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Ứng viên</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Email</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Chuyên môn</th>
                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pendingTeachers.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 text-xs">{t.name.charAt(0)}</div>
                            {t.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{t.email}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">{t.expertise}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleApproveTeacher(t.id)} className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors">
                                <CheckCircle2 size={18} />
                              </button>
                              <button onClick={() => alert('Feature coming soon')} className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors">
                                <XCircle size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pendingTeachers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Không có yêu cầu chờ duyệt.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* 1. Duyệt Thanh Toán Học Viên */}
                <div className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Duyệt Thanh Toán (Học Viên)</h2>
                      <p className="text-sm text-slate-500 mt-1">Xác nhận chuyển khoản ngân hàng từ học viên để kích hoạt VP/Khóa học.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Học viên</th>
                          <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Gói</th>
                          <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Số tiền</th>
                          <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Ngày yêu cầu</th>
                          <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pendingPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900 dark:text-white">{p.user_email}</p>
                              <p className="text-[10px] text-slate-400 select-all">{p.user_id?.substring(0, 8).toUpperCase()} CV</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30">{p.plan_type}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-amber-500">{formatPrice(p.amount)}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{p.created_at?.toDate().toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleApprovePayment(p)} 
                                  className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                  title="Xác nhận đã nhận tiền"
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {pendingPayments.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Không có thanh toán nào đang chờ.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Rút tiền của Giảng Viên */}
                <div className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
                  <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lệnh Rút Tiền (Payouts)</h2>
                      <p className="text-sm text-slate-500 mt-1">Quản lý và cập nhật trạng thái thanh toán doanh thu cho Giảng viên.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Giảng viên</th>
                          <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Số tiền rút</th>
                          <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Bank / STK</th>
                          <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Trạng thái</th>
                          <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payouts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900 dark:text-white">{p.teacher_name || 'Teacher'}</p>
                              <p className="text-xs text-slate-500">{p.teacher_email}</p>
                            </td>
                            <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(p.amount)}</td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-900 dark:text-white font-medium">{p.bank_name}</p>
                              <p className="text-xs text-slate-500">{p.bank_account}</p>
                            </td>
                            <td className="px-6 py-4">
                              {p.status === 'paid' ? (
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 uppercase">Đã thanh toán</span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/30 uppercase">Chờ xử lý</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {p.status === 'pending' && (
                                  <button 
                                    onClick={() => handleApprovePayout(p.id)} 
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                                  >
                                    Mark as Paid
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {payouts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Không có lệnh rút tiền nào.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* App Config */}
                <div className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thông tin ứng dụng</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Cấu hình tên thương hiệu và thông tin liên hệ hỗ trợ.</p>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên ứng dụng</label>
                      <input
                        type="text"
                        value={appName}
                        onChange={e => setAppName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email hỗ trợ</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="email"
                          value={supportEmail}
                          onChange={e => setSupportEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hotline / Zalo</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={supportPhone}
                          onChange={e => setSupportPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Affiliate & Pricing Config */}
                <div className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Percent size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hoa hồng & Affiliate</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Thiết lập tỷ lệ chia sẻ doanh thu cho giảng viên và ambassador.</p>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hoa hồng Affiliate (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0" max="100"
                          value={affiliateRate}
                          onChange={e => setAffiliateRate(e.target.value)}
                          className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-bold text-lg"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">%</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">Mặc định: 30% trên mỗi đơn hàng</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Dùng thử miễn phí (ngày)</label>
                      <input
                        type="number"
                        min="0" max="30"
                        value={freeTrialDays}
                        onChange={e => setFreeTrialDays(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-bold text-lg"
                      />
                      <p className="text-xs text-slate-400 mt-1.5">Số ngày dùng thử cho học viên mới</p>
                    </div>
                    <div className="flex items-end">
                      <div className="w-full p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Xem trước</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{affiliateRate}%</p>
                        <p className="text-xs text-slate-500 mt-1">trên mỗi đơn thành công</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-[#111623] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bảo mật & Hệ thống</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Thao tác kỹ thuật và bảo trì hệ thống.</p>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 transition-all">
                          <RefreshCw size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Xóa Cache</p>
                          <p className="text-xs text-slate-400">Làm mới dữ liệu</p>
                        </div>
                      </button>
                      <button className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 transition-all">
                          <Users size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Xuất Danh sách User</p>
                          <p className="text-xs text-slate-400">Export CSV</p>
                        </div>
                      </button>
                      <button className="flex items-center gap-3 p-4 rounded-xl border border-rose-100 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
                          <ShieldCheck size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Kiểm tra Security Rules</p>
                          <p className="text-xs text-slate-400">Firestore Audit</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
                      settingsSaved
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5'
                    }`}
                  >
                    {settingsSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                    {settingsSaved ? 'Đã lưu!' : 'Lưu cài đặt'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
