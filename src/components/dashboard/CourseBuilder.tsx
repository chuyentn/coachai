import React, { useState } from 'react';
import { 
  Plus, 
  Video, 
  FileText, 
  Save, 
  X, 
  GripVertical, 
  HelpCircle,
  Clock,
  Settings
} from 'lucide-react';
import { motion, Reorder } from 'motion/react';

interface Module {
  id: string;
  title: string;
  video_url: string;
  duration: string;
}

export const CourseBuilder: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([
    { id: '1', title: 'Giới thiệu khóa học', video_url: 'https://youtube.com/watch?v=123', duration: '5:00' },
    { id: '2', title: 'Cài đặt môi trường', video_url: '', duration: '0:00' }
  ]);
  const [courseTitle, setCourseTitle] = useState('');
  const [price, setPrice] = useState('');
  
  const handleAddModule = () => {
    setModules([...modules, { 
      id: Math.random().toString(36).substr(2, 9), 
      title: 'Bài học mới', 
      video_url: '', 
      duration: '0:00' 
    }]);
  };

  const handleRemoveModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const handleUpdateModule = (id: string, field: keyof Module, value: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSave = () => {
    alert('Khóa học đã được lưu vào bản nháp. Chờ Admin phê duyệt để xuất bản.');
  };

  return (
    <div className="bg-white dark:bg-[#111623] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="text-indigo-600" /> Course Builder
          </h2>
          <p className="text-sm text-slate-500 mt-1">Kéo thả để sắp xếp bài giảng, cấu hình giá bán độc lập.</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <Save size={18} /> Lưu Bản Nháp
        </button>
      </div>

      {/* Basic Settings */}
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings size={18} className="text-slate-400" /> Cài đặt chung
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên khóa học</label>
            <input 
              type="text" 
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="VD: Xây dựng AI Chatbot không cần Code"
              className="w-full px-4 py-3 bg-white dark:bg-[#151A2D] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá niêm yết (VNĐ)</label>
            <input 
              type="text" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="VD: 599000 (Để trống nếu miễn phí)"
              className="w-full px-4 py-3 bg-white dark:bg-[#151A2D] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Curriculum Builder */}
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={18} className="text-slate-400" /> Giáo trình
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <HelpCircle size={14} /> Hỗ trợ dán trực tiếp YouTube URL
          </p>
        </div>

        <Reorder.Group axis="y" values={modules} onReorder={setModules} className="space-y-4">
          {modules.map((module, index) => (
            <Reorder.Item 
              key={module.id} 
              value={module}
              className="bg-white dark:bg-[#151A2D] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-4 cursor-grab active:cursor-grabbing group relative"
            >
              <div className="mt-3 text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity">
                <GripVertical size={20} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">Bài {index + 1}</span>
                  <button 
                    onClick={() => handleRemoveModule(module.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/30 p-1.5 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none text-sm font-bold text-slate-900 dark:text-white transition-colors"
                      value={module.title}
                      onChange={(e) => handleUpdateModule(module.id, 'title', e.target.value)}
                      placeholder="Tiêu đề bài học..."
                    />
                  </div>
                  <div className="md:col-span-6 relative">
                    <Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#111623] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600 dark:text-slate-300 transition-all"
                      value={module.video_url}
                      onChange={(e) => handleUpdateModule(module.id, 'video_url', e.target.value)}
                      placeholder="YouTube URL (vd: https://youtube.com/watch?v=...)"
                    />
                  </div>
                  <div className="md:col-span-2 relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#111623] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600 dark:text-slate-300 transition-all"
                      value={module.duration}
                      onChange={(e) => handleUpdateModule(module.id, 'duration', e.target.value)}
                      placeholder="15:30"
                    />
                  </div>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <button 
          onClick={handleAddModule}
          className="mt-6 w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Thêm Bài Giảng Mới
        </button>
      </div>
    </div>
  );
};
