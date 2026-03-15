-- ==========================================
-- COURSEMARKET VN - SEED DATA (FULL 20 COURSES)
-- ==========================================

-- 1. SEED: categories
INSERT INTO public.categories (id, name, slug, icon) VALUES 
('10000000-0000-0000-0000-000000000001', 'Lập trình Web', 'web-development', '💻'),
('10000000-0000-0000-0000-000000000002', 'Khoa học dữ liệu', 'data-science', '📊'),
('10000000-0000-0000-0000-000000000003', 'Thiết kế UI/UX', 'ui-ux-design', '🎨'),
('10000000-0000-0000-0000-000000000004', 'Marketing số', 'digital-marketing', '📈'),
('10000000-0000-0000-0000-000000000005', 'AI & Machine Learning', 'ai-ml', '🤖'),
('10000000-0000-0000-0000-000000000006', 'Mobile Development', 'mobile-dev', '📱')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED: users (Instructors)
INSERT INTO public.users (id, email, full_name, role, avatar_url) VALUES 
('20000000-0000-0000-0000-000000000001', 'admin@coursemarket.vn', 'Admin Hệ Thống', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
('20000000-0000-0000-0000-000000000002', 'instructor1@coursemarket.vn', 'Sơn Tùng M-TP (Web Dev)', 'instructor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tung'),
('20000000-0000-0000-0000-000000000003', 'instructor2@coursemarket.vn', 'Hà Anh Tuấn (Data Expert)', 'instructor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tuan'),
('20000000-0000-0000-0000-000000000004', 'instructor3@coursemarket.vn', 'Đen Vâu (AI Specialist)', 'instructor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=den'),
('20000000-0000-0000-0000-000000000005', 'instructor4@coursemarket.vn', 'Suboi (UI/UX Designer)', 'instructor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=suboi')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED: courses (20 Courses)
INSERT INTO public.courses (id, instructor_id, title, description, short_description, price_vnd, price_usd, thumbnail_url, published, featured, total_students, total_reviews, avg_rating, modules) VALUES 
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Fullstack Web với React & Node.js', 'Học từ Zero đến Hero. Làm chủ React 18, Next.js 14, Express và MongoDB.', 'Làm chủ Web Fullstack trong 6 tháng.', 1200000, 49, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', true, true, 1250, 450, 4.8, '[{"id": "m1", "title": "Giới thiệu & Cài đặt", "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "order": 1}, {"id": "m2", "title": "React Hooks căn bản", "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "order": 2}]'::JSONB),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Data Science Masterclass 2024', 'Học Python, Pandas, Scikit-learn và trực quan hóa dữ liệu chuyên nghiệp.', 'Trở thành chuyên gia dữ liệu.', 1500000, 65, 'https://images.unsplash.com/photo-1551288049-bbdac8626ad1?w=800', true, true, 890, 210, 4.7, '[]'::JSONB),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 'Thiết kế UI/UX với Figma', 'Quy trình thiết kế sản phẩm số hiện đại. Từ wireframe đến prototype.', 'Thiết kế App/Web chuyên nghiệp.', 900000, 39, 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800', true, false, 2100, 600, 4.9, '[]'::JSONB),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'AI & Machine Learning cơ bản', 'Tìm hiểu về Neural Networks, CNN, RNN và ứng dụng AI vào thực tế.', 'Kỷ nguyên trí tuệ nhân tạo.', 2000000, 89, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', true, true, 450, 85, 4.6, '[]'::JSONB),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'Next.js 14: The Complete Guide', 'Học App Router, Server Components và Server Actions mới nhất.', 'Xây dựng Web App siêu tốc.', 1100000, 45, 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800', true, false, 720, 180, 4.7, '[]'::JSONB),
('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', 'Prompt Engineering cho ChatGPT', 'Kỹ thuật đặt câu hỏi để tối ưu hóa kết quả từ AI.', 'Làm chủ kỹ năng của tương lai.', 500000, 20, 'https://images.unsplash.com/photo-1676299081847-824916de030a?w=800', true, true, 5000, 1200, 4.9, '[]'::JSONB),
('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', 'Lập trình Mobile với Flutter', 'Xây dựng ứng dụng iOS & Android từ một codebase duy nhất.', 'Build App đa nền tảng.', 1400000, 59, 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', true, false, 640, 140, 4.6, '[]'::JSONB),
('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'SQL & Database Design', 'Thiết kế cơ sở dữ liệu tối ưu và truy vấn SQL nâng cao.', 'Nền tảng cho mọi ứng dụng.', 800000, 35, 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800', true, false, 1100, 290, 4.5, '[]'::JSONB),
('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000002', 'TypeScript Masterclass', 'Học TypeScript từ cơ bản đến nâng cao cho dự án thực tế.', 'Viết code sạch và an toàn hơn.', 700000, 30, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800', true, false, 950, 220, 4.8, '[]'::JSONB),
('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000004', 'Deep Learning với PyTorch', 'Xây dựng mô hình nhận diện hình ảnh và xử lý ngôn ngữ tự nhiên.', 'Chinh phục trí tuệ nhân tạo.', 2500000, 110, 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800', true, true, 310, 65, 4.4, '[]'::JSONB),
('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000005', 'Graphic Design với Photoshop & AI', 'Kết hợp công cụ truyền thống và AI để tạo ra thiết kế đột phá.', 'Sáng tạo không giới hạn.', 850000, 37, 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800', true, false, 1400, 380, 4.7, '[]'::JSONB),
('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002', 'Lập trình Backend với Go (Golang)', 'Xây dựng hệ thống microservices hiệu năng cao với Go.', 'Backend cho hệ thống lớn.', 1600000, 69, 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800', true, false, 420, 95, 4.6, '[]'::JSONB),
('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000003', 'Big Data với Apache Spark', 'Xử lý dữ liệu quy mô lớn trên nền tảng đám mây.', 'Kỹ sư dữ liệu thực thụ.', 2200000, 95, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?w=800', true, false, 280, 45, 4.5, '[]'::JSONB),
('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000002', 'Docker & Kubernetes Thực Chiến', 'Triển khai và quản lý ứng dụng container chuyên nghiệp.', 'Làm chủ DevOps.', 1800000, 79, 'https://images.unsplash.com/photo-1605745341112-85968b193ef5?w=800', true, true, 560, 130, 4.7, '[]'::JSONB),
('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000004', 'Xây dựng Chatbot với LangChain', 'Tích hợp LLMs vào ứng dụng của bạn một cách thông minh.', 'Ứng dụng AI thực tế.', 1300000, 55, 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?w=800', true, true, 890, 210, 4.8, '[]'::JSONB),
('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000005', 'Motion Graphics với After Effects', 'Tạo chuyển động đồ họa ấn tượng cho video marketing.', 'Phù thủy chuyển động.', 1000000, 42, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', true, false, 750, 160, 4.6, '[]'::JSONB),
('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000002', 'Blockchain & Solidity 101', 'Lập trình Smart Contract trên mạng lưới Ethereum.', 'Đón đầu công nghệ Web3.', 2100000, 90, 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800', true, false, 380, 75, 4.3, '[]'::JSONB),
('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000003', 'Phân tích dữ liệu với Power BI', 'Biến dữ liệu thô thành những báo cáo trực quan sinh động.', 'Kỹ năng vàng cho dân văn phòng.', 950000, 40, 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800', true, false, 1800, 520, 4.8, '[]'::JSONB),
('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000002', 'Lập trình iOS với Swift & SwiftUI', 'Xây dựng ứng dụng iPhone/iPad mượt mà và hiện đại.', 'Chinh phục hệ sinh thái Apple.', 1500000, 65, 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800', true, false, 490, 110, 4.7, '[]'::JSONB),
('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000004', 'Computer Vision với OpenCV', 'Xử lý hình ảnh và nhận diện vật thể bằng camera.', 'Mắt thần cho máy tính.', 1900000, 82, 'https://images.unsplash.com/photo-1527430253228-e93688616381?w=800', true, false, 320, 55, 4.5, '[]'::JSONB)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED: course_categories (Mapping)
INSERT INTO public.course_categories (course_id, category_id) VALUES 
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005'),
('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005'),
('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006'),
('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005'),
('30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005'),
('30000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000006'),
('30000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;
