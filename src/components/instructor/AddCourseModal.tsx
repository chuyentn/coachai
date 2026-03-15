import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Save, Loader2, Image as ImageIcon, Video, Clock, List, CheckCircle2, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { googleSheetsService } from '../../services/googleSheetsService';

interface Module {
  title: string;
  video_url: string;
  duration: string;
  order: number;
}

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  instructorId: string;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose, onSuccess, instructorId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_vnd: '',
    price_usd: '',
    thumbnail_url: '',
  });

  const [modules, setModules] = useState<Module[]>([
    { title: '', video_url: '', duration: '', order: 1 }
  ]);

  const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.thumbnail_url) {
        validateImage(formData.thumbnail_url);
      } else {
        setImageStatus('idle');
        setImageError(null);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.thumbnail_url]);

  const validateImage = (url: string) => {
    setImageStatus('loading');
    setImageError(null);

    const img = new Image();
    img.onload = () => {
      setImageStatus('valid');
    };
    img.onerror = () => {
      setImageStatus('invalid');
      setImageError('URL hình ảnh không hợp lệ hoặc không thể tải.');
    };
    img.src = url;
  };

  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch (e) {
      return false;
    }
  };

  const handleAddModule = () => {
    setModules([...modules, { title: '', video_url: '', duration: '', order: modules.length + 1 }]);
  };

  const handleRemoveModule = (index: number) => {
    const newModules = modules.filter((_, i) => i !== index);
    // Re-order
    const reordered = newModules.map((m, i) => ({ ...m, order: i + 1 }));
    setModules(reordered);
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === modules.length - 1) return;

    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    
    // Update order field
    const reordered = newModules.map((m, i) => ({ ...m, order: i + 1 }));
    setModules(reordered);
  };

  const handleModuleChange = (index: number, field: keyof Module, value: string | number) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = {
        ...formData,
        price_vnd: Number(formData.price_vnd),
        price_usd: Number(formData.price_usd),
        instructor_id: instructorId,
        modules: modules
      };

      const success = await googleSheetsService.submitCourse(courseData);
      if (success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({ title: '', description: '', price_vnd: '', price_usd: '', thumbnail_url: '' });
        setModules([{ title: '', video_url: '', duration: '', order: 1 }]);
      } else {
        alert('Có lỗi xảy ra khi lưu khóa học. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Có lỗi xảy ra. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-black/5 my-8"
          >
            {/* Header */}
            <div className="p-8 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 rounded-t-[2.5rem]">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Thêm khóa học mới</h2>
                <p className="text-gray-500 mt-1">Điền thông tin chi tiết để xuất bản khóa học của bạn.</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600 font-bold uppercase tracking-widest text-xs">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <List size={16} />
                  </div>
                  Thông tin cơ bản
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Tiêu đề khóa học</label>
                    <input
                      required
                      type="text"
                      placeholder="Ví dụ: Master AI Automation 2024"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Thumbnail URL</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <ImageIcon className="text-gray-400" size={18} />
                      </div>
                      <input
                        required
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                          imageStatus === 'invalid' 
                            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                            : imageStatus === 'valid'
                            ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                            : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                        value={formData.thumbnail_url}
                        onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {imageStatus === 'loading' && <Loader2 size={18} className="animate-spin text-indigo-500" />}
                        {imageStatus === 'valid' && <CheckCircle2 size={18} className="text-emerald-500" />}
                        {imageStatus === 'invalid' && <AlertCircle size={18} className="text-red-500" />}
                      </div>
                    </div>
                    {imageError && (
                      <p className="text-xs text-red-500 font-medium ml-1 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {imageError}
                      </p>
                    )}
                    {imageStatus === 'valid' && formData.thumbnail_url && (
                      <div className="mt-3 relative group">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Xem trước ảnh</p>
                        <img 
                          src={formData.thumbnail_url} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-2xl border border-black/5 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Mô tả khóa học</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Mô tả chi tiết về nội dung và giá trị khóa học mang lại..."
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Giá bán (VND)</label>
                    <input
                      required
                      type="number"
                      placeholder="Ví dụ: 1999000"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={formData.price_vnd}
                      onChange={(e) => setFormData({ ...formData, price_vnd: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Giá bán (USD)</label>
                    <input
                      required
                      type="number"
                      placeholder="Ví dụ: 89"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={formData.price_usd}
                      onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Modules Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-emerald-600 font-bold uppercase tracking-widest text-xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Video size={16} />
                    </div>
                    Nội dung bài học (Modules)
                  </div>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="flex items-center gap-2 text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                  >
                    <Plus size={18} />
                    Thêm bài học
                  </button>
                </div>

                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={index}
                      className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bài {module.order}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveModule(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-30"
                              title="Di chuyển lên"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveModule(index, 'down')}
                              disabled={index === modules.length - 1}
                              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-30"
                              title="Di chuyển xuống"
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        </div>
                        {modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveModule(index)}
                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          required
                          type="text"
                          placeholder="Tiêu đề bài học"
                          className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                          value={module.title}
                          onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                        />
                        <div className="relative">
                          <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            required
                            type="url"
                            placeholder="Video URL (YouTube/Vimeo)"
                            className={`w-full pl-10 pr-5 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                              module.video_url && !isValidUrl(module.video_url)
                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                            }`}
                            value={module.video_url}
                            onChange={(e) => handleModuleChange(index, 'video_url', e.target.value)}
                          />
                          {module.video_url && !isValidUrl(module.video_url) && (
                            <div className="absolute -bottom-5 left-1 flex items-center gap-1 text-[10px] text-red-500 font-bold">
                              <AlertCircle size={10} />
                              URL không hợp lệ
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            required
                            type="text"
                            placeholder="Thời lượng (ví dụ: 15:30)"
                            className="w-full pl-10 pr-5 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                            value={module.duration}
                            onChange={(e) => handleModuleChange(index, 'duration', e.target.value)}
                          />
                        </div>
                        <div className="w-24">
                          <input
                            required
                            type="number"
                            placeholder="Thứ tự"
                            className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                            value={module.order}
                            onChange={(e) => handleModuleChange(index, 'order', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-8 border-t border-black/5 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={
                    loading || 
                    imageStatus === 'invalid' || 
                    imageStatus === 'loading' || 
                    modules.some(m => !m.video_url || !isValidUrl(m.video_url))
                  }
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Xuất bản khóa học
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
