-- ==========================================
-- SIÊU FIX: XÓA SẠCH VÀ TẠO MỚI TOÀN BỘ
-- Hướng dẫn: Copy toàn bộ nội dung này và chạy 1 lần duy nhất
-- ==========================================

-- 1. DỌN DẸP HỆ THỐNG
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.course_categories CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. TẠO BẢNG USERS (KHÔNG RÀNG BUỘC CỨNG ĐỂ SEED DATA)
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TẠO BẢNG CATEGORIES
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TẠO BẢNG COURSES
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price_vnd BIGINT DEFAULT 0,
  price_usd NUMERIC DEFAULT 0,
  thumbnail_url TEXT,
  modules JSONB DEFAULT '[]'::JSONB,
  published BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  total_students INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TẠO BẢNG PHỤ TRỢ
CREATE TABLE public.course_categories (
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, category_id)
);

CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  completion_percentage INTEGER DEFAULT 0,
  progress JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 6. BẬT QUYỀN TRUY CẬP (RLS) - CHO PHÉP ĐỌC CÔNG KHAI ĐỂ HIỂN THỊ
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read courses" ON public.courses FOR SELECT USING (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);

-- 7. TRIGGER TỰ ĐỘNG TẠO USER KHI ĐĂNG KÝ THẬT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Học viên mới'),
    NEW.raw_user_meta_data->>'avatar_url',
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. ĐỔ DATA MẪU (20 KHÓA HỌC)
INSERT INTO public.categories (id, name, slug, icon) VALUES 
('10000000-0000-0000-0000-000000000001', 'Lập trình Web', 'web-development', '💻'),
('10000000-0000-0000-0000-000000000002', 'Khoa học dữ liệu', 'data-science', '📊'),
('10000000-0000-0000-0000-000000000003', 'Thiết kế UI/UX', 'ui-ux-design', '🎨'),
('10000000-0000-0000-0000-000000000005', 'AI & Machine Learning', 'ai-ml', '🤖');

INSERT INTO public.users (id, email, full_name, role, avatar_url) VALUES 
('20000000-0000-0000-0000-000000000001', 'admin@coursemarket.vn', 'Admin Hệ Thống', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
('20000000-0000-0000-0000-000000000002', 'instructor1@coursemarket.vn', 'Sơn Tùng M-TP', 'instructor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tung');

INSERT INTO public.courses (id, instructor_id, title, description, short_description, price_vnd, price_usd, thumbnail_url, published, featured, total_students, total_reviews, avg_rating, modules) VALUES 
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Fullstack Web với React & Node.js', 'Học từ Zero đến Hero. Làm chủ React 18, Next.js 14, Express và MongoDB.', 'Làm chủ Web Fullstack trong 6 tháng.', 1200000, 49, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', true, true, 1250, 450, 4.8, '[{"id": "m1", "title": "Giới thiệu", "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "order": 1}]'::JSONB),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Next.js 14 Masterclass', 'Xây dựng ứng dụng Web hiện đại với App Router.', 'Next.js 14 thực chiến.', 1500000, 65, 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800', true, true, 890, 210, 4.7, '[]'::JSONB),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'AI & Machine Learning cơ bản', 'Tìm hiểu về Neural Networks và ứng dụng AI.', 'Kỷ nguyên AI.', 2000000, 89, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', true, true, 450, 85, 4.6, '[]'::JSONB),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Thiết kế UI/UX với Figma', 'Quy trình thiết kế sản phẩm số chuyên nghiệp.', 'Figma từ cơ bản đến nâng cao.', 900000, 39, 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800', true, false, 2100, 600, 4.9, '[]'::JSONB);
-- (Có thể thêm tiếp 16 khóa khác tương tự để đủ 20)
